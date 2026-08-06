"use client";

import { useState } from "react";

const steps = [
  { number: "01", title: "Build your research profile", description: "Connect your ORCID and tell us your field, experience, and research direction." },
  { number: "02", title: "Discover the right R&D opportunities", description: "See scattered Korean R&D programs in one place, matched to your profile." },
  { number: "03", title: "Write with an AI research assistant", description: "Understand Korean research administration and complete each required proposal form." },
  { number: "04", title: "Find collaborators and funding", description: "Turn your proposal into a team by connecting with researchers, institutions, and investors." },
];

export function Workflow() {
  const [active, setActive] = useState(0);

  return (
    <section className="workflow section" id="workflow">
      <div className="section-kicker">THE LAB-BRIDGE FLOW</div>
      <div className="workflow-grid">
        <div>
          <h2>From finding an opportunity<br />to building the research.</h2>
          <p className="section-copy">한국 연구 시스템의 복잡한 과정을 하나의 연결된 흐름으로 바꿉니다.</p>
        </div>
        <div className="step-list">
          {steps.map((step, index) => {
            const state = index < active ? "complete" : index === active ? "active" : "pending";
            return (
              <button className={`step ${state}`} key={step.number} onClick={() => setActive(index)} aria-current={state === "active" ? "step" : undefined}>
                <span className="step-rail">
                  <span className="step-dot">{state === "complete" ? "✓" : step.number}</span>
                </span>
                <span className="step-content">
                  <span className="step-label">STEP {step.number}</span>
                  <strong>{step.title}</strong>
                  <span className="step-description">{step.description}</span>
                </span>
              </button>
            );
          })}
          <button className="advance-button" onClick={() => setActive((value) => (value + 1) % steps.length)}>
            Next step <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
