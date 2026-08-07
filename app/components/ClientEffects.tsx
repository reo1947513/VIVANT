"use client";

import { useEffect } from "react";

/*
  カルーセル以外の Desktop 版グローバル挙動をマウント後に id/class 経由で配線する。
  ・ヘッダー：スクロール40px超で背景クラス付与
  ・ハンバーガー：×変形・メニュー開閉・項目クリックで閉じる
  ・ヒーロー：読み込み時の時間差フェードアップ（reduced motion では即時表示）
  ・reveal：IntersectionObserver で下からフェードイン（reduced motion では即時表示）
  ・区画リンク：自前でスクロールし、URL に #cast などを残さない
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

    // ---- URL に残ったハッシュを消す ----
    // 表示位置は変えずに、アドレス欄からだけ #cast などを取り除く
    // （履歴も増やさない replaceState を使う）。
    // 別ページやプレビューから /#cast で入ってきた場合も、これで基準のURLに戻る。
    // 消すのは画像などの読み込みが終わってから。ブラウザは読み込み中もハッシュ先へ
    // 位置を合わせ直すため、先に消すと着地点がずれることがある。
    let stripHashRaf = 0;
    const stripHash = () => {
      if (!window.location.hash) return;
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        /* 履歴操作が制限された環境では何もしない */
      }
    };
    const onLoadStripHash = () => {
      stripHashRaf = requestAnimationFrame(stripHash);
    };
    if (document.readyState === "complete") {
      onLoadStripHash();
    } else {
      window.addEventListener("load", onLoadStripHash);
    }

    // ---- 区画リンク：自前でスクロールし、URL は基準のまま保つ ----
    // ヘッダー・モバイルメニュー・フッターの "#cast" 等をまとめて受け取る。
    // 既定の動作（アドレス欄にハッシュが残る移動）を止め、同じ位置へ自分で動かす。
    const onDocClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      const raw = anchor.getAttribute("href");
      if (!raw || !raw.startsWith("#") || raw.length < 2) return;
      if (anchor.getAttribute("target") === "_blank") return;

      const id = decodeURIComponent(raw.slice(1));
      const section = document.getElementById(id);
      if (!section) return; // 対象が無いときは既定の動作に任せる

      e.preventDefault();
      section.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      // キーボード操作でも読み上げ位置が付いてくるよう、移動先に焦点を移す。
      // 焦点移動に伴う二重スクロールは preventScroll で抑える。
      if (!section.hasAttribute("tabindex")) {
        section.setAttribute("tabindex", "-1");
      }
      section.focus({ preventScroll: true });
    };
    document.addEventListener("click", onDocClick);

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
      cancelAnimationFrame(stripHashRaf);
      window.removeEventListener("load", onLoadStripHash);
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onWinLoad);
      hamb?.removeEventListener("click", onHamb);
      navLinks.forEach((a) => a.removeEventListener("click", closeMenu));
      io?.disconnect();
    };
  }, []);

  return null;
}
