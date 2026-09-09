import * as THREE from 'three';
import { ThemeId } from '../types';
import { THEMES } from './themes';

// Helper to convert hex string to THREE.Color
function getThemeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Creates a procedurally generated, highly detailed tree mesh based on the selected theme.
 */
export function createTreeMesh(themeId: ThemeId, rng: () => number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'procedural-tree';

  const themeColors = THEMES[themeId] || THEMES.forest;
  const trunkColor = getThemeColor(themeColors.trunk);
  const leafColors = themeColors.canopy.map(getThemeColor);
  const selectedLeafColor = leafColors[Math.floor(rng() * leafColors.length)] || leafColors[0];

  // Base material for wood/trunk
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: trunkColor,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  // Base material for leaves/foliage
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: selectedLeafColor,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });

  // ----------------------------------------------------
  // FOREST/DEFAULT BIOME SPECIES
  // ----------------------------------------------------
  if (themeId === 'forest') {
    const speciesChoice = rng();

    if (speciesChoice < 0.2) {
      // 1. CARVALHO ANCESTRAL (Gnarled Ancient Oak)
      // Thick gnarly trunk with roots and gnarled branches, heavy canopy, and red apples
      
      // Main trunk
      const trunkHeight = 1.2 + rng() * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.08, 0.22, trunkHeight, 7);
      const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Root flares
      const rootCount = 4;
      for (let i = 0; i < rootCount; i++) {
        const rootLength = 0.25 + rng() * 0.15;
        const rootGeom = new THREE.CylinderGeometry(0.08, 0.02, rootLength, 4);
        const root = new THREE.Mesh(rootGeom, trunkMaterial);
        const angle = (i * Math.PI * 2) / rootCount + (rng() * 0.3 - 0.15);
        root.position.set(Math.cos(angle) * 0.15, 0.05, Math.sin(angle) * 0.15);
        root.rotation.set(Math.PI / 3.5, angle, 0);
        root.castShadow = true;
        group.add(root);
      }

      // Large gnarled branches
      const branchCount = 3;
      for (let i = 0; i < branchCount; i++) {
        const branchLength = 0.6 + rng() * 0.3;
        const branchGeom = new THREE.CylinderGeometry(0.04, 0.07, branchLength, 5);
        const branch = new THREE.Mesh(branchGeom, trunkMaterial);
        const angle = (i * Math.PI * 2) / branchCount + (rng() * 0.5 - 0.25);
        const branchHeight = trunkHeight * 0.55 + rng() * trunkHeight * 0.3;
        
        branch.position.set(Math.cos(angle) * 0.08, branchHeight, Math.sin(angle) * 0.08);
        branch.rotation.set(
          (0.6 + rng() * 0.4) * (rng() > 0.5 ? 1 : -1),
          angle,
          (0.6 + rng() * 0.4) * (rng() > 0.5 ? 1 : -1)
        );
        branch.castShadow = true;
        group.add(branch);

        // Branch tip leaf clumps
        const foliageSize = 0.45 + rng() * 0.15;
        const foliageGeom = new THREE.DodecahedronGeometry(foliageSize, 1);
        const foliage = new THREE.Mesh(foliageGeom, leafMaterial);
        
        // Calculate end point of branch
        const dir = new THREE.Vector3(0, 1, 0).applyEuler(branch.rotation).multiplyScalar(branchLength);
        foliage.position.copy(branch.position).add(dir);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        group.add(foliage);

        // Apples in each clump
        if (rng() > 0.3) {
          const appleMat = new THREE.MeshStandardMaterial({
            color: 0xd90429, // Shiny apple red
            roughness: 0.3,
            metalness: 0.1,
            flatShading: true
          });
          const appleCount = 2 + Math.floor(rng() * 3);
          for (let j = 0; j < appleCount; j++) {
            const appleGeom = new THREE.DodecahedronGeometry(0.04, 0);
            const apple = new THREE.Mesh(appleGeom, appleMat);
            const offsetAngle = rng() * Math.PI * 2;
            const offsetRadius = foliageSize * 0.95;
            apple.position.copy(foliage.position).add(new THREE.Vector3(
              Math.cos(offsetAngle) * offsetRadius,
              -rng() * foliageSize * 0.5,
              Math.sin(offsetAngle) * offsetRadius
            ));
            apple.castShadow = true;
            group.add(apple);
          }
        }
      }

      // Central top canopy
      const centralFoliageSize = 0.65 + rng() * 0.2;
      const centralFoliageGeom = new THREE.DodecahedronGeometry(centralFoliageSize, 1);
      const centralFoliage = new THREE.Mesh(centralFoliageGeom, leafMaterial);
      centralFoliage.position.set(0, trunkHeight + centralFoliageSize * 0.4, 0);
      centralFoliage.castShadow = true;
      centralFoliage.receiveShadow = true;
      group.add(centralFoliage);

    } else if (speciesChoice < 0.4) {
      // 2. CEREJEIRA JAPONESA (Cherry Blossom / Sakura)
      // Curved elegant trunk, beautiful fluffy pink blossoms, fallen blossom petals on the ground
      
      const trunkColorCherry = getThemeColor('#3d2f2b');
      const cherryTrunkMat = new THREE.MeshStandardMaterial({
        color: trunkColorCherry,
        roughness: 0.85,
        metalness: 0.15,
        flatShading: true
      });

      // Fluffy pink blossom materials
      const pinkBlossomColors = [getThemeColor('#ffb7c5'), getThemeColor('#ff8da1'), getThemeColor('#ff5e7e')];
      const selectedPinkColor = pinkBlossomColors[Math.floor(rng() * pinkBlossomColors.length)];
      
      const blossomMaterial = new THREE.MeshStandardMaterial({
        color: selectedPinkColor,
        roughness: 0.85,
        metalness: 0.05,
        flatShading: true,
      });

      // Curved trunk built from 3 connected segments
      const segmentHeight = 0.5;
      const segmentCount = 3;
      let currentPos = new THREE.Vector3(0, 0, 0);
      let angleOffset = rng() * Math.PI * 2;

      for (let i = 0; i < segmentCount; i++) {
        const segGeom = new THREE.CylinderGeometry(
          0.06 - i * 0.012, 
          0.09 - i * 0.012, 
          segmentHeight, 
          6
        );
        const segment = new THREE.Mesh(segGeom, cherryTrunkMat);
        
        segment.position.copy(currentPos).add(new THREE.Vector3(0, segmentHeight / 2, 0));
        segment.rotation.z = Math.sin(angleOffset + i * 0.8) * 0.22;
        segment.rotation.x = Math.cos(angleOffset + i * 0.8) * 0.22;
        segment.castShadow = true;
        segment.receiveShadow = true;
        group.add(segment);
        
        // Advance currentPos along the rotated cylinder axis
        const axisDir = new THREE.Vector3(0, segmentHeight, 0).applyEuler(segment.rotation);
        currentPos.add(axisDir);
      }

      // Add elegant branching arms spreading out
      const cherryBranchCount = 3;
      for (let i = 0; i < cherryBranchCount; i++) {
        const branchLength = 0.5 + rng() * 0.3;
        const branchGeom = new THREE.CylinderGeometry(0.025, 0.045, branchLength, 5);
        const branch = new THREE.Mesh(branchGeom, cherryTrunkMat);
        
        const angle = (i * Math.PI * 2) / cherryBranchCount + (rng() * 0.4 - 0.2);
        branch.position.copy(currentPos);
        branch.rotation.set(
          (0.7 + rng() * 0.3) * (rng() > 0.5 ? 1 : -1),
          angle,
          (0.7 + rng() * 0.3) * (rng() > 0.5 ? 1 : -1)
        );
        branch.castShadow = true;
        group.add(branch);

        // Blossom cloud at tip
        const blossomCloudGeom = new THREE.DodecahedronGeometry(0.38 + rng() * 0.12, 1);
        const blossomCloud = new THREE.Mesh(blossomCloudGeom, blossomMaterial);
        const bTip = new THREE.Vector3(0, 1, 0).applyEuler(branch.rotation).multiplyScalar(branchLength);
        blossomCloud.position.copy(currentPos).add(bTip);
        blossomCloud.castShadow = true;
        blossomCloud.receiveShadow = true;
        group.add(blossomCloud);
      }

      // Main blossom canopy at center top
      const centralBlossomGeom = new THREE.DodecahedronGeometry(0.55 + rng() * 0.15, 1);
      const centralBlossom = new THREE.Mesh(centralBlossomGeom, blossomMaterial);
      centralBlossom.position.copy(currentPos).add(new THREE.Vector3(0, 0.25, 0));
      centralBlossom.castShadow = true;
      centralBlossom.receiveShadow = true;
      group.add(centralBlossom);

      // Fallen petals on the ground under the canopy
      const petalMat = new THREE.MeshStandardMaterial({
        color: selectedPinkColor,
        roughness: 0.9,
        flatShading: true,
      });
      const petalCount = 5 + Math.floor(rng() * 6);
      for (let k = 0; k < petalCount; k++) {
        const petalGeom = new THREE.BoxGeometry(0.06 + rng() * 0.04, 0.005, 0.04 + rng() * 0.04);
        const petal = new THREE.Mesh(petalGeom, petalMat);
        const rad = 0.2 + rng() * 0.65;
        const pAngle = rng() * Math.PI * 2;
        petal.position.set(Math.cos(pAngle) * rad, 0.005, Math.sin(pAngle) * rad);
        petal.rotation.y = rng() * Math.PI;
        petal.rotation.z = rng() * 0.15;
        petal.castShadow = true;
        group.add(petal);
      }

    } else if (speciesChoice < 0.6) {
      // 3. SALGUEIRO CHORÃO (Weeping Willow)
      // Curved heavy trunk, elegant branching, drooping leaf chains cascades
      
      const trunkHeight = 1.3 + rng() * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.06, 0.18, trunkHeight, 6);
      const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Arching branches at top
      const branchCount = 4;
      const foliageMat = new THREE.MeshStandardMaterial({
        color: selectedLeafColor,
        roughness: 0.8,
        flatShading: true
      });

      for (let i = 0; i < branchCount; i++) {
        const angle = (i * Math.PI * 2) / branchCount + (rng() * 0.4 - 0.2);
        
        // Main canopy cluster for this branch
        const clusterPos = new THREE.Vector3(
          Math.cos(angle) * 0.5,
          trunkHeight + 0.1,
          Math.sin(angle) * 0.5
        );

        const leafPuffGeom = new THREE.DodecahedronGeometry(0.4 + rng() * 0.15, 0);
        const leafPuff = new THREE.Mesh(leafPuffGeom, foliageMat);
        leafPuff.position.copy(clusterPos);
        leafPuff.castShadow = true;
        group.add(leafPuff);

        // Branch wood connecting trunk to cluster
        const branchGeom = new THREE.CylinderGeometry(0.025, 0.05, 0.6, 4);
        const branch = new THREE.Mesh(branchGeom, trunkMaterial);
        branch.position.set(clusterPos.x * 0.5, trunkHeight - 0.1, clusterPos.z * 0.5);
        branch.lookAt(clusterPos);
        branch.rotateX(Math.PI / 2); // align
        branch.castShadow = true;
        group.add(branch);

        // Weeping leaf cascades hanging down from each puff edge
        const cascadeCount = 3 + Math.floor(rng() * 3);
        for (let j = 0; j < cascadeCount; j++) {
          const cAngle = (j * Math.PI * 2) / cascadeCount + (rng() * 0.5);
          const cDist = 0.25 + rng() * 0.15;
          const startPt = clusterPos.clone().add(new THREE.Vector3(
            Math.cos(cAngle) * cDist,
            -0.1,
            Math.sin(cAngle) * cDist
          ));

          const chainLength = 2 + Math.floor(rng() * 3);
          let prevY = startPt.y;
          for (let k = 0; k < chainLength; k++) {
            const h = 0.18 + rng() * 0.12;
            const w = 0.02 + rng() * 0.015;
            const d = 0.02 + rng() * 0.015;
            
            const dropGeom = new THREE.BoxGeometry(w, h, d);
            const drop = new THREE.Mesh(dropGeom, foliageMat);
            drop.position.set(
              startPt.x + (rng() * 0.06 - 0.03),
              prevY - h / 2,
              startPt.z + (rng() * 0.06 - 0.03)
            );
            drop.rotation.z = rng() * 0.15 - 0.075;
            drop.rotation.y = rng() * Math.PI;
            drop.castShadow = true;
            group.add(drop);
            
            prevY -= h * 0.85; // Chain overlap
          }
        }
      }

    } else if (speciesChoice < 0.8) {
      // 4. BORDO DE OUTONO (Autumn Maple)
      // Red, orange, and yellow foliage layers mixed dynamically
      
      const mapleTrunkMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#4a3525'),
        roughness: 0.9,
        flatShading: true
      });

      const trunkHeight = 1.1 + rng() * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.06, 0.14, trunkHeight, 6);
      const trunk = new THREE.Mesh(trunkGeom, mapleTrunkMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      const colors = [
        getThemeColor('#d00000'), // Vibrant Red
        getThemeColor('#f48c06'), // Warm Orange
        getThemeColor('#ffb703'), // Golden Yellow
        getThemeColor('#9d0208')  // Deep Crimson
      ];

      // Form 5 leaf puff nodes of different sizes and autumn colors
      const nodeCount = 6;
      for (let i = 0; i < nodeCount; i++) {
        const scale = 0.35 + rng() * 0.25;
        const color = colors[Math.floor(rng() * colors.length)];
        const nodeMat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.8,
          flatShading: true,
        });

        const puffGeom = new THREE.DodecahedronGeometry(scale, 1);
        const puff = new THREE.Mesh(puffGeom, nodeMat);

        // Position nodes in a tree crown
        const angle = rng() * Math.PI * 2;
        const rad = 0.15 + rng() * 0.35;
        const h = trunkHeight * 0.7 + rng() * 0.6;
        puff.position.set(Math.cos(angle) * rad, h, Math.sin(angle) * rad);
        puff.castShadow = true;
        puff.receiveShadow = true;
        group.add(puff);

        // Add a branch wood connect to trunk
        if (rad > 0.2) {
          const bGeom = new THREE.CylinderGeometry(0.02, 0.04, h * 0.5, 4);
          const b = new THREE.Mesh(bGeom, mapleTrunkMat);
          b.position.set(puff.position.x * 0.5, h * 0.7, puff.position.z * 0.5);
          b.lookAt(puff.position);
          b.rotateX(Math.PI / 2);
          b.castShadow = true;
          group.add(b);
        }
      }

      // Ground fallen autumn leaves
      const leafParticleCount = 6 + Math.floor(rng() * 5);
      for (let k = 0; k < leafParticleCount; k++) {
        const fallColor = colors[Math.floor(rng() * colors.length)];
        const particleMat = new THREE.MeshStandardMaterial({
          color: fallColor,
          roughness: 0.9,
          flatShading: true,
        });
        const particleGeom = new THREE.BoxGeometry(0.07, 0.006, 0.05);
        const particle = new THREE.Mesh(particleGeom, particleMat);
        const rad = 0.18 + rng() * 0.7;
        const pAngle = rng() * Math.PI * 2;
        particle.position.set(Math.cos(pAngle) * rad, 0.005, Math.sin(pAngle) * rad);
        particle.rotation.set(rng() * 0.1, rng() * Math.PI, rng() * 0.1);
        particle.castShadow = true;
        group.add(particle);
      }

    } else if (speciesChoice < 0.9) {
      // 5. VIDOEIRO ELEGANTE (Elegant Birch Tree)
      // Slender white trunk with realistic horizontal black patches and lime-green foliage
      
      const birchTrunkMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#f1f5f9'), // Off white bark
        roughness: 0.85,
        flatShading: true
      });
      
      const birchDarkKnotMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#1e293b'), // Deep grey/black for knots
        roughness: 0.9,
        flatShading: true
      });

      const trunkHeight = 1.4 + rng() * 0.5;
      const trunkGeom = new THREE.CylinderGeometry(0.045, 0.08, trunkHeight, 6);
      const trunk = new THREE.Mesh(trunkGeom, birchTrunkMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Add actual horizontal black bark notches wrapping the trunk!
      const notchCount = 8 + Math.floor(rng() * 6);
      for (let i = 0; i < notchCount; i++) {
        const nHeight = 0.015 + rng() * 0.015;
        const nWidth = 0.03 + rng() * 0.03;
        const nDepth = 0.045;
        const notchGeom = new THREE.BoxGeometry(nWidth, nHeight, nDepth);
        const notch = new THREE.Mesh(notchGeom, birchDarkKnotMat);
        
        const hOffset = trunkHeight * 0.1 + rng() * trunkHeight * 0.8;
        const nAngle = rng() * Math.PI * 2;
        
        // Place on the outer radius of trunk
        const r = 0.08 - (hOffset / trunkHeight) * 0.035;
        notch.position.set(Math.cos(nAngle) * r * 0.95, hOffset, Math.sin(nAngle) * r * 0.95);
        notch.rotation.y = -nAngle; // align radial surface
        notch.rotation.z = rng() * 0.2 - 0.1;
        notch.castShadow = true;
        group.add(notch);
      }

      // Tall layered lime green/birch green canopy
      const birchLeafColors = [getThemeColor('#52b788'), getThemeColor('#74c69d'), getThemeColor('#95d5b2')];
      const leafColor = birchLeafColors[Math.floor(rng() * birchLeafColors.length)];
      const birchLeafMat = new THREE.MeshStandardMaterial({
        color: leafColor,
        roughness: 0.75,
        flatShading: true
      });

      // 3 overlapping vertical egg-shaped puffs for foliage
      const puffCount = 3;
      let puffY = trunkHeight * 0.7;
      for (let j = 0; j < puffCount; j++) {
        const radiusX = 0.3 - j * 0.04 + rng() * 0.08;
        const radiusY = 0.45 - j * 0.05 + rng() * 0.08;
        const puffGeom = new THREE.DodecahedronGeometry(radiusX, 1);
        const puff = new THREE.Mesh(puffGeom, birchLeafMat);
        puff.scale.set(1.0, radiusY / radiusX, 1.0); // Make oval
        puff.position.set(rng() * 0.08 - 0.04, puffY, rng() * 0.08 - 0.04);
        puff.castShadow = true;
        puff.receiveShadow = true;
        group.add(puff);
        
        puffY += radiusY * 0.85;
      }

    } else {
      // 6. PINHEIRO-SILVESTRE (Scots Pine)
      // Tall straight trunk, tiered dark green needles with rugged offsets, pinecones
      const pineTrunkMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#783f04'), // Rich reddish pine trunk bark
        roughness: 0.95,
        flatShading: true
      });

      const trunkHeight = 1.4 + rng() * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.04, 0.11, trunkHeight, 6);
      const trunk = new THREE.Mesh(trunkGeom, pineTrunkMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Asymmetric needle-tier groupings
      const tierCount = 4;
      let baseWidth = 0.65 + rng() * 0.15;
      let startY = trunkHeight * 0.55;

      const darkPineLeafMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#1b4332'), // Deep pine green
        roughness: 0.8,
        flatShading: true
      });

      const coneColor = getThemeColor('#3e2723');
      const coneMat = new THREE.MeshStandardMaterial({
        color: coneColor,
        roughness: 0.9,
        flatShading: true
      });

      for (let i = 0; i < tierCount; i++) {
        const scale = 1.0 - i * 0.22;
        const tierHeight = 0.4 + rng() * 0.12;
        
        // Render 2 overlapping flat cones per tier for fuller look
        const coneGeom1 = new THREE.ConeGeometry(baseWidth * scale, tierHeight, 6);
        const cone1 = new THREE.Mesh(coneGeom1, darkPineLeafMat);
        // Slightly wobble/offset the cones for organic asymmetric look
        cone1.position.set(rng() * 0.06 - 0.03, startY + (tierHeight / 2), rng() * 0.06 - 0.03);
        cone1.rotation.y = rng() * Math.PI;
        cone1.rotation.x = rng() * 0.08 - 0.04;
        cone1.castShadow = true;
        cone1.receiveShadow = true;
        group.add(cone1);

        const coneGeom2 = new THREE.ConeGeometry(baseWidth * scale * 0.85, tierHeight * 0.8, 6);
        const cone2 = new THREE.Mesh(coneGeom2, darkPineLeafMat);
        cone2.position.set(cone1.position.x * 0.9, cone1.position.y + tierHeight * 0.15, cone1.position.z * 0.9);
        cone2.rotation.y = cone1.rotation.y + Math.PI / 6;
        cone2.castShadow = true;
        group.add(cone2);

        // Append 2-3 hanging pinecones under this needle tier
        const pconeCount = 2 + Math.floor(rng() * 2);
        for (let p = 0; p < pconeCount; p++) {
          const pconeGeom = new THREE.ConeGeometry(0.025, 0.06, 4);
          pconeGeom.rotateX(Math.PI); // hang downwards
          const pcone = new THREE.Mesh(pconeGeom, coneMat);
          
          const angle = (p * Math.PI * 2) / pconeCount + rng() * 0.5;
          const dist = baseWidth * scale * 0.65;
          pcone.position.set(
            cone1.position.x + Math.cos(angle) * dist,
            cone1.position.y - tierHeight / 2.2,
            cone1.position.z + Math.sin(angle) * dist
          );
          pcone.castShadow = true;
          group.add(pcone);
        }

        startY += tierHeight * 0.55;
      }
    }

  // ----------------------------------------------------
  // DESERT BIOME SPECIES
  // ----------------------------------------------------
  } else if (themeId === 'desert') {
    const speciesChoice = rng();

    if (speciesChoice < 0.4) {
      // 1. CACTO SAGUARO GIGANTE (Giant Saguaro Cactus)
      // Ribbed tall stems with spiky needles and desert flowers on tips
      const height = 1.3 + rng() * 0.5;
      const radius = 0.1 + rng() * 0.04;
      
      const cactusMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#2c6e49'), // Deep cactus green
        roughness: 0.95,
        flatShading: true,
      });

      // Main ribbed trunk (use a high polygon cylinder with a dome or flat cone cap)
      const stemGeom = new THREE.CylinderGeometry(radius, radius * 0.95, height, 8);
      const stem = new THREE.Mesh(stemGeom, cactusMat);
      stem.position.y = height / 2;
      stem.castShadow = true;
      stem.receiveShadow = true;
      group.add(stem);

      // Add vertical ribbed grooves using small dark thin cylinder strips
      const grooveMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#1f4d33'),
        roughness: 0.9,
      });
      const grooveCount = 6;
      for (let g = 0; g < grooveCount; g++) {
        const gAngle = (g * Math.PI * 2) / grooveCount;
        const grooveGeom = new THREE.CylinderGeometry(0.006, 0.006, height * 0.98, 3);
        const groove = new THREE.Mesh(grooveGeom, grooveMat);
        groove.position.set(Math.cos(gAngle) * radius * 0.98, height / 2, Math.sin(gAngle) * radius * 0.98);
        group.add(groove);
      }

      // Helper to add prickles
      const spineMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
      const spineGroupCount = 12;
      for (let s = 0; s < spineGroupCount; s++) {
        const sY = height * 0.15 + (s / spineGroupCount) * height * 0.7;
        const sAngle = (s * 2.4) % (Math.PI * 2);
        
        // 3 spines radiating out
        for (let sp = 0; sp < 3; sp++) {
          const spineGeom = new THREE.CylinderGeometry(0.002, 0.006, 0.08, 4);
          const spine = new THREE.Mesh(spineGeom, spineMat);
          spine.position.set(Math.cos(sAngle) * radius, sY, Math.sin(sAngle) * radius);
          spine.rotation.set(
            (rng() * 0.3 + 0.3) * (rng() > 0.5 ? 1 : -1),
            sAngle + (sp * 0.3 - 0.15),
            (rng() * 0.3 + 0.3) * (rng() > 0.5 ? 1 : -1)
          );
          spine.rotateX(Math.PI / 2); // point outward
          group.add(spine);
        }
      }

      // Staggered side arms curving upward
      const armCount = 2 + Math.floor(rng() * 2);
      for (let i = 0; i < armCount; i++) {
        const armSide = i % 2 === 0 ? 1 : -1;
        const armH = height * 0.4 + i * height * 0.18;
        const armThickness = radius * 0.85;
        const armLength = height * 0.25;

        // Horiz branch segment
        const horizGeom = new THREE.CylinderGeometry(armThickness, armThickness, armLength, 6);
        horizGeom.rotateZ(Math.PI / 2);
        const horizSegment = new THREE.Mesh(horizGeom, cactusMat);
        horizSegment.position.set(armSide * (radius + armLength * 0.4), armH, 0);
        horizSegment.castShadow = true;
        group.add(horizSegment);

        // Vert branch segment
        const vertHeight = armLength * 1.2;
        const vertGeom = new THREE.CylinderGeometry(armThickness, armThickness * 0.9, vertHeight, 6);
        const vertSegment = new THREE.Mesh(vertGeom, cactusMat);
        vertSegment.position.set(armSide * (radius + armLength * 0.8), armH + vertHeight * 0.4, 0);
        vertSegment.castShadow = true;
        group.add(vertSegment);

        // Add ribbed grooves on arms too
        for (let g = 0; g < 4; g++) {
          const ga = (g * Math.PI) / 2;
          const agGeom = new THREE.CylinderGeometry(0.005, 0.005, vertHeight * 0.95, 3);
          const ag = new THREE.Mesh(agGeom, grooveMat);
          ag.position.set(
            vertSegment.position.x + Math.cos(ga) * armThickness * 0.95,
            vertSegment.position.y,
            Math.sin(ga) * armThickness * 0.95
          );
          group.add(ag);
        }

        // Flower blossom on top of cactus arm tip!
        const flowerMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e, // Hot pink flower
          emissive: 0x9f1239,
          roughness: 0.8,
          flatShading: true
        });
        const flowerGeom = new THREE.ConeGeometry(0.08, 0.08, 5);
        const flower = new THREE.Mesh(flowerGeom, flowerMat);
        flower.position.set(vertSegment.position.x, vertSegment.position.y + vertHeight * 0.5 + 0.02, 0);
        flower.castShadow = true;
        group.add(flower);
      }

      // Blossom flower on central main stem top
      const flowerMatCenter = new THREE.MeshStandardMaterial({
        color: 0xfef08a, // Soft golden desert bloom
        emissive: 0xd97706,
        roughness: 0.8,
        flatShading: true
      });
      const topFlowerGeom = new THREE.ConeGeometry(radius * 0.9, radius * 0.7, 5);
      const topFlower = new THREE.Mesh(topFlowerGeom, flowerMatCenter);
      topFlower.position.set(0, height + radius * 0.3, 0);
      topFlower.castShadow = true;
      group.add(topFlower);

    } else if (speciesChoice < 0.7) {
      // 2. ÁRVORE DE JOSUÉ (Joshua Tree)
      // Crooked branching trunk, green spiky star-rosettes at every tip
      const trunkColorJoshua = getThemeColor('#8d5b4c');
      const joshuaTrunkMat = new THREE.MeshStandardMaterial({
        color: trunkColorJoshua,
        roughness: 0.95,
        flatShading: true,
      });

      const spikyFoliageMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#5c6038'), // Sage/olive spiky green
        roughness: 0.9,
        flatShading: true
      });

      // Construct gnarled crooking base trunk
      const segmentHeight = 0.45;
      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, segmentHeight, 5), joshuaTrunkMat);
      seg1.position.y = segmentHeight / 2;
      seg1.castShadow = true;
      seg1.receiveShadow = true;
      group.add(seg1);

      // Branch forks (Y shape)
      const forkHeight = segmentHeight;
      const forkCount = 2;
      
      for (let f = 0; f < forkCount; f++) {
        const side = f === 0 ? 1 : -1;
        const bRot = 0.55 * side;
        
        const branch1Geom = new THREE.CylinderGeometry(0.045, 0.065, segmentHeight * 1.1, 5);
        const branch1 = new THREE.Mesh(branch1Geom, joshuaTrunkMat);
        branch1.position.set(side * 0.12, segmentHeight + segmentHeight * 0.4, 0);
        branch1.rotation.z = bRot;
        branch1.rotation.y = rng() * Math.PI;
        branch1.castShadow = true;
        group.add(branch1);

        // Sub branches at tip of branch1
        const subForkCount = 2;
        const bTipPos = new THREE.Vector3(0, segmentHeight * 1.1, 0).applyEuler(branch1.rotation).add(branch1.position);
        
        for (let sf = 0; sf < subForkCount; sf++) {
          const sSide = sf === 0 ? 1 : -1;
          const subBranchGeom = new THREE.CylinderGeometry(0.025, 0.045, segmentHeight * 0.9, 4);
          const subBranch = new THREE.Mesh(subBranchGeom, joshuaTrunkMat);
          subBranch.position.copy(bTipPos);
          subBranch.rotation.set(
            (rng() * 0.4 + 0.3) * sSide,
            rng() * Math.PI,
            (rng() * 0.4 + 0.3) * sSide
          );
          subBranch.castShadow = true;
          group.add(subBranch);

          // Star rosette spike crown at tip of sub-branch
          const subBranchTip = new THREE.Vector3(0, segmentHeight * 0.9, 0).applyEuler(subBranch.rotation).add(bTipPos);
          
          const rosetteGroup = new THREE.Group();
          rosetteGroup.position.copy(subBranchTip);
          
          // Form spiked sphere made from 6 intersecting cones pointing outward
          for (let sp = 0; sp < 6; sp++) {
            const spikeCone = new THREE.ConeGeometry(0.06, 0.22, 4);
            const spike = new THREE.Mesh(spikeCone, spikyFoliageMat);
            const spikeRotY = (sp * Math.PI * 2) / 6;
            spike.rotation.set(Math.PI / 4, spikeRotY, rng() * 0.3);
            spike.castShadow = true;
            rosetteGroup.add(spike);
          }
          // Central green core sphere
          const rosetteCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), spikyFoliageMat);
          rosetteGroup.add(rosetteCore);
          rosetteGroup.scale.multiplyScalar(0.9 + rng() * 0.25);
          group.add(rosetteGroup);
        }
      }

    } else {
      // 3. PALMEIRA TROPICAL (Tropical Palm Tree)
      // Tall segmented ringed curved trunk, 12 radiating curved palm leaves, coconuts
      const palmTrunkColor = getThemeColor('#8c6239');
      const palmTrunkMat = new THREE.MeshStandardMaterial({
        color: palmTrunkColor,
        roughness: 0.9,
        flatShading: true,
      });

      const palmLeafMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#1e4620'), // Dark tropical palm green
        roughness: 0.8,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      // Segmented trunk (looks like overlapping rings, curved outwards)
      const segments = 10;
      const segmentHeight = 0.16;
      let currentPos = new THREE.Vector3(0, 0, 0);
      const curveDir = rng() * Math.PI * 2;
      const curveAmount = 0.08 + rng() * 0.06;

      for (let s = 0; s < segments; s++) {
        // Taper slightly from bottom to top
        const baseR = 0.08 - s * 0.0035;
        const topR = 0.076 - s * 0.0035;
        
        // Use a wide, short cylinder segment
        const geom = new THREE.CylinderGeometry(topR, baseR, segmentHeight, 7);
        const seg = new THREE.Mesh(geom, palmTrunkMat);
        
        seg.position.copy(currentPos).add(new THREE.Vector3(0, segmentHeight / 2, 0));
        // Add progressive curvature tilt
        seg.rotation.z = Math.cos(curveDir) * curveAmount * (s / segments);
        seg.rotation.x = Math.sin(curveDir) * curveAmount * (s / segments);
        seg.castShadow = true;
        seg.receiveShadow = true;
        group.add(seg);
        
        // Move upward along segment's oriented Y axis
        const axisDir = new THREE.Vector3(0, segmentHeight, 0).applyEuler(seg.rotation);
        currentPos.add(axisDir);
      }

      // Add radiating palm fronds (leaves) at top
      const frondCount = 10 + Math.floor(rng() * 4);
      for (let f = 0; f < frondCount; f++) {
        const fAngle = (f * Math.PI * 2) / frondCount + (rng() * 0.2 - 0.1);
        
        // Build palm leaf geometry: curve built from several connected flat planes
        const frondGroup = new THREE.Group();
        frondGroup.position.copy(currentPos);
        frondGroup.rotation.y = fAngle;
        
        // Construct leaf blade curve segments
        const leafSegments = 4;
        const leafSegLength = 0.18;
        let lPos = new THREE.Vector3(0, 0, 0);
        
        for (let ls = 0; ls < leafSegments; ls++) {
          const w = 0.08 * (1.0 - (ls / leafSegments) * 0.7);
          const fGeom = new THREE.BoxGeometry(w, 0.006, leafSegLength);
          const fMesh = new THREE.Mesh(fGeom, palmLeafMat);
          
          fMesh.position.copy(lPos).add(new THREE.Vector3(0, 0, leafSegLength / 2));
          // Progressively bend downward
          fMesh.rotation.x = -0.15 - (ls / leafSegments) * 0.45;
          fMesh.castShadow = true;
          frondGroup.add(fMesh);
          
          // Advance relative pos along oriented leaf Z direction
          const zDir = new THREE.Vector3(0, 0, leafSegLength).applyEuler(fMesh.rotation);
          lPos.add(zDir);
        }
        
        group.add(frondGroup);
      }

      // Add clustered brown coconuts under fronds center
      const coconutColor = getThemeColor('#4e3620');
      const coconutMat = new THREE.MeshStandardMaterial({
        color: coconutColor,
        roughness: 0.9,
        flatShading: true
      });
      const cocoCount = 3 + Math.floor(rng() * 3);
      for (let c = 0; c < cocoCount; c++) {
        const cocoGeom = new THREE.DodecahedronGeometry(0.05, 0);
        const coco = new THREE.Mesh(cocoGeom, coconutMat);
        const cAngle = (c * Math.PI * 2) / cocoCount + rng() * 0.4;
        coco.position.copy(currentPos).add(new THREE.Vector3(
          Math.cos(cAngle) * 0.07,
          -0.08,
          Math.sin(cAngle) * 0.07
        ));
        coco.castShadow = true;
        group.add(coco);
      }
    }

  // ----------------------------------------------------
  // ARCTIC BIOME SPECIES
  // ----------------------------------------------------
  } else if (themeId === 'arctic') {
    const speciesChoice = rng();

    if (speciesChoice < 0.5) {
      // 1. PINHEIRO IMPERIAL NEVADO (Snowy Imperial Pine)
      // Dense green tiers with thick, overlapping white snow cap overlays and hanging icicles
      const trunkHeight = 0.6 + rng() * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.045, 0.1, trunkHeight, 5);
      const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      const snowyLeafMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#1b4d3e'), // Very dark needle green
        roughness: 0.8,
        flatShading: true,
      });

      const snowBlanketMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Pure white snow
        roughness: 0.95,
        flatShading: true,
      });

      const icicleMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe, // Ice crystal cyan-blue
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        flatShading: true
      });

      const tiers = 4;
      let baseWidth = 0.75 + rng() * 0.15;
      let startY = trunkHeight * 0.55;

      for (let i = 0; i < tiers; i++) {
        const scale = 1.0 - i * 0.22;
        const tierHeight = 0.45 + rng() * 0.1;
        
        // Needle foliage cone
        const coneGeom = new THREE.ConeGeometry(baseWidth * scale, tierHeight, 6);
        const cone = new THREE.Mesh(coneGeom, snowyLeafMat);
        cone.position.y = startY + (tierHeight / 2);
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);

        // Snow blanket layer overlapping on top of needle cone
        const snowGeom = new THREE.ConeGeometry(baseWidth * scale * 0.98, tierHeight * 0.45, 6);
        const snow = new THREE.Mesh(snowGeom, snowBlanketMat);
        // Put snow cap slightly higher on the cone body
        snow.position.y = startY + (tierHeight * 0.75);
        snow.rotation.y = rng() * Math.PI;
        snow.castShadow = true;
        group.add(snow);

        // Icicles hanging under this tier
        if (rng() > 0.3) {
          const iceCount = 2 + Math.floor(rng() * 3);
          for (let ic = 0; ic < iceCount; ic++) {
            const iceGeom = new THREE.ConeGeometry(0.015, 0.12 + rng() * 0.08, 4);
            iceGeom.rotateX(Math.PI); // hang down
            const ice = new THREE.Mesh(iceGeom, icicleMat);
            const dist = baseWidth * scale * 0.7;
            const angle = (ic * Math.PI * 2) / iceCount + rng() * 0.5;
            ice.position.set(
              Math.cos(angle) * dist,
              startY + tierHeight * 0.1,
              Math.sin(angle) * dist
            );
            ice.castShadow = true;
            group.add(ice);
          }
        }

        startY += tierHeight * 0.58;
      }

    } else if (speciesChoice < 0.8) {
      // 2. VIDOEIRO CONGELADO DO ÁRTICO (Frozen Crystalline Birch)
      // Silver/white trunk with crystalline icy cyan-blue foliage puffs, frozen base
      const birchTrunkMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#e2e8f0'), // Frosted silver bark
        roughness: 0.7,
        metalness: 0.3,
        flatShading: true
      });

      const trunkHeight = 1.3 + rng() * 0.3;
      const trunkGeom = new THREE.CylinderGeometry(0.04, 0.08, trunkHeight, 5);
      const trunk = new THREE.Mesh(trunkGeom, birchTrunkMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Crystalline cyan leaves
      const iceLeafMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#a5f3fc'), // Cyan ice glow
        roughness: 0.15,
        metalness: 0.85,
        flatShading: true,
        transparent: true,
        opacity: 0.9,
      });

      // Overlapping crystal dodecahedrons
      const puffCount = 4;
      let pY = trunkHeight * 0.65;
      for (let j = 0; j < puffCount; j++) {
        const rad = 0.26 - j * 0.03 + rng() * 0.06;
        const puffGeom = new THREE.IcosahedronGeometry(rad, 0); // Flat crystal faces
        const puff = new THREE.Mesh(puffGeom, iceLeafMat);
        puff.position.set(rng() * 0.1 - 0.05, pY, rng() * 0.1 - 0.05);
        puff.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
        puff.castShadow = true;
        group.add(puff);

        pY += rad * 0.9;
      }

      // Snowy frozen base mound
      const baseMoundMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        flatShading: true
      });
      const baseMound = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), baseMoundMat);
      baseMound.position.y = 0.05;
      baseMound.scale.set(1.4, 0.4, 1.4);
      baseMound.receiveShadow = true;
      group.add(baseMound);

    } else {
      // 3. TRONCO ANCESTRAL GELADO (Ancient Frozen Deadwood)
      // Elaborate twisted white bare wood branches, icicles dangling, snow piles in forks
      const greyDeadWoodMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#94a3b8'), // Frosted ancient grey
        roughness: 0.95,
        flatShading: true
      });

      const snowMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        flatShading: true
      });

      const icicleMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.9
      });

      const trunkHeight = 1.0 + rng() * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.04, 0.14, trunkHeight, 5);
      const trunk = new THREE.Mesh(trunkGeom, greyDeadWoodMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Add 4 twisty bare branches reaching out
      const bCount = 4;
      for (let i = 0; i < bCount; i++) {
        const bHeight = 0.4 + rng() * 0.4;
        const bLength = 0.45 + rng() * 0.25;
        const bAngle = (i * Math.PI * 2) / bCount + (rng() * 0.4 - 0.2);
        
        const branchGeom = new THREE.CylinderGeometry(0.015, 0.04, bLength, 4);
        const branch = new THREE.Mesh(branchGeom, greyDeadWoodMat);
        branch.position.set(Math.cos(bAngle) * 0.06, bHeight, Math.sin(bAngle) * 0.06);
        branch.rotation.set(
          (0.8 + rng() * 0.3) * (rng() > 0.5 ? 1 : -1),
          bAngle,
          (0.8 + rng() * 0.3) * (rng() > 0.5 ? 1 : -1)
        );
        branch.castShadow = true;
        group.add(branch);

        const bTipPos = new THREE.Vector3(0, bLength, 0).applyEuler(branch.rotation).add(branch.position);

        // Snow caps sitting inside the branch joint junctions
        const jointSnow = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07, 0), snowMat);
        jointSnow.position.set(branch.position.x * 1.2, branch.position.y + 0.06, branch.position.z * 1.2);
        jointSnow.scale.set(1.1, 0.6, 1.1);
        jointSnow.castShadow = true;
        group.add(jointSnow);

        // Hanging icicles on each branch
        const iceGeom = new THREE.ConeGeometry(0.012, 0.1 + rng() * 0.08, 4);
        iceGeom.rotateX(Math.PI);
        const ice = new THREE.Mesh(iceGeom, icicleMat);
        ice.position.copy(bTipPos).add(new THREE.Vector3(0, -0.05, 0));
        ice.castShadow = true;
        group.add(ice);
      }

      // Massive snow pile at bottom base of tree trunk
      const baseSnowPile = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 1), snowMat);
      baseSnowPile.position.set(rng() * 0.08 - 0.04, 0.03, rng() * 0.08 - 0.04);
      baseSnowPile.scale.set(1.6, 0.4, 1.6);
      baseSnowPile.castShadow = true;
      group.add(baseSnowPile);
    }

  // ----------------------------------------------------
  // VOLCANIC BIOME SPECIES
  // ----------------------------------------------------
  } else if (themeId === 'volcanic') {
    const speciesChoice = rng();

    if (speciesChoice < 0.5) {
      // 1. CARVALHO DE MAGMA (Lava Magma Oak)
      // Carbonized gnarled black wood with glowing yellow-orange magma cores inside, and grey ash canopy
      const charredWoodMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#090d16'), // Pure soot black
        roughness: 0.98,
        metalness: 0.02,
        flatShading: true
      });

      const magmaMat = new THREE.MeshStandardMaterial({
        color: 0xff4500, // Fiery orange magma
        emissive: 0xff3300,
        emissiveIntensity: 1.8,
        roughness: 0.2,
        flatShading: true
      });

      const ashFoliageMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#1e293b'), // Sooty dark grey
        roughness: 0.9,
        flatShading: true
      });

      const trunkHeight = 1.1 + rng() * 0.4;
      
      // We build a split trunk so the magma inside peeks through a central split!
      const splitLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.11, trunkHeight, 5), charredWoodMat);
      splitLeft.position.set(-0.04, trunkHeight / 2, 0);
      splitLeft.rotation.z = 0.06;
      splitLeft.castShadow = true;
      group.add(splitLeft);

      const splitRight = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.11, trunkHeight, 5), charredWoodMat);
      splitRight.position.set(0.04, trunkHeight / 2, 0);
      splitRight.rotation.z = -0.06;
      splitRight.castShadow = true;
      group.add(splitRight);

      // Core glowing magma tube peeking from center split
      const magmaCore = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.065, trunkHeight * 0.85, 4), magmaMat);
      magmaCore.position.set(0, trunkHeight * 0.48, 0);
      group.add(magmaCore);

      // Ash canopy puffs on branch tips
      const branches = 3;
      for (let i = 0; i < branches; i++) {
        const angle = (i * Math.PI * 2) / branches + (rng() * 0.4 - 0.2);
        const bHeight = trunkHeight * 0.6 + rng() * trunkHeight * 0.25;
        const bLength = 0.5 + rng() * 0.2;

        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, bLength, 4), charredWoodMat);
        b.position.set(Math.cos(angle) * 0.05, bHeight, Math.sin(angle) * 0.05);
        b.rotation.set(
          (0.7 + rng() * 0.3) * (rng() > 0.5 ? 1 : -1),
          angle,
          (0.7 + rng() * 0.3) * (rng() > 0.5 ? 1 : -1)
        );
        b.castShadow = true;
        group.add(b);

        // Ash puff
        const ashPuffGeom = new THREE.DodecahedronGeometry(0.35 + rng() * 0.12, 1);
        const ashPuff = new THREE.Mesh(ashPuffGeom, ashFoliageMat);
        const bTip = new THREE.Vector3(0, bLength, 0).applyEuler(b.rotation).add(b.position);
        ashPuff.position.copy(bTip);
        ashPuff.castShadow = true;
        ashPuff.receiveShadow = true;
        group.add(ashPuff);

        // Glowing embers floating under/around the ash puff
        const emberCount = 2 + Math.floor(rng() * 3);
        for (let em = 0; em < emberCount; em++) {
          const emberGeom = new THREE.BoxGeometry(0.03, 0.03, 0.03);
          const ember = new THREE.Mesh(emberGeom, magmaMat);
          const offsetAngle = rng() * Math.PI * 2;
          const offsetRad = 0.2 + rng() * 0.2;
          ember.position.copy(bTip).add(new THREE.Vector3(
            Math.cos(offsetAngle) * offsetRad,
            -0.1 - rng() * 0.2,
            Math.sin(offsetAngle) * offsetRad
          ));
          group.add(ember);
        }
      }

    } else if (speciesChoice < 0.8) {
      // 2. CRISTAL DE ENXOFRE (Sulfur Crystal Geode Tree)
      // Charcoal dark stone branches loaded with crystalline neon-yellow sulfur formations
      const basaltRockMat = new THREE.MeshStandardMaterial({
        color: getThemeColor('#334155'), // Dark basalt grey
        roughness: 0.9,
        flatShading: true
      });

      const sulfurCrystalMat = new THREE.MeshStandardMaterial({
        color: 0xeab308, // Intense sulfur neon yellow
        emissive: 0xa16207,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
        flatShading: true,
      });

      // Rock pillar trunk built from distorted boxes for crystal look
      const segmentHeight = 0.45;
      const segCount = 3;
      let currentPos = new THREE.Vector3(0, 0, 0);

      for (let s = 0; s < segCount; s++) {
        const scale = 0.12 - s * 0.02;
        const segGeom = new THREE.BoxGeometry(scale * 1.5, segmentHeight, scale * 1.5);
        const seg = new THREE.Mesh(segGeom, basaltRockMat);
        seg.position.copy(currentPos).add(new THREE.Vector3(0, segmentHeight / 2, 0));
        seg.rotation.set(
          rng() * 0.15 - 0.075,
          rng() * Math.PI,
          rng() * 0.15 - 0.075
        );
        seg.castShadow = true;
        seg.receiveShadow = true;
        group.add(seg);
        
        currentPos.copy(seg.position).add(new THREE.Vector3(0, segmentHeight / 2, 0));
      }

      // Reaching crystalline spires
      const spireCount = 4;
      for (let i = 0; i < spireCount; i++) {
        const sAngle = (i * Math.PI * 2) / spireCount + rng() * 0.5;
        const sLen = 0.35 + rng() * 0.25;
        
        const spireGeom = new THREE.CylinderGeometry(0.01, 0.035, sLen, 4); // Crystal prism
        const spire = new THREE.Mesh(spireGeom, basaltRockMat);
        spire.position.copy(currentPos);
        spire.rotation.set(
          (0.6 + rng() * 0.4) * (rng() > 0.5 ? 1 : -1),
          sAngle,
          (0.6 + rng() * 0.4) * (rng() > 0.5 ? 1 : -1)
        );
        spire.castShadow = true;
        group.add(spire);

        const spireTip = new THREE.Vector3(0, sLen, 0).applyEuler(spire.rotation).add(currentPos);

        // Group of sharp sulfur crystal points clustered at tip
        const crystalClump = new THREE.Group();
        crystalClump.position.copy(spireTip);
        
        const points = 3 + Math.floor(rng() * 3);
        for (let p = 0; p < points; p++) {
          const crystalPointGeom = new THREE.ConeGeometry(0.04, 0.16 + rng() * 0.1, 4);
          const point = new THREE.Mesh(crystalPointGeom, sulfurCrystalMat);
          point.rotation.set(
            rng() * 0.6 - 0.3,
            (p * Math.PI * 2) / points,
            0.4 + rng() * 0.4
          );
          point.castShadow = true;
          crystalClump.add(point);
        }
        group.add(crystalClump);
      }

    } else {
      // 3. BROTO DE FOGO (Magma Fire Sprout)
      // Twisted charcoal dark trunk, flame-like foliage layers in yellow, orange, and red with intense glow
      const obsidianMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.1,
        metalness: 0.9,
        flatShading: true
      });

      const flameRedMat = new THREE.MeshStandardMaterial({
        color: 0xd90429,
        emissive: 0xef233c,
        emissiveIntensity: 1.5,
        roughness: 0.3,
        flatShading: true
      });

      const flameOrangeMat = new THREE.MeshStandardMaterial({
        color: 0xf48c06,
        emissive: 0xffb703,
        emissiveIntensity: 1.9,
        roughness: 0.3,
        flatShading: true
      });

      const flameYellowMat = new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0xffd166,
        emissiveIntensity: 2.3,
        roughness: 0.2,
        flatShading: true
      });

      const trunkHeight = 0.9 + rng() * 0.3;
      const trunkGeom = new THREE.CylinderGeometry(0.02, 0.08, trunkHeight, 5);
      const trunk = new THREE.Mesh(trunkGeom, obsidianMat);
      trunk.position.y = trunkHeight / 2;
      trunk.castShadow = true;
      group.add(trunk);

      // Stacked organic teardrop/flame cones on top
      const flameTiers = 3;
      let startY = trunkHeight * 0.7;
      let flameWidth = 0.45;

      for (let t = 0; t < flameTiers; t++) {
        const scale = 1.0 - t * 0.25;
        const tHeight = 0.4 + rng() * 0.12;
        
        // Red Outer flame cone
        const fGeomRed = new THREE.ConeGeometry(flameWidth * scale, tHeight, 5);
        const fRed = new THREE.Mesh(fGeomRed, flameRedMat);
        fRed.position.y = startY + tHeight * 0.5;
        fRed.rotation.y = rng() * Math.PI;
        fRed.castShadow = true;
        group.add(fRed);

        // Orange inner flame cone
        const fGeomOrange = new THREE.ConeGeometry(flameWidth * scale * 0.7, tHeight * 0.8, 5);
        const fOrange = new THREE.Mesh(fGeomOrange, flameOrangeMat);
        fOrange.position.y = fRed.position.y + tHeight * 0.08;
        fOrange.rotation.y = fRed.rotation.y + Math.PI / 4;
        group.add(fOrange);

        // Yellow core cone
        const fGeomYellow = new THREE.ConeGeometry(flameWidth * scale * 0.4, tHeight * 0.55, 5);
        const fYellow = new THREE.Mesh(fGeomYellow, flameYellowMat);
        fYellow.position.y = fOrange.position.y + tHeight * 0.1;
        fYellow.rotation.y = fOrange.rotation.y + Math.PI / 4;
        group.add(fYellow);

        startY += tHeight * 0.65;
      }
    }
  }

  // Randomize scale of whole tree slightly for natural procedural feeling
  const overallScale = 0.85 + rng() * 0.35;
  group.scale.set(overallScale, overallScale, overallScale);

  // Apply random rotation around Y axis
  group.rotation.y = rng() * Math.PI * 2;

  return group;
}

