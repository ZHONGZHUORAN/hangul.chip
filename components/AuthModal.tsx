import React, { useState } from 'react';
import { PixelCard, PixelButton } from './PixelComponents';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { X, UserX } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <PixelCard className="w-full max-w-md shadow-2xl relative" title={isLogin ? "LOGIN PROTOCOL" : "REGISTER UNIT"}>
                 <button onClick={onClose} className="absolute top-4 right-4 hover:bg-gray-200 p-1 text-black">
                    <X size={20} />
                </button>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    {error && <div className="bg-red-100 text-red-600 p-2 text-xs font-bold border border-red-500">{error}</div>}
                    
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-black">Email</label>
                        <input 
                            type="email" 
                            className="w-full border-2 border-black p-2 font-mono focus:outline-none focus:bg-gray-50"
                            style={{ backgroundColor: 'white', color: 'black' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-black">Password</label>
                        <input 
                            type="password" 
                            className="w-full border-2 border-black p-2 font-mono focus:outline-none focus:bg-gray-50"
                            style={{ backgroundColor: 'white', color: 'black' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>

                    <PixelButton type="submit" className="w-full mt-2">
                        {isLogin ? "ACCESS SYSTEM" : "CREATE NEW USER"}
                    </PixelButton>

                    <div className="flex flex-col gap-2 mt-2">
                        <button 
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs text-center underline text-gray-800 hover:text-black transition-colors font-bold"
                        >
                            {isLogin ? "No account? Register here" : "Have account? Login here"}
                        </button>

                        <div className="border-t border-gray-300 my-1"></div>

                        <button 
                            type="button"
                            onClick={onClose}
                            className="text-xs text-center flex items-center justify-center gap-1 text-gray-600 hover:text-black transition-colors"
                        >
                            <UserX size={14} /> Continue as Guest
                        </button>
                    </div>
                </form>
            </PixelCard>
        </div>
    );
};