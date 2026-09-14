import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import richesData from "../data/riches_of_christ_kjv_data.json";

/**
 * The Riches of Christ — KJV Annotated Edition
 * Live at /riches-of-christ on discussionsexegetica.com.
 *
 * Data source: riches_of_christ_kjv_data.json (281 verses, 25 categories).
 * Every verse's `link` field uses the live Bible-tool routing pattern
 *   https://discussionsexegetica.com/bible?ref={Book}.{Chapter}.{Verse}
 * (multi-verse references link to the first verse of the range).
 *
 * Navigation: every category has Top / Previous / Next links, plus a
 * linked Quick Navigation list at the top of the page — all real anchor
 * jumps, so the browser's own Back button returns you to where you were.
 *
 * Read-aloud: uses the browser's built-in Web Speech API
 * (window.speechSynthesis) — no external dependency. A fixed player bar
 * offers Play/Pause, Previous verse, Next verse, and Stop. Tapping
 * "Listen" next to any verse jumps playback straight to that verse.
 * Support varies slightly by browser; where speechSynthesis is
 * unavailable, the bar shows a plain notice instead of controls.
 */

const BIBLE_LINK_BASE = "https://discussionsexegetica.com/bible";

const TOTAL_VERSES = richesData.reduce((sum, c) => sum + c.verses.length, 0);
const YEAR = new Date().getFullYear();

