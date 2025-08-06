import React, { useRef, useState, useEffect, useCallback } from "react";
import type { TransformationState } from "../../../types/types";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  PDFDocumentLoadingTask,
} from "pdfjs-dist";

import { RenderParameters } from "pdfjs-dist/types/src/display/api";

export interface ImagePaneProps {
  pdfSrc: string; // Keep name for now, but it handles images too
  transformation: TransformationState;
  onTransformationChange: (newTransformation: TransformationState) => void;
  imageWrapperRef: React.RefObject<HTMLDivElement | null>;
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
  const isPdf = pdfSrc.toLowerCase().endsWith(".pdf");
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialTransform = useRef({ offsetX: 0, offsetY: 0 });
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfjsRef = useRef<PdfJs | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPdf && typeof window !== "undefined" && !pdfjsRef.current) {
      import("pdfjs-dist")
        .then((module) => {
          pdfjsRef.current = module;
          pdfjsRef.current.GlobalWorkerOptions.workerSrc = `/src/client/pdfjs-build/pdf.worker.min.mjs`;
          setPdfjsLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load pdfjs-dist:", err);
          setPdfError("Failed to initialize PDF viewer.");
        });
    }
  }, [isPdf]);

  useEffect(() => {
    const currentPdfDoc = pdfDoc;
    const cleanup = () => {
      if (currentPdfDoc) {
        currentPdfDoc.destroy();
      }
    };

    if (!isPdf || !pdfSrc || !pdfjsLoaded) {
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
  }, [pdfSrc, onTransformationChange, pdfjsLoaded, isPdf]);

  const renderPage = useCallback(
    async (page: PDFPageProxy, canvas: HTMLCanvasElement) => {
      const renderScale = 2.0;
      const viewport = page.getViewport({ scale: renderScale });
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      const renderContext: RenderParameters = {
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
    pagesContainer.innerHTML = "";
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

  const handleMouseUp = () => setIsDragging(false);

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

  if (!pdfSrc) {
    return (
      <div className="grow flex items-center justify-center text-gray-500">
        No source file provided for this record.
      </div>
    );
  }

  // --- Main Rendering Logic ---

  const renderContent = () => {
    if (isPdf) {
      if (loadingPdf)
        return <div className="text-gray-600">Loading PDF...</div>;
      if (pdfError)
        return <div className="text-red-500">Error: {pdfError}</div>;
      // PDF canvases will be appended here by useEffect
      return <div ref={imageWrapperRef} className="pages-container"></div>;
    } else {
      // It's an image
      return (
        <img
          src={pdfSrc}
          alt="Source Document"
          className="max-w-full max-h-full object-contain"
        />
      );
    }
  };

  return (
    <div
      ref={viewportRef}
      className={`grow overflow-hidden relative ${isDragging ? "grabbing" : "grab"} flex items-center justify-center`}
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
          padding: "20px",
          boxSizing: "content-box",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default ImagePane;
