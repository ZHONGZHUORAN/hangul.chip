import React, { useState, useRef, useEffect } from 'react';
import { JAMO_LIST } from './constants';
import { PuzzlePiece, JamoData, Mission, UserProgress, VocabularyItem } from './types';
import { DraggableChip } from './components/DraggableChip';
import { PixelButton, PixelCard } from './components/PixelComponents';
import { DrawingModal } from './components/DrawingModal';
import { AuthModal } from './components/AuthModal';
import { DictionaryModal } from './components/DictionaryModal';
import { scanBoard } from './utils/hangulUtils';
import { generateLessonContent, explainGrammar, generateMission } from './services/geminiService';
import { Trash2, Brain, Sparkles, PenTool, Trophy, Star, Target, HelpCircle, User, Book, LogOut, CloudOff } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const App: React.FC = () => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [assembledText, setAssembledText] = useState<string>('');
  const [aiFeedback, setAiFeedback] = useState<string>("Welcome. Drag chips or use the pen to build.");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);
  
  // Features State
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<UserProgress>({ xp: 0, level: 1 });
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [showMissionHint, setShowMissionHint] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Auth & Data Loading ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setIsOfflineMode(false); // Reset offline mode on auth change

        if (currentUser) {
            try {
                // Load User Data
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProgress(data.progress || { xp: 0, level: 1 });
                    setVocabulary(data.vocabulary || []);
                } else {
                    // Initialize new user doc
                    try {
                        await setDoc(docRef, {
                            progress: { xp: 0, level: 1 },
                            vocabulary: []
                        });
                    } catch (writeErr: any) {
                        // If we can't write (permissions), fall back to offline mode silently
                        console.warn("Cloud save unavailable (permissions). Switching to offline mode.");
                        setIsOfflineMode(true);
                    }
                }
            } catch (error: any) {
                // Common error codes for permissions or offline
                if (error.code === 'permission-denied' || error.code === 'unavailable') {
                    console.warn("Cloud features disabled: " + error.code);
                    setIsOfflineMode(true);
                } else {
                    console.error("Database connection failed:", error.code);
                    setIsOfflineMode(true);
                }
            }
        } else {
            // Reset local state on logout
            setProgress({ xp: 0, level: 1 });
            setVocabulary([]);
        }
    });
    return () => unsubscribe();
  }, []);

  // --- Drag & Drop Logic ---

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    const piece = pieces.find(p => p.id === id);
    if (!piece || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - piece.x;
    const offsetY = e.clientY - rect.top - piece.y;

    dragOffset.current = { x: offsetX, y: offsetY };
    setDraggedPieceId(id);
    
    // Bring to front
    setPieces(prev => {
        const others = prev.filter(p => p.id !== id);
        return [...others, piece];
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedPieceId || !canvasRef.current) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;

    setPieces(prev => 
      prev.map(p => p.id === draggedPieceId ? { ...p, x, y } : p)
    );
  };

  const handlePointerUp = () => {
    setDraggedPieceId(null);
  };

  // --- Board Actions ---

  const addPiece = (jamo: JamoData) => {
    const newPiece: PuzzlePiece = {
      id: Math.random().toString(36).substr(2, 9),
      char: jamo.char,
      romaja: jamo.romaja, 
      type: jamo.type.includes('medial') ? 'vowel' : 'consonant',
      x: 50 + Math.random() * 200, 
      y: 220 + Math.random() * 150, 
    };
    setPieces(prev => [...prev, newPiece]);
  };

  const addCustomPiece = (char: string, type: 'consonant'|'vowel', imageUrl: string) => {
    const newPiece: PuzzlePiece = {
        id: Math.random().toString(36).substr(2, 9),
        char,
        type,
        imageUrl,
        x: 150,
        y: 250,
    };
    setPieces(prev => [...prev, newPiece]);
    setShowDrawingModal(false);
  };

  const clearBoard = () => {
    setPieces([]);
    setAssembledText('');
    setAiFeedback("Board cleared.");
  };

  const handleScan = () => {
    const result = scanBoard(pieces);
    setAssembledText(result);
    if (result.length > 0) {
        addXp(2); // Small reward for effort
        checkMission(result);
        requestAiFeedback(result, currentMission?.target);
    } else {
        setAiFeedback("Arrange chips closer together to form syllables.");
    }
  };

  const addXp = async (amount: number) => {
      const newXp = progress.xp + amount;
      const nextLevelThreshold = progress.level * 100;
      let newLevel = progress.level;
      if (newXp >= nextLevelThreshold) {
          newLevel += 1;
      }
      
      const newProgress = { xp: newXp, level: newLevel };
      setProgress(newProgress);

      // Save to Firebase if logged in AND not in offline mode
      if (user && !isOfflineMode) {
          try {
              const docRef = doc(db, "users", user.uid);
              await updateDoc(docRef, { progress: newProgress });
          } catch (error: any) {
              console.warn("Failed to save progress, switching to offline mode.");
              setIsOfflineMode(true);
          }
      }
  };

  const requestAiFeedback = async (text: string, missionTarget?: string) => {
    setIsLoadingAi(true);
    const feedback = await generateLessonContent(`Level ${progress.level}`, text, missionTarget);
    setAiFeedback(feedback);
    setIsLoadingAi(false);
  };

  const handleExplain = async () => {
    if (!assembledText) return;
    setIsLoadingAi(true);
    const explanation = await explainGrammar(assembledText);
    setAiFeedback(explanation);
    setIsLoadingAi(false);
  };

  // --- Mission Logic ---
  const getNewMission = async () => {
      setIsLoadingAi(true);
      const missionData = await generateMission(progress.level);
      setCurrentMission({ ...missionData, completed: false });
      setShowMissionHint(progress.level < 3); // Auto-show hint only for low levels
      setIsLoadingAi(false);
  };

  const checkMission = async (text: string) => {
      // Logic: text must include target, OR text must equal target (stricter for sentences)
      const isMatch = text.includes(currentMission?.target || '___');
      
      if (currentMission && !currentMission.completed && isMatch) {
          setCurrentMission(prev => prev ? { ...prev, completed: true } : null);
          await addXp(currentMission.reward);
          
          // Check for duplicates before adding to dictionary
          const isDuplicate = vocabulary.some(item => item.target === currentMission.target);

          if (!isDuplicate) {
            const newItem: VocabularyItem = {
                id: Math.random().toString(36).substr(2, 9),
                target: currentMission.target,
                translation: currentMission.translation,
                romaja: currentMission.romaja,
                learnedAt: Date.now()
            };
            
            // Optimistic update
            setVocabulary(prev => [...prev, newItem]);

            if (user && !isOfflineMode) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    await updateDoc(docRef, { 
                        vocabulary: arrayUnion(newItem)
                    });
                } catch (error) {
                    console.warn("Failed to save word, switching to offline mode");
                    setIsOfflineMode(true);
                }
            }
          }
      }
  };

  // --- Render ---

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden select-none font-mono"
         onPointerUp={handlePointerUp}
         onPointerMove={handlePointerMove}>
      
      {showDrawingModal && <DrawingModal onSave={addCustomPiece} onClose={() => setShowDrawingModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showDictionary && <DictionaryModal items={vocabulary} onClose={() => setShowDictionary(false)} />}

      {/* Sidebar / Palette */}
      <aside className="w-full md:w-80 bg-neutral-100 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col z-20 shadow-xl h-[30vh] md:h-screen">
        <div className="p-4 border-b-4 border-black bg-black text-white flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold tracking-tighter">PIXEL HANGUL</h1>
                <div className="flex items-center gap-1 text-green-400">
                    <Trophy size={16} />
                    <span>LVL {progress.level}</span>
                </div>
            </div>
            {/* XP Bar */}
            <div className="w-full bg-gray-800 h-2 mt-1 relative">
                <div 
                    className="absolute top-0 left-0 h-full bg-green-400 transition-all duration-300"
                    style={{ width: `${(progress.xp % (progress.level * 100)) / (progress.level * 100) * 100}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                <span>XP: {progress.xp}</span>
                <div className="flex gap-2 items-center">
                    {user ? (
                        <>
                             {isOfflineMode && (
                                <div title="Cloud Save Failed (Permissions/Offline)">
                                    <CloudOff size={16} className="text-red-400 animate-pulse" />
                                </div>
                             )}
                            <button onClick={() => setShowDictionary(true)} title="Dictionary">
                                <Book size={16} className="hover:text-white" />
                            </button>
                            <button onClick={() => signOut(auth)} title="Logout">
                                <LogOut size={16} className="hover:text-white" />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1 hover:text-white underline">
                            <User size={14} /> Login/Save
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <PixelButton onClick={() => setShowDrawingModal(true)} variant="secondary" className="w-full flex justify-center gap-2 items-center">
                <PenTool size={16} /> Draw Custom Chip
            </PixelButton>

            {/* Mission Card */}
            <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center mb-2 border-b-2 border-dashed border-gray-300 pb-1">
                    <span className="font-bold text-sm uppercase flex items-center gap-2 text-black">
                        <Target size={16} /> Active Mission
                    </span>
                    {currentMission?.completed && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                </div>
                {currentMission ? (
                     <div className="text-sm">
                        {/* Target Word Display */}
                        <div className="mb-2">
                             <div className="text-3xl font-bold text-center tracking-wider py-4 bg-gray-50 border border-gray-100 mb-1 text-black font-[Noto Sans KR]">
                                 {currentMission.target}
                             </div>
                             {/* UPDATED: Larger text sizes for better readability */}
                             <div className="flex flex-col items-center gap-1 mt-2">
                                 <span className="text-lg font-bold text-gray-700">{currentMission.romaja}</span>
                                 <span className="text-base text-gray-500 italic">{currentMission.translation}</span>
                             </div>
                        </div>
                        
                        {/* Hint Section */}
                        {showMissionHint && !currentMission.completed && (
                            <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-200">
                                <p className="text-[10px] uppercase text-gray-400 mb-1">Recipe / Hint:</p>
                                <div className="flex gap-1 flex-wrap justify-center">
                                    {currentMission.components?.map((char, idx) => (
                                        <div key={idx} className="w-8 h-8 bg-white border border-black flex items-center justify-center text-sm font-bold text-black">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentMission.completed ? (
                            <div className="mt-2 text-green-600 font-bold text-xs uppercase text-center bg-green-100 p-1">Completed! Saved to Dictionary.</div>
                        ) : (
                             <div className="mt-2 flex justify-between items-center">
                                 <button onClick={() => setShowMissionHint(!showMissionHint)} className="text-xs flex items-center gap-1 text-gray-400 hover:text-black">
                                     <HelpCircle size={12} /> {showMissionHint ? 'Hide Hint' : 'Show Hint'}
                                 </button>
                                 <div className="text-xs text-gray-400">Reward: {currentMission.reward} XP</div>
                             </div>
                        )}
                     </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-xs text-gray-500 mb-2">No active mission.</p>
                        <button onClick={getNewMission} className="text-xs underline font-bold hover:text-blue-600 text-black">
                            Request Mission
                        </button>
                    </div>
                )}
                 {currentMission && currentMission.completed && (
                     <button onClick={getNewMission} className="w-full mt-2 text-xs bg-black text-white py-2 hover:bg-gray-800 uppercase tracking-widest font-bold">
                         Next Mission
                     </button>
                 )}
            </div>

            <div>
                <h3 className="text-sm font-bold mb-2 uppercase text-gray-500">Consonants (Jamo)</h3>
                <div className="grid grid-cols-4 gap-2">
                    {JAMO_LIST.filter(j => !j.type.includes('medial')).map(j => (
                        <button
                            key={j.char}
                            onClick={() => addPiece(j)}
                            className="w-12 h-12 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none text-black flex flex-col items-center justify-center"
                        >
                            <span>{j.char}</span>
                            <span className="text-[8px] font-normal opacity-60 leading-none">{j.romaja}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold mb-2 uppercase text-gray-500">Vowels</h3>
                <div className="grid grid-cols-4 gap-2">
                    {JAMO_LIST.filter(j => j.type.includes('medial')).map(j => (
                        <button
                            key={j.char}
                            onClick={() => addPiece(j)}
                            className="w-12 h-12 bg-black text-white border-2 border-black hover:bg-gray-800 transition-colors text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center"
                        >
                            <span>{j.char}</span>
                            <span className="text-[8px] font-normal opacity-60 leading-none">{j.romaja}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-[70vh] md:h-screen">
        
        {/* Top Bar / HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10 flex justify-between items-start">
            <PixelCard className="pointer-events-auto max-w-md" title="Output Protocol">
                <div className="min-h-[60px] flex items-center gap-4">
                    <div className="text-4xl font-bold bg-gray-100 p-2 border-b-2 border-black min-w-[100px] text-center tracking-widest text-black font-[Noto Sans KR]">
                        {assembledText || '...'}
                    </div>
                    <div className="flex flex-col gap-2">
                         <PixelButton onClick={handleScan} variant="primary" className="text-xs py-1 px-3 flex gap-2 items-center">
                            <Brain size={16} /> BUILD
                        </PixelButton>
                        <PixelButton onClick={handleExplain} disabled={!assembledText} variant="secondary" className="text-xs py-1 px-3 flex gap-2 items-center disabled:opacity-50">
                            <Sparkles size={16} /> ANALYZE
                        </PixelButton>
                    </div>
                </div>
            </PixelCard>

            <div className="flex gap-2 pointer-events-auto">
                 <button onClick={clearBoard} className="bg-white p-2 border-2 border-black shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none hover:bg-red-50 text-red-600">
                    <Trash2 size={24} />
                 </button>
            </div>
        </div>

        {/* The Whiteboard Canvas */}
        <div 
            ref={canvasRef}
            className="flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNkNGQ0ZDQiLz48L3N2Zz4=')] relative overflow-hidden cursor-crosshair touch-none"
        >
             {pieces.map(piece => (
                 <DraggableChip 
                    key={piece.id} 
                    piece={piece} 
                    onMouseDown={handlePointerDown} 
                 />
             ))}
             
             {pieces.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-black">
                    <div className="text-center">
                        <h2 className="text-6xl font-bold mb-4">CANVAS</h2>
                        <p className="text-xl font-mono">Drag modules here to assemble.</p>
                    </div>
                </div>
             )}
        </div>

        {/* Bottom AI Feedback Bar */}
        <div className="bg-white border-t-4 border-black p-4 h-auto min-h-[120px] flex flex-col md:flex-row gap-4 items-start md:items-center">
             <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0 border-2 border-transparent outline outline-2 outline-black offset-2">
                 {isLoadingAi ? (
                     <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                     <div className="text-white font-bold text-2xl">AI</div>
                 )}
             </div>
             
             <div className="flex-1 font-mono text-lg md:text-xl leading-relaxed text-black">
                 <span className="bg-black text-white px-1 mr-2 text-xs align-middle">SYSTEM_MSG:</span>
                 {aiFeedback}
             </div>
        </div>

      </main>
    </div>
  );
};

export default App;