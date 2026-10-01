import React, { useState, useEffect } from 'react';
import { CustomerData, ShopStats, RefurbishedPhoneItem, GamePlayMode } from '../types/game';
import { CITY_INCIDENTS } from '../data/problems';
import { ThreeShopScene } from './ThreeShopScene';
import { soundManager } from '../utils/audio';
import {
  Wrench,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  ShoppingBag,
  Smartphone,
  Gamepad2,
  Sun,
  Clock,
  Euro,
  UserX,
  Star,
  CheckCircle2,
  AlertTriangle,
  Tag,
  HelpCircle,
  TrendingUp,
  X,
  ShieldAlert,
  Bell,
  Newspaper
} from 'lucide-react';

interface ShopCounterProps {
  currentCustomer: CustomerData;
  nextCustomers: CustomerData[];
  stats: ShopStats;
  gamePlayMode?: GamePlayMode;
  onChangeGamePlayMode?: (mode: GamePlayMode) => void;
  onAcceptContract: (price: number, timeSeconds: number, expectationLevel: 'normal' | 'high' | 'ultra') => void;
  onCustomerRefusedOffer?: (offeredPrice: number) => void;
  onDiscardCustomer: () => void;
  onGenerateRandomCustomer?: () => void;
  onSellRefurbishedPhone: (item: RefurbishedPhoneItem) => void;
  onOpenShopModal: () => void;
  isDeliveringRepairedPhone: boolean;
  onDeliveredNextCustomer: () => void;
}

const AVAILABLE_REFURBISHED: RefurbishedPhoneItem[] = [
  {
    id: 'refurb-1',
    model: 'Apex Titan 5G (Ricondizionato)',
    color: 'Titanium Blue',
    wholesaleCost: 160,
    retailPrice: 182,
    netProfit: 22,
    imageColor: '#2563eb',
  },
  {
    id: 'refurb-2',
    model: 'Nova Crystal OLED (Grado A+)',
    color: 'Smeraldo Mint',
    wholesaleCost: 190,
    retailPrice: 218,
    netProfit: 28,
    imageColor: '#10b981',
  },
  {
    id: 'refurb-3',
    model: 'VoltMax Ultra 256GB',
    color: 'Oro Champagne',
    wholesaleCost: 135,
    retailPrice: 153,
    netProfit: 18,
    imageColor: '#f59e0b',
  },
  {
    id: 'refurb-4',
    model: 'Quantum Z-Fold 2026',
    color: 'Cosmic Violet',
    wholesaleCost: 260,
    retailPrice: 295,
    netProfit: 35,
    imageColor: '#8b5cf6',
    isLatestGen: true,
  },
  {
    id: 'refurb-5',
    model: 'Pixel 9 Pro Actua (Grado A)',
    color: 'Hazel Grey',
    wholesaleCost: 210,
    retailPrice: 236,
    netProfit: 26,
    imageColor: '#64748b',
  },
  {
    id: 'refurb-6',
    model: 'Galaxy Watch Ultra Titanium',
    color: 'Orange Sport',
    wholesaleCost: 110,
    retailPrice: 125,
    netProfit: 15,
    imageColor: '#f97316',
  },
];

