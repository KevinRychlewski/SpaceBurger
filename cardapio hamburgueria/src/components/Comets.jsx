// src/components/Comets.jsx
import React, { useRef, useEffect } from "react";

export default function Comets() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Ajuste para devicePixelRatio
    const DPR = window.devicePixelRatio || 1;
    function resize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Cria cometas
    const comets = [];
    const maxComets = 18;
    const colors = ["#ffd6a5", "#ffb3c1", "#cfe8ff", "#fff7a1"];

    function spawnComet() {
      const angle = Math.random() * Math.PI / 4 - Math.PI / 8; // pequena variação
      const speed = 2 + Math.random() * 6;
      const size = 1.5 + Math.random() * 3.5;
      const fromTop = Math.random() < 0.5;

      // spawn fora da tela, vindo pela esquerda ou topo
      const startX = fromTop ? Math.random() * canvas.width : -50;
      const startY = fromTop ? -50 : Math.random() * canvas.height;

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + 0.5; // leve queda

      comets.push({
        x: startX,
        y: startY,
        vx,
        vy,
        size,
        life: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      });
    }

    // preenche alguns cometas iniciais
    for (let i = 0; i < 8; i++) spawnComet();

    let last = performance.now();

    function step(t) {
      const dt = Math.min(50, t - last);
      last = t;

      // efeito de "fading" do fundo para deixar rastro
      ctx.fillStyle = "rgba(0,0,0,0.18)"; // ajusta alpha pra rastro maior/menor
      ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);

      // desenha cometas
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];

        // atualiza posição
        c.x += c.vx * (dt / 16);
        c.y += c.vy * (dt / 16);
        c.life += dt;

        // guarda pontos para trail
        c.trail.push({ x: c.x, y: c.y });
        if (c.trail.length > 14) c.trail.shift();

        // desenha trail (gradiente simples)
        for (let j = 0; j < c.trail.length; j++) {
          const p = c.trail[j];
          const alpha = (j + 1) / c.trail.length;
          ctx.beginPath();
          ctx.arc(p.x, p.y, c.size * (alpha * 0.9 + 0.1), 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(c.color, alpha * 0.9);
          ctx.fill();
        }

        // desenha cabeça brilhante
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba("#ffffff", 0.95);
        ctx.fill();

        // remove quando sai da tela por muito tempo
        if (c.x > canvas.width / DPR + 100 || c.y > canvas.height / DPR + 100) {
          comets.splice(i, 1);
        }
      }

      // mantém número de cometas
      if (comets.length < maxComets && Math.random() < 0.08) spawnComet();

      animRef.current = requestAnimationFrame(step);
    }

    // util
    function hexToRgba(hex, a) {
      const h = hex.replace("#", "");
      const bigint = parseInt(h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${a})`;
    }

    // inicia
    animRef.current = requestAnimationFrame((t) => {
      last = t;
      // desenha um fundo inicial (apenas se quiser limpar)
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);
      animRef.current = requestAnimationFrame(step);
    });

    // debug: confirma mount
    // console.log("Comets mounted, canvas size:", canvas.width / DPR, canvas.height / DPR);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999, // coloca acima; se quiser abaixo, use -1
        mixBlendMode: "screen", // efeitos legais dependendo do fundo
      }}
    />
  );
}
