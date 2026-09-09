import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { color, positionLocal, time, vec3, mix, uv, sin, pow, attribute, uniform } from 'three/tsl';

const material = new MeshStandardNodeMaterial();
material.colorNode = color(0xff0000);
console.log("Success");