export const ShopCounter: React.FC<ShopCounterProps> = ({
  currentCustomer,
  nextCustomers,
  stats,
  gamePlayMode,
  onChangeGamePlayMode,
  onAcceptContract,
  onCustomerRefusedOffer,
  onDiscardCustomer,
  onGenerateRandomCustomer,
  onSellRefurbishedPhone,
  onOpenShopModal,
  isDeliveringRepairedPhone,
  onDeliveredNextCustomer,
}) => {
  const [phoneOnCounter, setPhoneOnCounter] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [muted, setMuted] = useState(!soundManager.enabled);

  // Negotiation state
  const [offeredPrice, setOfferedPrice] = useState<number>(currentCustomer.reward);
  const [offeredTime, setOfferedTime] = useState<number>(960); // 16 min quadrupled default
  const [showNegotiationModal, setShowNegotiationModal] = useState<boolean>(false);
  const [negotiationPhase, setNegotiationPhase] = useState<'form' | 'evaluating' | 'accepted' | 'refused'>('form');
  const [negotiationResultMsg, setNegotiationResultMsg] = useState<string>('');
  const [acceptedExpectation, setAcceptedExpectation] = useState<'normal' | 'high' | 'ultra'>('normal');

  // Discard in-app confirmation modal (Fixes Request 2: "Scarta cliente non funziona")
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);

  // Random customer wanting to buy refurbished phone
  const [refurbishedBuyer, setRefurbishedBuyer] = useState<RefurbishedPhoneItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState<boolean>(false);
  const [currentIncident] = useState(() => CITY_INCIDENTS[Math.floor(Math.random() * CITY_INCIDENTS.length)]);

  useEffect(() => {
    setPhoneOnCounter(false);
    setBubbleVisible(false);
    setOfferedPrice(currentCustomer.reward);
    setOfferedTime(960);
    setNegotiationPhase('form');
    setNegotiationResultMsg('');
    setShowDiscardModal(false);

    const t1 = setTimeout(() => {
      setPhoneOnCounter(true);
      soundManager.playCustomerChirp(1.1);
    }, 450);

    const t2 = setTimeout(() => {
      setBubbleVisible(true);
      soundManager.playCustomerChirp(0.9);
    }, 850);

    // 1) Refurbished buyer frequency scales with shop reputation (Request 1)
    // Low reputation (1.0 - 2.5): ~8% - 15%
    // Medium reputation (3.0 - 4.0): ~30% - 45%
    // High reputation (4.5 - 5.0): ~65%
    const buyerProbability = Math.max(0.08, Math.min(0.65, ((stats.reputation - 1) / 4) * 0.65));
    if (Math.random() < buyerProbability) {
      const randomPhone = AVAILABLE_REFURBISHED[Math.floor(Math.random() * AVAILABLE_REFURBISHED.length)];
      setRefurbishedBuyer(randomPhone);
    } else {
      setRefurbishedBuyer(null);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentCustomer.id]);

  const toggleSound = () => {
    soundManager.enabled = !soundManager.enabled;
    setMuted(!soundManager.enabled);
  };

  const getIssueBadge = (type: CustomerData['issueType'], category: CustomerData['deviceCategory'] = 'smartphone') => {
    const isWatch = category === 'smartwatch';
    const isTablet = category === 'tablet';

    switch (type) {
      case 'water_damage':
        return { label: isWatch ? '💧 Infiltrazione Acqua Sensori' : '💧 Danno da Liquidi / Bagnato', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
      case 'software_glitch':
        return { label: isWatch ? '⚡ Bootloop Wear OS / watchOS' : '⚡ Glitch Software / Bootloop', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'overheating_cpu':
        return { label: isWatch ? '🔥 Surriscaldamento Chip SiP' : '🔥 Surriscaldamento Termico CPU', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'broken_speaker':
        return { label: isWatch ? '🔊 Micro-Altoparlante Muto' : '🔊 Altoparlante Spaccato / Muto', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'broken_screen':
        return { label: isWatch ? '💥 Display Rotondo Sapphire Rotto' : isTablet ? '💥 Pannello Tablet 13" Frantumato' : '💥 Schermo Frantumato', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'bad_camera':
        return { label: '📸 Telecamere Posteriori Rotte', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'dead_battery':
        return { label: isWatch ? '⚡ Micro-Batteria Li-Po Esausta' : '⚡ Batteria Gonfia / Esausta', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'combo_water_camera':
        return { label: '⚠️ Bagnato + Telecamere Guaste', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      // Nuovi Guasti
      case 'charging_port_dirt':
        return { label: '🔌 USB-C Intasata da Sporco', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'broken_charging_port':
        return { label: '⚡ Porta USB-C Dissaldata/Rotta', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'clogged_earpiece':
        return { label: isWatch ? '🎙️ Microfono & Barometro Intasati' : '👂 Capsula Auricolare Muta', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'cracked_back_glass':
        return { label: isWatch ? '🪞 Sensore Cardio Posteriore Rotto' : '🪞 Vetro Posteriore Frantumato', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'broken_taptic_engine':
        return { label: isWatch ? '📳 Feedback Aptico Polso Rotto' : '📳 Motore Aptico/Vibrazione Rotto', color: 'bg-violet-100 text-violet-800 border-violet-300' };
      case 'stuck_volume_buttons':
        return { label: isWatch ? '🔘 Digital Crown / Tasto Bloccato' : '🔘 Tasti Volume Laterali Bloccati', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'wifi_antenna_cut':
        return { label: isWatch ? '📡 Antenna RF / GPS Tranciata' : '📡 Antenna Wi-Fi/5G Tranciata', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'wireless_charging_burnt':
        return { label: isWatch ? '🔋 Ricarica Magnetica Qi Bruciata' : '🔋 Bobina Qi Wireless Bruciata', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'damaged_selfie_camera':
        return { label: '🤳 Selfie Camera Graffiata', color: 'bg-pink-100 text-pink-800 border-pink-300' };
      case 'malware_spyware_wipe':
        return { label: '🦠 Infezione Malware / Spyware', color: 'bg-red-100 text-red-800 border-red-300' };
      case 'console_outer_shell_detached':
        return { label: '🎮 Chiocca Esterna Staccata / Allentata', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      default:
        return { label: '🔧 Riparazione Hardware', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
  };

  const badge = getIssueBadge(currentCustomer.issueType, currentCustomer.deviceCategory);

  // 1) PROBABILISTIC ACCEPTANCE CALCULATION (Price + Promised Time + Reputation)
  const baseReward = currentCustomer.reward;
  const priceRatio = offeredPrice / baseReward;

  // 3) Longer promised time reduces customer acceptance probability!
  let timeModifier = 0;
  if (offeredTime <= 720) timeModifier = 0.07; // 12 min (Lampo): customer loves speedy service!
  else if (offeredTime === 960) timeModifier = 0.0; // 16 min (Standard): baseline
  else if (offeredTime === 1440) timeModifier = -0.15; // 24 min: customer is impatient (-15%)
  else if (offeredTime >= 1920) timeModifier = -0.28; // 32 min: customer hates waiting over half hour (-28%)

  // High reputation boosts acceptance chance
  let acceptChance = 1.0 - (priceRatio - 1.0) * 0.90 + (stats.reputation - 3.0) * 0.06 + timeModifier;
  acceptChance = Math.max(0.04, Math.min(0.98, acceptChance));
  const acceptPercentage = Math.round(acceptChance * 100);

  // Send offer to customer (Customer makes the final decision!)
  const handleSendOfferToCustomer = () => {
    setNegotiationPhase('evaluating');
    soundManager.playCustomerChirp(1.0);

    setTimeout(() => {
      const roll = Math.random();
      if (roll < acceptChance) {
        // Customer accepts!
        soundManager.playPry();
        setNegotiationPhase('accepted');

        let exp: 'normal' | 'high' | 'ultra' = 'normal';
        if (priceRatio > 1.45) exp = 'ultra';
        else if (priceRatio > 1.2) exp = 'high';
        setAcceptedExpectation(exp);

        const acceptanceOptions = [
          `😊 "Ottimo preventivo di €${offeredPrice}! Affare fatto, procedi pure con la riparazione!"`,
          `🤝 "Perfetto, mi fido di te e del tuo laboratorio. Fammi sapere quando è pronto!"`,
          `✨ "Prezzo onesto e servizio rapido. Vai alla grande!"`,
          `👍 "Va bene per €${offeredPrice}, accetto! Lavoraci con cura per favore."`,
          `💪 "Ci sto! Sapevo di poter contare sulla tua bottega."`
        ];
        const randomAccept = acceptanceOptions[Math.floor(Math.random() * acceptanceOptions.length)];

        if (exp === 'ultra') {
          setNegotiationResultMsg(
            `😤 "Accetto a malincuore... ma per €${offeredPrice} pretendo un lavoro perfetto e riconsegna entro ${Math.floor(
              offeredTime / 60
            )} minuti spaccati! Se ritardi o danneggi il telefono te la farò pagare sulla recensione!"`
          );
        } else if (exp === 'high') {
          setNegotiationResultMsg(
            `🤔 "Va bene, il prezzo di €${offeredPrice} è altino ma mi serve il telefono con urgenza. Rispetta i tempi promessi!"`
          );
        } else {
          setNegotiationResultMsg(randomAccept);
        }
      } else {
        // Customer REFUSES!
        soundManager.playBuzzerTriple();
        setNegotiationPhase('refused');

        const refusalOptions = [
          `😡 "Cosa?! €${offeredPrice}?! Così tanto non lo farò mai più! Me ne vado subito da un'altra parte!"`,
          `🤬 "Ma siamo pazzi?! €${offeredPrice} per questa riparazione? Così tanto non lo farò mai più, piuttosto compro un telefono nuovo!"`,
          `🙄 "Prezzo esagerato. €${offeredPrice}?! Così tanto non lo farò mai più, me lo tengo rotto, grazie tante!"`,
          `😤 "Alla faccia del tecnico onesto! €${offeredPrice} è un furto... così tanto non lo farò mai più, addio!"`
        ];
        const randomRefusal = refusalOptions[Math.floor(Math.random() * refusalOptions.length)];

        setNegotiationResultMsg(randomRefusal);
      }
    }, 750);
  };

  // Proceed to workbench after customer accepted
  const handleProceedToWorkbench = () => {
    setShowNegotiationModal(false);
    onAcceptContract(offeredPrice, offeredTime, acceptedExpectation);
  };

  // Customer refused: leave negative review and advance
  const handleRefusalAcknowledge = () => {
    setShowNegotiationModal(false);
    if (onCustomerRefusedOffer) {
      onCustomerRefusedOffer(offeredPrice);
    } else {
      onDiscardCustomer();
    }
  };

  const handleSellPhone = () => {
    if (!refurbishedBuyer) return;
    soundManager.playCash();
    onSellRefurbishedPhone(refurbishedBuyer);
    setRefurbishedBuyer(null);
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden bg-sky-100 font-sans select-none">
      {/* TOP HEADER */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        {/* LEFT: BRAND & DAY */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-black">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 font-['Outfit']">
                Bottega <span className="text-cyan-600">Ripara-Telefoni</span>
              </h1>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                <Sun className="w-3 h-3 text-amber-500 fill-amber-500" /> Giorno {stats.currentDay}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Balcone & Compravendita Ricondizionati • <span className="text-cyan-700 font-bold italic">by ottavio</span></div>
          </div>
        </div>

        {/* CENTER: ECONOMY & STATS (CASSA & FAMA) */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] text-emerald-800 uppercase font-bold">Cassa:</span>
            <span className="font-mono text-emerald-700 font-black text-sm tabular-nums">€{stats.money}</span>
          </div>

          <button
            onClick={() => setShowReviewsModal(true)}
            title="Visualizza recensioni dei clienti"
            className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-amber-800 uppercase font-bold">Fama:</span>
            <span className="font-mono text-amber-700 font-black text-sm flex items-center gap-1">
              <span>⭐ {stats.reputation.toFixed(1)}</span>
            </span>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-600 uppercase font-semibold">Riparazioni:</span>
            <span className="font-mono text-cyan-700 font-bold text-sm tabular-nums">
              {stats.customersServed} 📱
            </span>
          </div>
        </div>

        {/* RIGHT: CONTROLS, MODES & UPGRADES */}
        <div className="flex items-center gap-2">
          {onChangeGamePlayMode && (
            <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-300 text-xs">
              <button
                onClick={() => onChangeGamePlayMode('tutorial')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  gamePlayMode === 'tutorial'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                🎓 Tutorial
              </button>
              <button
                onClick={() => onChangeGamePlayMode('solo_expert')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  gamePlayMode === 'solo_expert'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                ⚡ Solo
              </button>
              <button
                onClick={() => onChangeGamePlayMode('solo_with_help')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  gamePlayMode === 'solo_with_help'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                💡 con Aiuto
              </button>
            </div>
          )}

          <button
            onClick={onOpenShopModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span className="font-['Outfit']">Potenzia</span>
          </button>

          <button
            onClick={toggleSound}
            aria-label="Attiva o disattiva audio"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
          </button>
        </div>
      </header>

      {/* MIDDLE: 3D BALCONY SHOP CANVAS SCENE */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <ThreeShopScene
            currentCustomer={currentCustomer}
            nextCustomers={nextCustomers}
            stats={stats}
            isDeliveringRepairedPhone={isDeliveringRepairedPhone}
            onPhoneClick={phoneOnCounter && !isDeliveringRepairedPhone ? () => {
              setNegotiationPhase('form');
              setShowNegotiationModal(true);
            } : () => {}}
            phonePlaced={phoneOnCounter}
          />
        </div>

        {/* FLOATING SPEECH BUBBLE */}
        <div className="relative z-20 pointer-events-none flex flex-col items-center pt-2 px-4">
          {/* Breaking News Banner if city incident is active */}
          {currentCustomer.isCityIncidentSeriousCustomer && (
            <div className="pointer-events-auto mb-3 max-w-xl w-full">
              <div
                onClick={() => setShowNewsModal(true)}
                className="bg-slate-900/90 hover:bg-slate-900 text-white border-2 border-amber-400 rounded-2xl px-4 py-2.5 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer transform hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block" />
                  <span className="text-xs font-bold font-['Outfit'] text-amber-300">📰 ULTIM'ORA - Incidente in Città: Cittadini tesi e seri (Leggi News)</span>
                </div>
                <span className="text-[11px] font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Newspaper className="w-3.5 h-3.5" /> Leggi Giornale
                </span>
              </div>
            </div>
          )}

          <div
            className={`pointer-events-auto transition-all duration-300 transform ${
              bubbleVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
            } max-w-lg`}
          >
            <div className="relative bg-white text-slate-900 px-7 py-4 rounded-3xl shadow-xl border-2 border-slate-200/90">
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white" />

              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <span className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                      {currentCustomer.name}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-800 leading-snug">
                    {isDeliveringRepairedPhone
                      ? currentCustomer.happyDialogue
                      : `"${currentCustomer.dialogue}"`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REFURBISHED SMARTPHONE SALE BANNER (Direct profit!) */}
        {refurbishedBuyer && !isDeliveringRepairedPhone && (
          <div className="absolute top-24 right-6 z-20 max-w-xs bg-white/95 border-2 border-emerald-500 rounded-3xl p-4 shadow-xl backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" /> Richiesta Acquisto Vetrina
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {refurbishedBuyer.isLatestGen ? 'Top Flagship' : 'Ricondizionato'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              "Vorrei acquistare il <strong className="text-slate-900">{refurbishedBuyer.model}</strong> a schermo acceso in vetrina!"
            </p>
            <div className="bg-emerald-50 rounded-xl p-2.5 text-xs mb-3 border border-emerald-200">
              <div className="flex justify-between text-slate-600">
                <span>Prezzo Vendita:</span>
                <span className="font-bold text-slate-900">€{refurbishedBuyer.retailPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo Fornitura:</span>
                <span className="font-bold text-slate-700">-€{refurbishedBuyer.wholesaleCost}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-black border-t border-emerald-200 pt-1 mt-1">
                <span>Utile Netto:</span>
                <span>+€{refurbishedBuyer.netProfit}</span>
              </div>
            </div>
            <button
              onClick={handleSellPhone}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              Vendi e Incassa +€{refurbishedBuyer.netProfit} Netto!
            </button>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="relative z-20 px-6 py-4 bg-gradient-to-t from-white via-white/85 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Active device info */}
          <div className="flex items-center gap-3 bg-white/90 px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              {currentCustomer.deviceCategory === 'console' ? <Gamepad2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 font-['Outfit']">
                {currentCustomer.phoneModelName}
              </div>
              <div className="text-[11px] text-emerald-700 font-mono font-bold">
                Valore riparazione stimato: €{currentCustomer.reward}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isDeliveringRepairedPhone ? (
              <button
                onClick={onDeliveredNextCustomer}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95 font-['Outfit']"
              >
                <span>Incassa & Prossimo Cliente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                {/* 3) GENERA NUOVO CLIENTE CASUALE (Point 4: Clienti random sempre diversi) */}
                {onGenerateRandomCustomer && (
                  <button
                    disabled={!phoneOnCounter}
                    onClick={onGenerateRandomCustomer}
                    title="Evoca un nuovo cliente casuale con dispositivo e guasto a sorpresa"
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none transform hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>🎲 Nuovo Cliente Random</span>
                  </button>
                )}

                {/* 2) SCARTA CLIENTE BUTTON (Uses clean in-app modal, NO window.confirm!) */}
                <button
                  disabled={!phoneOnCounter}
                  onClick={() => setShowDiscardModal(true)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  <UserX className="w-4 h-4" />
                  <span>Scarta Cliente</span>
                </button>

                {/* 1) PROPOSE OFFER BUTTON (Customer makes final decision via probability!) */}
                <button
                  disabled={!phoneOnCounter}
                  onClick={() => {
                    setNegotiationPhase('form');
                    setShowNegotiationModal(true);
                  }}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm shadow-xl shadow-cyan-600/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95 font-['Outfit']"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Fai Preventivo & Tratta con Cliente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2) IN-APP DISCARD CONFIRMATION MODAL (Replaces broken window.confirm!) */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit'] mb-1">
              Congedare {currentCustomer.name}?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Se rifiuti di fare un'offerta a questo cliente, se ne andrà deluso lasciando una recensione da 1 stella con penalità di <strong className="text-rose-600">-0.2⭐ sulla Fama</strong> del negozio.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  setShowDiscardModal(false);
                  onDiscardCustomer();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Conferma e Scarta (-0.2⭐)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1) PROBABILISTIC NEGOTIATION MODAL (CUSTOMER MAKES THE FINAL DECISION!) */}
      {showNegotiationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                  Preventivo Riparazione
                </h3>
                <p className="text-xs text-slate-500">
                  La scelta finale è del cliente! Fissa prezzo e tempo promesso.
                </p>
              </div>
              {negotiationPhase === 'form' && (
                <button
                  onClick={() => setShowNegotiationModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {negotiationPhase === 'form' && (
              <>
                {/* Price slider */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Euro className="w-4 h-4 text-emerald-600" /> Prezzo Richiesto al Cliente
                    </span>
                    <span className="font-mono text-2xl font-black text-emerald-600">
                      €{offeredPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(baseReward * 0.6)}
                    max={Math.round(baseReward * 2.3)}
                    value={offeredPrice}
                    onChange={e => setOfferedPrice(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1 font-semibold">
                    <span>Scontato (€{Math.round(baseReward * 0.6)})</span>
                    <span>Consigliato (€{baseReward})</span>
                    <span>Salatissimo (€{Math.round(baseReward * 2.3)})</span>
                  </div>
                </div>

                {/* Time Promise Selector */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-600" /> Tempo Promesso (Timer di Riparazione)
                    </span>
                    <span className="font-mono text-sm font-bold text-cyan-700">
                      {Math.floor(offeredTime / 60)} min ({offeredTime} sec)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { time: 720, label: '12 min (Lampo)' },
                      { time: 960, label: '16 min (Standard)' },
                      { time: 1440, label: '24 min (Tranquillo)' },
                      { time: 1920, label: '32 min (Complesso)' },
                    ].map(opt => (
                      <button
                        key={opt.time}
                        onClick={() => setOfferedTime(opt.time)}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          offeredTime === opt.time
                            ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1) PROBABILITY METER & GAME BALANCE WARNING */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <TrendingUp className="w-4 h-4 text-blue-600" /> Probabilità di Accettazione Cliente:
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-full font-black ${
                        acceptPercentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : acceptPercentage >= 45
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {acceptPercentage >= 75 ? 'Alta' : acceptPercentage >= 45 ? 'Media' : 'Bassa / Molto Rischiosa'}{' '}
                      (~{acceptPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-200 ${
                        acceptPercentage >= 75
                          ? 'bg-emerald-500'
                          : acceptPercentage >= 45
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${acceptPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {offeredTime >= 1440 && (
                      <span className="text-amber-700 font-semibold block mb-0.5">
                        ⏱️ Tempi lunghi ({Math.floor(offeredTime / 60)} min): il cliente ha fretta e la probabilità di rifiuto cresce!
                      </span>
                    )}
                    {priceRatio > 1.3
                      ? '⚠️ Prezzo molto alto: il cliente potrebbe rifiutare e andarsene con feedback negativo! Se accetta, esigerà un lavoro perfetto nei tempi concordati altrimenti la recensione sarà spietata.'
                      : '✅ Prezzo equilibrato: alta probabilità che il cliente accetti volentieri.'}
                  </p>
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowNegotiationModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSendOfferToCustomer}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer font-['Outfit']"
                  >
                    Invia Preventivo di €{offeredPrice} al Cliente ➔
                  </button>
                </div>
              </>
            )}

            {/* EVALUATING PHASE ANIMATION */}
            {negotiationPhase === 'evaluating' && (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin mx-auto mb-3" />
                <h4 className="text-sm font-extrabold text-slate-800">
                  {currentCustomer.name} sta valutando il preventivo...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Calcolo convenienza e disponibilità budget in corso
                </p>
              </div>
            )}

            {/* ACCEPTED OUTCOME */}
            {negotiationPhase === 'accepted' && (
              <div className="py-4 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-2xl">
                  🎉
                </div>
                <h4 className="text-base font-black text-emerald-800 font-['Outfit'] mb-1">
                  Il Cliente Ha Accettato l'Accordo!
                </h4>
                <p className="text-xs text-slate-700 font-medium bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4 italic">
                  {negotiationResultMsg}
                </p>
                <button
                  onClick={handleProceedToWorkbench}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 cursor-pointer transform hover:scale-[1.02] active:scale-95 font-['Outfit']"
                >
                  Porta Telefono al Banco di Lavoro ➔
                </button>
              </div>
            )}

            {/* REFUSED OUTCOME */}
            {negotiationPhase === 'refused' && (
              <div className="py-4 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2 text-2xl">
                  ❌
                </div>
                <h4 className="text-base font-black text-rose-800 font-['Outfit'] mb-1">
                  Preventivo Rifiutato dal Cliente!
                </h4>
                <p className="text-xs text-slate-700 font-medium bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-4 italic">
                  {negotiationResultMsg}
                </p>
                <div className="text-[11px] text-rose-600 font-bold mb-4">
                  Penalità: -0.15⭐ sulla Fama per preventivo rifiutato.
                </div>
                <button
                  onClick={handleRefusalAcknowledge}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs shadow-lg cursor-pointer"
                >
                  Capito, Saluta Cliente & Avanti il Prossimo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEWS & FEEDBACK HISTORY MODAL */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                  Recensioni & Reputazione ({stats.reputation.toFixed(1)} ⭐)
                </h3>
              </div>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {stats.reviews && stats.reviews.length > 0 ? (
                stats.reviews.map(rev => (
                  <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{rev.customerName}</span>
                      <span className="text-amber-500 font-bold text-xs">
                        {'⭐'.repeat(rev.rating)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic">"{rev.comment}"</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span>Incassato: €{rev.priceCharged}</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Ancora nessuna recensione registrata. Completa riparazioni veloci per ottenere feedback a 5 stelle!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CITY INCIDENT NEWS MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-amber-50 rounded-3xl p-6 shadow-2xl border-4 border-slate-900 text-slate-900 relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-slate-900" />
                <h3 className="text-lg font-black font-['Outfit'] uppercase tracking-wider text-slate-900">
                  IL CORRIERE DEL TECH • EDIZIONE STRAORDINARIA
                </h3>
              </div>
              <button
                onClick={() => setShowNewsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center cursor-pointer hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-inner mb-5">
              <h4 className="text-base font-black text-slate-900 mb-2 font-['Outfit']">
                {currentIncident.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-serif">
                {currentIncident.content}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono italic flex justify-between">
                <span>Cronaca Locale • Città</span>
                <span>Nota: I clienti oggi sono molto seri e tesi, ma onesti (non sono ladri).</span>
              </div>
            </div>

            <button
              onClick={() => setShowNewsModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md cursor-pointer"
            >
              Ho Letto la Notizia • Torna al Bancone
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
