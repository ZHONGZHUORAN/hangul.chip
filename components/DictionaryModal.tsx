import React from 'react';
import { PixelCard } from './PixelComponents';
import { VocabularyItem } from '../types';
import { X, BookOpen } from 'lucide-react';

interface DictionaryModalProps {
    items: VocabularyItem[];
    onClose: () => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({ items, onClose }) => {
    // Sort by most recently learned
    const sortedItems = [...items].sort((a, b) => b.learnedAt - a.learnedAt);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <PixelCard className="w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl relative text-black" title="MEMORY BANK">
                 <button onClick={onClose} className="absolute top-4 right-4 hover:bg-gray-200 p-1 text-black">
                    <X size={20} />
                </button>

                <div className="flex-1 overflow-y-auto mt-2 pr-2">
                    {sortedItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <BookOpen size={48} className="mb-4 opacity-20 text-black" />
                            <p className="font-bold">No data recorded.</p>
                            <p className="text-xs">Complete missions to fill your dictionary.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sortedItems.map(item => (
                                <div key={item.id} className="border-2 border-black p-3 bg-white flex justify-between items-center hover:bg-gray-50 transition-colors shadow-sm">
                                    <div>
                                        <div className="text-2xl font-bold font-[Noto Sans KR] mb-1 text-black">{item.target}</div>
                                        <div className="text-xs text-gray-600 font-bold uppercase">{item.romaja}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-black">{item.translation}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            {new Date(item.learnedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PixelCard>
        </div>
    );
};