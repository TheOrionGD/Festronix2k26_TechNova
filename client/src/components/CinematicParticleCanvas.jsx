import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
   GLSL SHADERS FOR CINEMATIC MONOCHROME PARTICLE FIELD
   All motion, curl flow, breathing displacement, and mouse interaction
   are calculated 100% on the GPU for 60 FPS instanced performance.
   ═══════════════════════════════════════════════════════════════════════════ */

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uScrollY;
  uniform float uIsDark;

  attribute float aSize;
  attribute float aAlpha;
  attribute float aType; // 0.0 = Main Cloud, 1.0 = Stars, 2.0 = Orbits, 3.0 = Satellites
  attribute vec3 aRandom;
  attribute float aPhase;

  varying float vAlpha;
  varying float vType;

  // 3D Simplex Noise Implementation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Curl noise flow vector
  vec3 curlNoise(vec3 p) {
    const float e = 0.08;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = vec3(snoise(p - dx), snoise(p - dx + vec3(12.34, 45.67, 89.01)), snoise(p - dx + vec3(98.76, 54.32, 10.98)));
    vec3 p_x1 = vec3(snoise(p + dx), snoise(p + dx + vec3(12.34, 45.67, 89.01)), snoise(p + dx + vec3(98.76, 54.32, 10.98)));
    vec3 p_y0 = vec3(snoise(p - dy), snoise(p - dy + vec3(12.34, 45.67, 89.01)), snoise(p - dy + vec3(98.76, 54.32, 10.98)));
    vec3 p_y1 = vec3(snoise(p + dy), snoise(p + dy + vec3(12.34, 45.67, 89.01)), snoise(p + dy + vec3(98.76, 54.32, 10.98)));
    vec3 p_z0 = vec3(snoise(p - dz), snoise(p - dz + vec3(12.34, 45.67, 89.01)), snoise(p - dz + vec3(98.76, 54.32, 10.98)));
    vec3 p_z1 = vec3(snoise(p + dz), snoise(p + dz + vec3(12.34, 45.67, 89.01)), snoise(p + dz + vec3(98.76, 54.32, 10.98)));

    float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
    float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
    float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);

    return vec3(x, y, z);
  }

  void main() {
    vType = aType;
    vec3 pos = position;
    float time = uTime * 0.08;

    if (aType < 0.5) {
      // ── SCREEN-WIDE PARTICLES WITH HOLLOW CENTER ──
      vec3 curl = curlNoise(pos * 0.05 + vec3(time * 0.12));
      float lowFreq = snoise(pos * 0.03 + vec3(time * 0.06));
      
      float breath = 1.0 + sin(time * 0.5 + aPhase) * 0.03 + lowFreq * 0.02;
      pos += curl * (0.6 + aRandom.x * 0.4) * breath;

      // Repel from mouse instead of pulling into center
      vec2 mDist = uMouse * 55.0 - pos.xy;
      float dist = length(mDist);
      if (dist < 30.0) {
        float force = (30.0 - dist) / 30.0;
        pos.xy -= normalize(mDist) * force * 5.0;
      }
    } 
    else if (aType < 1.5) {
      // ── OUTER SPARSE STARS ──
      float slowTime = time * 0.03;
      pos.x += sin(slowTime + aPhase) * 1.5;
      pos.y += cos(slowTime * 0.8 + aPhase) * 1.5;
      pos.z += sin(slowTime * 0.5 + aRandom.y) * 1.0;
    }
    else if (aType < 2.5) {
      // ── PARTICLE ORBIT RINGS ──
      float ringSpeed = (0.003 + aRandom.x * 0.005) * (aRandom.y > 0.0 ? 1.0 : -1.0);
      float rotAngle = uTime * ringSpeed;
      
      float cosA = cos(rotAngle);
      float sinA = sin(rotAngle);
      
      vec2 rotPos;
      rotPos.x = pos.x * cosA - pos.z * sinA;
      rotPos.y = pos.x * sinA + pos.z * cosA;
      pos.x = rotPos.x;
      pos.z = rotPos.y;

      float wobble = snoise(pos * 0.02 + vec3(uTime * 0.05)) * 3.5;
      pos += normalize(pos) * wobble;
    }
    else {
      // ── SATELLITE CLUSTERS ──
      float orbitSpeed = 0.004 + aRandom.z * 0.004;
      float angle = uTime * orbitSpeed + aPhase;
      float radius = length(pos.xz);
      
      pos.x = cos(angle) * radius + sin(uTime * 0.1 + aPhase) * 1.5;
      pos.z = sin(angle) * radius + cos(uTime * 0.1 + aPhase) * 1.5;
      pos.y += sin(uTime * 0.15 + aRandom.x) * 1.2;
    }

    // Scroll parallax Y offset
    pos.y += uScrollY * 0.015;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Distance attenuation particle sizing
    float pSize = aSize * uPixelRatio * (240.0 / -mvPosition.z);
    gl_PointSize = clamp(pSize, 0.8, 6.0);

    // Alpha attenuation based on depth and shimmer
    float shimmer = aAlpha * (0.75 + 0.35 * sin(uTime * 1.2 + aPhase));
    vAlpha = clamp(shimmer * (140.0 / -mvPosition.z), 0.25, 1.0);
  }
