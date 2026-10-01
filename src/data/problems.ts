import { CustomerData, RepairIssueType, ShopUpgrade } from '../types/game';

export const ALL_REPAIR_TYPES: RepairIssueType[] = [
  'water_damage',
  'broken_screen',
  'bad_camera',
  'dead_battery',
  'software_glitch',
  'overheating_cpu',
  'broken_speaker',
  'combo_water_camera',
  // 10 Nuovi Guasti Precedenti
  'charging_port_dirt',
  'broken_charging_port',
  'clogged_earpiece',
  'cracked_back_glass',
  'broken_taptic_engine',
  'stuck_volume_buttons',
  'wifi_antenna_cut',
  'wireless_charging_burnt',
  'damaged_selfie_camera',
  'malware_spyware_wipe',
  // +22 Nuovi Casi di Intervento
  'damaged_flex_cable',
  'bent_frame_chassis',
  'face_id_sensor_dirty',
  'fingerprint_sensor_fail',
  'sim_tray_jammed',
  'nfc_antenna_broken',
  'battery_connector_loose',
  'proximity_sensor_glitch',
  'rear_mic_noise_cancel',
  'thermal_throttle_heatsink',
  'screen_burn_in_ghost',
  'short_circuit_capacitor',
  'power_button_click_broken',
  'compass_gyro_drift',
  'haptic_driver_ic',
  'bluetooth_drop_connection',
  'foldable_hinge_dirt',
  'front_ambient_light_sensor',
  'headphone_jack_stuck',
  'laser_autofocus_dirty',
  'corroded_test_points',
  'boot_loop_corrupt_nand',
  'laser_lens_shattered',
  'processor_reballing_crack',
  '5g_modem_burnt',
  'oled_flex_torn',
];

export const BODY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', 
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', 
  '#EC4899', '#D946EF', '#14B8A6', '#84CC16'
];

export const ACCESSORIES: CustomerData['accessory'][] = [
  'none', 'glasses', 'sunglasses', 'hat', 'cap', 'headband', 'bowtie', 'tie', 'necklace'
];

export const FIRST_NAMES = [
  'Alessandro', 'Giulia', 'Marco', 'Chiara', 'Matteo', 'Francesca', 'Lorenzo', 'Sara',
  'Davide', 'Elena', 'Andrea', 'Silvia', 'Federico', 'Valentina', 'Gabriele', 'Martina',
  'Simone', 'Federica', 'Luca', 'Giorgia', 'Tommaso', 'Alice', 'Riccardo', 'Sofia',
  'Pietro', 'Aurora', 'Edoardo', 'Beatrice', 'Leonardo', 'Vittoria', 'Giacomo', 'Camilla',
  'Filippo', 'Emma', 'Mattia', 'Greta', 'Diego', 'Ginevra', 'Giovanni', 'Ludovica',
  'Samuele', 'Noemi', 'Christian', 'Bianca', 'Manuel', 'Mia', 'Alessio', 'Gaia',
  'Elio', 'Clara', 'Fabio', 'Arianna', 'Stefano', 'Serena', 'Daniele', 'Ilaria',
  'Vincenzo', 'Michela', 'Paolo', 'Roberta', 'Antonio', 'Cristina', 'Salvatore', 'Sabrina',
  'Massimo', 'Elisa', 'Angelo', 'Monica', 'Roberto', 'Daniela', 'Claudio', 'Simona'
];

export const LAST_NAMES = [
  'Rossi', 'Ferrari', 'Russo', 'Bianchi', 'Romano', 'Gallo', 'Costa', 'Fontana',
  'Conti', 'Esposito', 'Ricci', 'Bruno', 'De Luca', 'Moretti', 'Marino', 'Greco',
  'Barbieri', 'Lombardi', 'Giordano', 'Cassano', 'Colombo', 'Mancini', 'Longo', 'Leone',
  'Martinelli', 'Marchetti', 'Martini', 'Galli', 'Gatti', 'Mariani', 'Ferrara', 'Santoro',
  'Marini', 'Rizzo', 'Villa', 'Serra', 'Ferri', 'Fiore', 'De Angelis', 'Palumbo',
  'Cuneo', 'Gentile', 'Caruso', 'Vitale', 'Sanna', 'Ferraro', 'Piras', 'Pellegrini',
  'Monti', 'Basile', 'Testa', 'Grassi', 'Carbone', 'Rinaldi', 'Amato', 'Silvestri'
];

export const CUSTOMER_AVATARS = [
  '🧑‍💻', '👨‍💼', '👩‍💼', '👩‍🔬', '👨‍🎓', '👩‍🎓', '🧔', '👩‍🦰',
  '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👱‍♂️', '👱‍♀️', '🏃‍♂️', '🏃‍♀️',
  '🎨', '📸', '🎧', '🕶️', '🧑‍🚀', '👩‍⚕️', '👨‍🍳', '👩‍🏫',
  '🕵️‍♂️', '🧕', '🧑‍🔧', '🧑‍🎨'
];

