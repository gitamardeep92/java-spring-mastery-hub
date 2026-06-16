import { useState, useEffect } from "react";
import { coreJava }         from "./data_corejava";
import { springBoot }       from "./data_spring";
import { microservices }    from "./data_microservices";
import { reactData }        from "./data_react";
import { angularData }      from "./data_angular";
import { systemDesignData } from "./data_systemdesign";
import { interviewData }    from "./data_interview";
import { databaseData }     from "./data_database";
import { devopsData }       from "./data_devops";
import { webServicesData }  from "./data_webservices";
import { hibernateData }    from "./data_hibernate";

const curriculum = [
  coreJava, hibernateData, springBoot, microservices,
  reactData, angularData, webServicesData,
  databaseData, devopsData, systemDesignData, interviewData
];

const levelColors = {
  Beginner:     { bg: "#dcfce7", text: "#166534" },
  Intermediate: { bg: "#fef3c7", text: "#92400e" },
  Advanced:     { bg: "#fee2e2", text: "#991b1b" },
  Expert:       { bg: "#ede9fe", text: "#4c1d95" },
};

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

function CodeBlock({ lang, lines, accent }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ margin: "12px 0", borderRadius: 8, overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ background: "#0f172a", padding: "5px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: 10, fontFamily: "monospace" }}>{lang}</span>
        <button onClick={() => { navigator.clipboard?.writeText(lines.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ background: "none", border: "1px solid #334155", color: copied ? accent : "#94a3b8", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}>
          {copied ? "✓" : "copy"}
        </button>
      </div>
      <pre style={{ margin: 0, background: "#0a0f1e", padding: "12px", overflowX: "auto", fontSize: 11.5, lineHeight: 1.6, color: "#e2e8f0", fontFamily: "monospace", WebkitOverflowScrolling: "touch" }}>
        {lines.join("\n")}
      </pre>
    </div>
  );
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} style={{ color: "#f1f5f9" }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} style={{ background: "#1e293b", padding: "1px 5px", borderRadius: 3, fontSize: "0.87em", color: "#7dd3fc", fontFamily: "monospace" }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

function TopicView({ topic, section }) {
  return (
    <div>
      {topic.blocks.map((b, i) => {
        if (b.t === "code") return <CodeBlock key={i} lang={b.lang} lines={b.v} accent={section.accent} />;
        if (b.t === "heading") return <p key={i} style={{ fontWeight: 700, color: section.accent, margin: "18px 0 5px", fontSize: 13.5, borderBottom: "1px solid #1e293b", paddingBottom: 4 }}>{b.v}</p>;
        if (b.t === "subheading") return <p key={i} style={{ fontWeight: 700, color: "#94a3b8", margin: "12px 0 4px", fontSize: 13 }}>{b.v}</p>;
        if (b.t === "note") return (
          <div key={i} style={{ background: section.color + "15", border: "1px solid " + section.color + "44", borderRadius: 7, padding: "10px 12px", margin: "10px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: section.accent, flexShrink: 0, fontSize: 13 }}>💡</span>
            <span style={{ color: "#cbd5e1", fontSize: 12.5, lineHeight: 1.7 }}>{renderInline(b.v)}</span>
          </div>
        );
        if (b.t === "bullet") return (
          <div key={i} style={{ display: "flex", gap: 8, margin: "5px 0", alignItems: "flex-start" }}>
            <span style={{ color: section.accent, flexShrink: 0, marginTop: 3, fontSize: 11 }}>▸</span>
            <span style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.75 }}>{renderInline(b.v)}</span>
          </div>
        );
        if (b.t === "table") return (
          <div key={i} style={{ overflowX: "auto", margin: "10px 0", WebkitOverflowScrolling: "touch" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "100%", fontSize: 12 }}>
              {b.v.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #1e293b", background: ri % 2 === 1 && ri !== 0 ? "#ffffff05" : "transparent" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "7px 10px", color: ri === 0 ? "#f1f5f9" : "#94a3b8", fontWeight: ri === 0 ? 700 : 400, background: ri === 0 ? "#0f172a" : "transparent", fontSize: ri === 0 ? 12 : 11.5, whiteSpace: "nowrap" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
        );
        return <p key={i} style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.85, margin: "6px 0" }}>{renderInline(b.v)}</p>;
      })}
    </div>
  );
}

function MobileSheet({ open, onClose, title, children }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#0f172a", borderRadius: "16px 16px 0 0", border: "1px solid #1e293b", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: "auto", padding: "8px", flex: 1, WebkitOverflowScrolling: "touch" }}>{children}</div>
      </div>
    </div>
  );
}

