import * as THREE from 'three';
import { SeededRandom } from './noise';

export interface CustomHouseConfig {
  seed: number;
  width: number;          // 0.4 to 1.5
  length: number;         // 0.4 to 1.5
  height: number;         // 0.3 to 1.5
  roofType: 'cone' | 'gabled' | 'flat' | 'spire';
  roofHeight: number;     // 0.15 to 1.2
  roofOverhang: number;   // 0 to 0.4
  wallColor: string;
  roofColor: string;
  doorColor: string;
  windowGlowColor: string;
  windowCount: number;    // 1 to 4
  hasChimney: boolean;
  chimneyHeight: number;  // 0.1 to 0.5
  hasPorch: boolean;
  stylePreset: 'cabin' | 'modern' | 'castle' | 'wizard' | 'nordic';
}

export const HOUSE_PRESETS: Record<CustomHouseConfig['stylePreset'], Omit<CustomHouseConfig, 'seed' | 'stylePreset'>> = {
  cabin: {
    width: 0.6,
    length: 0.6,
    height: 0.45,
    roofType: 'cone',
    roofHeight: 0.35,
    roofOverhang: 0.08,
    wallColor: '#b23b3b', // Red barn wood
    roofColor: '#3d3530', // Dark grey charcoal shingles
    doorColor: '#5c3d2e', // Forest brown
    windowGlowColor: '#fde047', // Warm yellow
    windowCount: 2,
    hasChimney: true,
    chimneyHeight: 0.28,
    hasPorch: false,
  },
  modern: {
    width: 0.75,
    length: 0.75,
    height: 0.6,
    roofType: 'flat',
    roofHeight: 0.06,
    roofOverhang: 0.15,
    wallColor: '#e2e8f0', // Clean white slate
    roofColor: '#1e293b', // Deep graphite black
    doorColor: '#0f172a', // Jet black minimalist door
    windowGlowColor: '#38bdf8', // Blue neon glow
    windowCount: 4,
    hasChimney: false,
    chimneyHeight: 0.1,
    hasPorch: true,
  },
  castle: {
    width: 0.7,
    length: 0.7,
    height: 1.1, // Tall stone towers
    roofType: 'cone',
    roofHeight: 0.5,
    roofOverhang: 0.04,
    wallColor: '#64748b', // Slate grey castle stones
    roofColor: '#7f1d1d', // Dark red wizard spire
    doorColor: '#451a03', // Heavy iron oak door
    windowGlowColor: '#a855f7', // Mystic purple
    windowCount: 3,
    hasChimney: true,
    chimneyHeight: 0.35,
    hasPorch: false,
  },
  wizard: {
    width: 0.5,
    length: 0.5,
    height: 0.8,
    roofType: 'spire', // High pointed wizard spire
    roofHeight: 1.0,
    roofOverhang: 0.12,
    wallColor: '#4c1d95', // Deep purple magic
    roofColor: '#111827', // Black spire
    doorColor: '#d97706', // Gold door
    windowGlowColor: '#22c55e', // Emerald green magic light
    windowCount: 2,
    hasChimney: true,
    chimneyHeight: 0.45,
    hasPorch: false,
  },
  nordic: {
    width: 0.55,
    length: 0.85, // elongated lodge
    height: 0.42,
    roofType: 'gabled', // classic high slope A-frame
    roofHeight: 0.75,
    roofOverhang: 0.22,
    wallColor: '#0c4a6e', // Arctic ocean blue wood
    roofColor: '#b91c1c', // Classic Swedish Falun red shingles
    doorColor: '#e2e8f0', // Birch door
    windowGlowColor: '#fdba74', // Soft amber glow
    windowCount: 3,
    hasChimney: true,
    chimneyHeight: 0.3,
    hasPorch: true,
  }
};