`;

const fragmentShader = `
  uniform float uIsDark;

  varying float vAlpha;
  varying float vType;

  void main() {
    // Circular soft point sprite with smoothstep alpha falloff
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;

    // Soft gaussian halo falloff
    float alpha = smoothstep(0.5, 0.0, dist);
    alpha = pow(alpha, 1.2) * vAlpha * (uIsDark > 0.5 ? 1.2 : 1.4);

    // Crimson blood red for light theme, glowing white for dark theme
    vec3 crimsonRed = vec3(0.85, 0.01, 0.02);
    vec3 whiteColor = vec3(1.15, 1.15, 1.15);
    vec3 color = mix(crimsonRed, whiteColor, uIsDark);

    if (vType < 0.5) {
      color *= (uIsDark > 0.5 ? 1.25 : 1.1);
    }

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export const CinematicParticleCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Scene & Camera Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      55,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 75);

    const isInitialDark = document.documentElement.classList.contains('dark');

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── 2. Particle Geometry Construction (Hollow Center Screen-Wide Distribution) ──
    const MAIN_COUNT = 38000;
    const STARS_COUNT = 1500;
    const ORBIT_COUNT = 3000;
    const SATELLITE_COUNT = 1500;
    const TOTAL_COUNT = MAIN_COUNT + STARS_COUNT + ORBIT_COUNT + SATELLITE_COUNT;

    const positions = new Float32Array(TOTAL_COUNT * 3);
    const sizes = new Float32Array(TOTAL_COUNT);
    const alphas = new Float32Array(TOTAL_COUNT);
    const types = new Float32Array(TOTAL_COUNT);
    const randoms = new Float32Array(TOTAL_COUNT * 3);
    const phases = new Float32Array(TOTAL_COUNT);

    let idx = 0;

    // A) Main Particle Cloud (Screen-wide hollow distribution, NO central clump)
    for (let i = 0; i < MAIN_COUNT; i++) {
      let x = (Math.random() - 0.5) * 190;
      let y = (Math.random() - 0.5) * 130;
      let z = (Math.random() - 0.5) * 90;
      
      // Enforce hollow central region (radius < 32) so no particles gather at (0,0,0)
      const dist2D = Math.sqrt(x * x + y * y);
      if (dist2D < 32.0) {
        const angle = Math.atan2(y, x) || (Math.random() * Math.PI * 2);
        const pushDist = 32.0 + Math.random() * 65.0;
        x = Math.cos(angle) * pushDist;
        y = Math.sin(angle) * pushDist;
      }

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      sizes[idx] = 0.45 + Math.random() * 0.85;
      alphas[idx] = 0.3 + Math.random() * 0.7;
      types[idx] = 0.0;
      phases[idx] = Math.random() * Math.PI * 2;

      randoms[idx * 3] = Math.random() - 0.5;
      randoms[idx * 3 + 1] = Math.random() - 0.5;
      randoms[idx * 3 + 2] = Math.random() - 0.5;

      idx++;
    }

    // B) Outer Sparse Stars
    for (let i = 0; i < STARS_COUNT; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * Math.PI;
      const r = 50 + Math.random() * 90;

      positions[idx * 3] = Math.cos(u) * Math.cos(v) * r;
      positions[idx * 3 + 1] = Math.sin(v) * r;
      positions[idx * 3 + 2] = Math.sin(u) * Math.cos(v) * r;

      sizes[idx] = 0.3 + Math.random() * 0.6;
      alphas[idx] = 0.1 + Math.random() * 0.4;
      types[idx] = 1.0;
      phases[idx] = Math.random() * Math.PI * 2;

      randoms[idx * 3] = Math.random() - 0.5;
      randoms[idx * 3 + 1] = Math.random() - 0.5;
      randoms[idx * 3 + 2] = Math.random() - 0.5;

      idx++;
    }

    // C) Particle Orbits (Outer bands)
    const RINGS = [
      { r: 40, spread: 3.0 },
      { r: 58, spread: 4.0 },
      { r: 76, spread: 5.0 },
      { r: 94, spread: 6.0 }
    ];

    for (let i = 0; i < ORBIT_COUNT; i++) {
      const ring = RINGS[i % RINGS.length];
      const angle = (i / ORBIT_COUNT) * Math.PI * 2 * 4 + (Math.random() - 0.5) * 0.2;
      const jitter = (Math.random() - 0.5) * ring.spread;

      positions[idx * 3] = Math.cos(angle) * (ring.r + jitter);
      positions[idx * 3 + 1] = (Math.random() - 0.5) * ring.spread * 0.8;
      positions[idx * 3 + 2] = Math.sin(angle) * (ring.r + jitter);

      sizes[idx] = 0.35 + Math.random() * 0.7;
      alphas[idx] = (i % 12 === 0) ? 0.7 : 0.2;
      types[idx] = 2.0;
      phases[idx] = Math.random() * Math.PI * 2;

      randoms[idx * 3] = Math.random() - 0.5;
      randoms[idx * 3 + 1] = Math.random() - 0.5;
      randoms[idx * 3 + 2] = Math.random() - 0.5;

      idx++;
    }

    // D) Satellite Clusters
    const CLUSTER_CENTERS = [
      { x: -45, y: 22, z: -10 },
      { x: 48, y: -25, z: 15 },
      { x: -35, y: -28, z: 20 },
      { x: 42, y: 32, z: -18 },
      { x: 0, y: 48, z: -25 },
      { x: 0, y: -45, z: 25 }
    ];

    for (let i = 0; i < SATELLITE_COUNT; i++) {
      const center = CLUSTER_CENTERS[i % CLUSTER_CENTERS.length];
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * Math.PI;
      const r = Math.pow(Math.random(), 0.5) * 6.5;

      positions[idx * 3] = center.x + Math.cos(u) * Math.cos(v) * r;
      positions[idx * 3 + 1] = center.y + Math.sin(v) * r;
      positions[idx * 3 + 2] = center.z + Math.sin(u) * Math.cos(v) * r;

      sizes[idx] = 0.4 + Math.random() * 0.8;
      alphas[idx] = 0.3 + Math.random() * 0.6;
      types[idx] = 3.0;
      phases[idx] = Math.random() * Math.PI * 2;

      randoms[idx * 3] = Math.random() - 0.5;
      randoms[idx * 3 + 1] = Math.random() - 0.5;
      randoms[idx * 3 + 2] = Math.random() - 0.5;

      idx++;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aType', new THREE.BufferAttribute(types, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    // ── 3. Custom Shader Material ────────────────────────────────────────
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uScrollY: { value: 0 },
      uIsDark: { value: isInitialDark ? 1.0 : 0.0 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: isInitialDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // ── 4. Interaction & Smooth Motion Controls ──────────────────────────
    const targetMouse = new THREE.Vector2(0, 0);
    const currentMouse = new THREE.Vector2(0, 0);
    let targetScrollY = 0;
    let currentScrollY = 0;

    const handleMouseMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };
    window.addEventListener('resize', handleResize);

    // ── 5. Render Loop (Target 60 FPS) ──────────────────────────────────
    let animationFrameId;
    let startTime = performance.now();
    let lastIsDark = isInitialDark;

    const animate = () => {
      const elapsedTime = (performance.now() - startTime) * 0.001;

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;
      currentScrollY += (targetScrollY - currentScrollY) * 0.05;

      // Dynamic theme detection for Light (Crimson Blood Red) vs Dark (Glowing White)
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark !== lastIsDark) {
        lastIsDark = isDark;
        uniforms.uIsDark.value = isDark ? 1.0 : 0.0;
        material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
        material.needsUpdate = true;
      }

      uniforms.uTime.value = elapsedTime;
      uniforms.uMouse.value.copy(currentMouse);
      uniforms.uScrollY.value = currentScrollY;

      camera.position.x = Math.sin(elapsedTime * 0.25) * 0.35 + currentMouse.x * 1.2;
      camera.position.y = Math.cos(elapsedTime * 0.2) * 0.28 + currentMouse.y * 1.0;
      camera.position.z = 75 + Math.sin(elapsedTime * 0.15) * 0.18;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden opacity-90" />;
};

export default CinematicParticleCanvas;
