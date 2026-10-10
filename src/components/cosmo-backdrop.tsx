"use client";

import { useEffect, useRef, useState } from "react";

import { cosmoFragmentShader, cosmoVertexShader } from "../lib/cosmo-backdrop-shader.js";

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error("Cosmo backdrop shader failed:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function hexToRgb(value: string): [number, number, number] {
  const match = /^#([\da-f]{6})$/i.exec(value.trim());
  if (!match) return [1, 1, 1];
  const color = Number.parseInt(match[1], 16);
  return [((color >> 16) & 255) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255];
}

function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: true });
    if (!canvas) return;
    if (!gl) {
      canvas.hidden = true;
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, `attribute vec2 position;\n${cosmoVertexShader}`);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, `precision highp float;\n${cosmoFragmentShader}`);
    if (!vertex || !fragment) {
      canvas.hidden = true;
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return;
    }

    const program = gl.createProgram();
    const quad = gl.createBuffer();
    if (!program || !quad) {
      canvas.hidden = true;
      if (program) gl.deleteProgram(program);
      if (quad) gl.deleteBuffer(quad);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.hidden = true;
      console.error("Cosmo backdrop program failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteBuffer(quad);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "uResolution");
    const time = gl.getUniformLocation(program, "uTime");
    const dark = gl.getUniformLocation(program, "uDark");
    const tint = gl.getUniformLocation(program, "uTint");
    const tintStrength = gl.getUniformLocation(program, "uTintStrength");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let tintColor: [number, number, number] = [1, 1, 1];
    let tintEnabled = false;
    let elapsed = 0;
    let previous = 0;
    let frame = 0;

    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, elapsed);
      gl.uniform1f(dark, document.documentElement.classList.contains("dark") ? 1 : 0);
      gl.uniform3f(tint, ...tintColor);
      gl.uniform1f(tintStrength, tintEnabled ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.dataset.ready = "true";
    };
    const syncPalette = () => {
      const root = document.documentElement;
      tintEnabled = root.dataset.elementsPalette !== "stellar";
      tintColor = hexToRgb(getComputedStyle(root).getPropertyValue("--chart-2"));
      draw();
    };
    const tick = (now: number) => {
      if (previous) elapsed += Math.min((now - previous) / 1000, 0.05);
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    };
    const syncMotion = () => {
      stop();
      if (motion.matches) {
        elapsed = 0;
        draw();
      } else if (!document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    };
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
      draw();
    };
    const syncVisibility = () => {
      if (document.hidden) stop();
      else syncMotion();
    };
    const observer = new MutationObserver(syncPalette);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-elements-palette"] });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", syncVisibility);
    motion.addEventListener("change", syncMotion);
    syncPalette();
    resize();
    syncMotion();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncVisibility);
      motion.removeEventListener("change", syncMotion);
      delete canvas.dataset.ready;
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return <canvas ref={canvasRef} data-slot="cosmo-backdrop" className="cosmo-backdrop" aria-hidden="true" />;
}

/** Render once near the app root, with page content above the canvas layer. */
export function CosmoBackdrop() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setActive(root.dataset.elementsTheme === "cosmo");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-elements-theme"] });
    return () => observer.disconnect();
  }, []);
  return active ? <ShaderCanvas /> : null;
}
