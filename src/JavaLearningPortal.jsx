import { useState } from "react";
import { coreJava }      from "./data_corejava";
import { springBoot }    from "./data_spring";
import { microservices } from "./data_microservices";

const curriculum = [coreJava, springBoot, microservices];

const levelColors = {
  Beginner:     { bg: "#dcfce7", text: "#166534" },
  Intermediate: { bg: "#fef3c7", text: "#92400e" },
  Advanced:     { bg: "#fee2e2", text: "#991b1b" },
  Expert:       { bg: "#ede9fe", text: "#4c1d95" },
};

function CodeBlock({ lang, lines, accent }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ margin: "14px 0", borderRadius: 10, overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ background: "#0f172a", padding: "5px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{lang}</span>
        <button
          onClick={() => { navigator.clipboard?.writeText(lines.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ background: "none", border: "1px solid #334155", color: copied ? accent : "#94a3b8", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10, transition: "color 0.2s" }}
        >{copied ? "✓ copied" : "copy"}</button>
      </div>
      <pre style={{ margin: 0, background: "#0a0f1e", padding: "12px 14px", overflowX: "auto", fontSize: 12, lineHeight: 1.65, color: "#e2e8f0", fontFamily: "monospace" }}>
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
      return <code key={i} style={{ background: "#1e293b", padding: "1px 5px", borderRadius: 3, fontSize: "0.88em", color: "#7dd3fc", fontFamily: "monospace" }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

function TopicView({ topic, section }) {
  return (
    <div>
      {topic.blocks.map((b, i) => {
        if (b.t === "code")
          return <CodeBlock key={i} lang={b.lang} lines={b.v} accent={section.accent} />;
        if (b.t === "heading")
          return <p key={i} style={{ fontWeight: 700, color: section.accent, margin: "20px 0 6px", fontSize: 14.5, borderBottom: "1px solid #1e293b", paddingBottom: 4 }}>{b.v}</p>;
        if (b.t === "subheading")
          return <p key={i} style={{ fontWeight: 700, color: "#94a3b8", margin: "14px 0 5px", fontSize: 13.5 }}>{b.v}</p>;
        if (b.t === "note")
          return (
            <div key={i} style={{ background: section.color + "15", border: "1px solid " + section.color + "44", borderRadius: 7, padding: "10px 14px", margin: "12px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: section.accent, flexShrink: 0, fontSize: 14 }}>💡</span>
              <span style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>{renderInline(b.v)}</span>
            </div>
          );
        if (b.t === "bullet")
          return (
            <div key={i} style={{ display: "flex", gap: 8, margin: "4px 0", alignItems: "flex-start" }}>
              <span style={{ color: section.accent, flexShrink: 0, marginTop: 4, fontSize: 11 }}>▸</span>
              <span style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.75 }}>{renderInline(b.v)}</span>
            </div>
          );
        if (b.t === "table")
          return (
            <div key={i} style={{ overflowX: "auto", margin: "12px 0" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
                {b.v.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid #1e293b" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "8px 12px", color: ri === 0 ? "#f1f5f9" : "#94a3b8", fontWeight: ri === 0 ? 700 : 400, background: ri === 0 ? "#0f172a" : "transparent", fontFamily: ri === 0 ? "inherit" : "monospace", fontSize: ri === 0 ? 12.5 : 12, whiteSpace: ri === 0 ? "nowrap" : "normal" }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </table>
            </div>
          );
        return (
          <p key={i} style={{ color: "#94a3b8", fontSize: 13.5, lineHeight: 1.85, margin: "6px 0" }}>
            {renderInline(b.v)}
          </p>
        );
      })}
    </div>
  );
}

export default function JavaLearningPortal() {
  const [activeSection, setActiveSection] = useState("core-java");
  const [activeTopic, setActiveTopic] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const section = curriculum.find(s => s.id === activeSection);
  const topic = section?.topics[activeTopic];

  const totalTopics = curriculum.reduce((s, c) => s + c.topics.length, 0);
  const topicsBefore = curriculum
    .slice(0, curriculum.findIndex(s => s.id === activeSection))
    .reduce((s, c) => s + c.topics.length, 0);
  const globalProgress = topicsBefore + activeTopic + 1;

  const filteredTopics = searchQuery.trim()
    ? curriculum.flatMap(s =>
        s.topics
          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(t => ({ ...t, sectionId: s.id, sectionTitle: s.title }))
      )
    : [];

  return (
    <div style={{ height: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>☕</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, background: "linear-gradient(90deg,#f59e0b,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Java Mastery Hub</div>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Core Java · Spring Boot · Microservices</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>Overall Progress</div>
            <div style={{ fontSize: 11, color: "#f1f5f9" }}>{globalProgress} / {totalTopics} topics</div>
          </div>
          <div style={{ width: 80, height: 4, background: "#1e293b", borderRadius: 99, flexShrink: 0 }}>
            <div style={{ height: "100%", width: (globalProgress / totalTopics * 100) + "%", background: "linear-gradient(90deg,#f59e0b,#6366f1)", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 11 }}>🔍</span>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search topics..."
              style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 7, padding: "5px 10px 5px 24px", color: "#f1f5f9", fontSize: 11, width: 170, outline: "none" }} />
          </div>
        </div>
      </div>

      {/* Search results */}
      {searchQuery && (
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "8px 14px", flexShrink: 0, maxHeight: 200, overflowY: "auto" }}>
          {filteredTopics.length === 0
            ? <span style={{ color: "#64748b", fontSize: 12 }}>No results for "{searchQuery}"</span>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {filteredTopics.map((t, i) => (
                  <button key={i}
                    onClick={() => { const s = curriculum.find(x => x.id === t.sectionId); setActiveSection(t.sectionId); setActiveTopic(s.topics.findIndex(x => x.title === t.title)); setSearchQuery(""); }}
                    style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 7, padding: "5px 10px", cursor: "pointer", color: "#f1f5f9", fontSize: 11 }}>
                    <span style={{ color: "#64748b", marginRight: 5 }}>{t.sectionTitle}</span>{t.title}
                  </button>
                ))}
              </div>
          }
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Section icons */}
        <div style={{ width: 58, background: "#0f172a", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, gap: 3, flexShrink: 0 }}>
          {curriculum.map(s => (
            <button key={s.id} onClick={() => { setActiveSection(s.id); setActiveTopic(0); }} title={s.title}
              style={{ width: 42, height: 42, borderRadius: 9, border: "none", cursor: "pointer", fontSize: 18, background: activeSection === s.id ? s.color + "22" : "transparent", outline: activeSection === s.id ? "2px solid " + s.color : "none", transition: "all 0.15s" }}>
              {s.icon}
            </button>
          ))}
        </div>

        {/* Topic list sidebar */}
        {sidebarOpen && (
          <div style={{ width: 235, background: "#0a0f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15 }}>{section?.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: section?.accent }}>{section?.title}</span>
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{section?.topics.length} topics</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "1px solid #334155", color: "#475569", cursor: "pointer", borderRadius: 5, padding: "2px 8px", fontSize: 13 }}>‹</button>
            </div>
            <div style={{ overflowY: "auto", padding: "6px", flex: 1 }}>
              {section?.topics.map((t, i) => {
                const lc = levelColors[t.level];
                return (
                  <button key={i} onClick={() => setActiveTopic(i)}
                    style={{ width: "100%", textAlign: "left", padding: "8px 9px", borderRadius: 7, background: activeTopic === i ? section.color + "18" : "transparent", border: activeTopic === i ? "1px solid " + section.color + "44" : "1px solid transparent", cursor: "pointer", marginBottom: 2 }}>
                    <div style={{ fontSize: 11.5, color: activeTopic === i ? "#f1f5f9" : "#94a3b8", fontWeight: activeTopic === i ? 600 : 400, lineHeight: 1.4, marginBottom: 4 }}>{t.title}</div>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: lc.bg, color: lc.text, fontWeight: 700 }}>{t.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!sidebarOpen && (
          <div style={{ position: "relative", width: 0, flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ position: "absolute", top: 80, left: 0, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer", borderRadius: "0 6px 6px 0", padding: "10px 5px", fontSize: 14, zIndex: 10 }}>›</button>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>
          {topic && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{section?.title}</span>
                    <span style={{ color: "#334155" }}>›</span>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: levelColors[topic.level]?.bg, color: levelColors[topic.level]?.text, fontWeight: 700 }}>{topic.level}</span>
                    <span style={{ fontSize: 9, color: "#475569" }}>Topic {activeTopic + 1} of {section?.topics.length}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 }}>{topic.title}</h1>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => setActiveTopic(Math.max(0, activeTopic - 1))} disabled={activeTopic === 0}
                    style={{ padding: "6px 13px", background: "#1e293b", border: "1px solid #334155", borderRadius: 7, color: activeTopic === 0 ? "#334155" : "#94a3b8", cursor: activeTopic === 0 ? "not-allowed" : "pointer", fontSize: 12 }}>← Prev</button>
                  <button onClick={() => setActiveTopic(Math.min((section?.topics.length || 1) - 1, activeTopic + 1))} disabled={activeTopic === (section?.topics.length || 1) - 1}
                    style={{ padding: "6px 13px", background: section?.color + "22", border: "1px solid " + section?.color + "44", borderRadius: 7, color: section?.accent, cursor: activeTopic === (section?.topics.length || 1) - 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>Next →</button>
                </div>
              </div>
              <div style={{ borderTop: "2px solid " + section?.color, paddingTop: 18 }}>
                <TopicView topic={topic} section={section} />
              </div>
              <div style={{ marginTop: 28, padding: "13px", background: "#0f172a", borderRadius: 9, border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{section?.title} Progress</span>
                  <span style={{ fontSize: 10, color: section?.accent }}>{activeTopic + 1} / {section?.topics.length}</span>
                </div>
                <div style={{ height: 4, background: "#1e293b", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: ((activeTopic + 1) / (section?.topics.length || 1) * 100) + "%", background: "linear-gradient(90deg," + section?.color + "," + section?.accent + ")", borderRadius: 99, transition: "width 0.3s" }} />
                </div>
                {activeTopic === (section?.topics.length || 1) - 1 && (
                  <p style={{ marginTop: 8, textAlign: "center", color: section?.accent, fontSize: 12 }}>🎉 Section complete! Continue to the next section.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right quick-nav */}
        <div style={{ width: 175, background: "#0a0f1e", borderLeft: "1px solid #1e293b", padding: "12px 9px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>All Sections</div>
          {curriculum.map(s => (
            <div key={s.id}>
              <button onClick={() => { setActiveSection(s.id); setActiveTopic(0); }}
                style={{ width: "100%", textAlign: "left", padding: "5px 7px", borderRadius: 5, background: activeSection === s.id ? s.color + "15" : "transparent", border: "none", cursor: "pointer", color: activeSection === s.id ? s.accent : "#64748b", fontSize: 12, fontWeight: activeSection === s.id ? 700 : 400, display: "flex", alignItems: "center", gap: 5 }}>
                <span>{s.icon}</span><span style={{ flex: 1 }}>{s.title}</span>
                <span style={{ fontSize: 9, color: "#475569" }}>{s.topics.length}</span>
              </button>
              {activeSection === s.id && s.topics.map((t, i) => (
                <button key={i} onClick={() => setActiveTopic(i)}
                  style={{ width: "100%", textAlign: "left", padding: "2px 7px 2px 22px", border: "none", background: "transparent", cursor: "pointer", color: activeTopic === i ? "#f1f5f9" : "#475569", fontSize: 10.5, borderLeft: activeTopic === i ? "2px solid " + s.color : "2px solid transparent" }}>
                  {t.title.length > 22 ? t.title.slice(0, 22) + "…" : t.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