/**
 * Creates a procedurally generated rock mesh based on the selected theme.
 */
export function createRockMesh(themeId: ThemeId, rng: () => number): THREE.Mesh {
  const themeColors = THEMES[themeId] || THEMES.forest;
  const rockColor = getThemeColor(themeColors.rock);

  const material = new THREE.MeshStandardMaterial({
    color: rockColor,
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true,
  });

  // Base geometry is a low-poly sphere or dodecahedron
  const radius = 0.2 + rng() * 0.3;
  const geom = new THREE.DodecahedronGeometry(radius, 0);

  // Deform vertices of rock to make it unique and angular
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    
    // Stretch in some directions and add random noise
    pos.setXYZ(
      i,
      x * (1.0 + rng() * 0.4 - 0.2),
      y * (0.8 + rng() * 0.3 - 0.15), // Rocks tend to be slightly flatter on Y
      z * (1.0 + rng() * 0.4 - 0.2)
    );
  }
  geom.computeVertexNormals();

  const rock = new THREE.Mesh(geom, material);
  rock.name = 'procedural-rock';
  rock.castShadow = true;
  rock.receiveShadow = true;

  // Non-uniform scaling for additional variety
  rock.scale.set(
    0.9 + rng() * 0.5,
    0.7 + rng() * 0.4,
    0.9 + rng() * 0.5
  );

  // Random rotation
  rock.rotation.set(
    rng() * Math.PI * 0.2,
    rng() * Math.PI * 2,
    rng() * Math.PI * 0.2
  );

  return rock;
}

