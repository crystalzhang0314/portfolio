/**
 * Crystal Zhang — 全屏开场动效
 * Fill + Bloom，基于顶部导航 CZ logo
 *
 * 行为：
 * - 每次刷新自动播放
 * - 系统开启减少动态效果时直接跳过
 * - 按 Esc 可提前结束
 */
(function () {
  if (!document.documentElement.classList.contains("is-intro-playing")) return;

  const isLightTheme =
    document.documentElement.getAttribute("data-theme") === "light";
  const palette = isLightTheme
    ? {
        backdrop: ["#eaf8f2", "#f4faf7", "#f9fbfa", "#ffffff"],
        cStart: "#83e46f",
        cMid: "#42cda3",
        cEnd: "#3597d5",
        z: "#1b2a3d",
        dot: "#72dc67",
        signatureLine: "rgba(55, 170, 123, .38)",
        signatureText: "rgba(39, 58, 75, .60)",
        particleAlpha: 0.62,
        particleFade: 0.38,
      }
    : {
        backdrop: ["#101d1b", "#0b1112", "#08080a", "#060608"],
        cStart: "#a8f57a",
        cMid: "#4dd4ac",
        cEnd: "#4a90d4",
        z: "#f4f4f6",
        dot: "#a8f57a",
        signatureLine: "rgba(168, 245, 122, .52)",
        signatureText: "rgba(224, 232, 232, .68)",
        particleAlpha: 0.82,
        particleFade: 0.58,
      };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function finishIntro(skipAnimation) {
    document.documentElement.classList.remove("is-intro-playing");
    document.documentElement.classList.add("is-intro-done");

    const overlay = document.getElementById("crystal-intro");
    if (!overlay) return;

    if (skipAnimation) {
      overlay.remove();
      return;
    }

    overlay.classList.add("is-done");
    overlay.addEventListener(
      "transitionend",
      () => {
        overlay.remove();
      },
      { once: true }
    );

    // 兜底：过渡结束后若仍在 DOM 则移除
    setTimeout(() => overlay.remove(), 760);
  }

  if (prefersReducedMotion) {
    finishIntro(true);
    return;
  }

  // ---------- 构建覆盖层 ----------
  const overlay = document.createElement("div");
  overlay.id = "crystal-intro";
  overlay.setAttribute("aria-hidden", "true");

  const canvas = document.createElement("canvas");
  overlay.appendChild(canvas);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "crystal-intro__svg";
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <path id="path-c" d="M25 8.2a16 16 0 1 0 0 31.6v-7.1a8.9 8.9 0 1 1 0-17.4V8.2Z"/>
    <path id="path-z" d="M27.4 8.2h14.1L31.9 25h9.6v6.7H20.2L29.8 15h-2.4V8.2Z"/>
    <circle id="path-dot" cx="38.7" cy="38.3" r="3.1"/>
  `;
  overlay.appendChild(svg);
  document.body.appendChild(overlay);

  // ---------- 动画配置 ----------
  const DURATION_DRAW = 900;
  const DURATION_BLOOM = 650;
  const DURATION_HOLD = 350;
  const TOTAL = DURATION_DRAW + DURATION_BLOOM + DURATION_HOLD;

  const ctx = canvas.getContext("2d");
  let W, H, DPR, cx, cy;
  let particles = [];
  let animId, startTime;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    cy = H / 2;
  }

  function samplePath(id, count, color, sizeBase) {
    const path = document.getElementById(id);
    if (!path || typeof path.getTotalLength !== "function") return [];
    const len = path.getTotalLength();
    const arr = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const pt = path.getPointAtLength(t * len);
      arr.push({ x: pt.x, y: pt.y, color, sizeBase });
    }
    return arr;
  }

  function buildParticles() {
    particles = [];
    const scale = Math.min(W, H) * 0.0102;
    const ox = cx - 24 * scale;
    const oy = cy - 24 * scale;

    const targets = [
      ...samplePath("path-c", 170, palette.cStart, 1.45),
      ...samplePath("path-z", 150, palette.cMid, 1.25),
    ];

    targets.forEach((t) => {
      const tx = ox + t.x * scale;
      const ty = oy + t.y * scale;
      particles.push({
        tx,
        ty,
        x: tx,
        y: ty,
        color: t.color,
        targetSize: t.sizeBase * (1.25 + Math.random() * 0.9),
        size: 0,
        bloomAngle: Math.random() * Math.PI * 2,
        bloomDist: 42 + Math.random() * 110,
        bloomSpeed: 0.8 + Math.random() * 1.2,
        bloomOffset: Math.random() * Math.PI * 2,
      });
    });
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function draw() {
    const backdrop = ctx.createRadialGradient(
      cx,
      cy * 0.96,
      0,
      cx,
      cy,
      Math.max(W, H) * 0.68
    );
    backdrop.addColorStop(0, palette.backdrop[0]);
    backdrop.addColorStop(0.28, palette.backdrop[1]);
    backdrop.addColorStop(0.72, palette.backdrop[2]);
    backdrop.addColorStop(1, palette.backdrop[3]);
    ctx.save();
    ctx.globalAlpha = isLightTheme ? 0.58 : 0.66;
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const now = performance.now() - startTime;
    if (now > TOTAL) {
      cancelAnimationFrame(animId);
      finishIntro(false);
      return;
    }

    const pathScale = Math.min(W, H) * 0.0102;
    const ox = cx - 24 * pathScale;
    const oy = cy - 24 * pathScale;

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(pathScale, pathScale);

    const drawP = Math.min(1, now / DURATION_DRAW);

    // 过程拆分：细描边先绘制，随后面型自下而上 reveal 填充
    const strokePhase = Math.min(1, drawP / 0.5);
    const eStroke = easeOutCubic(strokePhase);
    const fillPhase = Math.max(0, Math.min(1, (drawP - 0.35) / 0.65));
    const eFill = easeOutCubic(fillPhase);

    const cPath = document.getElementById("path-c");
    const cLen = cPath.getTotalLength();
    const zPath = document.getElementById("path-z");
    const zLen = zPath.getTotalLength();

    const grad = ctx.createLinearGradient(0, 0, 48, 48);
    grad.addColorStop(0, palette.cStart);
    grad.addColorStop(0.52, palette.cMid);
    grad.addColorStop(1, palette.cEnd);

    const textPrimary = palette.z;

    // 描边透明度：填充进行时描边淡出，避免残留毛边
    const strokeAlpha = 1 - eFill;

    if (strokeAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = strokeAlpha;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.5 / pathScale;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // C 细描边（渐变）
      ctx.strokeStyle = grad;
      ctx.setLineDash([cLen * eStroke, cLen]);
      ctx.stroke(new Path2D(cPath.getAttribute("d")));

      // Z 细描边（文字主色）
      ctx.strokeStyle = textPrimary;
      ctx.setLineDash([zLen * eStroke, zLen]);
      ctx.stroke(new Path2D(zPath.getAttribute("d")));

      ctx.setLineDash([]);
      ctx.restore();
    }

    // 面型自下而上 reveal 填充
    function fillReveal(path, color, progress) {
      ctx.save();
      ctx.fillStyle = color;
      const p2d = new Path2D(path.getAttribute("d"));
      ctx.clip(p2d);
      const h = 48 * progress;
      ctx.fillRect(0, 48 - h, 48, h);
      ctx.restore();
    }

    // C 面型填充（渐变）
    fillReveal(cPath, grad, eFill);

    // Z 面型填充（文字主色）
    fillReveal(zPath, textPrimary, eFill);

    // 右下角圆点：清晰边缘，随填充缩放出现
    const dotEl = document.getElementById("path-dot");
    const dotCx = +dotEl.getAttribute("cx");
    const dotCy = +dotEl.getAttribute("cy");
    const dotR = +dotEl.getAttribute("r");
    ctx.fillStyle = palette.dot;
    ctx.beginPath();
    ctx.arc(dotCx, dotCy, dotR * eFill, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();

    // 品牌署名：只承担节奏收尾，不与 Logo 竞争。
    const signatureP = Math.max(0, Math.min(1, (now - 620) / 430));
    const signatureOut = Math.max(0, Math.min(1, (TOTAL - now) / 230));
    const signatureAlpha = easeOutCubic(signatureP) * signatureOut;
    if (signatureAlpha > 0.01) {
      const logoBottom = cy + 24 * pathScale;
      const labelY = logoBottom + Math.max(32, Math.min(48, H * 0.055));
      const lineWidth = Math.max(22, Math.min(34, W * 0.045));
      ctx.save();
      ctx.globalAlpha = signatureAlpha;
      ctx.strokeStyle = palette.signatureLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - lineWidth / 2, labelY - 17);
      ctx.lineTo(cx + lineWidth / 2, labelY - 17);
      ctx.stroke();
      ctx.fillStyle = palette.signatureText;
      ctx.font = `500 ${Math.max(9, Math.min(11, W * 0.018))}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "2px";
      ctx.fillText("CRYSTAL ZHANG  ·  DESIGN PORTFOLIO", cx, labelY);
      ctx.restore();
    }

    // Bloom 粒子：描边结束后向外扩散
    if (now > DURATION_DRAW * 0.7) {
      const bloomP = Math.max(
        0,
        Math.min(1, (now - DURATION_DRAW * 0.7) / DURATION_BLOOM)
      );

      particles.forEach((p, i) => {
        const stagger = (i / particles.length) * 0.4;
        const localP = Math.max(
          0,
          Math.min(1, (bloomP - stagger) / (1 - stagger))
        );
        const el = easeOutExpo(localP);
        const dist = p.bloomDist * el;
        const bx = p.tx + Math.cos(p.bloomAngle) * dist;
        const by = p.ty + Math.sin(p.bloomAngle) * dist;

        const driftX = Math.sin(now * 0.0015 + p.bloomOffset) * 7 * el;
        const driftY = Math.cos(now * 0.0012 + p.bloomOffset) * 7 * el;

        p.x = p.tx + (bx - p.tx) * el + driftX;
        p.y = p.ty + (by - p.ty) * el + driftY;
        p.size = p.targetSize * (0.2 + 0.8 * (1 - el * 0.6));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(
          0,
          palette.particleAlpha - el * palette.particleFade
        );
        ctx.fill();
      });
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  function play() {
    cancelAnimationFrame(animId);
    startTime = performance.now();
    draw();
  }

  // ---------- 初始化 ----------
  resize();
  buildParticles();

  window.addEventListener("resize", () => {
    resize();
    buildParticles();
  });

  // Esc 提前结束
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        cancelAnimationFrame(animId);
        finishIntro(false);
      }
    },
    { once: true }
  );

  play();
})();
