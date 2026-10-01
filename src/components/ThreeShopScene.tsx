import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CustomerData, ShopStats } from '../types/game';

interface ThreeShopSceneProps {
  currentCustomer: CustomerData;
  nextCustomers: CustomerData[];
  stats: ShopStats;
  isDeliveringRepairedPhone: boolean;
  onPhoneClick: () => void;
  phonePlaced: boolean;
}

function drawLCDAdvertisingScreen(ctx: CanvasRenderingContext2D, time: number) {
  const width = 1024;
  const height = 576; // Full 16:9 HD Display Screen

  // Cycle between 3 Apple & Smartwatch tech ads every 6 seconds
  const cycle = (time * 0.16) % 3;
  const adIndex = Math.floor(cycle);

  // Deep glossy dark glass backdrop
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Outer bezel neon glow border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  if (adIndex === 0) {
    // AD 1: Apple iPhone 16 Pro & Apple Watch Ultra Ad
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.35, '#0f244a');
    bgGrad.addColorStop(0.7, '#1e3a8a');
    bgGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(14, 14, width - 28, height - 28);

    // Glowing Apple Logo & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(' APPLE iPHONE & WATCH ULTRA', 50, 75);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('⚡ DISPLAY OLED SUPER RETINA 120Hz • VETRO TITANIUM', 50, 130);

    // Promotional Bullet Features
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✓ CHIP A18 PRO 3nm • ACCIAIO AEROSPAZIALE & CERAMIC SHIELD', 50, 195);
    ctx.fillText('✓ SOSTITUZIONE DISPLAY & BATTERIA LI-ION SOTTO I 15 MINUTI', 50, 255);
    ctx.fillText('✓ RICAMBI ORIGINALI OEM CERTIFICATI • GARANZIA 24 MESI', 50, 315);

    // Bottom Badge Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(45, 365, 580, 150);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 365, 580, 150);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('⭐ CENTRO ASSISTENZA AUTORIZZATO', 65, 415);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DIAGNOSTICA HARDWARE GRATUITA AL BANCONE', 65, 460);
    ctx.fillText('RICARICA WIRELESS MAGSAFE FAST CHARGE TESTATA', 65, 495);

    // Animated Activity Rings on Right
    const ringX = 810;
    const ringY = 285;
    const ringAngle = time * 2.2;

    ctx.lineWidth = 22;
    // Move (Red)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ringX, ringY, 135, -Math.PI / 2, -Math.PI / 2 + (Math.sin(ringAngle) * 0.35 + 0.8) * Math.PI * 1.8);
    ctx.stroke();

    // Exercise (Green)
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(ringX, ringY, 102, -Math.PI / 2, -Math.PI / 2 + (Math.cos(ringAngle) * 0.35 + 0.75) * Math.PI * 1.8);
    ctx.stroke();

    // Stand (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(ringX, ringY, 68, -Math.PI / 2, -Math.PI / 2 + 1.65 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FITNESS+', ringX, ringY + 8);

  } else if (adIndex === 1) {
    // AD 2: Smartwatch & Sapphire Glass Specialist Ad
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#042f2e');
    bgGrad.addColorStop(0.35, '#064e3b');
    bgGrad.addColorStop(0.7, '#047857');
    bgGrad.addColorStop(1, '#0d9488');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(14, 14, width - 28, height - 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⌚ SMARTWATCH & TABLET SPECIALIST', 50, 75);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('❤️ SENSORI CARDIO 3D • IMPERMEABILE IP68 50M • RICARICA QI', 50, 130);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✓ CRISTALLO ZAFFIRO ANTIGRAFFIO MIL-STD-810H', 50, 195);
    ctx.fillText('✓ SOSTITUZIONE BOBINE QI WIRELESS & BATTERIE LI-PO', 50, 255);
    ctx.fillText('✓ TEST DI TENUTA STAGNA & CALIBRAZIONE BAROMETRO', 50, 315);

    // Bottom Badge Banner
    ctx.fillStyle = 'rgba(6, 78, 59, 0.75)';
    ctx.fillRect(45, 365, 580, 150);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 365, 580, 150);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('🛡️ RIPARAZIONI SMARTWATCH VELOCI', 65, 415);
    ctx.fillStyle = '#ecfdf5';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('MICRO-COMPONENTI ORIGINALI A STOCK', 65, 460);
    ctx.fillText('GARANZIA DIRETTA 12 MESI SU TUTTI GLI INTERVENTI', 65, 495);

    // Heart Rate ECG Pulse Wave line animation on right
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 8;
    ctx.beginPath();
    const startX = 660;
    const centerY = 280;
    ctx.moveTo(startX, centerY);
    for (let x = 0; x < 320; x += 6) {
      let py = centerY;
      const pulsePhase = (x + time * 240) % 240;
      if (pulsePhase > 80 && pulsePhase < 95) py -= 80;
      else if (pulsePhase >= 95 && pulsePhase < 110) py += 90;
      else if (pulsePhase >= 110 && pulsePhase < 125) py -= 40;
      ctx.lineTo(startX + x, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('❤️ 72 BPM • LIVE', 820, centerY + 160);

  } else {
    // AD 3: JTAG Firmware & Micro-Soldering Hardware Ad
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#2e1065');
    bgGrad.addColorStop(0.35, '#4c1d95');
    bgGrad.addColorStop(0.7, '#6b21a8');
    bgGrad.addColorStop(1, '#a21caf');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(14, 14, width - 28, height - 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔬 HARDWARE & MICRO-SALDATURE BGA', 50, 75);

    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('⚡ RECOVERY BOOTLOOP • FIRMWARE DONGLE USB • RECUPERO DATI', 50, 130);

    ctx.fillStyle = '#f5d0fe';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✓ RIPRISTINO NAND FLASH • REBALLING CHIP SOC 3nm', 50, 195);
    ctx.fillText('✓ SALDATURE LASER DI PRECISIONE SU CONNETTORI FPC', 50, 255);
    ctx.fillText('✓ TRATTAMENTO ANTI-CORROSIONE DOPO CADUTA IN ACQUA', 50, 315);

    // Bottom Badge Banner
    ctx.fillStyle = 'rgba(76, 29, 149, 0.75)';
    ctx.fillRect(45, 365, 580, 150);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 365, 580, 150);

    ctx.fillStyle = '#fbcfe8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('💻 LABORATORIO ELETTRONICA SPECIALIZZATO', 65, 415);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('ATTREZZATURA TERMO-REGOLATA DI LIVELLO 3', 65, 460);
    ctx.fillText('SUCCESS RATE AL 98.4% SU SCHEDE MADRI OSSIDATE', 65, 495);

    // Tech Matrix Grid on Right
    for (let gx = 0; gx < 6; gx++) {
      for (let gy = 0; gy < 5; gy++) {
        const dotX = 700 + gx * 45;
        const dotY = 175 + gy * 55;
        const isGlowing = ((gx + gy + Math.floor(time * 5)) % 4) === 0;
        ctx.fillStyle = isGlowing ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(dotX, dotY, isGlowing ? 14 : 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ BGA SOC BUS', 810, 485);
  }

  // Top Glossy Glare Sheen
  const sheenGrad = ctx.createLinearGradient(0, 0, width, 140);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(14, 14, width - 28, 130);
}

function createShowcaseScreenTexture(themeColor1: string, themeColor2: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Vibrant gradient wallpaper
  const grad = ctx.createLinearGradient(0, 0, 256, 512);
  grad.addColorStop(0, themeColor1);
  grad.addColorStop(0.5, themeColor2);
  grad.addColorStop(1, '#090d16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Status Bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('10:42', 14, 20);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('5G 98%', 202, 20);

  // Punch hole camera
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(128, 16, 6, 0, Math.PI * 2);
  ctx.fill();

  // Clock Widget
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('10:42', 128, 85);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Lun 28 Settembre • 22°C', 128, 106);

  // Grid of Apps (3 rows, 4 cols)
  const appColors = [
    '#10b981', '#3b82f6', '#ef4444', '#8b5cf6',
    '#f59e0b', '#06b6d4', '#ec4899', '#6366f1',
    '#14b8a6', '#f97316', '#a855f7', '#64748b'
  ];
  const appLabels = ['Tel', 'Chat', 'Foto', 'Mail', 'Musica', 'Store', 'Mappe', 'Cloud', 'Wallet', 'Video', 'AI 2026', 'Impost'];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const x = 32 + c * 52;
      const y = 145 + r * 68;

      ctx.fillStyle = appColors[idx % appColors.length];
      ctx.beginPath();
      ctx.roundRect(x - 17, y - 17, 34, 34, 9);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(appLabels[idx], x, y + 27);
    }
  }

  // Bottom Floating Dock
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.roundRect(16, 435, 224, 55, 20);
  ctx.fill();

  const dockColors = ['#10b981', '#3b82f6', '#06b6d4', '#8b5cf6'];
  dockColors.forEach((color, i) => {
    const x = 46 + i * 54;
    const y = 462;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - 16, y - 16, 32, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// =========================================================================
// HYPER-REALISTIC HARDWOOD PARQUET & PAVEMENT PROCEDURAL TEXTURES
// =========================================================================
function createRealisticParquetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base warm honey oak tone
  ctx.fillStyle = '#caa37d';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankH = 64;
  const plankW = 256;
  const rows = 1024 / plankH;

  const oakTones = [
    '#dfc3a7',
    '#d6b799',
    '#caa98b',
    '#e2cbb2',
    '#cead8f',
    '#c49f7f',
    '#dbbf9f',
    '#d2b090',
  ];

  for (let r = 0; r < rows; r++) {
    const y = r * plankH;
    const offset = (r % 3) * (plankW / 3);
    const cols = Math.ceil(1024 / plankW) + 2;

    for (let c = -1; c < cols; c++) {
      const x = c * plankW - offset;
      const seed = Math.sin(r * 37.1 + c * 83.7) * 10000;
      const toneIndex = Math.abs(Math.floor(seed)) % oakTones.length;
      ctx.fillStyle = oakTones[toneIndex];
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Fine wood grain lines inside each plank
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 1, y + 1, plankW - 2, plankH - 2);
      ctx.clip();

      ctx.strokeStyle = 'rgba(90, 50, 20, 0.07)';
      ctx.lineWidth = 1;
      for (let g = 4; g < plankH; g += 4) {
        ctx.beginPath();
        const wave = Math.sin((x + g) * 0.04) * 2.5;
        ctx.moveTo(x, y + g + wave);
        ctx.lineTo(x + plankW, y + g + wave);
        ctx.stroke();
      }

      // Elegant longitudinal grain wave
      ctx.strokeStyle = 'rgba(70, 35, 10, 0.05)';
      ctx.lineWidth = 2;
      const waveY = y + 12 + (toneIndex % 4) * 10;
      ctx.beginPath();
      ctx.moveTo(x, waveY);
      ctx.bezierCurveTo(x + 70, waveY + 5, x + 170, waveY - 4, x + plankW, waveY + 2);
      ctx.stroke();

      // Subtle natural knots
      if ((r + c * 3) % 7 === 0) {
        ctx.fillStyle = 'rgba(75, 40, 15, 0.12)';
        ctx.beginPath();
        ctx.ellipse(x + 110, y + 28, 7, 3.5, 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Bevel shadow on top and left edge of plank
      ctx.fillStyle = 'rgba(40, 20, 5, 0.32)';
      ctx.fillRect(x, y, plankW, 1.5);
      ctx.fillRect(x, y, 1.5, plankH);

      // Subtle light bounce on bottom and right edge of plank
      ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
      ctx.fillRect(x + 1, y + plankH - 1.5, plankW - 1, 1.5);
      ctx.fillRect(x + plankW - 1.5, y + 1, 1.5, plankH - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function createPavementTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 512, 512);

  const stoneW = 64;
  const stoneH = 32;
  for (let y = 0; y < 512; y += stoneH) {
    const isOdd = (y / stoneH) % 2 === 1;
    const xOffset = isOdd ? stoneW / 2 : 0;
    for (let x = -stoneW; x < 512 + stoneW; x += stoneW) {
      const shade = 145 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 8})`;
      ctx.fillRect(x + xOffset + 1, y + 1, stoneW - 2, stoneH - 2);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.strokeRect(x + xOffset + 0.5, y + 0.5, stoneW - 1, stoneH - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 6);
  return texture;
}

// =========================================================================
// 3D MODELS: CARS, DOGS, PARK WALKERS, KIDS, TREES & PLANTS
// =========================================================================
function create3DCar(colorHex: number, isCab = false): { group: THREE.Group; wheels: THREE.Mesh[] } {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.85,
    roughness: 0.18,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.95,
    roughness: 0.05,
  });

  // Lower chassis
  const chassisGeo = new THREE.BoxGeometry(1.35, 0.42, 2.7);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.position.set(0, 0.35, 0);
  chassis.castShadow = true;
  group.add(chassis);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.15, 0.38, 1.45);
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 0.68, -0.1);
  cabin.castShadow = true;
  group.add(cabin);

  // Roof cap
  const roofGeo = new THREE.BoxGeometry(1.18, 0.04, 1.35);
  const roof = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.set(0, 0.88, -0.1);
  group.add(roof);

  // Headlights
  const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-0.45, 0.45].forEach(x => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.05), headMat);
    hl.position.set(x, 0.38, 1.36);
    group.add(hl);
  });

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  [-0.45, 0.45].forEach(x => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.05), tailMat);
    tl.position.set(x, 0.38, -1.36);
    group.add(tl);
  });

  // Taxi roof sign
  if (isCab) {
    const cabSignMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cabSign = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.18), cabSignMat);
    cabSign.position.set(0, 0.96, -0.1);
    group.add(cabSign);
  }

  // 4 Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });

  const wheelPositions = [
    [-0.68, 0.22, 0.8],
    [0.68, 0.22, 0.8],
    [-0.68, 0.22, -0.8],
    [0.68, 0.22, -0.8],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16), wheelMat);
    wGroup.rotation.z = Math.PI / 2;
    wGroup.position.set(wx, wy, wz);
    wGroup.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.145, 12), rimMat);
    wGroup.add(rim);

    group.add(wGroup);
    wheels.push(wGroup);
  });

  return { group, wheels };
}

function create3DDog(breed: 'golden' | 'corgi'): { group: THREE.Group; tail: THREE.Mesh; paws: THREE.Mesh[] } {
  const group = new THREE.Group();
  const paws: THREE.Mesh[] = [];

  const furColor = breed === 'golden' ? 0xd97706 : 0xb45309;
  const furMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 });

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.26, 0.28, 0.52);
  const body = new THREE.Mesh(bodyGeo, furMat);
  body.position.set(0, 0.32, 0);
  body.castShadow = true;
  group.add(body);

  // Chest / belly
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.32), bellyMat);
  belly.position.set(0, 0.24, 0.05);
  group.add(belly);

  // Head
  const headGeo = new THREE.BoxGeometry(0.22, 0.22, 0.26);
  const head = new THREE.Mesh(headGeo, furMat);
  head.position.set(0, 0.48, 0.28);
  head.castShadow = true;
  group.add(head);

  // Snout
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.14), bellyMat);
  snout.position.set(0, 0.44, 0.44);
  group.add(snout);

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), darkMat);
  nose.position.set(0, 0.48, 0.51);
  group.add(nose);

  // Eyes
  [-0.07, 0.07].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), darkMat);
    eye.position.set(ex, 0.52, 0.41);
    group.add(eye);
  });

  // Ears
  [-0.11, 0.11].forEach(earX => {
    const earGeo = breed === 'golden'
      ? new THREE.BoxGeometry(0.06, 0.14, 0.08)
      : new THREE.ConeGeometry(0.06, 0.14, 4);
    const ear = new THREE.Mesh(earGeo, furMat);
    ear.position.set(earX, 0.56, 0.24);
    if (breed === 'golden') ear.rotation.z = earX > 0 ? -0.3 : 0.3;
    group.add(ear);
  });

  // Tail
  const tailGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.28, 8);
  const tail = new THREE.Mesh(tailGeo, furMat);
  tail.position.set(0, 0.42, -0.34);
  tail.rotation.x = -Math.PI / 3;
  group.add(tail);

  // 4 Paws
  const legPositions = [
    [-0.10, 0.16, 0.18],
    [0.10, 0.16, 0.18],
    [-0.10, 0.16, -0.18],
    [0.10, 0.16, -0.18],
  ];

  legPositions.forEach(([lx, ly, lz]) => {
    const legGeo = new THREE.BoxGeometry(0.08, 0.22, 0.08);
    const leg = new THREE.Mesh(legGeo, furMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    group.add(leg);
    paws.push(leg);
  });

  // Collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.40, 0.20);
  group.add(collar);

  return { group, tail, paws };
}

function create3DWalker(jacketColor: number, pantsColor: number): {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
} {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.65 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.28), jacketMat);
  torso.position.set(0, 1.25, 0);
  torso.castShadow = true;
  group.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat);
  head.position.set(0, 1.70, 0);
  head.castShadow = true;
  group.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), hairMat);
  hair.position.set(0, 1.74, -0.02);
  group.add(hair);

  // Arms
  [-0.30, 0.30].forEach(ax => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), jacketMat);
    arm.position.set(ax, 1.22, 0);
    arm.castShadow = true;
    group.add(arm);
  });

  // Articulated Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0.95, 0);
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.14), pantsMat);
  leftLegMesh.position.set(0, -0.34, 0);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.22), shoeMat);
  leftShoe.position.set(0, -0.66, 0.04);
  leftLeg.add(leftShoe);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0.95, 0);
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.14), pantsMat);
  rightLegMesh.position.set(0, -0.34, 0);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.22), shoeMat);
  rightShoe.position.set(0, -0.66, 0.04);
  rightLeg.add(rightShoe);
  group.add(rightLeg);

  return { group, leftLeg, rightLeg };
}

function create3DKid(hoodieColor: number, pantsColor: number): {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
} {
  const group = new THREE.Group();
  group.scale.set(0.68, 0.68, 0.68);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.6 });
  const hoodieMat = new THREE.MeshStandardMaterial({ color: hoodieColor, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const sneakerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });

  // Torso / Hoodie
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.26), hoodieMat);
  torso.position.set(0, 1.15, 0);
  torso.castShadow = true;
  group.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat);
  head.position.set(0, 1.54, 0);
  head.castShadow = true;
  group.add(head);

  // Cap
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
  cap.position.set(0, 1.58, 0);
  group.add(cap);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.14), capMat);
  visor.position.set(0, 1.58, 0.16);
  group.add(visor);

  // Arms pumping
  [-0.26, 0.26].forEach(ax => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.11), hoodieMat);
    arm.position.set(ax, 1.15, 0);
    arm.rotation.x = -Math.PI / 6;
    arm.castShadow = true;
    group.add(arm);
  });

  // Articulated Running Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.90, 0);
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.52, 0.13), pantsMat);
  leftLegMesh.position.set(0, -0.26, 0);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.20), sneakerMat);
  leftShoe.position.set(0, -0.50, 0.04);
  leftLeg.add(leftShoe);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.90, 0);
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.52, 0.13), pantsMat);
  rightLegMesh.position.set(0, -0.26, 0);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.20), sneakerMat);
  rightShoe.position.set(0, -0.50, 0.04);
  rightLeg.add(rightShoe);
  group.add(rightLeg);

  return { group, leftLeg, rightLeg };
}

function createParkTree(height: number, foliageColor: number): THREE.Group {
  const tree = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.9 });
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, height * 0.5, 12);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(0, height * 0.25, 0);
  trunk.castShadow = true;
  tree.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({
    color: foliageColor,
    roughness: 0.75,
    metalness: 0.05,
  });

  const puffOffsets = [
    [0, height * 0.55, 0, 0.95],
    [0.45, height * 0.65, 0.35, 0.82],
    [-0.45, height * 0.65, -0.3, 0.80],
    [0.3, height * 0.75, -0.35, 0.78],
    [-0.35, height * 0.75, 0.3, 0.75],
    [0, height * 0.88, 0, 0.70],
  ];

  puffOffsets.forEach(([px, py, pz, pr]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 16, 16), leafMat);
    puff.position.set(px, py, pz);
    puff.castShadow = true;
    tree.add(puff);
  });

  return tree;
}

function createFloweringBush(flowerColor: number): THREE.Group {
  const bush = new THREE.Group();
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.5 });

  const base = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), bushMat);
  base.scale.set(1.2, 0.75, 1.1);
  base.position.set(0, 0.35, 0);
  base.castShadow = true;
  bush.add(base);

  for (let f = 0; f < 8; f++) {
    const angle = (f / 8) * Math.PI * 2;
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flowerMat);
    fl.position.set(
      Math.cos(angle) * 0.45,
      0.35 + Math.sin(f * 2.3) * 0.15,
      Math.sin(angle) * 0.45
    );
    bush.add(fl);
  }

  return bush;
}

function createIndoorPottedPlant(type: 'monstera' | 'ficus'): THREE.Group {
  const plant = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.45, 20), potMat);
  pot.position.set(0, 0.225, 0);
  pot.castShadow = true;
  plant.add(pot);

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0x271810 }));
  soil.position.set(0, 0.42, 0);
  plant.add(soil);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4, side: THREE.DoubleSide });
  const count = type === 'monstera' ? 6 : 9;
  for (let l = 0; l < count; l++) {
    const angle = (l / count) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.45), leafMat);
    leaf.position.set(Math.cos(angle) * 0.20, 0.55 + (l % 3) * 0.12, Math.sin(angle) * 0.20);
    leaf.rotation.x = -Math.PI / 3;
    leaf.rotation.y = angle;
    leaf.castShadow = true;
    plant.add(leaf);
  }

  return plant;
}

export const ThreeShopScene: React.FC<ThreeShopSceneProps> = ({
  currentCustomer,
  nextCustomers,
  stats,
  isDeliveringRepairedPhone,
  onPhoneClick,
  phonePlaced,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store refs to dynamic Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const customerGroupRef = useRef<THREE.Group | null>(null);
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftDoorRef = useRef<THREE.Group | null>(null);
  const rightDoorRef = useRef<THREE.Group | null>(null);
  const phoneMeshRef = useRef<THREE.Group | null>(null);
  const neonSignRef = useRef<THREE.Mesh | null>(null);
  const sunMotesRef = useRef<THREE.Points | null>(null);
  const showcasePhonesRef = useRef<THREE.Group[]>([]);
  const cloudsGroupRef = useRef<THREE.Group | null>(null);

  // Animated environmental refs for cars, walkers & kids
  const carsRef = useRef<{ group: THREE.Group; speed: number; direction: number; wheels: THREE.Mesh[] }[]>([]);
  const parkWalkersRef = useRef<{
    group: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    dogGroup?: THREE.Group;
    dogTail?: THREE.Mesh;
    dogPaws?: THREE.Mesh[];
    pathRadius: number;
    pathCenter: THREE.Vector2;
    speed: number;
    offset: number;
  }[]>([]);
  const runningKidsRef = useRef<{
    kid1: { group: THREE.Group; leftLeg: THREE.Group; rightLeg: THREE.Group };
    kid2: { group: THREE.Group; leftLeg: THREE.Group; rightLeg: THREE.Group };
    center: THREE.Vector2;
    radius: number;
    speed: number;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SETUP DAYLIGHT SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Crisp sunny azure sky background
    scene.background = new THREE.Color(0xa5d8ff);
    scene.fog = new THREE.FogExp2(0xc5e4ff, 0.02);

    // 2. CAMERA SETUP - Ground Eye-Level Perspective ("sei a terra")
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.72, 4.6);
    camera.lookAt(0, 1.25, -0.6);

    // 3. RENDERER WITH VIBRANT TONE MAPPING & SOFT SHADOWS
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35; // Bright, luminous daytime exposure!
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // =========================================================================
    // DAYTIME LIGHTING: SUNLIGHT, SKY HEMISPHERE & BRIGHT FILL LIGHTS
    // =========================================================================
    // Hemisphere light: Clear blue sky above (0x93c5fd) + warm sun bounce below (0xfef3c7)
    const hemiLight = new THREE.HemisphereLight(0xbbe1fa, 0xfdf6e2, 2.2);
    scene.add(hemiLight);

    // Direct warm morning/afternoon sunlight streaming in from balcony
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.4);
    sunLight.position.set(4, 7, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Secondary soft sky fill light
    const skyFill = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    skyFill.position.set(-4, 5, 2);
    scene.add(skyFill);

    // Warm chandelier / shop interior spotlight
    const shopSpot = new THREE.SpotLight(0xfff7ed, 2.0);
    shopSpot.position.set(0, 5, 0);
    shopSpot.angle = Math.PI / 3;
    shopSpot.penumbra = 0.6;
    scene.add(shopSpot);

    // Showcase interior bright white LEDs
    const showcaseLight = new THREE.PointLight(0xffffff, 2.4, 4);
    showcaseLight.position.set(0, 0.9, 0.5);
    scene.add(showcaseLight);

    // =========================================================================
    // DISTANT HORIZON SKYLINE & CLOUDS (Set far back at z = -25)
    // =========================================================================
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, -25);
    cityGroup.scale.set(1.5, 1.5, 1.5);
    const buildingColors = [0xe2e8f0, 0xf1f5f9, 0xdbeafe, 0xfef3c7, 0xe0e7ff];

    for (let b = -12; b <= 12; b += 1.6) {
      const bHeight = 3.5 + Math.abs(Math.sin(b * 3)) * 3.5;
      const bGeo = new THREE.BoxGeometry(1.3, bHeight, 1.2);
      const bMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.abs(Math.round(b)) % buildingColors.length],
        roughness: 0.6,
        metalness: 0.1,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(b, bHeight / 2 - 0.5, 0);
      cityGroup.add(bMesh);

      // Window grid on buildings
      for (let w = 1; w < bHeight - 0.8; w += 0.8) {
        const winGeo = new THREE.BoxGeometry(0.9, 0.35, 0.05);
        const winMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(b, w, 0.62);
        cityGroup.add(win);
      }
    }
    scene.add(cityGroup);

    // Fluffy 3D procedural daylight clouds
    const cloudsGroup = new THREE.Group();
    for (let c = 0; c < 8; c++) {
      const cloudPuffGroup = new THREE.Group();
      for (let p = 0; p < 4; p++) {
        const puffGeo = new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 16, 16);
        const puffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const puff = new THREE.Mesh(puffGeo, puffMat);
        puff.position.set(p * 0.6, (Math.random() - 0.5) * 0.2, 0);
        cloudPuffGroup.add(puff);
      }
      cloudPuffGroup.position.set((c - 4) * 3.8, 7.2 + (c % 3) * 0.8, -24.5);
      cloudsGroup.add(cloudPuffGroup);
    }
    cloudsGroupRef.current = cloudsGroup;
    scene.add(cloudsGroup);

    // =========================================================================
    // STOREFRONT ARCHITECTURE: HYPER-REALISTIC FLOOR & OUTDOOR STREET & PARK
    // =========================================================================
    // 1. Hyper-Realistic Hardwood Parquet Indoor Floor ("il pavimento sia realistico")
    const parquetTexture = createRealisticParquetTexture();
    const floorGeo = new THREE.PlaneGeometry(13.2, 9.2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: parquetTexture,
      roughness: 0.28,
      metalness: 0.06,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Architectural White Baseboards (Battiscopa)
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const bbL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 9.2), baseboardMat);
    bbL.position.set(-6.38, 0.07, 0);
    scene.add(bbL);
    const bbR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 9.2), baseboardMat);
    bbR.position.set(6.38, 0.07, 0);
    scene.add(bbR);

    // Outdoor entrance sidewalk pavement (z between -4.5 and -7.2)
    const pavementTexture = createPavementTexture();
    const pavementGeo = new THREE.PlaneGeometry(18, 2.8);
    const pavementMat = new THREE.MeshStandardMaterial({
      map: pavementTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const pavement = new THREE.Mesh(pavementGeo, pavementMat);
    pavement.rotation.x = -Math.PI / 2;
    pavement.position.set(0, 0.005, -5.9);
    pavement.receiveShadow = true;
    scene.add(pavement);

    // =========================================================================
    // OUTSIDE LEFT: TWO-LANE ASPHALT STREET WITH MOVING CARS ("strada con macchine")
    // =========================================================================
    const roadGeo = new THREE.PlaneGeometry(5.2, 32);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(-8.8, 0.003, -10);
    road.receiveShadow = true;
    scene.add(road);

    // Dashed center road lane stripes (yellow)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let s = -24; s <= 4; s += 2.4) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.2), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(-8.8, 0.006, s);
      scene.add(stripe);
    }

    // Street Curb (Raised granite edge between sidewalk and road)
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 32), curbMat);
    curb.position.set(-6.2, 0.06, -10);
    scene.add(curb);

    // Modern curved street lamps along road
    const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-18, -10, -2, 4].forEach(lz => {
      const lamp = new THREE.Group();
      lamp.position.set(-6.4, 0, lz);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 12), lampPoleMat);
      pole.position.set(0, 2.1, 0);
      lamp.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.06), lampPoleMat);
      arm.position.set(-0.55, 4.15, 0);
      lamp.add(arm);
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.20), lampGlowMat);
      fixture.position.set(-1.1, 4.10, 0);
      lamp.add(fixture);
      scene.add(lamp);
    });

    // 5 3D Animated Cars on the Street
    const carList: { group: THREE.Group; speed: number; direction: number; wheels: THREE.Mesh[] }[] = [];
    const carConfigs = [
      { color: 0xef4444, isCab: false, laneX: -9.8, startZ: -4, dir: -1, speed: 0.085 },
      { color: 0x06b6d4, isCab: false, laneX: -7.8, startZ: -16, dir: 1, speed: 0.075 },
      { color: 0xfacc15, isCab: true, laneX: -9.8, startZ: -14, dir: -1, speed: 0.065 },
      { color: 0xf8fafc, isCab: false, laneX: -7.8, startZ: -6, dir: 1, speed: 0.080 },
      { color: 0x64748b, isCab: false, laneX: -9.8, startZ: -22, dir: -1, speed: 0.070 },
    ];

    carConfigs.forEach(cfg => {
      const car = create3DCar(cfg.color, cfg.isCab);
      car.group.position.set(cfg.laneX, 0, cfg.startZ);
      car.group.rotation.y = cfg.dir > 0 ? 0 : Math.PI;
      scene.add(car.group);
      carList.push({
        group: car.group,
        speed: cfg.speed,
        direction: cfg.dir,
        wheels: car.wheels,
      });
    });
    carsRef.current = carList;

    // =========================================================================
    // OUTSIDE CENTER & RIGHT: GREEN PARK WITH PEOPLE, DOGS & KIDS ("parco con cani e bimbi")
    // =========================================================================
    // Lush green park lawn
    const parkGrassGeo = new THREE.PlaneGeometry(24, 22);
    const parkGrassMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.9,
      metalness: 0.02,
    });
    const parkGrass = new THREE.Mesh(parkGrassGeo, parkGrassMat);
    parkGrass.rotation.x = -Math.PI / 2;
    parkGrass.position.set(5.5, 0.002, -15);
    parkGrass.receiveShadow = true;
    scene.add(parkGrass);

    // Curving stone walking path in park
    const parkPathMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
    const parkPath = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.9, 8, 32, Math.PI * 1.5), parkPathMat);
    parkPath.rotation.x = -Math.PI / 2;
    parkPath.position.set(4.5, 0.004, -14);
    parkPath.receiveShadow = true;
    scene.add(parkPath);

    // Park Trees
    const treePositions = [
      { x: -3.5, z: -8.5, h: 4.8, c: 0x15803d },
      { x: 1.5, z: -16.5, h: 5.5, c: 0x166534 },
      { x: 7.5, z: -10.5, h: 4.5, c: 0x22c55e },
      { x: 11.5, z: -15.5, h: 5.2, c: 0x15803d },
      { x: 5.0, z: -21.0, h: 5.8, c: 0x14532d },
      { x: -1.0, z: -20.5, h: 4.6, c: 0x16a34a },
      { x: 9.5, z: -7.5, h: 4.2, c: 0x22c55e },
    ];
    treePositions.forEach(tp => {
      const tree = createParkTree(tp.h, tp.c);
      tree.position.set(tp.x, 0, tp.z);
      scene.add(tree);
    });

    // Park Benches
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const benchFrameMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4 });
    [{ x: 1.8, z: -12.5, rot: -0.4 }, { x: 7.2, z: -15.5, rot: 2.2 }].forEach(bp => {
      const bench = new THREE.Group();
      bench.position.set(bp.x, 0, bp.z);
      bench.rotation.y = bp.rot;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.45), benchMat);
      seat.position.set(0, 0.45, 0);
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.40, 0.05), benchMat);
      back.position.set(0, 0.70, -0.20);
      bench.add(back);
      [-0.7, 0.7].forEach(bx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.45), benchFrameMat);
        leg.position.set(bx, 0.225, 0);
        bench.add(leg);
      });
      scene.add(bench);
    });

    // Flowering Bushes around park
    const bushColors = [0xec4899, 0xa855f7, 0xf43f5e, 0x38bdf8, 0xfacc15];
    [
      { x: -2.5, z: -7.5, c: 0 },
      { x: 2.5, z: -8.0, c: 1 },
      { x: 6.5, z: -7.5, c: 2 },
      { x: 8.5, z: -12.0, c: 3 },
      { x: -0.5, z: -13.5, c: 4 },
      { x: 3.5, z: -18.5, c: 0 },
      { x: 10.5, z: -18.0, c: 1 },
    ].forEach(b => {
      const bush = createFloweringBush(bushColors[b.c]);
      bush.position.set(b.x, 0, b.z);
      scene.add(bush);
    });

    // Modern Planters directly outside storefront windows ("fuori anche delle piante")
    [-4.5, 4.5].forEach(px => {
      const planter = new THREE.Group();
      planter.position.set(px, 0, -4.8);
      const box = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.42, 0.5), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      box.position.set(0, 0.21, 0);
      planter.add(box);
      for (let f = -1.2; f <= 1.2; f += 0.4) {
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: (Math.abs(f) > 0.6) ? 0xec4899 : 0x22c55e }));
        fl.position.set(f, 0.45, 0);
        planter.add(fl);
      }
      scene.add(planter);
    });

    // Indoor Potted Plants framing entrance and corners
    const plant1 = createIndoorPottedPlant('monstera');
    plant1.position.set(-5.6, 0, -3.8);
    scene.add(plant1);
    const plant2 = createIndoorPottedPlant('ficus');
    plant2.position.set(5.6, 0, -3.8);
    scene.add(plant2);

    // People Walking with Dogs
    const walkersList: any[] = [];

    // Walker 1: Girl in turquoise coat with Golden Retriever
    const walker1 = create3DWalker(0x06b6d4, 0x1e293b);
    const dog1 = create3DDog('golden');
    dog1.group.position.set(0.65, 0, 0.35);
    walker1.group.add(dog1.group);

    const leash1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.85, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    leash1.position.set(0.42, 0.85, 0.18);
    leash1.rotation.z = Math.PI / 4;
    walker1.group.add(leash1);

    scene.add(walker1.group);
    walkersList.push({
      group: walker1.group,
      leftLeg: walker1.leftLeg,
      rightLeg: walker1.rightLeg,
      dogGroup: dog1.group,
      dogTail: dog1.tail,
      dogPaws: dog1.paws,
      pathRadius: 4.8,
      pathCenter: new THREE.Vector2(4.5, -14.0),
      speed: 0.45,
      offset: 0,
    });

    // Walker 2: Man in warm brown jacket with Corgi dog
    const walker2 = create3DWalker(0x9a3412, 0x334155);
    const dog2 = create3DDog('corgi');
    dog2.group.position.set(-0.55, 0, 0.25);
    walker2.group.add(dog2.group);

    const leash2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.75, 6), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    leash2.position.set(-0.35, 0.85, 0.12);
    leash2.rotation.z = -Math.PI / 4;
    walker2.group.add(leash2);

    scene.add(walker2.group);
    walkersList.push({
      group: walker2.group,
      leftLeg: walker2.leftLeg,
      rightLeg: walker2.rightLeg,
      dogGroup: dog2.group,
      dogTail: dog2.tail,
      dogPaws: dog2.paws,
      pathRadius: 3.8,
      pathCenter: new THREE.Vector2(6.0, -15.5),
      speed: 0.38,
      offset: Math.PI,
    });
    parkWalkersRef.current = walkersList;

    // Children joyfully chasing each other on the grass ("bimbi che si rincorrono")
    const kid1 = create3DKid(0xf97316, 0x1d4ed8);
    const kid2 = create3DKid(0x10b981, 0x6b21a8);
    scene.add(kid1.group);
    scene.add(kid2.group);

    runningKidsRef.current = {
      kid1,
      kid2,
      center: new THREE.Vector2(4.5, -10.0),
      radius: 2.2,
      speed: 1.8,
    };

    // Soccer ball on grass
    const ballGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(3.2, 0.14, -9.2);
    ball.castShadow = true;
    scene.add(ball);

    // 2. CEILING / ROOF WITH RECESSED CEILING SPOTLIGHTS ("con un tetto")
    const roofGroup = new THREE.Group();
    roofGroup.position.set(0, 3.65, -0.8);

    // Offscreen Canvases for 2 Separate Real-Time Animated LCD Advertising TV Screens (Left TV & Right TV)
    const lcdCanvas1 = document.createElement('canvas');
    lcdCanvas1.width = 1024;
    lcdCanvas1.height = 576;
    const lcdCtx1 = lcdCanvas1.getContext('2d')!;
    drawLCDAdvertisingScreen(lcdCtx1, 0);

    const lcdTexture1 = new THREE.CanvasTexture(lcdCanvas1);
    lcdTexture1.needsUpdate = true;

    const lcdCanvas2 = document.createElement('canvas');
    lcdCanvas2.width = 1024;
    lcdCanvas2.height = 576;
    const lcdCtx2 = lcdCanvas2.getContext('2d')!;
    drawLCDAdvertisingScreen(lcdCtx2, 2.5);

    const lcdTexture2 = new THREE.CanvasTexture(lcdCanvas2);
    lcdTexture2.needsUpdate = true;

    const roofGeo = new THREE.BoxGeometry(14.5, 0.2, 8.5);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Crisp architectural white
      roughness: 0.4,
      metalness: 0.05,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.receiveShadow = true;
    roofGroup.add(roofMesh);

    // Recessed LED Spot Light Fixings in ceiling
    const spotFixtureMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const spotGlowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

    [-3.5, 0, 3.5].forEach(x => {
      [-2.0, 0.5, 2.0].forEach(z => {
        const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24), spotFixtureMat);
        fixture.position.set(x, -0.10, z);
        roofGroup.add(fixture);

        const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.041, 24), spotGlowMat);
        glow.position.set(x, -0.102, z);
        roofGroup.add(glow);
      });
    });

    scene.add(roofGroup);

    // 3. STOREFRONT GLASS WALLS & AUTOMATIC SLIDING DOOR ENTRANCE (At z = -4.5)
    const storefrontGroup = new THREE.Group();
    storefrontGroup.position.set(0, 0, -4.5);

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark titanium aluminum frames
      roughness: 0.25,
      metalness: 0.85,
    });
    const storeGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.93,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.5,
      thickness: 0.2,
    });

    // Sleek ceiling soffit border above storefront (No dark black band)
    const soffitMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Architectural crisp off-white matching ceiling
      roughness: 0.35,
      metalness: 0.05,
    });
    const headerBeam = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.34, 0.22), soffitMat);
    headerBeam.position.set(0, 3.48, 0);
    headerBeam.receiveShadow = true;
    storefrontGroup.add(headerBeam);

    // Slim architectural aluminum trim profile
    const headerTrim = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.04, 0.24), frameMat);
    headerTrim.position.set(0, 3.30, 0);
    storefrontGroup.add(headerTrim);

    // =========================================================================
    // 2 SEPARATE FLAT-SCREEN LCD TVs (LEFT TV & RIGHT TV SUSPENDED FROM CEILING)
    // =========================================================================
    const tvFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Metallic dark slate TV casing
      roughness: 0.2,
      metalness: 0.85,
    });
    const tvPoleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 });
    const tvLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Blue power indicator LED

    // LEFT TV MONITOR (Suspended at x = -3.7, y = 2.65)
    const leftTVGroup = new THREE.Group();
    leftTVGroup.position.set(-3.7, 2.65, 0.22);

    // Dual chrome ceiling drop poles
    const leftPoleL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 16), tvPoleMat);
    leftPoleL.position.set(-0.75, 0.88, 0);
    leftTVGroup.add(leftPoleL);
    const leftPoleR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 16), tvPoleMat);
    leftPoleR.position.set(0.75, 0.88, 0);
    leftTVGroup.add(leftPoleR);

    // Outer TV frame casing (16:9 aspect ratio)
    const leftTvFrame = new THREE.Mesh(new THREE.BoxGeometry(2.68, 1.52, 0.08), tvFrameMat);
    leftTvFrame.castShadow = true;
    leftTVGroup.add(leftTvFrame);

    // LCD Display Screen Mesh (16:9 full 1024x576 texture display)
    const leftTvScreenMat = new THREE.MeshStandardMaterial({
      map: lcdTexture1,
      emissive: 0xffffff,
      emissiveMap: lcdTexture1,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.05,
    });
    const leftTvScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.58, 1.44), leftTvScreenMat);
    leftTvScreen.position.set(0, 0, 0.042);
    leftTVGroup.add(leftTvScreen);

    // Power status LED
    const leftTvLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), tvLedMat);
    leftTvLed.position.set(1.24, -0.70, 0.045);
    leftTVGroup.add(leftTvLed);

    storefrontGroup.add(leftTVGroup);

    // RIGHT TV MONITOR (Suspended at x = +3.7, y = 2.65)
    const rightTVGroup = new THREE.Group();
    rightTVGroup.position.set(3.7, 2.65, 0.22);

    // Dual chrome ceiling drop poles
    const rightPoleL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 16), tvPoleMat);
    rightPoleL.position.set(-0.75, 0.88, 0);
    rightTVGroup.add(rightPoleL);
    const rightPoleR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 16), tvPoleMat);
    rightPoleR.position.set(0.75, 0.88, 0);
    rightTVGroup.add(rightPoleR);

    // Outer TV frame casing (16:9 aspect ratio)
    const rightTvFrame = new THREE.Mesh(new THREE.BoxGeometry(2.68, 1.52, 0.08), tvFrameMat);
    rightTvFrame.castShadow = true;
    rightTVGroup.add(rightTvFrame);

    // LCD Display Screen Mesh (16:9 full 1024x576 texture display)
    const rightTvScreenMat = new THREE.MeshStandardMaterial({
      map: lcdTexture2,
      emissive: 0xffffff,
      emissiveMap: lcdTexture2,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.05,
    });
    const rightTvScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.58, 1.44), rightTvScreenMat);
    rightTvScreen.position.set(0, 0, 0.042);
    rightTVGroup.add(rightTvScreen);

    // Power status LED
    const rightTvLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), tvLedMat);
    rightTvLed.position.set(1.24, -0.70, 0.045);
    rightTVGroup.add(rightTvLed);

    storefrontGroup.add(rightTVGroup);

    // Automatic Door Sensor Bar & Green LED Status Light
    const sensorBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const sensorBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.28), sensorBoxMat);
    sensorBox.position.set(0, 2.78, 0);
    storefrontGroup.add(sensorBox);

    const sensorLightMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const sensorLight = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), sensorLightMat);
    sensorLight.position.set(0, 2.74, 0.15);
    storefrontGroup.add(sensorLight);

    // Left & Right Fixed Glass Window Walls
    // Left window panel (x = -4.3)
    const leftWinFrame = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.8, 0.12), storeGlassMat);
    leftWinFrame.position.set(-4.2, 1.4, 0);
    storefrontGroup.add(leftWinFrame);

    // Left window frame borders
    const leftOuterPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16), frameMat);
    leftOuterPost.position.set(-6.35, 1.4, 0);
    storefrontGroup.add(leftOuterPost);

    const leftInnerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16), frameMat);
    leftInnerPost.position.set(-2.05, 1.4, 0);
    storefrontGroup.add(leftInnerPost);

    // Right window panel (x = +4.3)
    const rightWinFrame = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.8, 0.12), storeGlassMat);
    rightWinFrame.position.set(4.2, 1.4, 0);
    storefrontGroup.add(rightWinFrame);

    // Right window frame borders
    const rightInnerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16), frameMat);
    rightInnerPost.position.set(2.05, 1.4, 0);
    storefrontGroup.add(rightInnerPost);

    const rightOuterPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16), frameMat);
    rightOuterPost.position.set(6.35, 1.4, 0);
    storefrontGroup.add(rightOuterPost);

    // 4. AUTOMATIC SLIDING GLASS DOORS (Center opening at x = [-2.0, +2.0])
    // Left Sliding Door Leaf
    const leftDoorGroup = new THREE.Group();
    leftDoorGroup.position.set(0, 0, 0);

    const leftDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.02, 2.72, 0.06), storeGlassMat);
    leftDoorPanel.position.set(-0.52, 1.38, 0);
    leftDoorPanel.castShadow = true;
    leftDoorGroup.add(leftDoorPanel);

    const doorHandleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const leftDoorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 16), doorHandleMat);
    leftDoorHandle.position.set(-0.10, 1.35, 0.05);
    leftDoorGroup.add(leftDoorHandle);

    storefrontGroup.add(leftDoorGroup);
    leftDoorRef.current = leftDoorGroup;

    // Right Sliding Door Leaf
    const rightDoorGroup = new THREE.Group();
    rightDoorGroup.position.set(0, 0, 0);

    const rightDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.02, 2.72, 0.06), storeGlassMat);
    rightDoorPanel.position.set(0.52, 1.38, 0);
    rightDoorPanel.castShadow = true;
    rightDoorGroup.add(rightDoorPanel);

    const rightDoorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 16), doorHandleMat);
    rightDoorHandle.position.set(0.10, 1.35, 0.05);
    rightDoorGroup.add(rightDoorHandle);

    storefrontGroup.add(rightDoorGroup);
    rightDoorRef.current = rightDoorGroup;

    // Side glass walls closing the shop volume on left (x = -6.4) and right (x = +6.4)
    const sideGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.90,
      transparent: true,
      opacity: 0.85,
      roughness: 0.05,
    });
    const leftSideWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.6, 7.5), sideGlassMat);
    leftSideWall.position.set(-6.4, 1.8, -0.8);
    scene.add(leftSideWall);

    const rightSideWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.6, 7.5), sideGlassMat);
    rightSideWall.position.set(6.4, 1.8, -0.8);
    scene.add(rightSideWall);

    scene.add(storefrontGroup);

    // =========================================================================
    // 3D BRIGHT BALCONY SERVICE COUNTER ("Il Bancone dei Negozi")
    // =========================================================================
    const counterGroup = new THREE.Group();

    // Natural warm honey oak countertop with brushed brass trim
    const counterTopGeo = new THREE.BoxGeometry(6.6, 0.2, 1.6);
    const counterTopMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Warm glowing honey amber wood
      roughness: 0.35,
      metalness: 0.15,
    });
    const counterTop = new THREE.Mesh(counterTopGeo, counterTopMat);
    counterTop.position.set(0, 1.25, 0.5);
    counterTop.castShadow = true;
    counterTop.receiveShadow = true;
    counterGroup.add(counterTop);

    // Bright Mediterranean Turquoise Antistatic Rubber Mat on counter
    const matGeo = new THREE.BoxGeometry(1.65, 0.025, 0.92);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan blue ESD mat
      roughness: 0.5,
      metalness: 0.08,
    });
    const repairMat = new THREE.Mesh(matGeo, matMat);
    repairMat.position.set(0, 1.36, 0.5);
    repairMat.receiveShadow = true;
    counterGroup.add(repairMat);

    // Tempered Crystal Glass Showcase under the counter ("con sotto dei telefoni")
    const glassGeo = new THREE.BoxGeometry(5.8, 0.9, 1.2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.52,
      thickness: 0.45,
    });
    const showcaseGlass = new THREE.Mesh(glassGeo, glassMat);
    showcaseGlass.position.set(0, 0.7, 0.5);
    counterGroup.add(showcaseGlass);

    // Bright illuminated display shelf inside
    const shelfGeo = new THREE.BoxGeometry(5.6, 0.05, 1.05);
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean glossy white showcase shelf
      roughness: 0.2,
      metalness: 0.1,
    });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(0, 0.55, 0.5);
    shelf.receiveShadow = true;
    counterGroup.add(shelf);

    // 3D REFURBISHED SMARTPHONES ON COUNTER & IN SHOWCASE (Schermi Accesi con App UI!)
    showcasePhonesRef.current = [];
    
    // 1. Two display phones inside showcase resting on static pedestals with active app screens!
    [-1.2, 1.2].forEach((xPos, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(xPos, 0.62, 0.5);

      const pedGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.04, 32);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.2 });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.castShadow = true;
      pGroup.add(ped);

      const phBodyGeo = new THREE.BoxGeometry(0.26, 0.52, 0.035);
      const phMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x2563eb : 0x059669,
        metalness: 0.9,
        roughness: 0.15,
      });
      const phBody = new THREE.Mesh(phBodyGeo, phMat);
      phBody.position.y = 0.28;
      phBody.rotation.x = -Math.PI / 12;
      phBody.rotation.y = idx === 0 ? Math.PI / 8 : -Math.PI / 8;
      phBody.castShadow = true;
      pGroup.add(phBody);

      // ACTIVE APP SCREEN WITH VIBRANT WALLPAPER AND ICONS!
      const scrTex = createShowcaseScreenTexture(
        idx === 0 ? '#1e3a8a' : '#064e3b',
        idx === 0 ? '#3b82f6' : '#10b981'
      );
      const scrGeo = new THREE.PlaneGeometry(0.24, 0.48);
      const scrMat = new THREE.MeshStandardMaterial({
        map: scrTex,
        emissive: 0xffffff,
        emissiveMap: scrTex,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.05,
      });
      const scr = new THREE.Mesh(scrGeo, scrMat);
      scr.position.set(0, 0.28, 0.02);
      scr.rotation.x = -Math.PI / 12;
      scr.rotation.y = idx === 0 ? Math.PI / 8 : -Math.PI / 8;
      pGroup.add(scr);

      counterGroup.add(pGroup);
    });

    // 2. Refurbished display phone sitting ON TOP of the counter (right side) with ACTIVE SCREEN
    const onCounterPhone = new THREE.Group();
    onCounterPhone.position.set(2.0, 1.38, 0.4);

    const standGeo = new THREE.BoxGeometry(0.35, 0.06, 0.28);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const stand = new THREE.Mesh(standGeo, standMat);
    onCounterPhone.add(stand);

    const onPhGeo = new THREE.BoxGeometry(0.28, 0.55, 0.03);
    const onPhMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const onPh = new THREE.Mesh(onPhGeo, onPhMat);
    onPh.position.set(0, 0.3, 0);
    onPh.rotation.x = -Math.PI / 8;
    onPh.rotation.y = -Math.PI / 10;
    onPh.castShadow = true;
    onCounterPhone.add(onPh);

    const counterScrTex = createShowcaseScreenTexture('#831843', '#ec4899');
    const onScrGeo = new THREE.PlaneGeometry(0.25, 0.5);
    const onScrMat = new THREE.MeshStandardMaterial({
      map: counterScrTex,
      emissive: 0xffffff,
      emissiveMap: counterScrTex,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    });
    const onScr = new THREE.Mesh(onScrGeo, onScrMat);
    onScr.position.set(0, 0.3, 0.018);
    onScr.rotation.x = -Math.PI / 8;
    onScr.rotation.y = -Math.PI / 10;
    onCounterPhone.add(onScr);

    // Price tag sign on counter
    const tagGeo = new THREE.BoxGeometry(0.26, 0.14, 0.02);
    const tagMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const tag = new THREE.Mesh(tagGeo, tagMat);
    tag.position.set(0, 0.07, 0.16);
    tag.rotation.x = -Math.PI / 6;
    onCounterPhone.add(tag);

    counterGroup.add(onCounterPhone);

    // 8) ULTIMA GENERAZIONE TOP FLAGSHIP EXPANSION MODELS ON COUNTER (If upgraded!)
    if (stats.purchasedUpgrades.includes('showcase_fold_ultra')) {
      const foldPhone = new THREE.Group();
      foldPhone.position.set(-2.0, 1.38, 0.4);

      const foldStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.25, 0.06, 32),
        new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.8, roughness: 0.2 })
      );
      foldPhone.add(foldStand);

      // Dual-screen fold open
      const leftWingGeo = new THREE.BoxGeometry(0.22, 0.54, 0.025);
      const rightWingGeo = new THREE.BoxGeometry(0.22, 0.54, 0.025);
      const foldMat = new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.9, roughness: 0.15 });

      const foldLeft = new THREE.Mesh(leftWingGeo, foldMat);
      foldLeft.position.set(-0.11, 0.3, 0);
      foldLeft.rotation.y = Math.PI / 10;
      foldLeft.rotation.x = -Math.PI / 9;
      foldPhone.add(foldLeft);

      const foldRight = new THREE.Mesh(rightWingGeo, foldMat);
      foldRight.position.set(0.11, 0.3, 0);
      foldRight.rotation.y = -Math.PI / 10;
      foldRight.rotation.x = -Math.PI / 9;
      foldPhone.add(foldRight);

      // Dual active screen
      const foldTex = createShowcaseScreenTexture('#4338ca', '#a855f7');
      const foldScrMat = new THREE.MeshStandardMaterial({
        map: foldTex,
        emissive: 0xffffff,
        emissiveMap: foldTex,
        emissiveIntensity: 0.95,
      });

      const foldScrL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.5), foldScrMat);
      foldScrL.position.set(-0.11, 0.3, 0.015);
      foldScrL.rotation.y = Math.PI / 10;
      foldScrL.rotation.x = -Math.PI / 9;
      foldPhone.add(foldScrL);

      const foldScrR = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.5), foldScrMat);
      foldScrR.position.set(0.11, 0.3, 0.015);
      foldScrR.rotation.y = -Math.PI / 10;
      foldScrR.rotation.x = -Math.PI / 9;
      foldPhone.add(foldScrR);

      // Flagship badge
      const badgeGeo = new THREE.BoxGeometry(0.3, 0.12, 0.02);
      const badgeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
      const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
      badgeMesh.position.set(0, 0.08, 0.16);
      badgeMesh.rotation.x = -Math.PI / 6;
      foldPhone.add(badgeMesh);

      counterGroup.add(foldPhone);
    }

    if (stats.purchasedUpgrades.includes('showcase_titanium_ai')) {
      const titanPhone = new THREE.Group();
      titanPhone.position.set(-1.0, 1.38, 0.25);

      const titanStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.2, 0.05, 32),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.1 })
      );
      titanPhone.add(titanStand);

      const titanBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.27, 0.56, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x78716c, metalness: 0.95, roughness: 0.15 })
      );
      titanBody.position.set(0, 0.3, 0);
      titanBody.rotation.x = -Math.PI / 8;
      titanPhone.add(titanBody);

      const titanTex = createShowcaseScreenTexture('#1e293b', '#06b6d4');
      const titanScr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25, 0.52),
        new THREE.MeshStandardMaterial({ map: titanTex, emissive: 0xffffff, emissiveMap: titanTex, emissiveIntensity: 0.9 })
      );
      titanScr.position.set(0, 0.3, 0.018);
      titanScr.rotation.x = -Math.PI / 8;
      titanPhone.add(titanScr);

      counterGroup.add(titanPhone);
    }

    // Showcase LED Underglow strip (Cyan glow)
    const ledGeo = new THREE.BoxGeometry(5.6, 0.025, 0.05);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ledStrip = new THREE.Mesh(ledGeo, ledMat);
    ledStrip.position.set(0, 1.15, 1.1);
    counterGroup.add(ledStrip);

    scene.add(counterGroup);

    // =========================================================================
    // 3D ACTIVE CUSTOMER DEVICE ON THE BALCONY COUNTER MAT (Request 4)
    // =========================================================================
    const activePhoneGroup = new THREE.Group();
    activePhoneGroup.position.set(0, 1.38, 0.5);

    const devCategory = currentCustomer.deviceCategory || (
      currentCustomer.phoneModelName.includes('Watch') ? 'smartwatch' :
      currentCustomer.phoneModelName.includes('iPad') || currentCustomer.phoneModelName.includes('Tab') ? 'tablet' :
      currentCustomer.phoneModelName.includes('MacBook') || currentCustomer.phoneModelName.includes('Laptop') ? 'laptop' :
      currentCustomer.phoneModelName.includes('PlayStation') || currentCustomer.phoneModelName.includes('PS') ? 'console' :
      'smartphone'
    );

    const devColorInt = parseInt(currentCustomer.phoneColor.replace('#', '0x'), 16) || 0x1e293b;

    if (devCategory === 'console') {
      // 3D Console Box on counter
      const consoleGeo = new THREE.BoxGeometry(0.75, 0.15, 0.65);
      const consoleMat = new THREE.MeshStandardMaterial({
        color: devColorInt,
        metalness: 0.8,
        roughness: 0.3,
      });
      const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
      consoleMesh.position.set(0, 0.075, 0);
      consoleMesh.castShadow = true;
      activePhoneGroup.add(consoleMesh);
    } else if (devCategory === 'smartwatch') {
      // 3D Round Smartwatch with Straps & Circular Display
      const watchCaseGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 32);
      const watchCaseMat = new THREE.MeshStandardMaterial({
        color: devColorInt,
        metalness: 0.9,
        roughness: 0.2,
      });
      const watchCase = new THREE.Mesh(watchCaseGeo, watchCaseMat);
      watchCase.castShadow = true;
      activePhoneGroup.add(watchCase);

      // Digital crown button on side
      const crownGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.rotation.z = Math.PI / 2;
      crown.position.set(0.25, 0, 0);
      activePhoneGroup.add(crown);

      // Straps extending top & bottom
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const topStrap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.35), strapMat);
      topStrap.position.set(0, -0.005, -0.28);
      activePhoneGroup.add(topStrap);

      const botStrap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.35), strapMat);
      botStrap.position.set(0, -0.005, 0.28);
      activePhoneGroup.add(botStrap);

      // Circular OLED screen
      const watchScrGeo = new THREE.CircleGeometry(0.21, 32);
      const watchScrMat = new THREE.MeshPhysicalMaterial({
        color: 0x030712,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
      });
      const watchScr = new THREE.Mesh(watchScrGeo, watchScrMat);
      watchScr.rotation.x = -Math.PI / 2;
      watchScr.position.y = 0.022;
      activePhoneGroup.add(watchScr);
    } else if (devCategory === 'tablet') {
      // 3D Large Slim Tablet
      const tabGeo = new THREE.BoxGeometry(0.64, 0.02, 0.88);
      const tabMat = new THREE.MeshStandardMaterial({ color: devColorInt, metalness: 0.9, roughness: 0.2 });
      const tabBody = new THREE.Mesh(tabGeo, tabMat);
      tabBody.castShadow = true;
      activePhoneGroup.add(tabBody);

      const tabScrGeo = new THREE.PlaneGeometry(0.60, 0.84);
      const tabScrMat = new THREE.MeshPhysicalMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 });
      const tabScr = new THREE.Mesh(tabScrGeo, tabScrMat);
      tabScr.rotation.x = -Math.PI / 2;
      tabScr.position.y = 0.012;
      activePhoneGroup.add(tabScr);
    } else {
      // 3D Standard Smartphone (iPhone, Samsung, Pixel, Oppo, etc.)
      const activeBodyGeo = new THREE.BoxGeometry(0.38, 0.03, 0.72);
      const activeBodyMat = new THREE.MeshStandardMaterial({
        color: devColorInt,
        metalness: 0.85,
        roughness: 0.2,
      });
      const activePhoneBody = new THREE.Mesh(activeBodyGeo, activeBodyMat);
      activePhoneBody.castShadow = true;
      activePhoneGroup.add(activePhoneBody);

      // Active Screen Glass with daylight glint
      const activeScrGeo = new THREE.PlaneGeometry(0.34, 0.66);
      const activeScrMat = new THREE.MeshPhysicalMaterial({
        color: 0x090d16,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
      });
      const activePhoneScr = new THREE.Mesh(activeScrGeo, activeScrMat);
      activePhoneScr.rotation.x = -Math.PI / 2;
      activePhoneScr.position.y = 0.016;
      activePhoneGroup.add(activePhoneScr);
    }

    phoneMeshRef.current = activePhoneGroup;
    scene.add(activePhoneGroup);

    // =========================================================================
    // 3D ARTICULATED HUMANOID CUSTOMER WITH ARMS, LEGS & WALKING ENTRY
    // =========================================================================
    const custGroup = new THREE.Group();
    const entranceZ = -6.5; // Starts at shop entrance door
    const targetZ = -1.1;   // Walks forward to counter desk
    custGroup.position.set(0, 0, entranceZ);

    const custColorInt = parseInt(currentCustomer.bodyColor.replace('#', '0x'), 16) || 0x3b82f6;
    const headColorInt = parseInt(currentCustomer.headColor.replace('#', '0x'), 16) || custColorInt;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: custColorInt,
      roughness: 0.3,
      metalness: 0.15,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: headColorInt,
      roughness: 0.25,
      metalness: 0.05,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
    });

    // 1. TORSO / JACKET
    const torsoGeo = new THREE.BoxGeometry(0.68, 0.95, 0.38);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMat);
    torsoMesh.position.y = 1.45;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    custGroup.add(torsoMesh);

    // Collar / shirt detail
    const collarGeo = new THREE.BoxGeometry(0.24, 0.12, 0.22);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 1.90, 0.10);
    custGroup.add(collar);

    // 2. DETACHED FLOATING ROUND HEAD WITH EXPRESSIVE FACE & ACCESSORIES
    const headGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 2.28, 0);
    headMesh.castShadow = true;
    custGroup.add(headMesh);
    headMeshRef.current = headMesh;

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.11, 0.04, 0.29);
    headMesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.11, 0.04, 0.29);
    headMesh.add(rightEye);

    // Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.6 });
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.16, -0.04, 0.26);
    headMesh.add(leftCheek);
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.16, -0.04, 0.26);
    headMesh.add(rightCheek);

    // 3D Head accessories
    if (currentCustomer.accessory === 'sunglasses' || currentCustomer.accessory === 'glasses') {
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.04, 0.28);
      const rimGeo = new THREE.TorusGeometry(0.075, 0.014, 16, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
      const leftRim = new THREE.Mesh(rimGeo, rimMat);
      leftRim.position.x = -0.11;
      glassesGroup.add(leftRim);

      const rightRim = new THREE.Mesh(rimGeo, rimMat);
      rightRim.position.x = 0.11;
      glassesGroup.add(rightRim);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1), rimMat);
      bridge.rotation.z = Math.PI / 2;
      glassesGroup.add(bridge);

      headMesh.add(glassesGroup);
    } else if (currentCustomer.accessory === 'hat') {
      const hatGroup = new THREE.Group();
      hatGroup.position.set(0, 0.26, 0);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.03, 32), pantsMat);
      hatGroup.add(brim);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.24, 32), pantsMat);
      top.position.y = 0.12;
      hatGroup.add(top);
      headMesh.add(hatGroup);
    }

    // 3. ARTICULATED LEGS (Pivot at hip y = 0.98)
    const legLength = 0.85;
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.20, 0.98, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, legLength, 16), pantsMat);
    leftLegMesh.position.y = -legLength / 2;
    leftLegMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.24), shoeMat);
    leftShoe.position.set(0, -legLength + 0.05, 0.05);
    leftShoe.castShadow = true;
    leftLegGroup.add(leftShoe);

    custGroup.add(leftLegGroup);
    leftLegRef.current = leftLegGroup;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.20, 0.98, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, legLength, 16), pantsMat);
    rightLegMesh.position.y = -legLength / 2;
    rightLegMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.24), shoeMat);
    rightShoe.position.set(0, -legLength + 0.05, 0.05);
    rightShoe.castShadow = true;
    rightLegGroup.add(rightShoe);

    custGroup.add(rightLegGroup);
    rightLegRef.current = rightLegGroup;

    // 4. ARTICULATED ARMS (Pivot at shoulder y = 1.80, x = ±0.42)
    const armLength = 0.75;
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.42, 1.80, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, armLength, 16), bodyMat);
    leftArmMesh.position.y = -armLength / 2;
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), skinMat);
    leftHand.position.y = -armLength;
    leftHand.castShadow = true;
    leftArmGroup.add(leftHand);

    custGroup.add(leftArmGroup);
    leftArmRef.current = leftArmGroup;

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.42, 1.80, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, armLength, 16), bodyMat);
    rightArmMesh.position.y = -armLength / 2;
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), skinMat);
    rightHand.position.y = -armLength;
    rightHand.castShadow = true;
    rightArmGroup.add(rightHand);

    custGroup.add(rightArmGroup);
    rightArmRef.current = rightArmGroup;

    customerGroupRef.current = custGroup;
    scene.add(custGroup);

    // =========================================================================
    // 3D QUEUE CUSTOMERS (WAITING BEHIND ON THE SUNLIT BALCONY)
    // =========================================================================
    nextCustomers.slice(0, 3).forEach((cust, idx) => {
      const qGroup = new THREE.Group();
      const qDist = -1.8 - (idx + 1) * 1.1;
      const qX = 1.4 + (idx * 0.45);
      qGroup.position.set(qX, 0, qDist);
      qGroup.scale.set(0.75, 0.75, 0.75);

      const qBodyGeo = new THREE.ConeGeometry(0.65, 1.5, 4, 8);
      const qColorInt = parseInt(cust.bodyColor.replace('#', '0x'), 16) || 0xef4444;
      const qBodyMat = new THREE.MeshStandardMaterial({ color: qColorInt, roughness: 0.3 });
      const qBody = new THREE.Mesh(qBodyGeo, qBodyMat);
      qBody.position.y = 1.15;
      qBody.rotation.y = Math.PI / 4;
      qBody.castShadow = true;
      qGroup.add(qBody);

      const qHeadGeo = new THREE.SphereGeometry(0.32, 24, 24);
      const qHead = new THREE.Mesh(qHeadGeo, qBodyMat);
      qHead.position.set(0, 2.25, 0);
      qHead.castShadow = true;
      qGroup.add(qHead);

      scene.add(qGroup);
    });

    // =========================================================================
    // 3D SHOP UPGRADE PROPS
    // =========================================================================
    // 1. Neon Sign
    if (stats.purchasedUpgrades.includes('decor_neon_sign')) {
      const neonGroup = new THREE.Group();
      neonGroup.position.set(0, 4.4, -3.8);

      const signFrameGeo = new THREE.BoxGeometry(4.2, 0.9, 0.1);
      const signFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const signFrame = new THREE.Mesh(signFrameGeo, signFrameMat);
      neonGroup.add(signFrame);

      const neonTubeGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
      const neonTubeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const neonTube = new THREE.Mesh(neonTubeGeo, neonTubeMat);
      neonTube.position.x = -1.2;
      neonGroup.add(neonTube);

      neonSignRef.current = neonTube;
      scene.add(neonGroup);
    }

    // 2. Bonsai Plant on sunny balcony
    if (stats.purchasedUpgrades.includes('decor_cyber_plant')) {
      const plantGroup = new THREE.Group();
      plantGroup.position.set(-2.8, 1.25, 0.6);

      const potGeo = new THREE.CylinderGeometry(0.2, 0.14, 0.28, 24);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.5 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.14;
      pot.castShadow = true;
      plantGroup.add(pot);

      for (let p = 0; p < 7; p++) {
        const leafGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(Math.sin(p * 1.1) * 0.18, 0.32 + p * 0.07, Math.cos(p * 1.1) * 0.18);
        leaf.castShadow = true;
        plantGroup.add(leaf);
      }
      scene.add(plantGroup);
    }

    // 3. Vintage Espresso Machine
    if (stats.purchasedUpgrades.includes('decor_espresso_machine')) {
      const coffeeGroup = new THREE.Group();
      coffeeGroup.position.set(2.6, 1.25, 0.6);

      const machineGeo = new THREE.BoxGeometry(0.48, 0.65, 0.45);
      const machineMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8, roughness: 0.2 });
      const machine = new THREE.Mesh(machineGeo, machineMat);
      machine.position.y = 0.32;
      machine.castShadow = true;
      coffeeGroup.add(machine);

      const chromeBarGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
      const lever = new THREE.Mesh(chromeBarGeo, chromeMat);
      lever.position.set(0.18, 0.52, 0.12);
      coffeeGroup.add(lever);

      scene.add(coffeeGroup);
    }

    // =========================================================================
    // GOLDEN SUNLIGHT PARTICLES / MOTES IN SUN BEAMS
    // =========================================================================
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = Math.random() * 4 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a, // Warm golden sun motes
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const sunMotes = new THREE.Points(particleGeo, particleMat);
    sunMotesRef.current = sunMotes;
    scene.add(sunMotes);

    // =========================================================================
    // RAYCASTING
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (phoneMeshRef.current) {
        const intersects = raycaster.intersectObjects(phoneMeshRef.current.children, true);
        if (intersects.length > 0) {
          onPhoneClick();
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // =========================================================================
    // ANIMATION TICK LOOP
    // =========================================================================
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Floating Detached Head procedural bobbing
      if (headMeshRef.current) {
        headMeshRef.current.position.y = 2.28 + Math.sin(elapsed * 2.2) * 0.03;
        headMeshRef.current.rotation.y = Math.sin(elapsed * 0.8) * 0.10;
      }

      // Customer walking entry & body movement
      const walkDuration = 1.8; // seconds to walk from entrance door (z = -6.5) to counter (z = -1.1)
      const walkTime = Math.min(walkDuration, elapsed);
      const walkFactor = walkTime / walkDuration; // 0.0 -> 1.0
      const isWalking = walkFactor < 1.0;

      if (customerGroupRef.current) {
        // Move along Z axis from entrance to counter
        const currentZ = entranceZ + (targetZ - entranceZ) * walkFactor;
        customerGroupRef.current.position.z = currentZ;

        if (isWalking) {
          // Walking stride animation: swing legs and arms in opposition
          const strideSpeed = 12;
          const legAngle = Math.sin(walkTime * strideSpeed) * 0.45;
          const armAngle = Math.sin(walkTime * strideSpeed) * 0.40;

          if (leftLegRef.current) leftLegRef.current.rotation.x = legAngle;
          if (rightLegRef.current) rightLegRef.current.rotation.x = -legAngle;

          if (leftArmRef.current) leftArmRef.current.rotation.x = -armAngle;
          if (rightArmRef.current) rightArmRef.current.rotation.x = armAngle;

          // Vertical bounce per step
          customerGroupRef.current.position.y = Math.abs(Math.sin(walkTime * strideSpeed * 2)) * 0.06;
        } else {
          // Arrived at counter: reset limbs to idle stance with gentle breathing
          if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
          if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
          if (leftArmRef.current) leftArmRef.current.rotation.x = 0.04;
          if (rightArmRef.current) rightArmRef.current.rotation.x = -0.04;

          if (isDeliveringRepairedPhone) {
            customerGroupRef.current.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.12;
          } else {
            customerGroupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.015;
          }
        }
      }

      // Automatic Sliding Glass Doors Opening/Closing Animation
      const isCustomerNearEntrance = customerGroupRef.current ? customerGroupRef.current.position.z < -2.2 : isWalking;
      const targetDoorSlide = isCustomerNearEntrance ? 1.25 : 0;

      if (leftDoorRef.current) {
        leftDoorRef.current.position.x = THREE.MathUtils.lerp(leftDoorRef.current.position.x, -targetDoorSlide, 0.12);
      }
      if (rightDoorRef.current) {
        rightDoorRef.current.position.x = THREE.MathUtils.lerp(rightDoorRef.current.position.x, targetDoorSlide, 0.12);
      }

      // Active phone pulse when placed
      if (phoneMeshRef.current) {
        if (phonePlaced) {
          phoneMeshRef.current.position.y = 1.38 + Math.sin(elapsed * 3) * 0.008;
        }
      }

      // Gentle cloud drift
      if (cloudsGroupRef.current) {
        cloudsGroupRef.current.position.x = Math.sin(elapsed * 0.05) * 0.8;
      }

      // Dynamic moving cars on left street ("strada con macchine")
      carsRef.current.forEach(car => {
        car.group.position.z += car.speed * car.direction;
        car.wheels.forEach(wheel => {
          wheel.rotation.x += car.speed * 8 * car.direction;
        });
        if (car.direction > 0 && car.group.position.z > 4) {
          car.group.position.z = -24;
        } else if (car.direction < 0 && car.group.position.z < -24) {
          car.group.position.z = 4;
        }
      });

      // People walking in park with dogs ("persone che passeggiano con i cani")
      parkWalkersRef.current.forEach(w => {
        const t = elapsed * w.speed + w.offset;
        const px = w.pathCenter.x + Math.sin(t) * w.pathRadius;
        const pz = w.pathCenter.y + Math.cos(t) * (w.pathRadius * 0.7);
        w.group.position.set(px, 0, pz);

        const dx = Math.cos(t) * w.pathRadius;
        const dz = -Math.sin(t) * (w.pathRadius * 0.7);
        w.group.rotation.y = Math.atan2(dx, dz);

        const legSw = Math.sin(t * 12) * 0.45;
        w.leftLeg.rotation.x = legSw;
        w.rightLeg.rotation.x = -legSw;

        if (w.dogTail) {
          w.dogTail.rotation.y = Math.sin(elapsed * 10) * 0.45;
        }
        if (w.dogPaws) {
          w.dogPaws.forEach((paw, idx) => {
            paw.rotation.x = Math.sin(t * 12 + (idx % 2 === 0 ? 0 : Math.PI)) * 0.45;
          });
        }
      });

      // Children playfully chasing each other in park ("bimbi che si rincorrono")
      if (runningKidsRef.current) {
        const { kid1, kid2, center, radius, speed } = runningKidsRef.current;
        const kidTime = elapsed * speed;

        // Kid 1 (Leader)
        const k1x = center.x + Math.cos(kidTime) * radius + Math.sin(kidTime * 2) * 0.4;
        const k1z = center.y + Math.sin(kidTime) * radius;
        kid1.group.position.set(k1x, 0, k1z);

        const k1dx = -Math.sin(kidTime) * radius + Math.cos(kidTime * 2) * 0.8;
        const k1dz = Math.cos(kidTime) * radius;
        kid1.group.rotation.y = Math.atan2(k1dx, k1dz);

        const k1Swing = Math.sin(kidTime * 14) * 0.75;
        kid1.leftLeg.rotation.x = k1Swing;
        kid1.rightLeg.rotation.x = -k1Swing;
        kid1.group.position.y = Math.abs(Math.sin(kidTime * 14)) * 0.08;

        // Kid 2 (Chaser following right behind)
        const lag = 0.52;
        const k2Time = kidTime - lag;
        const k2x = center.x + Math.cos(k2Time) * radius + Math.sin(k2Time * 2) * 0.4;
        const k2z = center.y + Math.sin(k2Time) * radius;
        kid2.group.position.set(k2x, 0, k2z);

        const k2dx = -Math.sin(k2Time) * radius + Math.cos(k2Time * 2) * 0.8;
        const k2dz = Math.cos(k2Time) * radius;
        kid2.group.rotation.y = Math.atan2(k2dx, k2dz);

        const k2Swing = Math.sin(k2Time * 14) * 0.75;
        kid2.leftLeg.rotation.x = k2Swing;
        kid2.rightLeg.rotation.x = -k2Swing;
        kid2.group.position.y = Math.abs(Math.sin(k2Time * 14)) * 0.08;
      }

      // Sun motes drift
      if (sunMotesRef.current) {
        sunMotesRef.current.rotation.y = elapsed * 0.02;
      }

      // Real-time animated LCD Advertising TV Screens (Left TV & Right TV)
      drawLCDAdvertisingScreen(lcdCtx1, elapsed);
      lcdTexture1.needsUpdate = true;

      drawLCDAdvertisingScreen(lcdCtx2, elapsed + 2.5);
      lcdTexture2.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [currentCustomer.id, stats.purchasedUpgrades, phonePlaced, isDeliveringRepairedPhone]);

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
