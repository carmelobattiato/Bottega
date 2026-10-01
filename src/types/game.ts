export type ToolId = 
  | 'none'
  | 'screwdriver'
  | 'heatgun'
  | 'suction'
  | 'pry_pick' // "la lastra per levare lo schermo o il retro"
  | 'tweezers'
  | 'air_dryer'
  | 'brush'
  | 'cyber_dongle' // Strumento diagnosi e flash software USB
  | 'thermal_paste' // Siringa pasta termica per CPU surriscaldata
  | 'solder_iron' // Saldatore a stagno 450°C
  | 'multimeter' // Multimetro digitale precisione
  | 'ultrasonic_tank' // Vasca ultrasuoni lavaggio PCB
  | 'part_screen'
  | 'part_battery'
  | 'part_camera'
  | 'part_speaker'
  | 'part_charging_port'
  | 'part_back_cover'
  | 'part_taptic'
  | 'part_wifi_antenna'
  | 'part_wireless_coil'
  | 'part_selfie_camera'
  | 'part_flex_cable'
  | 'part_heatsink'
  | 'part_nfc_antenna'
  | 'part_sim_tray'
  | 'part_power_button';

export type RepairIssueType = 
  | 'water_damage' // "mi si è bagnato il telefono"
  | 'broken_screen' // "ho rotto lo schermo"
  | 'bad_camera' // "gira il telefono e smonta le telecamere"
  | 'dead_battery' // batteria gonfia / morta
  | 'software_glitch' // "il telefono è bloccato in bootloop con glitch grafici"
  | 'overheating_cpu' // "il telefono scotta da morire e si spegne da solo"
  | 'broken_speaker' // "non si sente l'audio o gracchia tutto"
  | 'combo_water_camera' // bagnato + telecamere ossidate
  // +10 Nuovi Guasti Precedenti
  | 'charging_port_dirt' // Porta di ricarica intasata da sporco
  | 'broken_charging_port' // Connettore di ricarica dissaldato/rotto
  | 'clogged_earpiece' // Capsula auricolare superiore intasata
  | 'cracked_back_glass' // Vetro posteriore frantumato da caduta
  | 'broken_taptic_engine' // Vibrazione metallica o rotta
  | 'stuck_volume_buttons' // Tasti laterali bloccati/incastrati
  | 'wifi_antenna_cut' // Cavo antenna Wi-Fi/5G tranciato o staccato
  | 'wireless_charging_burnt' // Bobina ricarica wireless Qi bruciata
  | 'damaged_selfie_camera' // Fotocamera anteriore selfie opaca/graffiata
  | 'malware_spyware_wipe' // Malware crypto-miner in background
  // +22 Nuovi Casi di Intervento
  | 'damaged_flex_cable' // Cavo flat FPC interconnessione scheda madre/sub-board tranciato
  | 'bent_frame_chassis' // Scocca in alluminio/titanio piegata da schiacciamento
  | 'face_id_sensor_dirty' // Modulo proiettore di punti Face ID/TrueDepth impolverato
  | 'fingerprint_sensor_fail' // Sensore impronte digitali ottico/ultrasuoni da ricalibrare
  | 'sim_tray_jammed' // Carrellino Nano-SIM bloccato con frammento di plastica
  | 'nfc_antenna_broken' // Antenna chip NFC per pagamenti contactless e POS non funzionante
  | 'battery_connector_loose' // Clip del connettore batteria allentata o dissaldata
  | 'proximity_sensor_glitch' // Sensore di prossimità non spegne lo schermo durante le telefonate
  | 'rear_mic_noise_cancel' // Microfono posteriore per la soppressione del rumore ambientale otturato
  | 'thermal_throttle_heatsink' // Piastra in grafite e camera di vapore dissipazione scollata
  | 'screen_burn_in_ghost' // Ghosting e ritenzione d'immagine persistente su display OLED
  | 'short_circuit_capacitor' // Micro-condensatore ceramico SMD in corto circuito su linea VDD
  | 'power_button_click_broken' // Cupola a scatto del tasto Power/Accensione sfondata o senza click
  | 'compass_gyro_drift' // Bussola e giroscopio disallineati con orientamento sballato
  | 'haptic_driver_ic' // Chip driver amplificatore audio/aptico sovraccaricato
  | 'bluetooth_drop_connection' // Cavo coassiale antenna Bluetooth sfilato dal micro-socket
  | 'foldable_hinge_dirt' // Cerniera del display pieghevole con sabbia e attrito meccanico
  | 'front_ambient_light_sensor' // Sensore di luminosità ambientale bloccato al buio
  | 'headphone_jack_stuck' // Adattatore jack audio 3.5mm con polo metallico spezzato dentro
  | 'laser_autofocus_dirty' // Sensore ToF LIDAR e laser autofocus posteriore impolverato
  | 'corroded_test_points' // Piazzole di test PCB corrose da residui o condensa
  | 'boot_loop_corrupt_nand' // Partizione di boot su memoria flash NAND/UFS corrotta
  // +4 Nuovi Super Guasti Ottavio
  | 'laser_lens_shattered' // Lente periscopica zoom frantumata
  | 'processor_reballing_crack' // Saldature BGA processore incrinate
  | '5g_modem_burnt' // Chip modem 5G bruciato
  | 'oled_flex_torn' // Flat OLED strappato
  | 'console_outer_shell_detached'; // Scocca esterna / cover laterale staccata o allentata nelle console

