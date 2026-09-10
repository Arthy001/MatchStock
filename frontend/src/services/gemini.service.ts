/**
 * Gemini AI Blueprint Vision Service
 * ใช้โมเดล Gemini Flash-Lite เพื่อความประหยัด Token สูงสุดและรวดเร็ว
 */

export interface DetectedWall {
  startX: number; // 0 - 100 (% of warehouse width)
  startZ: number; // 0 - 100 (% of warehouse depth)
  endX: number;
  endZ: number;
  thicknessMeters?: number;
}

export interface DetectedDoor {
  x: number; // 0 - 100 (%)
  z: number; // 0 - 100 (%)
  widthMeters: number;
  label: string;
  type: 'inbound' | 'outbound' | 'general';
}

export interface DetectedRoom {
  id: string;
  name: string;
  label: string;
  type: 'restroom' | 'office' | 'utility';
  x: number; // 0 - 100 (% of warehouse width)
  z: number; // 0 - 100 (% of warehouse depth)
  widthPercent: number; // width in % of warehouse width
  depthPercent: number; // depth in % of warehouse depth
}

export interface DetectedRack {
  zone: string;
  rackName: string;
  x: number; // 0 - 100 (%)
  z: number; // 0 - 100 (%)
  startZ?: number; // 0 - 100 (%) where rack starts along depth
  endZ?: number; // 0 - 100 (%) where rack ends along depth
  startX?: number; // 0 - 100 (%) for horizontal racks
  endX?: number; // 0 - 100 (%) for horizontal racks
  widthMeters: number;
  depthMeters: number;
  heightMeters: number;
  rotationDegrees: number; // 0 or 90
  shelvesCount: number;
  slotsPerShelf: number;
}

export interface DetectedZoneSpec {
  shelvesCount: number; // 2, 3, 4, 5 levels
  slotsPerShelf: number; // 2, 4, 6, 8 bays
  heightMeters?: number;
  capacityKg?: number;
  notes?: string;
}

export interface BlueprintAnalysisResult {
  warehouseName?: string;
  estimatedBuildingWidthMeters: number;
  estimatedBuildingDepthMeters: number;
  walls: DetectedWall[];
  doors: DetectedDoor[];
  rooms?: DetectedRoom[];
  racks: DetectedRack[];
  zoneSpecs?: Record<string, DetectedZoneSpec>;
  summary: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// ใช้ Gemini 3.5 Flash-Lite ประหยัดที่สุดตามความต้องการของผู้ใช้
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash-lite';

export async function parseWarehouseBlueprintWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<BlueprintAnalysisResult> {
  const activeKey =
    (typeof window !== 'undefined'
      ? localStorage.getItem('gemini_api_key') || localStorage.getItem('VITE_GEMINI_API_KEY')
      : null) || GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error('กรุณาระบุ VITE_GEMINI_API_KEY ในไฟล์ .env');
  }