function buildFlatVerses(categories) {
  const out = [];
  for (const c of categories) {
    for (const v of c.verses) {
      out.push({ id: `c${c.num}-${slugify(v.ref)}`, ref: v.ref, text: v.kjv });
    }
  }
  return out;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function dedupeByRef(categories) {
  const seen = new Set();
  const out = [];
  for (const c of categories) {
    for (const v of c.verses) {
      if (seen.has(v.ref)) continue;
      seen.add(v.ref);
      out.push(v);
    }
  }
  return out;
}

export default function RichesOfChrist() {
  const flatVerses = useMemo(() => buildFlatVerses(richesData), []);
  const player = useReadAloudPlayer(flatVerses);

  // If arrived via the homepage treasure chest's "Listen" option, start reading immediately.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("listen") === "1") {
      const t = setTimeout(() => player.play(), 400);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={styles.page}>
      <header style={styles.masthead}>
        <Link to="/" style={styles.backLink}>← Home</Link>
        <h1 id="top" style={styles.h1}>
          The Riches of Christ
        </h1>
        <p style={styles.sub}>
          God&rsquo;s Blessings and Promises in the Bible — KJV Annotated Edition
        </p>
        <p style={styles.lede}>
          A comprehensive, categorized reference of {TOTAL_VERSES} passages
          in the King James Version, prepared for discussionsexegetica.com.
          Every reference links to the verse in our Bible study tool. Use
          the player below to have any passage read aloud.
        </p>
      </header>

      <div style={styles.wrap}>
        <div style={styles.box}>
          <h2 style={styles.boxH2}>Copyright &amp; Source Notice</h2>
          <p style={styles.boxP}>
            Scripture quotations are from the King James Version (public
            domain). No copyright is claimed in the biblical text itself.
          </p>
          <p style={styles.boxP}>
            The compilation, categorization, context notes, and original
            commentary in this work — collectively, <em>The Riches of Christ</em> — are &copy; {YEAR} Discussionsexegetica.com, a
            community initiative of <strong>Lives In Motion Ltd</strong>. All
            rights reserved. Shareable for personal study, teaching, and
            ministry with attribution; contact Discussionsexegetica.com to
            republish elsewhere.
          </p>
        </div>

        <div style={styles.box}>
          <h2 style={styles.boxH2}>How to use this page</h2>
          <p style={styles.boxP}>
            Notes in italics below each category give context or conditions
            — skip them if you just want the verse text. <strong>[NC]</strong>{" "}
            marks New Covenant promises to believers; <strong>[IS]</strong>{" "}
            marks promises to Israel under the Old Covenant.{" "}
            <strong>[Disputed]</strong> flags points of genuine evangelical
            disagreement. Tap <strong>Listen</strong> next to any verse to
            have the player start reading from there.
          </p>
        </div>

        <div id="downloads" style={{ ...styles.box, scrollMarginTop: 20 }}>
          <h2 style={styles.boxH2}>Download this book</h2>
          <p style={styles.boxP}>
            Read on this page, or take it with you — both editions, in PDF or EPUB.
          </p>
          <div style={styles.downloadGrid}>
            <a href="/riches-of-christ/The-Riches-of-Christ-KJV-Annotated.pdf" style={styles.downloadLink} download>
              📄 Annotated — PDF
            </a>
            <a href="/riches-of-christ/The-Riches-of-Christ-KJV-Annotated.epub" style={styles.downloadLink} download>
              📱 Annotated — EPUB
            </a>
            <a href="/riches-of-christ/The-Riches-of-Christ-KJV-Verses-Only.pdf" style={styles.downloadLink} download>
              📄 Verses Only — PDF
            </a>
            <a href="/riches-of-christ/The-Riches-of-Christ-KJV-Verses-Only.epub" style={styles.downloadLink} download>
              📱 Verses Only — EPUB
            </a>
          </div>
        </div>

        <nav style={styles.toc} className="roc-toc">
          {richesData.map((c) => (
            <a key={c.num} href={`#cat${c.num}`} style={styles.tocLink}>
              <span style={styles.tocNum}>{String(c.num).padStart(2, "0")}</span>
              {c.title}
            </a>
          ))}
        </nav>

        {richesData.map((c, idx) => {
          const prev =
            idx === 0
              ? { href: "#top", label: "\u2190 Top" }
              : { href: `#cat${richesData[idx - 1].num}`, label: `\u2190 ${richesData[idx - 1].title}` };
          const next =
            idx === richesData.length - 1
              ? { href: "#appendix-a", label: "Appendix A \u2192" }
              : { href: `#cat${richesData[idx + 1].num}`, label: `${richesData[idx + 1].title} \u2192` };
          return (
            <section
              key={c.num}
              id={`cat${c.num}`}
              style={{ ...styles.category, borderTop: idx === 0 ? "none" : styles.category.borderTop }}
            >
              <h2 style={styles.catH2}>
                {c.num}. {c.title}
              </h2>
              <span style={styles.catTag}>{c.tag}</span>
              <p style={styles.secnav}>
                <a href={prev.href} style={styles.secnavLink}>{prev.label}</a>{" "}
                &middot;{" "}
                <a href="#top" style={styles.secnavLink}>&uarr; Quick Nav</a>{" "}
                &middot;{" "}
                <a href={next.href} style={styles.secnavLink}>{next.label}</a>
              </p>

              {c.verses.map((v, i) => {
                const vid = `c${c.num}-${slugify(v.ref)}`;
                const isReading = player.currentId === vid;
                return (
                  <div
                    key={i}
                    id={`v-${vid}`}
                    style={{ ...styles.verse, background: isReading ? "#fff3d6" : "transparent" }}
                  >
                    <div style={styles.ref}>
                      <a href={v.link || `${BIBLE_LINK_BASE}#`} target="_blank" rel="noopener noreferrer" style={styles.refLink}>
                        {v.ref}
                      </a>
                      {v.tag && <span style={styles.vtag}>[{v.tag}]</span>}
                      <button type="button" style={styles.listenBtn} onClick={() => player.playFrom(vid)}>
                        &#128266; Listen
                      </button>
                    </div>
                    <div style={styles.kjvtext}>{v.kjv}</div>
                  </div>
                );
              })}

              <p style={styles.context}>{c.note}</p>
            </section>
          );
        })}

        <h2 id="appendix-a" style={styles.appendixH}>
          Appendix A — Master Index of Every Verse
        </h2>
        <p>Every reference below links directly to the verse on the Discussions Exegetica Bible study tool.</p>
        <ul style={styles.index} className="roc-index">
          {dedupeByRef(richesData).map((v) => (
            <li key={v.ref} style={styles.indexLi}>
              <a href={v.link || `${BIBLE_LINK_BASE}#`} target="_blank" rel="noopener noreferrer" style={styles.indexLink}>
                {v.ref}
              </a>
            </li>
          ))}
        </ul>

        <footer style={styles.footer}>
          Compiled for Discussionsexegetica.com, a community initiative of
          Lives In Motion Ltd. Full appendices (Promises to Pray, 30-Day
          Reading Plan, Confessions &amp; Declarations, One-Page Summary) are
          included in the companion PDF/DOCX edition.
        </footer>
      </div>

      <ReadAloudBar player={player} />

      <style>{`
        @media (max-width: 640px) {
          .roc-toc { columns: 1 !important; }
          .roc-index { columns: 1 !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Read-aloud player (Web Speech API) ---------- */

function useReadAloudPlayer(flatVerses) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!window.speechSynthesis);
  }, []);

  const speakIndex = useCallback(
    (i) => {
      if (!supported || i < 0 || i >= flatVerses.length) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const v = flatVerses[i];
      const utter = new SpeechSynthesisUtterance(`${v.ref}. ${v.text}`);
      utter.rate = 0.95;
      utter.onend = () => {
        setIndex((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx < flatVerses.length) {
            setTimeout(() => speakIndex(nextIdx), 30);
            return nextIdx;
          }
          setIsPlaying(false);
          return prevIdx;
        });
      };
      utterRef.current = utter;
      synth.speak(utter);
    },
    [flatVerses, supported]
  );

  const play = useCallback(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (synth.paused && utterRef.current) {
      synth.resume();
      setIsPlaying(true);
      return;
    }
    setIsPlaying(true);
    speakIndex(index);
  }, [supported, index, speakIndex]);

  const pause = useCallback(() => {
    if (!supported) return;
    setIsPlaying(false);
    window.speechSynthesis.pause();
  }, [supported]);

  const next = useCallback(() => {
    setIndex((i) => {
      const n = Math.min(i + 1, flatVerses.length - 1);
      if (isPlaying) speakIndex(n);
      return n;
    });
  }, [flatVerses.length, isPlaying, speakIndex]);

  const prev = useCallback(() => {
    setIndex((i) => {
      const p = Math.max(i - 1, 0);
      if (isPlaying) speakIndex(p);
      return p;
    });
  }, [isPlaying, speakIndex]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [supported]);

  const playFrom = useCallback(
    (vid) => {
      const i = flatVerses.findIndex((v) => v.id === vid);
      if (i < 0) return;
      setIndex(i);
      setIsPlaying(true);
      speakIndex(i);
      const el = document.getElementById(`v-${vid}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [flatVerses, speakIndex]
  );

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const current = flatVerses[index];

  return {
    supported,
    isPlaying,
    currentId: current ? current.id : null,
    currentRef: current ? current.ref : "",
    play,
    pause,
    next,
    prev,
    stop,
    playFrom,
  };
}

function ReadAloudBar({ player }) {
  if (!player.supported) {
    return (
      <div style={styles.playerBar}>
        <span style={{ opacity: 0.8 }}>Read-aloud is not supported in this browser.</span>
      </div>
    );
  }
  return (
    <div style={styles.playerBar} role="region" aria-label="Read aloud player">
      <button type="button" style={styles.playerBtn} onClick={player.prev} title="Previous verse">
        &#9198; Prev
      </button>
      <button
        type="button"
        style={styles.playerBtn}
        onClick={player.isPlaying ? player.pause : player.play}
        title="Play or pause"
      >
        {player.isPlaying ? "\u23F8 Pause" : "\u25B6 Play"}
      </button>
      <button type="button" style={styles.playerBtn} onClick={player.next} title="Next verse">
        Next &#9197;
      </button>
      <button type="button" style={styles.playerBtn} onClick={player.stop} title="Stop">
        &#9632; Stop
      </button>
      <span style={styles.playerLabel}>
        {player.currentRef ? `Reading: ${player.currentRef}` : "Tap Play or tap Listen next to any verse"}
      </span>
    </div>
  );
}

/* ---------- Design tokens ---------- */
const colors = {
  ink: "#241d13",
  paper: "#faf6ee",
  paper2: "#f2ebdc",
  navy: "#22304a",
  gold: "#a9793a",
  goldSoft: "#c99a5b",
  rule: "#ddd2ba",
  disputed: "#8a4a3b",
};

const serif = "'Iowan Old Style','Palatino Linotype',Georgia,'Times New Roman',serif";
const sans = "'Avenir Next','Segoe UI',sans-serif";

const styles = {
  page: { background: colors.paper, color: colors.ink, fontFamily: serif, lineHeight: 1.6, paddingBottom: 84 },
  masthead: { padding: "72px 24px 40px", borderBottom: `3px solid ${colors.navy}`, maxWidth: 760, margin: "0 auto" },
  backLink: { fontFamily: sans, fontSize: "0.85rem", color: colors.gold, textDecoration: "none", display: "inline-block", marginBottom: 18 },
  h1: { fontSize: "2.6rem", margin: "0 0 6px", color: colors.navy, fontWeight: 600 },
  sub: { fontSize: "1.15rem", color: colors.gold, fontStyle: "italic", margin: "0 0 18px" },
  lede: { fontFamily: sans, fontSize: "0.95rem", color: "#4a4230", maxWidth: "60ch" },
  wrap: { maxWidth: 760, margin: "0 auto", padding: "0 24px 120px" },
  box: { background: colors.paper2, borderLeft: `4px solid ${colors.navy}`, padding: "18px 22px", margin: "28px 0", fontFamily: sans, fontSize: "0.92rem", color: "#3a3222" },
  boxH2: { fontFamily: sans, fontSize: "1rem", margin: "0 0 8px", color: colors.navy },
  boxP: { margin: "0 0 10px" },
  downloadGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 },
  downloadLink: { fontFamily: sans, fontSize: "0.88rem", fontWeight: 600, color: colors.navy, background: "#fff", border: `1px solid ${colors.goldSoft}`, borderRadius: 8, padding: "10px 14px", textDecoration: "none", textAlign: "center" },
  toc: { fontFamily: sans, fontSize: "0.92rem", columns: 2, columnGap: 32, margin: "20px 0 40px" },
  tocLink: { display: "block", padding: "4px 0", color: colors.ink, textDecoration: "none", breakInside: "avoid" },
  tocNum: { color: colors.gold, marginRight: 6 },
  category: { paddingTop: 56, borderTop: `1px solid ${colors.rule}`, marginTop: 8, scrollMarginTop: 20 },
  catH2: { fontSize: "1.5rem", color: colors.navy, margin: "0 0 4px", fontWeight: 600 },
  catTag: { fontFamily: sans, fontSize: "0.78rem", color: colors.gold, marginBottom: 6, display: "block" },
  secnav: { fontFamily: sans, fontSize: "0.82rem", color: colors.goldSoft, margin: "2px 0 18px" },
  secnavLink: { color: colors.gold, textDecoration: "none" },
  verse: { margin: "22px 0", padding: "6px 8px", borderRadius: 6, scrollMarginTop: 90 },
  ref: { fontFamily: sans, fontWeight: 600, fontSize: "1rem", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" },
  refLink: { color: colors.navy, textDecoration: "none" },
  vtag: { fontFamily: sans, fontWeight: 400, fontSize: "0.78rem", color: colors.disputed },
  listenBtn: { fontFamily: sans, fontSize: "0.72rem", color: colors.gold, background: "none", border: `1px solid ${colors.goldSoft}`, borderRadius: 12, padding: "2px 9px", cursor: "pointer" },
  kjvtext: { margin: "6px 0 0 0", paddingLeft: 14, borderLeft: `2px solid ${colors.rule}` },
  context: { fontStyle: "italic", color: "#5a5138", fontSize: "0.94rem", marginTop: 20, fontFamily: serif },
  appendixH: { color: colors.navy, borderTop: `3px solid ${colors.navy}`, paddingTop: 16, marginTop: 60 },
  index: { fontFamily: sans, fontSize: "0.92rem", columns: 3, columnGap: 24, listStyle: "none", padding: 0 },
  indexLi: { breakInside: "avoid", padding: "3px 0" },
  indexLink: { color: colors.navy, textDecoration: "none" },
  footer: { fontFamily: sans, fontSize: "0.82rem", color: "#7a7156", borderTop: `1px solid ${colors.rule}`, paddingTop: 20, marginTop: 70 },
  playerBar: { position: "fixed", left: 0, right: 0, bottom: 0, background: colors.navy, color: "#f3ead9", fontFamily: sans, fontSize: "0.85rem", padding: "10px 18px", display: "flex", alignItems: "center", gap: 14, zIndex: 50, boxShadow: "0 -2px 10px rgba(0,0,0,0.2)" },
  playerBtn: { background: "none", border: "1px solid #8593ab", color: "#f3ead9", borderRadius: 16, padding: "6px 14px", fontFamily: sans, fontSize: "0.82rem", cursor: "pointer" },
  playerLabel: { flex: 1, textAlign: "center", color: colors.goldSoft, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};
