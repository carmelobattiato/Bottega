import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CustomerData, ToolId, PhoneRepairState, PhoneViewOrientation, GamePlayMode } from '../types/game';
import { soundManager } from '../utils/audio';

interface ThreeWorkbenchSceneProps {
  customer: CustomerData;
  phoneState: PhoneRepairState;
  selectedTool: ToolId;
  onPartClick: (partName: string) => void;
  orientation: PhoneViewOrientation;
  onSetOrientation: (newOri: PhoneViewOrientation) => void;
  onHeatSweep?: (
    zone: 'top' | 'right' | 'bottom' | 'left',
    weights?: { top: number; right: number; bottom: number; left: number }
  ) => void;
  onScrewProgressTick?: (screwId: string) => void;
  onPrySweep?: () => void;
  onDryerSweep?: (dropId: string) => void;
  onBrushSweep?: (spotId: string) => void;
  onSuctionDoubleClick?: () => void;
  gamePlayMode?: GamePlayMode;
}

// Helper to draw realistic jagged spiderweb fracture cracks
function drawSpiderwebCracks(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number = 1.0) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;

  const rays = 18;
  for (let r = 0; r < rays; r++) {
    const angle = (r / rays) * Math.PI * 2 + (r % 2 === 0 ? 0.08 : -0.08);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    let currX = centerX;
    let currY = centerY;
    const segments = 5;
    for (let s = 0; s < segments; s++) {
      const stepLen = (50 + (s * 35)) * scale;
      currX += Math.cos(angle + (Math.sin(s * 2.3) * 0.35)) * stepLen;
      currY += Math.sin(angle + (Math.cos(s * 2.3) * 0.35)) * stepLen;
      ctx.lineTo(currX, currY);
    }
    ctx.stroke();
  }

  // Concentric shatter rings
  ctx.lineWidth = 2.0;
  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    const radius = ring * 65 * scale;
    for (let a = 0; a <= Math.PI * 2; a += 0.2) {
      const wobble = radius + (Math.sin(a * 7) * 12);
      const px = centerX + Math.cos(a) * wobble;
      const py = centerY + Math.sin(a) * wobble;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Impact center puncture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function createSmartwatchScreenTexture(
  isPoweredOn: boolean,
  issueType: string,
  newScreenInstalled: boolean,
  thermalDamageOccurred: boolean = false,
  firmwareRestored: boolean = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark circular OLED background
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.fill();

  if (!isPoweredOn) {
    // Elegant Ambient Always-On Display (AOD) for Smartwatches
    // Outer hour tick marks
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x1 = 256 + Math.cos(angle) * 230;
      const y1 = 256 + Math.sin(angle) * 230;
      const x2 = 256 + Math.cos(angle) * (i % 3 === 0 ? 210 : 220);
      const y2 = 256 + Math.sin(angle) * (i % 3 === 0 ? 210 : 220);
      ctx.strokeStyle = i % 3 === 0 ? '#38bdf8' : '#334155';
      ctx.lineWidth = i % 3 === 0 ? 3.5 : 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Ambient minimalist analog clock hands
    // Hour hand (10 o'clock)
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(-Math.PI * 0.65) * 80, 256 + Math.sin(-Math.PI * 0.65) * 80);
    ctx.stroke();

    // Minute hand (42 minutes)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(-Math.PI * 0.1) * 130, 256 + Math.sin(-Math.PI * 0.1) * 130);
    ctx.stroke();

    // Center hub
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 256, 6, 0, Math.PI * 2);
    ctx.fill();

    // Ambient Digital Time & Battery
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('10:42', 256, 175);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    ctx.fillText('⚡ 88% • Standby AOD', 256, 340);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Tocca la Digital Crown per risvegliare', 256, 365);

    if (thermalDamageOccurred) {
      const radGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 160);
      radGrad.addColorStop(0, 'rgba(120, 20, 0, 0.85)');
      radGrad.addColorStop(0.5, 'rgba(60, 10, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, 512, 512);
    }
    if (issueType === 'broken_screen' && !newScreenInstalled) {
      drawSpiderwebCracks(ctx, 256, 256, 0.85);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // Handle software glitch / recovery on smartwatch
  if ((issueType === 'software_glitch' || issueType === 'boot_loop_corrupt_nand') && !firmwareRestored) {
    ctx.fillStyle = '#021c10';
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.45)';
      ctx.fillRect(40, 100 + Math.random() * 300, 432, Math.random() * 25);
    }

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ WATCH_OS BOOTLOOP', 256, 190);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('KERNEL_ERR_0x99', 256, 230);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '16px monospace';
    ctx.fillText('Collegare Dongle USB...', 256, 290);
    ctx.fillText('Ripristino Firmware', 256, 320);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // APPLE WATCH HONEYCOMB / BUBBLE GRID OF ROUND CIRCULAR APPS
  // Center clock & top status bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('10:42', 256, 52);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('⚡ 88%', 256, 74);

  // App definitions (Bubble circle with gradient, icon, and glossy 3D glass highlight)
  const appBubbles = [
    // Center app: Activity Rings
    { x: 256, y: 256, r: 42, bg: ['#0f172a', '#020617'], icon: '⭕', label: 'Attività', special: 'rings' },
    // Hexagonal ring 1 around center
    { x: 256, y: 168, r: 38, bg: ['#ef4444', '#b91c1c'], icon: '❤️', label: 'Battito' },
    { x: 334, y: 212, r: 38, bg: ['#0284c7', '#0369a1'], icon: '☀️', label: 'Meteo' },
    { x: 334, y: 300, r: 38, bg: ['#ec4899', '#be185d'], icon: '🎵', label: 'Musica' },
    { x: 256, y: 344, r: 38, bg: ['#10b981', '#047857'], icon: '🏃', label: 'Workout' },
    { x: 178, y: 300, r: 38, bg: ['#f59e0b', '#d97706'], icon: '⏱️', label: 'Timer' },
    { x: 178, y: 212, r: 38, bg: ['#6366f1', '#4338ca'], icon: '🗺️', label: 'Mappe' },
    // Outer ring apps
    { x: 256, y: 92, r: 32, bg: ['#22c55e', '#15803d'], icon: '📞', label: 'Telefono' },
    { x: 334, y: 128, r: 32, bg: ['#38bdf8', '#0284c7'], icon: '💬', label: 'Messaggi' },
    { x: 410, y: 172, r: 30, bg: ['#64748b', '#334155'], icon: '⚙️', label: 'Impostazioni' },
    { x: 410, y: 256, r: 30, bg: ['#f97316', '#c2410c'], icon: '🧭', label: 'Bussola' },
    { x: 410, y: 340, r: 30, bg: ['#8b5cf6', '#6d28d9'], icon: '📧', label: 'Mail' },
    { x: 334, y: 384, r: 32, bg: ['#06b6d4', '#0891b2'], icon: '🧮', label: 'Calcolatrice' },
    { x: 256, y: 424, r: 32, bg: ['#14b8a6', '#0f766e'], icon: '🛌', label: 'Sonno' },
    { x: 178, y: 384, r: 32, bg: ['#64748b', '#1e293b'], icon: '📸', label: 'Fotocamera' },
    { x: 102, y: 340, r: 30, bg: ['#e11d48', '#9f1239'], icon: '🩸', label: 'Ossigeno' },
    { x: 102, y: 256, r: 30, bg: ['#a855f7', '#7e22ce'], icon: '🎙️', label: 'Memo' },
    { x: 102, y: 172, r: 30, bg: ['#eab308', '#ca8a04'], icon: '📝', label: 'Note' },
    { x: 178, y: 128, r: 32, bg: ['#3b82f6', '#1d4ed8'], icon: '📅', label: 'Calendario' },
  ];

  appBubbles.forEach(app => {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Gradient background
    const grad = ctx.createLinearGradient(app.x - app.r, app.y - app.r, app.x + app.r, app.y + app.r);
    grad.addColorStop(0, app.bg[0]);
    grad.addColorStop(1, app.bg[1]);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(app.x, app.y, app.r, 0, Math.PI * 2);
    ctx.fill();

    // 3D Glass border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Specular top reflection
    const glossGrad = ctx.createLinearGradient(app.x, app.y - app.r, app.x, app.y);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    ctx.arc(app.x, app.y - app.r * 0.35, app.r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw Activity Rings inside the center app
    if (app.special === 'rings') {
      const ringDefs = [
        { rad: app.r * 0.72, col: '#ef4444', end: 1.6 * Math.PI },
        { rad: app.r * 0.52, col: '#10b981', end: 1.4 * Math.PI },
        { rad: app.r * 0.32, col: '#06b6d4', end: 1.8 * Math.PI },
      ];
      ringDefs.forEach(rd => {
        ctx.strokeStyle = rd.col;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(app.x, app.y, rd.rad, -Math.PI / 2, rd.end);
        ctx.stroke();
      });
    } else {
      // Draw Emoji/Icon centered
      ctx.font = `${Math.round(app.r * 0.95)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(app.icon, app.x, app.y + 2);
    }
  });

  if (issueType === 'broken_screen' && !newScreenInstalled) {
    drawSpiderwebCracks(ctx, 256, 256, 0.85);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createPhoneScreenTexture(
  isPoweredOn: boolean,
  issueType: string,
  firmwareRestored: boolean,
  newScreenInstalled: boolean,
  thermalDamageOccurred: boolean = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  if (!isPoweredOn) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 1024);

    // Punch hole selfie camera
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(256, 45, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(252, 42, 4, 0, Math.PI * 2);
    ctx.fill();

    if (thermalDamageOccurred) {
      // Burnt LCD dark thermal spot
      const radGrad = ctx.createRadialGradient(256, 512, 20, 256, 512, 180);
      radGrad.addColorStop(0, 'rgba(120, 20, 0, 0.85)');
      radGrad.addColorStop(0.5, 'rgba(60, 10, 0, 0.6)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(50, 300, 412, 424);
    }

    // 8) Draw broken glass cracks EVEN WHEN TURNED OFF!
    if (issueType === 'broken_screen' && !newScreenInstalled) {
      drawSpiderwebCracks(ctx, 210, 430, 0.95);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  if (issueType === 'software_glitch' && !firmwareRestored) {
    ctx.fillStyle = '#041f14';
    ctx.fillRect(0, 0, 512, 1024);

    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)';
      ctx.fillRect(0, Math.random() * 1024, 512, Math.random() * 35);
    }

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('> SYSTEM BOOT_LOOP_ERROR', 35, 270);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 34px monospace';
    ctx.fillText('CRITICAL_KERNEL_0x89', 35, 330);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '22px monospace';
    ctx.fillText('Attaching FastBoot JTAG...', 35, 410);
    ctx.fillText('Connect Cyber-Dongle USB', 35, 450);

    ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
    ctx.font = '17px monospace';
    for (let y = 520; y < 980; y += 36) {
      ctx.fillText(`0x${Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase()} CORRUPT_SECTOR`, 35, y);
    }
  } else {
    // Beautiful vibrant modern OS desktop
    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.35, '#3b82f6');
    grad.addColorStop(0.7, '#8b5cf6');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Punch hole camera
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(256, 45, 14, 0, Math.PI * 2);
    ctx.fill();

    // Status bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('12:45', 45, 52);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('5G  📶  🔋84%', 350, 52);

    // Giant clock
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('12:45', 256, 210);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Domenica, 27 Settembre • 24°C ☀️', 256, 255);

    // Desktop App Grid
    const apps = [
      { name: 'Messaggi', color: '#10b981', icon: '💬' },
      { name: 'Mappe', color: '#0ea5e9', icon: '📍' },
      { name: 'Foto', color: '#f59e0b', icon: '🖼️' },
      { name: 'Musica', color: '#ec4899', icon: '🎵' },
      { name: 'Banca', color: '#6366f1', icon: '💳' },
      { name: 'Social', color: '#8b5cf6', icon: '🌐' },
      { name: 'Videogiochi', color: '#ef4444', icon: '🎮' },
      { name: 'Impostazioni', color: '#475569', icon: '⚙️' },
    ];

    apps.forEach((app, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 55 + col * 105;
      const y = 330 + row * 125;

      ctx.fillStyle = app.color;
      ctx.beginPath();
      ctx.roundRect(x, y, 76, 76, 20);
      ctx.fill();

      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(app.icon, x + 38, y + 52);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(app.name, x + 38, y + 98);
    });

    // Dock container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.roundRect(40, 870, 432, 105, 30);
    ctx.fill();

    const dockApps = [
      { color: '#10b981', emoji: '📞' },
      { color: '#06b6d4', emoji: '🌐' },
      { color: '#3b82f6', emoji: '💬' },
      { color: '#64748b', emoji: '📷' },
    ];
    dockApps.forEach((app, idx) => {
      const x = 60 + idx * 105;
      const y = 888;
      ctx.fillStyle = app.color;
      ctx.beginPath();
      ctx.roundRect(x, y, 70, 70, 18);
      ctx.fill();
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(app.emoji, x + 35, y + 48);
    });
  }

  // 8) Broken screen spiderweb cracks (When powered on)
  if (issueType === 'broken_screen' && !newScreenInstalled) {
    drawSpiderwebCracks(ctx, 230, 470, 1.0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 8) Dedicated Texture for Rear Cover with Glass Cracks
function createBackCoverTexture(
  colorHex: string,
  isCracked: boolean,
  modelName: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Premium satin glass body
  ctx.fillStyle = colorHex || '#1e293b';
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle metallic reflection gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Center subtle brand glyph or device name
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  const brandName = modelName.includes('iPhone') ? '' : modelName.includes('Samsung') ? 'SAMSUNG' : 'TITANIUM';
  ctx.fillText(brandName, 256, 512);

  // 8) CRACKED BACK GLASS FRACTURES
  if (isCracked) {
    drawSpiderwebCracks(ctx, 360, 240, 1.1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Ultra-Realistic Procedural Motherboard / Logic Board Texture with Circuit Traces, SMD Footprints & Silkscreen Markings
function createMotherboardTexture(devCategory: string = 'smartphone'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1) Multilayer Deep Obsidian Navy / Sapphire FR4 substrate with fiberglass weave
  ctx.fillStyle = '#060d1a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Fiberglass composite microscopic weave pattern
  ctx.strokeStyle = 'rgba(15, 35, 65, 0.45)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Copper ground pour islands with thermal relief clearance
  ctx.fillStyle = '#0a192f';
  ctx.fillRect(40, 40, 944, 944);

  // 2) Copper & Golden High-Speed Differential Bus Routing Traces
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 1;

  const buses = [
    [120, 100, 120, 380, 240, 500, 420, 500],
    [160, 80, 160, 360, 280, 480, 420, 480],
    [200, 60, 200, 340, 320, 460, 420, 460],
    [880, 120, 880, 420, 780, 520, 600, 520],
    [840, 140, 840, 400, 740, 500, 600, 500],
    [800, 160, 800, 380, 700, 480, 600, 480],
    [300, 600, 300, 820, 420, 940, 600, 940],
    [340, 620, 340, 800, 450, 910, 600, 910],
    [380, 640, 380, 780, 480, 880, 600, 880],
    [700, 600, 700, 820, 580, 940, 420, 940],
    [740, 620, 740, 800, 550, 910, 420, 910],
  ];

  buses.forEach(b => {
    ctx.beginPath();
    ctx.moveTo(b[0], b[1]);
    for (let i = 2; i < b.length; i += 2) {
      ctx.lineTo(b[i], b[i + 1]);
    }
    ctx.stroke();
  });

  // Micro Gold Circuit Traces with realistic 45-degree angle bends
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 48; i++) {
    const sx = 70 + (i * 21) % 880;
    const sy = 80 + (i * 29) % 840;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 35, sy);
    ctx.lineTo(sx + 70, sy + 35);
    ctx.lineTo(sx + 130, sy + 35);
    ctx.stroke();
  }

  // Serpentine delay-matching clock traces
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.4;
  for (let s = 0; s < 6; s++) {
    let px = 220 + s * 95;
    let py = 410;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let j = 0; j < 6; j++) {
      ctx.lineTo(px + 12, py + (j % 2 === 0 ? 10 : -10));
      px += 12;
    }
    ctx.stroke();
  }

  // 3) Plated Gold Vias (Micro-fori passanti metallizzati)
  ctx.fillStyle = '#fbbf24';
  ctx.shadowBlur = 0;
  for (let i = 0; i < 110; i++) {
    const vx = 60 + ((i * 43) % 910);
    const vy = 60 + ((i * 59) % 910);
    ctx.beginPath();
    ctx.arc(vx, vy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#060d1a';
    ctx.beginPath();
    ctx.arc(vx, vy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
  }

  // 4) Golden Circular Test Points (TP1 .. TP18)
  for (let t = 1; t <= 16; t++) {
    const tpx = 120 + ((t * 67) % 780);
    const tpy = 140 + ((t * 79) % 720);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tpx, tpy, 7, 0, Math.PI * 2);
    ctx.fill();

    // Central probe indent
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(tpx, tpy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`TP${t}`, tpx + 10, tpy + 4);
  }

  // 5) Realistic Silicon BGA Chips (SoC, Flash, RAM, PMIC, Modem)
  const chips = [
    { x: 410, y: 170, w: 230, h: 230, name: 'A18 PRO / 3nm', sub: 'NEURAL BIONIC SoC', isCpu: true },
    { x: 150, y: 550, w: 190, h: 210, name: 'UFS 4.0 NAND', sub: '512GB FLASH NVMe' },
    { x: 670, y: 550, w: 180, h: 180, name: 'LPDDR5X RAM', sub: '16GB 8533Mbps' },
    { x: 440, y: 720, w: 160, h: 150, name: 'PMIC VDD_MAIN', sub: 'POWER CONTROLLER', isPmic: true },
    { x: 170, y: 210, w: 150, h: 130, name: '5G MODEM RF', sub: 'QUALCOMM X75' },
    { x: 690, y: 230, w: 140, h: 120, name: 'SECURE ENCLAVE', sub: 'CRYPTO HARDWARE' },
  ];

  chips.forEach(c => {
    // Chip dark epoxy substrate package
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, c.w, c.h, 6);
    ctx.fill();

    // Chamfer border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // If CPU SoC: Add mirrored silicon die in center!
    if (c.isCpu) {
      const dieW = c.w * 0.72;
      const dieH = c.h * 0.72;
      const dieX = c.x + (c.w - dieW) / 2;
      const dieY = c.y + (c.h - dieH) / 2;

      // Glossy dark silicon die
      const dieGrad = ctx.createLinearGradient(dieX, dieY, dieX + dieW, dieY + dieH);
      dieGrad.addColorStop(0, '#1e293b');
      dieGrad.addColorStop(0.5, '#0f172a');
      dieGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = dieGrad;
      ctx.fillRect(dieX, dieY, dieW, dieH);

      // Silicon gold die perimeter ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dieX, dieY, dieW, dieH);

      // Micro decoupling capacitors on package substrate around die
      ctx.fillStyle = '#94a3b8';
      for (let mx = c.x + 8; mx < c.x + c.w - 8; mx += 14) {
        ctx.fillRect(mx, c.y + 6, 8, 4);
        ctx.fillRect(mx, c.y + c.h - 10, 8, 4);
      }
    }

    // Pin 1 Index orientation dot
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(c.x + 12, c.y + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Perimeter solder leads (BGA/QFP footprint)
    ctx.fillStyle = '#cbd5e1';
    for (let lx = c.x + 14; lx < c.x + c.w - 14; lx += 12) {
      ctx.fillRect(lx, c.y - 3, 6, 3);
      ctx.fillRect(lx, c.y + c.h, 6, 3);
    }
    for (let ly = c.y + 14; ly < c.y + c.h - 14; ly += 12) {
      ctx.fillRect(c.x - 3, ly, 3, 6);
      ctx.fillRect(c.x + c.w, ly, 3, 6);
    }

    // Laser-etched white chip silkscreen
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.name, c.x + c.w / 2, c.y + c.h / 2 - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(c.sub, c.x + c.w / 2, c.y + c.h / 2 + 12);
  });

  // 6) Surface Mount Power Inductors next to PMIC (Molded gray blocks with coil markings)
  const inductors = [
    { x: 385, y: 730 },
    { x: 385, y: 775 },
    { x: 385, y: 820 },
    { x: 615, y: 730 },
    { x: 615, y: 775 },
  ];
  inductors.forEach(ind => {
    // Molded ferrite core
    ctx.fillStyle = '#334155';
    ctx.fillRect(ind.x, ind.y, 35, 30);
    // Silver end terminations
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(ind.x, ind.y, 6, 30);
    ctx.fillRect(ind.x + 29, ind.y, 6, 30);
    // Stamped inductance marking
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1R0', ind.x + 17, ind.y + 18);
  });

  // 7) Gold Canned Crystal Oscillators (Quarzi con coperchio dorato)
  const crystals = [
    { x: 350, y: 230, freq: '26.000M' },
    { x: 650, y: 440, freq: '32.768K' },
  ];
  crystals.forEach(cr => {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cr.x, cr.y, 32, 22);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cr.x, cr.y, 32, 22);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cr.freq, cr.x + 16, cr.y + 14);
  });

  // 8) Board-to-Board (B2B) Multi-Pin FPC Sockets with Dual Rows of Gold Pins
  const sockets = [
    { x: 80, y: 420, w: 28, h: 90, label: 'DISP_FPC' },
    { x: 80, y: 540, w: 28, h: 70, label: 'TOUCH_FPC' },
    { x: 910, y: 420, w: 28, h: 80, label: 'CAM_FPC' },
    { x: 910, y: 530, w: 28, h: 70, label: 'SUB_FPC' },
    { x: 260, y: 880, w: 80, h: 26, label: 'BATT_FPC' },
  ];
  sockets.forEach(s => {
    // Black plastic socket shell
    ctx.fillStyle = '#020617';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x, s.y, s.w, s.h);

    // Dual rows of miniature gold pins
    ctx.fillStyle = '#fbbf24';
    if (s.w < s.h) {
      for (let py = s.y + 6; py < s.y + s.h - 6; py += 6) {
        ctx.fillRect(s.x + 5, py, 5, 3);
        ctx.fillRect(s.x + s.w - 10, py, 5, 3);
      }
    } else {
      for (let px = s.x + 6; px < s.x + s.w - 6; px += 6) {
        ctx.fillRect(px, s.y + 4, 3, 5);
        ctx.fillRect(px, s.y + s.h - 9, 3, 5);
      }
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, s.x, s.y - 4);
  });

  // 9) Dense Surface-Mount SMD 0201/0402 Capacitors & Resistors
  for (let s = 0; s < 140; s++) {
    const smdX = 80 + ((s * 41) % 870);
    const smdY = 70 + ((s * 47) % 870);
    // Body: ceramic brown or charcoal
    ctx.fillStyle = s % 3 === 0 ? '#451a03' : s % 3 === 1 ? '#1e293b' : '#3f3f46';
    ctx.fillRect(smdX, smdY, 12, 7);
    // Silver solder terminations
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(smdX, smdY, 2.5, 7);
    ctx.fillRect(smdX + 9.5, smdY, 2.5, 7);
  }

  // 10) Crisp White Silkscreen Typography (Revisions, Net Names, Safety)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MAIN_LOGIC_BOARD_REV_5.4 • 2026 OEM HIGH-SPEED', 55, 45);
  ctx.font = '11px monospace';
  ctx.fillText('VDD_MAIN: 3.85V | GND_ISO | JTAG_EN | B2B_40PIN | DUAL-STACK PCB', 55, 68);
  ctx.fillText('⚡ HIGH DENSITY INTERCONNECT (HDI) • IMMERSION GOLD ENIG', 55, 995);
  ctx.fillText('ROHS COMPLIANT • LEAD-FREE (Pb) • ESD SENSITIVE', 620, 995);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Ultra-Realistic Lithium-Ion / Polymer Battery Pack Texture with Full Safety Labels, Barcodes & Regulatory Marks
function createBatteryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1) Matte Deep Charcoal / Carbon Black Wrapper
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 1024);

  // Brushed foil metallic specular gradient sheen
  const foilGrad = ctx.createLinearGradient(0, 0, 512, 1024);
  foilGrad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
  foilGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0)');
  foilGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.06)');
  foilGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = foilGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // Vacuum-sealed border crimp texture
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 1012);

  // 2) Top Yellow Caution Stripe
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(20, 24, 472, 22);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('⚠️ RECHARGEABLE LITHIUM-ION POLYMER BATTERY • OEM CERTIFIED', 256, 39);

  // 3) Main Battery Header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 25px -apple-system, sans-serif';
  ctx.fillText('BATTERIA AGLI IONI DI LITIO', 28, 88);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('Model: BT-9500PRO-MAX (1ICP5/64/98)', 28, 116);

  // 4) Spec Table Box
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 134, 456, 175);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.fillRect(28, 134, 456, 175);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('Rated Capacity: 4,950 mAh / 19.15 Wh', 42, 168);
  ctx.fillText('Nominal Voltage: 3.87 V⎓', 42, 198);
  ctx.fillText('Limited Charge Voltage: 4.45 V⎓', 42, 228);
  ctx.fillText('Standard: GB 31241-2022 / IEC 62133-2', 42, 258);
  ctx.fillText('Operating Temp: 0°C to 45°C (Discharge -20°C)', 42, 288);

  // 5) Multilingual Safety Warning Section
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('⚠️ PERICOLO / ATTENZIONE / WARNING / ACHTUNG:', 28, 345);

  const warnings = [
    '• Non forare, schiacciare, riscaldare o gettare nel fuoco.',
    '• Do not disassemble, puncture, crush or short circuit terminals.',
    '• Rischio di incendio, esplosione e ustioni se manomessa.',
    '• Nicht zerlegen, erhitzen oder ins Feuer werfen.',
    '• Use authorized OEM high-efficiency charger only.',
  ];

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '12px -apple-system, sans-serif';
  warnings.forEach((w, idx) => {
    ctx.fillText(w, 28, 375 + idx * 26);
  });

  // 6) Clean Vector Regulatory Certification Badges (CE, RoHS, Li-ion Recycle, WEEE Bin)
  // Badge 1: CE Mark
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(32, 530, 68, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CE', 66, 562);

  // Badge 2: RoHS Compliant
  ctx.strokeRect(112, 530, 78, 48);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('RoHS', 151, 560);

  // Badge 3: Li-ion Recycle Symbol
  ctx.strokeRect(202, 530, 88, 48);
  ctx.font = 'bold 13px monospace';
  ctx.fillText('♻️ Li-ion', 246, 560);

  // Badge 4: WEEE crossed-out dustbin symbol
  ctx.strokeRect(302, 530, 72, 48);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('WEEE ❌', 338, 560);

  // Badge 5: UKCA / KC
  ctx.strokeRect(386, 530, 88, 48);
  ctx.font = 'bold 13px monospace';
  ctx.fillText('UKCA/KC', 430, 560);

  // 7) Realistic 2D DataMatrix QR Code
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 620, 110, 110);
  ctx.fillStyle = '#000000';
  ctx.fillRect(48, 628, 28, 28);
  ctx.fillRect(114, 628, 28, 28);
  ctx.fillRect(48, 694, 28, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(54, 634, 16, 16);
  ctx.fillRect(120, 634, 16, 16);
  ctx.fillRect(54, 700, 16, 16);
  ctx.fillStyle = '#000000';
  for (let qx = 0; qx < 8; qx++) {
    for (let qy = 0; qy < 8; qy++) {
      if ((qx * 3 + qy * 7) % 2 === 0) {
        ctx.fillRect(86 + qx * 4, 664 + qy * 4, 4, 4);
      }
    }
  }

  // Serial Number and Specs
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('S/N: BT2026-X8849-0941829-REV4', 168, 645);
  ctx.fillText('P/N: 616-00941-A • QC PASSED', 168, 672);
  ctx.fillText('Cell: High-Density Silicon-Carbon Li-Po', 168, 699);
  ctx.fillText('Origin: Cleanroom 10K Automated Fab', 168, 726);

  // 8) High-density 1D Barcode
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(36, 755, 440, 48);
  ctx.fillStyle = '#000000';
  for (let bx = 46; bx < 466; bx += 3) {
    const isBar = (bx * 13) % 7 < 4;
    if (isBar) {
      ctx.fillRect(bx, 760, (bx % 5 === 0 ? 3 : 1.5), 38);
    }
  }

  // 9) Bottom Silicone Pull Tab Instructions with White Arrows
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(28, 835, 456, 68);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 835, 456, 68);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 15px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⬇️ TIRARE LE LINGUETTE ADESIVE PER ESTRARRE ⬇️', 256, 865);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText('STRETCH RELEASE ADHESIVE TABS • DO NOT PRY WITH METAL', 256, 888);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Procedural Copper Vapor Chamber Texture with Heat Dissipation Channels & Serial
function createVaporChamberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Brushed Red-Copper base
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 512, 1024);

  // Metallic brushed copper highlights
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
  grad.addColorStop(0.3, 'rgba(180, 83, 9, 0)');
  grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
  grad.addColorStop(1, 'rgba(120, 53, 15, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Stamped sintered heat-pipe channels
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(120, 80);
  ctx.lineTo(120, 600);
  ctx.lineTo(260, 800);
  ctx.lineTo(260, 950);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(380, 80);
  ctx.lineTo(380, 600);
  ctx.lineTo(260, 800);
  ctx.stroke();

  // Fine brushed hairline texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 1024; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Laser engraved text
  ctx.fillStyle = 'rgba(69, 26, 3, 0.85)';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OEM COPPER VAPOR CHAMBER • 0.35mm ULTRA-THIN', 256, 140);
  ctx.font = '11px monospace';
  ctx.fillText('THERMAL SINTERED HEAT SINK ARCHITECTURE', 256, 170);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Procedural Laser-Perforated EMI Shield Texture
function createEmiShieldTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Stamped nickel-silver metal base
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 256, 256);

  // Embossed perimeter cross-ribs
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 236, 236);

  // Array of micro laser-cut heat dissipation holes
  ctx.fillStyle = '#334155';
  for (let x = 24; x < 240; x += 18) {
    for (let y = 24; y < 240; y += 18) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ground contact fingers on edges
  ctx.fillStyle = '#e2e8f0';
  for (let x = 30; x < 230; x += 30) {
    ctx.fillRect(x, 2, 12, 6);
    ctx.fillRect(x, 248, 12, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

// 1) Helper to render clean, subtle printed/silkscreen 3D component text labels (Point 3: Basta il nome sul modulo)
function createComponentLabel(
  text: string,
  bgColor: string = 'rgba(15, 23, 42, 0.55)',
  textColor: string = '#e2e8f0',
  scaleX: number = 0.36,
  scaleY: number = 0.08
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;

  // Subtle clean semi-transparent badge
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 84, 18);
  ctx.fill();

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 50);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.88,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scaleX, scaleY, 1);
  sprite.renderOrder = 999;
  return sprite;
}

export const ThreeWorkbenchScene: React.FC<ThreeWorkbenchSceneProps> = ({
  customer,
  phoneState,
  selectedTool,
  onPartClick,
  orientation,
  onSetOrientation,
  onHeatSweep,
  onScrewProgressTick,
  onPrySweep,
  onDryerSweep,
  onBrushSweep,
  onSuctionDoubleClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const phoneGroupRef = useRef<THREE.Group | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [tiltDegrees, setTiltDegrees] = useState<number>(0); // Inclinazione personalizzata dello smartphone in tempo reale
  const tiltDegreesRef = useRef<number>(0);
  const orientationRef = useRef<PhoneViewOrientation>(orientation);

  useEffect(() => {
    tiltDegreesRef.current = tiltDegrees;
  }, [tiltDegrees]);

  useEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);

  // Camera pan offset for fine framing and navigation (frecce schermo & frecce tastiera)
  const cameraPan = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const [cameraPanUI, setCameraPanUI] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Blocked component red highlighting for 2 seconds
  const blockedHighlightRef = useRef<{ parts: string[]; until: number }>({ parts: [], until: 0 });
  const [blockedAlert, setBlockedAlert] = useState<{ message: string; parts: string[] } | null>(null);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 3.4, 2.9));

  // Hover Tooltip for identifying parts without tool (Point 1 & 6)
  const [hoveredInfo, setHoveredInfo] = useState<{
    name: string;
    category: string;
    condition: string;
    action: string;
    x: number;
    y: number;
  } | null>(null);

  // Clear hover info popups immediately when holding any tool
  useEffect(() => {
    if (selectedTool !== 'none') {
      setHoveredInfo(null);
    }
  }, [selectedTool]);

  const [show3DLabels, setShow3DLabels] = useState<boolean>(true);

  const activeToolMeshRef = useRef<THREE.Group | null>(null);
  const thermalParticlesRef = useRef<THREE.Points | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const snappedScrewRef = useRef<string | null>(null);
  const [snappedScrewUI, setSnappedScrewUI] = useState<string | null>(null);

  const mousePlanePos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 0));
  const pointerNorm = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const isMouseDown = useRef<boolean>(false);

  const screwTargetsRef = useRef<{ id: string; pos: THREE.Vector3; name: string }[]>([]);
  const lastSoundTime = useRef<number>(0);
  const lastHeatTickTime = useRef<number>(0);
  const unscrewIntervalRef = useRef<number | null>(null);

  const handleZoom = (delta: number) => {
    setZoomScale(prev => {
      const next = Math.max(0.25, Math.min(6.0, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleSetExactZoom = (val: number) => {
    setZoomScale(Number(val.toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
  };

  // Camera Pan Controls (Freccia Su, Giù, Sinistra, Destra e Reset)
  const handlePan = (dx: number, dy: number) => {
    cameraPan.current.x = Math.max(-2.5, Math.min(2.5, cameraPan.current.x + dx));
    cameraPan.current.y = Math.max(-2.5, Math.min(2.5, cameraPan.current.y + dy));
    setCameraPanUI({ x: cameraPan.current.x, y: cameraPan.current.y });
  };

  const handleResetPan = () => {
    cameraPan.current.set(0, 0);
    setCameraPanUI({ x: 0, y: 0 });
  };

  // Keyboard navigation listener (Frecce tastiera + WASD + Zoom +/- + Reset R/Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const step = 0.25 / zoomScale;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handlePan(0, -step);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlePan(0, step);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePan(-step, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handlePan(step, 0);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoom(0.3);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoom(-0.3);
      } else if (e.key === 'r' || e.key === 'R' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleResetPan();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomScale]);

  const triggerBlockedPrerequisites = (parts: string[], message: string) => {
    blockedHighlightRef.current = {
      parts,
      until: Date.now() + 2000,
    };
    setBlockedAlert({ message, parts });
    soundManager.playBuzzer();
    setTimeout(() => {
      setBlockedAlert(prev => (prev?.message === message ? null : prev));
    }, 2000);
  };

  useEffect(() => {
    if (selectedTool === 'heatgun') {
      soundManager.startHeatGunLoop();
    } else {
      soundManager.stopHeatGunLoop();
    }
    return () => {
      soundManager.stopHeatGunLoop();
    };
  }, [selectedTool]);

  useEffect(() => {
    if (cameraRef.current) {
      let baseCam = new THREE.Vector3(0, 3.4, 2.9);
      if (orientation === 'side_bottom') {
        // Point 3: Vista bordo USB inclinato a 60 gradi verso la telecamera
        baseCam.set(0, 1.45, 3.3);
      } else if (orientation === 'side_top') {
        baseCam.set(0, 2.4, -2.3);
      } else if (orientation === 'side_right' || orientation === 'side_left') {
        baseCam.set(0, 2.8, 1.8);
      }
      const scaled = baseCam.clone().multiplyScalar(1 / zoomScale);
      targetCameraPos.current.copy(scaled);
    }
  }, [zoomScale, orientation]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Mouse wheel zoom listener for smooth deep zooming (Point 2)
    const handleWheelZoom = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoomScale(prev => {
        const next = Math.max(0.25, Math.min(6.0, prev + delta));
        return Number(next.toFixed(2));
      });
    };

    container.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelZoom);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const baseCam = new THREE.Vector3(0, 3.4, 2.9).multiplyScalar(1 / zoomScale);
    camera.position.copy(baseCam);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Clean laboratory lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xfef3c7, 2.6);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.8);
    sunLight.position.set(3.5, 6, 2.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const deskSpot = new THREE.SpotLight(0xffffff, 5.5);
    deskSpot.position.set(0, 4.8, 0.2);
    deskSpot.angle = Math.PI / 3.2;
    deskSpot.penumbra = 0.4;
    deskSpot.castShadow = true;
    scene.add(deskSpot);

    const leftFill = new THREE.PointLight(0xdbeafe, 2.2, 10);
    leftFill.position.set(-3.2, 2.5, 0.5);
    scene.add(leftFill);

    const rightRim = new THREE.PointLight(0xffedd5, 1.8, 10);
    rightRim.position.set(3.2, 1.8, -1.5);
    scene.add(rightRim);

    // Workbench Table & ESD Mat
    const tableGeo = new THREE.BoxGeometry(7, 0.08, 4.8);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.15,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, -0.04, 0);
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // ESD Silicone Mat
    const matGeo = new THREE.BoxGeometry(4.2, 0.016, 2.9);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant ESD blue
      roughness: 0.4,
      metalness: 0.05,
    });
    const matMesh = new THREE.Mesh(matGeo, matMat);
    matMesh.position.set(0, 0.008, 0);
    matMesh.receiveShadow = true;
    scene.add(matMesh);

    // ESD Grid lines
    const grid = new THREE.GridHelper(2.6, 16, 0x38bdf8, 0x0369a1);
    grid.position.set(0, 0.017, 0);
    scene.add(grid);

    // Magnetic screw organizer tray on right
    const trayGeo = new THREE.BoxGeometry(0.85, 0.03, 1.6);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.4 });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(1.6, 0.015, 0);
    trayMesh.receiveShadow = true;
    scene.add(trayMesh);

    // SMARTPHONE ASSEMBLY
    const phone = new THREE.Group();
    phoneGroupRef.current = phone;
    scene.add(phone);

    // Precise resting elevation on the mat with dynamic tilt (Point 5)
    let targetPosY = 0.055;
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    if (orientation === 'back') {
      rotZ = Math.PI;
      targetPosY = 0.055;
      rotX = -(tiltDegrees * Math.PI / 180);
      targetPosY += Math.sin(Math.abs(tiltDegrees) * Math.PI / 180) * 0.55;
    } else if (orientation === 'side_right') {
      rotZ = Math.PI / 2;
      targetPosY = 0.65;
      rotX = -(tiltDegrees * Math.PI / 180);
    } else if (orientation === 'side_left') {
      rotZ = -Math.PI / 2;
      targetPosY = 0.65;
      rotX = -(tiltDegrees * Math.PI / 180);
    } else if (orientation === 'side_bottom') {
      // 60 gradi base + tilt personalizzato
      rotX = -Math.PI / 3 - (tiltDegrees * Math.PI / 180);
      targetPosY = 0.55 + Math.sin(tiltDegrees * Math.PI / 180) * 0.35;
    } else if (orientation === 'side_top') {
      rotX = Math.PI / 2;
      targetPosY = 1.25;
    } else {
      // Front view
      rotX = -(tiltDegrees * Math.PI / 180);
      targetPosY = 0.055 + Math.sin(Math.abs(tiltDegrees) * Math.PI / 180) * 0.55;
    }

    phone.position.set(0, targetPosY, 0);
    phone.rotation.set(rotX, rotY, rotZ);

    const phoneColorHex = parseInt(customer.phoneColor.replace('#', '0x'), 16) || 0x38bdf8;
    screwTargetsRef.current = [];

    const devCat = customer.deviceCategory || (
      customer.phoneModelName.includes('iPad') || customer.phoneModelName.includes('Tab') ? 'tablet' :
      customer.phoneModelName.includes('Watch') ? 'smartwatch' :
      customer.phoneModelName.includes('MacBook') || customer.phoneModelName.includes('Laptop') ? 'laptop' :
      customer.phoneModelName.includes('PlayStation') || customer.phoneModelName.includes('PS') ? 'console' :
      'smartphone'
    );

    // Chassis geometry adapting to realistic device categories
    let cWidth = 1.30;
    let cHeight = 2.50;
    let cDepth = 0.09;
    if (devCat === 'tablet') {
      cWidth = 2.05;
      cHeight = 2.85;
      cDepth = 0.07;
    } else if (devCat === 'smartwatch') {
      cWidth = 1.10;
      cHeight = 1.10;
      cDepth = 0.14;
    } else if (devCat === 'laptop') {
      cWidth = 2.40;
      cHeight = 2.10;
      cDepth = 0.09;
    } else if (devCat === 'console') {
      cWidth = 2.60;
      cHeight = 2.40;
      cDepth = 0.35;
    }

    // Midframe Chassis
    let chassis: THREE.Mesh;
    if (devCat === 'smartwatch') {
      const watchChassisGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.08, 48);
      const watchChassisMat = new THREE.MeshStandardMaterial({
        color: phoneColorHex,
        metalness: 0.95,
        roughness: 0.18,
      });
      chassis = new THREE.Mesh(watchChassisGeo, watchChassisMat);
      chassis.position.set(0, 0, 0);
      chassis.name = 'chassis';
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      phone.add(chassis);

      // Digital Crown button on right side
      const crownGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 24);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.98, roughness: 0.1 });
      const crownMesh = new THREE.Mesh(crownGeo, crownMat);
      crownMesh.rotation.z = Math.PI / 2;
      crownMesh.position.set(0.84, 0.02, -0.15);
      crownMesh.name = 'power_button';
      phone.add(crownMesh);

      // Smartwatch Side Multitasking / Volume Button
      const isWatchVolStuck = customer.issueType === 'stuck_volume_buttons' && !phoneState.volumeButtonsFixed;
      const watchSideBtnGeo = new THREE.BoxGeometry(0.04, 0.03, 0.28);
      const watchSideBtnMat = new THREE.MeshStandardMaterial({
        color: isWatchVolStuck ? 0xef4444 : phoneState.volumeButtonsFixed ? 0x10b981 : 0x0284c7,
        metalness: 0.95,
        roughness: 0.15,
      });
      const watchSideBtn = new THREE.Mesh(watchSideBtnGeo, watchSideBtnMat);
      watchSideBtn.position.set(0.83, 0.02, 0.22);
      watchSideBtn.name = 'volume_buttons';
      phone.add(watchSideBtn);

      // Watch Straps extending top & bottom
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
      const topStrap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.025, 1.1), strapMat);
      topStrap.position.set(0, -0.02, -1.2);
      phone.add(topStrap);

      const botStrap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.025, 1.1), strapMat);
      botStrap.position.set(0, -0.02, 1.2);
      phone.add(botStrap);
    } else if (devCat === 'console') {
      // Hyper-Realistic PlayStation 5 (PS5) with iconic curved white side panels, central black core, and glowing blue LED strip
      const coreGeo = new THREE.BoxGeometry(cWidth * 0.45, cDepth * 0.9, cHeight * 0.95);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.name = 'chassis';
      phone.add(core);

      // Left curved white side plate wing
      const wingGeo = new THREE.BoxGeometry(cWidth * 0.26, cDepth * 0.95, cHeight);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.1 });
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-cWidth * 0.32, 0.02, 0);
      leftWing.rotation.y = 0.08;
      leftWing.name = 'chassis';
      phone.add(leftWing);

      // Right curved white side plate wing
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(cWidth * 0.32, 0.02, 0);
      rightWing.rotation.y = -0.08;
      rightWing.name = 'chassis';
      phone.add(rightWing);

      // Glowing blue LED strip (PS5 signature accent)
      const ledGeo = new THREE.BoxGeometry(0.04, cDepth * 0.96, cHeight * 0.96);
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 3.5,
      });
      const ledStrip = new THREE.Mesh(ledGeo, ledMat);
      ledStrip.position.set(-cWidth * 0.16, 0.01, 0);
      phone.add(ledStrip);

      // Disc drive slot
      const discGeo = new THREE.BoxGeometry(cWidth * 0.35, 0.02, 0.08);
      const discMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3 });
      const discSlot = new THREE.Mesh(discGeo, discMat);
      discSlot.position.set(0, cDepth / 2 + 0.01, cHeight / 2 - 0.4);
      discSlot.name = 'power_button';
      phone.add(discSlot);

      // Power button / LED
      const pwrBtnGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24);
      const pwrBtnMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0 });
      const pwrBtn = new THREE.Mesh(pwrBtnGeo, pwrBtnMat);
      pwrBtn.position.set(cWidth / 2 - 0.4, cDepth / 2 + 0.02, cHeight / 2 - 0.4);
      pwrBtn.name = 'power_button';
      phone.add(pwrBtn);

      chassis = core;
    } else if (devCat === 'foldable') {
      // Foldable Phone (e.g. Galaxy Z Fold) with central mechanical hinge and dual side halves
      const hingeGeo = new THREE.CylinderGeometry(0.04, 0.04, cHeight, 16);
      const hingeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.98, roughness: 0.12 });
      const hinge = new THREE.Mesh(hingeGeo, hingeMat);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(0, 0, 0);
      hinge.name = 'chassis';
      phone.add(hinge);

      const halfGeo = new THREE.BoxGeometry(cWidth / 2 - 0.05, cDepth, cHeight);
      const halfMat = new THREE.MeshStandardMaterial({ color: phoneColorHex, metalness: 0.85, roughness: 0.2 });
      const leftHalf = new THREE.Mesh(halfGeo, halfMat);
      leftHalf.position.set(-cWidth / 4, 0, 0);
      leftHalf.name = 'chassis';
      phone.add(leftHalf);

      const rightHalf = new THREE.Mesh(halfGeo, halfMat);
      rightHalf.position.set(cWidth / 4, 0, 0);
      rightHalf.name = 'chassis';
      phone.add(rightHalf);

      chassis = leftHalf;
    } else {
      const chassisGeo = new THREE.BoxGeometry(cWidth, cDepth, cHeight);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.18,
      });
      chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      chassis.name = 'chassis';
      phone.add(chassis);

      // Beveled rim trim
      const trimGeo = new THREE.BoxGeometry(cWidth + 0.02, 0.02, cHeight + 0.02);
      const trimMat = new THREE.MeshStandardMaterial({ color: phoneColorHex, metalness: 0.9, roughness: 0.2 });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      phone.add(trim);

      // Side Power Button
      const powerBtnGeo = new THREE.BoxGeometry(0.045, 0.035, 0.38);
      const powerBtnMat = new THREE.MeshStandardMaterial({
        color: phoneState.powerButtonFixed ? 0x10b981 : 0xf59e0b,
        metalness: 0.95,
        roughness: 0.1,
      });
      const powerBtn = new THREE.Mesh(powerBtnGeo, powerBtnMat);
      powerBtn.position.set(cWidth / 2 + 0.012, 0, -0.38);
      powerBtn.name = 'power_button';
      phone.add(powerBtn);

      // Integrated power symbol ring on the power button surface
      const pwrRingGeo = new THREE.TorusGeometry(0.012, 0.003, 8, 16);
      const pwrRingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
      const pwrRing = new THREE.Mesh(pwrRingGeo, pwrRingMat);
      pwrRing.rotation.y = Math.PI / 2;
      pwrRing.position.set(cWidth / 2 + 0.035, 0, -0.38);
      phone.add(pwrRing);

      // Mechanical Volume Rocker Buttons (+/-)
      const isVolStuck = customer.issueType === 'stuck_volume_buttons' && !phoneState.volumeButtonsFixed;
      const volGroup = new THREE.Group();
      volGroup.name = 'volume_buttons';

      // Volume Up (+) Button
      const volUpGeo = new THREE.BoxGeometry(0.045, 0.035, 0.22);
      const volUpMat = new THREE.MeshStandardMaterial({
        color: isVolStuck ? 0xef4444 : phoneState.volumeButtonsFixed ? 0x10b981 : 0x0284c7,
        metalness: 0.95,
        roughness: 0.15,
      });
      const volUp = new THREE.Mesh(volUpGeo, volUpMat);
      volUp.position.set(cWidth / 2 + (isVolStuck ? 0.003 : 0.012), 0, 0.05);
      volUp.name = 'volume_up';
      volGroup.add(volUp);

      // Integrated embossed "+" symbol on Volume Up
      const plusHGeo = new THREE.BoxGeometry(0.006, 0.004, 0.07);
      const plusVGeo = new THREE.BoxGeometry(0.006, 0.018, 0.004);
      const symbolMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
      const plusH = new THREE.Mesh(plusHGeo, symbolMat);
      const plusV = new THREE.Mesh(plusVGeo, symbolMat);
      plusH.position.set(cWidth / 2 + (isVolStuck ? 0.024 : 0.033), 0, 0.05);
      plusV.position.set(cWidth / 2 + (isVolStuck ? 0.024 : 0.033), 0, 0.05);
      volGroup.add(plusH);
      volGroup.add(plusV);

      // Volume Down (-) Button
      const volDownGeo = new THREE.BoxGeometry(0.045, 0.035, 0.22);
      const volDownMat = new THREE.MeshStandardMaterial({
        color: isVolStuck ? 0xd97706 : phoneState.volumeButtonsFixed ? 0x10b981 : 0x0284c7,
        metalness: 0.95,
        roughness: 0.15,
      });
      const volDown = new THREE.Mesh(volDownGeo, volDownMat);
      volDown.position.set(cWidth / 2 + (isVolStuck ? 0.001 : 0.012), 0, 0.32);
      volDown.name = 'volume_down';
      volGroup.add(volDown);

      // Integrated embossed "-" symbol on Volume Down
      const minusGeo = new THREE.BoxGeometry(0.006, 0.004, 0.07);
      const minus = new THREE.Mesh(minusGeo, symbolMat);
      minus.position.set(cWidth / 2 + (isVolStuck ? 0.022 : 0.033), 0, 0.32);
      volGroup.add(minus);

      // Rocker bridge base bar
      const bridgeGeo = new THREE.BoxGeometry(0.03, 0.02, 0.54);
      const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      bridge.position.set(cWidth / 2 + 0.005, 0, 0.18);
      bridge.name = 'volume_buttons';
      volGroup.add(bridge);

      phone.add(volGroup);
    }

    // Bottom USB-C Port
    const usbGeo = new THREE.BoxGeometry(0.26, 0.04, 0.07);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const usbPort = new THREE.Mesh(usbGeo, usbMat);
    const usbZ = devCat === 'smartwatch' ? 0.82 : cHeight / 2;
    usbPort.position.set(0, 0, usbZ);
    usbPort.name = 'usb_port';
    phone.add(usbPort);

    // PLUGGED-IN CYBER-DONGLE USB WHEN CONNECTED!
    if (phoneState.dongleConnected) {
      const pluggedDongle = new THREE.Group();
      const pPosZ = usbZ + 0.16;

      // Dongle body sticking out of the USB port
      const pBodyGeo = new THREE.BoxGeometry(0.16, 0.045, 0.26);
      const pBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const pBody = new THREE.Mesh(pBodyGeo, pBodyMat);
      pBody.position.set(0, 0, pPosZ);
      pBody.name = 'usb_port';
      pluggedDongle.add(pBody);

      // Pulsing cyan FastBoot activity LED
      const pLedGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 16);
      const pLedMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 2.5,
      });
      const pLed = new THREE.Mesh(pLedGeo, pLedMat);
      pLed.position.set(0, 0.028, pPosZ);
      pLed.name = 'usb_port';
      pluggedDongle.add(pLed);

      // Braided cable connecting down to workbench
      const pCableGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 12);
      const pCableMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5 });
      const pCable = new THREE.Mesh(pCableGeo, pCableMat);
      pCable.rotation.x = Math.PI / 2.8;
      pCable.position.set(0, -0.12, pPosZ + 0.28);
      pCable.name = 'usb_port';
      pluggedDongle.add(pCable);

      const dLabel = createComponentLabel('💻 Cyber-Dongle Connesso (FastBoot)', 'rgba(6, 182, 212, 0.95)', '#ffffff', 0.68, 0.11);
      dLabel.position.set(0, 0.12, pPosZ);
      pluggedDongle.add(dLabel);

      phone.add(pluggedDongle);
    } else {
      const usbLabel = createComponentLabel('🔌 Porta USB-C', 'rgba(15, 23, 42, 0.88)', '#38bdf8', 0.42, 0.10);
      usbLabel.position.set(0, 0.06, usbZ + 0.03);
      phone.add(usbLabel);
    }

    // 1) Bottom Screws with Progressive Unscrew Animation (Disappear completely at 100%)
    if (!phoneState.bottomScrewsRemoved) {
      const screwSpread = devCat === 'smartwatch' ? 0.28 : devCat === 'tablet' ? 0.65 : 0.42;
      const screwZ = devCat === 'smartwatch' ? 0.82 : cHeight / 2;

      [-screwSpread, screwSpread].forEach((xPos, idx) => {
        const sName = `bottom_screw_${idx}`;
        const prog = phoneState.screwProgress?.[sName] || 0;
        if (prog < 100) {
          const sHeight = 0.04;
          const screwGeo = new THREE.CylinderGeometry(0.028, 0.028, sHeight, 16);
          const screwMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.98, roughness: 0.1 });
          const sMesh = new THREE.Mesh(screwGeo, screwMat);
          const liftZ = (prog / 100) * 0.08;
          sMesh.position.set(xPos, 0, screwZ + 0.01 + liftZ);
          sMesh.rotation.x = Math.PI / 2;
          sMesh.rotation.z = (prog / 100) * Math.PI * 8; // Spin while unscrewing
          sMesh.name = sName;
          phone.add(sMesh);

          screwTargetsRef.current.push({
            id: sName,
            pos: new THREE.Vector3(xPos, 0.08, screwZ + 0.01),
            name: idx === 0 ? 'Vite Torx Sinistra' : 'Vite Torx Destra',
          });
        }
      });
    }

    // INTERNAL MOTHERBOARD & COMPONENTS
    const pcbGroup = new THREE.Group();
    pcbGroup.position.set(0, 0.015, 0);

    const isScreenOpen = phoneState.screenRemoved || phoneState.screenPryProgress >= 100;
    // Fix: Show internal components immediately while prying (> 0) instead of waiting for 100%
    const isFrontUncovered = Boolean((phoneState.screenRemoved || (phoneState.screenPryProgress || 0) > 0) && !phoneState.motherboardExtracted);
    pcbGroup.visible = isFrontUncovered;

    // Stepped L-shaped Motherboard PCB Geometry (Point 4: Poligoni distintivi realistici)
    const mbShape = new THREE.Shape();
    const halfW = (cWidth - 0.1) / 2;
    const halfH = (cHeight - 0.16) / 2;
    mbShape.moveTo(-halfW, -halfH);
    mbShape.lineTo(halfW, -halfH);
    mbShape.lineTo(halfW, halfH - 1.1);
    mbShape.lineTo(halfW - 0.48, halfH - 1.1);
    mbShape.lineTo(halfW - 0.48, halfH);
    mbShape.lineTo(-halfW, halfH);
    mbShape.closePath();

    const pcbExtrudeSettings = {
      depth: 0.016,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.006,
      bevelThickness: 0.003,
    };
    const pcbGeo = new THREE.ExtrudeGeometry(mbShape, pcbExtrudeSettings);
    const mbTexture = createMotherboardTexture(devCat);
    const pcbMat = new THREE.MeshStandardMaterial({
      map: mbTexture,
      roughness: 0.28,
      metalness: 0.45,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.rotation.x = Math.PI / 2;
    pcbMesh.position.set(0, 0.015, 0);
    pcbMesh.name = 'motherboard';
    pcbMesh.receiveShadow = true;
    pcbGroup.add(pcbMesh);

    // Realistic Micro SMD Components (Gold contact pads, silver caps, resistors)
    for (let i = 0; i < 16; i++) {
      const smdGeo = new THREE.BoxGeometry(0.035, 0.014, 0.025);
      const smdMat = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0xfbbf24 : i % 3 === 1 ? 0x94a3b8 : 0x0f172a,
        metalness: 0.95,
        roughness: 0.15,
      });
      const smd = new THREE.Mesh(smdGeo, smdMat);
      smd.position.set(-0.32 + (i % 5) * 0.15, 0.024, -0.75 + Math.floor(i / 5) * 0.28);
      pcbGroup.add(smd);
    }

    // 1) 3D Label for Logic Board (Sprite always facing camera)
    const mbLabel = createComponentLabel(
      devCat === 'smartwatch' ? '⚡ SiP Motherboard' : '⚡ Scheda Madre PCB',
      'rgba(15, 23, 42, 0.90)',
      '#38bdf8',
      0.54,
      0.12
    );
    mbLabel.position.set(0, 0.08, -0.15);
    pcbGroup.add(mbLabel);

    // 0) REALISTIC UNDERLYING CHASSIS ARCHITECTURE (Copper Vapor Chamber & Graphite Thermal Sheet)
    if (devCat !== 'smartwatch') {
      const vcGeo = new THREE.BoxGeometry(cWidth - 0.22, 0.008, cHeight * 0.58);
      const vcTex = createVaporChamberTexture();
      const vcMat = new THREE.MeshStandardMaterial({
        map: vcTex,
        color: 0xd97706,
        metalness: 0.96,
        roughness: 0.22,
      });
      const vaporChamber = new THREE.Mesh(vcGeo, vcMat);
      vaporChamber.position.set(0, 0.004, -0.15);
      vaporChamber.name = 'chassis';
      pcbGroup.add(vaporChamber);

      // Thermal graphite heat sheet lining the battery cavity
      const graphiteGeo = new THREE.BoxGeometry(0.98, 0.004, 1.20);
      const graphiteMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.88,
        metalness: 0.15,
      });
      const graphiteSheet = new THREE.Mesh(graphiteGeo, graphiteMat);
      graphiteSheet.position.set(-0.06, 0.004, 0.35);
      pcbGroup.add(graphiteSheet);

      // High-tech lower sub-board / charging daughterboard at the bottom of the chassis
      const subBoardGeo = new THREE.BoxGeometry(cWidth - 0.22, 0.012, 0.36);
      const subBoardMat = new THREE.MeshStandardMaterial({
        map: mbTexture,
        color: 0x071526,
        roughness: 0.3,
        metalness: 0.5,
      });
      const subBoard = new THREE.Mesh(subBoardGeo, subBoardMat);
      subBoard.position.set(0, 0.012, 1.05);
      subBoard.name = 'charging_port';
      pcbGroup.add(subBoard);

      // USB-C CNC milled internal bracket with gold pins
      const usbShieldGeo = new THREE.BoxGeometry(0.24, 0.024, 0.18);
      const usbShieldMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.98, roughness: 0.15 });
      const usbShield = new THREE.Mesh(usbShieldGeo, usbShieldMat);
      usbShield.position.set(0, 0.018, 1.15);
      subBoard.add(usbShield);

      // Lower primary acoustic microphone capsule with silicone gasket
      const micGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.018, 16);
      const micMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
      const mic = new THREE.Mesh(micGeo, micMat);
      mic.position.set(-0.35, 0.018, 1.12);
      subBoard.add(mic);

      // Dual RF coaxial antenna cables along the perimeter frame rails
      [-1, 1].forEach(dir => {
        const coaxLineGeo = new THREE.CylinderGeometry(0.007, 0.007, 1.5, 8);
        const coaxLineMat = new THREE.MeshStandardMaterial({
          color: dir === 1 ? 0x0f172a : 0xe2e8f0,
          metalness: 0.6,
          roughness: 0.4,
        });
        const coaxLine = new THREE.Mesh(coaxLineGeo, coaxLineMat);
        coaxLine.position.set(dir * (halfW - 0.02), 0.016, 0.2);
        pcbGroup.add(coaxLine);

        // Gold U.FL micro snap connectors
        const uflGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.014, 12);
        const uflMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.98 });
        const ufl = new THREE.Mesh(uflGeo, uflMat);
        ufl.position.set(dir * (halfW - 0.02), 0.022, 0.95);
        pcbGroup.add(ufl);
      });

      // Polyimide amber Kapton interconnect ribbon cable connecting logic board to sub-board
      const fpcGeo = new THREE.BoxGeometry(0.11, 0.006, 1.35);
      const fpcMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.55,
        roughness: 0.3,
        transparent: true,
        opacity: 0.92,
      });
      const fpcRibbon = new THREE.Mesh(fpcGeo, fpcMat);
      fpcRibbon.position.set(0.44, 0.024, 0.35);
      fpcRibbon.name = 'motherboard';
      pcbGroup.add(fpcRibbon);

      // FPC stiffener plates at ends
      const stiffenerGeo = new THREE.BoxGeometry(0.13, 0.012, 0.06);
      const stiffenerMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.7 });
      const stiffenerTop = new THREE.Mesh(stiffenerGeo, stiffenerMat);
      stiffenerTop.position.set(0.44, 0.028, -0.32);
      pcbGroup.add(stiffenerTop);

      const stiffenerBot = new THREE.Mesh(stiffenerGeo, stiffenerMat);
      stiffenerBot.position.set(0.44, 0.028, 1.02);
      pcbGroup.add(stiffenerBot);
    }

    // Metal EMI Shielding Cans with laser perforation texture & stepped levels
    const emiTex = createEmiShieldTexture();
    const emiMat = new THREE.MeshStandardMaterial({
      map: emiTex,
      color: 0x94a3b8,
      metalness: 0.98,
      roughness: 0.16,
    });

    const emiGeo1 = new THREE.BoxGeometry(0.48, 0.028, 0.65);
    const emiShield1 = new THREE.Mesh(emiGeo1, emiMat);
    emiShield1.position.set(-0.24, 0.022, -0.45);
    emiShield1.name = 'motherboard';
    pcbGroup.add(emiShield1);

    const emiGeo2 = new THREE.BoxGeometry(0.42, 0.024, 0.45);
    const emiShield2 = new THREE.Mesh(emiGeo2, emiMat);
    emiShield2.position.set(0.24, 0.022, -0.15);
    emiShield2.name = 'motherboard';
    pcbGroup.add(emiShield2);

    // 3D Ferrite Power Inductor Cubes near PMIC
    [-0.20, -0.28].forEach((xOff, idx) => {
      const indCubeGeo = new THREE.BoxGeometry(0.06, 0.024, 0.05);
      const indCubeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
      const indCube = new THREE.Mesh(indCubeGeo, indCubeMat);
      indCube.position.set(xOff, 0.024, -0.25 + idx * 0.08);
      pcbGroup.add(indCube);
    });

    // 3D Golden Crystal Oscillator Can
    const crystalGeo = new THREE.BoxGeometry(0.045, 0.018, 0.035);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.98, roughness: 0.12 });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0.18, 0.024, -0.65);
    pcbGroup.add(crystal);

    // Gold circuit traces
    const traceGeo = new THREE.BoxGeometry(0.9, 0.002, 1.2);
    const traceMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.98, roughness: 0.1 });
    const traceMesh = new THREE.Mesh(traceGeo, traceMat);
    traceMesh.position.set(0, 0.01, -0.4);
    pcbGroup.add(traceMesh);

    // 1) ULTRA-REALISTIC 3D MOTHERBOARD SCREWS (WITH BEVELED HEAD & CROSS DRIVE RECESS)
    if (phoneState.screenRemoved && !phoneState.motherboardScrewsRemoved && !phoneState.motherboardExtracted) {
      [-0.38, 0.38].forEach((xPos, idx) => {
        const sName = `motherboard_screw_${idx}`;
        const prog = phoneState.screwProgress?.[sName] || 0;
        if (prog < 100) {
          const mbScrewGroup = new THREE.Group();
          mbScrewGroup.name = sName;
          mbScrewGroup.position.set(xPos, 0.02 + (prog / 100) * 0.05, -0.15);
          mbScrewGroup.rotation.y = (prog / 100) * Math.PI * 8;

          // Beveled metallic screw head
          const screwHeadGeo = new THREE.CylinderGeometry(0.028, 0.024, 0.012, 16);
          const screwHeadMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.98, roughness: 0.12 });
          const screwHead = new THREE.Mesh(screwHeadGeo, screwHeadMat);
          screwHead.name = sName;
          mbScrewGroup.add(screwHead);

          // Dark gunmetal Phillips cross drive recess on head
          const recessMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
          const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.003, 0.006), recessMat);
          crossH.position.y = 0.006;
          crossH.name = sName;
          mbScrewGroup.add(crossH);
          const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.003, 0.026), recessMat);
          crossV.position.y = 0.006;
          crossV.name = sName;
          mbScrewGroup.add(crossV);

          // Threaded screw shaft
          const shaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.025, 12);
          const shaftMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 });
          const shaft = new THREE.Mesh(shaftGeo, shaftMat);
          shaft.position.y = -0.014;
          shaft.name = sName;
          mbScrewGroup.add(shaft);

          pcbGroup.add(mbScrewGroup);

          screwTargetsRef.current.push({
            id: sName,
            pos: new THREE.Vector3(xPos, 0.06, -0.15),
            name: idx === 0 ? 'Vite Scheda Madre 1' : 'Vite Scheda Madre 2',
          });
        }
      });
    }

    // 7) VISIBLE OXIDATION & CORROSION PATCHES WITH VIVID HIGHLIGHT & TARGET BEACONS
    if (customer.issueType === 'water_damage' || customer.issueType === 'combo_water_camera') {
      phoneState.oxidationSpots?.forEach((spot, idx) => {
        const posX = (spot.x / 100 - 0.5) * 1.1;
        const posZ = (spot.y / 100 - 0.5) * 2.1;

        if (!spot.cleaned) {
          // Crusty lime/cyan calcified corrosion patch
          const oxGeo = new THREE.CylinderGeometry(spot.size * 0.014, spot.size * 0.016, 0.012, 16);
          const oxMat = new THREE.MeshStandardMaterial({
            color: 0x4ade80, // High-visibility lime/green corrosion
            roughness: 0.95,
            metalness: 0.05,
          });
          const oxMesh = new THREE.Mesh(oxGeo, oxMat);
          oxMesh.position.set(posX, 0.02, posZ);
          oxMesh.name = `oxidation_spot_${spot.id}`;
          pcbGroup.add(oxMesh);

          // Pulsing holographic target ring around uncleaned spot!
          const beaconGeo = new THREE.RingGeometry(spot.size * 0.016, spot.size * 0.024, 24);
          const beaconMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
          });
          const beaconRing = new THREE.Mesh(beaconGeo, beaconMat);
          beaconRing.rotation.x = -Math.PI / 2;
          beaconRing.position.set(posX, 0.025, posZ);
          beaconRing.name = `oxidation_spot_${spot.id}`;
          pcbGroup.add(beaconRing);
        } else {
          // Sparkling restored gold contact pad once cleaned!
          const cleanGeo = new THREE.CylinderGeometry(spot.size * 0.014, spot.size * 0.014, 0.005, 16);
          const cleanMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            metalness: 0.98,
            roughness: 0.1,
          });
          const cleanMesh = new THREE.Mesh(cleanGeo, cleanMat);
          cleanMesh.position.set(posX, 0.018, posZ);
          pcbGroup.add(cleanMesh);
        }
      });
    }

    // CPU Chip & Thermal Dissipation Die
    const cpuGroup = new THREE.Group();
    cpuGroup.position.set(0.24, 0.025, -0.55);

    const cpuGeo = new THREE.BoxGeometry(0.38, 0.035, 0.38);
    const cpuMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const cpu = new THREE.Mesh(cpuGeo, cpuMat);
    cpu.name = 'cpu_chip';
    cpuGroup.add(cpu);

    // Shiny silicon die top
    const dieGeo = new THREE.BoxGeometry(0.28, 0.008, 0.28);
    const dieMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.98, roughness: 0.1 });
    const die = new THREE.Mesh(dieGeo, dieMat);
    die.position.y = 0.02;
    die.name = 'cpu_chip';
    cpuGroup.add(die);

    if (customer.issueType === 'overheating_cpu') {
      if (!phoneState.oldPasteScraped) {
        // Crusty old dry paste
        const oldPasteGeo = new THREE.BoxGeometry(0.22, 0.016, 0.22);
        const oldPasteMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
        const oldPaste = new THREE.Mesh(oldPasteGeo, oldPasteMat);
        oldPaste.position.y = 0.028;
        oldPaste.name = 'cpu_chip';
        cpuGroup.add(oldPaste);

        const oldPasteLabel = createComponentLabel('⚠️ Pasta Secca (Raschia col Plettro)', 'rgba(120, 113, 108, 0.95)', '#fef08a', 0.65, 0.11);
        oldPasteLabel.position.set(0, 0.10, 0);
        cpuGroup.add(oldPasteLabel);
      } else if (!phoneState.newPasteApplied) {
        // Clean die waiting for new paste: Glowing target beacon!
        const targetRingGeo = new THREE.RingGeometry(0.08, 0.14, 32);
        const targetRingMat = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
        targetRing.rotation.x = -Math.PI / 2;
        targetRing.position.y = 0.026;
        targetRing.name = 'cpu_chip';
        cpuGroup.add(targetRing);

        const targetLabel = createComponentLabel('🎯 APPLICA QUI LA PASTA TERMICA', 'rgba(6, 182, 212, 0.96)', '#ffffff', 0.62, 0.11);
        targetLabel.position.set(0, 0.12, 0);
        cpuGroup.add(targetLabel);
      } else {
        // Fresh glossy silver diamond paste applied!
        const newPasteGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.022, 24);
        const newPasteMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.85,
          roughness: 0.12,
        });
        const newPaste = new THREE.Mesh(newPasteGeo, newPasteMat);
        newPaste.position.y = 0.028;
        newPaste.name = 'cpu_chip';
        cpuGroup.add(newPaste);

        const pasteOkLabel = createComponentLabel('✨ Nuova Pasta Termica Applicata', 'rgba(16, 185, 129, 0.92)', '#ffffff', 0.58, 0.11);
        pasteOkLabel.position.set(0, 0.10, 0);
        cpuGroup.add(pasteOkLabel);
      }
    } else {
      const cpuLabel = createComponentLabel('⚡ Processore CPU', 'rgba(15, 23, 42, 0.88)', '#38bdf8', 0.42, 0.10);
      cpuLabel.position.set(0, 0.08, 0);
      cpuGroup.add(cpuLabel);
    }

    pcbGroup.add(cpuGroup);

    // Wi-Fi 7 / 5G MIMO RF ANTENNA & COAXIAL MODULE (Point 2: Modulo Wi-Fi visibile con beacon e connettore)
    const wifiGroup = new THREE.Group();
    wifiGroup.position.set(0.40, 0.022, -0.75);

    const wifiChipGeo = new THREE.BoxGeometry(0.18, 0.025, 0.22);
    const wifiChipMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const wifiChip = new THREE.Mesh(wifiChipGeo, wifiChipMat);
    wifiChip.name = 'wifi_antenna';
    wifiGroup.add(wifiChip);

    const coaxGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 12);
    const coaxMat = new THREE.MeshStandardMaterial({
      color: phoneState.wifiAntennaConnected ? 0x0f172a : 0xef4444,
      metalness: 0.8,
      roughness: 0.3,
    });
    const coaxCable = new THREE.Mesh(coaxGeo, coaxMat);
    coaxCable.position.set(0.06, 0.01, 0.20);
    coaxCable.name = 'wifi_antenna';
    wifiGroup.add(coaxCable);

    const uflGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.025, 16);
    const uflMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.98,
      roughness: 0.1,
    });
    const uflConn = new THREE.Mesh(uflGeo, uflMat);
    uflConn.position.set(0, phoneState.wifiAntennaConnected ? 0.018 : 0.045, 0);
    uflConn.name = 'wifi_antenna';
    wifiGroup.add(uflConn);

    const wifiLabel = createComponentLabel(
      '📡 Wi-Fi 7 / 5G',
      'rgba(15, 23, 42, 0.90)',
      phoneState.wifiAntennaConnected ? '#38bdf8' : '#f59e0b',
      0.44,
      0.10
    );
    wifiLabel.position.set(0, 0.08, 0);
    wifiGroup.add(wifiLabel);

    if (!phoneState.wifiAntennaConnected || customer.issueType === 'wifi_antenna_cut') {
      const wifiBeaconGeo = new THREE.RingGeometry(0.06, 0.11, 24);
      const wifiBeaconMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
      });
      const wifiBeacon = new THREE.Mesh(wifiBeaconGeo, wifiBeaconMat);
      wifiBeacon.rotation.x = -Math.PI / 2;
      wifiBeacon.position.set(0, 0.05, 0);
      wifiBeacon.name = 'wifi_antenna';
      wifiGroup.add(wifiBeacon);
    }

    pcbGroup.add(wifiGroup);

    // Battery pack (Point 4: Poligono realistico con linguette di estrazione)
    if (!phoneState.oldBatteryRemoved || phoneState.newBatteryInstalled) {
      const battGeo = new THREE.BoxGeometry(
        0.94,
        customer.issueType === 'dead_battery' && !phoneState.newBatteryInstalled ? 0.065 : 0.038,
        1.14
      );
      const battTexture = createBatteryTexture();
      const battMat = new THREE.MeshStandardMaterial({
        map: battTexture,
        roughness: 0.35,
        metalness: 0.25,
      });
      const battery = new THREE.Mesh(battGeo, battMat);
      battery.position.set(-0.06, 0.025, 0.35);
      battery.name = 'battery';

      // Pull tabs for realistic battery with text marking
      const tabGeo = new THREE.BoxGeometry(0.24, 0.008, 0.08);
      const tabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const pullTab1 = new THREE.Mesh(tabGeo, tabMat);
      pullTab1.position.set(-0.25, 0.025, -0.45);
      battery.add(pullTab1);

      const pullTab2 = new THREE.Mesh(tabGeo, tabMat);
      pullTab2.position.set(0.18, 0.025, -0.45);
      battery.add(pullTab2);

      const connGeo = new THREE.BoxGeometry(0.15, 0.035, 0.08);
      const connMat = new THREE.MeshStandardMaterial({
        color: phoneState.batteryDisconnected ? 0xf59e0b : 0x0284c7,
      });
      const connector = new THREE.Mesh(connGeo, connMat);
      connector.position.set(-0.25, 0.04, -0.28);
      connector.name = 'battery_connector';
      pcbGroup.add(connector);

      const battLabel = createComponentLabel(
        devCat === 'smartwatch' ? '🔋 Batteria Li-Po' : '🔋 Batteria Li-Ion OEM',
        'rgba(15, 23, 42, 0.90)',
        '#10b981',
        0.52,
        0.11
      );
      battLabel.position.set(-0.06, 0.09, 0.35);
      pcbGroup.add(battLabel);

      pcbGroup.add(battery);
    }

    // Taptic Engine (Linear vibration actuator) - Ultra-realistic brushed titanium casing with coil core
    const tapticGeo = new THREE.BoxGeometry(0.44, 0.032, 0.22);
    const tapticMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.94, roughness: 0.18 });
    const taptic = new THREE.Mesh(tapticGeo, tapticMat);
    taptic.position.set(-0.35, 0.025, 0.95);
    taptic.name = 'taptic_engine';

    // Linear actuator magnetic core detail
    const tapCoreGeo = new THREE.BoxGeometry(0.24, 0.005, 0.12);
    const tapCoreMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
    const tapCore = new THREE.Mesh(tapCoreGeo, tapCoreMat);
    tapCore.position.y = 0.018;
    taptic.add(tapCore);

    // Vibration-isolation rubber mounting brackets
    const grommetMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
    [-0.18, 0.18].forEach(gx => {
      const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 12), grommetMat);
      gr.position.set(gx, 0.018, 0);
      taptic.add(gr);
    });
    pcbGroup.add(taptic);

    // Speaker unit
    if (!phoneState.oldSpeakerRemoved || phoneState.newSpeakerInstalled) {
      const spkGeo = new THREE.BoxGeometry(0.88, 0.04, 0.34);
      const spkMat = new THREE.MeshStandardMaterial({
        color: phoneState.newSpeakerInstalled ? 0x0284c7 : 0x334155,
        metalness: 0.75,
        roughness: 0.3,
      });
      const speakerBox = new THREE.Mesh(spkGeo, spkMat);
      speakerBox.position.set(0.12, 0.025, 1.0);
      speakerBox.name = 'speaker_unit';

      const spkLabel = createComponentLabel('🔊 Altoparlante HD', 'rgba(15, 23, 42, 0.90)', '#f59e0b', 0.44, 0.10);
      spkLabel.position.set(0.12, 0.08, 1.0);
      pcbGroup.add(spkLabel);

      // 2) SPEAKER SCREW WITH REALISTIC 3D BEVELED HEAD & CROSS DRIVE RECESS
      if (phoneState.screenRemoved && !phoneState.speakerUnscrewed) {
        const prog = phoneState.screwProgress?.['speaker_screw'] || 0;
        if (prog < 100) {
          const spkScrewGroup = new THREE.Group();
          spkScrewGroup.name = 'speaker_screw';
          spkScrewGroup.position.set(0.35, 0.025 + (prog / 100) * 0.04, 0);
          spkScrewGroup.rotation.y = (prog / 100) * Math.PI * 8;

          const sHead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.026, 0.022, 0.012, 16),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.98, roughness: 0.12 })
          );
          sHead.name = 'speaker_screw';
          spkScrewGroup.add(sHead);

          const recessMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
          const cH = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.003, 0.005), recessMat);
          cH.position.y = 0.006;
          cH.name = 'speaker_screw';
          spkScrewGroup.add(cH);
          const cV = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.003, 0.024), recessMat);
          cV.position.y = 0.006;
          cV.name = 'speaker_screw';
          spkScrewGroup.add(cV);

          const sShaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.022, 12),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 })
          );
          sShaft.position.y = -0.012;
          sShaft.name = 'speaker_screw';
          spkScrewGroup.add(sShaft);

          speakerBox.add(spkScrewGroup);

          screwTargetsRef.current.push({
            id: 'speaker_screw',
            pos: new THREE.Vector3(0.35, 0.12, 1.0),
            name: 'Vite Altoparlante',
          });
        }
      }
      pcbGroup.add(speakerBox);
    }

    // 6) Water droplets that shrink smoothly as they evaporate!
    if (customer.issueType === 'water_damage' || customer.issueType === 'combo_water_camera') {
      phoneState.waterDroplets.forEach(drop => {
        if (!drop.isCleaned && drop.size > 0.5) {
          const dropGeo = new THREE.SphereGeometry(drop.size * 0.0035, 16, 16);
          const dropMat = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            transmission: 0.95,
            opacity: 1,
            transparent: true,
            roughness: 0.02,
            ior: 1.33,
            clearcoat: 1.0,
          });
          const dropMesh = new THREE.Mesh(dropGeo, dropMat);
          dropMesh.position.set(
            (drop.x / 100 - 0.5) * 1.15,
            0.038,
            (drop.y / 100 - 0.5) * 2.15
          );
          dropMesh.name = `water_drop_${drop.id}`;
          pcbGroup.add(dropMesh);
        }
      });
    }

    phone.add(pcbGroup);

    // SCREEN ASSEMBLY WITH PROGRESSIVE LIFT ANGLE
    const screenGroup = new THREE.Group();
    const pivotZ = devCat === 'smartwatch' ? -0.80 : -cHeight / 2 + 0.03;
    screenGroup.position.set(0, 0.045, pivotZ);

    const screenTexture = devCat === 'smartwatch'
      ? createSmartwatchScreenTexture(
          phoneState.isPoweredOn,
          customer.issueType,
          phoneState.newScreenInstalled,
          phoneState.thermalDamageOccurred,
          phoneState.firmwareRestored
        )
      : createPhoneScreenTexture(
          phoneState.isPoweredOn,
          customer.issueType,
          phoneState.firmwareRestored,
          phoneState.newScreenInstalled,
          phoneState.thermalDamageOccurred
        );

    if (devCat === 'smartwatch') {
      const watchScrBezelGeo = new THREE.CylinderGeometry(0.81, 0.81, 0.022, 48);
      const watchScrBezelMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.95, roughness: 0.15 });
      const watchScrBezel = new THREE.Mesh(watchScrBezelGeo, watchScrBezelMat);
      watchScrBezel.position.set(0, 0.011, -pivotZ);
      watchScrBezel.name = 'screen_glass';
      screenGroup.add(watchScrBezel);

      const watchScrGeo = new THREE.CircleGeometry(0.78, 48);
      const watchScrMat = new THREE.MeshBasicMaterial({
        map: screenTexture,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const watchScr = new THREE.Mesh(watchScrGeo, watchScrMat);
      watchScr.rotation.x = -Math.PI / 2;
      watchScr.position.set(0, 0.024, -pivotZ);
      watchScr.name = 'screen_glass';
      screenGroup.add(watchScr);

      // Curved glass rim reflection ring
      const rimGeo = new THREE.TorusGeometry(0.78, 0.018, 16, 48);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.95,
        roughness: 0.1,
        transparent: true,
        opacity: 0.45,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 0.024, -pivotZ);
      screenGroup.add(rim);
    } else {
      const scrBezelGeo = new THREE.BoxGeometry(cWidth - 0.02, 0.018, cHeight - 0.04);
      const scrBezelMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.2 });
      const scrBezel = new THREE.Mesh(scrBezelGeo, scrBezelMat);
      scrBezel.position.set(0, 0, -pivotZ);
      scrBezel.castShadow = true;
      scrBezel.name = 'screen_glass';
      screenGroup.add(scrBezel);

      const scrPlaneGeo = new THREE.PlaneGeometry(cWidth - 0.06, cHeight - 0.08);
      const scrPlaneMat = new THREE.MeshBasicMaterial({ map: screenTexture });
      const scrPlane = new THREE.Mesh(scrPlaneGeo, scrPlaneMat);
      scrPlane.rotation.x = -Math.PI / 2;
      scrPlane.position.set(0, 0.01, -pivotZ);
      scrPlane.name = 'screen_glass';
      screenGroup.add(scrPlane);

      // Realistic Underside of OLED Display Assembly (Thermal graphite sheet, copper grounding foil, DDIC chip & flex cable)
      const scrBackGeo = new THREE.PlaneGeometry(cWidth - 0.08, cHeight - 0.12);
      const scrBackMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.85,
        metalness: 0.25,
      });
      const scrBack = new THREE.Mesh(scrBackGeo, scrBackMat);
      scrBack.rotation.x = Math.PI / 2;
      scrBack.position.set(0, -0.01, -pivotZ);
      screenGroup.add(scrBack);

      // Copper grounding foil strip across display back
      const scrCopperGeo = new THREE.PlaneGeometry(cWidth * 0.42, 0.22);
      const scrCopperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 });
      const scrCopper = new THREE.Mesh(scrCopperGeo, scrCopperMat);
      scrCopper.rotation.x = Math.PI / 2;
      scrCopper.position.set(0, -0.011, -pivotZ + 0.35);
      screenGroup.add(scrCopper);

      // Display Driver IC (DDIC) chip on flex tail
      const ddicGeo = new THREE.BoxGeometry(0.24, 0.01, 0.08);
      const ddicMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.25 });
      const ddic = new THREE.Mesh(ddicGeo, ddicMat);
      ddic.position.set(0, -0.014, -pivotZ - 0.38);
      screenGroup.add(ddic);

      // Display FPC flexible amber ribbon cable connecting down
      const dispFpcGeo = new THREE.BoxGeometry(0.18, 0.005, 0.52);
      const dispFpcMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.35,
        metalness: 0.6,
        transparent: true,
        opacity: 0.95,
      });
      const dispFpc = new THREE.Mesh(dispFpcGeo, dispFpcMat);
      dispFpc.position.set(0, -0.012, -pivotZ - 0.62);
      screenGroup.add(dispFpc);
    }

    // 5) SUCTION CUP ATTACHED ON GLASS ONLY WHEN PLACED
    if (phoneState.suctionApplied) {
      const cupGeo = new THREE.CylinderGeometry(0.26, 0.32, 0.06, 32);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(0, 0.045, -pivotZ);
      cup.castShadow = true;
      screenGroup.add(cup);

      const ringGeo = new THREE.TorusGeometry(0.14, 0.025, 16, 32);
      const ring = new THREE.Mesh(ringGeo, cupMat);
      ring.position.set(0, 0.18, -pivotZ);
      ring.rotation.x = Math.PI / 2;
      screenGroup.add(ring);
    }

    // 6) Progressive screen opening via pry pick!
    if (phoneState.screenRemoved) {
      screenGroup.rotation.x = -Math.PI / 2.7;
    } else if (phoneState.screenPryProgress > 0) {
      screenGroup.rotation.x = -(phoneState.screenPryProgress / 100) * (Math.PI / 2.7);
    }

    phone.add(screenGroup);

    // REAR COVER & REAR INTERNALS
    const backGroup = new THREE.Group();
    backGroup.position.set(0, -0.045, 0);

    const isBackCracked = customer.issueType === 'cracked_back_glass' && !phoneState.backGlassReplaced;
    const backTex = createBackCoverTexture(customer.phoneColor, isBackCracked, customer.phoneModelName);
    
    if (devCat === 'smartwatch') {
      // Circular ceramic sensor back case for smartwatch
      const backGeo = new THREE.CylinderGeometry(0.80, 0.80, 0.018, 48);
      const backMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 1.0,
      });
      const backCover = new THREE.Mesh(backGeo, backMat);
      backCover.name = 'back_cover';
      backCover.castShadow = true;
      backGroup.add(backCover);

      // Biometric Optical Heart Rate Ring in center
      const sensorRingGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.022, 32);
      const sensorRingMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.6,
      });
      const sensorRing = new THREE.Mesh(sensorRingGeo, sensorRingMat);
      sensorRing.position.set(0, -0.005, 0);
      sensorRing.name = 'back_cover';
      backGroup.add(sensorRing);
    } else {
      const backGeo = new THREE.BoxGeometry(cWidth - 0.02, 0.018, cHeight - 0.04);
      const backMat = new THREE.MeshPhysicalMaterial({
        map: backTex,
        roughness: 0.22,
        metalness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
      });
      const backCover = new THREE.Mesh(backGeo, backMat);
      backCover.name = 'back_cover';
      backCover.castShadow = true;
      backGroup.add(backCover);

      // Camera island on back cover
      const islandGeo = new THREE.BoxGeometry(0.55, 0.035, 0.55);
      const islandMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
      const island = new THREE.Mesh(islandGeo, islandMat);
      island.position.set(-0.32, -0.02, -0.85);
      island.name = 'camera_island';
      backGroup.add(island);

      // Camera lenses on back cover
      [
        { x: -0.42, z: -0.96 },
        { x: -0.42, z: -0.74 },
        { x: -0.22, z: -0.85 },
      ].forEach((lPos, idx) => {
        const lensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.025, 24);
        const lensMat = new THREE.MeshStandardMaterial({
          color: phoneState.newCameraInstalled ? 0x0284c7 : 0x1e293b,
          metalness: 0.95,
          roughness: 0.1,
        });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(lPos.x, -0.04, lPos.z);
        lens.rotation.x = Math.PI;
        lens.name = `camera_lens_${idx}`;
        backGroup.add(lens);
      });
    }

    // 3) VISUAL REAR COVER OPENING (Physical 3D hinge lift & removal)
    if (phoneState.backCoverRemoved) {
      backGroup.visible = false;
    } else if ((phoneState.backCoverPryProgress || 0) > 0) {
      backGroup.rotation.x = ((phoneState.backCoverPryProgress || 0) / 100) * (Math.PI / 2.4);
      backGroup.position.z = -((phoneState.backCoverPryProgress || 0) / 100) * 0.15;
    }

    phone.add(backGroup);

    // REAR INTERNALS (Revealed ONLY when back cover is pried or removed!)
    const rearInternals = new THREE.Group();
    rearInternals.position.set(0, -0.035, 0);
    // Fix: Show rear components immediately while prying (> 0) instead of waiting for 100%
    const isBackUncovered = Boolean(phoneState.backCoverRemoved || (phoneState.backCoverPryProgress || 0) > 0);
    rearInternals.visible = isBackUncovered;

    // Midframe chassis
    const midframeGeo = new THREE.BoxGeometry(1.24, 0.012, 2.42);
    const midframeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.5 });
    const midframe = new THREE.Mesh(midframeGeo, midframeMat);
    midframe.name = 'rear_midframe';
    rearInternals.add(midframe);

    // Wireless Charging Coil (Qi) in center
    if (!phoneState.wirelessCoilRemoved || phoneState.wirelessCoilReplaced) {
      const qiRingGeo = new THREE.RingGeometry(0.18, 0.35, 32);
      const qiMat = new THREE.MeshStandardMaterial({
        color: phoneState.wirelessCoilReplaced ? 0xf59e0b : customer.issueType === 'wireless_charging_burnt' ? 0x451a03 : 0xd97706,
        metalness: 0.8,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const qiCoil = new THREE.Mesh(qiRingGeo, qiMat);
      qiCoil.rotation.x = Math.PI / 2;
      qiCoil.position.set(0, -0.008, 0);
      qiCoil.name = 'wireless_coil';
      rearInternals.add(qiCoil);

      const qiLabel = createComponentLabel(
        phoneState.wirelessCoilReplaced ? '✨ Nuova Bobina Qi OEM' : customer.issueType === 'wireless_charging_burnt' ? '🔥 Bobina Qi Bruciata' : '🧲 Bobina Qi Wireless',
        'rgba(15, 23, 42, 0.88)',
        phoneState.wirelessCoilReplaced ? '#10b981' : customer.issueType === 'wireless_charging_burnt' ? '#ef4444' : '#f59e0b',
        0.52,
        0.11
      );
      qiLabel.rotation.x = Math.PI / 2;
      qiLabel.position.set(0, -0.02, 0);
      rearInternals.add(qiLabel);
    } else {
      // Empty coil bed/socket ready for replacement
      const qiEmptyGeo = new THREE.RingGeometry(0.18, 0.35, 32);
      const qiEmptyMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.4,
        roughness: 0.8,
        side: THREE.DoubleSide,
      });
      const qiEmpty = new THREE.Mesh(qiEmptyGeo, qiEmptyMat);
      qiEmpty.rotation.x = Math.PI / 2;
      qiEmpty.position.set(0, -0.008, 0);
      qiEmpty.name = 'wireless_coil';
      rearInternals.add(qiEmpty);

      const emptyLabel = createComponentLabel('Alloggiamento Bobina Vuoto', 'rgba(15, 23, 42, 0.88)', '#38bdf8', 0.54, 0.11);
      emptyLabel.rotation.x = Math.PI / 2;
      emptyLabel.position.set(0, -0.02, 0);
      rearInternals.add(emptyLabel);
    }

    // REAR CAMERA MODULE INTERNAL HOUSING & FLEX CONNECTOR (Only for Smartphones, Tablets, Laptops - NOT Smartwatches!)
    if (devCat !== 'smartwatch') {
      const rearCamGroup = new THREE.Group();
      rearCamGroup.position.set(-0.32, -0.01, -0.85);

      if (!phoneState.oldCameraRemoved || phoneState.newCameraInstalled) {
        const camBoxGeo = new THREE.BoxGeometry(0.52, 0.03, 0.52);
        const camBoxMat = new THREE.MeshStandardMaterial({
          color: phoneState.newCameraInstalled ? 0x0284c7 : 0x0f172a,
          metalness: 0.9,
          roughness: 0.15,
        });
        const camBox = new THREE.Mesh(camBoxGeo, camBoxMat);
        camBox.name = 'camera_island';
        rearCamGroup.add(camBox);

        const camLabel = createComponentLabel('📷 Tripla Fotocamera 4K', 'rgba(15, 23, 42, 0.70)', '#38bdf8', 0.44, 0.09);
        camLabel.rotation.x = Math.PI / 2;
        camLabel.position.set(0, -0.035, 0);
        rearCamGroup.add(camLabel);

        // 3 Realistic optical camera sensors with glass lenses and copper OIS voice-coils
        [
          { x: -0.1, z: -0.11, isMain: true },
          { x: -0.1, z: 0.11, isMain: false },
          { x: 0.1, z: 0, isMain: false },
        ].forEach((lPos, idx) => {
          // Metal lens barrel housing
          const barrelGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.024, 24);
          const barrelMat = new THREE.MeshStandardMaterial({
            color: phoneState.newCameraInstalled ? 0x0284c7 : 0x1e293b,
            metalness: 0.95,
            roughness: 0.12,
          });
          const barrel = new THREE.Mesh(barrelGeo, barrelMat);
          barrel.position.set(lPos.x, -0.02, lPos.z);
          barrel.rotation.x = Math.PI;
          barrel.name = `camera_lens_${idx}`;
          rearCamGroup.add(barrel);

          // Optical glass front element with anti-reflective AR coating (purplish-emerald sheen)
          const glassGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.006, 24);
          const glassMat = new THREE.MeshPhysicalMaterial({
            color: idx === 0 ? 0x1e1b4b : 0x022c22,
            metalness: 0.2,
            roughness: 0.02,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            transparent: true,
            opacity: 0.85,
          });
          const glass = new THREE.Mesh(glassGeo, glassMat);
          glass.position.set(lPos.x, -0.033, lPos.z);
          glass.rotation.x = Math.PI;
          rearCamGroup.add(glass);

          // If main sensor: add copper OIS (Optical Image Stabilization) voice coil ring!
          if (lPos.isMain) {
            const oisRingGeo = new THREE.TorusGeometry(0.075, 0.006, 8, 24);
            const oisRingMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 });
            const oisRing = new THREE.Mesh(oisRingGeo, oisRingMat);
            oisRing.position.set(lPos.x, -0.015, lPos.z);
            oisRing.rotation.x = Math.PI / 2;
            rearCamGroup.add(oisRing);
          }
        });

        // LiDAR Scanner Sensor
        const lidarGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.015, 16);
        const lidarMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.3 });
        const lidar = new THREE.Mesh(lidarGeo, lidarMat);
        lidar.position.set(0.12, -0.022, 0.14);
        lidar.rotation.x = Math.PI;
        rearCamGroup.add(lidar);

        // TrueTone Dual-LED Flash (Amber and Cool White LEDs)
        const flashBaseGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.015, 16);
        const flashBaseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });
        const flashBase = new THREE.Mesh(flashBaseGeo, flashBaseMat);
        flashBase.position.set(0.12, -0.022, -0.14);
        flashBase.rotation.x = Math.PI;
        rearCamGroup.add(flashBase);

        const ledAmber = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.014, 0.008, 12),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.4 })
        );
        ledAmber.position.set(0.12, -0.03, -0.125);
        ledAmber.rotation.x = Math.PI;
        rearCamGroup.add(ledAmber);

        const ledWhite = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.014, 0.008, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0xf8fafc, emissiveIntensity: 0.4 })
        );
        ledWhite.position.set(0.12, -0.03, -0.155);
        ledWhite.rotation.x = Math.PI;
        rearCamGroup.add(ledWhite);

        // Camera ribbon flex cable leading to logic board
        const flexGeo = new THREE.BoxGeometry(0.14, 0.008, 0.22);
        const flexMat = new THREE.MeshStandardMaterial({
          color: phoneState.cameraDisconnected ? 0xef4444 : 0xf59e0b,
          metalness: 0.7,
          roughness: 0.2,
        });
        const flexCable = new THREE.Mesh(flexGeo, flexMat);
        flexCable.position.set(0.28, -0.012, 0);
        flexCable.name = 'camera_flex';
        rearCamGroup.add(flexCable);

        // Camera flex connector clip (highlighted when tweezers active!)
        const clipGeo = new THREE.BoxGeometry(0.09, 0.025, 0.1);
        const clipMat = new THREE.MeshStandardMaterial({
          color: selectedTool === 'tweezers' && !phoneState.cameraDisconnected ? 0x38bdf8 : 0x475569,
          emissive: selectedTool === 'tweezers' && !phoneState.cameraDisconnected ? 0x0284c7 : 0x000000,
          emissiveIntensity: 0.8,
          metalness: 0.8,
        });
        const clip = new THREE.Mesh(clipGeo, clipMat);
        clip.position.set(0.36, phoneState.cameraDisconnected ? -0.03 : -0.012, 0);
        clip.name = 'camera_connector';
        rearCamGroup.add(clip);
      } else {
        // EMPTY CAMERA RECESSED SOCKET HOUSING
        const socketGeo = new THREE.BoxGeometry(0.52, 0.025, 0.52);
        const socketMat = new THREE.MeshStandardMaterial({
          color: 0x020617,
          wireframe: selectedTool === 'part_camera',
          emissive: selectedTool === 'part_camera' ? 0x10b981 : 0x000000,
          emissiveIntensity: 0.6,
        });
        const socketMesh = new THREE.Mesh(socketGeo, socketMat);
        socketMesh.name = 'camera_socket';
        rearCamGroup.add(socketMesh);
      }

      rearInternals.add(rearCamGroup);
    } else {
      // SMARTWATCH BIOMETRIC OPTICAL SENSOR INTERNAL MODULE
      const bioSensorGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.018, 32);
      const bioSensorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x10b981,
        emissiveIntensity: 0.35,
        metalness: 0.8,
      });
      const bioSensor = new THREE.Mesh(bioSensorGeo, bioSensorMat);
      bioSensor.rotation.x = Math.PI / 2;
      bioSensor.position.set(0, -0.015, 0);
      bioSensor.name = 'back_cover';
      rearInternals.add(bioSensor);

      const sensorLabel = createComponentLabel('❤️ Sensori Cardio SiP', 'rgba(15, 23, 42, 0.70)', '#10b981', 0.42, 0.09);
      sensorLabel.rotation.x = Math.PI / 2;
      sensorLabel.position.set(0, -0.035, 0);
      rearInternals.add(sensorLabel);
    }
    phone.add(rearInternals);

    // 3D ACTIVE TOOL THAT FOLLOWS MOUSE
    const toolGroup = new THREE.Group();
    activeToolMeshRef.current = toolGroup;
    scene.add(toolGroup);

    if (selectedTool === 'heatgun') {
      const gunBody = new THREE.Group();

      // Ergonomic pistol grip handle (angled naturally, textured dark grip)
      const handleGroup = new THREE.Group();
      const handleGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.44, 16);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handleGroup.add(handle);

      // Rubber comfort grip pads
      const gripGeo = new THREE.BoxGeometry(0.11, 0.32, 0.09);
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
      const grip = new THREE.Mesh(gripGeo, gripMat);
      handleGroup.add(grip);

      // Power cord strain relief boot at base of handle
      const bootGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.12, 12);
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.y = -0.26;
      handleGroup.add(boot);

      // Red rocker trigger switch
      const trigGeo = new THREE.BoxGeometry(0.04, 0.08, 0.04);
      const trigMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const trigger = new THREE.Mesh(trigGeo, trigMat);
      trigger.position.set(0, 0.08, 0.07);
      handleGroup.add(trigger);

      handleGroup.rotation.x = Math.PI / 10;
      handleGroup.position.set(0, -0.22, -0.06);
      gunBody.add(handleGroup);

      // Main turbine / motor housing body
      const bodyGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.42, 24);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      gunBody.add(body);

      // Rear air intake turbine grill
      const rearCapGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.06, 24);
      const rearCapMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      const rearCap = new THREE.Mesh(rearCapGeo, rearCapMat);
      rearCap.rotation.x = Math.PI / 2;
      rearCap.position.set(0, 0, -0.23);
      gunBody.add(rearCap);

      // Digital temperature LCD screen on top of casing
      const lcdGeo = new THREE.BoxGeometry(0.12, 0.02, 0.14);
      const lcdMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.7,
        roughness: 0.1,
      });
      const lcd = new THREE.Mesh(lcdGeo, lcdMat);
      lcd.position.set(0, 0.12, -0.05);
      gunBody.add(lcd);

      // Stainless steel heat shield barrel
      const barrelGeo = new THREE.CylinderGeometry(0.085, 0.105, 0.36, 24);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0, 0.32);
      gunBody.add(barrel);

      // Concentrated reduction focus nozzle tip (conical nozzle)
      const nozzleGeo = new THREE.CylinderGeometry(0.045, 0.082, 0.18, 24);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98, roughness: 0.08 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(0, 0, 0.52);
      gunBody.add(nozzle);

      // Internal glowing ceramic heating core inside nozzle tip
      const coreGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.08, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xf97316,
        emissiveIntensity: 1.8,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.rotation.x = Math.PI / 2;
      core.position.set(0, 0, 0.48);
      gunBody.add(core);

      // Position gunBody so that the nozzle tip points directly at the crosshair (0, 0, 0)
      gunBody.position.set(0, 0.38, -0.26);
      gunBody.rotation.x = -Math.PI / 3.0;
      toolGroup.add(gunBody);

      // Thermal stream particles flowing down from nozzle tip directly to crosshair
      const particleCount = 70;
      const partGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 0.14;
        posArray[i + 1] = Math.random() * 0.30;
        posArray[i + 2] = (Math.random() - 0.5) * 0.14;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const partMat = new THREE.PointsMaterial({
        color: phoneState.temperature > 105 ? 0xef4444 : 0xf97316,
        size: 0.045,
        transparent: true,
        opacity: 0.85,
      });
      const particles = new THREE.Points(partGeo, partMat);
      particles.position.set(0, 0, 0);
      thermalParticlesRef.current = particles;
      toolGroup.add(particles);
    } else if (selectedTool === 'screwdriver') {
      const driverGroup = new THREE.Group();

      // Precision screwdriver tip aligned EXACTLY with pivot y = 0
      const tipGeo = new THREE.CylinderGeometry(0.008, 0.016, 0.08, 12);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.y = 0.04; // Bottom of tip sits precisely at y = 0
      driverGroup.add(tip);

      const shaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.5, 16);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.98, roughness: 0.1 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.y = 0.33;
      driverGroup.add(shaft);

      const handleGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.55, 16);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = 0.85;
      driverGroup.add(handle);

      toolGroup.add(driverGroup);
    } else if (selectedTool === 'pry_pick') {
      const pickGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.015, 3);
      const pickMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 });
      const pick = new THREE.Mesh(pickGeo, pickMat);
      pick.rotation.x = Math.PI / 2;
      pick.rotation.z = Math.PI / 6;
      pick.position.set(0, 0.01, 0.08); // Corner active tip points right at cursor
      toolGroup.add(pick);
    } else if (selectedTool === 'suction') {
      // 5) SUCTION CUP ATTACHED ONLY FOLLOWS MOUSE IF NOT YET PLACED!
      if (!phoneState.suctionApplied) {
        const cupGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.07, 32);
        const cupMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 });
        const cup = new THREE.Mesh(cupGeo, cupMat);
        cup.position.y = 0.035;
        toolGroup.add(cup);

        const handleGeo = new THREE.TorusGeometry(0.12, 0.025, 16, 32);
        const handle = new THREE.Mesh(handleGeo, cupMat);
        handle.position.y = 0.16;
        toolGroup.add(handle);
      } else {
        // Absolutely hide from mouse pointer!
        toolGroup.visible = false;
      }
    } else if (selectedTool === 'brush') {
      const brushGroup = new THREE.Group();
      const bristleGeo = new THREE.BoxGeometry(0.10, 0.08, 0.04);
      const bristleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const bristles = new THREE.Mesh(bristleGeo, bristleMat);
      bristles.position.y = 0.04; // Bottom of bristles aligned with y = 0
      brushGroup.add(bristles);

      const bHandleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.5, 12);
      const bHandleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const bHandle = new THREE.Mesh(bHandleGeo, bHandleMat);
      bHandle.position.y = 0.33;
      brushGroup.add(bHandle);
      toolGroup.add(brushGroup);
    } else if (selectedTool === 'tweezers') {
      const twGroup = new THREE.Group();

      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.95,
        roughness: 0.18,
      });

      // Ultra-fine pointed ESD curved beak tweezers meeting exactly at (0, 0, 0)
      const leftTipGeo = new THREE.CylinderGeometry(0.003, 0.016, 0.26, 12);
      const leftTip = new THREE.Mesh(leftTipGeo, bladeMat);
      leftTip.position.set(-0.006, 0.12, 0.04);
      leftTip.rotation.x = -Math.PI / 6;
      leftTip.rotation.z = -0.03;
      twGroup.add(leftTip);

      const rightTipGeo = new THREE.CylinderGeometry(0.003, 0.016, 0.26, 12);
      const rightTip = new THREE.Mesh(rightTipGeo, bladeMat);
      rightTip.position.set(0.006, 0.12, 0.04);
      rightTip.rotation.x = -Math.PI / 6;
      rightTip.rotation.z = 0.03;
      twGroup.add(rightTip);

      // Spring neck & upper body extending back & up
      const bodyGeo = new THREE.BoxGeometry(0.045, 0.38, 0.016);
      const bodyMesh = new THREE.Mesh(bodyGeo, bladeMat);
      bodyMesh.position.set(0, 0.36, 0.18);
      bodyMesh.rotation.x = -Math.PI / 5;
      twGroup.add(bodyMesh);

      // Ergonomic blue ESD grip pad
      const gripGeo = new THREE.BoxGeometry(0.052, 0.16, 0.022);
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
      const grip = new THREE.Mesh(gripGeo, gripMat);
      grip.position.set(0, 0.36, 0.18);
      grip.rotation.x = -Math.PI / 5;
      twGroup.add(grip);

      toolGroup.add(twGroup);
    } else if (selectedTool === 'air_dryer') {
      const dryerGroup = new THREE.Group();
      const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.11, 0.26, 16);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.set(0, 0.14, 0);
      dryerGroup.add(nozzle);
      dryerGroup.position.set(0, 0.10, -0.06);
      dryerGroup.rotation.x = -Math.PI / 3;
      toolGroup.add(dryerGroup);

      // Steam particles
      const steamCount = 40;
      const steamGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(steamCount * 3);
      for (let i = 0; i < steamCount * 3; i += 3) {
        sPos[i] = (Math.random() - 0.5) * 0.15;
        sPos[i + 1] = -Math.random() * 0.4;
        sPos[i + 2] = (Math.random() - 0.5) * 0.15;
      }
      steamGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      const steamMat = new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: 0.04,
        transparent: true,
        opacity: 0.7,
      });
      const steam = new THREE.Points(steamGeo, steamMat);
      steam.position.set(0, -0.1, 0.15);
      steamParticlesRef.current = steam;
      toolGroup.add(steam);
    } else if (selectedTool === 'cyber_dongle') {
      if (!phoneState.dongleConnected) {
        const dongleGroup = new THREE.Group();
        // USB-C male connector plug pointing forward/down
        const plugGeo = new THREE.BoxGeometry(0.065, 0.022, 0.08);
        const plugMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 });
        const plug = new THREE.Mesh(plugGeo, plugMat);
        plug.position.set(0, 0.015, -0.04);
        dongleGroup.add(plug);

        // Dongle aluminum body
        const bodyGeo = new THREE.BoxGeometry(0.14, 0.05, 0.28);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 0.03, 0.14);
        dongleGroup.add(body);

        // Glowing cyan status LED
        const ledGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16);
        const ledMat = new THREE.MeshStandardMaterial({
          color: 0x00f0ff,
          emissive: 0x00f0ff,
          emissiveIntensity: 2.0,
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0.058, 0.14);
        dongleGroup.add(led);

        // Cyber brand stripe
        const stripeGeo = new THREE.BoxGeometry(0.144, 0.01, 0.04);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.8 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(0, 0.056, 0.06);
        dongleGroup.add(stripe);

        // Flexible diagnostic cable extending backwards
        const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.rotation.x = Math.PI / 3;
        cable.position.set(0, 0.12, 0.38);
        dongleGroup.add(cable);

        dongleGroup.position.set(0, 0.02, 0);
        toolGroup.add(dongleGroup);
      } else {
        toolGroup.visible = false;
      }
    } else if (selectedTool === 'thermal_paste') {
      const syringeGroup = new THREE.Group();

      // Precision dispensing needle / nozzle at tip (y = 0)
      const needleGeo = new THREE.CylinderGeometry(0.008, 0.018, 0.12, 12);
      const needleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.y = 0.06;
      syringeGroup.add(needle);

      // Droplet of thermal compound at the very tip
      const dropGeo = new THREE.SphereGeometry(0.014, 12, 12);
      const dropMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 });
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.y = 0.008;
      syringeGroup.add(drop);

      // Syringe transparent acrylic barrel
      const barrelGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.44, 24);
      const barrelMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
        metalness: 0.1,
      });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.y = 0.34;
      syringeGroup.add(barrel);

      // Silver thermal paste column inside barrel
      const pasteColumnGeo = new THREE.CylinderGeometry(0.040, 0.040, 0.28, 20);
      const pasteColumnMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, metalness: 0.6, roughness: 0.3 });
      const pasteColumn = new THREE.Mesh(pasteColumnGeo, pasteColumnMat);
      pasteColumn.position.y = 0.28;
      syringeGroup.add(pasteColumn);

      // Measurement graduations ring on barrel
      const gradGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.015, 20);
      const gradMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      const grad1 = new THREE.Mesh(gradGeo, gradMat);
      grad1.position.y = 0.26;
      syringeGroup.add(grad1);
      const grad2 = new THREE.Mesh(gradGeo, gradMat);
      grad2.position.y = 0.38;
      syringeGroup.add(grad2);

      // Plunger stem & thumb flange
      const plungerGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 12);
      const plungerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const plunger = new THREE.Mesh(plungerGeo, plungerMat);
      plunger.position.y = 0.64;
      syringeGroup.add(plunger);

      const flangeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 24);
      const flange = new THREE.Mesh(flangeGeo, plungerMat);
      flange.position.y = 0.77;
      syringeGroup.add(flange);

      // Side finger grip wings
      const wingsGeo = new THREE.BoxGeometry(0.18, 0.02, 0.06);
      const wings = new THREE.Mesh(wingsGeo, plungerMat);
      wings.position.y = 0.54;
      syringeGroup.add(wings);

      // Slight ergonomic tilt forward
      syringeGroup.rotation.x = -Math.PI / 10;
      toolGroup.add(syringeGroup);
    }

    // Interaction Raycasting
    const raycaster = new THREE.Raycaster();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerNorm.current.set(x, y);

      raycaster.setFromCamera(pointerNorm.current, camera);

      // Compute the real top elevation of the smartphone screen/surface
      let deviceSurfaceY = 0.125;
      if (phoneGroupRef.current) {
        const pY = phoneGroupRef.current.position.y;
        if (orientation === 'side_top' || orientation === 'side_bottom' || orientation === 'side_right' || orientation === 'side_left') {
          deviceSurfaceY = pY + 0.15;
        } else {
          deviceSurfaceY = pY + 0.065; // Screen glass and bezel top level
        }
      }

      // Check if mouse ray directly hits the smartphone surface
      let surfaceHit = false;
      if (phoneGroupRef.current) {
        const phoneHits = raycaster.intersectObjects(phoneGroupRef.current.children, true);
        const visibleHit = phoneHits.find(h => {
          let c: THREE.Object3D | null = h.object;
          while (c) {
            if (!c.visible) return false;
            c = c.parent;
          }
          return true;
        });

        if (visibleHit) {
          mousePlanePos.current.set(
            visibleHit.point.x,
            Math.max(deviceSurfaceY, visibleHit.point.y),
            visibleHit.point.z
          );
          surfaceHit = true;
        }
      }

      if (!surfaceHit) {
        // Project onto the working plane set at the exact height of the smartphone screen
        const workPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -deviceSurfaceY);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(workPlane, intersectPoint);
        if (intersectPoint) {
          mousePlanePos.current.copy(intersectPoint);
        }
      }

      // 4) 4-ZONE PROGRESSIVE HEAT GUN SWEEPING (Realistic, continuous & organic)
      if (selectedTool === 'heatgun') {
        const x = mousePlanePos.current.x;
        const z = mousePlanePos.current.z;

        // Distances from the 4 outer edges of the device
        const dTop = Math.max(0.12, Math.abs(z - (-cHeight / 2)));
        const dBottom = Math.max(0.12, Math.abs(z - (cHeight / 2)));
        const dLeft = Math.max(0.12, Math.abs(x - (-cWidth / 2)));
        const dRight = Math.max(0.12, Math.abs(x - (cWidth / 2)));

        const invTop = 1 / (dTop * dTop);
        const invBottom = 1 / (dBottom * dBottom);
        const invLeft = 1 / (dLeft * dLeft);
        const invRight = 1 / (dRight * dRight);
        const sumInv = invTop + invBottom + invLeft + invRight;

        let primaryZone: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
        if (z < -0.3) primaryZone = 'top';
        else if (z > 0.3) primaryZone = 'bottom';
        else if (x > 0.25) primaryZone = 'right';
        else primaryZone = 'left';

        const now = performance.now();
        // Heat tick throttled to 65ms for smooth non-quadratic organic progression
        if (now - lastHeatTickTime.current > 65) {
          lastHeatTickTime.current = now;
          if (onHeatSweep) {
            onHeatSweep(primaryZone, {
              top: invTop / sumInv,
              bottom: invBottom / sumInv,
              left: invLeft / sumInv,
              right: invRight / sumInv,
            });
          }
        }
      }

      // 6) PROGRESSIVE AIR DRYER SWEEPING ON WATER DROPLETS WITH DIFFUSE HEAT
      if (selectedTool === 'air_dryer') {
        if (phoneGroupRef.current) {
          const hits = raycaster.intersectObjects(phoneGroupRef.current.children, true);
          let foundDropId: string | null = null;
          for (const hit of hits) {
            if (hit.object.name.startsWith('water_drop_')) {
              foundDropId = hit.object.name.replace('water_drop_', '');
              break;
            }
          }
          if (foundDropId && onDryerSweep) {
            onDryerSweep(foundDropId);
          } else if (hits.length > 0 && onDryerSweep) {
            // Sweep diffuse heat on internal chassis
            onDryerSweep('ambient');
          }
        }
      }

      // 7) BRUSH SWEEPING ON OXIDATION SPOTS (Effortless proximity sweep)
      if (selectedTool === 'brush') {
        if (phoneGroupRef.current) {
          const hits = raycaster.intersectObjects(phoneGroupRef.current.children, true);
          for (const hit of hits) {
            if (hit.object.name.startsWith('oxidation_spot_')) {
              const spotId = hit.object.name.replace('oxidation_spot_', '');
              if (onBrushSweep) onBrushSweep(spotId);
              break;
            }
          }
        }
      }

      // 6) PROGRESSIVE PRYING ON EDGES WITH PLETTRO (Smooth continuous drag & sweep)
      if (selectedTool === 'pry_pick' && isMouseDown.current) {
        if (onPrySweep) onPrySweep();
      }

      // 6) RAYCASTING FOR INTERACTIVE COMPONENT HOVER TOOLTIP & INSPECTION (Only Uncovered Components!)
      // I popup informativi compaiono SOLO se ho le mani libere (selectedTool === 'none'), se ho uno strumento no!
      if (selectedTool !== 'none') {
        setHoveredInfo(null);
        return;
      }

      if (phoneGroupRef.current) {
        const isFrontUncovered = Boolean((phoneState.screenRemoved || (phoneState.screenPryProgress || 0) >= 100) && !phoneState.motherboardExtracted);
        const isBackUncovered = Boolean(phoneState.backCoverRemoved || (phoneState.backCoverPryProgress || 0) >= 100);

        const rawIntersects = raycaster.intersectObjects(phoneGroupRef.current.children, true);
        // Filter out any hit whose object or any ancestor is invisible
        const intersects = rawIntersects.filter(hit => {
          let curr: THREE.Object3D | null = hit.object;
          while (curr) {
            if (!curr.visible) return false;
            curr = curr.parent;
          }
          return true;
        });

        if (intersects.length > 0) {
          let hitObj = intersects[0].object;
          let target = hitObj.name;
          let p: THREE.Object3D | null = hitObj;
          while (!target && p && p.parent) {
            p = p.parent;
            if (p.name) target = p.name;
          }

          // Safety check: Front internal components covered by screen
          const isFrontInternal = (
            target === 'motherboard' ||
            target === 'cpu_chip' ||
            target === 'heat_pipe' ||
            target === 'thermal_paste_spot' ||
            target === 'battery' ||
            target === 'battery_connector' ||
            target === 'speaker_unit' ||
            target === 'taptic_engine' ||
            target === 'wifi_antenna' ||
            target === 'antenna_cable' ||
            target.startsWith('water_drop') ||
            target.startsWith('oxidation_spot') ||
            target.startsWith('motherboard_screw') ||
            target === 'speaker_screw'
          );

          if (isFrontInternal && !isFrontUncovered) {
            // Front internals are still covered by the closed screen
            if (orientation !== 'back') {
              target = 'screen_glass';
            } else {
              target = '';
            }
          }

          // Safety check: Rear internal components covered by back cover
          const isRearInternal = (
            target === 'wireless_coil' ||
            target === 'rear_midframe' ||
            target === 'camera_flex' ||
            target === 'camera_connector' ||
            target === 'camera_socket'
          );

          if (isRearInternal && !isBackUncovered) {
            // Rear internals are still covered by the closed back cover
            if (orientation === 'back') {
              target = 'back_cover';
            } else {
              target = '';
            }
          }

          // Check if extracted parts shouldn't show hover cards
          if (target === 'battery' && phoneState.oldBatteryRemoved && !phoneState.newBatteryInstalled) {
            target = '';
          }
          if (target === 'speaker_unit' && phoneState.oldSpeakerRemoved && !phoneState.newSpeakerInstalled) {
            target = '';
          }
          if (target === 'motherboard' && phoneState.motherboardExtracted) {
            target = '';
          }
          if (target.startsWith('bottom_screw') && phoneState.bottomScrewsRemoved) {
            target = '';
          }

          if (target && target !== 'ambient' && !target.startsWith('drop_')) {
            let compName = 'Componente Hardware';
            let compCat = 'Generale';
            let compCond = '100% Integro';
            let compAction = 'Nessuna azione richiesta';

            if (target === 'screen_glass') {
              compName = devCat === 'smartwatch' ? 'Display Rotondo OLED Retina' : devCat === 'tablet' ? 'Pannello Liquid Retina 13"' : 'Display OLED Super Retina';
              compCat = 'Display & Touchscreen';
              compCond = phoneState.newScreenInstalled
                ? '100% (Nuovo OEM)'
                : customer.issueType === 'broken_screen'
                ? '0% (Frantumato / Vetro rotto)'
                : '92% (Sano / Usura normale)';
              compAction = !phoneState.bottomScrewsRemoved
                ? 'Svita prima le 2 viti Torx inferiori'
                : !phoneState.isHeated
                ? 'Scalda i bordi con la pistola termica'
                : !phoneState.suctionApplied
                ? 'Fissa la ventosa con doppio click'
                : 'Usa il plettro per tagliare la colla e aprirlo';
            } else if (target === 'back_cover') {
              compName = devCat === 'smartwatch' ? 'Sensore Cardio & Retro Ceramico' : 'Scocca / Vetro Posteriore';
              compCat = 'Telaio Esterno';
              compCond = phoneState.backGlassReplaced ? '100% (Nuovo)' : customer.issueType === 'cracked_back_glass' ? '0% (Frantumato)' : '94% (Sano / Buone Condizioni)';
              compAction = 'Scalda con la pistola termica e fai leva con il plettro per aprirlo';
            } else if (target === 'battery' || target === 'battery_connector') {
              compName = devCat === 'smartwatch' ? 'Micro-Batteria Li-Po Smartwatch' : 'Batteria Li-Ion ad Alta Densità';
              compCat = 'Alimentazione';
              compCond = phoneState.newBatteryInstalled ? '100% (Nuova OEM)' : customer.issueType === 'dead_battery' ? '12% (Degradata / Gonfia)' : '90% (Buona / Operativa)';
              compAction = !phoneState.batteryDisconnected ? 'Scollega connettore flex con Pinzette' : !phoneState.oldBatteryRemoved ? 'Estrai con Pinzette nel dispenser' : 'Sostituisci nel pannello ricambi';
            } else if (target === 'motherboard') {
              compName = devCat === 'smartwatch' ? 'SiP (System in Package) Smartwatch' : 'Scheda Madre Principale (Logic Board)';
              compCat = 'Elettronica & Chip';
              compCond = phoneState.motherboardCleaned || customer.issueType !== 'water_damage' ? '100% (Operativa)' : '35% (Ossidazione Liquidi)';
              compAction = customer.issueType === 'water_damage' && !phoneState.motherboardCleaned ? 'Pulisci ossido con Spazzolino + IPA' : 'Scheda madre integra';
            } else if (target === 'cpu_chip' || target === 'heat_pipe' || target === 'thermal_paste_spot') {
              compName = 'Processore CPU / GPU & Dissipatore Rame';
              compCat = 'Calcolo & Termica';
              compCond = phoneState.newPasteApplied ? '100% (Pasta Termica Nuova)' : customer.issueType === 'overheating_cpu' ? '15% (Pasta Secca / Surriscaldato)' : '95% (Buono)';
              compAction = !phoneState.oldPasteScraped ? 'Raschia vecchia pasta con plettro' : !phoneState.newPasteApplied ? 'Applica nuova pasta con siringa' : 'Termica ottimale';
            } else if (target === 'speaker_unit') {
              compName = 'Modulo Altoparlante Acustico HD';
              compCat = 'Audio';
              compCond = phoneState.newSpeakerInstalled ? '100% (Nuovo)' : customer.issueType === 'broken_speaker' ? '0% (Muto/Guasto)' : '94% (Buono / Funzionante)';
              compAction = !phoneState.speakerUnscrewed ? 'Svita vite altoparlante con Cacciavite' : 'Estrai e sostituisci altoparlante';
            } else if (target === 'camera_island' || target.startsWith('camera_lens')) {
              compName = 'Modulo Tripla Fotocamera 4K Ultra';
              compCat = 'Sensori Ottici';
              compCond = phoneState.newCameraInstalled ? '100% (Nuovo)' : (customer.issueType === 'bad_camera' || customer.issueType === 'combo_water_camera') ? '0% (Lenti Frantumate/Ossidate)' : '96% (Buono)';
              compAction = !isBackUncovered ? 'Apri la scocca posteriore per accedere al modulo' : !phoneState.cameraDisconnected ? 'Stacca flex con Pinzette' : 'Estrai modulo e sostituisci nei ricambi';
            } else if (target === 'camera_flex' || target === 'camera_connector') {
              compName = 'Connettore & Cavo Flex Fotocamera';
              compCat = 'Connessioni Interne';
              compCond = phoneState.cameraDisconnected ? 'Scollegato (Pronto per estrazione)' : 'Collegato alla Logic Board';
              compAction = !phoneState.cameraDisconnected ? 'Usa le Pinzette per sganciare il connettore' : 'Connettore già scollegato';
            } else if (target === 'camera_socket') {
              compName = 'Alloggiamento Vano Fotocamera Vuoto';
              compCat = 'Vano Ricambio';
              compCond = 'Pronto per nuovo modulo OEM';
              compAction = 'Installa il nuovo modulo fotocamera dal pannello ricambi';
            } else if (target === 'chassis') {
              compName = devCat === 'smartwatch' ? 'Cassa Circolare Alluminio' : devCat === 'tablet' ? 'Telaio Unibody Alluminio Anodizzato' : 'Telaio Unibody & Chassis Laterale';
              compCat = 'Struttura Esterna';
              compCond = '100% (Solido / Struttura Integra)';
              compAction = 'Telaio strutturale del dispositivo';
            } else if (target === 'taptic_engine') {
              compName = 'Motore Vibrazione Taptic Engine';
              compCat = 'Feedback Tattile';
              compCond = '100% (Operativo)';
              compAction = 'Nessuna azione richiesta';
            } else if (target === 'usb_port') {
              compName = 'Connettore USB-C Dock di Ricarica';
              compCat = 'Porta Dati / Carica';
              compCond = phoneState.chargingPortReplaced ? '100% (Nuovo)' : customer.issueType === 'charging_port_dirt' ? 'Intasato da sporcizia/lanugine' : customer.issueType === 'broken_charging_port' ? '0% (Dissaldato)' : '98% (Buono / Funzionante)';
              compAction = customer.issueType === 'charging_port_dirt' ? 'Pulisci con lo Spazzolino' : customer.issueType === 'broken_charging_port' ? 'Sostituisci sub-board nei ricambi' : 'Porta operativa';
            } else if (target === 'wireless_coil') {
              compName = 'Bobina Ricarica Wireless Qi / MagSafe';
              compCat = 'Ricarica a Induzione';
              compCond = phoneState.wirelessCoilReplaced ? '100% (Nuova)' : customer.issueType === 'wireless_charging_burnt' ? '0% (Bruciata)' : '100% (Integra)';
              compAction = 'Sostituisci bobina wireless nel pannello ricambi';
            } else if (target.startsWith('bottom_screw')) {
              compName = 'Viti Torx Pentalobe di Chiusura Inferiore';
              compCat = 'Viti Chassis';
              compCond = '98% (Buone / Filettatura integra)';
              compAction = 'Seleziona Cacciavite Torx e tieni premuto per svitare';
            } else if (target.startsWith('motherboard_screw')) {
              compName = 'Vite di Bloccaggio Scheda Madre';
              compCat = 'Viti Interne';
              compCond = '95% (Buona / Filettatura integra)';
              compAction = 'Svita con Cacciavite Torx';
            } else if (target === 'speaker_screw') {
              compName = 'Vite di Bloccaggio Altoparlante';
              compCat = 'Viti Interne';
              compCond = '95% (Buona / Filettatura integra)';
              compAction = 'Svita con Cacciavite Torx';
            } else if (target.startsWith('water_drop')) {
              compName = 'Goccia d\'Acqua / Condensa Interna';
              compCat = 'Liquidi';
              compCond = 'Presenza Liquido Conduttivo';
              compAction = 'Passa l\'Asciugatore Termico per evaporazione termica';
            } else if (target.startsWith('oxidation_spot')) {
              compName = 'Macchia di Corrosione / Ossido Verde';
              compCat = 'Ossido';
              compCond = 'Rischio Corto Circuito';
              compAction = 'Strofina con Spazzolino + Alcool Isopropilico (IPA)';
            } else if (target === 'power_button') {
              compName = devCat === 'smartwatch' ? 'Digital Crown Rotante Smartwatch' : 'Tasto di Accensione Power';
              compCat = 'Controlli Fisici';
              compCond = phoneState.powerButtonFixed ? '100% (Nuova cupola a scatto)' : customer.issueType === 'power_button_click_broken' ? '0% (Cupola rotta/muta)' : '100% (Funzionante)';
              compAction = customer.issueType === 'power_button_click_broken' ? 'Usa Pinzette o Plettro per sostituire cupola Power' : 'Pressione fisica tasto';
            } else if (target.startsWith('volume_') || target === 'side_buttons') {
              compName = 'Bilanciere Volume Meccanico (+/-)';
              compCat = 'Tasti Laterali';
              compCond = phoneState.volumeButtonsFixed ? '100% (Riallineato / Clic Scattante)' : customer.issueType === 'stuck_volume_buttons' ? 'Incastrato per sporco/grasso' : '100% (Funzionante)';
              compAction = customer.issueType === 'stuck_volume_buttons' && !phoneState.volumeButtonsFixed ? 'Usa Pinzette o Plettro per fare leva e sbloccare' : 'Regolazione volume audio';
            } else if (target === 'wifi_antenna' || target === 'antenna_cable') {
              compName = 'Modulo & Antenna Wi-Fi 7 / 5G';
              compCat = 'Comunicazione Wireless';
              compCond = phoneState.wifiAntennaConnected ? '100% (Connesso / Segnale Ottimo)' : '0% (Cavo Coassiale Sganciato)';
              compAction = !phoneState.wifiAntennaConnected ? 'Usa le Pinzette per ricollegare il cavo coassiale dorato' : 'Antenna ricollegata con successo!';
            }

            setHoveredInfo({
              name: compName,
              category: compCat,
              condition: compCond,
              action: compAction,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          } else {
            setHoveredInfo(null);
          }
        } else {
          setHoveredInfo(null);
        }
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      isMouseDown.current = true;

      // 1) Continuous Progressive Unscrewing while holding down!
      if (selectedTool === 'screwdriver') {
        const targetScrew = snappedScrewRef.current;
        if (targetScrew) {
          soundManager.playRatchetSpin();
          if (onScrewProgressTick) {
            onScrewProgressTick(targetScrew);
          }

          if (unscrewIntervalRef.current) clearInterval(unscrewIntervalRef.current);
          unscrewIntervalRef.current = window.setInterval(() => {
            const currentScrew = snappedScrewRef.current || targetScrew;
            if (currentScrew && onScrewProgressTick) {
              onScrewProgressTick(currentScrew);
            }
          }, 110);
          return;
        }
      }

      // 7) Plettro instant advancement on click (Eliminates getting stuck!)
      if (selectedTool === 'pry_pick') {
        if (onPrySweep) onPrySweep();
      }

      // Safe raycasting click for other components
      raycaster.setFromCamera(pointerNorm.current, camera);
      if (phoneGroupRef.current) {
        const isFrontUncovered = Boolean((phoneState.screenRemoved || (phoneState.screenPryProgress || 0) >= 100) && !phoneState.motherboardExtracted);
        const isBackUncovered = Boolean(phoneState.backCoverRemoved || (phoneState.backCoverPryProgress || 0) > 0);

        const rawIntersects = raycaster.intersectObjects(phoneGroupRef.current.children, true);
        const intersects = rawIntersects.filter(hit => {
          let curr: THREE.Object3D | null = hit.object;
          while (curr) {
            if (!curr.visible) return false;
            curr = curr.parent;
          }
          return true;
        });

        if (intersects.length > 0) {
          let hitObj = intersects[0].object;
          let target = hitObj.name;
          let p: THREE.Object3D | null = hitObj;
          while (!target && p && p.parent) {
            p = p.parent;
            if (p.name) target = p.name;
          }

          // Remap internal hits to screen if closed
          if (!isFrontUncovered) {
            if (
              target === 'battery' ||
              target === 'battery_connector' ||
              target === 'motherboard' ||
              target === 'cpu_chip' ||
              target === 'heat_pipe' ||
              target === 'thermal_paste_spot' ||
              target === 'speaker_unit' ||
              target.startsWith('motherboard_screw') ||
              target === 'speaker_screw' ||
              target === 'wifi_antenna' ||
              target === 'taptic_engine' ||
              target.startsWith('water_drop') ||
              target.startsWith('oxidation_spot')
            ) {
              target = 'screen_glass';
            }
          }

          // Remap rear internals to back cover if closed
          if (!isBackUncovered) {
            if (
              target === 'rear_midframe' ||
              target === 'wireless_coil' ||
              target === 'camera_flex' ||
              target === 'camera_connector' ||
              target === 'camera_socket'
            ) {
              target = 'back_cover';
            }
          }

          // Check if component is locked by prerequisites -> highlight blockers in red for 2 sec!
          if (target === 'screen_glass' && !phoneState.bottomScrewsRemoved && selectedTool !== 'screwdriver') {
            triggerBlockedPrerequisites(
              ['bottom_screw_0', 'bottom_screw_1'],
              '🚫 Display bloccato dalle 2 viti Torx inferiori! Svita prima le viti con il cacciavite.'
            );
          } else if (target === 'battery' && !phoneState.batteryDisconnected && selectedTool === 'tweezers') {
            triggerBlockedPrerequisites(
              ['battery_connector'],
              '🚫 Batteria bloccata dal connettore flex! Stacca prima il connettore con le pinzette.'
            );
          } else if (target === 'motherboard' && selectedTool === 'tweezers') {
            if (!phoneState.motherboardScrewsRemoved) {
              triggerBlockedPrerequisites(
                ['motherboard_screw_0', 'motherboard_screw_1'],
                '🚫 Scheda madre fissata dalle 2 viti interne! Svita prima le viti Torx.'
              );
            } else if (!phoneState.batteryDisconnected) {
              triggerBlockedPrerequisites(
                ['battery_connector'],
                '🚫 Stacca prima il connettore della batteria per isolare la scheda madre!'
              );
            }
          } else if (target === 'speaker_unit' && !phoneState.speakerUnscrewed && selectedTool === 'tweezers') {
            triggerBlockedPrerequisites(
              ['speaker_screw'],
              '🚫 Altoparlante bloccato dalla vite interna! Svita prima la vite di fissaggio.'
            );
          } else if ((target === 'camera_island' || target.startsWith('camera_lens')) && !phoneState.cameraDisconnected && selectedTool === 'tweezers') {
            triggerBlockedPrerequisites(
              ['camera_connector', 'camera_flex'],
              '🚫 Modulo fotocamera bloccato dal connettore flex! Sgancia prima il connettore arancione.'
            );
          }

          if (selectedTool === 'cyber_dongle') {
            onPartClick('usb_port');
            return;
          }

          if (selectedTool === 'thermal_paste' && (target === 'cpu_chip' || target === 'thermal_paste_spot' || target === 'heat_pipe' || target === 'motherboard')) {
            onPartClick('cpu_chip');
            return;
          }

          if (target) {
            onPartClick(target);
          }
        }
      }
    };

    const handleDblClick = () => {
      if (selectedTool === 'suction' && !phoneState.suctionApplied) {
        if (onSuctionDoubleClick) {
          onSuctionDoubleClick();
        } else {
          onPartClick('screen_glass');
        }
      }
    };

    const handlePointerUp = () => {
      isMouseDown.current = false;
      if (unscrewIntervalRef.current) {
        clearInterval(unscrewIntervalRef.current);
        unscrewIntervalRef.current = null;
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', handlePointerMove);
    domEl.addEventListener('pointerdown', handlePointerDown);
    domEl.addEventListener('dblclick', handleDblClick);
    window.addEventListener('pointerup', handlePointerUp);

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Camera pan position + lookAt framing
      const lookTarget = new THREE.Vector3(cameraPan.current.x, 0, cameraPan.current.y);
      const camTarget = targetCameraPos.current.clone().add(new THREE.Vector3(cameraPan.current.x, 0, cameraPan.current.y));
      camera.position.lerp(camTarget, 0.1);
      camera.lookAt(lookTarget);

      // Real-time phone tilt & orientation update at 60 FPS without scene recreation
      if (phoneGroupRef.current) {
        const curTilt = tiltDegreesRef.current;
        const radTilt = (curTilt * Math.PI) / 180;
        let targetRotX = 0;
        let targetRotZ = 0;
        let targetPosY = 0.055;

        if (orientationRef.current === 'back') {
          targetRotZ = Math.PI;
          targetRotX = -radTilt;
          targetPosY = 0.055 + Math.sin(Math.abs(radTilt)) * 0.55;
        } else if (orientationRef.current === 'side_right') {
          targetRotZ = Math.PI / 2;
          targetRotX = -radTilt;
          targetPosY = 0.65;
        } else if (orientationRef.current === 'side_left') {
          targetRotZ = -Math.PI / 2;
          targetRotX = -radTilt;
          targetPosY = 0.65;
        } else if (orientationRef.current === 'side_bottom') {
          targetRotX = -Math.PI / 3 - radTilt;
          targetPosY = 0.55 + Math.sin(radTilt) * 0.35;
        } else if (orientationRef.current === 'side_top') {
          targetRotX = Math.PI / 2;
          targetPosY = 1.25;
        } else {
          // Front view
          targetRotX = -radTilt;
          targetPosY = 0.055 + Math.sin(Math.abs(radTilt)) * 0.55;
        }

        phoneGroupRef.current.rotation.x = THREE.MathUtils.lerp(phoneGroupRef.current.rotation.x, targetRotX, 0.3);
        phoneGroupRef.current.rotation.z = THREE.MathUtils.lerp(phoneGroupRef.current.rotation.z, targetRotZ, 0.3);
        phoneGroupRef.current.position.y = THREE.MathUtils.lerp(phoneGroupRef.current.position.y, targetPosY, 0.3);
      }

      // Red highlighting of blocked parts for 2 seconds
      if (phoneGroupRef.current && blockedHighlightRef.current.until > Date.now()) {
        const parts = blockedHighlightRef.current.parts;
        const pulse = 1.8 + Math.sin(Date.now() * 0.02) * 1.2;
        phoneGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.name && parts.some(p => child.name === p || child.name.startsWith(p))) {
            if (child.material && 'emissive' in child.material) {
              if (child.userData.origEmissive === undefined) {
                child.userData.origEmissive = (child.material as THREE.MeshStandardMaterial).emissive.getHex();
                child.userData.origEmissiveIntensity = (child.material as THREE.MeshStandardMaterial).emissiveIntensity || 0;
              }
              (child.material as THREE.MeshStandardMaterial).emissive.setHex(0xef4444);
              (child.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
            }
          }
        });
      } else if (phoneGroupRef.current) {
        phoneGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.origEmissive !== undefined) {
            if (child.material && 'emissive' in child.material) {
              (child.material as THREE.MeshStandardMaterial).emissive.setHex(child.userData.origEmissive);
              (child.material as THREE.MeshStandardMaterial).emissiveIntensity = child.userData.origEmissiveIntensity;
              delete child.userData.origEmissive;
              delete child.userData.origEmissiveIntensity;
            }
          }
        });
      }

      // Magnetic Auto-Snap for Screwdriver and Precision Cursor Positioning for All Tools!
      if (activeToolMeshRef.current && selectedTool !== 'none') {
        const targetPos = mousePlanePos.current.clone();

        if (selectedTool === 'screwdriver') {
          let closestDist = 0.70;
          let foundScrew: string | null = null;
          let snapPos: THREE.Vector3 | null = null;

          if (phoneGroupRef.current) {
            phoneGroupRef.current.updateMatrixWorld(true);

            for (const st of screwTargetsRef.current) {
              // Internal screws cannot be reached or seen if the screen is still mounted, or from rear/side views
              const isInternalScrew = st.id.startsWith('motherboard_') || st.id === 'speaker_screw';
              if (isInternalScrew) {
                if (!phoneState.screenRemoved) continue;
                if (orientationRef.current === 'back' || orientationRef.current === 'side_right' || orientationRef.current === 'side_left') continue;
              }

              // Bottom chassis screws cannot be reached from the back view
              if (st.id.startsWith('bottom_screw')) {
                if (orientationRef.current === 'back') continue;
              }

              const worldPos = st.pos.clone().applyMatrix4(phoneGroupRef.current.matrixWorld);
              const dist = new THREE.Vector2(mousePlanePos.current.x, mousePlanePos.current.z)
                .distanceTo(new THREE.Vector2(worldPos.x, worldPos.z));

              if (dist < closestDist) {
                // Direct Line-of-Sight Check from Camera:
                let isOccluded = false;
                const camPos = camera.position.clone();
                const toScrew = worldPos.clone().sub(camPos);
                const rayDist = toScrew.length();
                const rayDir = toScrew.normalize();

                const occlusionRay = new THREE.Raycaster(camPos, rayDir, 0.1, Math.max(0.1, rayDist - 0.02));
                occlusionRay.camera = camera;

                // Filter out 2D billboard sprites (labels) from occlusion raycasting to avoid sprite camera warnings
                const nonSpriteChildren = phoneGroupRef.current.children.filter(obj => !(obj instanceof THREE.Sprite) && !obj.name?.includes('label'));
                const hits = occlusionRay.intersectObjects(nonSpriteChildren, true);

                for (const hit of hits) {
                  let c: THREE.Object3D | null = hit.object;
                  let isVisible = true;
                  while (c) {
                    if (!c.visible) {
                      isVisible = false;
                      break;
                    }
                    c = c.parent;
                  }
                  if (!isVisible) continue;

                  // Ignore if hit object is a sprite, or part of the screw itself or ambient lights
                  if (hit.object instanceof THREE.Sprite) continue;
                  if (hit.object.name === st.id || hit.object.parent?.name === st.id) continue;
                  if (hit.object.name?.includes('label') || hit.object.name?.includes('ambient')) continue;

                  // For internal screws (motherboard & speaker), PCB, EMI shields, traces, chassis, and the lifted screen are NOT blockers
                  if (isInternalScrew) {
                    if (
                      hit.object.name === 'motherboard' ||
                      hit.object.name === 'screen_glass' ||
                      hit.object.name === 'chassis' ||
                      hit.object.name === 'speaker_unit' ||
                      hit.object.name?.includes('trace') ||
                      hit.object.name?.includes('smd') ||
                      hit.object.name?.includes('screw')
                    ) {
                      continue;
                    }
                  }

                  // A component is physically blocking the screw from above!
                  isOccluded = true;
                  break;
                }

                if (!isOccluded) {
                  closestDist = dist;
                  foundScrew = st.id;
                  snapPos = worldPos.clone();
                }
              }
            }
          }

          const surfaceY = mousePlanePos.current.y;

          if (foundScrew && snapPos) {
            targetPos.set(snapPos.x, snapPos.y + 0.005, snapPos.z);
            if (snappedScrewRef.current !== foundScrew) {
              snappedScrewRef.current = foundScrew;
              setSnappedScrewUI(foundScrew);
              soundManager.playMagneticSnap();
            }
          } else {
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.012, mousePlanePos.current.z);
            if (snappedScrewRef.current !== null) {
              snappedScrewRef.current = null;
              setSnappedScrewUI(null);
            }
          }
        } else {
          const surfaceY = mousePlanePos.current.y;
          if (selectedTool === 'suction') {
            // Vacuum suction cup: rubber lip sits flush on the smartphone glass screen without penetrating
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.006, mousePlanePos.current.z);
          } else if (selectedTool === 'pry_pick') {
            // Pry pick: blade edge sits right on top of the seam between screen and frame
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.008, mousePlanePos.current.z);
          } else if (selectedTool === 'tweezers') {
            // Precision tweezers tips hover cleanly right above components
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.012, mousePlanePos.current.z);
          } else if (selectedTool === 'brush') {
            // Cleaning brush bristles touching surface
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.006, mousePlanePos.current.z);
          } else if (selectedTool === 'heatgun' || selectedTool === 'air_dryer') {
            // Heat gun / dryer elevated above the device
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.065, mousePlanePos.current.z);
          } else if (selectedTool === 'thermal_paste') {
            // Syringe needle hovering right above the CPU surface
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.008, mousePlanePos.current.z);
          } else if (selectedTool === 'cyber_dongle') {
            // Cyber dongle plug aligned with USB port
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.015, mousePlanePos.current.z);
          } else {
            // Default tool or replacement part in hand
            targetPos.set(mousePlanePos.current.x, surfaceY + 0.012, mousePlanePos.current.z);
          }
        }

        // Fast & immediate 0.92 response so the tool tip stays directly under the mouse crosshair without sluggish drag
        activeToolMeshRef.current.position.lerp(targetPos, 0.92);
      }

      if (thermalParticlesRef.current) {
        const positions = thermalParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.03;
          if (positions[i] < -0.55) {
            positions[i] = 0;
          }
        }
        thermalParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (steamParticlesRef.current) {
        const positions = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.025;
          if (positions[i] < -0.4) {
            positions[i] = 0;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

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
      domEl.removeEventListener('pointermove', handlePointerMove);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      domEl.removeEventListener('dblclick', handleDblClick);
      window.removeEventListener('pointerup', handlePointerUp);
      if (unscrewIntervalRef.current) clearInterval(unscrewIntervalRef.current);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [
    customer.id,
    customer.phoneColor,
    customer.issueType,
    customer.deviceCategory,
    phoneState.bottomScrewsRemoved,
    phoneState.motherboardScrewsRemoved,
    phoneState.motherboardExtracted,
    phoneState.screenRemoved,
    phoneState.screenPryProgress,
    phoneState.backCoverRemoved,
    phoneState.backCoverPryProgress,
    phoneState.backGlassReplaced,
    phoneState.wirelessCoilReplaced,
    phoneState.wirelessCoilRemoved,
    phoneState.chargingPortReplaced,
    phoneState.newScreenInstalled,
    phoneState.newCameraInstalled,
    phoneState.oldCameraRemoved,
    phoneState.cameraDisconnected,
    phoneState.newBatteryInstalled,
    phoneState.oldBatteryRemoved,
    phoneState.batteryDisconnected,
    phoneState.isPoweredOn,
    phoneState.dongleConnected,
    phoneState.firmwareRestored,
    phoneState.newPasteApplied,
    phoneState.oldPasteScraped,
    phoneState.newSpeakerInstalled,
    phoneState.oldSpeakerRemoved,
    phoneState.speakerUnscrewed,
    phoneState.suctionApplied,
    phoneState.waterDroplets,
    phoneState.oxidationSpots,
    phoneState.heatProgress,
    phoneState.temperature,
    phoneState.thermalDamageOccurred,
    phoneState.wifiAntennaConnected,
    phoneState.motherboardCleaned,
    phoneState.volumeButtonsFixed,
    phoneState.powerButtonFixed,
    selectedTool,
    orientation,
  ]);

  const activeScrewProg = snappedScrewUI ? (phoneState.screwProgress?.[snappedScrewUI] || 0) : 0;

  return (
    <div className="relative w-full h-full min-h-[460px] flex-1 overflow-hidden select-none bg-gradient-to-b from-sky-50 to-slate-100">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* 1) SCREWDRIVER PROGRESS HUD WITH PERCENTAGE */}
      {snappedScrewUI && selectedTool === 'screwdriver' && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (snappedScrewUI && onScrewProgressTick) {
              onScrewProgressTick(snappedScrewUI);
            }
          }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex flex-col items-center gap-1.5 text-xs animate-fade-in backdrop-blur-md z-30 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 font-bold">
            <span className="text-lg">🪛</span>
            <span>Vite Agganciata: <strong className="text-amber-300 font-mono text-sm">{activeScrewProg}%</strong> Svitata</span>
          </div>
          <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-100"
              style={{ width: `${activeScrewProg}%` }}
            />
          </div>
          <span className="text-[10px] text-amber-200 font-mono">Tieni premuto col mouse o clicca qui per svitare velocemente al 100%!</span>
        </div>
      )}

      {/* 4) 4-ZONE PROGRESSIVE HEAT HUD */}
      {selectedTool === 'heatgun' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-orange-400 flex flex-col items-center gap-2 text-xs backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔥</span>
            <div className="text-left">
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Temperatura Scocca:</span>
                <span className={`font-mono text-base ${phoneState.temperature > 105 ? 'text-rose-500 animate-pulse font-black' : 'text-amber-400'}`}>
                  {phoneState.temperature}°C
                </span>
                <span className="text-[10px] text-slate-400 font-normal">(Ottimale 75°C - 85°C)</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Avanzamento Colla: <strong className="text-emerald-400">{phoneState.heatProgress}%</strong> (Copri tutti e 4 i lati!)
              </div>
            </div>
          </div>

          {/* 4 Perimeter zones mini status */}
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono w-full text-center">
            <div className="bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
              Sup: <strong className="text-amber-300">{phoneState.heatZones?.top || 0}%</strong>
            </div>
            <div className="bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
              Des: <strong className="text-amber-300">{phoneState.heatZones?.right || 0}%</strong>
            </div>
            <div className="bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
              Inf: <strong className="text-amber-300">{phoneState.heatZones?.bottom || 0}%</strong>
            </div>
            <div className="bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
              Sin: <strong className="text-amber-300">{phoneState.heatZones?.left || 0}%</strong>
            </div>
          </div>

          {phoneState.temperature > 105 && (
            <div className="text-[10px] text-rose-400 font-bold animate-pulse">
              ⚠️ ATTENZIONE! Sovratemperatura! Sposta la pistola termica per evitare di bruciare lo schermo!
            </div>
          )}
        </div>
      )}

      {/* 6) PRY PICK PROGRESS HUD (Front Screen) */}
      {selectedTool === 'pry_pick' && orientation === 'front' && !phoneState.screenRemoved && phoneState.suctionApplied && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-xl border border-sky-400 flex flex-col items-center gap-1.5 text-xs backdrop-blur-md z-30">
          <div className="flex items-center gap-2 font-bold">
            <span>✂️</span>
            <span>Apertura Schermo Anteriore: <strong className="text-sky-300 font-mono text-sm">{phoneState.screenPryProgress}%</strong></span>
          </div>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-150"
              style={{ width: `${phoneState.screenPryProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">Scorri lungo il perimetro: a 100% lo schermo si aprirà!</span>
        </div>
      )}

      {/* 3) PRY PICK PROGRESS HUD (Rear Back Cover) */}
      {selectedTool === 'pry_pick' && orientation === 'back' && !phoneState.backCoverRemoved && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-xl border border-sky-400 flex flex-col items-center gap-1.5 text-xs backdrop-blur-md z-30">
          <div className="flex items-center gap-2 font-bold">
            <span>✂️</span>
            <span>Apertura Scocca Posteriore: <strong className="text-sky-300 font-mono text-sm">{phoneState.backCoverPryProgress || 0}%</strong></span>
          </div>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-150"
              style={{ width: `${phoneState.backCoverPryProgress || 0}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">Clicca o scorri sui bordi: a 100% la cover si solleverà rivelando i componenti!</span>
        </div>
      )}

      {/* 5) SUCTION CUP DOUBLE CLICK TARGET (Only when NOT yet placed!) */}
      {selectedTool === 'suction' && !phoneState.suctionApplied && (
        <div
          onClick={() => {
            if (onSuctionDoubleClick) onSuctionDoubleClick();
            else onPartClick('screen_glass');
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-600/90 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-sky-300 font-bold flex items-center gap-2 text-sm cursor-pointer animate-pulse backdrop-blur-md z-30"
        >
          <span className="text-2xl">🎯</span>
          <div className="text-left">
            <div className="font-extrabold text-sm">Fai DOPPIO CLICK qui al centro</div>
            <div className="text-[11px] text-sky-200">fisserà la ventosa a vuoto sul display</div>
          </div>
        </div>
      )}

      {/* 7) CYBER-DONGLE CONNECT HELPER (Click directly to plug into USB port from any view!) */}
      {selectedTool === 'cyber_dongle' && !phoneState.dongleConnected && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPartClick('usb_port');
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-cyan-600/95 hover:bg-cyan-500 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-cyan-300 font-bold flex items-center gap-3 text-sm cursor-pointer animate-pulse backdrop-blur-md z-30 transition-all active:scale-95"
        >
          <span className="text-2xl">⚡</span>
          <div className="text-left">
            <div className="font-extrabold text-sm">Clicca per Inserire il Cyber-Dongle USB</div>
            <div className="text-[11px] text-cyan-100">collega l'interfaccia FastBoot hardware alla porta USB-C</div>
          </div>
        </div>
      )}

      {/* 8) THERMAL PASTE APPLY HELPER (Click directly to dispense paste on the CPU die!) */}
      {selectedTool === 'thermal_paste' && !phoneState.newPasteApplied && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPartClick('cpu_chip');
          }}
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-sky-600/95 hover:bg-sky-500 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-sky-300 font-bold flex items-center gap-3 text-sm cursor-pointer animate-pulse backdrop-blur-md z-30 transition-all active:scale-95"
        >
          <span className="text-2xl">🎯</span>
          <div className="text-left">
            <div className="font-extrabold text-sm">Clicca per Dosare la Pasta Termica sulla CPU</div>
            <div className="text-[11px] text-sky-100">applica una goccia fresca al diamante sul processore</div>
          </div>
        </div>
      )}

      {/* 9) STUCK VOLUME BUTTONS UNLOCK HELPER */}
      {customer.issueType === 'stuck_volume_buttons' && !phoneState.volumeButtonsFixed && (selectedTool === 'tweezers' || selectedTool === 'pry_pick' || selectedTool === 'brush' || selectedTool === 'none') && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPartClick('volume_buttons');
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-amber-600/95 hover:bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 font-bold flex items-center gap-3 text-sm cursor-pointer animate-pulse backdrop-blur-md z-30 transition-all active:scale-95"
        >
          <span className="text-2xl">🔘</span>
          <div className="text-left">
            <div className="font-extrabold text-sm">Clicca qui per Sbloccare i Tasti Volume (+/-)</div>
            <div className="text-[11px] text-amber-100">fai leva per disincastrare il bilanciere con le pinzette o il plettro</div>
          </div>
        </div>
      )}

      {/* 6) INTERACTIVE COMPONENT HOVER HUD (Card popup ricca: Scheda Dettagli Componente al passaggio del mouse) */}
      {hoveredInfo && (selectedTool === 'none' || selectedTool === 'tweezers' || selectedTool === 'pry_pick' || selectedTool === 'brush') && (
        <div
          className="absolute z-40 pointer-events-none bg-slate-950/95 text-white p-3.5 rounded-2xl shadow-2xl border border-cyan-400/80 backdrop-blur-md animate-fade-in flex flex-col gap-1.5 max-w-sm"
          style={{
            left: Math.min(window.innerWidth - 340, Math.max(20, hoveredInfo.x + 18)),
            top: Math.min(window.innerHeight - 190, Math.max(20, hoveredInfo.y + 18)),
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 font-mono">Scheda Componente</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold">
              {hoveredInfo.category}
            </span>
          </div>

          <div className="text-sm font-black text-white font-['Outfit'] flex items-center justify-between gap-2">
            <span>{hoveredInfo.name}</span>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Stato Salute / Integrità:</span>
            <span className={`font-mono font-bold text-[11px] ${
              hoveredInfo.condition.includes('0%') || hoveredInfo.condition.includes('Danneggiato') || hoveredInfo.condition.includes('Sganciato') || hoveredInfo.condition.includes('Frantumato') || hoveredInfo.condition.includes('Bruciata')
                ? 'text-rose-400'
                : hoveredInfo.condition.includes('100%') || hoveredInfo.condition.includes('Nuovo')
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}>
              {hoveredInfo.condition}
            </span>
          </div>

          <div className="text-[11px] text-amber-200 bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/30 flex items-start gap-1.5 leading-tight">
            <span className="text-amber-400 shrink-0">💡</span>
            <span><strong>Azione:</strong> {hoveredInfo.action}</span>
          </div>
        </div>
      )}

      {/* BLOCKED COMPONENT WARNING ALERT POPUP (Red Alert Badge with Sound & Instructions) */}
      {blockedAlert && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-rose-500 backdrop-blur-lg flex items-center gap-3 animate-bounce max-w-md text-center">
          <div className="w-8 h-8 rounded-full bg-rose-500/30 flex items-center justify-center text-rose-300 font-bold text-lg shrink-0 border border-rose-400">
            ⚠️
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-rose-300 font-mono">
              Componente Bloccato da Altri Pezzi
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              {blockedAlert.message}
            </div>
            <div className="text-[10px] text-rose-200 mt-1 font-mono">
              🔴 I pezzi da smontare prima stanno lampeggiando in <strong className="text-white underline">ROSSO</strong> nel banco!
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC PHONE TILT & INCLINATION CONTROL BAR (Inclinazione in Tempo Reale) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-white/95 p-2 rounded-2xl border border-slate-300 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-800 font-['Outfit']">
          <span className="flex items-center gap-1.5 text-sky-700">
            <span>📐</span>
            <span>Inclinazione (Real-Time)</span>
          </span>
          <span className="font-mono text-sky-700 font-extrabold">{tiltDegrees}°</span>
        </div>

        {/* Tilt slider 0° to 90° with instant real-time 60fps update */}
        <input
          type="range"
          min="0"
          max="90"
          step="1"
          value={tiltDegrees}
          onChange={(e) => setTiltDegrees(Number(e.target.value))}
          className="w-36 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          title="Regola inclinazione smartphone in tempo reale"
        />

        {/* Preset Angle Buttons */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          {[
            { label: '0°', deg: 0 },
            { label: '30°', deg: 30 },
            { label: '60°', deg: 60 },
            { label: '90°', deg: 90 },
          ].map(p => (
            <button
              key={p.deg}
              onClick={() => setTiltDegrees(p.deg)}
              className={`py-0.5 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                tiltDegrees === p.deg
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CAMERA NAVIGATION D-PAD & KEYBOARD SHORTCUTS HUD */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col items-center gap-1.5 bg-white/95 p-2.5 rounded-2xl border border-slate-300 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-700 font-mono mb-1">
          <span className="flex items-center gap-1 text-sky-700">
            <span>🧭</span> Inquadratura Telecamera
          </span>
          {(cameraPanUI.x !== 0 || cameraPanUI.y !== 0) && (
            <button
              onClick={handleResetPan}
              className="text-[9px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* D-Pad Layout */}
        <div className="grid grid-cols-3 gap-1 w-24">
          <div />
          <button
            onClick={() => handlePan(0, -0.35 / zoomScale)}
            title="Sposta telecamera in Alto (Freccia Su)"
            aria-label="Inquadra in alto"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs border border-slate-200"
          >
            ⬆️
          </button>
          <div />

          <button
            onClick={() => handlePan(-0.35 / zoomScale, 0)}
            title="Sposta telecamera a Sinistra (Freccia Sinistra)"
            aria-label="Inquadra a sinistra"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs border border-slate-200"
          >
            ⬅️
          </button>
          <button
            onClick={handleResetPan}
            title="Centra Telecamera (Spazio / R)"
            aria-label="Ricentra inquadratura"
            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs border ${
              cameraPanUI.x === 0 && cameraPanUI.y === 0
                ? 'bg-sky-600 text-white border-sky-700'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            🎯
          </button>
          <button
            onClick={() => handlePan(0.35 / zoomScale, 0)}
            title="Sposta telecamera a Destra (Freccia Destra)"
            aria-label="Inquadra a destra"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs border border-slate-200"
          >
            ➡️
          </button>

          <div />
          <button
            onClick={() => handlePan(0, 0.35 / zoomScale)}
            title="Sposta telecamera in Basso (Freccia Giù)"
            aria-label="Inquadra in basso"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs border border-slate-200"
          >
            ⬇️
          </button>
          <div />
        </div>

        <span className="text-[9px] text-slate-400 font-mono mt-0.5">
          Tasti: Frecce / WASD
        </span>
      </div>

      {/* ZOOM & VIEW CONTROLS (Point 2: Permetti molto più zoomin e zoomout) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 bg-white/95 p-1.5 rounded-2xl border border-slate-300 shadow-xl backdrop-blur-md">
        <button
          onClick={() => handleZoom(0.35)}
          aria-label="Zoom In"
          title="Zoom In (+)"
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center transition-colors cursor-pointer active:scale-95"
        >
          +
        </button>
        <span className="text-[10px] font-mono font-extrabold text-sky-700 select-none">
          {Math.round(zoomScale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(-0.35)}
          aria-label="Zoom Out"
          title="Zoom Out (-)"
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center transition-colors cursor-pointer active:scale-95"
        >
          -
        </button>

        <div className="w-full h-px bg-slate-200 my-0.5" />

        <button
          onClick={() => handleSetExactZoom(3.5)}
          aria-label="Macro Microscopio 350%"
          title="Zoom Macro Microscopio (350%)"
          className="w-8 h-7 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[9px] flex items-center justify-center transition-colors cursor-pointer"
        >
          🔬 3.5x
        </button>
        <button
          onClick={() => handleSetExactZoom(0.4)}
          aria-label="Vista Ampia 40%"
          title="Vista Ampia / Panoramica (40%)"
          className="w-8 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center transition-colors cursor-pointer"
        >
          🔭 0.4x
        </button>
        <button
          onClick={handleResetZoom}
          aria-label="Reset Zoom 100%"
          title="Reset Zoom Normale (100%)"
          className="w-8 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[9px] flex items-center justify-center transition-colors cursor-pointer"
        >
          100%
        </button>
      </div>
    </div>
  );
};
