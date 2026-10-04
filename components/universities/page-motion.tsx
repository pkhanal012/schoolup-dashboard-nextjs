"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * The motion layer for the public pages, driven by data attributes so the
 * pages themselves stay server-rendered:
 *
 *   data-u-hero    hero pieces, in DOM order, on load (hidden until then by CSS)
 *   data-u-pop     stickers — spring in with a spin
 *   data-u-reveal  rises in when scrolled to
 *   data-u-stagger its children rise in one after another
 *   data-u-count   counts up to its number (data-suffix / data-prefix kept)
 *   data-u-spin    turns slowly forever (blobs)
 *   data-u-draw    a bar that fills to its data-u-draw percent
 *
 * Under reduced motion everything is simply shown.
 */
export function PageMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = (s: string) => gsap.utils.toArray<HTMLElement>(s);

      gsap.fromTo(q("[data-u-hero]"), { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", delay: 0.1 });
      gsap.fromTo(
        q("[data-u-pop]"),
        { opacity: 0, scale: 0, rotation: () => gsap.utils.random(-60, 60) },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.5, stagger: 0.1, ease: "elastic.out(1, 0.55)", delay: 0.35 },
      );
      q("[data-u-float]").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? -10 : 10, rotation: i % 2 ? 3 : -3, duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      q("[data-u-reveal]").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 48, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });
      q("[data-u-stagger]").forEach((el) => {
        gsap.from(el.children, { opacity: 0, y: 40, duration: 1, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 86%" } });
      });
      q("[data-u-count]").forEach((el) => {
        const target = Number(el.dataset.uCount);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            el.textContent = `${el.dataset.prefix ?? ""}${Math.round(obj.v).toLocaleString("en-US")}${el.dataset.suffix ?? ""}`;
          },
        });
      });
      q("[data-u-spin]").forEach((el, i) => gsap.to(el, { rotation: i % 2 ? -360 : 360, duration: 36, ease: "none", repeat: -1 }));
      q("[data-u-draw]").forEach((el) => {
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: Number(el.dataset.uDraw) / 100, transformOrigin: "left", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-u-hero], [data-u-pop]", { opacity: 1 });
      gsap.utils.toArray<HTMLElement>("[data-u-draw]").forEach((el) => gsap.set(el, { scaleX: Number(el.dataset.uDraw) / 100, transformOrigin: "left" }));
    });
  });
  return null;
}
