import { useState, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 for square, 16/9 for landscape, etc.
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cropSize = 200; // Fixed crop area size

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3));
  };

  const handleCrop = () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputSize = 400; // Output image size
    canvas.width = outputSize;
    canvas.height = outputSize / aspectRatio;

    const img = imageRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate the crop area position relative to the image
    const cropAreaX = containerRect.width / 2 - cropSize / 2;
    const cropAreaY = containerRect.height / 2 - (cropSize / aspectRatio) / 2;

    // Calculate the actual image position
    const imgCenterX = containerRect.width / 2 + position.x;
    const imgCenterY = containerRect.height / 2 + position.y;

    // The portion of the image we need to crop
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Calculate source coordinates
    const displayedWidth = img.width * scale;
    const displayedHeight = img.height * scale;

    const imgLeft = imgCenterX - displayedWidth / 2;
    const imgTop = imgCenterY - displayedHeight / 2;

    const srcX = ((cropAreaX - imgLeft) / displayedWidth) * imgWidth;
    const srcY = ((cropAreaY - imgTop) / displayedHeight) * imgHeight;
    const srcWidth = (cropSize / displayedWidth) * imgWidth;
    const srcHeight = ((cropSize / aspectRatio) / displayedHeight) * imgHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped portion
    ctx.drawImage(
      img,
      Math.max(0, srcX),
      Math.max(0, srcY),
      Math.min(srcWidth, imgWidth - srcX),
      Math.min(srcHeight, imgHeight - srcY),
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Convert to base64
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">이미지 자르기</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div
          ref={containerRef}
          className="relative w-full h-80 bg-gray-900 overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Image */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="max-w-none"
              draggable={false}
            />
          </div>

          {/* Crop Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Crop window */}
            <div
              className="absolute border-2 border-white bg-transparent"
              style={{
                width: cropSize,
                height: cropSize / aspectRatio,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                borderRadius: aspectRatio === 1 ? '50%' : '8px',
              }}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="border border-white/30" />
                ))}
              </div>
            </div>
          </div>

          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="축소"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32"
            />
            <button
              onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="확대"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="회전"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} className="btn-secondary">
              취소
            </button>
            <button onClick={handleCrop} className="btn-primary flex items-center">
              <Check className="w-4 h-4 mr-1" />
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
