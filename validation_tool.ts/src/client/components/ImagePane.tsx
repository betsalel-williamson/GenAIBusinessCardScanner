import React, { useRef, useState, useEffect, useCallback } from "react";
import type { TransformationState } from "../../../types/types";
// Do NOT import pdfjs-dist directly here to prevent it from running on the server during SSR.
// It will be dynamically imported inside useEffect.

// Define types for pdfjs-dist dynamically
interface PdfJsGlobalWorkerOptions {
  workerSrc: string;
}

interface PdfJs {
  GlobalWorkerOptions: PdfJsGlobalWorkerOptions;
  getDocument: (src: string) => { promise: Promise<any> };
  version: string;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  destroy: () => void;
}

interface PDFPageProxy {
  getViewport: (options: { scale: number }) => any;
  render: (context: any) => { promise: Promise<void> };
}

export interface ImagePaneProps {
  pdfSrc: string;
  transformation: TransformationState;
  onTransformationChange: (newTransformation: TransformationState) => void;
  imageWrapperRef: React.RefObject<HTMLDivElement>; // This is the container for *pages*, inside the transformed div
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
  const pdfjsRef = useRef<PdfJs | null>(null); // Ref to hold the dynamically imported pdfjs object

  const viewportRef = useRef<HTMLDivElement>(null); // Ref for the main viewport div

  // Dynamically import pdfjs-dist on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined" && !pdfjsRef.current) {
      import("pdfjs-dist")
        .then((module) => {
          pdfjsRef.current = module;
          // Set the worker source to the symlinked path in src/client
          pdfjsRef.current.GlobalWorkerOptions.workerSrc = `/src/client/pdfjs-build/pdf.worker.min.mjs`;
        })
        .catch((err) => {
          console.error("Failed to load pdfjs-dist:", err);
          setPdfError("Failed to initialize PDF viewer.");
        });
    }
  }, []);

  // Load PDF document and calculate initial zoom
  useEffect(() => {
    if (!pdfSrc || !pdfjsRef.current) {
      setPdfDoc(null);
      setPdfError(null);
      return;
    }

    setLoadingPdf(true);
    setPdfError(null);

    const loadingTask = pdfjsRef.current.getDocument(pdfSrc);
    loadingTask.promise.then(
      async (pdf) => {
        setPdfDoc(pdf);
        setLoadingPdf(false);

        // --- Auto-zoom to fit width ---
        if (viewportRef.current && pdf.numPages > 0) {
          const paddingHorizontal = 40; // Corresponds to the 20px padding on left/right in css
          const availableWidth =
            viewportRef.current.clientWidth - paddingHorizontal;

          const firstPage = await pdf.getPage(1);
          const pageViewport = firstPage.getViewport({ scale: 1.0 }); // Get natural size at 1x
          const pageNaturalWidth = pageViewport.width;

          const fitToWidthScale = availableWidth / pageNaturalWidth;
          // Apply this new scale and reset offsets
          onTransformationChange({
            offsetX: 0,
            offsetY: 0,
            scale: fitToWidthScale,
          });
        } else {
          // If no viewport or pages, just reset
          onTransformationChange({ offsetX: 0, offsetY: 0, scale: 1.0 });
        }
        // --- End auto-zoom ---
      },
      (reason) => {
        console.error("Error loading PDF:", reason);
        setPdfError(`Failed to load PDF: ${reason.message || reason}`);
        setLoadingPdf(false);
      },
    );

    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfSrc, onTransformationChange, pdfjsRef.current]);

  // Render PDF pages to canvases
  const renderPage = useCallback(
    async (page: PDFPageProxy, canvas: HTMLCanvasElement) => {
      const renderScale = 2.0; // Render at 2x resolution for sharpness
      const viewport = page.getViewport({ scale: renderScale });
      const context = canvas.getContext("2d");
      if (!context) return;

      // Set canvas internal dimensions to the higher resolution
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Set canvas display dimensions to fill 100% of its parent's width,
      // and let height adjust proportionally.
      // The actual zoom will be handled by the outer `transformation.scale`.
      canvas.style.width = "100%";
      canvas.style.height = "auto"; // Maintain aspect ratio

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      try {
        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => window.removeEventListener("mouseup", handleMouseUpGlobal);
  }, []);

  // Handle zoom/pan with mouse wheel - now handled by native event listener
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Changed type to native WheelEvent
      e.preventDefault(); // Prevent default browser scroll/zoom
      const currentScale = transformation.scale;
      let newScale = currentScale;
      let newOffsetX = transformation.offsetX;
      let newOffsetY = transformation.offsetY;

      if (e.ctrlKey) {
        // Interpret Ctrl + Scroll as Zoom (like many trackpads)
        const scaleAmount = 0.1;
        if (e.deltaY < 0) {
          // Zoom in
          newScale += scaleAmount;
        } else {
          // Zoom out
          newScale -= scaleAmount;
        }
        newScale = Math.max(0.1, Math.min(5.0, newScale)); // Clamp scale

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
        // Regular scroll for Panning
        // Scale delta by 1/currentScale to make panning feel consistent at different zoom levels
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
  ); // Added dependencies

  // Attach native wheel event listener with passive: false
  useEffect(() => {
    const viewportDiv = viewportRef.current;
    if (viewportDiv) {
      // Add event listener with passive: false for Safari compatibility
      viewportDiv.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        viewportDiv.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]); // Depend on handleWheel to re-attach if it changes

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
      ref={viewportRef} // Assign ref to the main viewport div
      className={`flex-grow overflow-hidden relative ${isDragging ? "grabbing" : "grab"}`} // Cursor on viewport
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div // This is the TRANSFORMED CONTENT CONTAINER
        className="pdf-transformed-content"
        style={{
          transform: `translate(${transformation.offsetX}px, ${transformation.offsetY}px) scale(${transformation.scale})`,
          transformOrigin: "0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "100%",
          minHeight: "100%",
          padding: "20px", // Apply padding here for spacing around the pages
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
