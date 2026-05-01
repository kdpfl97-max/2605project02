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
    },
    { passive: true }
  );
})();
