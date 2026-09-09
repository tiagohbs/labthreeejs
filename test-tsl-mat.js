import { MeshStandardNodeMaterial } from 'three/webgpu';
import { color, positionLocal, time, vec3, mix, uv, sin, pow, attribute, uniform } from 'three/tsl';

const material = new MeshStandardNodeMaterial();
const uBaseColor = uniform(color('#1d5c00'));
const uTipColor = uniform(color('#e8e800'));
const uWindStrength = uniform(1.0);
const uSimulationSpeed = uniform(0.8);

const instancePosition = attribute('instancePosition', 'vec3');
const instanceRotation = attribute('instanceRotation', 'vec3'); // Wait, rotation logic

material.colorNode = mix(uBaseColor, uTipColor, uv().y);

const globalTime = time.mul(uSimulationSpeed);
const windWave1 = sin(globalTime.add(instancePosition.x.mul(0.5)).add(instancePosition.z.mul(0.5)));
const totalWind = windWave1.mul(uWindStrength);

const windEffect = pow(uv().y, 2.0);
const dx = totalWind.mul(windEffect).mul(0.8);
const dz = totalWind.mul(windEffect).mul(0.4);

// For rotation we need cos and mat2. How does mat2 work in TSL?
const pos = positionLocal.add(vec3(dx, 0, dz));

material.positionNode = pos;

console.log('Material created successfully!');
