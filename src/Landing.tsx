// @ts-nocheck
import { Link } from "react-router-dom";
import Field, { currentSky } from "./Field";
import { Brand } from "./ui";
import { SEED, TRACKS, STAGES } from "./content";
import { result } from "./store";

export default function Landing() {
  const r = result();
  const night = currentSky() === "night";
  return (
    <>
      <section className={"hero" + (night ? " night" : "")}>
        <Field className="field-bg" shade />
        <div className="topnav gutter"><div className="container navin">
          <Brand light />
          <nav className="navlinks" aria-label="Site" style={{ color: "#FFF8EC" }}>
            <Link to="/how-it-works">How it works</Link><a href="#course">The course</a><a href="#institutions">For institutions</a>
            <Link to="/app">{r ? "Open my Granary" : "Open the app"}</Link>
          </nav>
        </div></div>
        <div className="gutter" style={{ flex: 1, display: "flex" }}><div className="container" style={{ flex: 1, display: "flex" }}>
          <div className="in">
            <h1 className="h-xl">Store for the seasons ahead.</h1>
            <p className="lede">Granary helps families move from surviving to building wealth that lasts. Take a four-minute check, see what's holding your home back, and follow a plan you make together.</p>
            <div className="row" style={{ gap: 12 }}>
              <Link className="btn light" to={r ? "/app" : "/app/check"}>{r ? `See my field · ${r.score}` : "Check your family's field"}</Link>
              <Link className="btn glass" to="/how-it-works">How it works</Link>
            </div>
            <div className="meta"><span><i />About 4 minutes</span><span><i />No exact figures needed</span><span><i />Free for families</span></div>
          </div>
        </div></div>
      </section>

      <section className="section gutter"><div className="container">
        <div className="section-h">
          <span className="kicker">Why Granary</span>
          <h2 className="h-lg">Income is not wealth.</h2>
          <p className="lede muted">Income is money passing through your hands. Wealth is what stays, works and lasts. Two homes in the same city can earn very different amounts and still end up in surprising places.</p>
        </div>
        <div className="two">
          <article className="homecard"><Field grow={.28} sky="golden" /><div className="b">
            <span className="small muted" style={{ fontWeight: 700 }}>Home A</span>
            <div className="fig"><b>Earns</b><span className="tnum">₦1,000,000 a month</span><b>Spends</b><span className="tnum">₦950,000</span></div>
            <span className="big tnum">Keeps ₦50k</span>
          </div></article>
          <article className="homecard"><Field grow={.82} sky="golden" /><div className="b">
            <span className="small muted" style={{ fontWeight: 700 }}>Home B</span>
            <div className="fig"><b>Earns</b><span className="tnum">₦700,000 a month</span><b>Spends</b><span className="tnum">₦550,000</span></div>
            <span className="big tnum">Keeps ₦150k</span>
          </div></article>
        </div>
        <p className="muted" style={{ marginTop: 18, maxWidth: "64ch" }}>Home B earns less but keeps three times more, so its field grows taller. That's why your income range is <strong>not part of your Granary score</strong>. For some homes the fix is spending less; for many, it is earning more.</p>
      </div></section>

      <section className="section alt gutter"><div className="container">
        <div className="section-h">
          <span className="kicker">How it works</span>
          <h2 className="h-lg">Four steps, at your own pace.</h2>
        </div>
        <div className="four">
          {[["Check", "Answer 13 simple questions about your family's money. Ranges only, never exact figures."],
            ["Understand", "See your score, your stage and the one part holding your home back, explained in plain words."],
            ["Plan", "Pick one thing to fix now, one to grow next and one to protect for later. Each one is chosen from your answers."],
            ["Grow", "Follow short lessons alone or as a family, with reminders that fit your week. Recheck and watch your field grow."]].map(([t, d], i) => (
            <div className="stepcard" key={t}><span className="n">{i + 1}</span><h3 className="h-sm">{t}</h3><p className="muted">{d}</p></div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 28 }}><Link className="btn" to="/how-it-works">See the full guide</Link><Link className="btn ghost" to="/app/check">Start the check</Link></div>
      </div></section>

      <section className="section gutter"><div className="container">
        <div className="section-h">
          <span className="kicker">The idea behind it</span>
          <h2 className="h-lg">Wealth grows like a field.</h2>
          <p className="lede muted">You need a seed, a season to let it grow, good soil to plant it in, and a harvest you protect and pass on. Your check measures all four. If any one of them is missing, nothing grows.</p>
        </div>
        <div className="seedcards">
          {Object.entries(SEED).map(([k, s]) => (
            <div className="seedcard" key={k} style={{ "--c": s.color }}>
              <div className="k"><b>{k}</b><span>{s.story}</span></div>
              <h4>{s.name}</h4><p>{s.plain}</p><p className="built"><b>Built from:</b> {s.built}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div className="equation" aria-label="W equals S times T times P times G"><b>W</b><span className="op">=</span><b style={{ color: "var(--seed)" }}>S</b><span className="op">×</span><b style={{ color: "var(--season)" }}>T</b><span className="op">×</span><b style={{ color: "var(--soil)" }}>P</b><span className="op">×</span><b style={{ color: "var(--harvest)" }}>G</b></div>
          <p className="muted" style={{ maxWidth: "46ch" }}>The maths behind it: Wealth = Surplus × Time × Productive use × Good stewardship. It multiplies, so a zero anywhere keeps everything small. A teaching model, not a promise of returns.</p>
        </div>
      </div></section>

      <section className="section alt gutter" id="course"><div className="container">
        <div className="section-h">
          <span className="kicker">The course</span>
          <h2 className="h-lg">From Surviving to Building.</h2>
          <p className="lede muted">Thirty short lessons in four tracks. Choose 7, 14 or 30 lessons, daily or weekly, 5 to 20 minutes, alone or with your family. Every lesson shows its sources and who approved it.</p>
        </div>
        <div className="four">
          {Object.values(TRACKS).map((t, i) => (
            <div className="stepcard" key={t.name} style={{ borderTop: `5px solid ${t.color}` }}>
              <span className="small muted" style={{ fontWeight: 700 }}>Track {i + 1} · {t.story}</span>
              <h3 className="h-md">{t.name}</h3><p className="muted">{t.sub}</p>
            </div>
          ))}
        </div>
      </div></section>

      <section className="section gutter"><div className="container">
        <div className="section-h"><span className="kicker">Built on trust</span><h2 className="h-lg">Your family's numbers stay yours.</h2></div>
        <div className="trust">
          <div><b>No exact figures</b><span>The check asks for ranges, never account numbers or exact salaries.</span></div>
          <div><b>Private by default</b><span>Your answers stay on your phone. Only anonymous totals are ever shared.</span></div>
          <div><b>Faith-grounded</b><span>Halal earning, careful verification and lasting benefit run through every step.</span></div>
          <div><b>Honest guidance</b><span>Education, not financial or Shariah rulings. No product-pushing, no promised returns.</span></div>
        </div>
        <div className="four" style={{ marginTop: 22 }}>
          {STAGES.map((s, i) => <div key={s.id} className="stepcard" style={{ borderTop: `5px solid ${s.color}` }}><span className="small muted tnum" style={{ fontWeight: 700 }}>{s.min}–{STAGES[i + 1] ? STAGES[i + 1].min - 1 : 100}</span><h3 className="h-md">{s.name}</h3><p className="muted small">{s.means}</p></div>)}
        </div>
      </div></section>

      <section className="section band-dark gutter" id="institutions"><div className="container two" style={{ alignItems: "center" }}>
        <div className="stack" style={{ gap: 16 }}>
          <span className="kicker" style={{ color: "#E8C277" }}>For Islamic institutions</span>
          <h2 className="h-lg">A verified shelf for halal products.</h2>
          <p className="lede muted">Soon, licensed Islamic banks, fund managers, takaful operators and waqf foundations will be able to list their products in Granary, each one shown with its licence and Shariah board, and checked against the same six questions families learn to ask.</p>
        </div>
        <div className="stack">
          {["Listings show regulator licence and Shariah board", "No paid rankings or 'recommended' badges", "Families can add the accounts they already hold", "No investing inside the app: Granary educates, institutions serve"].map(t => (
            <div key={t} className="row" style={{ gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(255,243,222,.15)", flexWrap: "nowrap" }}><span style={{ width: 10, height: 10, borderRadius: 5, background: "#E8C277", flex: "none" }} /><span>{t}</span></div>
          ))}
          <span className="small muted" style={{ marginTop: 6 }}>Partner programme coming soon.</span>
        </div>
      </div></section>

      <section className="section gutter"><div className="container narrow" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <h2 className="h-lg">Where does your family stand today?</h2>
        <p className="lede muted">Four minutes. No exact figures. A clear next step.</p>
        <Link className="btn gold" to={r ? "/app" : "/app/check"}>{r ? "Open my Granary" : "Check your family's field"}</Link>
      </div></section>

      <footer className="footer gutter"><div className="container navin">
        <div className="stack" style={{ gap: 6 }}><Brand /><span>Launched at the MSMMI Marriage Workshop 2026, Lagos.</span></div>
        <div className="stack" style={{ gap: 6, maxWidth: "52ch" }}><span>Granary provides financial education, not financial, legal or Shariah advice. For personal decisions, speak to a licensed adviser or a qualified scholar.</span></div>
      </div></footer>
    </>
  );
}