/**
 * Creates a procedurally generated grass cluster.
 */
export function createGrassMesh(themeId: ThemeId, rng: () => number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'procedural-grass';

  const themeColors = THEMES[themeId] || THEMES.forest;
  // Use a canopy leaf color for the grass
  const grassColors = themeColors.canopy.map(getThemeColor);
  const color = grassColors[Math.floor(rng() * grassColors.length)] || grassColors[0];

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
    side: THREE.DoubleSide
  });

  // Create 3-5 intersecting blades
  const bladeCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < bladeCount; i++) {
    const height = 0.12 + rng() * 0.12;
    const width = 0.015 + rng() * 0.01;

    // A small curved triangle representing a blade of grass
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    // Control point for curve
    shape.quadraticCurveTo(
      (rng() * 0.04 - 0.02), height * 0.5,
      (rng() * 0.08 - 0.04), height
    );
    shape.quadraticCurveTo(
      (rng() * 0.02 - 0.01), height * 0.4,
      width / 2, 0
    );
    shape.closePath();

    const geom = new THREE.ShapeGeometry(shape);
    const blade = new THREE.Mesh(geom, material);

    const angle = (i * Math.PI * 2) / bladeCount + (rng() * 0.4 - 0.2);
    blade.position.set(Math.cos(angle) * 0.02, 0, Math.sin(angle) * 0.02);
    blade.rotation.y = angle;
    blade.rotation.x = rng() * 0.25; // Slight bend forward

    group.add(blade);
  }

  const s = 0.8 + rng() * 0.4;
  group.scale.set(s, s, s);
  
  return group;
}