export type PhoneViewOrientation = 
  | 'front'       // Display and internals
  | 'back'        // Rear cover & camera lenses
  | 'side_right'  // Power button & Fingerprint sensor
  | 'side_left'   // Volume buttons & SIM slot
  | 'side_bottom' // USB-C port, speaker grilles & bottom screws
  | 'side_top';   // Top mic & frame edge

export type GamePlayMode = 
  | 'classic'        // Modalità Classica
  | 'night'          // Modalità Notte (suoni più calmi)
  | 'tutorial'       // Partita Guidata (Tutorial con aiuti automatici completi, beacon, consigli continui)
  | 'solo_with_help'  // Partita Solo con Aiuti su Richiesta (Piena autonomia, ma pulsante "Chiedi Aiuto" attivabile a piacere)
  | 'solo_expert';    // Partita Solo (Nessun aiuto, nessun beacon, pura abilità e realismo)

export interface CustomerData {
  id: string;
  name: string;
  bodyColor: string;
  headColor: string;
  accessory: 'none' | 'glasses' | 'sunglasses' | 'hat' | 'cap' | 'headband' | 'bowtie' | 'tie' | 'necklace';
  expression: 'sad' | 'worried' | 'crying' | 'happy' | 'amazed';
  dialogue: string;
  happyDialogue: string;
  issueType: RepairIssueType;
  reward: number;
  phoneColor: string;
  phoneModelName: string;
  deviceCategory?: 'smartphone' | 'tablet' | 'smartwatch' | 'laptop' | 'console' | 'foldable';
  isSuspiciousSerious?: boolean; // Se true, è un cliente losco / malintenzionato che parla in modo serio e rischioso
  isCityIncidentSeriousCustomer?: boolean; // Se true, il cliente è serio a causa di un incidente in città (ma è un cittadino onesto, non un ladro)
}

export interface ScrewState {
  id: string;
  x: number;
  y: number;
  isRemoved: boolean;
  type: 'bottom' | 'camera_bracket' | 'battery_bracket' | 'speaker_bracket';
  side: 'front' | 'back';
}

export interface WaterDroplet {
  id: string;
  x: number;
  y: number;
  size: number;
  isCleaned: boolean;
}

export interface DisassembledPart {
  id: string;
  name: string;
  category: 'screw' | 'screen' | 'battery' | 'camera' | 'speaker' | 'board' | 'bracket' | 'port' | 'coil' | 'glass';
  icon: string;
  timeRemoved: string;
  conditionPercent?: number; // 0% (frantumato/morto) to 100% (perfetto/nuovo)
  canReplace?: boolean;
  replacementCost?: number; // Cost deducted from repair reward
  isReplaced?: boolean;
  newPartName?: string;
  partKey?: string;
}

export interface OxidationSpot {
  id: string;
  x: number;
  y: number;
  size: number;
  cleaned: boolean;
}

export interface SoftwareGlitchBlock {
  id: string;
  name: string;
  fixed: boolean;
  hexCode: string;
}

export interface RepairContract {
  agreedPrice: number;
  agreedTimeSeconds: number;
  timeRemainingSeconds: number;
  isTimerActive: boolean;
  extraExpenses: number;
  isShortCircuited: boolean;
  customerMood: 'enthusiastic' | 'neutral' | 'hesitant';
  expectationLevel: 'normal' | 'high' | 'ultra'; // Prezzo alto = aspettative altissime!
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  priceCharged: number;
  isSuccess: boolean;
  isLate: boolean;
  date: string;
}

export interface RefurbishedPhoneItem {
  id: string;
  model: string;
  color: string;
  wholesaleCost: number;
  retailPrice: number;
  netProfit: number;
  imageColor: string;
  isLatestGen?: boolean;
}

