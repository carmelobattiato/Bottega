import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Smartphone,
  Clock,
  Euro,
  Star,
  Tv,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Layers,
  HelpCircle,
  GraduationCap,
  Hammer,
  ShieldAlert,
  CheckCircle2,
  Moon,
} from 'lucide-react';
import { ShopStats, GamePlayMode } from '../types/game';
import { soundManager } from '../utils/audio';

interface ShopStartScreenProps {
  stats: ShopStats;
  currentMode: GamePlayMode;
  onSelectMode: (mode: GamePlayMode) => void;
  enableSuspicious: boolean;
  onToggleSuspicious: (enabled: boolean) => void;
  onOpenShop: () => void;
}

export const ShopStartScreen: React.FC<ShopStartScreenProps> = ({
  stats,
  currentMode,
  onSelectMode,
  enableSuspicious,
  onToggleSuspicious,
  onOpenShop,
}) => {
  const [selectedMode, setSelectedMode] = useState<GamePlayMode>(currentMode || 'classic');

  const handlePickMode = (mode: GamePlayMode) => {
    soundManager.playCustomerChirp(1.1);
    soundManager.isNightMode = (mode === 'night');
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  const handleOpen = () => {
    soundManager.playDoorBell();
    soundManager.isNightMode = (selectedMode === 'night');
    onOpenShop();
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between items-center p-4 md:p-8 overflow-y-auto selection:bg-cyan-500 selection:text-white">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-300/30">
            <Wrench className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              TECH LAB <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">PRO SIMULATOR</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Laboratorio di Riparazioni & Assistenza Hardware 2026</p>
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-3">
          <span className="italic font-serif text-cyan-300 font-black text-base bg-cyan-900 px-4 py-1.5 rounded-xl border-2 border-cyan-400 shadow-md">by ottavio</span>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            SERRANDA ABBASSATA
          </div>
        </div>
      </header>

      {/* Main Hero & Shop Ready Card */}
      <main className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-center text-center my-auto py-4">
        {/* Neon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Nuova Giornata di Lavoro • Scegli la tua Modalità di Assistenza
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3 max-w-3xl leading-tight">
          Benvenuto nel tuo <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300">Laboratorio Tech</span>
        </h2>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mb-6 leading-relaxed">
          Scegli come preferisci affrontare le riparazioni hardware prima di alzare la serranda:
        </p>

        {/* SELEZIONE MODALITÀ DI GIOCO */}
        <div className="w-full max-w-3xl mb-8">
          <div className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 mb-3 text-left flex items-center gap-2 font-mono">
            <span>⚙️ Modalità di Riparazione & Atmosfera:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* 1) MODALITÀ CLASSICA */}
            <div
              onClick={() => handlePickMode('classic')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                selectedMode === 'classic'
                  ? 'bg-gradient-to-b from-blue-950/70 to-slate-900 border-blue-400 shadow-xl shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                STANDARD
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  {selectedMode === 'classic' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <h3 className="text-base font-black text-white mb-1">Modalità Classica</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 mb-2">
                  Standard di Laboratorio
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  L'esperienza classica del simulatore di riparazioni hardware con effetti sonori realistici e ritmo di gioco bilanciato.
                </p>
              </div>
            </div>

            {/* 2) MODALITÀ NOTTE (SUONI PIÙ CALMI) */}
            <div
              onClick={() => handlePickMode('night')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                selectedMode === 'night'
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-400 shadow-xl shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                SUONI CALMI 🌙
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Moon className="w-5 h-5" />
                  </div>
                  {selectedMode === 'night' && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                <h3 className="text-base font-black text-white mb-1">Modalità Notte</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 mb-2">
                  Atmosfera Rilassata & Suoni Calmi
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  Lavoro notturno nel laboratorio: tutti gli effetti sonori e i feedback audio sono soffusi, calmi e rilassanti per una sessione tranquilla.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left">
            {/* 3) PARTITA TUTORIAL */}
            <div
              onClick={() => handlePickMode('tutorial')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedMode === 'tutorial'
                  ? 'bg-gradient-to-b from-cyan-950/70 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  {selectedMode === 'tutorial' && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <h3 className="text-base font-black text-white mb-1">Partita Tutorial</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 mb-2">
                  100% Guidata Passo-Passo
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  La guida ti segue sempre: obiettivi mostrati a schermo, frecce luminose su ogni vite e componente.
                </p>
              </div>
            </div>

            {/* 4) PARTITA SOLO */}
            <div
              onClick={() => handlePickMode('solo_expert')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedMode === 'solo_expert'
                  ? 'bg-gradient-to-b from-purple-950/70 to-slate-900 border-purple-400 shadow-xl shadow-purple-500/20 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  {selectedMode === 'solo_expert' && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <h3 className="text-base font-black text-white mb-1">Partita Solo</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 mb-2">
                  100% Fai da Te (Esperto)
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  Nessun aiuto, nessun beacon, nessun consiglio automatico. Diagnosi pura ed esperienza realistica.
                </p>
              </div>
            </div>

            {/* 5) SOLO CON AIUTO A SCELTA */}
            <div
              onClick={() => handlePickMode('solo_with_help')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedMode === 'solo_with_help'
                  ? 'bg-gradient-to-b from-amber-950/70 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Hammer className="w-5 h-5" />
                  </div>
                  {selectedMode === 'solo_with_help' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <h3 className="text-base font-black text-white mb-1">Solo con Aiuto</h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 mb-2">
                  Scegli tu se farti aiutare
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  Lavori in autonomia con il tasto <strong className="text-amber-300 font-semibold">"💡 Chiedi Aiuto al Maestro"</strong> sempre disponibile.
                </p>
              </div>
            </div>
          </div>

          {/* TOGGLE: Clienti Loschi / Malintenzionati in negozio */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-2 border-red-500/40 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  Clienti Sospetti & Malintenzionati <span className="text-[10px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded font-mono">Allarme Polizia 🚨</span>
                </h4>
                <p className="text-xs text-slate-300 leading-tight">
                  Se attivo, tra i clienti potranno capitare soggetti loschi che parlano in modo serio. Clicca l'allarme per far intervenire la polizia, oppure attento: se finisci la riparazione tireranno fuori una pistola e perderai €20!
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleSuspicious(!enableSuspicious)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableSuspicious ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableSuspicious ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats Preview Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 w-full max-w-xl mb-6">
          <div className="p-3 md:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col items-center">
            <span className="text-xs text-slate-400 font-medium mb-1">Giorno</span>
            <span className="text-lg md:text-xl font-black text-white">Giorno {stats.currentDay}</span>
            <span className="text-[10px] text-cyan-400 mt-0.5">Turno Mattina</span>
          </div>

          <div className="p-3 md:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col items-center">
            <span className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Euro className="w-3 h-3 text-emerald-400" /> Cassa
            </span>
            <span className="text-lg md:text-xl font-black text-emerald-400">€{stats.money}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Fondi Iniziali</span>
          </div>

          <div className="p-3 md:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col items-center">
            <span className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Reputazione
            </span>
            <span className="text-lg md:text-xl font-black text-amber-400">{stats.reputation.toFixed(1)}</span>
            <span className="text-[10px] text-amber-300/80 mt-0.5 font-semibold">
              {stats.reviews?.length || 0} recensioni
            </span>
          </div>
        </div>

        {/* Big Open Shop Button with mode summary */}
        <button
          onClick={handleOpen}
          className="group relative inline-flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-lg md:text-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border border-cyan-300/40 cursor-pointer mb-5"
        >
          <span className="text-2xl">🏪</span>
          <span>
            AVVIA IN MODALITÀ {selectedMode === 'tutorial' ? 'TUTORIAL GUIDATO' : selectedMode === 'solo_expert' ? 'SOLO (ESPERTO)' : 'SOLO CON AIUTO A SCELTA'}
          </span>
          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>🔔 Suonerà il campanello e il primo cliente entrerà con il suo dispositivo guasto</span>
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl text-left mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Dispositivi Reali</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                iPhone, Galaxy, Pixel, Xiaomi, Smartwatch rotondi, iPad e Laptop.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Trattativa Prezzo & Tempo</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Offri preventivo personalizzato: tempi lunghi o prezzi alti riducono la probabilità che il cliente accetti!
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Nuovi Strumenti & Super Guasti</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Saldatore 450°C, multimetro, vasca ultrasuoni e riparazioni avanzate di CPU, modem e lenti!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-4 mt-4">
        <span>Laboratorio Riparazioni Tech v2.6 • 3D Hardware Simulation</span>
        <span>Premi "Apri il Negozio" per iniziare</span>
      </footer>
    </div>
  );
};