/**
 * Creates a beautiful low-poly house/cabin mesh that can be placed on the terrain.
 */
export function createHouseMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'procedural-house';

  // Walls material
  const wallsMat = new THREE.MeshStandardMaterial({
    color: 0xb23b3b, // Red barn/cabin color
    roughness: 0.7,
    metalness: 0.1,
    flatShading: true,
  });

  // Roof material
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x3d3530, // Dark grey/charcoal shingles
    roughness: 0.8,
    metalness: 0.2,
    flatShading: true,
  });

  // Door material
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x5c3d2e, // Brown wood
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  // Window material
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfde047, // Glowing warm yellow light
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0xeab308,
    emissiveIntensity: 0.6,
  });

  // Walls Box
  const wallsGeom = new THREE.BoxGeometry(0.5, 0.4, 0.5);
  const walls = new THREE.Mesh(wallsGeom, wallsMat);
  walls.position.y = 0.2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Roof Prism (Cone with 4 radial segments)
  const roofGeom = new THREE.ConeGeometry(0.42, 0.3, 4);
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.y = 0.4 + 0.15;
  roof.rotation.y = Math.PI / 4; // Align with walls
  roof.castShadow = true;
  group.add(roof);

  // Chimney
  const chimneyGeom = new THREE.BoxGeometry(0.08, 0.25, 0.08);
  const chimney = new THREE.Mesh(chimneyGeom, roofMat);
  chimney.position.set(0.12, 0.48, 0.12);
  chimney.castShadow = true;
  group.add(chimney);

  // Door
  const doorGeom = new THREE.BoxGeometry(0.12, 0.22, 0.02);
  const door = new THREE.Mesh(doorGeom, doorMat);
  door.position.set(0, 0.11, 0.251);
  group.add(door);

  // Windows
  const windowGeom = new THREE.BoxGeometry(0.1, 0.1, 0.02);
  
  const winLeft = new THREE.Mesh(windowGeom, windowMat);
  winLeft.position.set(-0.14, 0.24, 0.251);
  
  const winRight = new THREE.Mesh(windowGeom, windowMat);
  winRight.position.set(0.14, 0.24, 0.251);
  
  group.add(winLeft, winRight);

  // Small base foundation stone
  const baseGeom = new THREE.BoxGeometry(0.54, 0.04, 0.54);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.9,
    flatShading: true,
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.02;
  base.receiveShadow = true;
  group.add(base);

  group.scale.set(0.8, 0.8, 0.8);

  return group;
}

