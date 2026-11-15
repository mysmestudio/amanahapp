import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./styles.css";
import Landing from "./Landing";
import Guide from "./Guide";
import Institutions from "./Institutions";
import Trust from "./Trust";
import Start from "./Start";
import { AppShell } from "./ui";
import { Check, Learn, Tools } from "./AppPages";
import { Home } from "./Result";
import { Plan } from "./Plan";
import { Present, Room } from "./Present";

function ToDirectory() { return <Navigate to={"/app/directory" + (typeof location !== "undefined" ? location.search : "")} replace />; }
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
function LegacyHash() {
  // links from the workshop prototype used #room, #present, #check, #plan…
  const h = typeof location !== "undefined" ? location.hash.slice(1) : "";
  const map: Record<string, string> = { room: "/room", present: "/present", check: "/app/check", plan: "/app/plan", course: "/app/learn", learn: "/app/learn", tools: "/app/tools", result: "/app", home: "/app" };
  return map[h] ? <Navigate to={map[h] + location.search} replace /> : <Landing />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<LegacyHash />} />
        <Route path="/how-it-works" element={<Guide />} />
        <Route path="/institutions" element={<ToDirectory />} />
        <Route path="/start" element={<Start />} />
        <Route path="/trust" element={<Trust />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="check" element={<Check />} />
          <Route path="plan" element={<Plan />} />
          <Route path="learn" element={<Learn />} />
          <Route path="tools" element={<Tools />} />
          <Route path="directory" element={<Institutions inApp />} />
        </Route>
        <Route path="/present" element={<Present />} />
        <Route path="/room" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
