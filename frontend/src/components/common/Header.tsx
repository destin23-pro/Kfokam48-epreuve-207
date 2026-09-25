import React from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Sparkles,
  Wifi,
  Settings,
} from 'lucide-react';
import { RoleType } from '../../types';

interface HeaderProps {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  isLiveApi: boolean;
  apiUrl: string;
  onOpenSettings: () => void;
  activeSessionCode?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isLiveApi,
  onOpenSettings,
  activeSessionCode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Identité Académique & Marque */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 text-white font-bold text-lg shadow-sm">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                  KFOKAM48
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">·</span>
                <span className="hidden sm:inline text-xs font-medium text-slate-500">
                  Système de Présences & Évaluations
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Switcher Étudiant / Formateur */}
          <nav aria-label="Espaces académiques" className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => onRoleChange('etudiant')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentRole === 'etudiant'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Espace Étudiant</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('formateur')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentRole === 'formateur'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Espace Formateur</span>
              {activeSessionCode && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Session en direct active" />
              )}
            </button>
          </nav>

          {/* Zone 3: Statut Backend & Configuration */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              title="Configurer l'URL de l'API Spring Boot et le mode de données"
            >
              {isLiveApi ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">API Live (8080)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Simulation Active</span>
                </div>
              )}
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
