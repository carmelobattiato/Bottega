import React, { useState, useEffect, useRef } from 'react';
import { CustomerData, ToolId, PhoneRepairState, ShopStats, PhoneViewOrientation, RepairContract, DisassembledPart, OxidationSpot, GamePlayMode } from '../types/game';
import { soundManager } from '../utils/audio';
import { ThreeWorkbenchScene } from './ThreeWorkbenchScene';
import confetti from 'canvas-confetti';
import {
  Wrench,
  RotateCw,
  Flame,
  CircleDot,
  Scissors,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Power,
  Layers,
  Wind,
  Brush,
  ChevronRight,
  Eye,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Volume2,
  Pipette,
  Radio,
  FileCode2,
  Clock,
  Euro,
  Zap,
  Star,
  Check,
  ShieldCheck,
  Archive,
  RefreshCw,
  FastForward,
  Trash2,
  HelpCircle,
  Video,
  ChevronUp,
  ChevronDown,
  X,
  Play,
  Activity,
  ShieldAlert,
  Bell
} from 'lucide-react';

interface WorkbenchProps {
  customer: CustomerData;
  stats: ShopStats;
  contract: RepairContract;
  gamePlayMode?: GamePlayMode;
  onChangeGamePlayMode?: (mode: GamePlayMode) => void;
  onFinishRepairWithOutcome: (outcome: {
    isSuccess: boolean;
    netReward: number;
    rating: number;
    reviewComment: string;
    extraExpenses: number;
    isLate: boolean;
  }) => void;
  onReturnToCounter: () => void;
}

function getDeviceScrews(customer: CustomerData): Record<string, number> {
  const cat = customer.deviceCategory || (
    customer.phoneModelName.includes('Watch') ? 'smartwatch' :
    customer.phoneModelName.includes('iPad') || customer.phoneModelName.includes('Tab') ? 'tablet' :
    customer.phoneModelName.includes('MacBook') || customer.phoneModelName.includes('Laptop') || customer.phoneModelName.includes('XPS') || customer.phoneModelName.includes('ThinkPad') || customer.phoneModelName.includes('ZenBook') || customer.phoneModelName.includes('Katana') || customer.phoneModelName.includes('Nitro') || customer.phoneModelName.includes('Surface') ? 'laptop' :
    customer.phoneModelName.includes('PlayStation') || customer.phoneModelName.includes('Console') ? 'console' : 'smartphone'
  );

  switch (cat) {
    case 'smartwatch':
      return {
        watch_screw_0: 0,
        watch_screw_1: 0,
        internal_bracket_screw: 0,
      };
    case 'tablet':
      return {
        tablet_corner_tl: 0,
        tablet_corner_tr: 0,
        tablet_corner_bl: 0,
        tablet_corner_br: 0,
        tablet_bracket_0: 0,
        tablet_bracket_1: 0,
        tablet_board_0: 0,
        tablet_board_1: 0,
      };
    case 'laptop':
      return {
        laptop_grid_1: 0,
        laptop_grid_2: 0,
        laptop_grid_3: 0,
        laptop_grid_4: 0,
        laptop_grid_5: 0,
        laptop_grid_6: 0,
        laptop_grid_7: 0,
        laptop_grid_8: 0,
        laptop_heatsink_0: 0,
        laptop_heatsink_1: 0,
      };
    case 'console':
      return {
        console_corner_1: 0,
        console_corner_2: 0,
        console_corner_3: 0,
        console_corner_4: 0,
        console_drive_0: 0,
        console_drive_1: 0,
      };
    case 'smartphone':
    default:
      return {
        bottom_screw_0: 0,
        bottom_screw_1: 0,
        speaker_screw: 0,
        motherboard_screw_0: 0,
        motherboard_screw_1: 0,
      };
  }
}

