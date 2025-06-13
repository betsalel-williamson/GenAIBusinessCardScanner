import React, { useRef, useState, useEffect } from 'react';
import type { TransformationState } from '../../../types/types';

interface ImagePaneProps {
  imageSrc: string;
  transformation: TransformationState;
  onTransformationChange: (newTransformation: TransformationState) => void;
  imageWrapperRef: React.RefObject<HTMLDivElement>;
}

const ImagePane: React.FC<ImagePaneProps> = ({ imageSrc, transformation, onTransformationChange, imageWrapperRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialTransform = useRef({ offsetX: 0, offsetY: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialTransform.current = { offsetX: transformation.offsetX, offsetY: transformation.offsetY };
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
    onTransformationChange({ ...transformation, scale: newScale });
  };

  return (
    <div className="flex justify-center items-start overflow-hidden flex-grow relative" ref={imageWrapperRef}>
        <div
            className={`image-display-area ${isDragging ? 'grabbing' : 'grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
                transform: `translate(${transformation.offsetX}px, ${transformation.offsetY}px) scale(${transformation.scale})`,
                transformOrigin: '0 0', // Apply transform from top-left for easier mental model
            }}
        >
            {imageSrc && <img src={imageSrc} alt="Document for validation" className="w-full h-auto" />}
            {!imageSrc && <div className="p-4 text-center text-gray-500">No image available for this record.</div>}
        </div>
    </div>
  );
};

export default ImagePane;