  // ป้องกันกรณีส่งค่าที่ไม่ใช่ string หรือ Event Object เข้ามา
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('ไม่พบข้อมูลรูปภาพแบบแปลน หรือรูปแบบข้อมูลรูปภาพไม่ถูกต้อง');
  }

  // Handle URL string if passed (e.g. /sample-blueprint.jpg or blob:...)
  let rawBase64 = imageBase64;
  if (imageBase64.startsWith('/') || imageBase64.startsWith('http') || imageBase64.startsWith('blob:')) {
    try {
      const res = await fetch(imageBase64);
      const blob = await res.blob();
      rawBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (blob.type) mimeType = blob.type;
    } catch (e) {
      console.warn('Failed to fetch image URL as blob, using raw string:', e);
    }
  }

  // Clean base64 data URL prefix if present
  const cleanBase64 = rawBase64.includes(',') ? rawBase64.split(',')[1] : rawBase64;

  const prompt = `You are an expert Architectural CAD and Warehouse Digital Twin Specialist.
Analyze the attached warehouse blueprint/floor plan image and extract the exact 3D structural layout, including automatic detection of shelf tiers and bay subdivisions.

Examine the image carefully:
1. Warehouse Title: Look at the drawing title block or header text (e.g. "Logistics Warehouse Floor Plan").
2. Loading Docks / Doors: Look at the front wall (usually with stairs/ramps labeled DOCK 01, DOCK 02). Extract their center X (0-100% of floor width).
3. Storage Racks & Zone Specification:
   - Identify all zones (e.g. ZONE A, ZONE B, ZONE C, Cold Storage, etc.).
   - Inspect any text annotations, legend, title block or notes on the drawing:
     * Look for tier/level indications (e.g. "3-Tier", "4-Level", "High-Bay 5 Tiers", "Cold Room", "H=4500", "L1-L3").
     * Count the bay subdivisions (pallet slots) along the rack column lines on the drawing (typically 4, 6, or 8 bays).
     * If a zone indicates cold storage or high-bay, infer 5 tiers (~7.2m).
     * If picking or mezzanine, infer 2 tiers (~3.2m).
     * Otherwise standard industrial selective pallet rack is 3 tiers (~4.5m) or 4 tiers (~5.9m).
    - CRITICAL RULES FOR HAND-DRAWN SKETCHES & BLUEPRINTS:
      * Letter "R" or "Rack" or "แร็ค": Storage rack. If user drew multiple boxes labeled "R", extract each individual rack with its center X (0-100%) and Z (0-100%).
      * Rack Sizing: If the user drew small/medium compact boxes for racks, set slotsPerShelf: 1 or 2, depthMeters: 3.2 to 4.5 meters, widthMeters: 1.2 meters, so the 3D rack fits inside the drawn box and does NOT become an oversized 13-meter megastructure!
      * Facility Rooms (ห้องน้ำ, OP, Office): Detect all rooms with handwritten labels such as "ห้องน้ำ", "ห้องสุขา", "WC", "Toilet", "OP", "Office", "ออฟฟิศ". Add each room to the "rooms" array with its center X, center Z, widthPercent, depthPercent, and type ("restroom" or "office")!
      * Bounding Box & Outer Walls: The outermost drawn rectangle is the warehouse boundary (X: 0-100%, Z: 0-100%).
      * Door / Dock: Any opening or symbol labeled "Door" or "Dock" is a loading dock/door.
      * DO NOT invent fake curved roads or highways across the warehouse.
      * Extract each rack and room position faithfully so the 3D model matches the sketch 1:1!
4. Provide "zoneSpecs" summarizing the detected shelvesCount, slotsPerShelf, and detected notes for each zone so the 3D model configures itself automatically without manual tweaking.

Return ONLY a valid JSON object matching this schema:
{
  "warehouseName": "Detected drawing title",
  "estimatedBuildingWidthMeters": 42,
  "estimatedBuildingDepthMeters": 32,
  "walls": [
    { "startX": 0, "startZ": 0, "endX": 100, "endZ": 0 },
    { "startX": 100, "startZ": 0, "endX": 100, "endZ": 100 },
    { "startX": 100, "startZ": 100, "endX": 0, "endZ": 100 },
    { "startX": 0, "startZ": 100, "endX": 0, "endZ": 0 }
  ],
  "doors": [
    { "x": 38, "z": 0, "widthMeters": 4.5, "label": "DOCK 01 (INBOUND)", "type": "inbound" },
    { "x": 62, "z": 0, "widthMeters": 4.5, "label": "DOCK 02 (OUTBOUND)", "type": "outbound" }
  ],
  "rooms": [
    {
      "id": "room-toilet",
      "name": "ห้องสุขาและห้องน้ำ",
      "label": "ห้องน้ำ (Restroom)",
      "type": "restroom",
      "x": 88,
      "z": 22,
      "widthPercent": 18,
      "depthPercent": 20
    },
    {
      "id": "room-office",
      "name": "ห้องควบคุมและออฟฟิศ",
      "label": "ออฟฟิศ (Control Room / OP)",
      "type": "office",
      "x": 88,
      "z": 78,
      "widthPercent": 18,
      "depthPercent": 22
    }
  ],
  "zoneSpecs": {
    "Zone A": { "shelvesCount": 4, "slotsPerShelf": 6, "heightMeters": 5.9, "notes": "ตรวจพบ 4 ชั้น และ 6 ช่องต่อแถวจากแบบแปลน CAD" },
    "Zone B": { "shelvesCount": 3, "slotsPerShelf": 6, "heightMeters": 4.5, "notes": "ตรวจพบ 3 ชั้นมาตรฐาน 6 ช่อง" },
    "Zone C": { "shelvesCount": 3, "slotsPerShelf": 4, "heightMeters": 4.5, "notes": "ตรวจพบ 3 ชั้น 4 ช่อง" }
  },
  "racks": [
    {
      "zone": "Zone A",
      "rackName": "A01-A02",
      "x": 16,
      "z": 59,
      "startZ": 28,
      "endZ": 90,
      "widthMeters": 2.2,
      "depthMeters": 20.2,
      "heightMeters": 5.9,
      "rotationDegrees": 90,
      "shelvesCount": 4,
      "slotsPerShelf": 6
    }
  ],
  "summary": "Thai summary of detected layout"
}`;

  const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${activeKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json',
    },
  };

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const resJson = await response.json();
  const textOutput = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('ไม่ได้รับข้อมูลผลลัพธ์จาก Gemini API');
  }

  let parsedData: BlueprintAnalysisResult;
  try {
    parsedData = JSON.parse(textOutput);
  } catch (parseErr) {
    const cleaned = textOutput.replace(/```json\s*|```/g, '').trim();
    parsedData = JSON.parse(cleaned);
  }

  // Ensure racks array exists
  if (!parsedData.racks) {
    parsedData.racks = [];
  }

  // Only if AI detected ZERO racks in image, provide a minimal 2-rack template
  if (parsedData.racks.length === 0) {
    parsedData.racks = [
      {
        zone: 'Zone A',
        rackName: 'A01',
        x: 40,
        z: 50,
        startZ: 25,
        endZ: 75,
        widthMeters: 1.2,
        depthMeters: 12,
        heightMeters: 4.5,
        rotationDegrees: 90,
        shelvesCount: 3,
        slotsPerShelf: 4,
      },
      {
        zone: 'Zone B',
        rackName: 'B01',
        x: 60,
        z: 50,
        startZ: 25,
        endZ: 75,
        widthMeters: 1.2,
        depthMeters: 12,
        heightMeters: 4.5,
        rotationDegrees: 90,
        shelvesCount: 3,
        slotsPerShelf: 4,
      },
    ];
  }

  // Ensure zoneSpecs dynamically matches the actual detected zones
  if (!parsedData.zoneSpecs) {
    parsedData.zoneSpecs = {};
  }
  const uniqueDetectedZones = Array.from(new Set(parsedData.racks.map((r) => r.zone || 'Zone A')));
  uniqueDetectedZones.forEach((z) => {
    if (!parsedData.zoneSpecs![z]) {
      const rackInZone = parsedData.racks.find((r) => r.zone === z);
      parsedData.zoneSpecs![z] = {
        shelvesCount: rackInZone?.shelvesCount || 3,
        slotsPerShelf: rackInZone?.slotsPerShelf || 4,
        heightMeters: rackInZone?.heightMeters || 4.5,
        notes: `โซน ${z}: ตรวจพบ ${parsedData.racks.filter((r) => r.zone === z).length} แถวจากภาพวาด`,
      };
    }
  });

  return parsedData;
}