export interface DeviceCatalogItem {
  modelName: string;
  category: 'smartphone' | 'tablet' | 'smartwatch' | 'laptop' | 'console' | 'foldable';
  brand: string;
  colorHex: string;
}

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  // 1. SMARTPHONES
  { modelName: 'Apple iPhone 16 Pro Max (Titanio)', category: 'smartphone', brand: 'Apple', colorHex: '#E2E8F0' },
  { modelName: 'Apple iPhone 15 Pro (Titanio Blu)', category: 'smartphone', brand: 'Apple', colorHex: '#3B82F6' },
  { modelName: 'Samsung Galaxy S25 Ultra (AMOLED 2X)', category: 'smartphone', brand: 'Samsung', colorHex: '#1E293B' },
  { modelName: 'Samsung Galaxy S24+ (Cobalt Violet)', category: 'smartphone', brand: 'Samsung', colorHex: '#8B5CF6' },
  { modelName: 'Google Pixel 9 Pro XL (Gemini Tensor)', category: 'smartphone', brand: 'Google', colorHex: '#F59E0B' },
  { modelName: 'Google Pixel 8a (Bay Blue)', category: 'smartphone', brand: 'Google', colorHex: '#38BDF8' },
  { modelName: 'Xiaomi 15 Ultra (Sensore Leica 1")', category: 'smartphone', brand: 'Xiaomi', colorHex: '#10B981' },
  { modelName: 'Oppo Find X8 Pro (Ottiche Hasselblad)', category: 'smartphone', brand: 'Oppo', colorHex: '#06B6D4' },
  { modelName: 'OnePlus 12 (Emerald Green)', category: 'smartphone', brand: 'OnePlus', colorHex: '#059669' },
  { modelName: 'Nothing Phone (2) (Glyph Matrix)', category: 'smartphone', brand: 'Nothing', colorHex: '#CBD5E1' },
  { modelName: 'Asus ROG Phone 8 Pro (Phantom Black)', category: 'smartphone', brand: 'Asus', colorHex: '#0F172A' },

  // 2. TELEFONI PIEGHEVOLI (FOLDABLE PHONES)
  { modelName: 'Samsung Galaxy Z Fold 6 (Pieghevole Book-Style)', category: 'foldable', brand: 'Samsung', colorHex: '#1E293B' },
  { modelName: 'Google Pixel Fold 2 (Pieghevole OLED Flessibile)', category: 'foldable', brand: 'Google', colorHex: '#334155' },
  { modelName: 'Huawei Mate X5 (Pieghevole Ultra-Slim Dual-Screen)', category: 'foldable', brand: 'Huawei', colorHex: '#C084FC' },
  { modelName: 'OnePlus Open (Pieghevole Hasselblad)', category: 'foldable', brand: 'OnePlus', colorHex: '#10B981' },
  { modelName: 'Samsung Galaxy Z Flip 6 (Pieghevole Clamshell)', category: 'foldable', brand: 'Samsung', colorHex: '#EC4899' },
  
  // 2. SMARTWATCH (Cassa Rotonda / Ultra / Apple Watch / Pixel Watch)
  { modelName: 'Samsung Galaxy Watch 7 Pro (Ghiera Touch)', category: 'smartwatch', brand: 'Samsung', colorHex: '#0EA5E9' },
  { modelName: 'Samsung Galaxy Watch Ultra (Titanio Cuscino)', category: 'smartwatch', brand: 'Samsung', colorHex: '#F97316' },
  { modelName: 'Google Pixel Watch 3 (Display Rotondo Actua)', category: 'smartwatch', brand: 'Google', colorHex: '#F59E0B' },
  { modelName: 'Apple Watch Ultra 2 (Cassa Titanio 49mm)', category: 'smartwatch', brand: 'Apple', colorHex: '#E2E8F0' },
  { modelName: 'Apple Watch Series 10 (Jet Black 46mm)', category: 'smartwatch', brand: 'Apple', colorHex: '#020617' },
  { modelName: 'Garmin Fenix 8 (Solar Sapphire 47mm)', category: 'smartwatch', brand: 'Garmin', colorHex: '#334155' },

  // 3. TABLET
  { modelName: 'Apple iPad Pro 13" M4 (Tandem OLED)', category: 'tablet', brand: 'Apple', colorHex: '#94A3B8' },
  { modelName: 'Samsung Galaxy Tab S10 Ultra (14.6" Dynamic)', category: 'tablet', brand: 'Samsung', colorHex: '#475569' },
  { modelName: 'Apple iPad Air 11" M2 (Liquid Retina)', category: 'tablet', brand: 'Apple', colorHex: '#38BDF8' },
  { modelName: 'Samsung Galaxy Tab S9 FE (Water-Resistant)', category: 'tablet', brand: 'Samsung', colorHex: '#10B981' },

  // 4. LAPTOP & MACBOOK
  { modelName: 'Apple MacBook Pro 16" M3 Max Liquid', category: 'laptop', brand: 'Apple', colorHex: '#CBD5E1' },
  { modelName: 'Dell XPS 15 (Display OLED InfinityEdge)', category: 'laptop', brand: 'Dell', colorHex: '#1E293B' },
  { modelName: 'Apple MacBook Air 15" M3 Midnight', category: 'laptop', brand: 'Apple', colorHex: '#1E1B4B' },
  { modelName: 'HP Pavilion 15 (Ryzen 5)', category: 'laptop', brand: 'HP', colorHex: '#94A3B8' },
  { modelName: 'Lenovo ThinkPad T14 Gen 4', category: 'laptop', brand: 'Lenovo', colorHex: '#334155' },
  { modelName: 'ASUS ZenBook 14 OLED', category: 'laptop', brand: 'ASUS', colorHex: '#0EA5E9' },
  { modelName: 'MSI Katana 15 Gaming', category: 'laptop', brand: 'MSI', colorHex: '#0F172A' },
  { modelName: 'Acer Nitro 5 Gaming', category: 'laptop', brand: 'Acer', colorHex: '#10B981' },
  { modelName: 'Microsoft Surface Laptop 5', category: 'laptop', brand: 'Microsoft', colorHex: '#CBD5E1' },

  // 5. PLAYSTATION CONSOLES (PS1, PS2, PS3, PS4, PS5)
  { modelName: 'Sony PlayStation 1 (PS1 Vintage Console)', category: 'console', brand: 'Sony', colorHex: '#94A3B8' },
  { modelName: 'Sony PlayStation 2 (PS2 Slim / Fat)', category: 'console', brand: 'Sony', colorHex: '#334155' },
  { modelName: 'Sony PlayStation 3 (PS3 YLOD Edition)', category: 'console', brand: 'Sony', colorHex: '#1E293B' },
  { modelName: 'Sony PlayStation 4 Pro (PS4 Jet Black)', category: 'console', brand: 'Sony', colorHex: '#0F172A' },
  { modelName: 'Sony PlayStation 5 (PS5 Disc Edition White)', category: 'console', brand: 'Sony', colorHex: '#F8FAFC' },
];

export const PHONE_MODELS = DEVICE_CATALOG.map(d => d.modelName);

export const PHONE_COLORS = [
  '#38BDF8', '#F59E0B', '#A855F7', '#10B981', '#F97316', 
  '#E2E8F0', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16', '#020617'
];