export function createPathMesh(type: string, rng: () => number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'procedural-path';

  if (type === 'path_stone') {
    // Ladrilho / Cobblestone
    const stoneCount = Math.floor(rng() * 3) + 3;
    const stoneMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0, 0, 0.4 + rng() * 0.2),
      roughness: 0.9,
      flatShading: true,
    });
    for (let i = 0; i < stoneCount; i++) {
      const sx = rng() * 0.5 + 0.3;
      const sz = rng() * 0.5 + 0.3;
      const sy = 0.08;
      const geom = new THREE.BoxGeometry(sx, sy, sz);
      const mesh = new THREE.Mesh(geom, stoneMat);
      mesh.position.set((rng() - 0.5) * 1.0, sy / 2 + 0.05, (rng() - 0.5) * 1.0);
      mesh.rotation.y = rng() * Math.PI;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  } else if (type === 'path_dirt') {
    // Barro / Dirt patch
    const dirtMat = new THREE.MeshStandardMaterial({
      color: '#4a3018',
      roughness: 1.0,
      flatShading: true,
    });
    const pCount = 2;
    for (let i = 0; i < pCount; i++) {
      const geom = new THREE.CylinderGeometry(0.7 + rng()*0.4, 0.7 + rng()*0.4, 0.05, 8);
      const mesh = new THREE.Mesh(geom, dirtMat);
      mesh.position.set((rng() - 0.5) * 0.4, 0.05, (rng() - 0.5) * 0.4);
      mesh.rotation.y = rng() * Math.PI;
      mesh.scale.set(1, 1, 0.5 + rng()*0.5);
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  } else if (type === 'path_grass') {
    // Grama Pisoteada
    const grassMat = new THREE.MeshStandardMaterial({
      color: '#7b8c38',
      roughness: 0.9,
      flatShading: true,
    });
    const geom = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 8);
    const mesh = new THREE.Mesh(geom, grassMat);
    mesh.position.y = 0.05;
    mesh.scale.set(1 + rng()*0.2, 1, 0.6 + rng()*0.4);
    mesh.rotation.y = rng() * Math.PI;
    mesh.receiveShadow = true;
    group.add(mesh);
  } else if (type === 'path_wood') {
    // Tábuas de madeira
    const plankCount = 2 + Math.floor(rng() * 2);
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#5c3a21',
      roughness: 0.8,
      flatShading: true,
    });
    for (let i = 0; i < plankCount; i++) {
      const geom = new THREE.BoxGeometry(1.0, 0.05, 0.3);
      const mesh = new THREE.Mesh(geom, woodMat);
      mesh.position.set((rng() - 0.5) * 0.2, 0.05, (i - plankCount/2) * 0.3 + rng()*0.05);
      mesh.rotation.y = (rng() - 0.5) * 0.3;
      mesh.rotation.z = (rng() - 0.5) * 0.05;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      group.add(mesh);
    }
  }

  return group;
}
