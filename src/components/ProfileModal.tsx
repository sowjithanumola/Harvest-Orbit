
import { useState } from "react";
import { User as AuthUser } from "firebase/auth";
import { Settings, X, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { auth } from "../lib/firebase";

export const ProfileModal = ({ user, onClose }: { user: AuthUser, onClose: () => void }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            <div className={`p-8 rounded-2xl w-full max-w-sm relative ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
                <h2 className="text-xl font-bold mb-6">Profile & Settings</h2>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xl">{user.email?.[0].toUpperCase()}</div>
                       <div>
                           <p className="font-bold">{user.email}</p>
                           <p className="text-xs text-slate-500">User ID: {user.uid.slice(0, 8)}...</p>
                       </div>
                    </div>
                    
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between p-3 border rounded-xl">
                        Theme {theme === 'dark' ? <Sun /> : <Moon />}
                    </button>

                    <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-bold">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
