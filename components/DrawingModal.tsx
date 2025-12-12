import React, { useRef, useState, useEffect } from 'react';
import { PixelButton, PixelCard } from './PixelComponents';
import { Eraser, Check, X } from 'lucide-react';
import { JAMO_LIST } from '../constants';
import { JamoData } from '../types';

interface DrawingModalProps {
    onSave: (char: string, type: 'consonant'|'vowel', image: string) => void;
    onClose: () => void;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({ onSave, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedChar, setSelectedChar] = useState<JamoData>(JAMO_LIST[0]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.beginPath(); // Reset path
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleSave = () => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL();
            const type = selectedChar.type.includes('medial') ? 'vowel' : 'consonant';
            onSave(selectedChar.char, type, dataUrl);
        }
    };

    const clearCanvas = () => {
         const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <PixelCard className="w-full max-w-lg shadow-2xl" title="HANDWRITING PROTOCOL">
                <div className="flex flex-col gap-4">
                    <p className="text-sm">1. Select Character to Write:</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
                        {JAMO_LIST.map(j => (
                            <button
                                key={j.char}
                                onClick={() => setSelectedChar(j)}
                                className={`flex-shrink-0 w-8 h-8 font-bold border-2 ${selectedChar.char === j.char ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
                            >
                                {j.char}
                            </button>
                        ))}
                    </div>

                    <p className="text-sm">2. Draw "{selectedChar.char}" below:</p>
                    <div className="border-4 border-black self-center relative">
                        <canvas
                            ref={canvasRef}
                            width={256}
                            height={256}
                            className="bg-white cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onMouseMove={draw}
                            onTouchStart={startDrawing}
                            onTouchEnd={stopDrawing}
                            onTouchMove={draw}
                        />
                    </div>

                    <div className="flex justify-between mt-2">
                         <PixelButton variant="secondary" onClick={clearCanvas} title="Clear">
                            <Eraser size={18} />
                         </PixelButton>
                         <div className="flex gap-2">
                             <PixelButton variant="danger" onClick={onClose}>
                                <X size={18} />
                             </PixelButton>
                             <PixelButton variant="primary" onClick={handleSave} className="flex gap-2 items-center">
                                <Check size={18} /> GENERATE CHIP
                             </PixelButton>
                         </div>
                    </div>
                </div>
            </PixelCard>
        </div>
    );
};
