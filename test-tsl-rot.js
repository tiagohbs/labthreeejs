import { MeshStandardNodeMaterial } from 'three/webgpu';
import { positionLocal, vec2, vec3, attribute, cos, sin, mat2 } from 'three/tsl';

const material = new MeshStandardNodeMaterial();
const instancePosition = attribute('instancePosition', 'vec3');
const instanceRotation = attribute('instanceRotation', 'vec3');

const c = cos(instanceRotation.y);
const s = sin(instanceRotation.y);
// In TSL, constructing mat2 usually works by passing 2 vec2s or 4 floats
const rotY = mat2(c, s.negate(), s, c); // Wait, GLSL is column major: vec2(c, s), vec2(-s, c)
// or just manually rotate
const x = positionLocal.x;
const z = positionLocal.z;
const rotatedX = x.mul(c).sub(z.mul(s));
const rotatedZ = x.mul(s).add(z.mul(c));

const pos = vec3(rotatedX, positionLocal.y, rotatedZ).add(instancePosition);
material.positionNode = pos;

console.log('Rotation created successfully!');
