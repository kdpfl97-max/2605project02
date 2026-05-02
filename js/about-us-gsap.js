(function () {
  "use strict";

  var title = document.querySelector(".about-hero__title");
  var hero = document.querySelector(".about-hero");
  if (!title || !hero || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  if (reduced) {
    gsap.set(title, { clearProps: "all" });
    title.style.opacity = "1";
    return;
  }

  if (window.tpLenis && typeof window.tpLenis.on === "function") {
    window.tpLenis.on("scroll", ScrollTrigger.update);
  }

  window.addEventListener(
    "resize",
    function () {
      ScrollTrigger.refresh();
    },
    { passive: true }
  );

  gsap.set(title, {
    y: -100,
    scale: 0.5,
    opacity: 0,
    transformOrigin: "50% 50%",
    force3D: true
  });

  gsap.to(title, {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: 1.2,
    ease: "expo.out",
    onComplete: function () {
      var scrollDist = Math.max(560, Math.round(window.innerHeight * 0.72));
      gsap.to(title, {
        scale: 16,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=" + scrollDist,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      ScrollTrigger.refresh();
    }
  });
})();