// Specific issues filtered by hardware compatibility
export const SMARTWATCH_COMPATIBLE_ISSUES: RepairIssueType[] = [
  'broken_screen',           // Display rotondo touch spaccato
  'dead_battery',             // Micro-batteria Li-Po orologio esausta
  'water_damage',             // Infiltrazione d'acqua dopo nuotata
  'software_glitch',          // Bootloop sistema orologio
  'overheating_cpu',          // Chip SiP e pasta termica surriscaldati
  'broken_speaker',           // Micro-altoparlante chiamate al polso muto
  'clogged_earpiece',         // Fori microfono e barometro intasati
  'cracked_back_glass',       // Vetro posteriore sensore cardio / bio-sensori frantumato
  'broken_taptic_engine',     // Motore vibrazione feedback aptico rotto
  'stuck_volume_buttons',     // Digital Crown / Corona rotante o tasto laterale bloccato
  'wifi_antenna_cut',         // Cavo antenna RF Wi-Fi / Bluetooth / GPS tranciato
  'wireless_charging_burnt',  // Bobina Qi magnetica di ricarica wireless bruciata
  'malware_spyware_wipe',     // App sospetta in background
  // Nuovi casi per Smartwatch
  'battery_connector_loose',
  'short_circuit_capacitor',
  'power_button_click_broken',
  'compass_gyro_drift',
  'haptic_driver_ic',
  'bluetooth_drop_connection',
  'corroded_test_points',
  'boot_loop_corrupt_nand',
];

export const SMARTPHONE_COMPATIBLE_ISSUES: RepairIssueType[] = [
  'water_damage', 'broken_screen', 'bad_camera', 'dead_battery', 'software_glitch',
  'overheating_cpu', 'broken_speaker', 'combo_water_camera', 'charging_port_dirt',
  'broken_charging_port', 'clogged_earpiece', 'cracked_back_glass', 'broken_taptic_engine',
  'stuck_volume_buttons', 'wifi_antenna_cut', 'wireless_charging_burnt', 'damaged_selfie_camera',
  'malware_spyware_wipe',
  // +22 Nuovi Casi per Smartphone
  'damaged_flex_cable', 'bent_frame_chassis', 'face_id_sensor_dirty', 'fingerprint_sensor_fail',
  'sim_tray_jammed', 'nfc_antenna_broken', 'battery_connector_loose', 'proximity_sensor_glitch',
  'rear_mic_noise_cancel', 'thermal_throttle_heatsink', 'screen_burn_in_ghost', 'short_circuit_capacitor',
  'power_button_click_broken', 'compass_gyro_drift', 'haptic_driver_ic', 'bluetooth_drop_connection',
  'foldable_hinge_dirt', 'front_ambient_light_sensor', 'headphone_jack_stuck', 'laser_autofocus_dirty',
  'corroded_test_points', 'boot_loop_corrupt_nand',
  'laser_lens_shattered', 'processor_reballing_crack', '5g_modem_burnt', 'oled_flex_torn'
];

export const TABLET_COMPATIBLE_ISSUES: RepairIssueType[] = [
  'water_damage', 'broken_screen', 'bad_camera', 'dead_battery', 'software_glitch',
  'overheating_cpu', 'broken_speaker', 'charging_port_dirt', 'broken_charging_port',
  'clogged_earpiece', 'cracked_back_glass', 'stuck_volume_buttons', 'wifi_antenna_cut',
  'wireless_charging_burnt', 'damaged_selfie_camera', 'malware_spyware_wipe',
  // Nuovi casi per Tablet
  'damaged_flex_cable', 'bent_frame_chassis', 'fingerprint_sensor_fail', 'battery_connector_loose',
  'thermal_throttle_heatsink', 'screen_burn_in_ghost', 'short_circuit_capacitor', 'power_button_click_broken',
  'compass_gyro_drift', 'bluetooth_drop_connection', 'front_ambient_light_sensor', 'headphone_jack_stuck',
  'corroded_test_points', 'boot_loop_corrupt_nand'
];

export const LAPTOP_COMPATIBLE_ISSUES: RepairIssueType[] = [
  'water_damage', 'broken_screen', 'dead_battery', 'software_glitch', 'overheating_cpu',
  'broken_speaker', 'charging_port_dirt', 'broken_charging_port', 'cracked_back_glass',
  'stuck_volume_buttons', 'wifi_antenna_cut', 'damaged_selfie_camera', 'malware_spyware_wipe',
  // Nuovi casi per Laptop
  'damaged_flex_cable', 'thermal_throttle_heatsink', 'short_circuit_capacitor', 'power_button_click_broken',
  'bluetooth_drop_connection', 'headphone_jack_stuck', 'corroded_test_points', 'boot_loop_corrupt_nand'
];

export const CONSOLE_COMPATIBLE_ISSUES: RepairIssueType[] = [
  'overheating_cpu',
  'software_glitch',
  'broken_speaker',
  'processor_reballing_crack',
  'water_damage',
  'short_circuit_capacitor',
  'corroded_test_points',
  'boot_loop_corrupt_nand',
  'broken_charging_port',
  'charging_port_dirt',
  'power_button_click_broken',
  'console_outer_shell_detached',
];

// Helper to get allowed issue types for a given device category
export function getCompatibleIssuesForCategory(category: CustomerData['deviceCategory'] = 'smartphone'): RepairIssueType[] {
  switch (category) {
    case 'smartwatch':
      return SMARTWATCH_COMPATIBLE_ISSUES;
    case 'tablet':
      return TABLET_COMPATIBLE_ISSUES;
    case 'laptop':
      return LAPTOP_COMPATIBLE_ISSUES;
    case 'console':
      return CONSOLE_COMPATIBLE_ISSUES;
    case 'smartphone':
    default:
      return SMARTPHONE_COMPATIBLE_ISSUES;
  }
}

