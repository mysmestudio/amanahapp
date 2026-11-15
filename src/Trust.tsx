// @ts-nocheck
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ic, Acc, rise, SiteNav, SiteFooter } from "./site";

export default function Trust() {
  return (
    <div className="lp">
      <SiteNav />
      <section className="lp-phero"><div className="lp-wrap lp-phero-in">
        <span className="lp-eyebrow gold">Trust and privacy</span>
        <h1>Your family's numbers stay yours.</h1>
        <p className="lp-lede">Money is personal. Here is exactly what SeedLine asks, what it keeps, and what it will never do.</p>
      </div></section>

      <section className="lp-sec"><div className="lp-wrap">
        <motion.div className="lp-tgrid" {...rise}>
          {[["ranges", "Ranges, never exact figures", "The check asks for ranges. No account numbers, no exact salaries, no BVN."],
            ["phone", "Private on your device", "Your answers, plan and progress are saved on your phone. Only anonymous totals leave it."],
            ["key", "Your own password", "Family accounts protected by your own password, so your records follow you across devices.", "Coming soon"],
            ["shield", "No selling, no pushing", "We never sell your data, never take deposits and never push products. Education, not advice."]].map(([n, t, d, soon]) => (
            <div key={t} className="lp-tcard"><span className="lp-sq gold"><Ic n={n} /></span><b>{t}{soon && <em className="lp-soon">{soon}</em>}</b><small>{d}</small></div>
          ))}
        </motion.div>
      </div></section>

      <section className="lp-sec alt"><div className="lp-wrap lp-faq">
        <motion.div className="lp-head" {...rise}><span className="lp-eyebrow">Questions</span><h2>Good to know.</h2><Link to="/app/check" className="btn">Take the check<Ic n="arrow" s={18} /></Link></motion.div>
        <div className="lp-faq-list">
          <Acc q="What exactly does SeedLine store?"><p>On your phone: your answers, your plan picks and your course progress. On our server: an anonymous record of your score, stage, country and which parts are strongest and weakest, with no name and no contact details, used for overall totals. If you choose email or push reminders, we store that address or device token only to send them.</p></Acc>
          <Acc q="Is SeedLine free?"><p>Yes, for families. The check, your plan, your certificate and the course are free. Institutions list for free too.</p></Acc>
          <Acc q="Is it Shariah-conscious?"><p>Every lesson is built on halal earning, careful checking and lasting benefit, with its sources shown. It's education, not a fatwa. For personal rulings, especially inheritance, speak to a qualified scholar.</p></Acc>
          <Acc q="Does SeedLine give financial advice?"><p>No. SeedLine teaches and helps you plan. It doesn't sell products, take deposits or recommend one provider over another. For personal decisions, speak to a licensed adviser.</p></Acc>
          <Acc q="How do institutions get listed?"><p>They request a free listing. We check their regulator licence and Shariah board before they appear. Nobody can pay to be ranked higher.</p></Acc>
          <Acc q="Who is behind SeedLine?"><p>SeedLine was launched by Eb'rahim Durosimi at the MSMMI Marriage Workshop 2026 in Lagos, and every lesson is reviewed before it goes live.</p></Acc>
        </div>
      </div></section>
      <SiteFooter />
    </div>
  );
}