export interface PhoneRepairState {
  currentSide: 'front' | 'back'; // Front (screen) or Back (cameras & cover)
  bottomScrewsRemoved: boolean;
  isHeated: boolean;
  heatProgress: number; // 0 to 100
  temperature: number; // 25 to 130°C
  heatZones: {
    top: number; // 0 to 100
    right: number;
    bottom: number;
    left: number;
  };
  isOverheated: boolean;
  thermalDamageOccurred: boolean;

  // Screws progressive unscrewing: screwId -> % (0 to 100)
  screwProgress: { [id: string]: number };

  suctionApplied: boolean;
  screenPryProgress: number; // 0 to 100 via "la lastra"
  screenRemoved: boolean;
  newScreenInstalled: boolean;

  // Power state & Safety
  initialPoweredOn: boolean;
  isSafelyPoweredOff: boolean;
  shortCircuitOccurred: boolean;
  extraExpenses: number;

  // Back side (cameras & back cover)
  backCoverHeated: boolean;
  backCoverPryProgress: number; // 0 to 100% apertura scocca posteriore
  backCoverPried: boolean;
  backCoverRemoved: boolean;
  cameraBracketScrewsRemoved: boolean;
  cameraDisconnected: boolean;
  oldCameraRemoved: boolean;
  newCameraInstalled: boolean;

  // Battery
  batteryDisconnected: boolean;
  oldBatteryRemoved: boolean;
  newBatteryInstalled: boolean;

  // Water damage & Oxidation
  waterDroplets: WaterDroplet[];
  oxidationSpots: OxidationSpot[];
  motherboardCleaned: boolean;

  // Deeper disassembly: Motherboard extraction
  motherboardScrewsRemoved: boolean;
  motherboardExtracted: boolean;

  // Disassembled parts organizer tray
  disassembledParts: DisassembledPart[];

  // Software glitch issue
  dongleConnected: boolean;
  softwareFlashProgress: number; // 0 to 100
  firmwareRestored: boolean;

  // Overheating CPU
  oldPasteScraped: boolean;
  newPasteApplied: boolean;

  // Speaker issue
  speakerUnscrewed: boolean;
  oldSpeakerRemoved: boolean;
  newSpeakerInstalled: boolean;

  // +10 Nuovi Guasti
  chargingPortCleaned: boolean;
  chargingPortReplaced: boolean;
  earpieceCleaned: boolean;
  backGlassReplaced: boolean;
  tapticReplaced: boolean;
  volumeButtonsFixed: boolean;
  wifiAntennaConnected: boolean;
  wirelessCoilReplaced: boolean;
  wirelessCoilRemoved?: boolean;
  selfieCameraReplaced: boolean;
  malwareCleaned: boolean;

  // +22 Nuovi Casi di Intervento
  flexCableRepaired?: boolean;
  frameStraightened?: boolean;
  faceIdCleaned?: boolean;
  fingerprintCalibrated?: boolean;
  simTrayFixed?: boolean;
  nfcAntennaFixed?: boolean;
  batteryConnectorFixed?: boolean;
  proximitySensorFixed?: boolean;
  rearMicCleaned?: boolean;
  heatsinkRepaired?: boolean;
  burnInScreenReplaced?: boolean;
  capacitorReplaced?: boolean;
  powerButtonFixed?: boolean;
  gyroCalibrated?: boolean;
  hapticIcFixed?: boolean;
  bluetoothConnected?: boolean;
  hingeCleaned?: boolean;
  ambientSensorFixed?: boolean;
  jackCleared?: boolean;
  laserAutofocusCleaned?: boolean;
  corrodedPointsCleaned?: boolean;
  nandBootFixed?: boolean;

  // Assembly & final test
  isClosed: boolean;
  screwsReinstalled: boolean;
  isPoweredOn: boolean;
  isRepaired: boolean;
}

export interface TutorialStep {
  id: string;
  instruction: string;
  requiredTool: ToolId;
  requiredSide?: 'front' | 'back';
  targetHint: string;
}

export type UpgradeCategory = 'tools' | 'workspace' | 'decorations' | 'showcase_phones';

export interface ShopUpgrade {
  id: string;
  name: string;
  category: UpgradeCategory;
  desc: string;
  cost: number;
  perk: string;
  iconName: string;
  levelRequired?: number;
}

export interface ShopStats {
  money: number;
  reputation: number; // 1.0 to 5.0
  customersServed: number;
  currentDay: number;
  purchasedUpgrades: string[];
  reviews: CustomerReview[];
}
