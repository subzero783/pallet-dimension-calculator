"use client";

import React, { useState } from "react";
import { ICalculationResult } from "@/models/WorkOrder";
import { Eye, Box, Layers, Maximize2 } from "lucide-react";

interface PalletDiagramProps {
  palletLength: number;
  palletWidth: number;
  palletHeight: number;
  productLength: number;
  productWidth: number;
  productHeight: number;
  productWeight: number;
  calculationResult: ICalculationResult;
  palletStyle: string;
  deckboardNominal: string;
  stringerNominal: string;
}

export default function PalletDiagram({
  palletLength,
  palletWidth,
  palletHeight,
  productLength,
  productWidth,
  productHeight,
  productWeight,
  calculationResult,
  palletStyle,
  deckboardNominal,
  stringerNominal,
}: PalletDiagramProps) {
  const [viewMode, setViewMode] = useState<"3d" | "top" | "side">("3d");
  const [showProduct, setShowProduct] = useState(true);

  const stringerCount = calculationResult.stringerCount || 3;
  const topDeckboardCount = calculationResult.topDeckboardCount || 7;
  const actualSpacing = calculationResult.actualSpacing || 2.5;

  // Visual helper calculations
  const isSkid = palletStyle === "Heavy-Duty Skid";

  return (
    <div className="diagram-card glass-panel">
      {/* Header & Controls */}
      <div className="diagram-header">
        <div className="diagram-title-group">
          <div className="diagram-title">
            <Box size={18} className="text-cyan" />
            <span>Interactive Pallet CAD Visualizer</span>
          </div>
          <div className="diagram-subtitle">
            Scale: {palletLength}" L × {palletWidth}" W × {palletHeight}" H • {stringerCount} Stringers
          </div>
        </div>

        <div className="diagram-actions">
          <button
            onClick={() => setShowProduct(!showProduct)}
            className={`btn-toggle ${showProduct ? "active" : ""}`}
            title="Toggle Product Bounding Box"
          >
            <Box size={14} />
            <span>Product CAD Box</span>
          </button>

          <div className="view-mode-tabs">
            <button
              onClick={() => setViewMode("3d")}
              className={`tab-btn ${viewMode === "3d" ? "active" : ""}`}
            >
              Isometric 3D
            </button>
            <button
              onClick={() => setViewMode("top")}
              className={`tab-btn ${viewMode === "top" ? "active" : ""}`}
            >
              Top CAD Blueprint
            </button>
            <button
              onClick={() => setViewMode("side")}
              className={`tab-btn ${viewMode === "side" ? "active" : ""}`}
            >
              Elevation Side
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="svg-container">
        {viewMode === "3d" && (
          <svg viewBox="0 0 800 480" className="cad-svg">
            <defs>
              <linearGradient id="lumberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
              <linearGradient id="leadBoardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="stringerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="productGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.45)" />
                <stop offset="100%" stopColor="rgba(2, 132, 199, 0.2)" />
              </linearGradient>
              <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Base Shadow */}
            <ellipse cx="400" cy="380" rx="260" ry="60" fill="rgba(0,0,0,0.4)" filter="blur(16px)" />

            {/* Stringers Isometric (3D) */}
            {Array.from({ length: stringerCount }).map((_, i) => {
              const xOffset = 210 + i * (380 / Math.max(1, stringerCount - 1));
              return (
                <g key={`stringer-${i}`} className="stringer-group">
                  {/* Stringer Top */}
                  <polygon
                    points={`${xOffset - 12},270 ${xOffset + 12},270 ${xOffset + 112},160 ${xOffset + 88},160`}
                    fill="url(#stringerGradient)"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Stringer Front Face */}
                  <polygon
                    points={`${xOffset - 12},270 ${xOffset + 12},270 ${xOffset + 12},310 ${xOffset - 12},310`}
                    fill="#542306"
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                  {/* Stringer Side Face */}
                  <polygon
                    points={`${xOffset + 12},270 ${xOffset + 112},160 ${xOffset + 112},200 ${xOffset + 12},310`}
                    fill="#3b1604"
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Top Deckboards (Isometric) */}
            {Array.from({ length: topDeckboardCount }).map((_, i) => {
              const isLead = i === 0 || i === topDeckboardCount - 1;
              const boardY = 264 - i * (110 / Math.max(1, topDeckboardCount - 1));
              const boardXOffset = i * (100 / Math.max(1, topDeckboardCount - 1));

              return (
                <g key={`deck-${i}`} className="deckboard-group">
                  {/* Board Top */}
                  <polygon
                    points={`180,${boardY} 600,${boardY} 615,${boardY - 14} 195,${boardY - 14}`}
                    fill={isLead ? "url(#leadBoardGradient)" : "url(#lumberGradient)"}
                    stroke="#78350f"
                    strokeWidth="1"
                  />
                  {/* Board Front */}
                  <polygon
                    points={`180,${boardY} 600,${boardY} 600,${boardY + 6} 180,${boardY + 6}`}
                    fill={isLead ? "#b45309" : "#78350f"}
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Board Side */}
                  <polygon
                    points={`600,${boardY} 615,${boardY - 14} 615,${boardY - 8} 600,${boardY + 6}`}
                    fill="#542306"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Fastener markings */}
                  {Array.from({ length: stringerCount }).map((_, sIdx) => {
                    const nailX = 220 + sIdx * (360 / Math.max(1, stringerCount - 1));
                    return (
                      <circle
                        key={`nail-${i}-${sIdx}`}
                        cx={nailX}
                        cy={boardY - 7}
                        r="1.8"
                        fill="#cbd5e1"
                        stroke="#475569"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* CAD Product Bounding Box (Isometric 3D) */}
            {showProduct && (
              <g className="cad-product-group" opacity="0.95">
                {/* Product Base Outline */}
                <polygon
                  points="230,240 570,240 645,155 305,155"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Product Top */}
                <polygon
                  points="230,120 570,120 645,35 305,35"
                  fill="url(#productGlass)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Product Front Face */}
                <polygon
                  points="230,240 570,240 570,120 230,120"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Product Right Face */}
                <polygon
                  points="570,240 645,155 645,35 570,120"
                  fill="rgba(2, 132, 199, 0.3)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                {/* Product Center Label */}
                <rect x="340" y="150" width="160" height="32" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#06b6d4" strokeWidth="1" />
                <text x="420" y="171" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">
                  CAD PAYLOAD: {productWeight} lbs
                </text>
              </g>
            )}

            {/* Dimension Callout annotations */}
            <g className="annotations">
              <line x1="160" y1="268" x2="160" y2="150" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="135" y="215" fill="#f59e0b" fontSize="12" fontWeight="bold" transform="rotate(-90 135 215)">
                L = {palletLength}"
              </text>

              <line x1="200" y1="330" x2="580" y2="330" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="390" y="348" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                W = {palletWidth}"
              </text>
            </g>
          </svg>
        )}

        {viewMode === "top" && (
          <svg viewBox="0 0 800 480" className="cad-svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="480" fill="url(#grid)" />

            {/* Stringers Footprint Outline */}
            {Array.from({ length: stringerCount }).map((_, i) => {
              const y = 80 + i * (320 / Math.max(1, stringerCount - 1));
              return (
                <rect
                  key={`top-str-${i}`}
                  x="150"
                  y={y - 10}
                  width="500"
                  height="20"
                  fill="rgba(120, 53, 15, 0.3)"
                  stroke="#b45309"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
              );
            })}

            {/* Top Deckboards */}
            {Array.from({ length: topDeckboardCount }).map((_, i) => {
              const isLead = i === 0 || i === topDeckboardCount - 1;
              const x = 150 + i * (465 / Math.max(1, topDeckboardCount - 1));
              const boardW = isLead ? 42 : 32;

              return (
                <g key={`top-deck-${i}`}>
                  <rect
                    x={x}
                    y="70"
                    width={boardW}
                    height="340"
                    rx="3"
                    fill={isLead ? "rgba(245, 158, 11, 0.85)" : "rgba(217, 119, 6, 0.7)"}
                    stroke="#451a03"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + boardW / 2}
                    y="245"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    transform={`rotate(-90 ${x + boardW / 2} 245)`}
                  >
                    {isLead ? "1x6 Lead" : `${deckboardNominal}`}
                  </text>
                </g>
              );
            })}

            {/* CAD Product Outline Centered */}
            {showProduct && (
              <rect
                x="200"
                y="110"
                width="400"
                height="260"
                rx="4"
                fill="rgba(6, 182, 212, 0.15)"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="8 5"
              />
            )}

            {/* Gap dimension callouts */}
            <text x="400" y="445" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
              Deckboard Spacing Gap: {actualSpacing}" (Uniform Distribution)
            </text>
          </svg>
        )}

        {viewMode === "side" && (
          <svg viewBox="0 0 800 480" className="cad-svg">
            {/* Floor line */}
            <line x1="80" y1="360" x2="720" y2="360" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" />
            <text x="400" y="385" fill="#94a3b8" fontSize="12" textAnchor="middle">Warehouse Concrete Floor Elevation</text>

            {/* Bottom Deckboards */}
            {!isSkid && (
              <rect x="150" y="340" width="500" height="16" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            )}

            {/* Stringers Front Blocks */}
            {Array.from({ length: stringerCount }).map((_, i) => {
              const x = 160 + i * (440 / Math.max(1, stringerCount - 1));
              return (
                <g key={`side-str-${i}`}>
                  <rect
                    x={x}
                    y="260"
                    width="40"
                    height="80"
                    fill="#78350f"
                    stroke="#451a03"
                    strokeWidth="2"
                  />
                  <text x={x + 20} y="305" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                    {stringerNominal}
                  </text>
                </g>
              );
            })}

            {/* Top Deckboard Surface */}
            <rect x="150" y="244" width="500" height="16" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />

            {/* Forklift Tunnels annotation */}
            <text x="400" y="305" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
              Forklift Entry Tunnels: Clearance {(palletWidth / (stringerCount - 1) - 3.5).toFixed(1)}" Wide
            </text>

            {/* Product sitting on top */}
            {showProduct && (
              <g>
                <rect
                  x="200"
                  y="100"
                  width="400"
                  height="144"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="400" y="175" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                  CAD Product: {productHeight}" Height • {productWeight} lbs
                </text>
              </g>
            )}

            {/* Height Callout */}
            <line x1="120" y1="244" x2="120" y2="356" stroke="#f59e0b" strokeWidth="2" />
            <text x="95" y="305" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle">
              {palletHeight}"
            </text>
          </svg>
        )}
      </div>

      {/* Visual Legend */}
      <div className="diagram-footer">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-swatch amber"></span>
            <span>1x6 Lead Deckboards (2x Front/Back)</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch brown"></span>
            <span>{deckboardNominal} Interior Deckboards ({actualSpacing}" uniform gap)</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch dark-wood"></span>
            <span>{stringerCount}x {stringerNominal} Stringers</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch cyan"></span>
            <span>CAD Product Payload Enclosure</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .diagram-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .diagram-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .diagram-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }
        .diagram-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          margin-top: 2px;
        }
        .diagram-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-toggle.active {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.4);
          color: var(--accent-cyan);
        }
        .view-mode-tabs {
          display: flex;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 2px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 5px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--accent-cyan);
          color: #000000;
          font-weight: 700;
        }
        .svg-container {
          width: 100%;
          min-height: 380px;
          background: #060a12;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .cad-svg {
          width: 100%;
          height: 100%;
          max-height: 440px;
        }
        .diagram-footer {
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }
        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .legend-swatch {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
        .legend-swatch.amber { background: var(--accent-amber); }
        .legend-swatch.brown { background: #b45309; }
        .legend-swatch.dark-wood { background: #542306; }
        .legend-swatch.cyan { background: var(--accent-cyan); }
        .text-cyan { color: var(--accent-cyan); }
      `}</style>
    </div>
  );
}