function SearchModal({ open, onClose, onSelect }) {
  const [q, setQ] = useState("");
  const results = q.trim().length > 1
    ? curriculum.flatMap(s =>
        s.topics.filter(t => t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.blocks.some(b => (b.t === "text" || b.t === "heading") && b.v.toLowerCase().includes(q.toLowerCase())))
        .map(t => ({ ...t, sectionId: s.id, sectionTitle: s.title, sectionIcon: s.icon, sectionAccent: s.accent }))
      )
    : [];

  useEffect(() => { if (!open) setQ(""); }, [open]);
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#020817", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b", display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search all topics..."
          style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#f1f5f9", fontSize: 15, outline: "none" }} />
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 15, cursor: "pointer", padding: "8px", whiteSpace: "nowrap" }}>Cancel</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
        {q.length > 1 && results.length === 0 && (
          <p style={{ color: "#64748b", fontSize: 14, padding: "20px 16px" }}>No results for "{q}"</p>
        )}
        {!q && (
          <div style={{ padding: "16px" }}>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>All Sections</p>
            {curriculum.map(s => (
              <button key={s.id} onClick={() => { onSelect(s.id, s.topics[0].title); onClose(); }}
                style={{ width: "100%", textAlign: "left", padding: "12px", borderRadius: 8, background: "none", border: "1px solid #1e293b", cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{s.topics.length} topics</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {results.map((t, i) => (
          <button key={i} onClick={() => { onSelect(t.sectionId, t.title); onClose(); }}
            style={{ width: "100%", textAlign: "left", padding: "14px 16px", background: "none", border: "none", borderBottom: "1px solid #1e293b", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{t.sectionIcon}</span>
            <div>
              <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.sectionTitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FullStackHub() {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState("core-java");
  const [activeTopic,   setActiveTopic]   = useState(0);
  const [showSections,  setShowSections]  = useState(false);
  const [showTopics,    setShowTopics]    = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [desktopSidebar, setDesktopSidebar] = useState(true);

  const section = curriculum.find(s => s.id === activeSection);
  const topic   = section?.topics[activeTopic];

  const totalTopics    = curriculum.reduce((s, c) => s + c.topics.length, 0);
  const topicsBefore   = curriculum.slice(0, curriculum.findIndex(s => s.id === activeSection))
                                    .reduce((s, c) => s + c.topics.length, 0);
  const globalProgress = topicsBefore + activeTopic + 1;

  const selectSection = (sId) => { setActiveSection(sId); setActiveTopic(0); setShowSections(false); setShowTopics(false); };
  const selectTopic   = (idx) => { setActiveTopic(idx); setShowTopics(false); };
  const handleSearchSelect = (sId, title) => {
    const s = curriculum.find(x => x.id === sId);
    setActiveSection(sId);
    setActiveTopic(s.topics.findIndex(x => x.title === title));
  };

  const prevDisabled = activeTopic === 0;
  const nextDisabled = activeTopic === (section?.topics.length || 1) - 1;

  // ═══════════════ MOBILE ═══════════════
  if (isMobile) {
    return (
      <div style={{ height: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", borderBottom: "1px solid #1e293b", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>🚀</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 900, background: "linear-gradient(90deg,#f59e0b,#38bdf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Full-Stack Mastery Hub
            </div>
            <div style={{ fontSize: 9, color: "#64748b" }}>{globalProgress}/{totalTopics} topics • {Math.round(globalProgress/totalTopics*100)}% complete</div>
          </div>
          <button onClick={() => setShowSearch(true)}
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "7px 10px", cursor: "pointer", fontSize: 15, flexShrink: 0 }}>🔍</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#1e293b", flexShrink: 0 }}>
          <div style={{ height: "100%", width: (globalProgress/totalTopics*100)+"%", background: "linear-gradient(90deg,#f59e0b,#38bdf8,#a855f7)", transition: "width 0.3s" }} />
        </div>

        {/* Section + Topic selector bar */}
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", display: "flex", flexShrink: 0 }}>
          <button onClick={() => setShowSections(true)}
            style={{ flex: "0 0 auto", background: "none", border: "none", borderRight: "1px solid #1e293b", padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{section?.icon}</span>
            <span style={{ fontSize: 11, color: section?.accent, fontWeight: 700 }}>▾</span>
          </button>
          <button onClick={() => setShowTopics(true)}
            style={{ flex: 1, background: "none", border: "none", padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{section?.title}</div>
              <div style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeTopic + 1}. {topic?.title}
              </div>
            </div>
            <span style={{ color: "#475569", fontSize: 10, flexShrink: 0 }}>▾</span>
          </button>
        </div>

        {/* Topic progress dots */}
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "6px 14px", display: "flex", alignItems: "center", gap: 3, flexShrink: 0, overflowX: "auto" }}>
          {section?.topics.map((_, i) => (
            <div key={i} onClick={() => selectTopic(i)}
              style={{ width: i === activeTopic ? 18 : 6, height: 6, borderRadius: 99, background: i < activeTopic ? section.color + "88" : i === activeTopic ? section.accent : "#334155", transition: "all 0.2s", cursor: "pointer", flexShrink: 0 }} />
          ))}
          <span style={{ fontSize: 10, color: "#475569", marginLeft: 6, flexShrink: 0 }}>{activeTopic+1}/{section?.topics.length}</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px 14px 100px" }}>
          {topic && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: (levelColors[topic.level]||levelColors.Intermediate).bg, color: (levelColors[topic.level]||levelColors.Intermediate).text, fontWeight: 700 }}>{topic.level}</span>
                </div>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#f8fafc", lineHeight: 1.3 }}>{topic.title}</h1>
              </div>
              <div style={{ borderTop: "2px solid " + section?.color, paddingTop: 14 }}>
                <TopicView topic={topic} section={section} />
              </div>
              {nextDisabled && <div style={{ marginTop: 20, padding: "12px", background: section?.color+"15", borderRadius: 8, border: "1px solid "+section?.color+"44", textAlign: "center", color: section?.accent, fontSize: 13 }}>🎉 Section complete!</div>}
            </>
          )}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f172a", borderTop: "1px solid #1e293b", display: "flex", padding: "8px 14px", gap: 10, zIndex: 50 }}>
          <button onClick={() => !prevDisabled && selectTopic(activeTopic-1)} disabled={prevDisabled}
            style={{ flex: 1, padding: "11px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: prevDisabled ? "#334155" : "#94a3b8", cursor: prevDisabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>← Prev</button>
          <button onClick={() => !nextDisabled && selectTopic(activeTopic+1)} disabled={nextDisabled}
            style={{ flex: 1, padding: "11px", background: nextDisabled ? "#1e293b" : section?.color+"22", border: "1px solid "+(nextDisabled ? "#334155" : section?.color+"66"), borderRadius: 8, color: nextDisabled ? "#334155" : section?.accent, cursor: nextDisabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700 }}>Next →</button>
        </div>

        {/* Section Sheet */}
        <MobileSheet open={showSections} onClose={() => setShowSections(false)} title="Choose Section">
          {curriculum.map(s => (
            <button key={s.id} onClick={() => selectSection(s.id)}
              style={{ width: "100%", textAlign: "left", padding: "13px 12px", borderRadius: 8, background: activeSection===s.id ? s.color+"18" : "transparent", border: activeSection===s.id ? "1px solid "+s.color+"44" : "1px solid transparent", cursor: "pointer", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: activeSection===s.id ? s.accent : "#f1f5f9", fontWeight: activeSection===s.id ? 700 : 400 }}>{s.title}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.topics.length} topics</div>
              </div>
              {activeSection===s.id && <span style={{ color: s.accent, fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </MobileSheet>

        {/* Topic Sheet */}
        <MobileSheet open={showTopics} onClose={() => setShowTopics(false)} title={(section?.icon||"")+" "+section?.title+" — Topics"}>
          {section?.topics.map((t, i) => {
            const lc = levelColors[t.level]||levelColors.Intermediate;
            return (
              <button key={i} onClick={() => selectTopic(i)}
                style={{ width: "100%", textAlign: "left", padding: "12px", borderRadius: 8, background: activeTopic===i ? section.color+"18" : "transparent", border: activeTopic===i ? "1px solid "+section.color+"44" : "1px solid transparent", cursor: "pointer", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#64748b", flexShrink: 0, minWidth: 18 }}>{i+1}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: activeTopic===i ? "#f1f5f9" : "#94a3b8", fontWeight: activeTopic===i ? 600 : 400, lineHeight: 1.4 }}>{t.title}</div>
                    <span style={{ display: "inline-block", marginTop: 4, fontSize: 9, padding: "1px 6px", borderRadius: 99, background: lc.bg, color: lc.text, fontWeight: 700 }}>{t.level}</span>
                  </div>
                  {activeTopic===i && <span style={{ color: section.accent, fontSize: 14 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </MobileSheet>

        <SearchModal open={showSearch} onClose={() => setShowSearch(false)} onSelect={handleSearchSelect} />
      </div>
    );
  }

  // ═══════════════ DESKTOP ═══════════════
  return (
    <div style={{ height: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Desktop Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚀</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, background: "linear-gradient(90deg,#f59e0b,#38bdf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Full-Stack Mastery Hub</div>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Java · Spring · Hibernate · Microservices · React · Angular · APIs · DB · DevOps · AWS · Interviews</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>Progress</div>
            <div style={{ fontSize: 11, color: "#f1f5f9", fontWeight: 600 }}>{globalProgress} / {totalTopics} topics</div>
          </div>
          <div style={{ width: 100, height: 5, background: "#1e293b", borderRadius: 99 }}>
            <div style={{ height: "100%", width: (globalProgress/totalTopics*100)+"%", background: "linear-gradient(90deg,#f59e0b,#38bdf8,#a855f7)", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{Math.round(globalProgress/totalTopics*100)}%</div>
          <button onClick={() => setShowSearch(true)}
            style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 7, padding: "6px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            🔍 <span>Search</span>
          </button>
        </div>
      </div>

      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} onSelect={(sId, title) => { handleSearchSelect(sId, title); setShowSearch(false); }} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Section Icons */}
        <div style={{ width: 54, background: "#0f172a", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, gap: 2, flexShrink: 0, overflowY: "auto" }}>
          {curriculum.map(s => (
            <button key={s.id} onClick={() => { setActiveSection(s.id); setActiveTopic(0); }} title={s.title}
              style={{ width: 38, height: 38, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, background: activeSection===s.id ? s.color+"22" : "transparent", outline: activeSection===s.id ? "2px solid "+s.color : "none", transition: "all 0.15s", flexShrink: 0 }}>
              {s.icon}
            </button>
          ))}
        </div>

        {/* Topic Sidebar */}
        {desktopSidebar && (
          <div style={{ width: 228, background: "#0a0f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{section?.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 12.5, color: section?.accent }}>{section?.title}</span>
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{section?.topics.length} topics</div>
              </div>
              <button onClick={() => setDesktopSidebar(false)} style={{ background: "none", border: "1px solid #334155", color: "#475569", cursor: "pointer", borderRadius: 5, padding: "2px 8px", fontSize: 13 }}>‹</button>
            </div>
            <div style={{ overflowY: "auto", padding: "6px", flex: 1 }}>
              {section?.topics.map((t, i) => {
                const lc = levelColors[t.level]||levelColors.Intermediate;
                return (
                  <button key={i} onClick={() => setActiveTopic(i)}
                    style={{ width: "100%", textAlign: "left", padding: "8px 9px", borderRadius: 7, background: activeTopic===i ? section.color+"18" : "transparent", border: activeTopic===i ? "1px solid "+section.color+"44" : "1px solid transparent", cursor: "pointer", marginBottom: 2 }}>
                    <div style={{ fontSize: 11.5, color: activeTopic===i ? "#f1f5f9" : "#94a3b8", fontWeight: activeTopic===i ? 600 : 400, lineHeight: 1.4, marginBottom: 4 }}>{t.title}</div>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: lc.bg, color: lc.text, fontWeight: 700 }}>{t.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {!desktopSidebar && (
          <div style={{ position: "relative", width: 0, flexShrink: 0 }}>
            <button onClick={() => setDesktopSidebar(true)} style={{ position: "absolute", top: 80, left: 0, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer", borderRadius: "0 6px 6px 0", padding: "10px 5px", fontSize: 14, zIndex: 10 }}>›</button>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>
          {topic && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{section?.icon} {section?.title}</span>
                    <span style={{ color: "#334155" }}>›</span>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: (levelColors[topic.level]||levelColors.Intermediate).bg, color: (levelColors[topic.level]||levelColors.Intermediate).text, fontWeight: 700 }}>{topic.level}</span>
                    <span style={{ fontSize: 9, color: "#475569" }}>Topic {activeTopic+1} of {section?.topics.length}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 }}>{topic.title}</h1>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => setActiveTopic(Math.max(0,activeTopic-1))} disabled={prevDisabled}
                    style={{ padding: "6px 13px", background: "#1e293b", border: "1px solid #334155", borderRadius: 7, color: prevDisabled ? "#334155" : "#94a3b8", cursor: prevDisabled ? "not-allowed" : "pointer", fontSize: 12 }}>← Prev</button>
                  <button onClick={() => setActiveTopic(Math.min((section?.topics.length||1)-1, activeTopic+1))} disabled={nextDisabled}
                    style={{ padding: "6px 13px", background: nextDisabled ? "#1e293b" : section?.color+"22", border: "1px solid "+(nextDisabled ? "#334155" : section?.color+"44"), borderRadius: 7, color: nextDisabled ? "#334155" : section?.accent, cursor: nextDisabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>Next →</button>
                </div>
              </div>
              <div style={{ borderTop: "2px solid "+section?.color, paddingTop: 18 }}>
                <TopicView topic={topic} section={section} />
              </div>
              <div style={{ marginTop: 28, padding: "13px", background: "#0f172a", borderRadius: 9, border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{section?.title} Progress</span>
                  <span style={{ fontSize: 10, color: section?.accent }}>{activeTopic+1} / {section?.topics.length}</span>
                </div>
                <div style={{ height: 4, background: "#1e293b", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: ((activeTopic+1)/(section?.topics.length||1)*100)+"%", background: "linear-gradient(90deg,"+section?.color+","+section?.accent+")", borderRadius: 99, transition: "width 0.3s" }} />
                </div>
                {nextDisabled && <p style={{ marginTop: 8, textAlign: "center", color: section?.accent, fontSize: 12 }}>🎉 Section complete! Move to the next section.</p>}
              </div>
            </>
          )}
        </div>

        {/* Right Quick-Nav */}
        <div style={{ width: 170, background: "#0a0f1e", borderLeft: "1px solid #1e293b", padding: "10px 8px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>All Sections</div>
          {curriculum.map(s => (
            <div key={s.id} style={{ marginBottom: 2 }}>
              <button onClick={() => { setActiveSection(s.id); setActiveTopic(0); }}
                style={{ width: "100%", textAlign: "left", padding: "4px 7px", borderRadius: 5, background: activeSection===s.id ? s.color+"15" : "transparent", border: "none", cursor: "pointer", color: activeSection===s.id ? s.accent : "#64748b", fontSize: 11, fontWeight: activeSection===s.id ? 700 : 400, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 12 }}>{s.icon}</span>
                <span style={{ flex: 1, fontSize: 10 }}>{s.title}</span>
                <span style={{ fontSize: 9, color: "#475569" }}>{s.topics.length}</span>
              </button>
              {activeSection===s.id && s.topics.map((t, i) => (
                <button key={i} onClick={() => setActiveTopic(i)}
                  style={{ width: "100%", textAlign: "left", padding: "2px 7px 2px 22px", border: "none", background: "transparent", cursor: "pointer", color: activeTopic===i ? "#f1f5f9" : "#475569", fontSize: 10, borderLeft: activeTopic===i ? "2px solid "+s.color : "2px solid transparent" }}>
                  {t.title.length > 20 ? t.title.slice(0,20)+"…" : t.title}
                </button>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px", background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b" }}>
            <div style={{ fontSize: 9, color: "#475569", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Hub Stats</div>
            {[
              { label: "Sections", value: curriculum.length },
              { label: "Topics",   value: totalTopics },
              { label: "Progress", value: Math.round(globalProgress/totalTopics*100)+"%" },
            ].map((s,i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "#64748b" }}>{s.label}</span>
                <span style={{ fontSize: 10, color: "#f1f5f9", fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
