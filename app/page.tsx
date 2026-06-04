"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const castMembers = [
    { name: "ゆい", color: "#5a2a00" },
    { name: "れな", color: "#4a2200" },
    { name: "みお", color: "#522800" },
    { name: "ひなの", color: "#481e00" },
  ];

  const galleryGradients = [
    "radial-gradient(ellipse at 30% 40%, #5a2800 0%, #2a1000 60%, #150800 100%)",
    "radial-gradient(ellipse at 70% 30%, #4a2200 0%, #251000 60%, #120600 100%)",
    "radial-gradient(ellipse at 50% 60%, #6a3000 0%, #321500 60%, #1a0800 100%)",
    "radial-gradient(ellipse at 20% 70%, #4a1e00 0%, #230e00 60%, #110500 100%)",
    "radial-gradient(ellipse at 80% 50%, #5a2800 0%, #2a1000 60%, #150800 100%)",
    "radial-gradient(ellipse at 40% 30%, #482000 0%, #221000 60%, #100500 100%)",
  ];

  const pricingRows = [
    { label: "SET料金（60min）", price: "¥3,000" },
    { label: "延長（30min）",    price: "¥1,500" },
    { label: "指名料",           price: "¥2,000" },
    { label: "場内指名",         price: "¥1,000" },
    { label: "サービス料",       price: "10%" },
  ];

  return (
    <div style={{ background: "#0c0600", color: "#f5e6c8" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,5,0,0.96)",
        borderBottom: "1px solid rgba(201,146,43,0.25)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          {/* Logo */}
          <a href="#" style={{ textDecoration: "none" }}>
            <div style={{ color: "#c9922b", fontSize: 13, letterSpacing: "0.18em", fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", lineHeight: 1.1 }}>bar VIVANT</div>
            <div style={{ color: "#7a5a30", fontSize: 7, letterSpacing: "0.35em" }}>KITASHINCHI</div>
          </a>
          {/* Phone */}
          <a href="tel:06-1234-5678" style={{ color: "#c9922b", fontSize: 11, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            06-1234-5678
          </a>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", color: "#c9922b", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5 }}
            aria-label="メニュー"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", width: 20, height: 1,
                background: "#c9922b",
                transition: "all 0.3s",
                ...(menuOpen && i === 0 ? { transform: "translateY(6px) rotate(45deg)" } : {}),
                ...(menuOpen && i === 1 ? { opacity: 0 } : {}),
                ...(menuOpen && i === 2 ? { transform: "translateY(-6px) rotate(-45deg)" } : {}),
              }} />
            ))}
          </button>
        </div>

        {/* Nav Drawer */}
        <div style={{
          maxHeight: menuOpen ? 320 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
          background: "rgba(8,4,0,0.98)",
          borderTop: menuOpen ? "1px solid rgba(201,146,43,0.15)" : "none",
        }}>
          {["CONCEPT", "CAST", "SYSTEM", "SNS", "GALLERY", "ACCESS", "CONTACT"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", textAlign: "center", padding: "12px 0",
                color: "#c9922b", fontSize: 10, letterSpacing: "0.4em",
                textDecoration: "none", fontFamily: "'Cormorant Garamond', serif",
                borderBottom: "1px solid rgba(201,146,43,0.08)",
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", height: "100svh", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* BG gradient — luxury bar atmosphere */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 55% 45%, #3d1a00 0%, #1e0b00 45%, #080300 100%)",
        }} />
        {/* Warm ceiling light */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70%", height: "45%",
          background: "radial-gradient(ellipse at 50% 0%, rgba(201,146,43,0.18) 0%, transparent 70%)",
        }} />
        {/* Ambient bokeh */}
        {[
          { top: "12%", left: "8%",  size: 5, alpha: 0.35 },
          { top: "8%",  left: "78%", size: 4, alpha: 0.28 },
          { top: "22%", left: "88%", size: 7, alpha: 0.2  },
          { top: "30%", left: "14%", size: 3, alpha: 0.4  },
          { top: "55%", left: "5%",  size: 6, alpha: 0.18 },
          { top: "65%", left: "90%", size: 4, alpha: 0.3  },
          { top: "80%", left: "20%", size: 8, alpha: 0.14 },
          { top: "78%", left: "75%", size: 5, alpha: 0.22 },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            top: b.top, left: b.left,
            width: b.size, height: b.size,
            borderRadius: "50%",
            background: `rgba(201,146,43,${b.alpha})`,
            filter: "blur(2px)",
          }} className="animate-shimmer" />
        ))}

        {/* Text content */}
        <div style={{ position: "relative", textAlign: "center", padding: "0 32px" }} className="animate-fade-in">
          <p style={{ color: "#b08040", fontSize: 11, letterSpacing: "0.3em", marginBottom: 22, fontFamily: "'Noto Serif JP', serif" }}>
            北新地で、極上のひとときを。
          </p>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a060", marginBottom: 10 }}>Girls Bar</p>
          <h1 style={{
            fontSize: "clamp(42px, 11vw, 68px)",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "0.04em",
            marginBottom: 6,
            lineHeight: 1.0,
            textShadow: "0 2px 30px rgba(201,146,43,0.5), 0 0 60px rgba(201,146,43,0.2)",
          }}>
            bar VIVANT
          </h1>
          <p style={{ color: "#c9922b", fontSize: 9, letterSpacing: "0.5em", marginBottom: 28 }}>KITASHINCHI</p>
          <div style={{ width: 36, height: 1, background: "linear-gradient(to right, transparent, #c9922b, transparent)", margin: "0 auto 22px" }} />
          <p style={{ color: "#c8a878", fontSize: 12, letterSpacing: "0.12em", fontFamily: "'Noto Serif JP', serif" }}>
            洗練された空間で、心ほどける大人の時間を。
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-arrow" style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 7, letterSpacing: "0.35em", color: "#7a5a30" }}>SCROLL</p>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M6 0v16M1 11l5 6 5-6" stroke="#c9922b" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* ── CONCEPT ── */}
      <section id="concept" style={{ padding: "88px 32px", background: "#100800", position: "relative", overflow: "hidden" }}>
        {/* Corner ornaments */}
        {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 28, height: 28,
            ...(i === 0 ? { top: 20, left: 20, borderTop: "1px solid rgba(201,146,43,0.35)", borderLeft: "1px solid rgba(201,146,43,0.35)" } : {}),
            ...(i === 1 ? { top: 20, right: 20, borderTop: "1px solid rgba(201,146,43,0.35)", borderRight: "1px solid rgba(201,146,43,0.35)" } : {}),
            ...(i === 2 ? { bottom: 20, left: 20, borderBottom: "1px solid rgba(201,146,43,0.35)", borderLeft: "1px solid rgba(201,146,43,0.35)" } : {}),
            ...(i === 3 ? { bottom: 20, right: 20, borderBottom: "1px solid rgba(201,146,43,0.35)", borderRight: "1px solid rgba(201,146,43,0.35)" } : {}),
          }} />
        ))}

        <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
          <SectionLabel en="CONCEPT" />
          <h2 style={{ fontSize: "clamp(17px, 4.5vw, 22px)", fontWeight: 400, lineHeight: 2.0, letterSpacing: "0.14em", marginBottom: 28, color: "#f0d8a8", fontFamily: "'Noto Serif JP', serif" }}>
            大人の夜に寄り添う、<br />上質な遊び場。
          </h2>
          <div style={{ width: 28, height: 1, background: "#c9922b", margin: "0 auto 28px" }} />
          <p style={{ lineHeight: 2.4, fontSize: 13, color: "#b89060", letterSpacing: "0.07em", fontFamily: "'Noto Serif JP', serif" }}>
            北新地の落ち着いた街並みに佇む「bar VIVANT」。<br />
            高級感のある空間と、心からのおもてなしで、<br />
            特別な夜を演出します。<br />
            日常を忘れて、心ゆくまでお楽しみください。
          </p>
        </div>
      </section>

      {/* ── CAST ── */}
      <section id="cast" style={{ padding: "88px 24px", background: "#0c0600" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SectionLabel en="CAST" ja="在籍キャスト" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
            {castMembers.map((member, i) => (
              <div key={i} className="cast-card" style={{ cursor: "pointer" }}>
                {/* Photo placeholder */}
                <div style={{ position: "relative", paddingTop: "130%", overflow: "hidden", borderRadius: 3 }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(ellipse at 50% 25%, ${member.color} 0%, #1a0900 60%, #0c0500 100%)`,
                  }}>
                    {/* Body silhouette */}
                    <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "68%", height: "82%", background: `radial-gradient(ellipse at 50% 15%, ${member.color}cc 0%, #2a1000 55%, transparent 100%)`, borderRadius: "50% 50% 0 0" }} />
                    {/* Bokeh lights */}
                    <div style={{ position: "absolute", top: "8%",  right: "12%", width: 5, height: 5, borderRadius: "50%", background: "rgba(201,146,43,0.5)", filter: "blur(1px)" }} />
                    <div style={{ position: "absolute", top: "18%", left: "8%",  width: 3, height: 3, borderRadius: "50%", background: "rgba(201,146,43,0.4)", filter: "blur(1px)" }} />
                    <div style={{ position: "absolute", top: "6%",  left: "35%", width: 4, height: 4, borderRadius: "50%", background: "rgba(201,146,43,0.35)", filter: "blur(1px)" }} />
                    {/* Gold border */}
                    <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(201,146,43,0.25)" }} />
                  </div>
                </div>
                {/* Name */}
                <div style={{ background: "#12080000", borderTop: "1px solid rgba(201,146,43,0.2)", padding: "8px 4px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#e8d0a0", letterSpacing: "0.2em", fontFamily: "'Noto Serif JP', serif" }}>{member.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <a href="#contact" className="btn-outline-gold" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 32px",
              border: "1px solid #c9922b",
              color: "#c9922b", fontSize: 11, letterSpacing: "0.22em",
              textDecoration: "none",
            }}>
              キャスト一覧を見る <span>›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── SYSTEM ── */}
      <section id="system" style={{ padding: "88px 24px", background: "#100800" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SectionLabel en="SYSTEM" ja="料金システム" />

          <div style={{ border: "1px solid rgba(201,146,43,0.28)", overflow: "hidden" }}>
            {pricingRows.map((row, i) => (
              <div key={i} className="price-row" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "15px 20px",
                borderBottom: i < pricingRows.length - 1 ? "1px solid rgba(201,146,43,0.12)" : "none",
                background: i % 2 === 0 ? "rgba(201,146,43,0.035)" : "transparent",
              }}>
                <span style={{ fontSize: 13, color: "#c0a070", letterSpacing: "0.04em" }}>{row.label}</span>
                <span style={{ fontSize: 14, color: "#e8c888", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.05em" }}>{row.price}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "right", fontSize: 10, color: "#705030", marginTop: 10, letterSpacing: "0.05em" }}>
            ※表示価格はすべて税込です。
          </p>
        </div>
      </section>

      {/* ── SNS ── */}
      <section id="sns" style={{ padding: "88px 24px", background: "#0c0600" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SectionLabel en="SNS" ja="最新情報はSNSをチェック" />

          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 8 }}>
            {/* Instagram */}
            <a href="#" className="sns-icon" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18,
                background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <span style={{ color: "#806040", fontSize: 9, letterSpacing: "0.12em" }}>Instagram</span>
            </a>

            {/* TikTok */}
            <a href="#" className="sns-icon" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18,
                background: "#010101",
                border: "1px solid rgba(201,146,43,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </div>
              <span style={{ color: "#806040", fontSize: 9, letterSpacing: "0.12em" }}>TikTok</span>
            </a>

            {/* X */}
            <a href="#" className="sns-icon" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18,
                background: "#010101",
                border: "1px solid rgba(201,146,43,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span style={{ color: "#806040", fontSize: 9, letterSpacing: "0.12em" }}>X</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" style={{ padding: "88px 24px", background: "#100800" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SectionLabel en="GALLERY" ja="店内ギャラリー" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 32 }}>
            {galleryGradients.map((grad, i) => (
              <div key={i} className="gallery-item" style={{ position: "relative", paddingTop: "75%", overflow: "hidden", borderRadius: 3, cursor: "pointer" }}>
                <div style={{ position: "absolute", inset: 0, background: grad }}>
                  {/* Chandelier light */}
                  <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "50%", height: "35%", background: "radial-gradient(ellipse at 50% 0%, rgba(201,146,43,0.55) 0%, transparent 100%)", filter: "blur(5px)" }} />
                  {/* Table */}
                  <div style={{ position: "absolute", bottom: "10%", left: "5%", right: "5%", height: "28%", background: "radial-gradient(ellipse at 50% 100%, rgba(80,35,0,0.6) 0%, transparent 100%)" }} />
                  <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(201,146,43,0.2)" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <a href="#" className="btn-outline-gold" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 32px",
              border: "1px solid #c9922b",
              color: "#c9922b", fontSize: 11, letterSpacing: "0.22em",
              textDecoration: "none",
            }}>
              ギャラリーをもっと見る <span>›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── ACCESS ── */}
      <section id="access" style={{ padding: "88px 24px", background: "#0c0600" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SectionLabel en="ACCESS" ja="アクセス" />

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <p style={{ fontSize: 11, color: "#706040", letterSpacing: "0.06em", marginBottom: 10 }}>〒530-0002</p>
              <p style={{ fontSize: 13, color: "#c0a070", letterSpacing: "0.05em", lineHeight: 1.9, marginBottom: 18, fontFamily: "'Noto Serif JP', serif" }}>
                大阪府大阪市北区曽根崎新地1-○-○<br />
                ○○ビル 2F
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "🚃", text: "JR北新地駅 徒歩3分" },
                  { icon: "🚇", text: "地下鉄西梅田駅 徒歩5分" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: "#907050", letterSpacing: "0.05em" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 4, overflow: "hidden", border: "1px solid rgba(201,146,43,0.28)", background: "#140a00" }}>
              {/* Grid lines */}
              {[38, 58, 72].map((top, i) => (
                <div key={i} style={{ position: "absolute", top: `${top}%`, left: 0, right: 0, height: 1, background: "rgba(201,146,43,0.12)" }} />
              ))}
              {[25, 48, 68].map((left, i) => (
                <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${left}%`, width: 1, background: "rgba(201,146,43,0.12)" }} />
              ))}
              {/* Block buildings */}
              {[
                { top: 30, left: 8, w: 14, h: 22 }, { top: 25, left: 28, w: 16, h: 30 },
                { top: 35, left: 50, w: 12, h: 20 }, { top: 28, left: 72, w: 18, h: 26 },
              ].map((b, i) => (
                <div key={i} style={{ position: "absolute", top: `${b.top}%`, left: `${b.left}%`, width: `${b.w}%`, height: `${b.h}%`, background: "rgba(40,20,0,0.8)", border: "1px solid rgba(201,146,43,0.08)" }} />
              ))}
              {/* Pin */}
              <div style={{ position: "absolute", top: "38%", left: "44%", transform: "translate(-50%, -100%)" }}>
                <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "14px solid #c9922b", margin: "0 auto" }} />
                <div style={{ width: 4, height: 4, background: "#c9922b", borderRadius: "50%", margin: "0 auto" }} />
              </div>
              {/* Label */}
              <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(201,146,43,0.92)", color: "#0c0600", fontSize: 9, padding: "4px 8px", borderRadius: 2, letterSpacing: "0.06em", fontWeight: 600 }}>
                bar VIVANT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "88px 24px", background: "#100800" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <SectionLabel en="CONTACT" ja="ご予約・お問い合わせはこちら" />

          <a
            href="mailto:info@bar-vivant.jp"
            className="btn-gold-cta"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%",
              padding: "17px 24px",
              background: "linear-gradient(135deg, #c9922b 0%, #e2a832 50%, #c9922b 100%)",
              color: "#fff",
              fontSize: 14,
              letterSpacing: "0.12em",
              textDecoration: "none",
              borderRadius: 40,
              fontFamily: "'Noto Serif JP', serif",
              boxShadow: "0 4px 20px rgba(201,146,43,0.38)",
              marginBottom: 20,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            ご予約・お問い合わせフォーム
            <span style={{ fontSize: 11 }}>›</span>
          </a>

          <p style={{ textAlign: "center", fontSize: 11, color: "#706040", letterSpacing: "0.1em" }}>
            24時間受付中・当日予約もOK
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#060300", padding: "52px 24px 28px", borderTop: "1px solid rgba(201,146,43,0.18)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ color: "#c9922b", fontSize: 22, letterSpacing: "0.12em", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", marginBottom: 5 }}>
              bar VIVANT
            </div>
            <div style={{ color: "#604030", fontSize: 8, letterSpacing: "0.45em", marginBottom: 3 }}>KITASHINCHI</div>
            <div style={{ color: "#604030", fontSize: 8, letterSpacing: "0.3em" }}>Girls Bar</div>
          </div>

          <div style={{ width: 24, height: 1, background: "rgba(201,146,43,0.35)", margin: "0 auto 28px" }} />

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 28 }}>
            {["プライバシーポリシー", "特定商取引法に基づく表記"].map((link) => (
              <a key={link} href="#" style={{ fontSize: 9, color: "#604030", letterSpacing: "0.05em", textDecoration: "none" }}>
                {link}
              </a>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 9, color: "#3a2018", letterSpacing: "0.12em" }}>
            © bar VIVANT All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

/* ── Shared component ── */
function SectionLabel({ en, ja }: { en: string; ja?: string }) {
  return (
    <div style={{ marginBottom: ja ? 8 : 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9922b)" }} />
        <p style={{ color: "#c9922b", fontSize: 10, letterSpacing: "0.4em", fontFamily: "'Cormorant Garamond', serif", whiteSpace: "nowrap" }}>{en}</p>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9922b)" }} />
      </div>
      {ja && <p style={{ textAlign: "center", color: "#7a5530", fontSize: 10, letterSpacing: "0.18em", marginTop: 6, marginBottom: 36 }}>{ja}</p>}
    </div>
  );
}
