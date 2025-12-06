// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import ProductListItem from "./components/ProductListItem";
import Cart from "./components/Cart";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const pointerRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  useEffect(() => {
    fetch("http://localhost:8080/products/products")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const arr = data?.data ?? data;
        setProducts(Array.isArray(arr) ? arr : []);
      })
      .catch((err) => {
        console.error("Erro carregando produtos:", err);
        setProducts([]);
      });
  }, []);

  // ==== NOVO: animação fly-to-cart ====
  // replace existing animateFlyToCart in App.jsx with this implementation
// replace existing animateFlyToCart in App.jsx with this improved, robust version
function animateFlyToCart(sourceElem) {
  console.log("[animateFlyToCart] called. sourceElem:", sourceElem);
  if (!sourceElem || typeof document === "undefined") {
    console.warn("[animateFlyToCart] sourceElem missing or no document");
    return;
  }

  // tenta seletores possíveis (prioridade: .cart, .cart-wrapper, [data-cart])
  let cartEl = document.querySelector(".cart");
  if (!cartEl) cartEl = document.querySelector(".cart-wrapper");
  if (!cartEl) cartEl = document.querySelector("[data-cart]");
  if (!cartEl) {
    console.warn("[animateFlyToCart] nenhum elemento de cart encontrado (.cart, .cart-wrapper, [data-cart])");
    return;
  }

  // pega o bounding rect do elemento que encontrarmos
  const cartRect = cartEl.getBoundingClientRect();
  console.log("[animateFlyToCart] using cart element:", cartEl, "cartRect:", cartRect);

  // get bounding rects do source (imagem)
  const srcRect = sourceElem.getBoundingClientRect();
  console.log("[animateFlyToCart] srcRect:", srcRect);

  // cria clone (preferência por img)
  let clone;
  if (sourceElem.tagName === "IMG") {
    clone = document.createElement("img");
    clone.src = sourceElem.src;
    clone.alt = sourceElem.alt || "";
  } else {
    const foundImg = sourceElem.querySelector && sourceElem.querySelector("img");
    if (foundImg && foundImg.src) {
      clone = document.createElement("img");
      clone.src = foundImg.src;
      clone.alt = foundImg.alt || "";
    } else {
      clone = sourceElem.cloneNode(true);
    }
  }

  // style inicial do clone
  const w = Math.max(8, srcRect.width);
  const h = Math.max(8, srcRect.height);
  clone.style.position = "fixed";
  clone.style.left = `${srcRect.left}px`;
  clone.style.top = `${srcRect.top}px`;
  clone.style.width = `${w}px`;
  clone.style.height = `${h}px`;
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.zIndex = "2147483647";
  clone.style.pointerEvents = "none";
  clone.style.borderRadius = window.getComputedStyle(sourceElem).borderRadius || "8px";
  clone.style.objectFit = "cover";
  clone.style.willChange = "transform, opacity";
  clone.style.transform = "translate3d(0,0,0) scale(1) rotate(0deg)";
  clone.style.opacity = "1";
  clone.style.transition = "transform 0.72s cubic-bezier(.22,.9,.33,1), opacity 0.72s ease";

  document.body.appendChild(clone);
  console.log("[animateFlyToCart] clone appended to body:", clone);

  // calc centers (usaremos centro do elemento cartEl)
  const srcCenterX = srcRect.left + srcRect.width / 2;
  const srcCenterY = srcRect.top + srcRect.height / 2;
  const dstCenterX = cartRect.left + cartRect.width / 2;
  const dstCenterY = cartRect.top + cartRect.height / 2;

  const deltaX = dstCenterX - srcCenterX;
  const deltaY = dstCenterY - srcCenterY;

  const finalScale = 0.16;
  const finalRotateDeg = -18;

  // força reflow
  // eslint-disable-next-line no-unused-expressions
  clone.offsetHeight;

  requestAnimationFrame(() => {
    clone.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${finalScale}) rotate(${finalRotateDeg}deg)`;
    clone.style.opacity = "0";
  });

  const onEnd = (ev) => {
    if (ev && ev.propertyName && !/(transform|opacity)/.test(ev.propertyName)) return;
    clone.removeEventListener("transitionend", onEnd);
    if (clone && clone.parentElement) clone.parentElement.removeChild(clone);
    console.log("[animateFlyToCart] clone removed after transition");
  };
  clone.addEventListener("transitionend", onEnd);

  // fallback
  setTimeout(() => {
    if (clone && clone.parentElement) {
      clone.removeEventListener("transitionend", onEnd);
      clone.parentElement.removeChild(clone);
      console.log("[animateFlyToCart] clone removed by timeout fallback");
    }
  }, 1400);
}



  // addToCart agora recebe opcionalmente o elemento visual pra animar
  const addToCart = (product, sourceElem = null) => {
    // adiciona ao estado do carrinho
    setCart((p) => [...p, product]);

    // dispara animação (se fornecido elemento)
    if (sourceElem) {
      // run after paint to ensure bounding rects corretos
      requestAnimationFrame(() => animateFlyToCart(sourceElem));
    }
  };

  const removeFromCart = (index) => setCart((p) => p.filter((_, i) => i !== index));

  // === FUNÇÃO: handleCheckout ===
  const handleCheckout = () => {
    if (!cart || cart.length === 0) {
      window.alert("Seu carrinho está vazio.");
      return;
    }

    const total = cart.reduce((acc, it) => acc + Number(it.price || 0), 0);
    const ok = window.confirm(
      `Confirmar compra de ${cart.length} item${cart.length !== 1 ? "s" : ""} por R$ ${total.toFixed(2)}?`
    );
    if (!ok) return;

    // placeholder: aqui você pode chamar API ou gateway de pagamento
    setCart([]);
    window.alert("Compra finalizada com sucesso! Obrigado pela preferência.");
    console.log("[handleCheckout] checkout confirmado, carrinho limpo.");
  };

  useEffect(() => {
    if (cart.length === 0) return;
    const el = document.querySelector(".cart");
    if (!el) return;
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 420);
  }, [cart]);

  const filteredProducts =
    selectedCategory === ""
      ? products
      : products.filter((p) => String(p.category).toUpperCase() === selectedCategory);

  /* ===================
     Canvas: starfield + meteors + aliens + burgers + fries (image) + astronauts (image)
     Fries image URL is kept exactly as you provided.
     =================== */
  useEffect(() => {
    // force dark background
    try {
      document.documentElement.style.background = "#000";
      document.body.style.background = "#000";
      document.body.style.backgroundColor = "#000";
    } catch (e) {}

    // ===== FRIES IMAGE (user-provided URL, exact) =====
    const friesImageUrl =
      "https://images.vexels.com/media/users/3/306644/isolated/preview/cb82328033db3858ebde9e652a2b6679-grande-caixa-de-batatas-fritas.png";
    const friesImg = new Image();
    friesImg.crossOrigin = "anonymous";
    friesImg.src = friesImageUrl;
    let friesImgLoaded = false;
    friesImg.onload = () => {
      friesImgLoaded = true;
    };
    friesImg.onerror = () => {
      friesImgLoaded = false;
      console.warn("Não carregou a imagem das batatas — será usado fallback.");
    };

    // ===== ASTRONAUT IMAGE (uses the URL you gave) =====
    const astronautImageUrl =
      "https://png.pngtree.com/png-clipart/20250122/original/pngtree-cartoon-astronaut-vector-png-image_20042674.png";
    const astroImg = new Image();
    astroImg.crossOrigin = "anonymous";
    astroImg.src = astronautImageUrl;
    let astroImgLoaded = false;
    astroImg.onload = () => {
      astroImgLoaded = true;
    };
    astroImg.onerror = () => {
      astroImgLoaded = false;
      console.warn("Não carregou a imagem do astronauta — será usado fallback vetorial.");
    };

    // ===== Canvas setup =====
    let canvas = document.getElementById("starfield");
    let createdCanvas = false;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "starfield";
      document.body.appendChild(canvas);
      createdCanvas = true;
    }
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.background = "transparent";

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      if (createdCanvas) canvas.remove();
      return;
    }

    // viewport
    let DPR = Math.max(1, window.devicePixelRatio || 1);
    let w = window.innerWidth;
    let h = window.innerHeight;
    function resize() {
      DPR = Math.max(1, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      pointerRef.current.x = w / 2;
      pointerRef.current.y = h / 2;
      initStars();
      initBurgers();
      initFries();
      initAstronauts();
    }

    // ===== STARS =====
    const STAR_COLORS = ["#ffffff", "#f0f8ff", "#ffdede"];
    let stars = [];
    function initStars() {
      stars = [];
      const count = Math.round((w * h) / 14000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.1,
          twinkle: Math.random() * 0.013 + 0.003,
          phase: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          depth: Math.random() * 0.9 + 0.05,
        });
      }
    }

    // ===== METEORS =====
    let meteors = [];
    let meteorTimer = null;
    const SPAWN_MIN = 1500;
    const SPAWN_MAX = 3500;
    function spawnMeteor() {
      const fromTop = Math.random() < 0.55;
      let x, y, angle;
      if (fromTop) {
        x = Math.random() * w;
        y = -20 - Math.random() * 60;
        angle = 0.55 + Math.random() * 0.7;
      } else {
        x = -40 - Math.random() * 120;
        y = Math.random() * (h * 0.6);
        angle = 0.2 + Math.random() * 0.6;
      }
      const speed = 1100 + Math.random() * 900;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const length = 180 + Math.random() * 260;
      const life = 450 + Math.random() * 900;
      const width = 1.6 + Math.random() * 2.4;
      meteors.push({ x, y, vx, vy, length, lifePassed: 0, life, width });
      if (meteors.length > 8) meteors.splice(0, meteors.length - 8);
    }
    function scheduleMeteor() {
      if (meteorTimer) clearTimeout(meteorTimer);
      const t = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
      meteorTimer = setTimeout(() => {
        spawnMeteor();
        if (Math.random() > 0.4) setTimeout(() => spawnMeteor(), 220 + Math.random() * 420);
        scheduleMeteor();
      }, t);
    }

    // ===== ALIENS =====
    let aliens = [];
    let alienTimer = null;
    function spawnAlien() {
      const fromLeft = Math.random() < 0.6;
      let x, y, angle;
      if (fromLeft) {
        x = -100 - Math.random() * 120;
        y = 50 + Math.random() * (h - 200);
        angle = 0.12 + Math.random() * 0.25;
      } else {
        x = w + 100 + Math.random() * 120;
        y = 50 + Math.random() * (h - 200);
        angle = Math.PI - (0.12 + Math.random() * 0.25);
      }
      const speed = 180 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 28 + Math.random() * 36;
      const wobble = 0.6 + Math.random() * 1.2;
      const color = Math.random() > 0.5 ? "#87f1ff" : "#ff88f0";
      aliens.push({ x, y, vx, vy, size, wobble, life: 0, maxLife: 10000 + Math.random() * 8000, color, beam: Math.random() > 0.7 });
      if (aliens.length > 3) aliens.splice(0, aliens.length - 3);
    }
    function scheduleAlien() {
      if (alienTimer) clearTimeout(alienTimer);
      const t = 7000 + Math.random() * 10000;
      alienTimer = setTimeout(() => {
        spawnAlien();
        scheduleAlien();
      }, t);
    }

    // ===== BURGERS =====
    let burgers = [];
    const BURGER_COUNT = 10;
    const ABDUCT_RADIUS_BASE = 140;
    const ABDUCT_PULL = 0.06;
    const RESPAWN_DELAY_MS = 700;
    function initBurgers() {
      burgers = [];
      for (let i = 0; i < BURGER_COUNT; i++) {
        burgers.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() * 60 + 30) * (Math.random() < 0.5 ? -1 : 1),
          vy: Math.random() * 30 - 15,
          size: 10 + Math.random() * 14,
          wobble: Math.random() * 1.3 + 0.4,
          phase: Math.random() * Math.PI * 2,
          abducting: false,
          targetAlien: null,
          life: 1,
        });
      }
    }
    function spawnBurger() {
      const b = {
        x: Math.random() < 0.5 ? -60 - Math.random() * 150 : w + 60 + Math.random() * 150,
        y: 30 + Math.random() * (h - 60),
        vx: (Math.random() * 60 + 30) * (Math.random() < 0.5 ? -1 : 1),
        vy: Math.random() * 30 - 15,
        size: 10 + Math.random() * 14,
        wobble: Math.random() * 1.3 + 0.4,
        phase: Math.random() * Math.PI * 2,
        abducting: false,
        targetAlien: null,
        life: 1,
      };
      burgers.push(b);
    }
    function drawBurger(ctx, x, y, size, rot = 0, alpha = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      const s = size;
      // top bun
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.25, s * 0.9, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#e6a96b";
      ctx.fill();
      // cheese
      ctx.beginPath();
      ctx.rect(-s * 0.55, -s * 0.08, s * 1.1, s * 0.22);
      ctx.fillStyle = "#ffc85c";
      ctx.fill();
      // patty
      ctx.beginPath();
      ctx.ellipse(0, s * 0.18, s * 0.52, s * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#7a3a2b";
      ctx.fill();
      // bottom bun
      ctx.beginPath();
      ctx.ellipse(0, s * 0.5, s * 0.9, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#d99b5b";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ===== FRIES (image) =====
    let fries = [];
    const FRIES_COUNT = 8;
    const FRIES_SIZE_SCALE = 0.8;
    function initFries() {
      fries = [];
      for (let i = 0; i < FRIES_COUNT; i++) {
        fries.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() * 60 + 20) * (Math.random() < 0.5 ? -1 : 1),
          vy: Math.random() * 30 - 15,
          size: (10 + Math.random() * 14) * FRIES_SIZE_SCALE,
          wobble: Math.random() * 1.2 + 0.3,
          phase: Math.random() * Math.PI * 2,
          abducting: false,
          targetAlien: null,
          life: 1,
        });
      }
    }
    function spawnFries() {
      const f = {
        x: Math.random() < 0.5 ? -60 - Math.random() * 150 : w + 60 + Math.random() * 150,
        y: 30 + Math.random() * (h - 60),
        vx: (Math.random() * 60 + 20) * (Math.random() < 0.5 ? -1 : 1),
        vy: Math.random() * 30 - 15,
        size: (10 + Math.random() * 14) * FRIES_SIZE_SCALE,
        wobble: Math.random() * 1.2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        abducting: false,
        targetAlien: null,
        life: 1,
      };
      fries.push(f);
    }
    function drawFries(ctx, x, y, size, rot = 0, alpha = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0.06, Math.min(1, alpha));
      if (friesImgLoaded) {
        const imgW = friesImg.width || 512;
        const imgH = friesImg.height || 512;
        const scale = (size * 1.9) / imgH;
        const dw = imgW * scale;
        const dh = imgH * scale;
        ctx.drawImage(friesImg, -dw / 2, -dh / 2, dw, dh);
      } else {
        // fallback simple package draw (red + fries)
        const pkgW = size * 1.3;
        const pkgH = size * 1.0;
        const halfW = pkgW / 2;
        const halfH = pkgH / 2;
        ctx.beginPath();
        const radius = 6 + size * 0.12;
        ctx.moveTo(-halfW, -halfH);
        ctx.lineTo(halfW, -halfH);
        ctx.lineTo(halfW, halfH - radius);
        ctx.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
        ctx.lineTo(-halfW + radius, halfH);
        ctx.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
        ctx.closePath();
        ctx.fillStyle = "#e32b2b";
        ctx.fill();
        const friesCount = 5;
        for (let i = 0; i < friesCount; i++) {
          const fx = -halfW + 8 + (i / (friesCount - 1)) * (pkgW - 16);
          const fy = -halfH + pkgH * 0.08 - Math.abs(Math.sin((x + y + i + size) * 0.012)) * 2;
          const fw = Math.max(1.8, size * 0.12);
          const fh = size * 0.6;
          ctx.beginPath();
          ctx.rect(fx - fw / 2, fy - fh, fw, fh);
          ctx.fillStyle = "#ffd76b";
          ctx.fill();
          ctx.beginPath();
          ctx.rect(fx - fw / 6, fy - fh + 4, fw / 3, fh * 0.6);
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ===== ASTRONAUTS (image based; replaces rockets) =====
    // Behaves similarly to the rockets (slow crossing), drawn via image with a soft trail.
    let astronauts = [];
    let astronautTimer = null;
    const ASTRO_MIN = 6000;
    const ASTRO_MAX = 11000;
    const ASTRO_SPEED_MIN = 40; // slower so you can see them
    const ASTRO_SPEED_MAX = 120;
    const ASTRO_MAX_ON_SCREEN = 4;

    function spawnAstronaut() {
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? -80 - Math.random() * 120 : w + 80 + Math.random() * 120;
      const startY = 40 + Math.random() * (h - 80);
      const angle = fromLeft ? (Math.random() * 0.18 - 0.06) : (Math.PI + Math.random() * 0.18 - 0.06);
      const speed = ASTRO_SPEED_MIN + Math.random() * (ASTRO_SPEED_MAX - ASTRO_SPEED_MIN);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 18 + Math.random() * 28;
      astronauts.push({ x: startX, y: startY, vx, vy, size, lifePassed: 0, life: 10000 + Math.random() * 8000, trail: [] });
      if (astronauts.length > ASTRO_MAX_ON_SCREEN) astronauts.splice(0, astronauts.length - ASTRO_MAX_ON_SCREEN);
    }
    function scheduleAstronaut() {
      if (astronautTimer) clearTimeout(astronautTimer);
      const t = ASTRO_MIN + Math.random() * (ASTRO_MAX - ASTRO_MIN);
      astronautTimer = setTimeout(() => {
        spawnAstronaut();
        if (Math.random() > 0.5) spawnAstronaut();
        scheduleAstronaut();
      }, t);
    }

    function pushAstroTrail(a) {
      a.trail.push({ x: a.x, y: a.y, age: 0 });
      if (a.trail.length > 22) a.trail.shift();
    }

    function drawAstronaut(ctx, a, dt) {
      // draw trail segments (soft)
      for (let i = a.trail.length - 1; i >= 0; i--) {
        const cur = a.trail[i];
        const next = a.trail[i + 1];
        if (!next) continue;
        const t = i / a.trail.length;
        const alpha = Math.max(0, 0.14 * (1 - t));
        const grad = ctx.createLinearGradient(cur.x, cur.y, next.x, next.y);
        grad.addColorStop(0, `rgba(180,210,255,${alpha * 0.85})`);
        grad.addColorStop(1, `rgba(140,180,255,${alpha * 0.25})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1, a.size * 0.6 * (1 - t));
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cur.x, cur.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }

      // draw astronaut image (or fallback vector)
      const rot = Math.atan2(a.vy, a.vx);
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(rot + Math.PI / 2); // orient image nicely (adjust if needed)

      // <-- IMPORTANT CHANGE: keep astronaut fully visible (no life-based fade) -->
      const lifeAlpha = 1; // was: Math.max(0.06, 1 - a.lifePassed / a.life);

      if (astroImgLoaded) {
        const imgW = astroImg.width || 256;
        const imgH = astroImg.height || 256;
        const scale = (a.size * 1.8) / imgH;
        const dw = imgW * scale;
        const dh = imgH * scale;
        ctx.globalAlpha = lifeAlpha;
        ctx.drawImage(astroImg, -dw / 2, -dh / 2, dw, dh);
      } else {
        // fallback: a small white suit-like circle + helmet
        ctx.globalAlpha = lifeAlpha;
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.arc(0, 0, a.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#cfeaff";
        ctx.arc(0, -a.size * 0.12, a.size * 0.36, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ===== bootstrap & schedule =====
    resize();
    initStars();
    initBurgers();
    initFries();
    initAstronauts();
    spawnMeteor();
    spawnMeteor();
    scheduleMeteor();
    spawnAlien();
    scheduleAlien();
    scheduleAstronaut();

    // ===== initAstronauts helper =====
    function initAstronauts() {
      astronauts = [];
      for (let i = 0; i < 2; i++) spawnAstronaut();
    }

    // ===== animation loop =====
    let raf = null;
    let lastTs = performance.now();

    function draw(ts) {
      const dt = Math.min(40, ts - lastTs);
      lastTs = ts;

      // clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      // tiny nebula
      const g = ctx.createRadialGradient(w * 0.12, h * 0.12, 0, w * 0.12, h * 0.12, Math.max(w, h) * 0.5);
      g.addColorStop(0, "rgba(255,255,255,0.0015)");
      g.addColorStop(0.25, "rgba(140,140,160,0.0008)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // STARS
      for (let s of stars) {
        const tw = 0.45 + Math.sin(s.phase + ts * s.twinkle * 0.001) * 0.45;
        const alpha = 0.75 * tw * (0.6 + s.depth * 0.6);
        const px = (pointerRef.current.x - w / 2) * 0.016 * (1 - s.depth);
        const py = (pointerRef.current.y - h / 2) * 0.016 * (1 - s.depth);

        ctx.beginPath();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 6 * s.r * (1 + s.depth);
        ctx.shadowColor = s.color;
        ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.globalAlpha = Math.min(1, alpha + 0.24);
        ctx.arc(s.x + px, s.y + py, Math.max(0.22, s.r * 0.5), 0, Math.PI * 2);
        ctx.fill();

        s.phase += 0.0016 + s.twinkle * 0.001 * dt;
      }
      ctx.globalAlpha = 1;

      // METEORS
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const dx = (m.vx * dt) / 1000;
        const dy = (m.vy * dt) / 1000;
        m.x += dx;
        m.y += dy;
        m.lifePassed += dt;

        const progress = m.lifePassed / m.life;
        const headAlpha = Math.max(0, 1 - progress * 0.9);
        const tailAlpha = Math.max(0, headAlpha * 0.45);

        const norm = Math.hypot(m.vx, m.vy) || 1;
        const tx = m.x - (m.vx / norm) * m.length;
        const ty = m.y - (m.vy / norm) * m.length;

        const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
        grad.addColorStop(0, `rgba(255,180,100,${tailAlpha * 0.9})`);
        grad.addColorStop(0.6, `rgba(255,220,140,${tailAlpha * 0.65})`);
        grad.addColorStop(1, `rgba(255,255,255,${headAlpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${headAlpha})`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(255,240,200,1)";
        ctx.arc(m.x, m.y, Math.max(2, m.width * 3.0), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (m.lifePassed > m.life || m.x > w + 300 || m.y > h + 300) {
          meteors.splice(i, 1);
        }
      }

      // ASTRONAUTS (update & draw)
      for (let ai = astronauts.length - 1; ai >= 0; ai--) {
        const a = astronauts[ai];
        a.lifePassed += dt;
        const dx = (a.vx * dt) / 1000;
        const dy = (a.vy * dt) / 1000;
        a.x += dx;
        a.y += dy;
        // subtle bob
        a.y += Math.sin((a.lifePassed + ai * 11) * 0.006) * 0.18;
        pushAstroTrail(a);
        drawAstronaut(ctx, a, dt);
        if (a.x < -300 || a.x > w + 300 || a.y < -300 || a.y > h + 300 || a.lifePassed > a.life) {
          astronauts.splice(ai, 1);
        }
      }

      // ALIENS
      for (let ai = aliens.length - 1; ai >= 0; ai--) {
        const a = aliens[ai];
        a.life += dt;
        a.y += Math.sin(a.life * 0.004 * a.wobble) * 0.3;
        const dx = (a.vx * dt) / 1000;
        const dy = (a.vy * dt) / 1000;
        a.x += dx;
        a.y += dy;

        const cx = a.x;
        const cy = a.y;
        const wbody = a.size * 1.6;
        const hbody = a.size * 0.5;

        const gradBody = ctx.createLinearGradient(cx - wbody / 2, cy, cx + wbody / 2, cy);
        gradBody.addColorStop(0, "rgba(200,200,210,0.12)");
        gradBody.addColorStop(0.5, a.color);
        gradBody.addColorStop(1, "rgba(200,200,210,0.12)");

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.ellipse(cx, cy, wbody / 2, hbody / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradBody;
        ctx.shadowBlur = 12;
        ctx.shadowColor = a.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // dome
        ctx.beginPath();
        ctx.ellipse(cx, cy - hbody * 0.35, wbody * 0.38, hbody * 0.48, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();

        // lights
        const lights = 4;
        for (let li = 0; li < lights; li++) {
          const lx = cx - wbody * 0.4 + (li / (lights - 1)) * (wbody * 0.8);
          const ly = cy + hbody * 0.22;
          const pulse = 0.6 + Math.sin((a.life * 0.02) + li) * 0.4;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,200,${0.25 * pulse})`;
          ctx.arc(lx, ly, Math.max(1.8, a.size * 0.08), 0, Math.PI * 2);
          ctx.fill();
        }

        if (a.beam && Math.random() < 0.02) {
          ctx.beginPath();
          const bx1 = cx - wbody * 0.35;
          const bx2 = cx + wbody * 0.35;
          ctx.moveTo(bx1, cy + hbody * 0.5);
          ctx.lineTo(cx, cy + hbody * 1.8 + a.size * 0.6);
          ctx.lineTo(bx2, cy + hbody * 0.5);
          ctx.closePath();
          ctx.fillStyle = "rgba(120,200,255,0.06)";
          ctx.fill();
        }

        ctx.restore();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.02)";
        ctx.lineWidth = Math.max(1, a.size * 0.06);
        ctx.moveTo(cx - a.vx * 0.01, cy - a.vy * 0.01);
        ctx.lineTo(cx - a.vx * 0.03, cy - a.vy * 0.03);
        ctx.stroke();

        if (a.x < -300 || a.x > w + 300 || a.y < -300 || a.y > h + 300 || a.life > a.maxLife) {
          aliens.splice(ai, 1);
        }
      }

      // BURGERS (abduction logic unchanged)
      for (let bi = burgers.length - 1; bi >= 0; bi--) {
        const b = burgers[bi];
        if (!b.abducting) {
          const dxp = pointerRef.current.x - b.x;
          const dyp = pointerRef.current.y - b.y;
          const distP = Math.hypot(dxp, dyp) || 1;
          b.vx += (dxp / distP) * 0.01;
          b.vy += (dyp / distP) * 0.005;
          b.phase += 0.015 * b.wobble;
          b.y += Math.sin(b.phase) * 0.28 * b.wobble;
          b.x += (b.vx * dt) / 1000;
          b.y += (b.vy * dt) / 1000;
          if (b.x < -120) b.x = w + 120;
          if (b.x > w + 120) b.x = -120;
          if (b.y < -120) b.y = h + 120;
          if (b.y > h + 120) b.y = -120;
          for (let a of aliens) {
            const ax = a.x;
            const ay = a.y + a.size * 0.9;
            const d = Math.hypot(ax - b.x, ay - b.y);
            const radius = ABDUCT_RADIUS_BASE + (a.size || 32);
            if (d < radius && Math.random() < 0.02) {
              b.abducting = true;
              b.targetAlien = a;
              break;
            }
          }
        } else {
          const a = b.targetAlien;
          if (!a) {
            b.abducting = false;
          } else {
            const tx = a.x;
            const ty = a.y + a.size * 0.9;
            const dx = tx - b.x;
            const dy = ty - b.y;
            const dist = Math.hypot(dx, dy) || 1;
            const pull = ABDUCT_PULL + Math.min(0.18, 0.12 * (1 - Math.min(dist / 300, 1)));
            b.vx = dx * pull;
            b.vy = dy * pull;
            b.x += b.vx;
            b.y += b.vy;
            b.life -= 0.02 + Math.min(0.045, (1 - Math.min(dist / 300, 1)) * 0.03);
            if (dist < 12 || b.life <= 0) {
              ctx.beginPath();
              ctx.fillStyle = "rgba(255,255,255,0.85)";
              ctx.arc(tx, ty, Math.max(2, b.size * 0.6), 0, Math.PI * 2);
              ctx.fill();
              burgers.splice(bi, 1);
              setTimeout(() => spawnBurger(), RESPAWN_DELAY_MS + Math.random() * 1300);
              continue;
            }
          }
        }
        const rot = Math.atan2(b.vy, b.vx);
        drawBurger(ctx, b.x, b.y, b.size * (0.9 + Math.sin(b.phase) * 0.04), rot, Math.max(0.08, b.life));
        if (b.abducting && b.targetAlien) {
          const a = b.targetAlien;
          const bx = a.x;
          const by = a.y + a.size * 0.9;
          const distToAlien = Math.hypot(b.x - bx, b.y - by);
          const maxR = 160;
          const tAlpha = Math.max(0, Math.min(1, 1 - distToAlien / maxR));
          const grad = ctx.createRadialGradient(bx, by, 0, bx, by, maxR);
          grad.addColorStop(0, `rgba(120,200,255,${0.28 * tAlpha})`);
          grad.addColorStop(0.6, `rgba(120,200,255,${0.12 * tAlpha})`);
          grad.addColorStop(1, `rgba(120,200,255,0)`);
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(bx, by, maxR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // FRIES (update & draw)
      for (let fi = fries.length - 1; fi >= 0; fi--) {
        const f = fries[fi];
        if (!f.abducting) {
          const dxp = pointerRef.current.x - f.x;
          const dyp = pointerRef.current.y - f.y;
          const distP = Math.hypot(dxp, dyp) || 1;
          f.vx += (dxp / distP) * 0.009;
          f.vy += (dyp / distP) * 0.004;
          f.phase += 0.016 * f.wobble;
          f.y += Math.sin(f.phase) * 0.24 * f.wobble;
          f.x += (f.vx * dt) / 1000;
          f.y += (f.vy * dt) / 1000;
          if (f.x < -120) f.x = w + 120;
          if (f.x > w + 120) f.x = -120;
          if (f.y < -120) f.y = h + 120;
          if (f.y > h + 120) f.y = -120;
          for (let a of aliens) {
            const ax = a.x;
            const ay = a.y + a.size * 0.9;
            const d = Math.hypot(ax - f.x, ay - f.y);
            const radius = ABDUCT_RADIUS_BASE + (a.size || 32);
            if (d < radius && Math.random() < 0.02) {
              f.abducting = true;
              f.targetAlien = a;
              break;
            }
          }
        } else {
          const a = f.targetAlien;
          if (!a) {
            f.abducting = false;
          } else {
            const tx = a.x;
            const ty = a.y + a.size * 0.9;
            const dx = tx - f.x;
            const dy = ty - f.y;
            const dist = Math.hypot(dx, dy) || 1;
            const pull = ABDUCT_PULL + Math.min(0.18, 0.12 * (1 - Math.min(dist / 300, 1)));
            f.vx = dx * pull;
            f.vy = dy * pull;
            f.x += f.vx;
            f.y += f.vy;
            f.life -= 0.018 + Math.min(0.04, (1 - Math.min(dist / 300, 1)) * 0.03);
            if (dist < 12 || f.life <= 0) {
              ctx.beginPath();
              ctx.fillStyle = "rgba(255,255,255,0.85)";
              ctx.arc(tx, ty, Math.max(2, f.size * 0.6), 0, Math.PI * 2);
              ctx.fill();
              fries.splice(fi, 1);
              setTimeout(() => spawnFries(), RESPAWN_DELAY_MS + Math.random() * 1300);
              continue;
            }
          }
        }
        const rot = Math.atan2(f.vy, f.vx);
        drawFries(ctx, f.x, f.y, f.size * (0.95 + Math.sin(f.phase) * 0.03), rot, Math.max(0.06, f.life));
        if (f.abducting && f.targetAlien) {
          const a = f.targetAlien;
          const bx = a.x;
          const by = a.y + a.size * 0.9;
          const distToAlien = Math.hypot(f.x - bx, f.y - by);
          const maxR = 160;
          const tAlpha = Math.max(0, Math.min(1, 1 - distToAlien / maxR));
          const grad = ctx.createRadialGradient(bx, by, 0, bx, by, maxR);
          grad.addColorStop(0, `rgba(120,200,255,${0.28 * tAlpha})`);
          grad.addColorStop(0.6, `rgba(120,200,255,${0.12 * tAlpha})`);
          grad.addColorStop(1, `rgba(120,200,255,0)`);
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(bx, by, maxR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    // events
    function onMove(e) {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
    }
    function onResize() {
      resize();
      initStars();
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    lastTs = performance.now();
    raf = requestAnimationFrame(draw);

    // cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (meteorTimer) clearTimeout(meteorTimer);
      if (alienTimer) clearTimeout(alienTimer);
      if (astronautTimer) clearTimeout(astronautTimer);
      if (createdCanvas) {
        const c = document.getElementById("starfield");
        if (c) c.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <canvas id="starfield" />
      <div className="container">
        <h1 className="title-light">Space Burger</h1>

        <div className="category-filters">
          <button
            className={`btn-glow ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            Todos
          </button>

          <button
            className={`btn-glow ${selectedCategory === "LANCHES" ? "active" : ""}`}
            onClick={() => setSelectedCategory("LANCHES")}
          >
            Lanches
          </button>

          <button
            className={`btn-glow ${selectedCategory === "BEBIDAS" ? "active" : ""}`}
            onClick={() => setSelectedCategory("BEBIDAS")}
          >
            Bebidas
          </button>

          <button
            className={`btn-glow ${selectedCategory === "ACOMPANHAMENTOS" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ACOMPANHAMENTOS")}
          >
            Acompanhamentos
          </button>
        </div>

        <div className="content">
          <div className="products-list">
            {filteredProducts.length === 0 ? (
              <p className="no-products">Nenhum produto encontrado.</p>
            ) : (
              filteredProducts.map((p, i) => (
                // NOTE: agora passamos addToCart como função que aceita (product, sourceElem)
                <ProductListItem key={p.id} product={p} addToCart={addToCart} delay={i * 70} />
              ))
            )}
          </div>

          <div className="cart-wrapper">
            <Cart cart={cart} removeFromCart={removeFromCart} onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
