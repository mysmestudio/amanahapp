// @ts-nocheck
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { result } from "./store";
import { Ic, rise, SiteNav, SiteFooter, ListingModal } from "./site";

export default function TwoSides() {
  const r = result();
  const [listing, setListing] = useState(false);
  const checkTo = "/start";
  return (
    <div className="lp">
      <SiteNav dark />
      {/* two doors */}
      <section className="lp-sec lp-twosides" id="institutions"><div className="lp-wrap">
        <motion.div className="lp-head center" {...rise}>
          <span className="lp-eyebrow">Two sides of the table</span>
          <h2>Families plan. Institutions serve.</h2>
        </motion.div>
        <div className="lp-doors">
          <motion.div className="lp-door fam" {...rise} whileHover={{ y: -6 }}>
            <span className="lp-eyebrow gold">For families</span>
            <h3>Your family office, in your pocket.</h3>
            <ul>
              <li><Ic n="pulse" s={18} />A health-check in four minutes</li>
              <li><Ic n="plan" s={18} />A plan you make together</li>
              <li><Ic n="doc" s={18} />A certificate worth sharing</li>
              <li><Ic n="book" s={18} />Thirty short lessons, with sources</li>
            </ul>
            <Link to={checkTo} className="btn gold">{r ? "Open my SeedLine" : "Get started"}<Ic n="arrow" s={18} /></Link>
            <div className="lp-door-cert" aria-hidden="true">
              <span className="lp-eyebrow gold">Family Wealth Check</span>
              <b>The ___ Family</b>
              <span className="lp-door-score">{r ? r.score : 71}</span>
            </div>
          </motion.div>
          <motion.div className="lp-door inst" {...rise} whileHover={{ y: -6 }}>
            <span className="lp-eyebrow">For Islamic institutions</span>
            <h3>Be found by families ready to act.</h3>
            <ul>
              <li><Ic n="badge" s={18} />Free, verified listing</li>
              <li><Ic n="equal" s={18} />Shown equally, never ranked</li>
              <li><Ic n="inbox" s={18} />Families contact you directly</li>
            </ul>
            <div className="lp-ctas">
              <button className="btn" onClick={() => setListing(true)}>List your institution<Ic n="arrow" s={18} /></button>
            </div>
            <div className="lp-door-stack" aria-hidden="true">{["Bank", "Takaful", "Sukuk"].map((t, k) => <span key={t} style={{ "--k": k }}>{t}</span>)}</div>
          </motion.div>
        </div>
      </div></section>

      <SiteFooter onList={() => setListing(true)} />
      <ListingModal open={listing} onClose={() => setListing(false)} />
    </div>
  );
}