export function buildCustomHouse(config: CustomHouseConfig): THREE.Group {
  const group = new THREE.Group();
  group.name = 'custom-procedural-house';

  const rng = new SeededRandom(config.seed);

  // 1. Materials
  const wallsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.wallColor),
    roughness: 0.75,
    metalness: 0.1,
    flatShading: true,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.roofColor),
    roughness: config.stylePreset === 'modern' ? 0.2 : 0.8,
    metalness: config.stylePreset === 'modern' ? 0.7 : 0.1,
    flatShading: true,
  });

  const doorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.doorColor),
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });

  const windowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.windowGlowColor),
    roughness: 0.1,
    metalness: 0.9,
    emissive: new THREE.Color(config.windowGlowColor),
    emissiveIntensity: 0.9,
  });

  // Small foundation stone material
  const baseMat = new THREE.MeshStandardMaterial({
    color: config.stylePreset === 'modern' ? '#334155' : '#78716c',
    roughness: 0.9,
    flatShading: true,
  });

  // 2. Foundation Stone Base (RPG style - taller and solid)
  const baseW = config.width * 1.08;
  const baseL = config.length * 1.08;
  const baseH = 0.15;
  const baseGeom = new THREE.BoxGeometry(baseW, baseH, baseL);
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = baseH / 2;
  base.receiveShadow = true;
  group.add(base);

  // Add some chunky corner stones for the foundation
  const cornerStoneGeom = new THREE.BoxGeometry(0.12, baseH * 1.1, 0.12);
  const cornerStoneMat = new THREE.MeshStandardMaterial({
    color: config.stylePreset === 'modern' ? '#475569' : '#57534e',
    roughness: 0.9,
    flatShading: true,
  });
  
  const stoneOffsets = [
    [-baseW/2, -baseL/2],
    [baseW/2, -baseL/2],
    [-baseW/2, baseL/2],
    [baseW/2, baseL/2],
  ];
  stoneOffsets.forEach(([sx, sz]) => {
    const stone = new THREE.Mesh(cornerStoneGeom, cornerStoneMat);
    stone.position.set(sx, baseH/2, sz);
    
    // Slight random rotation for rugged look
    stone.rotation.y = rng.range(-0.1, 0.1);
    group.add(stone);
  });

  // 3. Walls Box
  const wallsGeom = new THREE.BoxGeometry(config.width, config.height, config.length);
  const walls = new THREE.Mesh(wallsGeom, wallsMat);
  walls.position.y = baseH + config.height / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // --- NEW: Extension / Second Floor Overhang for RPG Look ---
  let hasExtension = false;
  let extW = 0, extH = 0, extL = 0;
  let extMesh: THREE.Mesh | null = null;
  
  if (config.stylePreset !== 'modern' && rng.next() > 0.4) {
    hasExtension = true;
    extW = config.width * rng.range(0.4, 0.7);
    extH = config.height * rng.range(0.5, 0.8);
    extL = config.length * rng.range(0.4, 0.7);
    
    const extGeom = new THREE.BoxGeometry(extW, extH, extL);
    extMesh = new THREE.Mesh(extGeom, wallsMat);
    
    // Attach to either left, right, or back
    const side = Math.floor(rng.range(0, 3));
    if (side === 0) {
      // Right side
      extMesh.position.set(config.width/2 + extW/2 - 0.05, baseH + extH/2, 0);
    } else if (side === 1) {
      // Left side
      extMesh.position.set(-config.width/2 - extW/2 + 0.05, baseH + extH/2, 0);
    } else {
      // Back side
      extMesh.position.set(0, baseH + extH/2, -config.length/2 - extL/2 + 0.05);
    }
    extMesh.castShadow = true;
    extMesh.receiveShadow = true;
    group.add(extMesh);

    // Extension Roof
    if (config.roofType === 'gabled') {
      const extRoofH = extH * 0.6;
      const tShape = new THREE.Shape();
      tShape.moveTo(-extW/2 - config.roofOverhang, 0);
      tShape.lineTo(0, extRoofH);
      tShape.lineTo(extW/2 + config.roofOverhang, 0);
      tShape.closePath();
      
      const extExtrude = { steps: 1, depth: extL + config.roofOverhang, bevelEnabled: false };
      const eRoofGeom = new THREE.ExtrudeGeometry(tShape, extExtrude);
      const eRoof = new THREE.Mesh(eRoofGeom, roofMat);
      eRoof.position.set(extMesh.position.x, baseH + extH, extMesh.position.z - extL/2 - config.roofOverhang/2);
      eRoof.castShadow = true;
      group.add(eRoof);
    } else {
      const eRoofGeom = new THREE.ConeGeometry(Math.max(extW, extL)*0.7, extH*0.5, 4);
      const eRoof = new THREE.Mesh(eRoofGeom, roofMat);
      eRoof.position.set(extMesh.position.x, baseH + extH + (extH*0.5)/2, extMesh.position.z);
      eRoof.rotation.y = Math.PI / 4;
      eRoof.castShadow = true;
      group.add(eRoof);
    }
  }

  // Optional Second Floor Overhang (Jettying)
  if (config.stylePreset !== 'modern' && config.height > 0.8 && rng.next() > 0.5) {
    const floor2H = config.height * 0.45;
    const floor2W = config.width * 1.1; // overhangs
    const floor2L = config.length * 1.1;
    const f2Geom = new THREE.BoxGeometry(floor2W, floor2H, floor2L);
    const f2 = new THREE.Mesh(f2Geom, wallsMat);
    f2.position.y = baseH + config.height; 
    f2.castShadow = true;
    f2.receiveShadow = true;
    group.add(f2);
    
    // Add Corbels (wooden supports under the overhang)
    const corbelGeom = new THREE.BoxGeometry(0.04, 0.15, 0.15);
    const corbelMat = new THREE.MeshStandardMaterial({ color: config.doorColor, roughness: 0.9, flatShading: true });
    const corbelY = baseH + config.height - 0.075;
    
    // Front and back corbels
    [-config.width/2 + 0.1, 0, config.width/2 - 0.1].forEach(cx => {
      // Front
      const cFront = new THREE.Mesh(corbelGeom, corbelMat);
      cFront.position.set(cx, corbelY, config.length/2 + 0.02);
      group.add(cFront);
      // Back
      const cBack = new THREE.Mesh(corbelGeom, corbelMat);
      cBack.position.set(cx, corbelY, -config.length/2 - 0.02);
      group.add(cBack);
    });

    // Left and right corbels
    const corbelGeomSide = new THREE.BoxGeometry(0.15, 0.15, 0.04);
    [-config.length/2 + 0.1, 0, config.length/2 - 0.1].forEach(cz => {
      // Left
      const cLeft = new THREE.Mesh(corbelGeomSide, corbelMat);
      cLeft.position.set(-config.width/2 - 0.02, corbelY, cz);
      group.add(cLeft);
      // Right
      const cRight = new THREE.Mesh(corbelGeomSide, corbelMat);
      cRight.position.set(config.width/2 + 0.02, corbelY, cz);
      group.add(cRight);
    });

    // Adjust main roof height because we added a second floor
    config.height += floor2H; 
  }


  // 4. Roof construction based on roofType
  let roofMesh: THREE.Mesh;
  const roofYStart = baseH + config.height;

  if (config.roofType === 'flat') {
    // Modern flat slab roof
    const rw = config.width + config.roofOverhang * 2;
    const rl = config.length + config.roofOverhang * 2;
    const rh = config.roofHeight;
    const roofGeom = new THREE.BoxGeometry(rw, rh, rl);
    roofMesh = new THREE.Mesh(roofGeom, roofMat);
    roofMesh.position.y = roofYStart + rh / 2;
  } else if (config.roofType === 'gabled') {
    // A-Frame triangle prism using a custom extruded shape or a prism geometry
    // For simplicity, we can build a custom extruded geometry or custom buffer shape
    const rw = config.width + config.roofOverhang * 2;
    const rl = config.length + config.roofOverhang * 1.3;
    const rh = config.roofHeight;

    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(-rw / 2, 0);
    triangleShape.lineTo(0, rh);
    triangleShape.lineTo(rw / 2, 0);
    triangleShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: rl,
      bevelEnabled: false,
    };
    const roofGeom = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
    roofMesh = new THREE.Mesh(roofGeom, roofMat);
    
    // Extrude builds along Z. Position to cover center of house.
    roofMesh.position.set(0, roofYStart, -rl / 2);
    // Be sure shadow maps work
    roofMesh.castShadow = true;

    // Add Dormer Windows for RPG feel
    if (config.stylePreset !== 'modern' && rng.next() > 0.5) {
      const dormerW = 0.2;
      const dormerH = 0.2;
      const dormerL = 0.3;
      const dormerGeom = new THREE.BoxGeometry(dormerW, dormerH, dormerL);
      const dormerWall = new THREE.Mesh(dormerGeom, wallsMat);
      
      const dx = config.width * rng.range(0.1, 0.3) * (rng.next() > 0.5 ? 1 : -1);
      const dy = roofYStart + dormerH/2;
      // put on the front side of the roof
      const dz = config.length/2 - dormerL/2 + 0.05;
      dormerWall.position.set(dx, dy, dz);
      dormerWall.castShadow = true;
      group.add(dormerWall);

      const dRoofGeom = new THREE.ConeGeometry(dormerW*0.7, dormerH, 4);
      const dRoof = new THREE.Mesh(dRoofGeom, roofMat);
      dRoof.rotation.y = Math.PI / 4;
      dRoof.position.set(dx, dy + dormerH, dz);
      dRoof.castShadow = true;
      group.add(dRoof);

      // tiny dormer window
      const dWinGeom = new THREE.PlaneGeometry(0.1, 0.1);
      const dWin = new THREE.Mesh(dWinGeom, windowMat);
      dWin.position.set(dx, dy, dz + dormerL/2 + 0.01);
      group.add(dWin);
    }
  } else if (config.roofType === 'spire') {
    // Ultra tall pointed cone (8 sides)
    const rad = Math.max(config.width, config.length) * 0.65 + config.roofOverhang;
    const rh = config.roofHeight;
    const roofGeom = new THREE.ConeGeometry(rad, rh, 8);
    roofMesh = new THREE.Mesh(roofGeom, roofMat);
    roofMesh.position.y = roofYStart + rh / 2;
    roofMesh.rotation.y = Math.PI / 8;
  } else {
    // Standard pyramid/cone (4 sides)
    const rad = Math.max(config.width, config.length) * 0.72 + config.roofOverhang;
    const rh = config.roofHeight;
    const roofGeom = new THREE.ConeGeometry(rad, rh, 4);
    roofMesh = new THREE.Mesh(roofGeom, roofMat);
    roofMesh.position.y = roofYStart + rh / 2;
    roofMesh.rotation.y = Math.PI / 4; // Align flat with the walls
  }

  roofMesh.castShadow = true;
  group.add(roofMesh);

  // 5. Chimney
  if (config.hasChimney) {
    const chW = 0.09;
    const chH = config.chimneyHeight;
    const chimneyGeom = new THREE.BoxGeometry(chW, chH, chW);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: config.stylePreset === 'modern' ? '#334155' : '#8b5a2b', // Brick or dark stone
      roughness: 0.9,
      flatShading: true,
    });
    const chimney = new THREE.Mesh(chimneyGeom, chimneyMat);
    
    // Position randomly on the left-back or right-back quadrant
    const offX = rng.range(0.12, 0.22) * (rng.next() > 0.5 ? 1 : -1);
    const offZ = rng.range(0.12, 0.22) * (rng.next() > 0.5 ? 1 : -1);
    const chY = roofYStart + config.roofHeight * 0.45;
    
    chimney.position.set(offX, chY, offZ);
    chimney.castShadow = true;
    group.add(chimney);

    // Smoke particle puffs!
    const smokeMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.95,
      transparent: true,
      opacity: 0.65,
      flatShading: true,
    });
    const puffsCount = Math.floor(rng.range(2, 4));
    for (let p = 0; p < puffsCount; p++) {
      const puffGeom = new THREE.DodecahedronGeometry(rng.range(0.04, 0.08), 0);
      const puff = new THREE.Mesh(puffGeom, smokeMat);
      puff.position.set(
        offX + rng.range(-0.03, 0.03),
        chY + chH / 2 + 0.06 + p * 0.08,
        offZ + rng.range(-0.03, 0.03)
      );
      group.add(puff);
    }
  }

  // 6. Door
  const doorW = Math.min(config.width * 0.3, 0.2);
  const doorH = Math.min(config.height * 0.7, 0.35);
  const doorD = 0.02;
  const doorGeom = new THREE.BoxGeometry(doorW, doorH, doorD);
  const door = new THREE.Mesh(doorGeom, doorMat);
  
  // Position door at front center
  door.position.set(0, baseH + doorH / 2, config.length / 2 + doorD / 2);
  group.add(door);

  // Door Step
  const stepW = doorW * 1.5;
  const stepL = 0.15;
  const stepH = baseH * 0.6;
  const stepGeom = new THREE.BoxGeometry(stepW, stepH, stepL);
  const step = new THREE.Mesh(stepGeom, baseMat);
  step.position.set(0, stepH / 2, config.length / 2 + stepL / 2 + 0.01);
  group.add(step);

  // Small brass doorknob
  const knobGeom = new THREE.SphereGeometry(0.015, 4, 4);
  const knobMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.1, metalness: 0.9 });
  const knob = new THREE.Mesh(knobGeom, knobMat);
  knob.position.set(doorW * 0.3, baseH + doorH / 2, config.length / 2 + doorD * 1.5);
  group.add(knob);

  // 7. Windows
  const winSize = Math.min(config.width * 0.22, config.height * 0.4, 0.16);
  const windowGeom = new THREE.BoxGeometry(winSize, winSize, 0.02);

  // Distribute windows on sides based on windowCount
  // 1: front left, 2: front left & right, 3: front left, front right, and side, 4: all sides!
  const winY = baseH + config.height * 0.58;

  let w1: THREE.Mesh | null = null;
  let w2: THREE.Mesh | null = null;
  let w3: THREE.Mesh | null = null;
  let w4: THREE.Mesh | null = null;

  if (config.windowCount >= 1) {
    // Front Left window
    w1 = new THREE.Mesh(windowGeom, windowMat);
    w1.position.set(-config.width * 0.26, winY, config.length / 2 + 0.011);
    group.add(w1);
  }
  if (config.windowCount >= 2) {
    // Front Right window
    w2 = new THREE.Mesh(windowGeom, windowMat);
    w2.position.set(config.width * 0.26, winY, config.length / 2 + 0.011);
    group.add(w2);
  }
  if (config.windowCount >= 3) {
    // Side Left window (rotated along Y)
    w3 = new THREE.Mesh(windowGeom, windowMat);
    w3.rotation.y = Math.PI / 2;
    w3.position.set(-config.width / 2 - 0.011, winY, 0);
    group.add(w3);
  }
  if (config.windowCount >= 4) {
    // Side Right window (rotated along Y)
    w4 = new THREE.Mesh(windowGeom, windowMat);
    w4.rotation.y = Math.PI / 2;
    w4.position.set(config.width / 2 + 0.011, winY, 0);
    group.add(w4);
  }

  // 8. Porch (Veranda / Deck)
  if (config.hasPorch) {
    const porchW = config.width * 0.88;
    const porchL = 0.25;
    const porchH = baseH;
    const porchGeom = new THREE.BoxGeometry(porchW, porchH, porchL);
    
    // Match door wood color
    const porch = new THREE.Mesh(porchGeom, doorMat);
    porch.position.set(0, porchH / 2, config.length / 2 + porchL / 2);
    porch.receiveShadow = true;
    group.add(porch);

    // Add 2 tiny wooden posts/beams supporting the roof overhang!
    const postRad = 0.016;
    const postH = config.height;
    const postGeom = new THREE.CylinderGeometry(postRad, postRad, postH, 5);
    const postL = new THREE.Mesh(postGeom, doorMat);
    const postR = new THREE.Mesh(postGeom, doorMat);

    postL.castShadow = true;
    postR.castShadow = true;

    postL.position.set(-porchW / 2 + postRad * 1.5, baseH + postH / 2, config.length / 2 + porchL - postRad * 1.5);
    postR.position.set(porchW / 2 - postRad * 1.5, baseH + postH / 2, config.length / 2 + porchL - postRad * 1.5);

    group.add(postL, postR);
  }

