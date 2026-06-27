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

    // ---- 再読み込み時は前回のスクロール位置を復元せず、必ず最上部から表示 ----
    // ブラウザの自動復元を切る（reload/戻る進むでの位置復元を無効化）。
    if ("scrollRestoration" in history) {
      try {
        history.scrollRestoration = "manual";
      } catch {
        /* 一部環境で代入不可でも無視 */
      }
    }
    // リロード、またはハッシュ無しの通常表示では最上部へ即時スクロール。
    // （#cast 等のハッシュ付き深いリンクでの新規アクセスは、そのセクションへ飛ぶ挙動を尊重する）
    const navEntry = (
      typeof performance !== "undefined" && performance.getEntriesByType
        ? (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
        : undefined
    );
    const isReload = navEntry ? navEntry.type === "reload" : false;
    if (isReload || !window.location.hash) {
      // scroll-behavior:smooth の影響でアニメ移動にならないよう、一時的に auto にして即時で戻す
      const htmlEl = document.documentElement;
      const prevBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      htmlEl.style.scrollBehavior = prevBehavior;
    }

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
