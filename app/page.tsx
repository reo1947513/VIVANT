"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const castMembers = [
    { name: "ゆい", id: 1 },
    { name: "れな", id: 2 },
    { name: "みお", id: 3 },
    { name: "ひなの", id: 4 },
  ];

  const galleryImages = [1, 2, 3, 4, 5, 6];

  return (
    <div style={{ background: "#0c0600", color: "#f5e6c8", fontFamily: "'Noto Serif JP', 'Hiragino Mincho ProN', serif" }}>

      {/* ── HEADER ── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(12,6,0,0.95)", borderBottom: "1px solid rgba(201,146,43,0.3)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div>
            <div style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.2em", fontFamily: "'Cormorant Garamond', serif" }}>bar VIVANT</div>
            <div style={{ color: "#a08050", fontSize: 8, letterSpacing: "0.3em" }}>KITASHINCHI</div>
          </div>
          <a href="tel:06-1234-5678" style={{ color: "#c9922b", fontSize: 12, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            <span style={{ fontSize: 14 }}>📞</span> 06-1234-5678
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", color: "#c9922b", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4 }}
          >
            <span style={{ display: "block", width: 22, height: 1, background: "#c9922b" }} />
            <span style={{ display: "block", width: 22, height: 1, background: "#c9922b" }} />
            <span style={{ display: "block", width: 22, height: 1, background: "#c9922b" }} />
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav style={{ background: "rgba(12,6,0,0.98)", borderTop: "1px solid rgba(201,146,43,0.2)", padding: "16px 0" }}>
            {["CONCEPT", "CAST", "SYSTEM", "SNS", "GALLERY", "ACCESS", "CONTACT"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: "block", textAlign: "center", padding: "10px 0", color: "#c9922b", fontSize: 11, letterSpacing: "0.3em", textDecoration: "none", fontFamily: "'Cormorant Garamond', serif" }}
              >
                {item}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* ── MAIN VISUAL ── */}
      <section style={{ position: "relative", height: "100svh", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* Background gradient simulating warm bar interior */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 60% 40%, #3d1a00 0%, #1a0800 40%, #0a0400 100%)",
        }} />
        {/* Decorative light effect */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, rgba(201,146,43,0.15) 0%, transparent 60%)",
        }} />
        {/* Bokeh dots */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            borderRadius: "50%",
            background: `rgba(201,146,43,${0.1 + (i % 4) * 0.08})`,
            top: `${10 + (i * 7) % 80}%`,
            left: `${5 + (i * 11) % 90}%`,
            filter: "blur(2px)",
          }} />
        ))}
        <div style={{ position: "relative", textAlign: "center", padding: "0 24px" }}>
          <p style={{ color: "#c9922b", fontSize: 13, letterSpacing: "0.25em", marginBottom: 20 }}>北新地で、極上のひとときを。</p>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, letterSpacing: "0.15em", color: "#e0b878" }}>Girls Bar</span>
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 10vw, 60px)",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "0.05em",
            marginBottom: 6,
            lineHeight: 1.1,
            textShadow: "0 2px 20px rgba(201,146,43,0.5)",
          }}>
            bar VIVANT
          </h1>
          <p style={{ color: "#c9922b", fontSize: 10, letterSpacing: "0.4em", marginBottom: 24 }}>KITASHINCHI</p>
          <div style={{ width: 40, height: 1, background: "#c9922b", margin: "0 auto 20px" }} />
          <p style={{ color: "#e0c090", fontSize: 12, letterSpacing: "0.15em" }}>洗練された空間で、心ほどける大人の時間を。</p>
        </div>
        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 8, letterSpacing: "0.3em", color: "#a08050" }}>SCROLL</p>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #c9922b, transparent)" }} />
        </div>
      </section>

      {/* ── CONCEPT ── */}
      <section id="concept" style={{ padding: "80px 24px", background: "#100800", position: "relative" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 40 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>CONCEPT</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>

          <h2 style={{ textAlign: "center", fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 400, lineHeight: 1.8, letterSpacing: "0.12em", marginBottom: 32, color: "#f0d8a8" }}>
            大人の夜に寄り添う、<br />上質な遊び場。
          </h2>

          <div style={{ width: 30, height: 1, background: "#c9922b", margin: "0 auto 32px" }} />

          <p style={{ textAlign: "center", lineHeight: 2.2, fontSize: 13, color: "#c8a878", letterSpacing: "0.08em" }}>
            北新地の落ち着いた街並みに佇む「bar VIVANT」。<br />
            高級感のある空間と、心からのおもてなしで、<br />
            特別な夜を演出します。<br />
            日常を忘れて、心ゆくまでお楽しみください。
          </p>
        </div>

        {/* Decorative corners */}
        <div style={{ position: "absolute", top: 24, left: 24, width: 30, height: 30, borderTop: "1px solid rgba(201,146,43,0.4)", borderLeft: "1px solid rgba(201,146,43,0.4)" }} />
        <div style={{ position: "absolute", top: 24, right: 24, width: 30, height: 30, borderTop: "1px solid rgba(201,146,43,0.4)", borderRight: "1px solid rgba(201,146,43,0.4)" }} />
        <div style={{ position: "absolute", bottom: 24, left: 24, width: 30, height: 30, borderBottom: "1px solid rgba(201,146,43,0.4)", borderLeft: "1px solid rgba(201,146,43,0.4)" }} />
        <div style={{ position: "absolute", bottom: 24, right: 24, width: 30, height: 30, borderBottom: "1px solid rgba(201,146,43,0.4)", borderRight: "1px solid rgba(201,146,43,0.4)" }} />
      </section>

      {/* ── CAST ── */}
      <section id="cast" style={{ padding: "80px 24px", background: "#0c0600" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>CAST</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>
          <p style={{ textAlign: "center", color: "#a08050", fontSize: 11, letterSpacing: "0.2em", marginBottom: 40 }}>在籍キャスト</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            {castMembers.map((member) => (
              <div key={member.id} style={{ position: "relative", overflow: "hidden", borderRadius: 4 }}>
                {/* Cast photo placeholder with warm gradient */}
                <div style={{
                  width: "100%",
                  paddingTop: "130%",
                  position: "relative",
                  background: `radial-gradient(ellipse at 50% 30%, #4a2000 0%, #2a1000 50%, #1a0800 100%)`,
                  overflow: "hidden",
                }}>
                  {/* Silhouette shape */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "70%",
                    height: "85%",
                    background: "radial-gradient(ellipse at 50% 20%, #6a3010 0%, #3a1800 60%, transparent 100%)",
                    borderRadius: "50% 50% 0 0",
                  }} />
                  {/* Bokeh lights */}
                  <div style={{ position: "absolute", top: "10%", right: "15%", width: 6, height: 6, borderRadius: "50%", background: "rgba(201,146,43,0.4)", filter: "blur(1px)" }} />
                  <div style={{ position: "absolute", top: "20%", left: "10%", width: 4, height: 4, borderRadius: "50%", background: "rgba(201,146,43,0.3)", filter: "blur(1px)" }} />
                  <div style={{ position: "absolute", top: "5%", left: "30%", width: 3, height: 3, borderRadius: "50%", background: "rgba(201,146,43,0.5)", filter: "blur(1px)" }} />
                  {/* Golden border overlay */}
                  <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(201,146,43,0.3)" }} />
                </div>
                <div style={{ background: "rgba(16,8,0,0.9)", padding: "8px 4px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#f0d8a8", letterSpacing: "0.15em" }}>{member.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <a href="#contact" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              border: "1px solid #c9922b",
              color: "#c9922b",
              fontSize: 12,
              letterSpacing: "0.2em",
              textDecoration: "none",
              transition: "all 0.3s",
            }}>
              キャスト一覧を見る <span style={{ fontSize: 10 }}>›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── SYSTEM / PRICING ── */}
      <section id="system" style={{ padding: "80px 24px", background: "#100800" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>SYSTEM</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>
          <p style={{ textAlign: "center", color: "#a08050", fontSize: 11, letterSpacing: "0.2em", marginBottom: 40 }}>料金システム</p>

          <div style={{ border: "1px solid rgba(201,146,43,0.3)", overflow: "hidden" }}>
            {[
              { label: "SET料金（60min）", price: "¥3,000" },
              { label: "延長（30min）", price: "¥1,500" },
              { label: "指名料", price: "¥2,000" },
              { label: "場内指名", price: "¥1,000" },
              { label: "サービス料", price: "10%" },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: i < 4 ? "1px solid rgba(201,146,43,0.15)" : "none",
                background: i % 2 === 0 ? "rgba(201,146,43,0.04)" : "transparent",
              }}>
                <span style={{ fontSize: 13, color: "#c8a878", letterSpacing: "0.05em" }}>{row.label}</span>
                <span style={{ fontSize: 14, color: "#e0b878", fontFamily: "'Cormorant Garamond', serif" }}>{row.price}</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "right", fontSize: 10, color: "#806040", marginTop: 12, letterSpacing: "0.05em" }}>
            ※表示価格はすべて税込です。
          </p>
        </div>
      </section>

      {/* ── SNS ── */}
      <section id="sns" style={{ padding: "80px 24px", background: "#0c0600" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>SNS</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>
          <p style={{ textAlign: "center", color: "#a08050", fontSize: 11, letterSpacing: "0.2em", marginBottom: 48 }}>最新情報はSNSをチェック</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 48 }}>
            {/* Instagram */}
            <a href="#" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <span style={{ color: "#a08050", fontSize: 10, letterSpacing: "0.1em" }}>Instagram</span>
            </a>

            {/* TikTok */}
            <a href="#" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "#010101",
                border: "1px solid rgba(201,146,43,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </div>
              <span style={{ color: "#a08050", fontSize: 10, letterSpacing: "0.1em" }}>TikTok</span>
            </a>

            {/* X (Twitter) */}
            <a href="#" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "#010101",
                border: "1px solid rgba(201,146,43,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span style={{ color: "#a08050", fontSize: 10, letterSpacing: "0.1em" }}>X</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" style={{ padding: "80px 24px", background: "#100800" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>GALLERY</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>
          <p style={{ textAlign: "center", color: "#a08050", fontSize: 11, letterSpacing: "0.2em", marginBottom: 40 }}>店内ギャラリー</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 32 }}>
            {galleryImages.map((_, i) => {
              const gradients = [
                "radial-gradient(ellipse at 30% 40%, #5a2800 0%, #2a1000 60%, #150800 100%)",
                "radial-gradient(ellipse at 70% 30%, #4a2200 0%, #251000 60%, #120600 100%)",
                "radial-gradient(ellipse at 50% 60%, #6a3000 0%, #321500 60%, #1a0800 100%)",
                "radial-gradient(ellipse at 20% 70%, #4a1e00 0%, #230e00 60%, #110500 100%)",
                "radial-gradient(ellipse at 80% 50%, #5a2800 0%, #2a1000 60%, #150800 100%)",
                "radial-gradient(ellipse at 40% 30%, #482000 0%, #221000 60%, #100500 100%)",
              ];
              return (
                <div key={i} style={{ position: "relative", paddingTop: "75%", overflow: "hidden", borderRadius: 2 }}>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: gradients[i % gradients.length],
                    transition: "transform 0.4s ease",
                  }}>
                    {/* Chandelier / light source */}
                    <div style={{
                      position: "absolute",
                      top: "10%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "40%",
                      height: "30%",
                      background: "radial-gradient(ellipse at 50% 0%, rgba(201,146,43,0.6) 0%, transparent 100%)",
                      filter: "blur(4px)",
                    }} />
                    {/* Table/furniture suggestion */}
                    <div style={{
                      position: "absolute",
                      bottom: "15%",
                      left: "10%",
                      right: "10%",
                      height: "25%",
                      background: "radial-gradient(ellipse at 50% 100%, rgba(100,50,0,0.5) 0%, transparent 100%)",
                    }} />
                    <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(201,146,43,0.2)" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <a href="#" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              border: "1px solid #c9922b",
              color: "#c9922b",
              fontSize: 12,
              letterSpacing: "0.2em",
              textDecoration: "none",
            }}>
              ギャラリーをもっと見る <span style={{ fontSize: 10 }}>›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── ACCESS ── */}
      <section id="access" style={{ padding: "80px 24px", background: "#0c0600" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>ACCESS</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>
          <p style={{ textAlign: "center", color: "#a08050", fontSize: 11, letterSpacing: "0.2em", marginBottom: 40 }}>アクセス</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Address */}
            <div>
              <p style={{ fontSize: 12, color: "#806040", letterSpacing: "0.05em", marginBottom: 12 }}>〒530-0002</p>
              <p style={{ fontSize: 13, color: "#c8a878", letterSpacing: "0.05em", lineHeight: 1.8, marginBottom: 16 }}>
                大阪府大阪市北区曽根崎新地1-○-○<br />
                ○○ビル 2F
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#c9922b", fontSize: 14 }}>🚃</span>
                  <span style={{ fontSize: 12, color: "#a08050", letterSpacing: "0.05em" }}>JR北新地駅 徒歩3分</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#c9922b", fontSize: 14 }}>🚇</span>
                  <span style={{ fontSize: 12, color: "#a08050", letterSpacing: "0.05em" }}>地下鉄西梅田駅 徒歩5分</span>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div style={{
              width: "100%",
              height: 200,
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(201,146,43,0.3)",
              background: "#1a0e04",
            }}>
              {/* Stylized map */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a0e04 0%, #0f0802 100%)" }} />
              {/* Street lines */}
              <div style={{ position: "absolute", top: "40%", left: 0, right: 0, height: 1, background: "rgba(201,146,43,0.2)" }} />
              <div style={{ position: "absolute", top: "60%", left: 0, right: 0, height: 1, background: "rgba(201,146,43,0.15)" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "30%", width: 1, background: "rgba(201,146,43,0.2)" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "60%", width: 1, background: "rgba(201,146,43,0.15)" }} />
              {/* Pin */}
              <div style={{ position: "absolute", top: "38%", left: "44%", transform: "translate(-50%, -100%)", textAlign: "center" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50% 50% 50% 0", background: "#c9922b",
                  transform: "rotate(-45deg)", margin: "0 auto",
                }} />
              </div>
              {/* Label */}
              <div style={{
                position: "absolute", bottom: 12, right: 12,
                background: "rgba(201,146,43,0.9)", color: "#0c0600",
                fontSize: 10, padding: "4px 8px", borderRadius: 2, letterSpacing: "0.05em",
                fontWeight: "bold",
              }}>
                bar VIVANT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "80px 24px", background: "#100800" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
            <p style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>CONTACT</p>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
          </div>
          <p style={{ textAlign: "center", color: "#a08050", fontSize: 11, letterSpacing: "0.2em", marginBottom: 48 }}>ご予約・お問い合わせはこちら</p>

          <a
            href="mailto:info@bar-vivant.jp"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "18px 24px",
              background: "linear-gradient(135deg, #c9922b 0%, #e0a030 50%, #c9922b 100%)",
              color: "#fff",
              textAlign: "center",
              fontSize: 14,
              letterSpacing: "0.15em",
              textDecoration: "none",
              borderRadius: 40,
              fontWeight: 400,
              boxShadow: "0 4px 20px rgba(201,146,43,0.4)",
              marginBottom: 24,
            } as React.CSSProperties}
          >
            <span style={{ fontSize: 16 }}>✉</span>
            ご予約・お問い合わせフォーム
            <span style={{ fontSize: 12 }}>›</span>
          </a>

          <p style={{ textAlign: "center", fontSize: 11, color: "#806040", letterSpacing: "0.1em" }}>
            24時間受付中・当日予約もOK
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080400", padding: "48px 24px 32px", borderTop: "1px solid rgba(201,146,43,0.2)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ color: "#c9922b", fontSize: 20, letterSpacing: "0.15em", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", marginBottom: 4 }}>
              bar VIVANT
            </div>
            <div style={{ color: "#806040", fontSize: 9, letterSpacing: "0.4em", marginBottom: 4 }}>KITASHINCHI</div>
            <div style={{ color: "#806040", fontSize: 9, letterSpacing: "0.25em" }}>Girls Bar</div>
          </div>

          <div style={{ width: 30, height: 1, background: "rgba(201,146,43,0.4)", margin: "0 auto 32px" }} />

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32 }}>
            {["プライバシーポリシー", "特定商取引法に基づく表記"].map((link) => (
              <a key={link} href="#" style={{ fontSize: 10, color: "#806040", letterSpacing: "0.05em", textDecoration: "none" }}>
                {link}
              </a>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 10, color: "#504030", letterSpacing: "0.1em" }}>
            © bar VIVANT All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
