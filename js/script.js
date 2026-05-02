(function () {
  "use strict";

  var toggle = document.querySelector(".tp-nav-toggle");
  var nav = document.querySelector(".tp-nav");
  var body = document.body;

  if (toggle && nav) {
    function setNavOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      nav.classList.toggle("is-open", open);
      body.classList.toggle("nav-open", open);
    }

    function navIsOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", function () {
      setNavOpen(!navIsOpen());
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 960px)").matches) {
          setNavOpen(false);
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && navIsOpen()) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navIsOpen()) {
        setNavOpen(false);
        toggle.focus();
      }
    });
  }

  var root = document.getElementById("fullpage");
  var FullpageCtor = typeof fullpage !== "undefined" ? fullpage : null;

  function headerPadding() {
    var h = document.querySelector(".tp-header");
    return h ? h.offsetHeight + "px" : "64px";
  }

  var introBgFlicking = null;
  var introBgAutoplayId = null;

  function initIntroBgFlicking() {
    if (introBgFlicking || typeof Flicking === "undefined") return;
    var el = document.getElementById("intro-bg-flicking");
    if (!el) return;

    introBgFlicking = new Flicking("#intro-bg-flicking", {
      circular: true,
      horizontal: true,
      align: "center",
      duration: 600,
      preventClickOnDrag: true,
      inputType: ["touch", "mouse", "pointer"]
    });

    function tick() {
      if (!introBgFlicking || introBgFlicking.animating) return;
      introBgFlicking.next().catch(function () {});
    }

    introBgAutoplayId = window.setInterval(tick, 3500);
  }

  function resizeIntroBgFlicking() {
    if (introBgFlicking && typeof introBgFlicking.resize === "function") {
      introBgFlicking.resize();
    }
  }

  if (root && FullpageCtor) {
    new FullpageCtor("#fullpage", {
      licenseKey: "OPEN-SOURCE-GPLV3-LICENSE",
      anchors: ["intro", "stream", "closing"],
      navigation: true,
      navigationPosition: "right",
      navigationTooltips: ["인트로", "본문", "상담·푸터"],
      showActiveTooltip: true,
      paddingTop: headerPadding(),
      /* true면 휠이 섹션 전환만 되어 스크롤이 막히는 경우가 많음 → 일반 페이지 스크롤 */
      autoScrolling: false,
      scrollBar: true,
      fitToSection: false,
      credits: { enabled: false }
    });
  }

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(initIntroBgFlicking);
  });

  window.addEventListener(
    "resize",
    function () {
      if (typeof fullpage_api !== "undefined" && fullpage_api && fullpage_api.setPaddingTop) {
        fullpage_api.setPaddingTop(headerPadding());
      }
      resizeIntroBgFlicking();
      if (window.tpLenis && typeof window.tpLenis.resize === "function") {
        window.tpLenis.resize();
      }
    },
    { passive: true }
  );

  /** 문의사항 페이지: 고객 문의 레이더 차트 (Canvas, 시연용 애니메이션) */
  function initInquiryRadar() {
    var canvas = document.getElementById("inquiry-radar-canvas");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var labels = ["도입·견적", "기술·장애", "제휴·교육", "정산·요금", "기타"];
    var base = [0.74, 0.7, 0.48, 0.62, 0.55];
    var n = labels.length;
    var rafId = 0;
    var t0 = performance.now();
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cssSize = 360;

    function clamp(x, lo, hi) {
      return Math.max(lo, Math.min(hi, x));
    }

    function layout() {
      var parent = canvas.parentElement;
      var maxW = parent ? Math.min(parent.clientWidth || 400, 440) : 400;
      cssSize = Math.max(260, maxW);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = cssSize + "px";
      canvas.style.height = cssSize + "px";
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function valueAt(i, elapsedMs) {
      if (reduced) return base[i];
      var wobble = 0.1 * Math.sin(elapsedMs * 0.0018 + i * 1.35);
      return clamp(base[i] + wobble, 0.28, 0.95);
    }

    function drawFrame(now) {
      var elapsed = reduced ? 0 : now - t0;
      var cx = cssSize * 0.5;
      var cy = cssSize * 0.52;
      var maxR = cssSize * 0.34;

      ctx.clearRect(0, 0, cssSize, cssSize);

      var ring;
      for (ring = 1; ring <= 4; ring++) {
        var rr = (maxR * ring) / 4;
        ctx.beginPath();
        var i;
        for (i = 0; i <= n; i++) {
          var idx = i % n;
          var ang = -Math.PI / 2 + (idx * 2 * Math.PI) / n;
          var x = cx + rr * Math.cos(ang);
          var y = cy + rr * Math.sin(ang);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      for (var j = 0; j < n; j++) {
        var a = -Math.PI / 2 + (j * 2 * Math.PI) / n;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a));
        ctx.stroke();
      }

      ctx.beginPath();
      for (var k = 0; k <= n; k++) {
        var ii = k % n;
        var ang2 = -Math.PI / 2 + (ii * 2 * Math.PI) / n;
        var val = valueAt(ii, elapsed);
        var rk = maxR * val;
        var px = cx + rk * Math.cos(ang2);
        var py = cy + rk * Math.sin(ang2);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(110, 168, 255, 0.22)";
      ctx.fill();
      ctx.strokeStyle = "#6ea8ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      for (var v = 0; v < n; v++) {
        var aa = -Math.PI / 2 + (v * 2 * Math.PI) / n;
        var vv = valueAt(v, elapsed);
        var px2 = cx + maxR * vv * Math.cos(aa);
        var py2 = cy + maxR * vv * Math.sin(aa);
        ctx.beginPath();
        ctx.arc(px2, py2, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a0a";
        ctx.fill();
        ctx.strokeStyle = "#6ea8ff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.font = '600 12px "Noto Sans KR", system-ui, sans-serif';
      ctx.fillStyle = "rgba(242, 242, 242, 0.5)";
      for (var L = 0; L < n; L++) {
        var aa3 = -Math.PI / 2 + (L * 2 * Math.PI) / n;
        var lr = maxR + 22;
        var lx = cx + lr * Math.cos(aa3);
        var ly = cy + lr * Math.sin(aa3);
        var tw = ctx.measureText(labels[L]).width;
        ctx.fillText(labels[L], lx - tw / 2, ly + 4);
      }

      if (!reduced) rafId = window.requestAnimationFrame(drawFrame);
    }

    layout();
    if (reduced) {
      drawFrame(t0);
    } else {
      rafId = window.requestAnimationFrame(drawFrame);
    }

    window.addEventListener(
      "resize",
      function () {
        layout();
        if (reduced) drawFrame(t0);
      },
      { passive: true }
    );
  }

  initInquiryRadar();

  /**
   * 전역 스무스 스크롤 (Lenis). 휠·터치 관성, 앵커 이동까지 자연스럽게 이어지도록 설정.
   * prefers-reduced-motion: reduce 인 경우 비활성화(접근성).
   */
  function initLenisSmoothScroll() {
    if (typeof Lenis === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var lenis = new Lenis({
      lerp: 0.072,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: true,
      syncTouchLerp: 0.075,
      anchors: true,
      autoRaf: true
    });

    window.tpLenis = lenis;
  }

  initLenisSmoothScroll();

  /** AOS (스크롤 등장). data-aos가 있는 페이지만 초기화. Lenis와 함께 쓰일 때 refresh 연동 */
  function initAOS() {
    if (typeof AOS === "undefined") return;
    if (!document.querySelector("[data-aos]")) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      duration: reduced ? 0 : 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 48,
      disable: reduced
    });

    if (!reduced && window.tpLenis && typeof window.tpLenis.on === "function") {
      window.tpLenis.on("scroll", function () {
        AOS.refresh();
      });
    }
  }

  initAOS();
})();
