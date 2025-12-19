
import React from 'react';
import { BookOpen, GraduationCap, Trophy, Settings } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'dashboard' | 'stats' | 'settings') => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-[#F37021] p-2 rounded-lg transition-transform group-hover:scale-110">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Hispania <span className="text-[#F37021]">B2</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Unidades</span>
          </button>
          <button 
            onClick={() => onNavigate('stats')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeView === 'stats' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Trophy className="w-4 h-4" />
            <span className="font-medium">Progreso</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">DELE Official Prep</span>
            <span className="text-sm font-bold text-slate-700">Edelsa Edition</span>
          </div>
          <img 
            src="https://picsum.photos/seed/hispania-b2/40/40" 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-orange-200 shadow-sm"
          />
        </div>
      </div>
    </nav>
  );
};