// Generate device-accurate dialogues and issue descriptions
export function getIssueDetails(
  issueType: RepairIssueType,
  index: number = 0,
  category: CustomerData['deviceCategory'] = 'smartphone',
  modelName: string = 'Dispositivo'
): {
  dialogue: string;
  happyDialogue: string;
  reward: number;
} {
  const isWatch = category === 'smartwatch';
  const isTablet = category === 'tablet';
  const isLaptop = category === 'laptop';
  const isConsole = category === 'console';

  const devTerm = isWatch ? 'lo smartwatch' : isTablet ? 'il tablet' : isLaptop ? 'il portatile' : isConsole ? 'la console PlayStation' : 'il telefono';
  const devTermCap = isWatch ? 'Lo smartwatch' : isTablet ? 'Il tablet' : isLaptop ? 'Il portatile' : isConsole ? 'La console PlayStation' : 'Il telefono';
  const devScreenTerm = isWatch ? 'il display rotondo touch' : isTablet ? 'il display da 13"' : isLaptop ? 'il pannello dello schermo' : isConsole ? 'la porta HDMI e uscita video' : 'il display touch OLED';

  switch (issueType) {
    case 'water_damage':
      return {
        dialogue: isWatch
          ? `Aiuto! Ho fatto una nuotata in piscina e ${devTerm} si è riempito d'acqua all'interno dei sensori!`
          : isLaptop
          ? `Disastro! Ho rovesciato una tazza di tè sulla tastiera e ${devTerm} è pieno d'acqua dentro!`
          : `Aiuto! Mi è caduto ${devTerm} nel lavandino mentre lavavo i piatti! È pieno d'acqua dentro!`,
        happyDialogue: `Incredibile! ${devTermCap} è completamente asciutto e sigillato, e si accende! Sei un fenomeno!`,
        reward: 70 + (index * 4),
      };

    case 'broken_screen':
      return {
        dialogue: isWatch
          ? `Ho urtato ${devTerm} contro uno spigolo metallico! Il vetro zaffiro rotondo è frantumato e non risponde al tocco!`
          : `Ho fatto cadere ${devTerm} per le scale! ${devScreenTerm} è frantumato e non risponde al tocco!`,
        happyDialogue: isWatch
          ? `Mamma mia, questo nuovo display rotondo brilla più del sole! Il touch al polso è perfetto!`
          : `Mamma mia, questo nuovo schermo brilla più del sole! Risposta al tocco istantanea! Grazie mille!`,
        reward: 80 + (index * 4),
      };

    case 'bad_camera':
      return {
        dialogue: `Gira ${devTerm} sul retro: ho sbattuto contro uno spigolo e il modulo delle fotocamere posteriori è distrutto!`,
        happyDialogue: `Wow, le nuove lenti posteriori sono limpidissime! Posso tornare a fare foto e video 4K nitidissimi!`,
        reward: 90 + (index * 4),
      };

    case 'dead_battery':
      return {
        dialogue: isWatch
          ? `La micro-batteria Li-Po dell'orologio è esausta: dura appena 20 minuti prima di spegnersi!`
          : `La batteria è gonfia come un cuscinetto e ${devTerm} dura appena 2 minuti prima di spegnersi!`,
        happyDialogue: isWatch
          ? `Perfetto, la nuova batteria dell'orologio tiene la carica per giorni interi! Lavoro pulitissimo!`
          : `Perfetto, ora la scocca è piatta e la batteria è al 100%! Autonomia raddoppiata!`,
        reward: 75 + (index * 4),
      };

    case 'software_glitch':
      return {
        dialogue: `${devTermCap} è impazzito! C'è un glitch software con codice cifrato e loop infinito di riavvio (bootloop)!`,
        happyDialogue: `Sei riuscito a fare il flash del firmware senza perdere i miei file! Funziona a meraviglia!`,
        reward: 100 + (index * 4),
      };

    case 'overheating_cpu':
      return {
        dialogue: `Il processore scotta come una fornace e ${devTerm} va in protezione termica spegnendosi dopo 30 secondi!`,
        happyDialogue: `La temperatura ora è glaciale! La nuova pasta termica ha salvato il processore da fusione certa!`,
        reward: 110 + (index * 4),
      };

    case 'broken_speaker':
      return {
        dialogue: isWatch
          ? `Nelle chiamate al polso non sento nulla e l'altoparlante dello smartwatch gracchia fortissimo!`
          : `Durante le chiamate e l'audio multimediale la cassa gracchia come una radio rotta degli anni 50!`,
        happyDialogue: `Audio cristallino a 360 gradi! Il nuovo altoparlante suona benissimo!`,
        reward: 85 + (index * 4),
      };

    case 'combo_water_camera':
      return {
        dialogue: `Disastro totale al lago: ${devTerm} è caduto sott'acqua, le lenti hanno condensa e il circuito è ossidato!`,
        happyDialogue: `Un miracolo della tecnologia! Pensavo fosse da buttare, l'hai resuscitato!`,
        reward: 140 + (index * 4),
      };

    case 'charging_port_dirt':
      return {
        dialogue: `Il cavo di ricarica USB-C traballa, non entra a fondo e si disconnette ogni 3 secondi per lanugine e sporco!`,
        happyDialogue: `Incredibile, hai pulito la presa USB-C a fondo e ora il cavo fa un click solidissimo! Ricarica rapida al 100%!`,
        reward: 60 + (index * 3),
      };

    case 'broken_charging_port':
      return {
        dialogue: `Ho inciampato nel cavo collegato e ho strappato i pin interni della porta di ricarica! Non passa più corrente!`,
        happyDialogue: `Nuovo sub-board di ricarica impeccabile! La carica QuickCharge funziona perfettamente!`,
        reward: 95 + (index * 4),
      };

    case 'clogged_earpiece':
      return {
        dialogue: isWatch
          ? `I fori del microfono e del barometro dello smartwatch sono intasati da polvere e sudore: l'assistente vocale non mi sente!`
          : `Nelle chiamate all'orecchio non sento nulla se non un sussurro flebile! La capsula auricolare superiore è intasata!`,
        happyDialogue: isWatch
          ? `Ora il microfono registra alla perfezione e i sensori barometrici sono pulitissimi!`
          : `Ora la voce dell'interlocutore si sente forte e chiara! Ottima pulizia della griglia acustica!`,
        reward: 65 + (index * 3),
      };

    case 'cracked_back_glass':
      return {
        dialogue: isWatch
          ? `Guardalo sul retro: il vetro ceramico dei sensori cardio e frequenza cardiaca è spaccato a ragnatela e graffia il polso!`
          : `Guardalo dietro: la scocca posteriore in vetro è spaccata a ragnatela e mi taglia le dita ogni volta che lo impugno!`,
        happyDialogue: isWatch
          ? `La scocca posteriore con i nuovi sensori biometrici cardio è liscia e perfetta! Misura i battiti al 100%!`
          : `La scocca posteriore nuova è scintillante e liscia come la seta! Sembra appena uscito dalla fabbrica!`,
        reward: 85 + (index * 4),
      };

    case 'broken_taptic_engine':
      return {
        dialogue: isWatch
          ? `Quando ricevo una notifica al polso l'orologio emette una vibrazione metallica stridula fastidiosissima!`
          : `Quando ricevo una notifica ${devTerm} emette un ronzio stridulo e metallico come un frullatore impazzito!`,
        happyDialogue: `Il nuovo motore aptico ha un feedback secco e morbido degno di un top di gamma!`,
        reward: 80 + (index * 4),
      };

    case 'stuck_volume_buttons':
      return {
        dialogue: isWatch
          ? `La ghiera rotante (Digital Crown) e il tasto laterale dello smartwatch sono bloccati e non girano più!`
          : `I tasti laterali del volume sono incastrati nella scocca per lo sporco e il volume continua a scendere da solo!`,
        happyDialogue: isWatch
          ? `La corona digitale ora gira fluida con uno scatto meccanico perfetto!`
          : `I bilancieri del volume ora hanno un click scattante e preciso! Problema risolto al 100%!`,
        reward: 65 + (index * 3),
      };

    case 'wifi_antenna_cut':
      return {
        dialogue: `${devTermCap} non aggancia più nessuna rete Wi-Fi, Bluetooth o segnale se non a 2 centimetri dal router!`,
        happyDialogue: `Segnale a 5 tacche piene e connessione fulminea! Sei un mago delle telecomunicazioni!`,
        reward: 90 + (index * 4),
      };

    case 'wireless_charging_burnt':
      return {
        dialogue: isWatch
          ? `Sulla basetta magnetica di ricarica lo smartwatch scotta tantissimo ma la percentuale non sale mai! La bobina Qi è bruciata!`
          : `Sulla basetta wireless il retro scotta ma la batteria non carica affatto! La bobina Qi posteriore è andata in fumo!`,
        happyDialogue: `La nuova bobina wireless a induzione magnetica aggancia la carica in mezzo secondo! Magnifico!`,
        reward: 105 + (index * 4),
      };

    case 'damaged_selfie_camera':
      return {
        dialogue: `Il sensore della fotocamera frontale è opacizzato e graffiato: tutte le videochiamate sono annebbiate!`,
        happyDialogue: `Fotocamera frontale nitidissima a 60fps! I miei interlocutori ringraziano!`,
        reward: 85 + (index * 4),
      };

    case 'malware_spyware_wipe':
      return {
        dialogue: `Ho scaricato un'app o file sospetto: ${devTerm} scalda, spara popup pubblicitari e c'è un processo nascosto che prosciuga la batteria!`,
        happyDialogue: `Cyber-Dongle ha bonificato ogni traccia di trojan e adware! Il sistema operativo è scattante come nuovo!`,
        reward: 115 + (index * 4),
      };

    // +22 Nuovi Casi di Intervento Dettagliati
    case 'damaged_flex_cable':
      return {
        dialogue: `Il cavo piatto flex FPC di collegamento tra scheda madre e connettori inferiori si è lesionato dopo una caduta: lo schermo sfarfalla e non carica!`,
        happyDialogue: `Nuovo cavo flat flessibile installato con pin dorati perfetti! Nessuno sfarfallio e segnale stabilissimo!`,
        reward: 85 + (index * 4),
      };

    case 'bent_frame_chassis':
      return {
        dialogue: `Mi sono seduto con ${devTerm} nella tasca posteriore dei pantaloni e il telaio in alluminio/titanio si è piegato ad arco!`,
        happyDialogue: `Incredibile raddrizzatura del telaio e nuova scocca allineata al millimetro senza fessure!`,
        reward: 95 + (index * 4),
      };

    case 'face_id_sensor_dirty':
      return {
        dialogue: `Il sensore biometrico Face ID e proiettore di punti TrueDepth è oscurato da polvere interna: non riconosce più il mio volto!`,
        happyDialogue: `Ottiche infrarossi pulite con micro-pennello e alcool IPA: sblocco facciale istantaneo in 0.1 secondi!`,
        reward: 80 + (index * 3),
      };

    case 'fingerprint_sensor_fail':
      return {
        dialogue: `Il lettore d'impronte digitali sotto al display non rileva più il dito o dà errore di calibrazione hardware continuo!`,
        happyDialogue: `Ricalibrazione ottica eseguita tramite dongle diagnostico: l'impronta si sblocca al primo tocco!`,
        reward: 75 + (index * 3),
      };

    case 'sim_tray_jammed':
      return {
        dialogue: `Ho inserito un adattatore SIM tagliato male e il carrellino Nano-SIM è rimasto incastrato dentro bloccando i pin dorati!`,
        happyDialogue: `Carrellino estratto delicatamente con le micro-pinzette senza danneggiare i pin del lettore SIM!`,
        reward: 60 + (index * 3),
      };

    case 'nfc_antenna_broken':
      return {
        dialogue: `Quando provo a pagare con Google Pay o Apple Pay al supermercato il POS non rileva ${devTerm}: l'antenna NFC interna è spezzata!`,
        happyDialogue: `Nuovo modulo antenna NFC montato sul telaio: pagamenti contactless fulminei al primo passaggio!`,
        reward: 90 + (index * 4),
      };

    case 'battery_connector_loose':
      return {
        dialogue: isWatch
          ? `Lo smartwatch si spegne improvvisamente a ogni movimento brusco del polso: la clip del connettore batteria è allentata!`
          : `${devTermCap} si spegne all'improvviso ogni volta che lo appoggio sul tavolo: il connettore a scatto della batteria si è sganciato!`,
        happyDialogue: `Connettore batteria serrato, risaldato e protetto con nastro isolante Kapton! Alimentazione stabilissima!`,
        reward: 70 + (index * 3),
      };

    case 'proximity_sensor_glitch':
      return {
        dialogue: `Durante le telefonate il display non si spegne quando lo avvicino all'orecchio e continuo a premere tasti con la guancia!`,
        happyDialogue: `Sensore di prossimità pulito e ricalibrato: lo schermo si spegne subito durante la chiamata!`,
        reward: 65 + (index * 3),
      };

    case 'rear_mic_noise_cancel':
      return {
        dialogue: `Nei video registrati l'audio è ovattato e i videochiamanti sentono un fruscio fastidioso: il microfono secondario di soppressione rumore è intasato!`,
        happyDialogue: `Griglia microfono posteriore liberata e membrana acustica ripulita: cancellazione del rumore impeccabile!`,
        reward: 70 + (index * 3),
      };

    case 'thermal_throttle_heatsink':
      return {
        dialogue: `La camera di vapore e il pad termico in grafite si sono scollati: il processore va in thermal throttling tagliando le prestazioni a metà!`,
        happyDialogue: `Nuovo heatsink in rame e pad termico a contatto diretto: temperature scese di oltre 20 gradi!`,
        reward: 100 + (index * 4),
      };

    case 'screen_burn_in_ghost':
      return {
        dialogue: `Dopo aver usato il navigatore GPS per ore sotto il sole, il pannello OLED ha un ghosting permanente impresso sui pixel!`,
        happyDialogue: `Nuovo pannello OLED Super Retina montato: colori uniformi, neri assoluti e zero ritenzione d'immagine!`,
        reward: 110 + (index * 4),
      };

    case 'short_circuit_capacitor':
      return {
        dialogue: `Il dispositivo è morto improvvisamente, si scalda e non dà alcun segno di vita quando provo ad accenderlo!`,
        happyDialogue: `Corto individuato con termocamera e componente difettoso sostituito: scheda madre salvata e pienamente funzionante!`,
        reward: 130 + (index * 4),
      };

    case 'power_button_click_broken':
      return {
        dialogue: `Il pulsante di accensione (Power) è sprofondato nella scocca: la cupoletta metallica a scatto interna si è rotta e non fa più click!`,
        happyDialogue: `Nuovo flex con cupoletta metallica tasto Power installato: click secco, tattile e immediato!`,
        reward: 75 + (index * 3),
      };

    case 'compass_gyro_drift':
      return {
        dialogue: isWatch
          ? `La bussola e l'altimetro dello smartwatch sono impazziti: la freccia di orientamento gira a vuoto!`
          : `Le mappe e i giochi in realtà aumentata hanno il giroscopio sballato: la bussola punta nella direzione opposta!`,
        happyDialogue: `Sensori IMU e magnetometro ricalibrati con successo: puntamento e orientamento perfetti!`,
        reward: 80 + (index * 3),
      };

    case 'haptic_driver_ic':
      return {
        dialogue: `Fa uno strano ronzio metallico fastidioso e acuto ogni volta che riceve una notifica o vibra!`,
        happyDialogue: `Modulo di vibrazione e circuito di pilotaggio riparati: feedback vibrazionale vellutato e silenzioso!`,
        reward: 95 + (index * 4),
      };

    case 'bluetooth_drop_connection':
      return {
        dialogue: `Gli auricolari wireless e lo smartwatch si disconnettono in continuazione ogni 10 secondi!`,
        happyDialogue: `Connessione Bluetooth ristabilita e stabile: raggio d'azione di oltre 15 metri senza cadute di linea!`,
        reward: 85 + (index * 3),
      };

    case 'foldable_hinge_dirt':
      return {
        dialogue: `La cerniera dello smartphone pieghevole scricchiola e si blocca a metà a causa della sabbia penetrata nel meccanismo!`,
        happyDialogue: `Meccanismo della cerniera pulito e lubrificato: apertura pieghevole fluida come seta!`,
        reward: 120 + (index * 4),
      };

    case 'front_ambient_light_sensor':
      return {
        dialogue: `La regolazione automatica della luminosità non funziona: lo schermo resta sempre troppo scuro o troppo luminoso!`,
        happyDialogue: `Sensore di luminosità True Tone ripulito e ricalibrato: luminosità dinamica perfetta per gli occhi!`,
        reward: 70 + (index * 3),
      };

    case 'headphone_jack_stuck':
      return {
        dialogue: `La punta metallica di un jack audio si è spezzata all'interno del foro e il dispositivo pensa di avere sempre le cuffie inserite!`,
        happyDialogue: `Moncone metallico estratto con cura: altoparlante e jack di nuovo perfettamente operativi!`,
        reward: 65 + (index * 3),
      };

    case 'laser_autofocus_dirty':
      return {
        dialogue: `La fotocamera scatta foto sfocate a distanza ravvicinata: il vetrino posteriore è sporco o opacizzato!`,
        happyDialogue: `Finestra ottica pulita e sgrassata: autofocus rapido e scatti nitidissimi!`,
        reward: 75 + (index * 3),
      };

    case 'corroded_test_points':
      return {
        dialogue: `Fa i capricci e non funziona bene quando lo muovo; sembra che ci sia un falso contatto nei collegamenti interni!`,
        happyDialogue: `Contatti interni puliti e risanati: continuità elettrica ripristinata al 100%!`,
        reward: 90 + (index * 4),
      };

    case 'boot_loop_corrupt_nand':
      return {
        dialogue: `Si accende mostrando solo il logo iniziale e poi si riavvia in continuazione senza mai avviarsi del tutto!`,
        happyDialogue: `Sistema operativo ripristinato e riparato senza perdita di dati!`,
        reward: 125 + (index * 4),
      };

    case 'laser_lens_shattered':
      return {
        dialogue: `La lente della fotocamera dello zoom è completamente frantumata e le foto vengono tutte mosse!`,
        happyDialogue: `Nuovo gruppo lenti con rivestimento in zaffiro montato: zoom cristallino e stabilizzato!`,
        reward: 135 + (index * 4),
      };

    case 'processor_reballing_crack':
      return {
        dialogue: `Dopo una brutta caduta a terra, il dispositivo non si accende più in nessun modo ed è completamente bloccato!`,
        happyDialogue: `Scheda principale riparata con stazione ad aria calda: riavvio perfetto!`,
        reward: 155 + (index * 5),
      };

    case '5g_modem_burnt':
      return {
        dialogue: `Non c'è verso di avere campo o navigare su internet, il segnale è morto del tutto da ieri sera!`,
        happyDialogue: `Modulo di rete sostituito e riparato: campo 5G a pieno regime!`,
        reward: 145 + (index * 4),
      };

    case 'oled_flex_torn':
      return {
        dialogue: `Lo schermo è diventato completamente nero dopo un urto ma si sente che il dispositivo vibra ancora!`,
        happyDialogue: `Nuovo display di ricambio installato: immagini spettacolari e touch reattivo!`,
        reward: 140 + (index * 4),
      };

    case 'console_outer_shell_detached':
      return {
        dialogue: `La chiocca esterna e le paratie laterali della console si staccano continuamente e ballano quando accendo il lettore!`,
        happyDialogue: `Chiocca esterna e scocca fissata saldamente con nuove clip di ancoraggio: solida e stabile!`,
        reward: 110 + (index * 4),
      };

    default:
      return {
        dialogue: `Ho un problema hardware con ${devTerm} e ho bisogno di una riparazione esperta!`,
        happyDialogue: `Riparazione perfetta! Funziona come appena comprato!`,
        reward: 80 + (index * 4),
      };
  }
}