export const Workbench: React.FC<WorkbenchProps> = ({
  customer,
  stats,
  contract,
  gamePlayMode = 'solo_with_help',
  onChangeGamePlayMode,
  onFinishRepairWithOutcome,
  onReturnToCounter,
}) => {
  const [selectedTool, setSelectedTool] = useState<ToolId>('none');
  const [currentMode, setCurrentMode] = useState<GamePlayMode>(gamePlayMode);
  const [tutorialEnabled, setTutorialEnabled] = useState(gamePlayMode === 'tutorial');
  const [showMasterHintModal, setShowMasterHintModal] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [orientation, setOrientation] = useState<PhoneViewOrientation>('front');

  // Sync mode if passed from parent
  useEffect(() => {
    setCurrentMode(gamePlayMode);
    setTutorialEnabled(gamePlayMode === 'tutorial');
  }, [gamePlayMode]);

  const handleModeChange = (newMode: GamePlayMode) => {
    soundManager.playCustomerChirp(1.1);
    setCurrentMode(newMode);
    if (newMode === 'tutorial') {
      setTutorialEnabled(true);
    } else {
      setTutorialEnabled(false);
    }
    if (onChangeGamePlayMode) {
      onChangeGamePlayMode(newMode);
    }
  };

  // Sidebar tab on right: 'parts' (new spare parts) or 'dispenser' (disassembled parts tray)
  const [sidebarTab, setSidebarTab] = useState<'parts' | 'dispenser'>('dispenser');

  // Timer countdown state (Quadrupled times: 16 min default!)
  const [timeRemaining, setTimeRemaining] = useState<number>(contract.agreedTimeSeconds || 960);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isLate, setIsLate] = useState<boolean>(false);
  const buzzerTriggeredRef = useRef<boolean>(false);

  // Outcome receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // 10) Auto "Rimonta Tutto" animated simulation state
  const [isAutoReassembling, setIsAutoReassembling] = useState<boolean>(false);
  const [reassembleProgress, setReassembleProgress] = useState<number>(0);
  const [reassembleStepDesc, setReassembleStepDesc] = useState<string>('Avvio riassemblaggio...');

  // Initial power state
  const startsPoweredOn = customer.issueType !== 'water_damage' && customer.issueType !== 'dead_battery';

  // Oxidation spots for water damage
  const initialOxidation: OxidationSpot[] = [
    { id: 'ox1', x: 28, y: 35, size: 16, cleaned: false },
    { id: 'ox2', x: 70, y: 48, size: 18, cleaned: false },
    { id: 'ox3', x: 45, y: 72, size: 14, cleaned: false },
  ];

  const [phoneState, setPhoneState] = useState<PhoneRepairState>({
    currentSide: 'front',
    bottomScrewsRemoved: false,
    isHeated: false,
    heatProgress: 0,
    temperature: 25,
    heatZones: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    isOverheated: false,
    thermalDamageOccurred: false,

    // 1) Screw progress: 0 to 100%
    screwProgress: getDeviceScrews(customer),

    suctionApplied: false,
    screenPryProgress: 0,
    screenRemoved: false,
    newScreenInstalled: false,

    // Safety & Short Circuit
    initialPoweredOn: startsPoweredOn,
    isSafelyPoweredOff: !startsPoweredOn,
    shortCircuitOccurred: false,
    extraExpenses: 0,

    // Back side (cameras & back cover)
    backCoverHeated: false,
    backCoverPryProgress: 0,
    backCoverPried: false,
    backCoverRemoved: false,
    cameraBracketScrewsRemoved: false,
    cameraDisconnected: false,
    oldCameraRemoved: false,
    newCameraInstalled: false,

    // Battery
    batteryDisconnected: false,
    oldBatteryRemoved: false,
    newBatteryInstalled: false,

    // Water damage & Oxidation
    waterDroplets: [
      { id: 'w1', x: 28, y: 35, size: 14, isCleaned: false },
      { id: 'w2', x: 72, y: 42, size: 18, isCleaned: false },
      { id: 'w3', x: 45, y: 68, size: 16, isCleaned: false },
      { id: 'w4', x: 62, y: 80, size: 12, isCleaned: false },
    ],
    oxidationSpots: customer.issueType === 'water_damage' || customer.issueType === 'combo_water_camera' ? initialOxidation : [],
    motherboardCleaned: false,

    // Deeper disassembly: Motherboard extraction
    motherboardScrewsRemoved: false,
    motherboardExtracted: false,

    // Disassembled parts tray
    disassembledParts: [],

    // Software glitch
    dongleConnected: false,
    softwareFlashProgress: 0,
    firmwareRestored: false,

    // CPU
    oldPasteScraped: false,
    newPasteApplied: false,

    // Speaker
    speakerUnscrewed: false,
    oldSpeakerRemoved: false,
    newSpeakerInstalled: false,

    // 10 Nuovi Guasti
    chargingPortCleaned: false,
    chargingPortReplaced: false,
    earpieceCleaned: false,
    backGlassReplaced: false,
    tapticReplaced: false,
    volumeButtonsFixed: false,
    wifiAntennaConnected: false,
    wirelessCoilReplaced: false,
    wirelessCoilRemoved: false,
    selfieCameraReplaced: false,
    malwareCleaned: false,

    // Assembly & final test
    isClosed: false,
    screwsReinstalled: false,
    isPoweredOn: startsPoweredOn,
    isRepaired: false,
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    customer.issueType === 'bad_camera' || customer.issueType === 'cracked_back_glass' || customer.issueType === 'wireless_charging_burnt'
      ? '📸 Guasto sul retro: capovolgi il telefono sulla Vista Retro per lavorare sulla scocca posteriore!'
      : customer.issueType === 'charging_port_dirt' || customer.issueType === 'broken_charging_port'
      ? '🔌 Guasto alla porta di ricarica: passa alla vista Bordo Inferiore (USB-C)!'
      : '📱 Telefono posizionato sul banco. Inizia svitando le 2 viti Torx inferiori.'
  );

  // 4) Integrated Collapsible Customer Sheet in left sidebar (Point 3)
  const [isCustomerCardOpen, setIsCustomerCardOpen] = useState<boolean>(true);

  // 2) QUADRUPLED TIMER COUNTDOWN (16 min standard) with 3-BEEP alert
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLate(true);
          if (!buzzerTriggeredRef.current) {
            buzzerTriggeredRef.current = true;
            soundManager.playBuzzerTriple(); // Exactly 3 beeps, then stops!
            setFeedbackMsg('⚠️ TEMPO SCADUTO! Hai sforato il tempo concordato con il cliente (-€20 di penalità e rischio feedback negativo).');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Progressive Short Circuit Risk (% Probability that increases gently with internal disassembly action while phone is ON)
  const [shortCircuitRisk, setShortCircuitRisk] = useState<number>(0);

  // Safety power off
  const handleSafePowerOff = () => {
    soundManager.playPowerToggle();
    setShortCircuitRisk(0);
    setPhoneState(prev => ({
      ...prev,
      isPoweredOn: false,
      isSafelyPoweredOff: true,
    }));
    setFeedbackMsg('⚡ Dispositivo spento in sicurezza (0% rischio)! Ora puoi rimuovere i componenti senza pericolo di cortocircuito.');
  };

  // Check and trigger progressive short circuit risk (safe grace period + minimal risk increment)
  const checkAndTriggerShortCircuit = (riskIncrement: number = 0.1, actionName: string = 'lo smontaggio interno') => {
    if (phoneState.isPoweredOn && !phoneState.isSafelyPoweredOff && !phoneState.shortCircuitOccurred) {
      const nextRisk = Math.min(100, shortCircuitRisk + riskIncrement);
      setShortCircuitRisk(nextRisk);

      // Grace period: Very safe grace period (starts at 80% risk, ultra low probability roll)
      const roll = Math.random() * 100;
      if (nextRisk >= 80 && roll < (nextRisk * 0.002)) {
        soundManager.playShortCircuitSpark();
        setPhoneState(prev => ({
          ...prev,
          shortCircuitOccurred: true,
          extraExpenses: prev.extraExpenses + 15,
          isPoweredOn: false,
        }));
        setFeedbackMsg('⚡💥 SCINTILLA E CORTO CIRCUITO! Tensione attiva su circuito aperto! (-€15 spese ricambi extra). Spegni sempre prima di operare!');
      } else {
        setFeedbackMsg(`⚡ ATTENZIONE: Il dispositivo è ancora ACCESO! Rischio cortocircuito durante ${actionName}: ${Math.round(nextRisk)}%. Spegnilo dal pulsante in alto per azzerare il pericolo!`);
      }
    }
  };

  // 1) Progressive screw unscrewing: each tick adds +20%, disappearing at 100%
  const handleScrewProgressTick = (screwId: string) => {
    if (screwId === 'speaker_screw' || screwId.startsWith('motherboard_screw_')) {
      if (!phoneState.screenRemoved) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Viti interne nascoste! Rimuovi prima completamente lo schermo per scoprire le viti.');
        return;
      }
      if (orientation === 'back') {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Vista posteriore! Le viti della scheda madre e dell\'altoparlante sono situate sul lato anteriore interno.');
        return;
      }
    }

    // Only internal conductive screws carry a slight short circuit risk if touched while the board is live.
    // External bottom screws on the chassis have 0 risk since the phone is fully closed!
    if (screwId.startsWith('motherboard_screw_') || screwId === 'speaker_screw') {
      checkAndTriggerShortCircuit(0.1, 'lo smontaggio di viti interne');
    }
    soundManager.playScrewdriver();

    setPhoneState(prev => {
      const current = prev.screwProgress?.[screwId] || 0;
      const boost = stats.purchasedUpgrades.includes('tool_titanium_screws') ? 50 : 25;
      const next = current + boost >= 95 ? 100 : Math.min(100, current + boost);

      const updatedScrews = { ...prev.screwProgress, [screwId]: next };
      let updatedBottomRemoved = prev.bottomScrewsRemoved;
      let updatedSpeakerUnscrewed = prev.speakerUnscrewed;
      let updatedMotherboardScrews = prev.motherboardScrewsRemoved;
      let updatedDisassembled = [...prev.disassembledParts];

      if (next >= 100) {
        soundManager.playMagneticSnap();

        if (screwId.startsWith('bottom_screw_')) {
          const sName = screwId === 'bottom_screw_0' ? 'Vite Torx Inferiore Sinistra P2' : 'Vite Torx Inferiore Destra P2';
          if (!updatedDisassembled.some(d => d.id === screwId)) {
            updatedDisassembled.push({
              id: screwId,
              name: sName,
              category: 'screw',
              icon: '🔩',
              timeRemoved: 'Ora',
              conditionPercent: 98,
            });
          }

          const s0 = updatedScrews['bottom_screw_0'] >= 100;
          const s1 = updatedScrews['bottom_screw_1'] >= 100;
          if (s0 && s1) {
            updatedBottomRemoved = true;
            setFeedbackMsg('✅ Entrambe le viti Torx inferiori rimosse al 100% e riposte nel vassoio! Ora scalda l\'adesivo.');
          } else {
            setFeedbackMsg(`${sName} svitata al 100% e riposta nel dispenser!`);
          }
        } else if (screwId.startsWith('watch_screw_') || screwId.startsWith('tablet_corner_') || screwId.startsWith('laptop_grid_') || screwId.startsWith('console_corner_')) {
          const sName = `Vite di Fissaggio (${screwId})`;
          if (!updatedDisassembled.some(d => d.id === screwId)) {
            updatedDisassembled.push({
              id: screwId,
              name: sName,
              category: 'screw',
              icon: '🔩',
              timeRemoved: 'Ora',
              conditionPercent: 98,
            });
          }
          const allKeys = Object.keys(updatedScrews);
          const outerKeys = allKeys.filter(k => !k.includes('motherboard') && k !== 'speaker_screw' && k !== 'internal_bracket_screw' && !k.includes('heatsink'));
          const allOuterRemoved = outerKeys.every(k => (updatedScrews[k] || 0) >= 100);
          if (allOuterRemoved) {
            updatedBottomRemoved = true;
            setFeedbackMsg('✅ Tutte le viti esterne rimosse al 100%! Ora scalda l\'adesivo o apri la scocca.');
          } else {
            setFeedbackMsg(`Vite ${screwId} svitata al 100%!`);
          }
        } else if (screwId === 'speaker_screw' || screwId === 'internal_bracket_screw') {
          updatedSpeakerUnscrewed = true;
          if (!updatedDisassembled.some(d => d.id === 'speaker_screw')) {
            updatedDisassembled.push({
              id: 'speaker_screw',
              name: 'Vite Staffa Altoparlante Phillips #00',
              category: 'screw',
              icon: '🪛',
              timeRemoved: 'Ora',
              conditionPercent: 96,
            });
          }
          setFeedbackMsg('🔊 Vite altoparlante svitata al 100%! Ora estrai il modulo acustico con le pinzette.');
        } else if (screwId.startsWith('motherboard_screw_')) {
          const mbIdx = screwId.replace('motherboard_screw_', '');
          if (!updatedDisassembled.some(d => d.id === screwId)) {
            updatedDisassembled.push({
              id: screwId,
              name: `Vite Scheda Madre #${Number(mbIdx) + 1}`,
              category: 'screw',
              icon: '🔩',
              timeRemoved: 'Ora',
              conditionPercent: 95,
            });
          }
          const mb0 = (updatedScrews['motherboard_screw_0'] || 0) >= 100;
          const mb1 = (updatedScrews['motherboard_screw_1'] || 0) >= 100;
          if (mb0 && mb1) {
            updatedMotherboardScrews = true;
            setFeedbackMsg('✅ Viti scheda madre rimosse al 100%! Ora puoi sollevare la scheda madre con le pinzette.');
          } else {
            setFeedbackMsg(`Vite scheda madre #${Number(mbIdx) + 1} svitata al 100%!`);
          }
        }
      } else {
        setFeedbackMsg(`Svitatura in corso: ${next}%...`);
      }

      return {
        ...prev,
        screwProgress: updatedScrews,
        bottomScrewsRemoved: updatedBottomRemoved,
        speakerUnscrewed: updatedSpeakerUnscrewed,
        motherboardScrewsRemoved: updatedMotherboardScrews,
        disassembledParts: updatedDisassembled,
      };
    });
  };

  // 4) Heat gun: 4-zone organic continuous progressive heating (Request 6)
  const handleHeatSweep = (
    zone: 'top' | 'right' | 'bottom' | 'left',
    weights?: { top: number; right: number; bottom: number; left: number }
  ) => {
    setPhoneState(prev => {
      const boost = stats.purchasedUpgrades.includes('tool_laser_heatgun') ? 2.4 : 1.5;

      let updatedZones = { ...prev.heatZones };
      if (weights) {
        // Continuous organic thermal diffusion: all 4 sides receive heat, closest receives strongest boost
        updatedZones = {
          top: Math.min(100, Number((prev.heatZones.top + (weights.top * boost * 2.2) + 0.35).toFixed(1))),
          bottom: Math.min(100, Number((prev.heatZones.bottom + (weights.bottom * boost * 2.2) + 0.35).toFixed(1))),
          left: Math.min(100, Number((prev.heatZones.left + (weights.left * boost * 2.2) + 0.35).toFixed(1))),
          right: Math.min(100, Number((prev.heatZones.right + (weights.right * boost * 2.2) + 0.35).toFixed(1))),
        };
      } else {
        const currentZoneProg = prev.heatZones[zone] || 0;
        const nextZoneProg = Math.min(100, Number((currentZoneProg + boost).toFixed(1)));
        updatedZones = { ...prev.heatZones, [zone]: nextZoneProg };
      }

      const avgProg = Math.round(
        (updatedZones.top + updatedZones.right + updatedZones.bottom + updatedZones.left) / 4
      );

      const newTemp = Math.min(130, Math.round(25 + avgProg * 0.65 + (prev.temperature > 85 ? 1 : 0.5)));
      const isOverheated = newTemp > 105;
      const minZone = Math.min(updatedZones.top, updatedZones.right, updatedZones.bottom, updatedZones.left);
      const isHeated = avgProg >= 80 && minZone >= 60;

      // Automatically enable backCoverHeated if heating on the back
      const isBack = prev.currentSide === 'back' || orientation === 'back';
      const backHeated = isBack ? (avgProg >= 50 || prev.backCoverHeated) : prev.backCoverHeated;

      let thermalDamage = prev.thermalDamageOccurred;
      let extraExp = prev.extraExpenses;

      if (newTemp >= 115 && !prev.thermalDamageOccurred) {
        thermalDamage = true;
        extraExp += 15;
        soundManager.playBuzzerTriple();
        setFeedbackMsg('🔥 DANNO DA SURRISCALDAMENTO! Temperatura oltre 115°C! Bruciatura termica sul display (-€15 di spesa extra)!');
      } else if (isOverheated && !prev.isOverheated) {
        soundManager.playBuzzer();
        setFeedbackMsg('🔥 ATTENZIONE! Sovratemperatura (oltre 105°C): allontana la pistola per evitare danni termici!');
      } else if (isHeated && !prev.isHeated) {
        setFeedbackMsg(
          isBack
            ? '✨ Adesivo scocca posteriore ammorbidito! Ora usa la lastra (plettro) sui bordi per aprirla.'
            : '✨ Colla ammorbidita al 100% in modo uniforme sui 4 lati! Ora applica la ventosa con doppio click al centro.'
        );
      } else {
        setFeedbackMsg(`Riscaldamento omogeneo: Sup ${Math.round(updatedZones.top)}% | Des ${Math.round(updatedZones.right)}% | Inf ${Math.round(updatedZones.bottom)}% | Sin ${Math.round(updatedZones.left)}% | Temp: ${newTemp}°C`);
      }

      return {
        ...prev,
        heatZones: updatedZones,
        heatProgress: avgProg,
        temperature: newTemp,
        isHeated,
        backCoverHeated: backHeated,
        isOverheated,
        thermalDamageOccurred: thermalDamage,
        extraExpenses: extraExp,
      };
    });
  };

  // 5) Suction cup double-click attachment
  const handleSuction = () => {
    if (selectedTool !== 'suction') {
      setFeedbackMsg('⚠️ Seleziona la Ventosa prima di applicarla!');
      return;
    }
    if (!phoneState.isHeated) {
      setFeedbackMsg('⚠️ La colla è ancora fredda! Scalda prima tutti e 4 i bordi con la pistola termica.');
      return;
    }
    soundManager.playSuctionPop();
    setPhoneState(prev => ({ ...prev, suctionApplied: true }));
    setSelectedTool('pry_pick'); // Switch tool immediately so suction cup disappears from mouse pointer!
    setFeedbackMsg('🧲 Ventosa fissata al centro dello schermo! Ora usa la lastra (plettro) per fare leva sui bordi.');
  };

  // 6) Progressive prying with plettro (0% -> 100%) on front OR back!
  const handlePry = () => {
    if (selectedTool !== 'pry_pick') {
      setFeedbackMsg('⚠️ Seleziona la Lastra (plettro di plastica) per fare leva!');
      return;
    }

    checkAndTriggerShortCircuit();

    if (phoneState.currentSide === 'front' && orientation === 'front') {
      if (!phoneState.suctionApplied) {
        setFeedbackMsg('⚠️ Fissa prima la ventosa al centro con doppio click per fare presa!');
        return;
      }

      soundManager.playPry();
      const newProg = Math.min(100, phoneState.screenPryProgress + 20);

      setPhoneState(prev => {
        let updatedParts = [...prev.disassembledParts];
        if (newProg >= 100 && !updatedParts.some(p => p.id === 'old_screen')) {
          updatedParts.push({
            id: 'old_screen',
            name: 'Display OLED Frantumato',
            category: 'screen',
            icon: '📱',
            timeRemoved: 'Ora',
            conditionPercent: customer.issueType === 'broken_screen' ? 0 : 70,
            canReplace: true,
            replacementCost: 18,
            newPartName: 'Display OLED Crystal 120Hz OEM',
            partKey: 'screen',
            isReplaced: prev.newScreenInstalled,
          });
          setFeedbackMsg('✨ Display sollevato e riposto nel vassoio! Stato componente: ' + (customer.issueType === 'broken_screen' ? '0% (Frantumato)' : '70%') + '. Clicca su Sostituisci per montare il nuovo schermo OEM.');
        } else {
          setFeedbackMsg(`Taglio adesivo con la lastra: ${newProg}%... Continua a scorrere sui bordi.`);
        }

        return {
          ...prev,
          screenPryProgress: newProg,
          screenRemoved: newProg >= 100,
          disassembledParts: updatedParts,
        };
      });
    } else {
      // 3) PRYING REAR BACK COVER!
      if (!phoneState.backCoverHeated && phoneState.heatProgress < 40) {
        setFeedbackMsg('⚠️ Scalda prima la scocca posteriore con la pistola termica!');
        return;
      }
      soundManager.playPry();
      const currentPry = phoneState.backCoverPryProgress || 0;
      const nextPry = Math.min(100, currentPry + 25);

      setPhoneState(prev => {
        let updatedParts = [...prev.disassembledParts];
        if (nextPry >= 100 && !updatedParts.some(p => p.id === 'back_cover')) {
          updatedParts.push({
            id: 'back_cover',
            name: customer.issueType === 'cracked_back_glass' ? 'Cover Posteriore Frantumata' : 'Scocca Posteriore',
            category: 'bracket',
            icon: '🛡️',
            timeRemoved: 'Ora',
            conditionPercent: customer.issueType === 'cracked_back_glass' ? 0 : 85,
            canReplace: true,
            replacementCost: 12,
            newPartName: 'Cover Posteriore Crystal Glass OEM',
            partKey: 'back_cover',
            isReplaced: prev.backGlassReplaced,
          });
        }
        return {
          ...prev,
          backCoverPryProgress: nextPry,
          backCoverPried: nextPry >= 100,
          backCoverRemoved: nextPry >= 100,
          disassembledParts: updatedParts,
        };
      });

      if (nextPry >= 100) {
        if (customer.issueType === 'bad_camera' || customer.issueType === 'combo_water_camera') {
          setFeedbackMsg('🎉 SCOCCA POSTERIORE APERTA! 👉 Prossimo passo: usa le Pinzette per staccare il connettore flex arancione della fotocamera ed estrarla.');
        } else if (customer.issueType === 'wifi_antenna_cut') {
          setFeedbackMsg('🎉 SCOCCA POSTERIORE APERTA! 👉 Prossimo passo: usa le Pinzette sul cerchio pulsante in alto a destra per ricollegare il cavo coassiale Wi-Fi.');
        } else if (customer.issueType === 'wireless_charging_burnt') {
          setFeedbackMsg('🎉 SCOCCA POSTERIORE APERTA! 👉 Prossimo passo: usa le Pinzette sulla bobina centrale per rimuoverla e installarne una nuova.');
        } else if (customer.issueType === 'cracked_back_glass') {
          setFeedbackMsg('🎉 SCOCCA POSTERIORE FRANTUMATA RIMOSSA! 👉 Clicca su "Sostituisci" nella barra laterale destra per montare la nuova Cover OEM.');
        } else {
          setFeedbackMsg('🎉 SCOCCA POSTERIORE APERTA! Componenti interni visibili: procedi con la riparazione tramite Pinzette o ricambi.');
        }
      } else {
        setFeedbackMsg(`✂️ Apertura scocca posteriore con la lastra: ${nextPry}%... Continua a scorrere sui bordi per tagliare tutta la colla.`);
      }
    }
  };

  // 6) Air dryer shrinking water droplets progressively with realistic heat diffusion
  const handleDryerSweep = (dropId: string) => {
    soundManager.playWaterPuff();

    setPhoneState(prev => {
      const isAmbient = dropId === 'ambient';
      const updatedDrops = prev.waterDroplets.map(d => {
        if (d.isCleaned) return d;

        // Direct hit gets full heat evaporation, other nearby drops get diffuse ambient evaporation
        const isTarget = d.id === dropId;
        const reduction = isTarget ? 2.2 : isAmbient ? 0.8 : 0.55;
        const nextSize = Math.max(0, d.size - reduction);

        return {
          ...d,
          size: nextSize,
          isCleaned: nextSize <= 1.2,
        };
      });

      const remaining = updatedDrops.filter(d => !d.isCleaned).length;
      if (remaining === 0) {
        setFeedbackMsg('💧 Tutte le gocce d\'acqua sono state evaporate al 100%! Circuito asciutto, ora pulisci l\'ossido con lo spazzolino.');
      } else {
        setFeedbackMsg(`Asciugatura in corso: getto d'aria calda attivo con diffusione termica (${remaining} gocce rimaste).`);
      }

      return {
        ...prev,
        waterDroplets: updatedDrops,
      };
    });
  };

  // 7) Brush sweep on oxidation spots
  const handleBrushSweep = (spotId: string) => {
    soundManager.playBrushScrub();

    setPhoneState(prev => {
      const updatedSpots = prev.oxidationSpots.map(s => {
        if (s.id === spotId) {
          return { ...s, cleaned: true };
        }
        return s;
      });

      const remaining = updatedSpots.filter(s => !s.cleaned).length;
      const allDone = remaining === 0;

      if (allDone) {
        setFeedbackMsg('✨ Ossidazione e calcare rimossi completamente con alcool IPA! Circuito sanificato al 100%.');
      } else {
        setFeedbackMsg(`Spazzolatura con IPA in corso: ${remaining} macchie di corrosione rimanenti.`);
      }

      return {
        ...prev,
        oxidationSpots: updatedSpots,
        motherboardCleaned: allDone,
      };
    });
  };

  // Deeper internal disassembly: Battery extraction
  const handleBatteryDisconnect = () => {
    const isFrontOpen = Boolean(phoneState.screenRemoved || (phoneState.screenPryProgress || 0) >= 100);
    if (!isFrontOpen) {
      soundManager.playBuzzer();
      setFeedbackMsg('🚫 Telefono chiuso! Devi prima svitare le viti inferiori e aprire il display per accedere alla batteria.');
      return;
    }
    if (selectedTool !== 'tweezers') {
      setFeedbackMsg('⚠️ Usa le Pinzette per sganciare il cavo flex della batteria!');
      return;
    }
    soundManager.playTweezers();
    setPhoneState(prev => ({ ...prev, batteryDisconnected: true }));
    setFeedbackMsg('🔌 Connettore batteria staccato! Ora estrai la batteria gonfia.');
  };

  const handleBatteryRemove = () => {
    const isFrontOpen = Boolean(phoneState.screenRemoved || (phoneState.screenPryProgress || 0) >= 100);
    if (!isFrontOpen) {
      soundManager.playBuzzer();
      setFeedbackMsg('🚫 Telefono chiuso! Devi prima svitare le viti inferiori e aprire il display per accedere alla batteria.');
      return;
    }
    if (selectedTool !== 'tweezers') {
      setFeedbackMsg('⚠️ Usa le Pinzette per rimuovere la batteria!');
      return;
    }
    soundManager.playPry();
    setPhoneState(prev => {
      const updatedParts = [...prev.disassembledParts];
      if (!updatedParts.some(p => p.id === 'old_battery')) {
        updatedParts.push({
          id: 'old_battery',
          name: 'Batteria Gonfia Li-Ion',
          category: 'battery',
          icon: '🔋',
          timeRemoved: 'Ora',
          conditionPercent: customer.issueType === 'dead_battery' ? 12 : 65,
          canReplace: true,
          replacementCost: 14,
          newPartName: 'Nuova Batteria Li-Ion 4500mAh OEM',
          partKey: 'battery',
          isReplaced: prev.newBatteryInstalled,
        });
      }
      return {
        ...prev,
        oldBatteryRemoved: true,
        disassembledParts: updatedParts,
      };
    });
    setFeedbackMsg('🔋 Vecchia batteria rimossa e collocata nel vassoio! Stato: ' + (customer.issueType === 'dead_battery' ? '12% (Degradata/Gonfia)' : '65%') + '. Clicca su Sostituisci per installare la nuova batteria OEM.');
  };

  // Speaker extraction
  const handleSpeakerRemove = () => {
    const isFrontOpen = Boolean(phoneState.screenRemoved || (phoneState.screenPryProgress || 0) >= 100);
    if (!isFrontOpen) {
      soundManager.playBuzzer();
      setFeedbackMsg('🚫 Telefono chiuso! Non puoi estrarre la staffa altoparlante a telefono chiuso. Svita le viti Torx inferiori e apri il display.');
      return;
    }
    if (selectedTool !== 'tweezers') {
      setFeedbackMsg('⚠️ Usa le Pinzette per estrarre l\'altoparlante!');
      return;
    }
    soundManager.playTweezers();
    setPhoneState(prev => {
      const updatedParts = [...prev.disassembledParts];
      if (!updatedParts.some(p => p.id === 'old_speaker')) {
        updatedParts.push({
          id: 'old_speaker',
          name: 'Altoparlante Membrana Spaccata',
          category: 'speaker',
          icon: '🔊',
          timeRemoved: 'Ora',
          conditionPercent: customer.issueType === 'broken_speaker' ? 8 : 70,
          canReplace: true,
          replacementCost: 10,
          newPartName: 'Nuovo Altoparlante Stereo HD OEM',
          partKey: 'speaker',
          isReplaced: prev.newSpeakerInstalled,
        });
      }
      return {
        ...prev,
        oldSpeakerRemoved: true,
        disassembledParts: updatedParts,
      };
    });
    setFeedbackMsg('🔊 Vecchio altoparlante rimosso nel vassoio! Stato: ' + (customer.issueType === 'broken_speaker' ? '8% (Membrana Rotta)' : '70%') + '. Clicca su Sostituisci per montare il nuovo ricambio.');
  };

  // 3) CAMERA EXTRACTION & INSTALLATION (Crystal clear sequence!)
  const handleCameraExtract = () => {
    const isBackOpen = Boolean(phoneState.backCoverRemoved || (phoneState.backCoverPryProgress || 0) >= 100);
    if (!isBackOpen) {
      soundManager.playBuzzer();
      setFeedbackMsg('🚫 Scocca posteriore chiusa! Devi prima scaldare e aprire la scocca posteriore per accedere al modulo fotocamera.');
      return;
    }
    if (selectedTool !== 'tweezers') {
      setFeedbackMsg('⚠️ Usa le Pinzette per estrarre il modulo fotocamere!');
      return;
    }
    soundManager.playTweezers();
    setPhoneState(prev => {
      const updatedParts = [...prev.disassembledParts];
      if (!updatedParts.some(p => p.id === 'old_cameras')) {
        updatedParts.push({
          id: 'old_cameras',
          name: 'Modulo Tripla Fotocamera Rotto',
          category: 'camera',
          icon: '📷',
          timeRemoved: 'Ora',
          conditionPercent: customer.issueType === 'bad_camera' || customer.issueType === 'combo_water_camera' ? 0 : 80,
          canReplace: true,
          replacementCost: 16,
          newPartName: 'Nuova Tripla Fotocamera 4K OEM',
          partKey: 'camera',
          isReplaced: prev.newCameraInstalled,
        });
      }
      return {
        ...prev,
        oldCameraRemoved: true,
        disassembledParts: updatedParts,
      };
    });
    setFeedbackMsg('📷 Vecchio modulo fotocamere estratto nel vassoio! Stato: ' + (customer.issueType === 'bad_camera' || customer.issueType === 'combo_water_camera' ? '0% (Sensore Guasto)' : '80%') + '. Clicca su Sostituisci per montare la nuova fotocamera 4K.');
  };

  // Spare parts installation
  const handleBatteryInstall = () => {
    soundManager.playInstall();
    setPhoneState(prev => ({ ...prev, newBatteryInstalled: true }));
    setFeedbackMsg('🔋 Nuova Batteria Li-Ion 4500mAh installata e fissata!');
  };

  const handleScreenInstall = () => {
    soundManager.playInstall();
    setPhoneState(prev => ({
      ...prev,
      newScreenInstalled: true,
      fingerprintCalibrated: true,
      burnInScreenReplaced: true,
    }));
    setFeedbackMsg('📱 Nuovo Display OLED montato con successo sul telaio!');
  };

  const handleCameraInstall = () => {
    soundManager.playInstall();
    setPhoneState(prev => ({ ...prev, newCameraInstalled: true }));
    setFeedbackMsg('✨ Nuova Tripla Fotocamera 4K installata con successo nello slot!');
  };

  const handleSpeakerInstall = () => {
    soundManager.playInstall();
    soundManager.playSpeakerTest();
    setPhoneState(prev => ({ ...prev, newSpeakerInstalled: true }));
    setFeedbackMsg('🔊 Nuovo Altoparlante HD montato! Test audio superato!');
  };

  const handleScrapeOldPaste = () => {
    soundManager.playPry();
    setPhoneState(prev => ({ ...prev, oldPasteScraped: true }));
    setFeedbackMsg('🧼 Vecchia pasta termica rimossa! Ora applica la nuova pasta con la siringa.');
  };

  const handleApplyNewPaste = () => {
    soundManager.playThermalPaste();
    setPhoneState(prev => ({ ...prev, newPasteApplied: true }));
    setFeedbackMsg('❄️ Nuova pasta termica fresca al diamante applicata sulla CPU!');
  };

  const handleRunSoftwareFlash = () => {
    soundManager.playCyberFlash();
    setFeedbackMsg('⏳ Riscrizione firmware e decrittazione bootloader in corso...');
    setTimeout(() => {
      soundManager.playCyberFlash();
      setPhoneState(prev => ({
        ...prev,
        softwareFlashProgress: 100,
        firmwareRestored: true,
        malwareCleaned: true,
      }));
      setFeedbackMsg('🎉 Firmware ripristinato e malware bonificato! Il sistema è tornato pulito e fluido!');
    }, 1200);
  };

  // Motherboard extraction
  const handleMotherboardExtract = () => {
    soundManager.playPry();
    setPhoneState(prev => {
      const updatedParts = [...prev.disassembledParts];
      if (!updatedParts.some(p => p.id === 'motherboard')) {
        const cond = prev.motherboardCleaned ? 100 : (customer.issueType === 'water_damage' || customer.issueType === 'combo_water_camera') ? 35 : 90;
        updatedParts.push({
          id: 'motherboard',
          name: 'Scheda Madre Logic Board',
          category: 'board',
          icon: '💾',
          timeRemoved: 'Ora',
          conditionPercent: cond,
          canReplace: false,
        });
      }
      return {
        ...prev,
        motherboardExtracted: true,
        disassembledParts: updatedParts,
      };
    });
    setFeedbackMsg('💾 Scheda madre estratta dal telaio e riposta nel vassoio!');
  };

  // 1-Click Direct Replace Part with OEM Component (Request 1 & 2)
  const handleDirectReplacePart = (partId: string) => {
    const part = phoneState.disassembledParts.find(p => p.id === partId);
    if (!part || part.isReplaced) return;

    soundManager.playInstall();
    soundManager.playCustomerChirp(1.2);

    const cost = part.replacementCost || 14;

    setPhoneState(prev => {
      let nextScreenInstalled = prev.newScreenInstalled;
      let nextBatteryInstalled = prev.newBatteryInstalled;
      let nextCameraInstalled = prev.newCameraInstalled;
      let nextSpeakerInstalled = prev.newSpeakerInstalled;
      let nextBackGlassReplaced = prev.backGlassReplaced;
      let nextChargingPortReplaced = prev.chargingPortReplaced;
      let nextWirelessCoilReplaced = prev.wirelessCoilReplaced;
      let nextWifiAntennaConnected = prev.wifiAntennaConnected;
      let nextTapticReplaced = prev.tapticReplaced;
      let nextSelfieCameraReplaced = prev.selfieCameraReplaced;

      if (part.partKey === 'screen' || part.category === 'screen' || part.id === 'old_screen') {
        nextScreenInstalled = true;
      } else if (part.partKey === 'battery' || part.category === 'battery' || part.id === 'old_battery') {
        nextBatteryInstalled = true;
      } else if (part.partKey === 'camera' || part.category === 'camera' || part.id === 'old_cameras') {
        nextCameraInstalled = true;
      } else if (part.partKey === 'speaker' || part.category === 'speaker' || part.id === 'old_speaker') {
        nextSpeakerInstalled = true;
      } else if (part.partKey === 'back_cover' || part.id === 'back_cover') {
        nextBackGlassReplaced = true;
      } else if (part.partKey === 'charging_port') {
        nextChargingPortReplaced = true;
      } else if (part.partKey === 'wireless_coil' || part.id === 'old_wireless_coil') {
        nextWirelessCoilReplaced = true;
      } else if (part.partKey === 'wifi_antenna' || part.id === 'old_wifi_antenna') {
        nextWifiAntennaConnected = true;
      } else if (part.partKey === 'taptic') {
        nextTapticReplaced = true;
      } else if (part.partKey === 'selfie_camera') {
        nextSelfieCameraReplaced = true;
      }

      const updatedParts = prev.disassembledParts.map(p => {
        if (p.id === partId) {
          return {
            ...p,
            isReplaced: true,
            conditionPercent: 100,
            name: p.newPartName ? `${p.newPartName} (Montato)` : `${p.name} (Nuovo OEM)`,
            icon: '✨',
          };
        }
        return p;
      });

      return {
        ...prev,
        newScreenInstalled: nextScreenInstalled,
        newBatteryInstalled: nextBatteryInstalled,
        newCameraInstalled: nextCameraInstalled,
        newSpeakerInstalled: nextSpeakerInstalled,
        backGlassReplaced: nextBackGlassReplaced,
        chargingPortReplaced: nextChargingPortReplaced,
        wirelessCoilReplaced: nextWirelessCoilReplaced,
        wifiAntennaConnected: nextWifiAntennaConnected,
        tapticReplaced: nextTapticReplaced,
        selfieCameraReplaced: nextSelfieCameraReplaced,
        fingerprintCalibrated: nextScreenInstalled ? true : prev.fingerprintCalibrated,
        burnInScreenReplaced: nextScreenInstalled ? true : prev.burnInScreenReplaced,
        disassembledParts: updatedParts,
        extraExpenses: prev.extraExpenses + cost,
      };
    });

    setFeedbackMsg(`✨ Sostituzione completata! Installato ${part.newPartName || part.name} (-€${cost} dal compenso). Condizione del componente portata al 100%!`);
  };

  // 10) AUTO "RIMONTA TUTTO" (Always accessible simulation of 5 min at 2x accelerated speed)
  const handleAutoReassemble = () => {
    setIsAutoReassembling(true);
    setReassembleProgress(0);
    setReassembleStepDesc('Ricollegamento connettori e cavi flex (Simulazione 05:00 min)...');
    soundManager.playRatchetSpin();

    const sequence = [
      { prog: 20, desc: 'Ricollegamento moduli interni e cavi flex... (04:15 min)', sound: () => soundManager.playTweezers() },
      { prog: 45, desc: 'Fissaggio scheda madre e serraggio viti interne... (03:00 min)', sound: () => soundManager.playScrewdriver() },
      { prog: 70, desc: 'Allineamento scocca e ripristino guarnizione adesiva... (01:45 min)', sound: () => soundManager.playPry() },
      { prog: 90, desc: 'Serraggio viti Torx P2 inferiori con cacciavite... (00:30 min)', sound: () => soundManager.playScrewdriver() },
      { prog: 100, desc: 'Chiusura e collaudo sigillatura completati (5 min simulati)!', sound: () => soundManager.playInstall() },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < sequence.length) {
        const s = sequence[currentStep];
        setReassembleProgress(s.prog);
        setReassembleStepDesc(s.desc);
        s.sound();
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAutoReassembling(false);
          soundManager.playInstall();
          setPhoneState(prev => ({
            ...prev,
            isClosed: true,
            bottomScrewsRemoved: false,
            screwsReinstalled: true,
            screenRemoved: false,
            screenPryProgress: 0,
            backCoverRemoved: false,
            backCoverPryProgress: 0,
            suctionApplied: false,
            motherboardExtracted: false,
            motherboardScrewsRemoved: false,
            currentSide: 'front',
          }));
          setFeedbackMsg('🔒 RIMONTAGGIO COMPLETATO (5 min simulati)! Telefono sigillato e pronto per il collaudo o la riconsegna!');
        }, 400);
      }
    }, 500);
  };

  const handleManualClose = () => {
    soundManager.playInstall();
    setPhoneState(prev => ({
      ...prev,
      isClosed: true,
      currentSide: 'front',
      screenRemoved: false,
      screenPryProgress: 0,
      backCoverRemoved: false,
      backCoverPryProgress: 0,
    }));
    setFeedbackMsg('🔒 Telefono sigillato manualmente! Puoi eseguire il collaudo o procedere alla riconsegna.');
  };

  const handlePowerOn = () => {
    const score = getRepairCompletionScore();
    if (score === 100) {
      soundManager.playBootJingle();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
      setFeedbackMsg('🎉 TELEFONO ACCESO! Riparazione riuscita al 100%! Ora puoi riconsegnarlo e incassare il compenso.');
    } else {
      soundManager.playBuzzer();
      setFeedbackMsg(`⚠️ TELEFONO ACCESO, MA NON RIPARATO (${score}%)! Il guasto iniziale persiste. Se lo riconsegni ora il cliente NON ti pagherà e lascerà recensione negativa!`);
    }
    setPhoneState(prev => ({
      ...prev,
      isPoweredOn: true,
      isRepaired: score === 100,
    }));
    setIsTimerRunning(false);
  };

  // 3D Part click routing
  const handle3DPartClick = (partName: string) => {
    // Global Cyber-Dongle click: plugs into the USB-C port or toggles connection!
    if (selectedTool === 'cyber_dongle') {
      if (
        partName === 'usb_port' ||
        customer.issueType === 'software_glitch' ||
        customer.issueType === 'malware_spyware_wipe' ||
        customer.issueType === 'boot_loop_corrupt_nand' ||
        partName === 'chassis' ||
        partName === 'screen_glass' ||
        partName === 'back_cover'
      ) {
        if (!phoneState.dongleConnected) {
          soundManager.playMagneticSnap();
          soundManager.playCyberFlash();
          setPhoneState(prev => ({ ...prev, dongleConnected: true }));
          setFeedbackMsg('💻 Cyber-Dongle USB collegato con successo alla porta USB-C! Modalità FastBoot EDL stabilita. Ora apri il terminale per eseguire il Flash.');
        } else {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, dongleConnected: false }));
          setFeedbackMsg('🔌 Cyber-Dongle USB scollegato dalla porta.');
        }
        return;
      }
    }

    const isFrontOpen = Boolean(phoneState.screenRemoved || (phoneState.screenPryProgress || 0) >= 100);
    const isBackOpen = Boolean(phoneState.backCoverRemoved || (phoneState.backCoverPryProgress || 0) >= 100);

    // Front screen opening actions & closed-phone block for front internals
    if (!isFrontOpen && orientation !== 'back') {
      const isInternalTarget = (
        partName === 'battery' ||
        partName === 'battery_connector' ||
        partName === 'motherboard' ||
        partName === 'cpu_chip' ||
        partName === 'heat_pipe' ||
        partName === 'thermal_paste_spot' ||
        partName === 'speaker_unit' ||
        partName === 'speaker_screw' ||
        partName.startsWith('motherboard_screw') ||
        partName === 'wifi_antenna' ||
        partName === 'taptic_engine' ||
        partName.startsWith('water_drop') ||
        partName.startsWith('oxidation_spot')
      );

      if (isInternalTarget || partName === 'screen_glass' || partName === 'chassis') {
        if (selectedTool === 'heatgun') {
          handleHeatSweep('bottom');
          return;
        } else if (selectedTool === 'suction') {
          handleSuction();
          return;
        } else if (selectedTool === 'pry_pick') {
          handlePry();
          return;
        } else if (selectedTool === 'part_screen') {
          handleScreenInstall();
          return;
        } else if (partName.startsWith('bottom_screw') && selectedTool === 'screwdriver') {
          handleScrewProgressTick(partName);
          return;
        } else if (isInternalTarget) {
          soundManager.playBuzzer();
          setFeedbackMsg('🚫 Telefono chiuso! Non puoi rilevare né smontare la staffa dell\'altoparlante o componenti interni a telefono chiuso. Svita prima le viti Torx inferiori e apri il display!');
          return;
        }
      }
    }

    if (partName.startsWith('bottom_screw')) {
      handleScrewProgressTick(partName);
    } else if (partName === 'screen_glass' || partName === 'chassis') {
      if (selectedTool === 'heatgun') handleHeatSweep('bottom');
      else if (selectedTool === 'suction') handleSuction();
      else if (selectedTool === 'pry_pick') handlePry();
      else if (selectedTool === 'part_screen') handleScreenInstall();
    } else if (partName === 'back_cover' || (!isBackOpen && orientation === 'back')) {
      if (selectedTool === 'heatgun') handleHeatSweep('bottom');
      else if (selectedTool === 'pry_pick') handlePry();
      else if (selectedTool === 'part_back_cover') {
        soundManager.playInstall();
        setPhoneState(prev => ({ ...prev, backGlassReplaced: true, backCoverRemoved: false }));
        setFeedbackMsg('✨ Nuova Scocca Posteriore in Vetro lucida installata con successo!');
      }
    } else if (
      partName === 'camera_connector' ||
      partName === 'camera_flex' ||
      partName.startsWith('camera_lens') ||
      partName === 'camera_island'
    ) {
      if (!isBackOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Scocca posteriore chiusa! Apri prima la scocca posteriore per accedere alle fotocamere.');
        return;
      }
      // 3) CAMERA INTERACTION VIA PINZETTE OR SPARE PART
      if (selectedTool === 'tweezers') {
        if (!phoneState.cameraDisconnected) {
          setPhoneState(prev => ({ ...prev, cameraDisconnected: true }));
          soundManager.playTweezers();
          setFeedbackMsg('🔌 Cavo flex fotocamera sganciato! Clicca di nuovo sul modulo fotocamera con le Pinzette per estrarlo nel dispenser.');
        } else if (!phoneState.oldCameraRemoved) {
          handleCameraExtract();
        }
      } else if (selectedTool === 'part_camera' || (phoneState.oldCameraRemoved && !phoneState.newCameraInstalled)) {
        handleCameraInstall();
      }
    } else if (partName === 'camera_socket') {
      if (!isBackOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Scocca posteriore chiusa!');
        return;
      }
      if (selectedTool === 'part_camera' || !phoneState.newCameraInstalled) {
        handleCameraInstall();
      }
    } else if (partName === 'battery' || partName === 'battery_connector') {
      if (!isFrontOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Telefono chiuso! Non puoi accedere alla batteria a telefono chiuso.');
        return;
      }
      if (!phoneState.batteryDisconnected) handleBatteryDisconnect();
      else if (!phoneState.oldBatteryRemoved) handleBatteryRemove();
      else if (!phoneState.newBatteryInstalled) handleBatteryInstall();
    } else if (partName.startsWith('water_drop')) {
      if (!isFrontOpen) return;
      const dropId = partName.replace('water_drop_', '');
      handleDryerSweep(dropId);
    } else if (partName.startsWith('oxidation_spot_')) {
      if (!isFrontOpen) return;
      const spotId = partName.replace('oxidation_spot_', '');
      handleBrushSweep(spotId);
    } else if (partName === 'cpu_chip' || partName === 'thermal_paste_spot' || partName === 'heat_pipe') {
      if (!isFrontOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Telefono chiuso! Non puoi accedere al processore a telefono chiuso.');
        return;
      }
      if (selectedTool === 'pry_pick') {
        handleScrapeOldPaste();
      } else if (selectedTool === 'thermal_paste') {
        if (!phoneState.oldPasteScraped && customer.issueType === 'overheating_cpu') {
          soundManager.playPry();
          setPhoneState(prev => ({ ...prev, oldPasteScraped: true }));
        }
        handleApplyNewPaste();
      } else {
        if (!phoneState.oldPasteScraped) handleScrapeOldPaste();
        else if (!phoneState.newPasteApplied) handleApplyNewPaste();
      }
    } else if (partName.startsWith('motherboard_screw')) {
      if (!isFrontOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Telefono chiuso! Non puoi accedere alle viti della scheda madre a telefono chiuso.');
        return;
      }
      handleScrewProgressTick(partName);
    } else if (partName === 'motherboard') {
      if (!isFrontOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Telefono chiuso! Non puoi accedere alla scheda madre a telefono chiuso.');
        return;
      }
      if (selectedTool === 'tweezers') {
        if (!phoneState.motherboardScrewsRemoved) {
          soundManager.playBuzzer();
          setFeedbackMsg('⚠️ Svita prima le 2 viti della scheda madre con il cacciavite Torx!');
        } else if (!phoneState.batteryDisconnected) {
          soundManager.playBuzzer();
          setFeedbackMsg('⚠️ Scollega prima il connettore della batteria per sicurezza!');
        } else if (!phoneState.motherboardExtracted) {
          handleMotherboardExtract();
        }
      }
    } else if (partName === 'speaker_unit') {
      if (!isFrontOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Telefono chiuso! Non puoi rilevare né smontare la staffa dell\'altoparlante a telefono chiuso.');
        return;
      }
      if (!phoneState.speakerUnscrewed) {
        if (selectedTool === 'screwdriver') {
          handleScrewProgressTick('speaker_screw');
        } else {
          soundManager.playBuzzer();
          setFeedbackMsg('⚠️ Svita prima la vite di fissaggio della staffa altoparlante con il Cacciavite!');
        }
      } else if (!phoneState.oldSpeakerRemoved) {
        if (selectedTool !== 'tweezers') {
          soundManager.playBuzzer();
          setFeedbackMsg('⚠️ Usa le Pinzette per rimuovere l\'altoparlante dal telaio!');
          return;
        }
        handleSpeakerRemove();
      } else if (!phoneState.newSpeakerInstalled) {
        handleSpeakerInstall();
      }
    } else if (partName === 'speaker_screw') {
      if (!isFrontOpen) {
        soundManager.playBuzzer();
        setFeedbackMsg('🚫 Telefono chiuso! Non puoi accedere alla vite dell\'altoparlante a telefono chiuso.');
        return;
      }
      handleScrewProgressTick('speaker_screw');
    } else if (partName === 'power_button') {
      if (customer.issueType === 'stuck_volume_buttons' && (selectedTool === 'tweezers' || selectedTool === 'pry_pick' || selectedTool === 'brush')) {
        soundManager.playPry();
        soundManager.playMagneticSnap();
        setPhoneState(prev => ({ ...prev, volumeButtonsFixed: true }));
        setFeedbackMsg('🔘 Tasti laterali sbloccati, puliti e riallineati con un click scattante!');
        return;
      }
      if (phoneState.isPoweredOn) {
        handleSafePowerOff();
      } else {
        if (phoneState.batteryDisconnected || (phoneState.oldBatteryRemoved && !phoneState.newBatteryInstalled)) {
          soundManager.playBuzzer();
          setFeedbackMsg('⚠️ Impossibile accendere: la batteria è scollegata o rimossa! Ricollega o sostituisci la batteria per alimentarlo.');
        } else {
          soundManager.playPowerToggle();
          setPhoneState(prev => ({
            ...prev,
            isPoweredOn: true,
            isSafelyPoweredOff: false,
          }));
          setFeedbackMsg('⚡ Dispositivo acceso con successo! Schermo e interfaccia attivi.');
        }
      }
    }
    // 10 Nuovi Guasti part clicks
    else if (partName === 'charging_port' || partName === 'usb_port' || partName === 'sub_board') {
      if (customer.issueType === 'charging_port_dirt') {
        if (selectedTool === 'brush' || selectedTool === 'tweezers') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, chargingPortCleaned: true }));
          setFeedbackMsg('🔌 Presa USB-C ripulita a fondo da tutta la polvere e la lanugine! Ricarica ripristinata.');
        }
      } else if (customer.issueType === 'broken_charging_port') {
        if (selectedTool === 'tweezers' && !phoneState.chargingPortReplaced) {
          soundManager.playTweezers();
          setFeedbackMsg('🔌 Connettore USB-C guasto rimosso! Seleziona Nuova Sub-Board USB-C per montarla.');
        } else if (selectedTool === 'part_charging_port') {
          soundManager.playInstall();
          setPhoneState(prev => ({ ...prev, chargingPortReplaced: true }));
          setFeedbackMsg('⚡ Nuova porta di ricarica rapida USB-C 65W installata con successo!');
        }
      }
    } else if (partName === 'earpiece_speaker') {
      if (selectedTool === 'brush' || selectedTool === 'air_dryer') {
        soundManager.playBrushScrub();
        setPhoneState(prev => ({ ...prev, earpieceCleaned: true }));
        setFeedbackMsg('👂 Griglia capsula auricolare liberata e deostruita! Audio chiamate perfetto.');
      }
    } else if (partName === 'wireless_coil') {
      if (selectedTool === 'tweezers' || selectedTool === 'pry_pick' || !selectedTool || selectedTool === 'none') {
        soundManager.playTweezers();
        setPhoneState(prev => {
          const updatedParts = [...prev.disassembledParts];
          if (!updatedParts.some(p => p.id === 'old_wireless_coil')) {
            updatedParts.push({
              id: 'old_wireless_coil',
              name: customer.issueType === 'wireless_charging_burnt' ? 'Bobina Qi Wireless Bruciata' : 'Bobina Qi Wireless',
              category: 'coil',
              icon: '🧲',
              timeRemoved: 'Ora',
              conditionPercent: customer.issueType === 'wireless_charging_burnt' ? 0 : 85,
              canReplace: true,
              replacementCost: 15,
              newPartName: 'Nuova Bobina Qi MagSafe OEM',
              partKey: 'wireless_coil',
              isReplaced: prev.wirelessCoilReplaced,
            });
          }
          return {
            ...prev,
            wirelessCoilRemoved: true,
            disassembledParts: updatedParts,
          };
        });
        setFeedbackMsg('🧲 Bobina Qi Wireless smontata e riposta nel vassoio! Clicca su Sostituisci per montare il nuovo ricambio OEM.');
      } else if (selectedTool === 'part_wireless_coil') {
        soundManager.playInstall();
        setPhoneState(prev => ({
          ...prev,
          wirelessCoilReplaced: true,
          wirelessCoilRemoved: true,
        }));
        setFeedbackMsg('🔋 Nuova bobina di ricarica magnetica Qi installata con successo!');
      } else {
        setFeedbackMsg('🧲 Usa le Pinzette o il Plettro per sollevare e rimuovere la bobina Qi Wireless!');
      }
    } else if (partName.startsWith('volume_') || partName === 'side_buttons') {
      if (selectedTool === 'tweezers' || selectedTool === 'pry_pick' || selectedTool === 'brush' || selectedTool === 'none') {
        soundManager.playPry();
        soundManager.playMagneticSnap();
        setPhoneState(prev => ({ ...prev, volumeButtonsFixed: true }));
        setFeedbackMsg('🔘 Bilanciere volume (+/-) sbloccato, pulito e riallineato con un click scattante!');
      } else {
        setFeedbackMsg('🔘 Usa le Pinzette, il Plettro o lo Spazzolino per fare leva e sbloccare i tasti volume!');
      }
    } else if (partName === 'wifi_antenna' || partName === 'antenna_cable') {
      if (selectedTool === 'tweezers') {
        soundManager.playTweezers();
        setPhoneState(prev => {
          const updatedParts = [...prev.disassembledParts];
          if (!updatedParts.some(p => p.id === 'old_wifi_antenna')) {
            updatedParts.push({
              id: 'old_wifi_antenna',
              name: customer.issueType === 'wifi_antenna_cut' ? 'Antenna Wi-Fi 7 / 5G Tranciata' : 'Modulo Antenna Wi-Fi 5G',
              category: 'board',
              icon: '📡',
              timeRemoved: 'Ora',
              conditionPercent: customer.issueType === 'wifi_antenna_cut' ? 0 : 90,
              canReplace: true,
              replacementCost: 12,
              newPartName: 'Nuova Antenna Wi-Fi 7 / 5G MIMO OEM',
              partKey: 'wifi_antenna',
              isReplaced: prev.wifiAntennaConnected,
            });
          }
          return {
            ...prev,
            wifiAntennaRemoved: true,
            wifiAntennaConnected: true,
            disassembledParts: updatedParts,
          };
        });
        setFeedbackMsg('📡 Antenna Wi-Fi smontata con le pinzette e riposta nel vassoio! Clicca su Sostituisci per ricollegarla o montare il nuovo ricambio.');
      } else if (selectedTool === 'part_wifi_antenna') {
        soundManager.playInstall();
        setPhoneState(prev => ({ ...prev, wifiAntennaConnected: true }));
        setFeedbackMsg('📡 Cavo coassiale antenna Wi-Fi e 5G ricollegato solidamente!');
      }
    } else if (partName === 'selfie_camera' || partName === 'front_camera') {
      if (selectedTool === 'tweezers') {
        soundManager.playTweezers();
        setFeedbackMsg('🤳 Fotocamera frontale selfie opaca rimossa! Installa la nuova fotocamera.');
      } else if (selectedTool === 'part_selfie_camera') {
        soundManager.playInstall();
        setPhoneState(prev => ({ ...prev, selfieCameraReplaced: true }));
        setFeedbackMsg('🤳 Nuova fotocamera selfie 4K cristallina montata sul telaio!');
      }
    }
    // +22 Nuovi Casi di Intervento
    else if (partName === 'motherboard' || partName === 'cpu_chip' || partName === 'chassis') {
      if (customer.issueType === 'damaged_flex_cable') {
        if (selectedTool === 'tweezers' || selectedTool === 'pry_pick' || selectedTool === 'part_flex_cable') {
          soundManager.playInstall();
          setPhoneState(prev => ({ ...prev, flexCableRepaired: true }));
          setFeedbackMsg('✨ Cavo flat FPC sostituito e agganciato con precisione! Display e connessioni perfette.');
        }
      } else if (customer.issueType === 'bent_frame_chassis') {
        if (selectedTool === 'pry_pick' || selectedTool === 'heatgun') {
          soundManager.playPry();
          setPhoneState(prev => ({ ...prev, frameStraightened: true }));
          setFeedbackMsg('🛠️ Telaio e scocca raddrizzati su dima di precisione! Planarità perfetta.');
        }
      } else if (customer.issueType === 'face_id_sensor_dirty') {
        if (selectedTool === 'brush' || selectedTool === 'air_dryer') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, faceIdCleaned: true }));
          setFeedbackMsg('👁️ Modulo proiettore di punti Face ID pulito e lucidato con IPA! Riconoscimento 3D ripristinato.');
        }
      } else if (customer.issueType === 'fingerprint_sensor_fail') {
        if (selectedTool === 'cyber_dongle' || selectedTool === 'tweezers') {
          soundManager.playCyberFlash();
          setPhoneState(prev => ({ ...prev, fingerprintCalibrated: true }));
          setFeedbackMsg('🎯 Sensore impronte ricalibrato con patch firmware di diagnostica!');
        }
      } else if (customer.issueType === 'sim_tray_jammed') {
        if (selectedTool === 'tweezers' || selectedTool === 'pry_pick' || selectedTool === 'part_sim_tray') {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, simTrayFixed: true }));
          setFeedbackMsg('📇 Frammento estratto dal lettore SIM e carrellino riallineato!');
        }
      } else if (customer.issueType === 'nfc_antenna_broken') {
        if (selectedTool === 'tweezers' || selectedTool === 'part_nfc_antenna') {
          soundManager.playInstall();
          setPhoneState(prev => ({ ...prev, nfcAntennaFixed: true }));
          setFeedbackMsg('💳 Modulo antenna NFC sostituito! Pagamenti contactless POS di nuovo attivi.');
        }
      } else if (customer.issueType === 'battery_connector_loose') {
        if (selectedTool === 'tweezers' || selectedTool === 'screwdriver') {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, batteryConnectorFixed: true }));
          setFeedbackMsg('🔋 Clip connettore batteria serrata e bloccata con staffa di sicurezza!');
        }
      } else if (customer.issueType === 'proximity_sensor_glitch') {
        if (selectedTool === 'brush' || selectedTool === 'air_dryer') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, proximitySensorFixed: true }));
          setFeedbackMsg('📱 Sensore di prossimità pulito e schermatura ottica riposizionata!');
        }
      } else if (customer.issueType === 'rear_mic_noise_cancel') {
        if (selectedTool === 'brush' || selectedTool === 'air_dryer') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, rearMicCleaned: true }));
          setFeedbackMsg('🎙️ Microfono posteriore di cancellazione rumore pulito e sturato!');
        }
      } else if (customer.issueType === 'thermal_throttle_heatsink') {
        if (selectedTool === 'thermal_paste' || selectedTool === 'part_heatsink' || selectedTool === 'tweezers') {
          soundManager.playThermalPaste();
          setPhoneState(prev => ({ ...prev, heatsinkRepaired: true }));
          setFeedbackMsg('❄️ Pad termico in grafite e camera di vapore riposizionati! Dissipazione termica al 100%.');
        }
      } else if (customer.issueType === 'screen_burn_in_ghost') {
        if (selectedTool === 'part_screen') {
          soundManager.playInstall();
          setPhoneState(prev => ({ ...prev, burnInScreenReplaced: true, newScreenInstalled: true }));
          setFeedbackMsg('📱 Nuovo display OLED Super Retina montato! Zero ghosting o burn-in.');
        }
      } else if (customer.issueType === 'short_circuit_capacitor') {
        if (selectedTool === 'tweezers' || selectedTool === 'brush') {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, capacitorReplaced: true }));
          setFeedbackMsg('⚡ Condensatore SMD in corto rimosso e sostituito! Linea VDD_MAIN isolata e stabile.');
        }
      } else if (customer.issueType === 'power_button_click_broken') {
        if (selectedTool === 'tweezers' || selectedTool === 'part_power_button' || selectedTool === 'pry_pick') {
          soundManager.playPry();
          setPhoneState(prev => ({ ...prev, powerButtonFixed: true }));
          setFeedbackMsg('🔘 Cupola a scatto e tasto Power sostituiti con click tattile scattante!');
        }
      } else if (customer.issueType === 'compass_gyro_drift') {
        if (selectedTool === 'cyber_dongle') {
          soundManager.playCyberFlash();
          setPhoneState(prev => ({ ...prev, gyroCalibrated: true }));
          setFeedbackMsg('🧭 Giroscopio e bussola magnetica ricalibrati con successo!');
        }
      } else if (customer.issueType === 'haptic_driver_ic') {
        if (selectedTool === 'tweezers' || selectedTool === 'part_taptic') {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, hapticIcFixed: true }));
          setFeedbackMsg('🔊 Chip driver amplificatore aptico ripristinato e stabilizzato!');
        }
      } else if (customer.issueType === 'bluetooth_drop_connection') {
        if (selectedTool === 'tweezers' || selectedTool === 'part_wifi_antenna') {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, bluetoothConnected: true }));
          setFeedbackMsg('📶 Micro-cavo antenna Bluetooth reinnestato nel socket con chiusura ermetica!');
        }
      } else if (customer.issueType === 'foldable_hinge_dirt') {
        if (selectedTool === 'brush' || selectedTool === 'air_dryer') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, hingeCleaned: true }));
          setFeedbackMsg('📱 Cerniera del pieghevole decontaminata e lubrificata con olio sintetico!');
        }
      } else if (customer.issueType === 'front_ambient_light_sensor') {
        if (selectedTool === 'brush' || selectedTool === 'cyber_dongle') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, ambientSensorFixed: true }));
          setFeedbackMsg('☀️ Sensore di luce ambientale deostruito e calibrazione True Tone ripristinata!');
        }
      } else if (customer.issueType === 'headphone_jack_stuck') {
        if (selectedTool === 'tweezers' || selectedTool === 'pry_pick') {
          soundManager.playTweezers();
          setPhoneState(prev => ({ ...prev, jackCleared: true }));
          setFeedbackMsg('🎧 Moncone jack 3.5mm estratto con successo! Canali audio ripristinati.');
        }
      } else if (customer.issueType === 'laser_autofocus_dirty') {
        if (selectedTool === 'brush' || selectedTool === 'air_dryer') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, laserAutofocusCleaned: true }));
          setFeedbackMsg('🎯 Sensore LiDAR / Laser autofocus pulito e sgrassato! Messa a fuoco fulminea.');
        }
      } else if (customer.issueType === 'corroded_test_points') {
        if (selectedTool === 'brush') {
          soundManager.playBrushScrub();
          setPhoneState(prev => ({ ...prev, corrodedPointsCleaned: true }));
          setFeedbackMsg('🧼 Piazzole di test PCB ripulite da ossidazione e risanate!');
        }
      } else if (customer.issueType === 'boot_loop_corrupt_nand') {
        if (selectedTool === 'cyber_dongle') {
          soundManager.playCyberFlash();
          setPhoneState(prev => ({ ...prev, nandBootFixed: true, firmwareRestored: true }));
          setFeedbackMsg('💻 Tabella di partizione NAND ripristinata e bootloader sbloccato!');
        }
      }
    }
  };

  // 5) REPAIR COMPLETION SCORE CALCULATION (0% to 100%)
  const getRepairCompletionScore = (): number => {
    switch (customer.issueType) {
      case 'broken_screen':
        return phoneState.newScreenInstalled ? 100 : 0;
      case 'dead_battery':
        return phoneState.newBatteryInstalled ? 100 : 0;
      case 'bad_camera':
        return phoneState.newCameraInstalled ? 100 : 0;
      case 'broken_speaker':
        return phoneState.newSpeakerInstalled ? 100 : 0;
      case 'overheating_cpu':
        return phoneState.newPasteApplied ? 100 : 0;
      case 'software_glitch':
        return phoneState.firmwareRestored ? 100 : 0;
      case 'water_damage': {
        const remainingWater = phoneState.waterDroplets?.filter(d => !d.isCleaned && d.size > 0.5).length || 0;
        const remainingOx = phoneState.oxidationSpots?.filter(s => !s.cleaned).length || 0;
        if (remainingWater === 0 && remainingOx === 0) return 100;
        if (remainingWater === 0 || remainingOx === 0) return 50;
        return 0;
      }
      case 'combo_water_camera': {
        const remainingWater = phoneState.waterDroplets?.filter(d => !d.isCleaned && d.size > 0.5).length || 0;
        const camFixed = phoneState.newCameraInstalled;
        if (remainingWater === 0 && camFixed) return 100;
        if (remainingWater === 0 || camFixed) return 50;
        return 0;
      }
      // 10 new types:
      case 'charging_port_dirt':
        return phoneState.chargingPortCleaned ? 100 : 0;
      case 'broken_charging_port':
        return phoneState.chargingPortReplaced ? 100 : 0;
      case 'clogged_earpiece':
        return phoneState.earpieceCleaned ? 100 : 0;
      case 'cracked_back_glass':
        return phoneState.backGlassReplaced ? 100 : 0;
      case 'broken_taptic_engine':
        return phoneState.tapticReplaced ? 100 : 0;
      case 'stuck_volume_buttons':
        return phoneState.volumeButtonsFixed ? 100 : 0;
      case 'wifi_antenna_cut':
        return phoneState.wifiAntennaConnected ? 100 : 0;
      case 'wireless_charging_burnt':
        return phoneState.wirelessCoilReplaced ? 100 : 0;
      case 'damaged_selfie_camera':
        return phoneState.selfieCameraReplaced ? 100 : 0;
      case 'malware_spyware_wipe':
        return phoneState.malwareCleaned || phoneState.firmwareRestored ? 100 : 0;

      // +22 Nuovi Casi
      case 'damaged_flex_cable':
        return phoneState.flexCableRepaired ? 100 : 0;
      case 'bent_frame_chassis':
        return phoneState.frameStraightened ? 100 : 0;
      case 'face_id_sensor_dirty':
        return phoneState.faceIdCleaned ? 100 : 0;
      case 'fingerprint_sensor_fail':
        return (phoneState.fingerprintCalibrated || phoneState.newScreenInstalled) ? 100 : 0;
      case 'sim_tray_jammed':
        return phoneState.simTrayFixed ? 100 : 0;
      case 'nfc_antenna_broken':
        return phoneState.nfcAntennaFixed ? 100 : 0;
      case 'battery_connector_loose':
        return phoneState.batteryConnectorFixed ? 100 : 0;
      case 'proximity_sensor_glitch':
        return phoneState.proximitySensorFixed ? 100 : 0;
      case 'rear_mic_noise_cancel':
        return phoneState.rearMicCleaned ? 100 : 0;
      case 'thermal_throttle_heatsink':
        return phoneState.heatsinkRepaired ? 100 : 0;
      case 'screen_burn_in_ghost':
        return phoneState.burnInScreenReplaced || phoneState.newScreenInstalled ? 100 : 0;
      case 'short_circuit_capacitor':
        return phoneState.capacitorReplaced ? 100 : 0;
      case 'power_button_click_broken':
        return phoneState.powerButtonFixed ? 100 : 0;
      case 'compass_gyro_drift':
        return phoneState.gyroCalibrated ? 100 : 0;
      case 'haptic_driver_ic':
        return phoneState.hapticIcFixed || phoneState.tapticReplaced ? 100 : 0;
      case 'bluetooth_drop_connection':
        return phoneState.bluetoothConnected ? 100 : 0;
      case 'foldable_hinge_dirt':
        return phoneState.hingeCleaned ? 100 : 0;
      case 'front_ambient_light_sensor':
        return phoneState.ambientSensorFixed ? 100 : 0;
      case 'headphone_jack_stuck':
        return phoneState.jackCleared ? 100 : 0;
      case 'laser_autofocus_dirty':
        return phoneState.laserAutofocusCleaned ? 100 : 0;
      case 'corroded_test_points':
        return phoneState.corrodedPointsCleaned ? 100 : 0;
      case 'boot_loop_corrupt_nand':
        return phoneState.nandBootFixed || phoneState.firmwareRestored ? 100 : 0;

      default:
        return phoneState.isRepaired ? 100 : 0;
    }
  };

  const completionScore = getRepairCompletionScore();
  const isFullyRepaired = completionScore === 100;
  const isPartialRepaired = completionScore >= 40 && completionScore < 100;

  // Stato Generale dell'Oggetto (Device Condition %)
  const getDeviceConditionScore = (): number => {
    let score = 45; // baseline

    // Main issue repair status (+35%)
    if (completionScore === 100) score += 35;
    else if (completionScore > 0) score += Math.round(completionScore * 0.3);

    // Any replaced parts with OEM additions (+5% to +10% each)
    if (phoneState.newScreenInstalled) score += 10;
    if (phoneState.newBatteryInstalled) score += 10;
    if (phoneState.newCameraInstalled) score += 10;
    if (phoneState.newSpeakerInstalled) score += 10;
    if (phoneState.backGlassReplaced) score += 10;
    if (phoneState.chargingPortReplaced || phoneState.chargingPortCleaned) score += 10;
    if (phoneState.motherboardCleaned) score += 10;
    if (phoneState.firmwareRestored) score += 10;

    if (phoneState.thermalDamageOccurred) score -= 20;
    if (phoneState.shortCircuitOccurred) score -= 25;

    return Math.min(100, Math.max(10, score));
  };

  const deviceConditionScore = getDeviceConditionScore();

  // Customer satisfaction tip bonus when condition is 100% or very high
  const satisfactionBonus = isFullyRepaired && deviceConditionScore >= 95 ? 18 : isFullyRepaired && deviceConditionScore >= 80 ? 8 : 0;

  // 5) Proportional outcome calculation
  const agreed = contract.agreedPrice || customer.reward;
  const speedBonus = isFullyRepaired && !isLate && timeRemaining > 0 ? 10 : 0;
  const latePenalty = isLate ? 20 : 0;
  const extraExpenses = phoneState.extraExpenses;

  let netEarned = 0;
  let rating = 5;
  let reviewComment = '';

  if (isFullyRepaired) {
    netEarned = Math.max(10, agreed + speedBonus + satisfactionBonus - latePenalty - extraExpenses);
    if (phoneState.shortCircuitOccurred && isLate) {
      rating = 1;
      reviewComment = 'Un disastro totale! Cortocircuito durante la riparazione e ritardo imperdonabile! Mai più!';
    } else if (phoneState.shortCircuitOccurred) {
      rating = 2;
      reviewComment = 'Hanno provocato un cortocircuito a telefono acceso... per fortuna si accende ancora!';
    } else if (isLate) {
      rating = contract.expectationLevel === 'ultra' ? 2 : 3;
      reviewComment = 'Il telefono è riparato ma ci hanno impiegato molto più del tempo promesso, per quel prezzo esigevo puntualità!';
    } else if (agreed > customer.reward * 1.35) {
      rating = 4;
      reviewComment = `Riparazione completata (Stato oggetto: ${deviceConditionScore}%) e nei tempi concordati, anche se il preventivo era decisamente salato!`;
    } else if (deviceConditionScore === 100) {
      rating = 5;
      reviewComment = `Incredibile! Ha sostituito i componenti usurati con ricambi OEM originali, lo stato del dispositivo è al 100% come appena uscito dalla fabbrica! Ho lasciato anche una super mancia! ⭐⭐⭐⭐⭐`;
    } else {
      rating = 5;
      reviewComment = `Riparazione fulminea e impeccabile! Lo smartphone funziona benissimo (Stato: ${deviceConditionScore}%)! Consigliatissimo!`;
    }
  } else if (isPartialRepaired) {
    // Partial: customer pays around 40%
    netEarned = Math.max(0, Math.round(agreed * 0.4) - extraExpenses);
    rating = contract.expectationLevel === 'ultra' ? 1 : 2;
    reviewComment = `Riconsegnato riparato solo in parte (${completionScore}%). Alcuni problemi sono rimasti, delusione per il prezzo concordato!`;
  } else {
    // 0%: €0 payout, 1 star
    netEarned = 0;
    rating = 1;
    reviewComment = `Non è stato in grado di riparare il mio ${customer.phoneModelName} e me lo ha riconsegnato ancora guasto! Soldi e tempo persi!`;
  }

  const handleFinalizeRepair = () => {
    onFinishRepairWithOutcome({
      isSuccess: isFullyRepaired,
      netReward: netEarned,
      rating,
      reviewComment,
      extraExpenses,
      isLate,
    });
  };

  const tools = [
    {
      id: 'screwdriver' as ToolId,
      name: 'Cacciavite Torx',
      desc: 'Aggancio magnetico e svitatura progressiva %',
      icon: Wrench,
      badge: 'Prog %',
    },
    {
      id: 'heatgun' as ToolId,
      name: 'Pistola Termica',
      desc: 'Riscaldamento a 4 zone e controllo termico',
      icon: Flame,
      badge: 'Termica',
    },
    {
      id: 'suction' as ToolId,
      name: 'Ventosa a Vuoto',
      desc: 'Doppio click al centro per fissare sul display',
      icon: CircleDot,
      badge: 'Doppio Click',
    },
    {
      id: 'pry_pick' as ToolId,
      name: 'Lastra / Plettro',
      desc: 'Apertura perimetrale progressiva 0-100%',
      icon: Scissors,
      badge: 'Leva %',
    },
    {
      id: 'tweezers' as ToolId,
      name: 'Pinzette ESD',
      desc: 'Sgancia flex, estrae fotocamere, batteria e moduli',
      icon: ChevronRight,
      badge: 'Titanio',
    },
    {
      id: 'cyber_dongle' as ToolId,
      name: 'Cyber-Dongle USB',
      desc: 'Flash firmware e rimozione malware',
      icon: Cpu,
      badge: 'FastBoot',
    },
    {
      id: 'thermal_paste' as ToolId,
      name: 'Siringa Pasta Termica',
      desc: 'Riapplica pasta fresca su CPU surriscaldata',
      icon: Pipette,
      badge: 'Diamante',
    },
    {
      id: 'air_dryer' as ToolId,
      name: 'Asciugatore Termico',
      desc: 'Evapora e riduce progressivamente le gocce',
      icon: Wind,
      badge: 'Hot Air',
    },
    {
      id: 'brush' as ToolId,
      name: 'Spazzolino + IPA',
      desc: 'Pulisce ossido, polvere USB e corrosione',
      icon: Brush,
      badge: 'Alcool 99%',
    },
    {
      id: 'solder_iron' as ToolId,
      name: 'Saldatore a Stagno 450°C',
      desc: 'Salda chip BGA, modem 5G e condensatori SMD',
      icon: Zap,
      badge: 'Stagno 450°',
    },
    {
      id: 'multimeter' as ToolId,
      name: 'Multimetro Digitale',
      desc: 'Testa continuità piazzole e corti circuiti VDD',
      icon: Activity,
      badge: 'Test Ohms',
    },
    {
      id: 'ultrasonic_tank' as ToolId,
      name: 'Vasca Ultrasuoni Pro',
      desc: 'Lavaggio profondo per ossido e schede madri',
      icon: Sparkles,
      badge: 'Sonico',
    },
  ];

  const spareParts = [
    {
      id: 'part_screen' as ToolId,
      name: 'Schermo OLED Crystal',
      tag: '120Hz Super Retina',
      show: customer.issueType === 'broken_screen',
      done: phoneState.newScreenInstalled,
    },
    {
      id: 'part_camera' as ToolId,
      name: 'Tripla Fotocamera 4K',
      tag: 'Ottiche Macro + OIS',
      show: customer.issueType === 'bad_camera' || customer.issueType === 'combo_water_camera',
      done: phoneState.newCameraInstalled,
    },
    {
      id: 'part_battery' as ToolId,
      name: 'Nuova Batteria Li-Ion',
      tag: '4500mAh 100% Salvezza',
      show: customer.issueType === 'dead_battery',
      done: phoneState.newBatteryInstalled,
    },
    {
      id: 'part_speaker' as ToolId,
      name: 'Nuovo Altoparlante HD',
      tag: 'Cassa Acustica Hi-Fi',
      show: customer.issueType === 'broken_speaker',
      done: phoneState.newSpeakerInstalled,
    },
    // Nuovi Ricambi
    {
      id: 'part_charging_port' as ToolId,
      name: 'Sub-Board USB-C Nuova',
      tag: 'Connettore Ricarica 65W',
      show: customer.issueType === 'broken_charging_port',
      done: phoneState.chargingPortReplaced,
    },
    {
      id: 'part_back_cover' as ToolId,
      name: 'Nuova Cover Posteriore Vetro',
      tag: 'Vetro Gorilla Glass 7',
      show: customer.issueType === 'cracked_back_glass',
      done: phoneState.backGlassReplaced,
    },
    {
      id: 'part_taptic' as ToolId,
      name: 'Nuovo Motore Aptico',
      tag: 'Vibrazione Taptic Haptic',
      show: customer.issueType === 'broken_taptic_engine',
      done: phoneState.tapticReplaced,
    },
    {
      id: 'part_wifi_antenna' as ToolId,
      name: 'Cavo Antenna 5G / Wi-Fi',
      tag: 'Coassiale Gigabit',
      show: customer.issueType === 'wifi_antenna_cut',
      done: phoneState.wifiAntennaConnected,
    },
    {
      id: 'part_wireless_coil' as ToolId,
      name: 'Nuova Bobina Qi Wireless',
      tag: 'Ricarica Magnetica 15W',
      show: customer.issueType === 'wireless_charging_burnt',
      done: phoneState.wirelessCoilReplaced,
    },
    {
      id: 'part_selfie_camera' as ToolId,
      name: 'Nuova Selfie Camera 4K',
      tag: 'Sensore Frontale HDR',
      show: customer.issueType === 'damaged_selfie_camera',
      done: phoneState.selfieCameraReplaced,
    },
    {
      id: 'part_flex_cable' as ToolId,
      name: 'Cavo Flat FPC Ricambio',
      tag: 'Connettori Dorati OEM',
      show: customer.issueType === 'damaged_flex_cable',
      done: phoneState.flexCableRepaired,
    },
    {
      id: 'part_nfc_antenna' as ToolId,
      name: 'Modulo Antenna NFC',
      tag: 'Pagamenti Contactless POS',
      show: customer.issueType === 'nfc_antenna_broken',
      done: phoneState.nfcAntennaFixed,
    },
    {
      id: 'part_heatsink' as ToolId,
      name: 'Camera di Vapore Rame',
      tag: 'Pad Grafite Dissipazione',
      show: customer.issueType === 'thermal_throttle_heatsink',
      done: phoneState.heatsinkRepaired,
    },
    {
      id: 'part_power_button' as ToolId,
      name: 'Tasto Power & Flex',
      tag: 'Cupola a Scatto Tattile',
      show: customer.issueType === 'power_button_click_broken',
      done: phoneState.powerButtonFixed,
    },
  ].filter(sp => sp.show);

  // Dynamically compute exact tutorial instructions (Hierarchical disassembly with component, location, tool & pro-tip)
  const getTutorialStep = (): {
    text: string;
    hint: string;
    tool: ToolId;
    component: string;
    location: string;
    toolName: string;
    proTip: string;
  } => {
    if (phoneState.isPoweredOn && !phoneState.isSafelyPoweredOff && !phoneState.isClosed) {
      return {
        text: '⚠️ Pericolo cortocircuito: il telefono è ancora acceso!',
        hint: 'Premi il tasto "Spegni Telefono" o il pulsante Power laterale per lavorare in sicurezza.',
        tool: 'none',
        component: 'Circuito di Alimentazione & Batteria',
        location: 'Tasto Power laterale destro o schermo frontale',
        toolName: 'Pulsante "Spegni Telefono" (Mani libere)',
        proTip: 'Lavorare con il circuito alimentato rischia di bruciare il circuito integrato PMIC o causare cortocircuiti irreversibili.',
      };
    }

    // 1. REAR-ACCESSIBLE REPAIRS (Camera, Rear Glass, Qi Coil)
    if (
      customer.issueType === 'bad_camera' ||
      customer.issueType === 'cracked_back_glass' ||
      customer.issueType === 'wireless_charging_burnt'
    ) {
      if (orientation !== 'back') {
        return {
          text: 'Capovolgi il telefono sulla Vista Retro per accedere alla scocca posteriore',
          hint: 'Clicca su "🔄 Retro (Cam)" nella barra in basso.',
          tool: 'none',
          component: 'Scocca & Vetro Posteriore',
          location: 'Retro del dispositivo',
          toolName: 'Pulsante Orientamento "🔄 Retro (Cam)"',
          proTip: 'Tutte le riparazioni di fotocamere posteriori, vetro posteriore e bobina Qi si eseguono partendo dal retro.',
        };
      }
      if (!phoneState.backCoverHeated && phoneState.heatProgress < 50) {
        return {
          text: 'Scalda l\'adesivo della scocca posteriore con la Pistola Termica',
          hint: 'Seleziona la Pistola Termica e passa il getto d\'aria calda sui bordi posteriori.',
          tool: 'heatgun',
          component: 'Guarnizione Adesiva Sigillante Scocca',
          location: 'Tutto il perimetro esterno della scocca posteriore',
          toolName: 'Pistola Termica Industriale',
          proTip: 'Mantieni il flusso d\'aria in movimento continuo per riscaldare la colla senza bruciare la finitura del telaio.',
        };
      }
      if (!phoneState.backCoverRemoved) {
        return {
          text: `Fai leva con la Lastra (Plettro) per aprire la scocca posteriore (${phoneState.backCoverPryProgress || 0}%)`,
          hint: 'Seleziona la Lastra / Plettro e scorri sui bordi posteriori o premi "Fai Leva" fino al 100%!',
          tool: 'pry_pick',
          component: 'Scocca Posteriore in Vetro/Metallo',
          location: 'Fessura perimetrale della scocca posteriore',
          toolName: 'Lastra / Plettro di Plastica ESD',
          proTip: 'Fai leva delicatamente senza inserire la punta per più di 3mm per non tranciare il flex della bobina wireless sottostante.',
        };
      }

      // Inside Rear
      if (customer.issueType === 'bad_camera') {
        if (!phoneState.cameraDisconnected) {
          return {
            text: 'Stacca il cavo flex della fotocamera con le Pinzette ESD',
            hint: 'Seleziona le Pinzette ESD e clicca sul connettore arancione del flex evidenziato in azzurro.',
            tool: 'tweezers',
            component: 'Connettore Flex Fotocamera Posteriore',
            location: 'In alto a destra sulla scheda madre (accanto alle fotocamere)',
            toolName: 'Pinzette ESD a Becco Fine',
            proTip: 'Solleva il connettore con un movimento verticale per non piegare i micro-pin dorati sulla Logic Board.',
          };
        }
        if (!phoneState.oldCameraRemoved) {
          return {
            text: 'Estrai il modulo fotocamere danneggiate con le Pinzette ESD',
            hint: 'Clicca con le Pinzette sopra le tre fotocamere per estrarle nel vassoio.',
            tool: 'tweezers',
            component: 'Modulo Tripla Fotocamera Danneggiata',
            location: 'Vano alloggiamento lenti nell\'angolo superiore posteriore',
            toolName: 'Pinzette ESD a Becco Fine',
            proTip: 'Rimuovi il gruppo ottico guasto per liberare l\'alloggiamento e preparare il montaggio del ricambio OEM.',
          };
        }
        if (!phoneState.newCameraInstalled) {
          return {
            text: 'Installa la Nuova Tripla Fotocamera 4K OEM',
            hint: 'Nel pannello a destra clicca "Sostituisci" sulla riga Tripla Fotocamera 4K.',
            tool: 'part_camera',
            component: 'Nuova Tripla Fotocamera 4K OEM',
            location: 'Alloggiamento lenti superiore posteriore',
            toolName: 'Vassoio Ricambi: Nuova Fotocamera 4K',
            proTip: 'Le nuove ottiche OEM includono autofocus laser e stabilizzazione ottica OIS pre-calibrata.',
          };
        }
      }

      if (customer.issueType === 'cracked_back_glass' && !phoneState.backGlassReplaced) {
        return {
          text: 'Monta la Nuova Cover Posteriore in Vetro Crystal OEM',
          hint: 'Clicca "Sostituisci" nella scheda componenti a destra per installare la nuova cover.',
          tool: 'part_back_cover',
          component: 'Cover Posteriore in Vetro Crystal OEM',
          location: 'Superficie posteriore dell\'intero telaio',
          toolName: 'Vassoio Ricambi: Nuova Cover Posteriore',
          proTip: 'La cover nuova include guarnizione perimetrale impermeabile pre-applicata per ripristinare la certificazione IP68.',
        };
      }

      if (customer.issueType === 'wireless_charging_burnt') {
        if (!phoneState.wirelessCoilRemoved) {
          return {
            text: 'Smonta la bobina Qi di ricarica wireless bruciata',
            hint: 'Clicca sulla bobina rotonda centrale con le Pinzette ESD o il Plettro per rimuoverla nel vassoio.',
            tool: 'tweezers',
            component: 'Bobina Ricarica Wireless Qi Bruciata',
            location: 'Centro esatto del vano posteriore (anello dorato/scuro)',
            toolName: 'Pinzette ESD o Lastra Plettro',
            proTip: 'Stacca delicatamente il pad adesivo termoconduttivo della bobina per non deformare la schermatura metallica sottostante.',
          };
        }
        if (!phoneState.wirelessCoilReplaced) {
          return {
            text: 'Monta la Nuova Bobina Qi MagSafe OEM',
            hint: 'Clicca "Sostituisci" nella scheda ricambi a destra per installare la nuova bobina Qi.',
            tool: 'part_wireless_coil',
            component: 'Nuova Bobina Qi MagSafe 15W OEM',
            location: 'Alloggiamento circolare centrale nel vano posteriore',
            toolName: 'Vassoio Ricambi: Nuova Bobina Qi',
            proTip: 'Include magneti al neodimio allineati per garantire ricarica magnetica rapida e sensore termico NTC integrato.',
          };
        }
      }
    }

    // 2. EXTERNAL / NON-DISASSEMBLY REPAIRS
    if (customer.issueType === 'charging_port_dirt') {
      if (orientation !== 'side_bottom') {
        return {
          text: 'Passa alla vista Bordo Inferiore per ispezionare la presa USB-C',
          hint: 'Clicca su "🔌 Bordo USB" nella barra in basso.',
          tool: 'none',
          component: 'Presa Connettore USB-C Dock',
          location: 'Bordo inferiore del dispositivo',
          toolName: 'Pulsante Orientamento "🔌 Bordo USB"',
          proTip: 'La vista dal bordo permette di guardare direttamente all\'interno della porta per rimuovere i detriti incastrati.',
        };
      }
      if (!phoneState.chargingPortCleaned) {
        return {
          text: 'Rimuovi sporco e polvere dalla presa USB-C con Spazzolino + IPA o Pinzette',
          hint: 'Seleziona Spazzolino + IPA o Pinzette e clicca sulla porta di ricarica in basso.',
          tool: 'brush',
          component: 'Pin di Contatto Presa USB-C',
          location: 'Bordo inferiore, interno fessura porta USB-C',
          toolName: 'Spazzolino ESD + Alcool IPA 99%',
          proTip: 'L\'alcool isopropilico al 99% discioglie lanugine e residui grassi evaporando in pochi secondi senza ossidare i contatti.',
        };
      }
    }

    if (customer.issueType === 'stuck_volume_buttons') {
      if (!phoneState.volumeButtonsFixed) {
        return {
          text: 'Sblocca e riallinea i bilancieri volume con le Pinzette o la Lastra',
          hint: 'Passa alla vista Lato Power/Tasti e clicca sui pulsanti bloccati.',
          tool: 'tweezers',
          component: 'Bilancieri Volume Meccanici (+/-)',
          location: 'Bordo laterale del telaio',
          toolName: 'Pinzette ESD o Lastra Plettro',
          proTip: 'Spesso i pulsanti si incastrano per deformazioni del bordo: una leggera leva riallinea la cupola a scatto interna.',
        };
      }
    }

    if (customer.issueType === 'clogged_earpiece') {
      if (!phoneState.earpieceCleaned) {
        return {
          text: 'Pulisci la griglia auricolare superiore con Spazzolino + IPA',
          hint: 'Seleziona Spazzolino + IPA e pulisci la fessura acustica in alto.',
          tool: 'brush',
          component: 'Micro-Griglia Capsula Auricolare',
          location: 'Bordo superiore frontale (sopra lo schermo)',
          toolName: 'Spazzolino ESD + Alcool IPA 99%',
          proTip: 'Non inserire punte metalliche acuminate che rischierebbero di forare la delicatissima membrana dell\'altoparlante chiamate.',
        };
      }
    }

    if (customer.issueType === 'software_glitch' || customer.issueType === 'malware_spyware_wipe') {
      if (!phoneState.dongleConnected) {
        return {
          text: 'Collega il Cyber-Dongle USB per avviare il FastBoot',
          hint: 'Seleziona il Cyber-Dongle USB dalla barra sinistra e collegalo alla porta USB.',
          tool: 'cyber_dongle',
          component: 'Porta USB-C & Bootloader Hardware',
          location: 'Porta USB-C di ricarica/dati',
          toolName: 'Cyber-Dongle USB Hardware',
          proTip: 'Il dongle hardware inietta i pacchetti EDL di ripristino bypassando i loop di blocco del sistema operativo.',
        };
      }
      if (!phoneState.firmwareRestored && !phoneState.malwareCleaned) {
        return {
          text: 'Esegui il Flash del Firmware nel Cyber-Terminal',
          hint: 'Clicca sul pulsante verde "Esegui Flash Firmware" nel terminale.',
          tool: 'none',
          component: 'Partizione NAND Flash di Sistema',
          location: 'Terminale diagnostico a schermo',
          toolName: 'Pulsante Terminale "Esegui Flash Firmware"',
          proTip: 'La riscrittura a basso livello della partizione sistema elimina malware annidati nel bootloader.',
        };
      }
    }

    // 3. FRONT INVASIVE DISASSEMBLY (MUST OPEN FIRST IF CLOSED!)
    if (!phoneState.screenRemoved && customer.issueType !== 'charging_port_dirt' && customer.issueType !== 'stuck_volume_buttons' && customer.issueType !== 'clogged_earpiece' && customer.issueType !== 'software_glitch' && customer.issueType !== 'malware_spyware_wipe' && customer.issueType !== 'bad_camera' && customer.issueType !== 'cracked_back_glass' && customer.issueType !== 'wireless_charging_burnt') {
      if (!phoneState.bottomScrewsRemoved) {
        const s0 = (phoneState.screwProgress?.['bottom_screw_0'] || 0) < 100;
        const s1 = (phoneState.screwProgress?.['bottom_screw_1'] || 0) < 100;
        return {
          text: `Svita le viti Torx inferiori P2 con il Cacciavite (${s0 && s1 ? '2 da svitare' : '1 rimanente'})`,
          hint: 'Seleziona il Cacciavite Torx, posizionati sopra la vite inferiore e tieni premuto fino al 100%.',
          tool: 'screwdriver',
          component: 'Viti Torx Pentalobe P2 di Chiusura',
          location: 'Bordo inferiore, ai lati della presa USB-C',
          toolName: 'Cacciavite Torx Magnetico P2',
          proTip: 'Tieni il cacciavite dritto e perpendicolare: le viti pentalobe hanno scanalature da 0.8mm facili da spanare se inclinate.',
        };
      }

      if (!phoneState.isHeated) {
        return {
          text: `Scalda uniformemente i 4 bordi con la Pistola Termica (${phoneState.heatProgress}% completato)`,
          hint: 'Passa la pistola sui bordi mantenendo la temperatura tra 75°C e 90°C finché la colla si ammorbidisce.',
          tool: 'heatgun',
          component: 'Guarnizione Adesiva Sigillante Display',
          location: 'Perimetro esterno lungo tutti e 4 i bordi dello schermo',
          toolName: 'Pistola Termica Industriale',
          proTip: 'Non superare mai i 105°C: il calore eccessivo può bruciare i fosfori dei pixel OLED provocando aloni indelebili.',
        };
      }

      if (!phoneState.suctionApplied) {
        return {
          text: 'Fissa la Ventosa a vuoto sul vetro dello schermo',
          hint: 'Seleziona la Ventosa e fai DOPPIO CLICK sul bersaglio circolare al centro dello schermo.',
          tool: 'suction',
          component: 'Vetro Frontale dello Schermo',
          location: 'Centro esatto del display (cerchio bersaglio)',
          toolName: 'Ventosa a Vuoto Meccanica',
          proTip: 'Fissando la ventosa al centro si applica una trazione bilanciata che separa il vetro dal telaio senza fessurarlo.',
        };
      }

      if (phoneState.screenPryProgress < 100) {
        return {
          text: `Fai leva con la Lastra (Plettro) per tagliare l'adesivo e sollevare lo schermo (${phoneState.screenPryProgress}%)`,
          hint: 'Seleziona la Lastra / Plettro e scorri lungo i bordi per completare l\'apertura al 100%!',
          tool: 'pry_pick',
          component: 'Adesivo Sigillante Display Waterproof',
          location: 'Intercapedine tra cornice display e telaio in alluminio',
          toolName: 'Lastra / Plettro di Plastica ESD',
          proTip: 'Scorri lentamente lungo i bordi laterali: non affondare oltre 3mm per non tagliare le piattine flex del touchscreen.',
        };
      }
    }

    // 4. FRONT INTERNAL REPAIRS (ONLY ONCE SCREEN IS FULLY REMOVED!)
    if (phoneState.screenRemoved) {
      if (customer.issueType === 'wifi_antenna_cut' && !phoneState.wifiAntennaConnected) {
        return {
          text: 'Ricollega il cavo dell\'antenna Wi-Fi/5G con le Pinzette ESD',
          hint: 'Seleziona le Pinzette ESD e clicca sul connettore coassiale antenna sulla scheda madre.',
          tool: 'tweezers',
          component: 'Cavo Coassiale Antenna Wi-Fi 7 / 5G',
          location: 'Bordo destro della Logic Board (cavo con terminale dorato)',
          toolName: 'Pinzette ESD a Becco Fine',
          proTip: 'Posiziona il micro-connettore dorato perfettamente perpendicolare allo zoccolo prima di premere con le pinzette.',
        };
      }

      if (customer.issueType === 'broken_taptic_engine' && !phoneState.tapticReplaced) {
        return {
          text: 'Sostituisci il motore di vibrazione Taptic Engine guasto',
          hint: 'Nel pannello a destra clicca "Sostituisci" per montare il nuovo motore aptico.',
          tool: 'part_taptic',
          component: 'Modulo Motore Aptico Taptic Engine',
          location: 'In basso a sinistra, a fianco della porta di ricarica',
          toolName: 'Vassoio Ricambi: Nuovo Motore Aptico',
          proTip: 'Il modulo a risonanza lineare ripristina la vibrazione tattile precisa per tastiera e notifiche.',
        };
      }

      if (customer.issueType === 'broken_charging_port' && !phoneState.chargingPortReplaced) {
        return {
          text: 'Installa la Nuova Sub-Board USB-C di ricarica',
          hint: 'Nel pannello a destra clicca "Sostituisci" sulla sub-board USB.',
          tool: 'part_charging_port',
          component: 'Sub-Board Dock USB-C di Alimentazione',
          location: 'In basso al centro, alla base del telaio interno',
          toolName: 'Vassoio Ricambi: Nuova Sub-Board USB-C',
          proTip: 'La scheda inferiore integra la presa Power Delivery 65W e il microfono principale di sistema.',
        };
      }

      if (customer.issueType === 'damaged_selfie_camera' && !phoneState.selfieCameraReplaced) {
        return {
          text: 'Installa la Nuova Fotocamera Frontale Selfie 4K',
          hint: 'Clicca "Sostituisci" nel pannello componenti o seleziona Selfie Camera dai ricambi.',
          tool: 'part_selfie_camera',
          component: 'Modulo Fotocamera Selfie 4K & Sensori IR',
          location: 'In alto al centro, sopra la Logic Board',
          toolName: 'Vassoio Ricambi: Nuova Selfie Camera',
          proTip: 'Allinea i sensori ottici prima del bloccaggio per garantire il corretto funzionamento dello sblocco facciale.',
        };
      }

      if (customer.issueType === 'broken_screen' && !phoneState.newScreenInstalled) {
        return {
          text: 'Installa il Nuovo Schermo OLED Crystal',
          hint: 'Nel pannello a destra clicca sul pulsante verde "⚡ Sostituisci (-€18)" o seleziona Schermo OLED.',
          tool: 'part_screen',
          component: 'Pannello Display OLED Super Retina 120Hz',
          location: 'Telaio frontale del dispositivo',
          toolName: 'Vassoio Ricambi: Nuovo Schermo OLED',
          proTip: 'I display OLED OEM offrono gamma colore DCI-P3 al 100% e vetro Ceramic Shield resistente a impatti.',
        };
      }

      if (customer.issueType === 'dead_battery') {
        if (!phoneState.batteryDisconnected) {
          return {
            text: 'Stacca il cavo flex connettore batteria con le Pinzette ESD',
            hint: 'Seleziona le Pinzette ESD e clicca sul connettore flex della batteria.',
            tool: 'tweezers',
            component: 'Connettore Flex Alimentazione Batteria',
            location: 'Bordo destro della batteria, sulla scheda madre',
            toolName: 'Pinzette ESD a Becco Fine',
            proTip: 'Disconnettere la batteria è la prima regola di sicurezza prima di toccare qualsiasi modulo interno.',
          };
        }
        if (!phoneState.oldBatteryRemoved) {
          return {
            text: 'Estrai la batteria usurata con le Pinzette ESD',
            hint: 'Clicca sopra la batteria con le Pinzette per estrarla nel vassoio.',
            tool: 'tweezers',
            component: 'Pacco Batteria Li-Ion Esaurita/Gonfia',
            location: 'Vano batteria sinistro del telaio',
            toolName: 'Pinzette ESD a Becco Fine',
            proTip: 'Tira le linguette adesive orizzontalmente senza piegare le celle per evitare incendi termici.',
          };
        }
        if (!phoneState.newBatteryInstalled) {
          return {
            text: 'Installa la Nuova Batteria Li-Ion OEM',
            hint: 'Nel pannello a destra clicca su "⚡ Sostituisci (-€14)" sulla batteria.',
            tool: 'part_battery',
            component: 'Nuova Batteria Li-Ion OEM ad Alta Densità',
            location: 'Vano batteria sinistro del telaio',
            toolName: 'Vassoio Ricambi: Nuova Batteria Li-Ion',
            proTip: 'La nuova batteria OEM garantisce oltre 800 cicli di ricarica con stato di efficienza al 100%.',
          };
        }
      }

      if (customer.issueType === 'broken_speaker') {
        if (!phoneState.speakerUnscrewed) {
          return {
            text: 'Svita la vite dell\'altoparlante inferiore con il Cacciavite',
            hint: 'Seleziona il Cacciavite Torx e svita la vite sulla cassa acustica.',
            tool: 'screwdriver',
            component: 'Vite di Fissaggio Modulo Acustico',
            location: 'Angolo inferiore destro sopra la cassa acustica',
            toolName: 'Cacciavite Torx Magnetico P2',
            proTip: 'Questa vite è più corta rispetto a quelle esterne del telaio: assicurati di riavvitarla nella corretta sede.',
          };
        }
        if (!phoneState.oldSpeakerRemoved) {
          return {
            text: 'Estrai l\'altoparlante guasto con le Pinzette ESD',
            hint: 'Clicca sul modulo acustico con le Pinzette per estrarlo nel vassoio.',
            tool: 'tweezers',
            component: 'Modulo Altoparlante Acustico Danneggiato',
            location: 'Angolo inferiore destro del telaio interno',
            toolName: 'Pinzette ESD a Becco Fine',
            proTip: 'Il magnete al neodimio dell\'altoparlante potrebbe attirare particelle metalliche: tieni pulita la zona.',
          };
        }
        if (!phoneState.newSpeakerInstalled) {
          return {
            text: 'Monta il Nuovo Altoparlante HD OEM',
            hint: 'Nel pannello a destra clicca "⚡ Sostituisci" sull\'altoparlante.',
            tool: 'part_speaker',
            component: 'Nuovo Modulo Altoparlante Acustico HD OEM',
            location: 'Vano cassa acustica inferiore destro',
            toolName: 'Vassoio Ricambi: Nuovo Altoparlante HD',
            proTip: 'Il nuovo altoparlante è dotato di camera acustica risonante per bassi profondi e voce nitida in vivavoce.',
          };
        }
      }

      if (customer.issueType === 'overheating_cpu') {
        if (!phoneState.oldPasteScraped) {
          return {
            text: 'Rimuovi la vecchia pasta termica secca dalla CPU',
            hint: 'Seleziona la Lastra / Plettro e raschia delicatamente il die del processore.',
            tool: 'pry_pick',
            component: 'Residui Pasta Termica Secca sul Processore',
            location: 'Centro della Logic Board, sul die metallico del chip SoC',
            toolName: 'Lastra / Plettro di Plastica ESD',
            proTip: 'Raschia delicatamente senza intaccare la superficie a specchio del silicio del processore.',
          };
        }
        if (!phoneState.newPasteApplied) {
          return {
            text: 'Applica la nuova Pasta Termica al diamante sulla CPU',
            hint: 'Seleziona la Siringa di Pasta Termica e clicca sopra la CPU per dosarla.',
            tool: 'thermal_paste',
            component: 'Die del Processore CPU / SoC',
            location: 'Superficie metallica lucida della CPU',
            toolName: 'Siringa Pasta Termica al Diamante',
            proTip: 'Una micro-goccia al centro è sufficiente: serrando il dissipatore si distribuirà a velo senza debordare.',
          };
        }
      }

      if (customer.issueType === 'water_damage' || customer.issueType === 'combo_water_camera') {
        const remainingWater = phoneState.waterDroplets?.filter(d => !d.isCleaned && d.size > 0.5).length || 0;
        if (remainingWater > 0) {
          return {
            text: `Asciuga le gocce d'acqua con l'Asciugatore Termico (${remainingWater} gocce rimaste)`,
            hint: 'Seleziona l\'Asciugatore Termico e passa il getto d\'aria calda sopra le gocce (il calore si diffonde realisticamente).',
            tool: 'air_dryer',
            component: 'Gocce d\'Acqua e Condensa Conduttiva',
            location: 'Superficie interna del telaio e Logic Board',
            toolName: 'Asciugatore Termico ad Aria Calda',
            proTip: 'Muovi l\'asciugatore a spirale per disperdere l\'umidità intrappolata sotto i circuiti integrati BGA.',
          };
        }

        const remainingOx = phoneState.oxidationSpots?.filter(s => !s.cleaned).length || 0;
        if (remainingOx > 0) {
          return {
            text: `Rimuovi l'ossido con Spazzolino + Alcool IPA (${remainingOx} macchie verdi)`,
            hint: 'Seleziona lo Spazzolino + IPA e strofina sui cerchi luminosi verde acido della scheda madre.',
            tool: 'brush',
            component: 'Macchie di Corrosione e Ossido Rame/Stagno',
            location: 'Piste e contatti della Logic Board (cerchi verde acido)',
            toolName: 'Spazzolino ESD + Alcool IPA 99%',
            proTip: 'L\'azione meccanica delle setole unita all\'alcool isopropilico elimina i sali minerali conduttivi.',
          };
        }

        if ((customer.issueType as string) === 'short_circuit_capacitor') {
        return {
          text: 'Rimuovi e sostituisci il micro-condensatore in corto con il Saldatore a Stagno',
          hint: 'Seleziona il Saldatore a Stagno (450°C) per dissaldare il componente difettoso sulla scheda madre.',
          tool: 'solder_iron',
          component: 'Micro-Condensatore SMD in Cortocircuito',
          location: 'Linea di alimentazione principale VDD sulla Logic Board',
          toolName: 'Saldatore a Stagno Pro',
          proTip: 'Usa la punta fine a 450°C per fondere lo stagno senza danneggiare i componenti circostanti.',
        };
      }

      if ((customer.issueType as string) === 'corroded_test_points') {
        return {
          text: 'Verifica la continuità delle piazzole con il Multimetro Digitale e puliscile',
          hint: 'Seleziona il Multimetro Digitale per testare i test points e poi pulisci con lo spazzolino.',
          tool: 'multimeter',
          component: 'Piazzole di Test PCB Corrose',
          location: 'Circuiti stampati della Logic Board',
          toolName: 'Multimetro Digitale',
          proTip: 'Il multimetro in modalità continuità (bip) segnala l\'interruzione delle piste.',
        };
      }

      if ((customer.issueType as string) === 'processor_reballing_crack') {
        return {
          text: 'Esegui il Reballing BGA del processore con Pistola Termica e Saldatore',
          hint: 'Seleziona la Pistola Termica e il Saldatore a Stagno per rifare le sfere di stagno della CPU.',
          tool: 'solder_iron',
          component: 'Sfere di Stagno BGA sotto al Processore',
          location: 'Die centrale del SoC principale',
          toolName: 'Saldatore a Stagno 450°C & Stazione Aria Calda',
          proTip: 'Il reballing termico fonde e rigenera le micro-sfere di stagno incrinate.',
        };
      }

      if ((customer.issueType as string) === '5g_modem_burnt') {
        return {
          text: 'Dissalda e sostituisci il chip modem 5G bruciato con il Saldatore a Stagno',
          hint: 'Seleziona il Saldatore a Stagno per rimuovere e sostituire il chip radio 5G.',
          tool: 'solder_iron',
          component: 'Chip Modem 5G Bruciato',
          location: 'Sezione Radio / RF della Logic Board',
          toolName: 'Saldatore a Stagno Pro',
          proTip: 'Proteggi i componenti vicini con nastro kapton prima di dissaldare il chip.',
        };
      }

      if ((customer.issueType as string) === 'oled_flex_torn' || (customer.issueType as string) === 'laser_lens_shattered') {
        return {
          text: 'Pulisci e sterilizza i componenti nella Vasca ad Ultrasuoni Pro',
          hint: 'Seleziona la Vasca a Ultrasuoni per ripulire i residui microscopici e i contatti.',
          tool: 'ultrasonic_tank',
          component: 'Vasca a Ultrasuoni per Micro-Circuiti',
          location: 'Banco di pulizia ad alta frequenza',
          toolName: 'Vasca Ultrasuoni Pro',
          proTip: 'Gli ultrasuoni a 40kHz rimuovono lo sporco invisibile da ogni anfratto.',
        };
      }

      if (customer.issueType === 'combo_water_camera' && !phoneState.newCameraInstalled) {
          return {
            text: 'Installa la Nuova Tripla Fotocamera 4K OEM',
            hint: 'Clicca "Sostituisci" nella scheda componenti a destra per montare la nuova fotocamera.',
            tool: 'part_camera',
            component: 'Nuova Tripla Fotocamera 4K OEM',
            location: 'Alloggiamento lenti superiore posteriore',
            toolName: 'Vassoio Ricambi: Nuova Fotocamera 4K',
            proTip: 'Le lenti ossidate dall\'umidità causano riflessi e aberrazioni cromatiche irrisolvibili via software.',
          };
        }
      }
    }

    // 5. REASSEMBLY PHASE
    if (!phoneState.isClosed) {
      return {
        text: 'Lavorazione completata! Ora richiudi e sigilla il telefono',
        hint: 'Clicca su "Rimonta Tutto (Simula 5 min)" in alto per riassemblare e sigillare velocemente.',
        tool: 'none',
        component: 'Display, Viti e Guarnizioni Scocca',
        location: 'Perimetro di chiusura del telaio',
        toolName: 'Pulsante Superiore: "Rimonta Tutto (Simula 5 min)"',
        proTip: 'La chiusura automatica riavvita tutte le viti nella corretta coppia di serraggio e applica la pressione per la colla.',
      };
    }

    // 6. FINAL TEST & POWER ON
    if (!phoneState.isPoweredOn) {
      return {
        text: 'Telefono sigillato! Esegui il collaudo finale',
        hint: 'Clicca su "Accendi (Collaudo)" nella barra in basso.',
        tool: 'none',
        component: 'Circuito di Accensione & Display',
        location: 'Tasto Power laterale destro',
        toolName: 'Pulsante Barra: "Accendi (Collaudo)"',
        proTip: 'Il collaudo verifica che il pannello si illumini, il touch risponda a tutti i punti e non vi siano assorbimenti anomali.',
      };
    }

    return {
      text: completionScore === 100 ? 'Riparazione superata con successo al 100%!' : `Lavoro parziale (${completionScore}%). Puoi riconsegnare.`,
      hint: 'Clicca su "Consegna al Cliente" nella barra in basso per riscuotere il pagamento e ricevere la recensione!',
      tool: 'none',
      component: 'Dispositivo Riparato al 100%',
      location: 'Bancone di Servizio Principale',
      toolName: 'Pulsante Barra: "Consegna al Cliente"',
      proTip: 'Consegnare il dispositivo impeccabile e pulito garantisce 5 stelle e mance per espandere il negozio!',
    };
  };

  const tutorial = getTutorialStep();

  return (
    <div className="w-full h-full min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-slate-100 font-sans select-none">
      {/* INTEGRATED TOP HEADER WITH TIMER, STATUS, SAFETY & PRIMARY ACTIONS */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 px-5 py-2 bg-white/95 border-b border-slate-200 shadow-xs backdrop-blur-md">
        {/* LEFT: RETURN TO COUNTER & DEVICE INFO */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToCounter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Bancone</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit']">
                {customer.phoneModelName}
              </h2>
              <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">
                {customer.name}
              </span>
              {contract.expectationLevel === 'ultra' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold border border-rose-300 animate-pulse">
                  VIP
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Compenso: <strong className="text-emerald-600">€{agreed}</strong>
            </div>
          </div>
        </div>

        {/* MIDDLE: REAL-TIME STATUS MESSAGE & PROGRESS (INTEGRATED!) */}
        <div className="flex-1 max-w-xl hidden md:flex items-center justify-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-600 text-white font-mono">
            Stato
          </span>
          <span className="text-xs font-bold text-slate-800 truncate text-center">
            {feedbackMsg}
          </span>
          <span
            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ${
              completionScore === 100
                ? 'bg-emerald-500 text-white shadow-xs'
                : completionScore > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {completionScore}% {completionScore === 100 ? '✓' : ''}
          </span>
        </div>

        {/* RIGHT: TIMER, SHORT CIRCUIT SAFETY, RIMONTA TUTTO & CONSEGNA */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="italic font-serif text-cyan-200 font-black text-base mr-1 bg-cyan-950 px-4 py-1.5 rounded-xl border-2 border-cyan-400 shadow-lg">by ottavio</span>
          {/* QUADRUPLED COUNTDOWN TIMER */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-black text-xs shadow-xs transition-colors ${
              timeRemaining > 60
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : timeRemaining > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-rose-100 text-rose-800 border-rose-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {timeRemaining > 0
                ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
                : 'TEMPO SCADUTO! (-€20)'}
            </span>
          </div>

          {/* SAFE POWER OFF BUTTON (Shows risk % if ON!) */}
          {phoneState.isPoweredOn && !phoneState.isClosed && (
            <button
              onClick={handleSafePowerOff}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all cursor-pointer animate-pulse"
              title="Spegni il telefono per evitare cortocircuiti durante lo smontaggio"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Spegni ({shortCircuitRisk}% Rischio)</span>
            </button>
          )}



          {/* TASTO "RIMONTA TUTTO" SEMPRE VISIBILE IN HEADER! */}
          <button
            disabled={isAutoReassembling}
            onClick={handleAutoReassemble}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Riassembla tutti i componenti automaticamente (simula 5 minuti)"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rimonta Tutto (5m)</span>
          </button>

          {/* TASTO CONSEGNA AL CLIENTE SEMPRE DISPONIBILE */}
          <button
            onClick={() => setShowReceiptModal(true)}
            className={`px-3.5 py-1.5 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
              completionScore === 100
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-emerald-500/25'
                : completionScore > 0
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <span>
              {completionScore === 100
                ? `✨ Consegna (€${netEarned})`
                : completionScore > 0
                ? `⚠️ Consegna (${completionScore}%)`
                : `❌ Riconsegna (€0)`}
            </span>
          </button>
        </div>
      </div>

      {/* COMPACT SUB-HEADER: MODE SELECTOR, TUTORIAL/HINT CONTROLS, ORIENTATION SELECTORS & ACTIONS */}
      <div className="relative z-20 px-5 py-2 bg-gradient-to-r from-slate-50 via-white to-sky-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
        {/* LEFT: MODE SELECTOR & GUIDANCE STATUS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl border border-slate-300 text-xs">
            <button
              onClick={() => handleModeChange('tutorial')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'tutorial'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
              title="Partita Tutorial: Guide passo-passo a schermo e beacon luminosi attivi"
            >
              <span>🎓 Tutorial</span>
            </button>

            <button
              onClick={() => handleModeChange('solo_expert')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'solo_expert'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
              title="Partita Solo (Esperto): Zero aiuti o guide forzate. Pura abilità e realismo"
            >
              <span>⚡ Solo</span>
            </button>

            <button
              onClick={() => handleModeChange('solo_with_help')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentMode === 'solo_with_help'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
              title="Partita Solo (ma puoi scegliere se ti aiuta): Lavori in autonomia con tasto Chiedi Aiuto a richiesta"
            >
              <span>💡 Solo (con Aiuto)</span>
            </button>
          </div>

          {/* ACTIVE GUIDANCE TEXT OR ON-DEMAND HINT BUTTON */}
          {currentMode === 'tutorial' && tutorialEnabled ? (
            <div className="flex items-center gap-2 max-w-md bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
              <div className="w-5 h-5 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-xs shrink-0">
                <Lightbulb className="w-3 h-3" />
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                <strong className="text-amber-800 mr-1 font-mono text-[10px] uppercase">Guida:</strong>
                {tutorial.text}
              </div>
            </div>
          ) : currentMode === 'solo_with_help' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundManager.playCustomerChirp(1.2);
                  setShowMasterHintModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer animate-pulse"
                title="Apri un consiglio mirato del Maestro sul prossimo passaggio"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Chiedi Consiglio al Maestro</span>
              </button>

              <button
                onClick={() => setTutorialEnabled(!tutorialEnabled)}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  tutorialEnabled
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                }`}
                title="Mostra o nascondi la barra di guida rapida"
              >
                {tutorialEnabled ? '👁️ Nascondi Guida' : '👁️ Mostra Guida Rapida'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Nessun aiuto attivo (Massimo realismo da vero tecnico)</span>
            </div>
          )}

          {/* If Solo with help and user toggled tutorial on, display banner */}
          {currentMode === 'solo_with_help' && tutorialEnabled && (
            <div className="flex items-center gap-1.5 text-xs text-slate-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl max-w-sm truncate">
              <strong className="text-amber-800 text-[10px] font-mono">Fase:</strong>
              <span className="truncate">{tutorial.text}</span>
            </div>
          )}
        </div>

        {/* MOBILE FALLBACK STATUS MESSAGE (WHEN SCREEN < MD) */}
        <div className="md:hidden w-full text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
          {feedbackMsg}
        </div>

        {/* INTEGRATED ORIENTATION BUTTONS & CONTEXTUAL ACTIONS (NO BOTTOM DOCK OVERLAP!) */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Integrated Phone View Selectors */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                soundManager.playFlip();
                setOrientation('front');
                setPhoneState(prev => ({ ...prev, currentSide: 'front' }));
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                orientation === 'front' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              📱 Fronte
            </button>
            <button
              onClick={() => {
                soundManager.playFlip();
                setOrientation('back');
                setPhoneState(prev => ({ ...prev, currentSide: 'back' }));
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                orientation === 'back' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔄 Retro (Cam)
            </button>
            <button
              onClick={() => {
                soundManager.playFlip();
                setOrientation('side_bottom');
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                orientation === 'side_bottom' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔌 Bordo USB
            </button>
            <button
              onClick={() => {
                soundManager.playFlip();
                setOrientation('side_right');
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                orientation === 'side_right' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              👆 Lato Tasti (Power / Vol)
            </button>
          </div>

          {/* Quick Flip Button */}
          <button
            onClick={() => {
              soundManager.playFlip();
              setIsFlipping(true);
              setTimeout(() => setIsFlipping(false), 400);
              const nextSide = phoneState.currentSide === 'front' ? 'back' : 'front';
              setPhoneState(prev => ({ ...prev, currentSide: nextSide }));
              setOrientation(nextSide);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer"
            title="Capovolgi dispositivo"
          >
            <RotateCw className="w-3 h-3 text-cyan-600" />
            <span>Capovolgi</span>
          </button>

          {/* Contextual Action: Pry front screen */}
          {!phoneState.screenRemoved && phoneState.suctionApplied && orientation === 'front' && (
            <button
              onClick={handlePry}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>✂️ Fai leva display ({phoneState.screenPryProgress || 0}%)</span>
            </button>
          )}

          {/* Contextual Action: Pry rear back cover */}
          {!phoneState.backCoverRemoved && orientation === 'back' && (
            <button
              onClick={handlePry}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 animate-pulse"
            >
              <span>✂️ Fai leva scocca ({phoneState.backCoverPryProgress || 0}%)</span>
            </button>
          )}

          {/* Contextual Action: Manual close */}
          {!phoneState.isClosed && (phoneState.screenRemoved || phoneState.backCoverRemoved) && (
            <button
              onClick={handleManualClose}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              🔒 Richiudi Manuale
            </button>
          )}

          {/* Contextual Action: Power on / collaudo */}
          {phoneState.isClosed && !phoneState.isPoweredOn && (
            <button
              onClick={handlePowerOn}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1 animate-pulse"
            >
              <Power className="w-3 h-3" />
              <span>Accendi (Collaudo)</span>
            </button>
          )}
        </div>
      </div>

      {/* AUTO REASSEMBLE OVERLAY SIMULATION (Accelerated 2x) */}
      {isAutoReassembling && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full text-center">
            <RefreshCw className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-3" />
            <h4 className="text-base font-black text-slate-900 font-['Outfit'] mb-1">
              Riassemblaggio Automatico Completo
            </h4>
            <div className="text-xs font-bold text-amber-600 mb-2 font-mono flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Simulazione 5 Minuti (Accelerato x2): {Math.max(0, Math.floor((300 - (reassembleProgress / 100) * 300) / 60)).toString().padStart(2, '0')}:{Math.max(0, Math.floor((300 - (reassembleProgress / 100) * 300) % 60)).toString().padStart(2, '0')}</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-3 font-semibold min-h-[32px] flex items-center justify-center">
              {reassembleStepDesc}
            </p>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${reassembleProgress}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-slate-800 font-mono">{reassembleProgress}% completato</span>
          </div>
        </div>
      )}

      {/* MAIN WORKBENCH LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT TOOLBAR: SCHEDA CLIENTE INTEGRATA & ATTREZZI DA LAVORO */}
        <div className="w-full md:w-64 bg-white/95 border-r border-slate-200 p-3.5 flex flex-col justify-between z-10 overflow-y-auto shadow-xs">
          <div>
            {/* 3) INTEGRATED COLLAPSIBLE CUSTOMER SHEET (Point 3) */}
            <div className="mb-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-700 shadow-md overflow-hidden transition-all">
              <button
                onClick={() => setIsCustomerCardOpen(!isCustomerCardOpen)}
                className="w-full p-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                    style={{ backgroundColor: customer.bodyColor }}
                  >
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {customer.name}
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono">
                      {customer.phoneModelName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded-md font-mono">
                  <span>{isCustomerCardOpen ? 'Comprimi' : 'Scheda'}</span>
                  {isCustomerCardOpen ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />}
                </div>
              </button>

              {isCustomerCardOpen && (
                <div className="px-3 pb-3 pt-1.5 border-t border-slate-800 text-[11px] space-y-2 bg-slate-950/60 animate-fade-in">
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-mono font-bold">Guasto lamentato:</span>
                    <p className="text-slate-200 italic font-medium leading-snug mt-0.5">
                      "{customer.dialogue}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-slate-400">Compenso pattuito:</span>
                    <span className="text-emerald-400 font-bold text-xs">€{agreed}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-['Outfit']">
                Attrezzi da Lavoro
              </span>
              <span className="text-[10px] text-cyan-700 font-mono font-bold">ESD Safe</span>
            </div>

            <div className="space-y-1.5">
              {tools.map(t => {
                const Icon = t.icon;
                const isSelected = selectedTool === t.id;
                const isRequired = tutorialEnabled && tutorial.tool === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTool(isSelected ? 'none' : t.id);
                      setFeedbackMsg(`Selezionato: ${t.name}. ${t.desc}`);
                      soundManager.playCustomerChirp(1.2);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-900 shadow-sm'
                        : isRequired
                        ? 'bg-amber-50 border-amber-400 text-amber-900 animate-pulse ring-2 ring-amber-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-cyan-600 text-white font-bold'
                            : isRequired
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold tracking-tight">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {t.desc}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-600 font-bold">
                      {t.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              Strumento attivo:
            </div>
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-cyan-700">
                {selectedTool === 'none' ? 'Mani libere' : tools.find(t => t.id === selectedTool)?.name || 'Ricambio'}
              </span>
              {selectedTool !== 'none' && (
                <button
                  onClick={() => setSelectedTool('none')}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                >
                  Posa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: 3D WORKBENCH SCENE */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-200">
          <ThreeWorkbenchScene
            customer={customer}
            phoneState={phoneState}
            selectedTool={selectedTool}
            onPartClick={handle3DPartClick}
            orientation={orientation}
            onSetOrientation={setOrientation}
            onHeatSweep={handleHeatSweep}
            onScrewProgressTick={handleScrewProgressTick}
            onPrySweep={handlePry}
            onDryerSweep={handleDryerSweep}
            onBrushSweep={handleBrushSweep}
            onSuctionDoubleClick={handleSuction}
            gamePlayMode={currentMode}
          />

          {/* MASTER HINT MODAL: "Consiglio del Maestro" (Solo con aiuto a scelta) */}
          {showMasterHintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                      <Lightbulb className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Consiglio del Maestro di Riparazione</h3>
                      <p className="text-[11px] text-amber-300/80 font-mono">Assistenza Tattica su Richiesta</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMasterHintModal(false)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 space-y-3 mb-5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">Problema:</span>
                    <span className="text-xs text-white font-medium">"{customer.dialogue}"</span>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider shrink-0 mt-0.5">Cosa Fare Ora:</span>
                    <p className="text-sm text-amber-200 font-bold leading-snug">
                      {tutorial.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setTutorialEnabled(true);
                      setShowMasterHintModal(false);
                      setFeedbackMsg('🎓 Guida rapida attivata per questa fase!');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-700 text-center"
                  >
                    Tieni la Guida Attiva a Schermo
                  </button>

                  <button
                    onClick={() => setShowMasterHintModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20 text-center"
                  >
                    Ho Capito, Continuo da Solo!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GLITCH / MALWARE CYBER-TERMINAL */}
          {(customer.issueType === 'software_glitch' || customer.issueType === 'malware_spyware_wipe' || customer.issueType === 'boot_loop_corrupt_nand') && phoneState.dongleConnected && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-84 bg-slate-900/95 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30 font-mono text-white">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-2 pb-1 border-b border-emerald-800">
                <span className="flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-400" /> FASTBOOT CYBER-TERMINAL v3.4
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-2 py-0.5 rounded-full animate-pulse">DONGLE CONNESSO</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2 font-medium">
                Stato Diagnosi: <strong className="text-amber-400 font-mono">{phoneState.firmwareRestored ? 'SISTEMA_RIPRISTINATO_OK' : customer.issueType === 'malware_spyware_wipe' ? 'TROJAN_MINER_DETECTED' : 'CRITICAL_BOOT_LOOP_0x89'}</strong>
              </p>
              <div className="bg-slate-950 p-2.5 rounded-xl text-[10px] text-emerald-300 space-y-0.5 mb-3 font-semibold border border-slate-800">
                <div>&gt; Attaching to USB-C FastBoot port... OK</div>
                <div>&gt; Hardware EDL handshake: ESTABLISHED</div>
                <div>&gt; Partition state: {phoneState.firmwareRestored ? '100% CLEAN & VERIFIED' : 'READY TO FLASH'}</div>
              </div>
              {!phoneState.firmwareRestored ? (
                <button
                  onClick={handleRunSoftwareFlash}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  ⚡ Esegui Flash Firmware & Pulizia
                </button>
              ) : (
                <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 py-2 rounded-xl">
                  ✅ Firmware installato con successo!
                </div>
              )}
            </div>
          )}
        </div>

        {/* 9) UNIFIED RIGHT SIDEBAR: COMPONENTI SMONTATI, STATO IN % E SOSTITUZIONE DIRETTA */}
        <div className="w-full md:w-80 bg-white/95 border-l border-slate-200 p-3.5 flex flex-col justify-between z-10 overflow-y-auto shadow-xs">
          <div className="space-y-3.5">
            {/* TOP CARD: STATO GENERALE DELL'OGGETTO & SODDISFAZIONE CLIENTE */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Stato Generale Oggetto
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full font-mono ${
                    deviceConditionScore >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : deviceConditionScore >= 60
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {deviceConditionScore}%
                </span>
              </div>

              {/* Health progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    deviceConditionScore >= 90
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                      : deviceConditionScore >= 60
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                      : 'bg-gradient-to-r from-rose-500 to-red-400'
                  }`}
                  style={{ width: `${deviceConditionScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>
                  {deviceConditionScore >= 95
                    ? '✨ Condizione Impeccabile (+Mancia)'
                    : deviceConditionScore >= 70
                    ? '👍 Buono Stato Generale'
                    : '⚠️ Componenti Danneggiati'}
                </span>
                <span className="text-amber-300 font-bold">
                  {deviceConditionScore >= 95 ? '⭐⭐⭐⭐⭐ Max' : deviceConditionScore >= 80 ? '⭐⭐⭐⭐' : '⭐⭐⭐'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800 leading-tight">
                💡 <strong className="text-slate-200">Sostituire i componenti</strong> riduce il compenso per il costo del ricambio, ma porta la salute al 100% e massimizza la soddisfazione del cliente!
              </p>
            </div>

            {/* UNIFIED LIST: COMPONENTI SMONTATI & SOSTITUZIONE 1-CLICK */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-['Outfit'] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Componenti Smontati ({phoneState.disassembledParts?.length || 0})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Vassoio Tray</span>
              </div>

              <div className="space-y-2">
                {phoneState.disassembledParts && phoneState.disassembledParts.length > 0 ? (
                  phoneState.disassembledParts.map(part => {
                    const cond = part.conditionPercent ?? (part.isReplaced ? 100 : 0);
                    const canRep = part.canReplace && !part.isReplaced;
                    const cost = part.replacementCost || 14;

                    return (
                      <div
                        key={part.id}
                        className={`p-3 rounded-2xl border transition-all shadow-xs animate-fade-in ${
                          part.isReplaced
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : cond < 30
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{part.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {part.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {part.category === 'screw' ? 'Vite di fissaggio' : 'Componente hardware'}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${
                              part.isReplaced || cond >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : cond < 30
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {part.isReplaced ? '100% NUOVO' : `${cond}% STATO`}
                          </span>
                        </div>

                        {/* Health condition progress bar for the disassembled part */}
                        {part.category !== 'screw' && (
                          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                            <div
                              className={`h-full transition-all duration-300 ${
                                part.isReplaced || cond >= 80
                                  ? 'bg-emerald-500'
                                  : cond < 30
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${cond}%` }}
                            />
                          </div>
                        )}

                        {/* DIRECT REPLACE ACTION BUTTON (Request 1 & 2) */}
                        {canRep ? (
                          <button
                            onClick={() => handleDirectReplacePart(part.id)}
                            className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Sostituisci con Nuovo OEM (-€{cost})</span>
                          </button>
                        ) : part.isReplaced ? (
                          <div className="mt-1 py-1 px-2 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-800 font-bold text-[10px] flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ricambio Originale Installato (100%)</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-mono text-right">
                            Nel vassoio dispenser
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 px-3 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                    <Archive className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                    Nessun pezzo smontato nel vassoio. Svita o rimuovi componenti per visualizzarne lo stato e sostituirli.
                  </div>
                )}
              </div>
            </div>

            {/* SPARE PARTS STOCK SECTION (FOR DIRECT 1-CLICK MOUNTING) */}
            {spareParts.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-['Outfit'] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Magazzino Ricambi Originali ({spareParts.length})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">OEM 100%</span>
                </div>

                <div className="space-y-1.5">
                  {spareParts.map(sp => (
                    <button
                      key={sp.id}
                      onClick={() => {
                        setSelectedTool(sp.id);
                        if (sp.id === 'part_screen') handleScreenInstall();
                        else if (sp.id === 'part_battery') handleBatteryInstall();
                        else if (sp.id === 'part_camera') handleCameraInstall();
                        else if (sp.id === 'part_speaker') handleSpeakerInstall();
                        else if (sp.id === 'part_back_cover') {
                          soundManager.playInstall();
                          setPhoneState(prev => ({ ...prev, backGlassReplaced: true }));
                        }
                        soundManager.playCustomerChirp(1.1);
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        sp.done
                          ? 'bg-emerald-50 border-emerald-300 text-slate-500'
                          : selectedTool === sp.id
                          ? 'bg-cyan-50 border-cyan-500 text-slate-900 ring-2 ring-cyan-300 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{sp.name}</div>
                        <div className="text-[10px] text-slate-500">{sp.tag}</div>
                      </div>

                      {sp.done ? (
                        <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Montato
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-mono hover:bg-cyan-200">
                          Installa
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5) FINAL OUTCOME & RECEIPT MODAL (Supports Full, Partial or Incomplete Repairs!) */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="text-center mb-4">
              <div
                className={`w-14 h-14 mx-auto rounded-3xl flex items-center justify-center mb-2 shadow-inner ${
                  isFullyRepaired
                    ? 'bg-emerald-100 text-emerald-600'
                    : isPartialRepaired
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {isFullyRepaired ? (
                  <Check className="w-8 h-8 stroke-[3]" />
                ) : isPartialRepaired ? (
                  <AlertTriangle className="w-8 h-8 stroke-[3]" />
                ) : (
                  <Trash2 className="w-8 h-8 stroke-[2.5]" />
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                {isFullyRepaired
                  ? 'Riparazione Completata!'
                  : isPartialRepaired
                  ? 'Riconsegna Parziale'
                  : 'Riconsegna Senza Riparazione'}
              </h3>
              <p className="text-xs text-slate-500">
                {isFullyRepaired
                  ? 'Ecco il resoconto dettagliato del compenso e della valutazione del cliente'
                  : isPartialRepaired
                  ? 'Il telefono è solo parzialmente riparato: il compenso è ridotto in proporzione'
                  : 'Il guasto non è stato risolto: nessun compenso e recensione negativa del cliente'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Stato Intervento:</span>
                <span className="font-mono font-bold text-slate-900">
                  {completionScore}% completato
                </span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Stato di Salute Finale Oggetto:</span>
                <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {deviceConditionScore}% {deviceConditionScore >= 95 ? '(Come Nuovo)' : ''}
                </span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Prezzo Concordato al Banco:</span>
                <span className="font-mono font-bold text-slate-900">€{agreed}</span>
              </div>

              {speedBonus > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Bonus Velocità (Entro il tempo promesso):</span>
                  <span className="font-mono font-bold">+€{speedBonus}</span>
                </div>
              )}

              {satisfactionBonus > 0 && (
                <div className="flex justify-between text-cyan-700 font-semibold">
                  <span>Mancia Soddisfazione (100% Ricambi Nuovi OEM):</span>
                  <span className="font-mono font-bold">+€{satisfactionBonus}</span>
                </div>
              )}

              {latePenalty > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Penalità Ritardo (Fuori tempo):</span>
                  <span className="font-mono font-bold">-€{latePenalty}</span>
                </div>
              )}

              {extraExpenses > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Costo Ricambi Acquistati / Danni:</span>
                  <span className="font-mono font-bold">-€{extraExpenses}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Compenso Netto Riconosciuto:</span>
                <span
                  className={`font-mono text-lg ${
                    netEarned > 0 ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  €{netEarned}
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-3.5 border mb-5 ${
                rating >= 4
                  ? 'bg-emerald-50 border-emerald-200'
                  : rating >= 2
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 font-['Outfit']">
                  Feedback e Recensione di {customer.name}
                </span>
                <span className="text-amber-500 font-bold text-sm">
                  {'⭐'.repeat(rating)}
                </span>
              </div>
              <p className="text-xs text-slate-700 italic">"{reviewComment}"</p>
            </div>

            <button
              onClick={handleFinalizeRepair}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer font-['Outfit'] transform hover:scale-[1.02] active:scale-95"
            >
              {netEarned > 0
                ? `Incassa €${netEarned} e Torna al Bancone`
                : 'Saluta Cliente e Torna al Bancone'}
            </button>
          </div>
        </div>
      )}


    </div>
  );
};
