
import React from 'react';
import { BookOpen, GraduationCap, Trophy } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'dashboard' | 'stats' | 'quiz') => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-dele-orange p-2 rounded-xl transition-all group-hover:rotate-6">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">
            Grammar <span className="text-dele-orange">Español</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all ${activeView === 'dashboard' ? 'bg-orange-50 text-dele-orange' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Unidades</span>
          </button>
          <button 
            onClick={() => onNavigate('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all ${activeView === 'stats' ? 'bg-orange-50 text-dele-orange' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Trophy className="w-4 h-4" />
            <span>Progreso</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-dele-orange uppercase tracking-widest leading-none">DELE Advisor</span>
            <span className="text-sm font-bold text-slate-700">Level B2</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center font-black text-indigo-600">
            ES
          </div>
        </div>
      </div>
    </nav>
  );
};
