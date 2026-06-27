/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * 画像を相対パスで読み込み、ファイルが無ければ onerror で自身を隠す。
 * 隠れると下の CSS グラデーションのプレースホルダが見える（Desktop版と同じ挙動）。
 * 所定パス（public/images/...）に画像を置けば自動で表示される。
 */
export default function FallbackImg({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
