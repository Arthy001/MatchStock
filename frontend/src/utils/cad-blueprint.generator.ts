import { BlueprintAnalysisResult } from '../services/gemini.service';
import { WarehouseLayoutModel } from '../types/warehouse-3d';

/**
 * CAD Blueprint 2D Architectural Plan Generator
 * Transforms rough user doodles into standardized, professional engineering blueprints
 */
export function generateStandardCadBlueprint(
  data: BlueprintAnalysisResult,
  canvasWidth: number = 2048,
  canvasHeight: number = 1536
): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Blueprint Deep Navy Canvas Background
  ctx.fillStyle = '#060d1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Margins for blueprint dimension lines and border
  const marginX = 140;
  const marginY = 120;
  const planW = canvas.width - marginX * 2;
  const planH = canvas.height - marginY * 2;

  // 2. Engineering Coordinate Grid (Fine blueprint grid)
  ctx.strokeStyle = '#0e2246';
  ctx.lineWidth = 1;
  const minorGrid = 25;
  for (let x = marginX; x <= marginX + planW; x += minorGrid) {
    ctx.beginPath();
    ctx.moveTo(x, marginY);
    ctx.lineTo(x, marginY + planH);
    ctx.stroke();
  }
  for (let y = marginY; y <= marginY + planH; y += minorGrid) {
    ctx.beginPath();
    ctx.moveTo(marginX, y);
    ctx.lineTo(marginX + planW, y);
    ctx.stroke();
  }

  // Major Grid lines
  ctx.strokeStyle = '#1a3668';
  ctx.lineWidth = 1.5;
  const majorGrid = 100;
  for (let x = marginX; x <= marginX + planW; x += majorGrid) {
    ctx.beginPath();
    ctx.moveTo(x, marginY);
    ctx.lineTo(x, marginY + planH);
    ctx.stroke();
  }
  for (let y = marginY; y <= marginY + planH; y += majorGrid) {
    ctx.beginPath();
    ctx.moveTo(marginX, y);
    ctx.lineTo(marginX + planW, y);
    ctx.stroke();
  }

  // 3. Double-Line Outer Perimeter Walls (Thick CAD Architectural Walls)
  const wallThick = 12;
  ctx.fillStyle = '#1e3a5f';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;

  // Outer boundary
  ctx.strokeRect(marginX, marginY, planW, planH);
  ctx.strokeRect(marginX + wallThick, marginY + wallThick, planW - wallThick * 2, planH - wallThick * 2);

  // 4. Loading Docks & Doors (Front / Top Wall)
  if (data.doors && data.doors.length > 0) {
    data.doors.forEach((door, idx) => {
      const doorCenterWorldX = marginX + (door.x / 100) * planW;
      const doorW = 110;
      const doorX = doorCenterWorldX - doorW / 2;
      const doorY = marginY - 6;

      // Cutout wall background
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(doorX, doorY, doorW, wallThick + 12);

      // Yellow/Black Industrial Hazard Stripes
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(doorX, doorY, doorW, wallThick + 12);

      // Rollup door slats
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      for (let sl = doorY + 3; sl <= doorY + wallThick + 9; sl += 4) {
        ctx.beginPath();
        ctx.moveTo(doorX + 2, sl);
        ctx.lineTo(doorX + doorW - 2, sl);
        ctx.stroke();
      }

      // Door Label
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(door.label || `DOCK 0${idx + 1}`, doorCenterWorldX, doorY - 14);
    });
  }

  // 5. Facility Rooms (Restroom 🚻 and Office 💼)
  if (data.rooms && data.rooms.length > 0) {
    data.rooms.forEach((room) => {
      const roomW = (room.widthPercent / 100) * planW;
      const roomH = (room.depthPercent / 100) * planH;
      const roomX = marginX + (room.x / 100) * planW - roomW / 2;
      const roomY = marginY + (room.z / 100) * planH - roomH / 2;

      // Room Floor fill
      ctx.fillStyle = room.type === 'restroom' ? '#0d2847' : '#14294b';
      ctx.fillRect(roomX, roomY, roomW, roomH);

      // Double partition walls
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(roomX, roomY, roomW, roomH);
      ctx.strokeRect(roomX + 6, roomY + 6, roomW - 12, roomH - 12);

      // Door Swing Arc (Quarter circle CAD architectural standard)
      const doorRadius = 36;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(roomX + 6, roomY + 6, doorRadius, 0, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(roomX + 6, roomY + 6);
      ctx.lineTo(roomX + 6 + doorRadius, roomY + 6);
      ctx.stroke();

      // Room Label Badge
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = room.type === 'restroom' ? '🚻 ' : '💼 ';
      ctx.fillText(`${icon}${room.label || room.name}`, roomX + roomW / 2, roomY + roomH / 2);

      // Dimension tag
      ctx.fillStyle = '#64748b';
      ctx.font = '13px monospace';
      ctx.fillText(`${(roomW / 30).toFixed(1)}m × ${(roomH / 30).toFixed(1)}m`, roomX + roomW / 2, roomY + roomH / 2 + 22);
    });
  }

  // 6. Standard Storage Racks (Clean, parallel CAD frames with pallet bay divisions)
  if (data.racks && data.racks.length > 0) {
    data.racks.forEach((rack, rIdx) => {
      // Scale rack box to realistic CAD blueprint proportion
      const isRotated = rack.rotationDegrees === 90;
      const rackW = isRotated ? Math.max(50, (rack.widthMeters || 1.2) * 28) : Math.max(140, (rack.depthMeters || 6) * 28);
      const rackH = isRotated ? Math.max(140, (rack.depthMeters || 6) * 28) : Math.max(50, (rack.widthMeters || 1.2) * 28);

      const rackX = marginX + (rack.x / 100) * planW - rackW / 2;
      const rackY = marginY + (rack.z / 100) * planH - rackH / 2;

      // Rack fill
      ctx.fillStyle = '#0f2942';
      ctx.fillRect(rackX, rackY, rackW, rackH);

      // Steel outer frame
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(rackX, rackY, rackW, rackH);

      // Pallet Bay Subdivisions
      const bays = rack.slotsPerShelf || 4;
      ctx.strokeStyle = '#1e4976';
      ctx.lineWidth = 1.5;

      if (isRotated) {
        // Vertical rack running along depth
        const bayH = rackH / bays;
        for (let b = 1; b < bays; b++) {
          ctx.beginPath();
          ctx.moveTo(rackX, rackY + b * bayH);
          ctx.lineTo(rackX + rackW, rackY + b * bayH);
          ctx.stroke();
        }
      } else {
        // Horizontal rack
        const bayW = rackW / bays;
        for (let b = 1; b < bays; b++) {
          ctx.beginPath();
          ctx.moveTo(rackX + b * bayW, rackY);
          ctx.lineTo(rackX + b * bayW, rackY + rackH);
          ctx.stroke();
        }
      }

      // Corner Upright Post circles (CAD structural standard)
      ctx.fillStyle = '#38bdf8';
      const postRadius = 4;
      [
        [rackX + 4, rackY + 4],
        [rackX + rackW - 4, rackY + 4],
        [rackX + 4, rackY + rackH - 4],
        [rackX + rackW - 4, rackY + rackH - 4],
      ].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, postRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rack Label Plate
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const rackLabel = rack.rackName || `${rack.zone || 'R'}${String(rIdx + 1).padStart(2, '0')}`;
      ctx.fillText(rackLabel, rackX + rackW / 2, rackY + rackH / 2);
    });
  }

  // 7. Architectural Dimension Lines with Arrows (บอกระยะมิติแปลน)
  const drawDimensionLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    text: string,
    isHorizontal: boolean
  ) => {
    ctx.strokeStyle = '#60a5fa';
    ctx.fillStyle = '#60a5fa';
    ctx.lineWidth = 1.5;

    // Main line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 45-degree architect tick marks
    const tick = 8;
    ctx.beginPath();
    ctx.moveTo(x1 - tick, y1 - tick);
    ctx.lineTo(x1 + tick, y1 + tick);
    ctx.moveTo(x2 - tick, y2 - tick);
    ctx.lineTo(x2 + tick, y2 + tick);
    ctx.stroke();

    // Text
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isHorizontal) {
      ctx.fillText(text, (x1 + x2) / 2, y1 - 16);
    } else {
      ctx.save();
      ctx.translate(x1 - 20, (y1 + y2) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  };

  const bW = data.estimatedBuildingWidthMeters || 42;
  const bD = data.estimatedBuildingDepthMeters || 32;

  // Bottom Dimension Line (Width)
  drawDimensionLine(marginX, marginY + planH + 45, marginX + planW, marginY + planH + 45, `TOTAL WIDTH: ${bW.toFixed(1)} m`, true);

  // Left Dimension Line (Depth)
  drawDimensionLine(marginX - 45, marginY, marginX - 45, marginY + planH, `TOTAL DEPTH: ${bD.toFixed(1)} m`, false);

  // 8. Official CAD Engineering Title Block (มุมขวาล่าง)
  const tbW = 440;
  const tbH = 110;
  const tbX = canvas.width - tbW - 25;
  const tbY = canvas.height - tbH - 25;

  ctx.fillStyle = '#08142b';
  ctx.fillRect(tbX, tbY, tbW, tbH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(tbX, tbY, tbW, tbH);

  // Internal dividing lines
  ctx.beginPath();
  ctx.moveTo(tbX, tbY + 40);
  ctx.lineTo(tbX + tbW, tbY + 40);
  ctx.moveTo(tbX + 240, tbY + 40);
  ctx.lineTo(tbX + 240, tbY + tbH);
  ctx.stroke();

  // Title Block Texts
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📐 MATCHSTOCK WMS - DIGITAL TWIN', tbX + 16, tbY + 26);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('DRAWING: STANDARDIZED ARCHITECTURAL PLAN', tbX + 16, tbY + 62);
  ctx.fillText(`DATE: ${new Date().toLocaleDateString('th-TH')}`, tbX + 16, tbY + 84);
  ctx.fillText('SCALE: 1 : 100 (METRIC)', tbX + 16, tbY + 102);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('STATUS: CAD STANDARDIZED', tbX + 250, tbY + 62);
  ctx.fillStyle = '#10b981';
  ctx.fillText('ENGINE: GEMINI 3.5 VISION', tbX + 250, tbY + 84);
  ctx.fillStyle = '#a855f7';
  ctx.fillText('AUTO-BUILT 3D READY', tbX + 250, tbY + 102);

  return canvas.toDataURL('image/png');
}
