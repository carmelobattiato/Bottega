import React, { useState } from 'react';
import { ShopStats, UpgradeCategory } from '../types/game';
import { SHOP_UPGRADES } from '../data/problems';
import { soundManager } from '../utils/audio';
import {
  Sparkles,
  X,
  Check,
  ShoppingBag,
  Wrench,
  Layers,
  Palette,
  Flame,
  Cpu,
  Scissors,
  Monitor,
  Lightbulb,
  Coffee,
  Flower2,
  Smartphone,
  Star
} from 'lucide-react';

interface ShopUpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ShopStats;
  onBuyUpgrade: (cost: number, upgradeId: string) => void;
  purchasedUpgrades: string[];
}

export const ShopUpgradesModal: React.FC<ShopUpgradesModalProps> = ({
  isOpen,
  onClose,
  stats,
  onBuyUpgrade,
  purchasedUpgrades,
}) => {
  const [activeTab, setActiveTab] = useState<UpgradeCategory>('tools');

  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Flame': return Flame;
      case 'Wrench': return Wrench;
      case 'Cpu': return Cpu;
      case 'Scissors': return Scissors;
      case 'Layers': return Layers;
      case 'Monitor': return Monitor;
      case 'Sparkles': return Sparkles;
      case 'Lightbulb': return Lightbulb;
      case 'Palette': return Palette;
      case 'Coffee': return Coffee;
      case 'Flower2': return Flower2;
      case 'Smartphone': return Smartphone;
      case 'Star': return Star;
      default: return Sparkles;
    }
  };

  const filteredUpgrades = SHOP_UPGRADES.filter(u => u.category === activeTab);

  const handlePurchase = (cost: number, id: string) => {
    if (stats.money >= cost && !purchasedUpgrades.includes(id)) {
      soundManager.playCash();
      onBuyUpgrade(cost, id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn font-sans select-none">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                Potenziamenti & Laboratorio 3D
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Disponibilità in Cassa: <span className="text-emerald-700 font-extrabold font-mono text-sm">€{stats.money}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Categories Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-white text-cyan-800 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>1. Attrezzi</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-white text-emerald-800 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Banco ESD</span>
          </button>

          <button
            onClick={() => setActiveTab('decorations')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'decorations'
                ? 'bg-white text-amber-800 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>3. Balcone</span>
          </button>

          <button
            onClick={() => setActiveTab('showcase_phones')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'showcase_phones'
                ? 'bg-white text-purple-800 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>4. Vetrina Top</span>
          </button>
        </div>

        {/* Upgrades List */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/50">
          {filteredUpgrades.map(item => {
            const Icon = getIcon(item.iconName);
            const isOwned = purchasedUpgrades.includes(item.id);
            const canAfford = stats.money >= item.cost;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isOwned
                    ? 'bg-emerald-50/80 border-emerald-200 text-slate-700'
                    : canAfford
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    : 'bg-slate-100/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isOwned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                      {item.desc}
                    </p>
                    <div className="mt-1.5 inline-block text-[11px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-200">
                      ⚡ Vantaggio: {item.perk}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isOwned ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" /> Installato
                    </span>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item.cost, item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer font-mono tracking-wide ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transform hover:scale-105 active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Acquista €{item.cost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Gli elementi decorativi acquistati compariranno nella vista 3D del balcone!</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
