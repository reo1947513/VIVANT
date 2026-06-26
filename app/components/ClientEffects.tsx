"use client";

import { useEffect } from "react";

/*
  カルーセル以外の Desktop 版グローバル挙動をマウント後に id/class 経由で配線する。
  ・ヘッダー：スクロール40px超で背景クラス付与
  ・ハンバーガー：×変形・メニュー開閉・項目クリックで閉じる
  ・ヒーロー：読み込み時の時間差フェードアップ（reduced motion では即時表示）
  ・reveal：IntersectionObserver で下からフェードイン（reduced motion では即時表示）
  reveal/ヒーローの reduced motion 抑制は Desktop 版と同じ（カルーセルだけ例外で動く）。
*/
export default function ClientEffects() {
  useEffect(() => {
    const reduceMotion = !!(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    // ---- ヘッダー：スクロール40pxで背景付与 ----
    const header = document.getElementById("header");
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- ハンバーガー：×変形・メニュー開閉 ----
    const hamb = document.getElementById("hamb");
    const mobileNav = document.getElementById("mobileNav");
    const closeMenu = () => {
      hamb?.classList.remove("open");
      mobileNav?.classList.remove("open");
      hamb?.setAttribute("aria-expanded", "false");
    };
    const onHamb = () => {
      if (!hamb || !mobileNav) return;
      const open = hamb.classList.toggle("open");
      mobileNav.classList.toggle("open", open);
      hamb.setAttribute("aria-expanded", open ? "true" : "false");
    };
    hamb?.addEventListener("click", onHamb);
    const navLinks = mobileNav ? Array.from(mobileNav.querySelectorAll("a")) : [];
    navLinks.forEach((a) => a.addEventListener("click", closeMenu));

    // ---- ヒーロー：読み込み時に時間差フェードアップ ----
    const hero = document.getElementById("top");
    const addLoaded = () => hero?.classList.add("loaded");
    const onWinLoad = () => requestAnimationFrame(addLoaded);
    if (reduceMotion) {
      addLoaded();
    } else if (document.readyState === "complete") {
      addLoaded();
    } else {
      window.addEventListener("load", onWinLoad);
    }

    // ---- スクロールで下からフェードイン ----
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    let io: IntersectionObserver | null = null;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io!.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onWinLoad);
      hamb?.removeEventListener("click", onHamb);
      navLinks.forEach((a) => a.removeEventListener("click", closeMenu));
      io?.disconnect();
    };
  }, []);

  return null;
}