export const CITY_INCIDENTS = [
  {
    title: "⚠️ Incidente Sulla Tangenziale & Blackout in Città",
    content: "Un grave incidente stradale sulla tangenziale ha causato rallentamenti e disservizi alle linee di comunicazione. I cittadini che si recano nei negozi oggi appaiono visibilmente più seri, formali e tesi a causa dei disagi."
  },
  {
    title: "⚡ Guasto alla Sottostazione Elettrica Municipale",
    content: "Un blackout temporaneo nel quartiere commerciale ha messo fuori uso diversi terminali elettronici. Molti residenti arrivano in laboratorio con toni seri e preoccupati, ma estranei a qualsiasi attività illecita."
  },
  {
    title: "📰 Lavori Straordinari e Allerta Metrò in Centro",
    content: "La chiusura temporanea della linea metropolitana centrale ha generato lunghe code e apprensione tra i pendolari. Le persone sono serie e concentrate sulle proprie urgenze lavorative e personali."
  }
];

// Generate a random customer with strictly compatible issue for their device category
export function generateRandomCustomer(index: number = 0, enableSuspicious: boolean = false): CustomerData {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const fullName = `${firstName} ${lastName}`;
  
  const bodyColor = BODY_COLORS[Math.floor(Math.random() * BODY_COLORS.length)];
  const headColor = bodyColor;
  const accessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)];
  
  // Decide if this customer is city incident serious (innocent citizen) or suspicious criminal
  const isCityIncident = enableSuspicious && Math.random() < 0.38;
  const isCityIncidentSeriousCustomer = isCityIncident;
  const isSuspiciousSerious = enableSuspicious && !isCityIncident && Math.random() < 0.25;

  let dialogue = '';
  let happyDialogue = '';

  // 30% probability to pick a PlayStation console
  let devItem: DeviceCatalogItem;
  const playstations = DEVICE_CATALOG.filter(d => d.category === 'console');
  if (Math.random() < 0.30 && playstations.length > 0) {
    devItem = playstations[Math.floor(Math.random() * playstations.length)];
  } else {
    devItem = DEVICE_CATALOG[Math.floor(Math.random() * DEVICE_CATALOG.length)];
  }
  const model = devItem.modelName;
  const phoneColor = devItem.colorHex || PHONE_COLORS[Math.floor(Math.random() * PHONE_COLORS.length)];

  // Pick issue type compatible strictly with this device category!
  const compatibleIssues = getCompatibleIssuesForCategory(devItem.category);
  const issueType = compatibleIssues[Math.floor(Math.random() * compatibleIssues.length)];
  
  // Random reward variation (budget)
  const budgetVariance = Math.floor((Math.random() - 0.5) * 16);
  const details = getIssueDetails(issueType, index, devItem.category, model);

  if (isSuspiciousSerious) {
    const seriousDialogues = [
      `Senti, mi serve questo dispositivo sbloccato immediatamente e senza fare troppe domande. Non voglio fattura né ricevuta, capito?`,
      `Ho bisogno che ripari questo apparecchio in silenzio. Se qualcuno chiede, tu non mi hai mai visto e non hai mai aperto questo oggetto.`,
      `Fai in fretta con la riparazione e non azzardarti a controllare cosa c'è dentro la memoria o sono guai seri per te.`,
      `Questo terminale apparteneva a un "socio" che ora non può venire a riprenderlo. Riparalo subito e senza fiatare.`
    ];
    dialogue = seriousDialogues[Math.floor(Math.random() * seriousDialogues.length)];
    happyDialogue = `Ottimo lavoro... adesso me ne vado prima che qualcuno ci veda. (Ha lasciato il compenso ma aveva una faccia sospetta)`;
  } else if (isCityIncidentSeriousCustomer) {
    const incidentDialogues = [
      `Con tutto il caos dell'incidente di stamattina in città, ho assoluto bisogno di questo telefono funzionante per avvisare la famiglia. Mi scusi se ho un tono serio.`,
      `Giornata nera per via dei disservizi in centro. Potrebbe fare il prima possibile? Ho i minuti contati e molta ansia per la situazione.`,
      `Le notizie di cronaca di oggi mi hanno messo in agitazione. Mi ripari questo apparecchio con cura, la prego.`,
      `La situazione fuori è tesa e formale. Ho bisogno del dispositivo operativo senza perdite di tempo.`
    ];
    dialogue = incidentDialogues[Math.floor(Math.random() * incidentDialogues.length)];
    happyDialogue = `La ringrazio di cuore. Questa riparazione mi solleva da un grosso peso in un giorno così difficile.`;
  } else {
    dialogue = details.dialogue;
    happyDialogue = details.happyDialogue;
  }

  return {
    id: `cust-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    name: fullName,
    bodyColor,
    headColor,
    accessory,
    expression: (isSuspiciousSerious || isCityIncidentSeriousCustomer) ? 'worried' : (index % 2 === 0 ? 'crying' : 'worried'),
    dialogue,
    happyDialogue,
    issueType,
    reward: Math.max(50, details.reward + budgetVariance),
    phoneColor,
    phoneModelName: model,
    deviceCategory: devItem.category,
    isSuspiciousSerious,
    isCityIncidentSeriousCustomer,
  };
}

// Creates a fresh randomized initial customer pool so no two game launches start identically!
export function createRandomizedCustomerPool(count: number = 14, enableSuspicious: boolean = false): CustomerData[] {
  const pool: CustomerData[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(generateRandomCustomer(i, enableSuspicious));
  }
  return pool;
}

export const INITIAL_CUSTOMERS: CustomerData[] = createRandomizedCustomerPool(14);

export function generateNextCustomer(index: number, enableSuspicious: boolean = false): CustomerData {
  return generateRandomCustomer(index, enableSuspicious);
}

// UPGRADES CATALOG WITH 4 CATEGORIES: BETTER TOOLS, WORKSPACE EXPANSION, BALCONY DECORATIONS, SHOWCASE FLAGSHIPS
export const SHOP_UPGRADES: ShopUpgrade[] = [
  // --- CATEGORY 1: BETTER TOOLS ---
  {
    id: 'tool_laser_heatgun',
    name: 'Pistola Termica Laser Ultra-Speed',
    category: 'tools',
    desc: 'Scalda l\'adesivo dei telefoni istantaneamente (+100% velocità riscaldamento).',
    cost: 130,
    perk: 'Riscaldamento colla 2x più rapido',
    iconName: 'Flame',
  },
  {
    id: 'tool_titanium_screws',
    name: 'Cacciavite Elettrico Magnetico in Titanio',
    category: 'tools',
    desc: 'Svita e blocca le viti al tocco senza perdere tempo, con attacco magnetico al neodimio.',
    cost: 160,
    perk: 'Svitamento istantaneo con click',
    iconName: 'Wrench',
  },
  {
    id: 'tool_cyber_dongle_v2',
    name: 'Cyber-Dongle Diagnostico Quantum',
    category: 'tools',
    desc: 'Terminal ad alta frequenza che azzera i glitch software ed esegue il re-flash in metà tempo.',
    cost: 190,
    perk: 'Flash software firmware 2x più veloce',
    iconName: 'Cpu',
  },
  {
    id: 'tool_precision_tweezers',
    name: 'Pinzette Nanotech in Fibra di Carbonio',
    category: 'tools',
    desc: 'Presa millimetrica sui connettori a nastro e sulle lenti delicate.',
    cost: 140,
    perk: 'Zero rischio di strappare i cavi flex',
    iconName: 'Scissors',
  },

  // --- CATEGORY 2: WORKSPACE EXPANSION ---
  {
    id: 'work_expanded_mat',
    name: 'Banco ESD Allargato con Vassoio Magnetico',
    category: 'workspace',
    desc: 'Tappetino siliconico professionale spazioso con slot dedicati per non perdere mai una vite.',
    cost: 210,
    perk: '+15% bonus velocità riparazioni',
    iconName: 'Layers',
  },
  {
    id: 'work_dual_monitor',
    name: 'Doppio Display Schemi Elettrici 3D',
    category: 'workspace',
    desc: 'Schermo olografico sul banco che mostra la radiografia a raggi X dei telefoni.',
    cost: 280,
    perk: 'Evidenziazione automatica dei componenti guasti',
    iconName: 'Monitor',
  },
  {
    id: 'work_ultrasonic_cleaner',
    name: 'Vasca di Lavaggio Ultrasonico da Laboratorio',
    category: 'workspace',
    desc: 'Camera di deossidazione per circuiti a bagno isopropilico automatizzata.',
    cost: 320,
    perk: 'Asciugatura e pulizia istantanea da liquidi',
    iconName: 'Sparkles',
  },

  // --- CATEGORY 3: SHOP BALCONY DECORATIONS & CUSTOMER ATTRACTION ---
  {
    id: 'decor_neon_sign',
    name: 'Insegna Neon 3D "Clinica Smartphone"',
    category: 'decorations',
    desc: 'Insegna luminosa al neon animata posta sul balcone del negozio che attira frotte di clienti curiosi.',
    cost: 240,
    perk: '+25% mance e clienti con budget più alto',
    iconName: 'Lightbulb',
  },
  {
    id: 'decor_balcony_leds',
    name: 'Illuminazione LED RGB Sotto il Bancone',
    category: 'decorations',
    desc: 'Striscia LED pulsante sotto la vetrina espositiva con telefoni ricondizionati.',
    cost: 175,
    perk: 'Eleva la reputazione del negozio a 5 stelle ⭐',
    iconName: 'Palette',
  },
  {
    id: 'decor_espresso_machine',
    name: 'Macchina Espresso d\'Epoca per i Clienti',
    category: 'decorations',
    desc: 'Caffè omaggio per le persone in coda al bancone: aumenta la pazienza e l\'entusiasmo!',
    cost: 220,
    perk: 'Clienti sempre felici e feedback positivo garantito',
    iconName: 'Coffee',
  },
  {
    id: 'decor_cyber_plant',
    name: 'Bonsai Botanico Idroponico sul Balcone',
    category: 'decorations',
    desc: 'Dona un\'atmosfera accogliente ed elegante alla facciata del negozio.',
    cost: 150,
    perk: '+10% ricompensa su ogni riparazione',
    iconName: 'Flower2',
  },

  // --- CATEGORY 4: ULTIMA GENERAZIONE TOP SMARTPHONES IN SHOWCASE (Request 8) ---
  {
    id: 'showcase_fold_ultra',
    name: 'Vetrina Top: Quantum Z-Fold Ultra 2026',
    category: 'showcase_phones',
    desc: 'Piazza in esposizione il pieghevole top di gamma a schermo acceso OLED fluido: attira compratori di lusso!',
    cost: 350,
    perk: '+50% richieste acquisto smartphone ricondizionati e compravendita',
    iconName: 'Smartphone',
  },
  {
    id: 'showcase_titanium_ai',
    name: 'Vetrina Top: Titanium Cyber-AI Max 5G',
    category: 'showcase_phones',
    desc: 'Smartphone ammiraglia in titanio con schermo acceso e app olografiche esposte al pubblico.',
    cost: 420,
    perk: 'Clienti con budget raddoppiato (+40% offerte riparazione)',
    iconName: 'Sparkles',
  },
  {
    id: 'showcase_holo_vision',
    name: 'Vetrina Top: Apex HoloGlass Sapphire Edition',
    category: 'showcase_phones',
    desc: 'Dispositivo di ultimissima generazione in vetro zaffiro trasparente con schermo a colori visibile da tutta la piazza.',
    cost: 490,
    perk: '+0.5⭐ reputazione permanente e mance raddoppiate',
    iconName: 'Star',
  },
];