// Standard visually comfortable scale factor - upgraded for RPG scale
  group.scale.set(1.4, 1.4, 1.4);

  // --- EXTRA RPG DETAILS ---

  // A. Window Frames & Sills
  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.doorColor),
    roughness: 0.9,
    flatShading: true,
  });

  const frameDepth = 0.04;
  const frameThickness = 0.03;

  // Shared frame geometries across all window instances
  const tbGeom = new THREE.BoxGeometry(winSize + frameThickness * 2, frameThickness, frameDepth);
  const lrGeom = new THREE.BoxGeometry(frameThickness, winSize, frameDepth);
  const crossGeom = new THREE.BoxGeometry(frameThickness * 0.8, winSize, frameDepth * 0.8);
  const crossGeom2 = new THREE.BoxGeometry(winSize, frameThickness * 0.8, frameDepth * 0.8);

  const addWindowFrame = (winMesh: THREE.Mesh) => {
    const frameGroup = new THREE.Group();
    frameGroup.position.copy(winMesh.position);
    frameGroup.rotation.copy(winMesh.rotation);

    // Top & Bottom
    const top = new THREE.Mesh(tbGeom, frameMat);
    top.position.y = winSize / 2 + frameThickness / 2;
    const bottom = new THREE.Mesh(tbGeom, frameMat);
    bottom.position.y = -winSize / 2 - frameThickness / 2;
    
    // Left & Right
    const left = new THREE.Mesh(lrGeom, frameMat);
    left.position.x = -winSize / 2 - frameThickness / 2;
    const right = new THREE.Mesh(lrGeom, frameMat);
    right.position.x = winSize / 2 + frameThickness / 2;

    // Crossbar
    const cross1 = new THREE.Mesh(crossGeom, frameMat);
    const cross2 = new THREE.Mesh(crossGeom2, frameMat);

    frameGroup.add(top, bottom, left, right, cross1, cross2);
    group.add(frameGroup);
  };

  if (w1) addWindowFrame(w1);
  if (w2) addWindowFrame(w2);
  if (w3) addWindowFrame(w3);
  if (w4) addWindowFrame(w4);

  // B. Tudor Timber Framing (Beams on walls)
  if (config.stylePreset !== 'modern' && config.stylePreset !== 'castle') {
    const beamThickness = 0.04;
    
    // Corner posts
    const cornerGeom = new THREE.BoxGeometry(beamThickness, config.height, beamThickness);
    const corners = [
      [-config.width/2 - 0.01, -config.length/2 - 0.01],
      [config.width/2 + 0.01, -config.length/2 - 0.01],
      [-config.width/2 - 0.01, config.length/2 + 0.01],
      [config.width/2 + 0.01, config.length/2 + 0.01],
    ];
    
    corners.forEach(([cx, cz]) => {
      const post = new THREE.Mesh(cornerGeom, frameMat);
      post.position.set(cx, baseH + config.height / 2, cz);
      group.add(post);
    });

    // Horizontal bands
    const bandGeomX = new THREE.BoxGeometry(config.width + 0.04, beamThickness, beamThickness);
    const bandGeomZ = new THREE.BoxGeometry(beamThickness, beamThickness, config.length + 0.04);
    
    [0.1, 0.5, 0.9].forEach(hPerc => {
      const hY = baseH + config.height * hPerc;
      
      const frontBand = new THREE.Mesh(bandGeomX, frameMat);
      frontBand.position.set(0, hY, config.length/2 + 0.01);
      
      const backBand = new THREE.Mesh(bandGeomX, frameMat);
      backBand.position.set(0, hY, -config.length/2 - 0.01);
      
      const leftBand = new THREE.Mesh(bandGeomZ, frameMat);
      leftBand.position.set(-config.width/2 - 0.01, hY, 0);
      
      const rightBand = new THREE.Mesh(bandGeomZ, frameMat);
      rightBand.position.set(config.width/2 + 0.01, hY, 0);
      
      group.add(frontBand, backBand, leftBand, rightBand);
    });
  }

  // C. Roof Trim & Detail
  if (config.roofType === 'gabled') {
    // Add thick wooden trim along the edges of the gable
    const trimGeom = new THREE.BoxGeometry(0.08, config.roofHeight + 0.1, config.length + config.roofOverhang * 1.4);
    const trim = new THREE.Mesh(trimGeom, frameMat);
    trim.position.set(0, roofYStart + config.roofHeight / 2 - 0.05, 0);
    // group.add(trim); // Actually, a simple box won't fit perfectly. 
    // Let's add a decorative ridge beam instead.
    const ridgeGeom = new THREE.BoxGeometry(0.1, 0.1, config.length + config.roofOverhang * 2.2);
    const ridge = new THREE.Mesh(ridgeGeom, frameMat);
    ridge.position.set(0, roofYStart + config.roofHeight + 0.02, -config.length/2 - config.roofOverhang * 0.65 + (config.length + config.roofOverhang*1.3)/2);
    group.add(ridge);
  }

  // D. Lantern by the door
  const lanternGeom = new THREE.CylinderGeometry(0.03, 0.02, 0.06, 6);
  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#fbbf24',
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  const lantern = new THREE.Mesh(lanternGeom, lanternMat);
  lantern.position.set(-doorW * 0.8, baseH + doorH * 0.8, config.length / 2 + 0.04);
  
  const lanternTop = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.04, 4), frameMat);
  lanternTop.position.set(0, 0.05, 0);
  lantern.add(lanternTop);
  
  group.add(lantern);

  // E. RPG Exterior Props (Barrels, crates, awning)
  if (config.stylePreset !== 'modern') {
    // Add an Awning over the door maybe?
    if (rng.next() > 0.5) {
      const awningW = doorW * 1.8;
      const awningL = 0.15;
      const awningGeom = new THREE.BoxGeometry(awningW, 0.02, awningL);
      const awningMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.9, flatShading: true }); // red fabric color
      const awning = new THREE.Mesh(awningGeom, awningMat);
      awning.position.set(0, baseH + doorH + 0.06, config.length/2 + awningL/2);
      awning.rotation.x = 0.2;
      group.add(awning);
      
      // supports for awning
      const supportGeom = new THREE.CylinderGeometry(0.01, 0.01, awningL * 1.4, 4);
      const supL = new THREE.Mesh(supportGeom, frameMat);
      supL.position.set(-awningW/2 + 0.02, baseH + doorH + 0.02, config.length/2 + awningL/2);
      supL.rotation.x = -Math.PI/4;
      
      const supR = new THREE.Mesh(supportGeom, frameMat);
      supR.position.set(awningW/2 - 0.02, baseH + doorH + 0.02, config.length/2 + awningL/2);
      supR.rotation.x = -Math.PI/4;
      
      group.add(supL, supR);
    }
    
    // Add some barrels next to the house!
    const barrelCount = Math.floor(rng.range(0, 4));
    const barrelGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.15, 8);
    const barrelMat = new THREE.MeshStandardMaterial({ color: '#5c3104', roughness: 0.9, flatShading: true });
    const bandMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7, metalness: 0.8 });
    const bandGeom = new THREE.CylinderGeometry(0.062, 0.062, 0.015, 8);
    
    for (let i = 0; i < barrelCount; i++) {
      const barrel = new THREE.Mesh(barrelGeom, barrelMat);
      // Place around the side or front
      const bx = config.width/2 * (rng.next() > 0.5 ? 1.1 : -1.1);
      const bz = config.length/2 * rng.range(-0.5, 0.8);
      barrel.position.set(bx + rng.range(-0.05, 0.05), baseH + 0.075, bz);
      
      // Add metal bands to the barrel
      const band1 = new THREE.Mesh(bandGeom, bandMat);
      band1.position.y = 0.04;
      const band2 = new THREE.Mesh(bandGeom, bandMat);
      band2.position.y = -0.04;
      barrel.add(band1, band2);
      
      // Maybe one is knocked over?
      if (rng.next() > 0.8) {
        barrel.rotation.z = Math.PI / 2;
        barrel.position.y = baseH + 0.06;
      }
      
      barrel.castShadow = true;
      group.add(barrel);
    }
  }

  return group;
}
