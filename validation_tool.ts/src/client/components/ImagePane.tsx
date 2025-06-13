import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { TransformationState } from '../../../types/types';
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


interface ImagePaneProps {
  pdfSrc: string;
  transformation: TransformationState;
  onTransformationChange: (newTransformation: TransformationState) => void;
  imageWrapperRef: React.RefObject<HTMLDivElement>; // This will now be the container for *pages*, inside the transformed div
}

const ImagePane: React.FC<ImagePaneProps> = ({ pdfSrc, transformation, onTransformationChange, imageWrapperRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialTransform = useRef({ offsetX: 0, offsetY: 0 });
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfjsRef = useRef<PdfJs | null>(null); // Ref to hold the dynamically imported pdfjs object

  // NEW ref for the TRANSFORMED content container
  const transformedContentRef = useRef<HTMLDivElement>(null);

  // Dynamically import pdfjs-dist on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !pdfjsRef.current) {
      import('pdfjs-dist').then((module) => {
        pdfjsRef.current = module;
        // Set the worker source to the symlinked path in src/client
        // Vite will resolve this path correctly for modules within src
        pdfjsRef.current.GlobalWorkerOptions.workerSrc = `/src/client/pdfjs-build/pdf.worker.min.mjs`;
      }).catch(err => {
        console.error("Failed to load pdfjs-dist:", err);
        setPdfError("Failed to initialize PDF viewer.");
      });
    }
  }, []);


  // Load PDF document
  useEffect(() => {
    if (!pdfSrc || !pdfjsRef.current) { // Ensure pdfjs is loaded before attempting to get document
      setPdfDoc(null);
      setPdfError(null);
      return;
    }

    setLoadingPdf(true);
    setPdfError(null);

    const loadingTask = pdfjsRef.current.getDocument(pdfSrc);
    loadingTask.promise.then(
      (pdf) => {
        setPdfDoc(pdf);
        setLoadingPdf(false);
        // Reset transformation when a new PDF is loaded
        onTransformationChange({ offsetX: 0, offsetY: 0, scale: 1.0 });
      },
      (reason) => {
        console.error('Error loading PDF:', reason);
        setPdfError(`Failed to load PDF: ${reason.message || reason}`);
        setLoadingPdf(false);
      }
    );

    return () => {
      // Clean up PDF document on unmount or src change
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfSrc, onTransformationChange, pdfjsRef.current]); // Depend on pdfjsRef.current

  // Render PDF pages to canvases
  const renderPage = useCallback(async (page: PDFPageProxy, canvas: HTMLCanvasElement) => {
    const renderScale = 2.0; // Render at 2x resolution for sharpness
    const viewport = page.getViewport({ scale: renderScale });
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas internal dimensions to the higher resolution
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Set canvas display dimensions to the original size to prevent it from appearing huge
    // This effectively makes it a HiDPI (Retina) render
    const baseViewport = page.getViewport({ scale: 1.0 });
    canvas.style.width = baseViewport.width + 'px';
    canvas.style.height = baseViewport.height + 'px';

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    try {
      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      // Handle rendering error if necessary
    }
  }, []);

  useEffect(() => {
    if (!pdfDoc || !imageWrapperRef.current || !transformedContentRef.current) return;

    const pagesContainer = imageWrapperRef.current; // This is the div where canvases are appended
    pagesContainer.innerHTML = ''; // Clear previous canvases

    const renderAllPages = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas mb-2 border border-gray-300 shadow-sm'; // Add some styling
        pagesContainer.appendChild(canvas); // Append canvases to imageWrapperRef
        await renderPage(page, canvas);
      }
    };

    renderAllPages();
  }, [pdfDoc, renderPage, imageWrapperRef]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging if the event originated from the transformed content div itself
    // and not from a child like a text input within a future annotation layer
    if (e.target === transformedContentRef.current) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialTransform.current = { offsetX: transformation.offsetX, offsetY: transformation.offsetY };
      e.preventDefault();
    }
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
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = 0.05;
    let newScale = transformation.scale;
    if (e.deltaY < 0) { // Zoom in
      newScale += scaleAmount;
    } else { // Zoom out
      newScale -= scaleAmount;
    }
    newScale = Math.max(0.1, Math.min(5.0, newScale)); // Clamp scale between 0.1 and 5.0

    // Adjust offsetX/offsetY to zoom towards mouse position
    const contentDiv = transformedContentRef.current;
    if (!contentDiv) return;

    const rect = contentDiv.getBoundingClientRect(); // Get position relative to viewport
    const mouseXInViewport = e.clientX - rect.left;
    const mouseYInViewport = e.clientY - rect.top;

    // Calculate mouse position relative to the *transformed* content before the new scale
    const mouseXInContent = (mouseXInViewport - transformation.offsetX) / transformation.scale;
    const mouseYInContent = (mouseYInViewport - transformation.offsetY) / transformation.scale;

    // Calculate new offsets to keep the content under the mouse cursor stable
    const newOffsetX = mouseXInViewport - mouseXInContent * newScale;
    const newOffsetY = mouseYInViewport - mouseYInContent * newScale;

    onTransformationChange({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  };

  if (loadingPdf) {
    return <div className="flex-grow flex items-center justify-center text-gray-600">Loading PDF...</div>;
  }

  if (pdfError) {
    return <div className="flex-grow flex items-center justify-center text-red-500">Error: {pdfError}</div>;
  }

  if (!pdfSrc) {
    return <div className="flex-grow flex items-center justify-center text-gray-500">No PDF source provided for this record.</div>;
  }

  return (
    <div
      className="flex-grow overflow-hidden relative" // This is the VIEWPORT, handles clipping
      onWheel={handleWheel}
      // Dragging handlers are now on this viewport div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
        <div // This is the TRANSFORMED CONTENT CONTAINER, its size adapts to its children
            ref={transformedContentRef}
            className={`pdf-transformed-content ${isDragging ? 'grabbing' : 'grab'}`}
            style={{
                transform: `translate(${transformation.offsetX}px, ${transformation.offsetY}px) scale(${transformation.scale})`,
                transformOrigin: '0 0', // Apply transform from top-left
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center pages horizontally within the transformed space
                // NO FIXED WIDTH/HEIGHT - it grows with its content
                // Instead, ensure minimum size if content is empty or small
                minWidth: '100%',
                minHeight: '100%',
                padding: '20px', // Apply padding here for spacing *around* the pages
                boxSizing: 'content-box', // Ensure padding adds to size
                // Set background for empty areas if content doesn't fill
                backgroundColor: '#fff',
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
