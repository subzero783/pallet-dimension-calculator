"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { loadPreset } from "@/store/slices/calculatorSlice";
import {
  Box,
  Layers,
  Hammer,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLaunchPreset = (preset: "standard" | "aerospace" | "skid") => {
    if (preset === "standard") {
      dispatch(
        loadPreset({
          name: "Standard 48x40 Freight Enclosure",
          customer: "FedEx Freight / Global Logistics",
          dimensions: { length: 46, width: 38, height: 32, weight: 950 },
          style: "2-Way Stringer (Flush)",
          deckboard: "1x4",
          stringer: "2x4",
        })
      );
    } else if (preset === "aerospace") {
      dispatch(
        loadPreset({
          name: "CNC 5-Axis Spindle Assembly",
          customer: "Boeing Defense & Space",
          dimensions: { length: 58, width: 44, height: 36, weight: 1850 },
          style: "2-Way Stringer (Flush)",
          deckboard: "1x6",
          stringer: "2x4",
        })
      );
    } else if (preset === "skid") {
      dispatch(
        loadPreset({
          name: "Hydraulic Power Unit Skid",
          customer: "Caterpillar Industrial",
          dimensions: { length: 82, width: 52, height: 48, weight: 3400 },
          style: "Heavy-Duty Skid",
          deckboard: "1x6",
          stringer: "4x4",
        })
      );
    }
    router.push("/calculator");
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="text-amber" />
          <span>Industrial Shipping & Crating Engineering</span>
        </div>

        <h1 className="hero-title">
          From CAD Work Order to <span className="text-cyan">Sawyer Cut List</span> in Seconds
        </h1>

        <p className="hero-desc">
          Automate custom pallet and skid dimensions for manufacturing shipping teams.
          Eliminate manual math errors, calculate board foot totals, ensure forklift clearances,
          and generate instant sawyer cut sheets.
        </p>

        <div className="hero-cta-group">
          <Link href="/calculator" className="btn btn-primary btn-lg">
            <span>Launch Calculator</span>
            <ArrowRight size={18} />
          </Link>

          <Link href="/history" className="btn btn-secondary btn-lg">
            <span>View Work Orders</span>
          </Link>
        </div>
      </section>

      {/* Interactive Quick Presets */}
      <section className="presets-section">
        <div className="section-header">
          <h2>One-Click Manufacturing Presets</h2>
          <p>Select a representative manufacturing load to test the calculator immediately</p>
        </div>

        <div className="presets-grid">
          {/* Preset 1 */}
          <div className="preset-card glass-panel" onClick={() => handleLaunchPreset("standard")}>
            <div className="preset-badge ready">Standard Freight</div>
            <div className="preset-title">48" × 40" Flush Pallet</div>
            <div className="preset-meta">
              CAD Product: 46" × 38" × 32" • 950 lbs
            </div>
            <ul className="preset-specs">
              <li><CheckCircle2 size={14} className="text-cyan" /> 3x Nominal 2x4 Stringers</li>
              <li><CheckCircle2 size={14} className="text-cyan" /> 1x6 Impact Lead Deckboards</li>
              <li><CheckCircle2 size={14} className="text-cyan" /> Uniform 2.8" Board Gaps</li>
            </ul>
            <button className="btn btn-primary btn-sm w-full mt-4">
              <span>Test This Build</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Preset 2 */}
          <div className="preset-card glass-panel" onClick={() => handleLaunchPreset("aerospace")}>
            <div className="preset-badge amber">High Deflection Defended</div>
            <div className="preset-title">60" × 46" Reinforced Pallet</div>
            <div className="preset-meta">
              CAD Product: 58" × 44" × 36" • 1,850 lbs
            </div>
            <ul className="preset-specs">
              <li><CheckCircle2 size={14} className="text-amber" /> 4x Stringers (Auto-deflection rule)</li>
              <li><CheckCircle2 size={14} className="text-amber" /> 1x6 Heavy Top Deckboards</li>
              <li><CheckCircle2 size={14} className="text-amber" /> High-Torque Spiral Fasteners</li>
            </ul>
            <button className="btn btn-amber btn-sm w-full mt-4">
              <span>Test This Build</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Preset 3 */}
          <div className="preset-card glass-panel" onClick={() => handleLaunchPreset("skid")}>
            <div className="preset-badge skid">Heavy Timber Skid</div>
            <div className="preset-title">84" × 54" Heavy-Duty Timber Skid</div>
            <div className="preset-meta">
              CAD Product: 82" × 52" × 48" • 3,400 lbs
            </div>
            <ul className="preset-specs">
              <li><CheckCircle2 size={14} className="text-cyan" /> 5x Nominal 4x4 Solid Runners</li>
              <li><CheckCircle2 size={14} className="text-cyan" /> 10,000 lbs Safe Load Rating</li>
              <li><CheckCircle2 size={14} className="text-cyan" /> Heavy Machinery Clearance</li>
            </ul>
            <button className="btn btn-primary btn-sm w-full mt-4">
              <span>Test This Build</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="section-header">
          <h2>Engineered for Manufacturing Operations</h2>
          <p>Built to bridge the gap between engineering CAD models and shop-floor wood sawyers</p>
        </div>

        <div className="features-grid">
          <div className="feature-item glass-panel">
            <div className="feature-icon-wrapper cyan">
              <Zap size={22} />
            </div>
            <h3>Automated Clearance Math</h3>
            <p>
              Auto-computes length & width allowances ($2.0"$ standard) with automated stringer
              spacing to avoid forklift blade pinch and load tipping.
            </p>
          </div>

          <div className="feature-item glass-panel">
            <div className="feature-icon-wrapper amber">
              <Hammer size={22} />
            </div>
            <h3>Itemized Wood Cut List</h3>
            <p>
              Instantly converts nominal dimensional lumber (1x4, 1x6, 2x4, 4x4) into exact
              sawyer cut lengths, board foot totals, and fastener counts.
            </p>
          </div>

          <div className="feature-item glass-panel">
            <div className="feature-icon-wrapper blue">
              <Layers size={22} />
            </div>
            <h3>Interactive CAD Blueprint & 3D</h3>
            <p>
              Inspect 3D isometric models, top-down spacing blueprints, and elevation profiles
              with transparent CAD product footprints.
            </p>
          </div>

          <div className="feature-item glass-panel">
            <div className="feature-icon-wrapper emerald">
              <FileSpreadsheet size={22} />
            </div>
            <h3>Printable & CSV Export</h3>
            <p>
              One-click printer view formatted specifically for physical clipboards at saw
              stations, plus CSV data exports for ERP integration.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 60px 24px 100px;
          display: flex;
          flex-direction: column;
          gap: 70px;
        }
        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 840px;
          margin: 0 auto;
          gap: 20px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          font-size: 0.82rem;
          font-weight: 600;
          color: #fef08a;
        }
        .hero-title {
          font-size: 3rem;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .hero-desc {
          font-size: 1.15rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }
        .btn-lg {
          padding: 14px 28px;
          font-size: 1rem;
        }
        .section-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .section-header h2 {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .section-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }
        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .preset-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s, border-color 0.2s;
        }
        .preset-card:hover {
          transform: translateY(-4px);
          border-color: rgba(6, 182, 212, 0.5);
        }
        .preset-badge {
          align-self: flex-start;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .preset-badge.ready {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .preset-badge.amber {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .preset-badge.skid {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .preset-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }
        .preset-meta {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .preset-specs {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
          font-size: 0.85rem;
          color: #cbd5e1;
        }
        .preset-specs li {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .w-full { width: 100%; }
        .mt-4 { margin-top: 16px; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }
        .feature-item {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feature-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-icon-wrapper.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: var(--accent-cyan);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .feature-icon-wrapper.amber {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-amber);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .feature-icon-wrapper.blue {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .feature-icon-wrapper.emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .feature-item h3 {
          font-size: 1.15rem;
        }
        .feature-item p {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem; }
          .hero-cta-group { flex-direction: column; width: 100%; }
        }
      `}</style>
    </div>
  );
}
