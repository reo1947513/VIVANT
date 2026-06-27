"use client";

import { useEffect, useState } from "react";

/**
 * トップに戻るボタン。
 * - 縦に一定量（SHOW_AT）スクロールした時だけ右下にフェードで表示。最上部付近では非表示。
 * - 押すとページ最上部へ smooth スクロール（prefers-reduced-motion では即時）。
 * - 既存のテラコッタ・オレンジ基調に馴染む控えめな円形ボタン。上向き矢印・aria-label 付き。
 * - 出現/消失のフェードは CSS（.to-top / .to-top.is-visible）で制御。reduced motion 環境では
 *   グローバルの transition:none により即時表示となり、刺激を抑える。
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const SHOW_AT = 500; // px：これ以上スクロールしたら表示（最上部付近では隠す）
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      setVisible(y > SHOW_AT);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // 初期状態を反映（途中位置で読み込まれた場合に備える）
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduceMotion = !!(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={"to-top" + (visible ? " is-visible" : "")}
      aria-label="ページの先頭へ戻る"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={toTop}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
