import React from 'react';
import { PuzzlePiece } from '../types';
import { GripVertical, Volume2 } from 'lucide-react';

interface DraggableChipProps {
  piece: PuzzlePiece;
  onMouseDown: (e: React.PointerEvent, id: string) => void;
}

export const DraggableChip: React.FC<DraggableChipProps> = ({ piece, onMouseDown }) => {
  const isConsonant = piece.type === 'consonant';
  
  const playSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent drag start when clicking volume or just clicking to hear
    const utterance = new SpeechSynthesisUtterance(piece.char);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`absolute cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center 
        transition-shadow duration-150 group`}
      style={{
        left: piece.x,
        top: piece.y,
        width: '64px',
        height: '64px',
        touchAction: 'none' // Crucial for pointer events not scrolling
      }}
      onPointerDown={(e) => onMouseDown(e, piece.id)}
      onClick={playSound}
    >
        {/* The Chip Visual */}
        <div className={`
            w-full h-full flex flex-col items-center justify-center border-2 border-black relative overflow-hidden
            ${isConsonant ? 'bg-white text-black' : 'bg-black text-white'}
            shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]
            group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]
            group-active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]
            group-active:translate-x-[2px] group-active:translate-y-[2px]
        `}>
            {/* Decorative notch */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-gray-400 opacity-50"></div>
            
            {piece.imageUrl ? (
                <img src={piece.imageUrl} alt={piece.char} className="w-full h-full object-cover p-1" />
            ) : (
                <>
                    <span className="text-2xl font-bold mb-0 leading-none">{piece.char}</span>
                    {piece.romaja && (
                        <span className={`text-[10px] font-mono leading-none mt-1 ${isConsonant ? 'text-gray-500' : 'text-gray-400'}`}>
                            {piece.romaja}
                        </span>
                    )}
                </>
            )}
            
            {/* Grip handle for aesthetic */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <GripVertical size={16} className="text-black/50" />
            </div>

            {/* Audio Indicator */}
            <div className="absolute bottom-1 right-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <Volume2 size={10} />
            </div>
        </div>
        
        {/* Label (small type indicator) */}
        <div className="absolute -bottom-5 text-[10px] font-mono text-gray-500 bg-white/80 px-1 border border-gray-200 pointer-events-none">
            {piece.type === 'consonant' ? 'C' : 'V'}
        </div>
    </div>
  );
};