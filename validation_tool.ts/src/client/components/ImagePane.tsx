import React, { useRef, useState, useEffect, useCallback } from "react";
import type { TransformationState } from "../../../types/types";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  PDFDocumentLoadingTask,
} from "pdfjs-dist";
// Do NOT import pdfjs-dist directly here to prevent it from running on the server during SSR.
// It will be dynamically imported inside useEffect.

export interface ImagePaneProps {
  pdfSrc: string;
  transformation: TransformationState;
  onTransformationChange: (newTransformation: TransformationState) => void;
  imageWrapperRef: React.RefObject<HTMLDivElement>; // This is the container for *pages*, inside the transformed div
}

interface PdfJs {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (src: string) => PDFDocumentLoadingTask;
  version: string;
}

const ImagePane: React.FC<ImagePaneProps> = ({
  pdfSrc,
  transformation,
  onTransformationChange,
  imageWrapperRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialTransform = useRef({ offsetX: 0, offsetY: 0 });
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfjsRef = useRef<PdfJs | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false); // State to track if PDF.js is loaded

  const viewportRef = useRef<HTMLDivElement>(null);

  // Dynamically import pdfjs-dist on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined" && !pdfjsRef.current) {
      import("pdfjs-dist")
        .then((module) => {
          pdfjsRef.current = module;
          pdfjsRef.current.GlobalWorkerOptions.workerSrc = `/src/client/pdfjs-build/pdf.worker.min.mjs`;
          setPdfjsLoaded(true); // Signal that PDF.js is ready
        })
        .catch((err) => {
          console.error("Failed to load pdfjs-dist:", err);
          setPdfError("Failed to initialize PDF viewer.");
        });
    }
  }, []);

  // Load PDF document and calculate initial zoom
  useEffect(() => {
    // This cleanup function is designed to run for the *previous* `pdfDoc`
    // instance when `pdfSrc` changes. It correctly uses a stale closure.
    const currentPdfDoc = pdfDoc;
    const cleanup = () => {
      if (currentPdfDoc) {
        currentPdfDoc.destroy();
      }
    };

    if (!pdfSrc || !pdfjsLoaded) {
      setPdfDoc(null);
      setPdfError(null);
      return cleanup;
    }

    const pdfjs = pdfjsRef.current;
    if (!pdfjs) return cleanup;

    setLoadingPdf(true);
    setPdfError(null);

    const loadingTask = pdfjs.getDocument(pdfSrc);
    loadingTask.promise.then(
      async (pdf) => {
        setPdfDoc(pdf);
        setLoadingPdf(false);

        // Auto-zoom to fit width
        if (viewportRef.current && pdf.numPages > 0) {
          const paddingHorizontal = 40;
          const availableWidth =
            viewportRef.current.clientWidth - paddingHorizontal;

          const firstPage = await pdf.getPage(1);
          const pageViewport = firstPage.getViewport({ scale: 1.0 });
          const pageNaturalWidth = pageViewport.width;

          const fitToWidthScale = availableWidth / pageNaturalWidth;
          onTransformationChange({
            offsetX: 0,
            offsetY: 0,
            scale: fitToWidthScale,
          });
        } else {
          onTransformationChange({ offsetX: 0, offsetY: 0, scale: 1.0 });
        }
      },
      (reason) => {
        console.error("Error loading PDF:", reason);
        setPdfError(`Failed to load PDF: ${reason.message || reason}`);
        setLoadingPdf(false);
      },
    );

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfSrc, onTransformationChange, pdfjsLoaded]);

  // Render PDF pages to canvases
  const renderPage = useCallback(
    async (page: PDFPageProxy, canvas: HTMLCanvasElement) => {
      const renderScale = 2.0; // Render at 2x resolution for sharpness
      const viewport = page.getViewport({ scale: renderScale });
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      canvas.style.width = "100%";
      canvas.style.height = "auto";

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      try {
        await page.render(renderContext).promise;
      } catch (error) {
        if ((error as Error).name !== "RenderingCancelledException") {
          console.error("Error rendering page:", error);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!pdfDoc || !imageWrapperRef.current) return;

    const pagesContainer = imageWrapperRef.current;
    pagesContainer.innerHTML = ""; // Clear previous pages

    const renderAllPages = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const canvas = document.createElement("canvas");
        canvas.className =
          "pdf-page-canvas mb-2 border border-gray-300 shadow-sm";
        pagesContainer.appendChild(canvas);
        await renderPage(page, canvas);
      }
    };

    renderAllPages();
  }, [pdfDoc, renderPage, imageWrapperRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialTransform.current = {
      offsetX: transformation.offsetX,
      offsetY: transformation.offsetY,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    onTransformationChange({
      ...transformation,
      offsetX: initialTransform.current.offsetX + dx,
      offsetY: initialTransform.current.offsetY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => window.removeEventListener("mouseup", handleMouseUpGlobal);
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const currentScale = transformation.scale;
      let newScale = currentScale;
      let newOffsetX = transformation.offsetX;
      let newOffsetY = transformation.offsetY;

      if (e.ctrlKey) {
        const scaleAmount = 0.1;
        newScale =
          e.deltaY < 0
            ? currentScale + scaleAmount
            : currentScale - scaleAmount;
        newScale = Math.max(0.1, Math.min(5.0, newScale));

        const viewportDiv = viewportRef.current;
        if (!viewportDiv) return;

        const rect = viewportDiv.getBoundingClientRect();
        const mouseXInViewport = e.clientX - rect.left;
        const mouseYInViewport = e.clientY - rect.top;

        const mouseXInContent =
          (mouseXInViewport - transformation.offsetX) / currentScale;
        const mouseYInContent =
          (mouseYInViewport - transformation.offsetY) / currentScale;

        newOffsetX = mouseXInViewport - mouseXInContent * newScale;
        newOffsetY = mouseYInViewport - mouseYInContent * newScale;
      } else {
        const panSpeed = 1 / currentScale;
        newOffsetX = transformation.offsetX - e.deltaX * panSpeed;
        newOffsetY = transformation.offsetY - e.deltaY * panSpeed;
      }

      onTransformationChange({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    },
    [transformation, onTransformationChange],
  );

  useEffect(() => {
    const viewportDiv = viewportRef.current;
    if (viewportDiv) {
      viewportDiv.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        viewportDiv.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  if (loadingPdf) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-600">
        Loading PDF...
      </div>
    );
  }

  if (pdfError) {
    return (
      <div className="flex-grow flex items-center justify-center text-red-500">
        Error: {pdfError}
      </div>
    );
  }

  if (!pdfSrc) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-500">
        No PDF source provided for this record.
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={`flex-grow overflow-hidden relative ${isDragging ? "grabbing" : "grab"}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="pdf-transformed-content"
        style={{
          transform: `translate(${transformation.offsetX}px, ${transformation.offsetY}px) scale(${transformation.scale})`,
          transformOrigin: "0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "100%",
          minHeight: "100%",
          padding: "20px",
          boxSizing: "content-box",
          backgroundColor: "#fff",
        }}
      >
        <div ref={imageWrapperRef} className="pages-container">
          {/* Canvases will be appended here by useEffect */}
        </div>
      </div>
    </div>
  );
};

export default ImagePane;
