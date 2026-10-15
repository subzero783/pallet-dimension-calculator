"use client";

import React, { useState } from "react";
import { ICalculationResult } from "@/models/WorkOrder";
import { Box, Layers, Shield } from "lucide-react";

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
  middleBoardCount?: 1 | 2;
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
  middleBoardCount: propMiddleBoardCount,
}: PalletDiagramProps) {
  const [viewMode, setViewMode] = useState<"3d" | "top" | "side">("3d");
  const [showProduct, setShowProduct] = useState(true);

  const middleCount: 1 | 2 =
    propMiddleBoardCount ??
    (calculationResult.middleBoardCount === 2 ? 2 : 1);

  // Total wood pieces in middle area between top and bottom lead:
  // - 1 piece mode (Light): 1 left + 1 middle + 1 right = 3 wood pieces
  // - 2 pieces mode (Heavy): 2 left + 2 middle + 2 right = 6 wood pieces (doubled side-by-side)
  const totalMiddleAreaRunners = middleCount === 2 ? 6 : 3;
  const topDeckboardCount = calculationResult.topDeckboardCount || 7;
  const actualSpacing = calculationResult.actualSpacing ?? 3.0;

  // Accurate Cumulative Stack Height:
  // Bottom Lead Boards (0.75") + Middle Boards Height (3.5") + Top Lead Boards (0.75") + Product Height
  const bottomLeadThickness = 0.75;
  const middleBoardHeight = 3.5;
  const topLeadThickness = 0.75;
  const palletTotalH = Math.round((bottomLeadThickness + middleBoardHeight + topLeadThickness) * 10) / 10;
  const cumulativeStackHeight = Math.round((palletTotalH + productHeight) * 10) / 10;

  // 3D Isometric runner positions:
  // When middleCount === 1: 3 pieces (left, center, right)
  // When middleCount === 2: 6 pieces (2 left touching, 2 middle touching, 2 right touching)
  const isoRunners =
    middleCount === 2
      ? [
          { xOffset: 198, isMiddle: false, label: "Left Outer (1/2)" },
          { xOffset: 222, isMiddle: false, label: "Left Outer (2/2)" },
          { xOffset: 388, isMiddle: true, label: "Middle Wood (1/2)" },
          { xOffset: 412, isMiddle: true, label: "Middle Wood (2/2)" },
          { xOffset: 578, isMiddle: false, label: "Right Outer (1/2)" },
          { xOffset: 602, isMiddle: false, label: "Right Outer (2/2)" },
        ]
      : [
          { xOffset: 210, isMiddle: false, label: "Left Outer Runner" },
          { xOffset: 400, isMiddle: true, label: "Middle Wood Piece" },
          { xOffset: 590, isMiddle: false, label: "Right Outer Runner" },
        ];

  // Elevation Side runner blocks:
  // When middleCount === 1: 3 blocks (x=160, 384, 608)
  // When middleCount === 2: 6 blocks (pairs touching side-by-side)
  const sideRunners =
    middleCount === 2
      ? [
          { x: 152, width: 28, isMiddle: false, label: "L1" },
          { x: 180, width: 28, isMiddle: false, label: "L2" },
          { x: 372, width: 28, isMiddle: true, label: "M1" },
          { x: 400, width: 28, isMiddle: true, label: "M2" },
          { x: 592, width: 28, isMiddle: false, label: "R1" },
          { x: 620, width: 28, isMiddle: false, label: "R2" },
        ]
      : [
          { x: 160, width: 36, isMiddle: false, label: "Left" },
          { x: 382, width: 36, isMiddle: true, label: "Middle" },
          { x: 604, width: 36, isMiddle: false, label: "Right" },
        ];

  // Top CAD Blueprint runner positions:
  const topRunners =
    middleCount === 2
      ? [
          { y: 72, isMiddle: false, label: "Left Outer (1/2)" },
          { y: 94, isMiddle: false, label: "Left Outer (2/2)" },
          { y: 230, isMiddle: true, label: "Middle Wood (1/2)" },
          { y: 252, isMiddle: true, label: "Middle Wood (2/2)" },
          { y: 386, isMiddle: false, label: "Right Outer (1/2)" },
          { y: 408, isMiddle: false, label: "Right Outer (2/2)" },
        ]
      : [
          { y: 80, isMiddle: false, label: "Left Outer Runner" },
          { y: 240, isMiddle: true, label: "Middle Wood Piece" },
          { y: 400, isMiddle: false, label: "Right Outer Runner" },
        ];

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
            Pallet: {palletLength}" L × {palletWidth}" W × {palletTotalH}" H •{" "}
            {middleCount === 2
              ? "6 Wood Pieces Total (2 Middle + 4 Outer Doubled)"
              : "3 Wood Pieces Total (1 Middle + 2 Outer)"}
          </div>
        </div>

        <div className="diagram-actions">
          <button
            onClick={() => setShowProduct(!showProduct)}
            className={`btn-toggle ${showProduct ? "active" : ""}`}
            title="Toggle Product CAD Bounding Box"
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
          <svg viewBox="0 0 800 500" className="cad-svg">
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
              <linearGradient id="bottomLeadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="stringerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="productGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.45)" />
                <stop offset="100%" stopColor="rgba(2, 132, 199, 0.2)" />
              </linearGradient>
            </defs>

            {/* Base Floor Shadow */}
            <ellipse cx="400" cy="410" rx="270" ry="50" fill="rgba(0,0,0,0.5)" filter="blur(16px)" />

            {/* 1. BOTTOM LEAD BOARDS (Visibly rendered at base of pallet underneath runners) */}
            {/* Rear Bottom Lead Board */}
            <g className="bottom-lead-rear">
              <polygon
                points="290,178 630,178 642,168 302,168"
                fill="url(#bottomLeadGradient)"
                stroke="#451a03"
                strokeWidth="1"
              />
              <polygon
                points="290,178 630,178 630,188 290,188"
                fill="#542306"
                stroke="#2e1002"
                strokeWidth="1"
              />
            </g>

            {/* 2. MIDDLE WOOD PIECES & OUTER RUNNERS (Sitting on bottom lead boards) */}
            {/* When middleCount === 2, 6 wood pieces rendered as 3 doubled pairs touching side-by-side */}
            {isoRunners.map((runner, i) => {
              const xOffset = runner.xOffset;
              const isMiddle = runner.isMiddle;

              return (
                <g key={`runner-3d-${i}`} className={isMiddle ? "middle-wood-piece" : "outer-runner"}>
                  {/* Runner Top */}
                  <polygon
                    points={`${xOffset - 10},270 ${xOffset + 10},270 ${xOffset + 102},170 ${xOffset + 82},170`}
                    fill="url(#stringerGradient)"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Runner Front Face */}
                  <polygon
                    points={`${xOffset - 10},270 ${xOffset + 10},270 ${xOffset + 10},310 ${xOffset - 10},310`}
                    fill={isMiddle ? "#632707" : "#542306"}
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                  {/* Runner Side Face */}
                  <polygon
                    points={`${xOffset + 10},270 ${xOffset + 102},170 ${xOffset + 102},210 ${xOffset + 10},310`}
                    fill={isMiddle ? "#481b05" : "#3b1604"}
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Front Bottom Lead Board (rendered at the base in front of runner feet) */}
            <g className="bottom-lead-front">
              <polygon
                points="180,310 595,310 607,298 192,298"
                fill="url(#bottomLeadGradient)"
                stroke="#451a03"
                strokeWidth="1"
              />
              <polygon
                points="180,310 595,310 595,324 180,324"
                fill="#542306"
                stroke="#2e1002"
                strokeWidth="1"
              />
              <polygon
                points="595,310 607,298 607,312 595,324"
                fill="#3b1604"
                stroke="#2e1002"
                strokeWidth="1"
              />
              <text x="390" y="321" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
                Bottom Lead Board (Base)
              </text>
            </g>

            {/* 3. TOP LEAD & DECK BOARDS */}
            {Array.from({ length: topDeckboardCount }).map((_, i) => {
              const isLead = i === 0 || i === topDeckboardCount - 1;
              const boardY = 264 - i * (98 / Math.max(1, topDeckboardCount - 1));

              return (
                <g key={`deck-3d-${i}`} className="deckboard-group">
                  <polygon
                    points={`180,${boardY} 600,${boardY} 614,${boardY - 14} 194,${boardY - 14}`}
                    fill={isLead ? "url(#leadBoardGradient)" : "url(#lumberGradient)"}
                    stroke="#78350f"
                    strokeWidth="1"
                  />
                  <polygon
                    points={`180,${boardY} 600,${boardY} 600,${boardY + 6} 180,${boardY + 6}`}
                    fill={isLead ? "#b45309" : "#78350f"}
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  <polygon
                    points={`600,${boardY} 614,${boardY - 14} 614,${boardY - 8} 600,${boardY + 6}`}
                    fill="#542306"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* 4. CAD PRODUCT */}
            {showProduct && (
              <g className="cad-product-group" opacity="0.95">
                <polygon
                  points="230,240 570,240 645,155 305,155"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <polygon
                  points="230,110 570,110 645,25 305,25"
                  fill="url(#productGlass)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <polygon
                  points="230,240 570,240 570,110 230,110"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <polygon
                  points="570,240 645,155 645,25 570,110"
                  fill="rgba(2, 132, 199, 0.3)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                <rect x="320" y="145" width="200" height="34" rx="5" fill="rgba(15, 23, 42, 0.9)" stroke="#06b6d4" strokeWidth="1" />
                <text x="420" y="167" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle">
                  CAD PAYLOAD: {productWeight} lbs
                </text>
              </g>
            )}

            {/* Accurate Cumulative Stack Height Callout */}
            <g className="height-callout">
              <line x1="120" y1="324" x2="120" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="110" y1="324" x2="130" y2="324" stroke="#f59e0b" strokeWidth="2" />
              <line x1="110" y1="110" x2="130" y2="110" stroke="#f59e0b" strokeWidth="2" />
              <text x="95" y="220" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle" transform="rotate(-90 95 220)">
                Cumulative Stack H: {cumulativeStackHeight}"
              </text>
            </g>
          </svg>
        )}

        {viewMode === "top" && (
          <svg viewBox="0 0 800 480" className="cad-svg">
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="480" fill="url(#cadGrid)" />

            {/* Bottom Lead Boards Footprints */}
            <rect x="150" y="60" width="40" height="360" rx="2" fill="rgba(180, 83, 9, 0.2)" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x="610" y="60" width="40" height="360" rx="2" fill="rgba(180, 83, 9, 0.2)" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 3" />

            {/* Runners / Wood Pieces Footprints */}
            {topRunners.map((runner, i) => (
              <g key={`top-runner-${i}`}>
                <rect
                  x="150"
                  y={runner.y - 8}
                  width="500"
                  height="16"
                  fill={runner.isMiddle ? "rgba(6, 182, 212, 0.3)" : "rgba(120, 53, 15, 0.35)"}
                  stroke={runner.isMiddle ? "#06b6d4" : "#b45309"}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x="400" y={runner.y + 4} fill={runner.isMiddle ? "#67e8f9" : "#cbd5e1"} fontSize="10" textAnchor="middle" fontWeight="bold">
                  {runner.label}
                </text>
              </g>
            ))}

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
                    {isLead ? "1x6 Lead Board" : "Top Deckboard"}
                  </text>
                </g>
              );
            })}

            {/* CAD Product Outline */}
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

            <text x="400" y="445" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
              Deckboard Gap: {actualSpacing}" {actualSpacing === 0 ? "(Omitted / Continuous)" : "Uniform Spacing"} • {totalMiddleAreaRunners} Total Wood Pieces in Middle Area
            </text>
          </svg>
        )}

        {viewMode === "side" && (
          <svg viewBox="0 0 800 480" className="cad-svg">
            {/* Floor Line */}
            <line x1="60" y1="380" x2="740" y2="380" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" />
            <text x="400" y="405" fill="#94a3b8" fontSize="12" textAnchor="middle">
              Warehouse Concrete Floor Level
            </text>

            {/* 1. BOTTOM LEAD BOARDS (Visibly rendered at base of pallet underneath middle boards) */}
            <rect
              x="140"
              y="358"
              width="520"
              height="20"
              rx="2"
              fill="#b45309"
              stroke="#78350f"
              strokeWidth="2"
            />
            <text x="400" y="373" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
              Bottom Lead Boards (Base) — 0.75" Thickness
            </text>

            {/* 2. MIDDLE WOOD PIECES & OUTER RUNNERS (Rendered between bottom lead boards and top lead boards) */}
            {/* When middleCount === 2: 6 wood pieces rendered in 3 sistered pairs right next to each other */}
            {sideRunners.map((runner, i) => (
              <g key={`side-runner-${i}`}>
                <rect
                  x={runner.x}
                  y="278"
                  width={runner.width}
                  height="80"
                  rx="2"
                  fill={runner.isMiddle ? "#92400e" : "#78350f"}
                  stroke={runner.isMiddle ? "#d97706" : "#451a03"}
                  strokeWidth="2"
                />
                <text x={runner.x + runner.width / 2} y="322" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {runner.label}
                </text>
              </g>
            ))}

            {/* 3. TOP LEAD & DECK BOARD SURFACE (Sitting on top of middle wood pieces/runners) */}
            <rect
              x="140"
              y="258"
              width="520"
              height="20"
              rx="2"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="2"
            />
            <text x="400" y="272" fill="#000000" fontSize="11" fontWeight="bold" textAnchor="middle">
              Top Lead & Deck Boards Surface — 0.75" Thickness
            </text>

            {/* 4. PRODUCT SITTING ON TOP */}
            {showProduct && (
              <g>
                <rect
                  x="180"
                  y="120"
                  width="440"
                  height="138"
                  rx="4"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="400" y="180" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                  CAD Product: {productHeight}" H • {productWeight} lbs
                </text>
                <text x="400" y="202" fill="#38bdf8" fontSize="11" textAnchor="middle">
                  Payload Enclosure Footprint
                </text>
              </g>
            )}

            {/* 5. ACCURATE CUMULATIVE VERTICAL STACK DIMENSION CALLOUT */}
            <g className="elevation-dimension-callouts">
              <line x1="90" y1="258" x2="90" y2="378" stroke="#f59e0b" strokeWidth="2" />
              <line x1="82" y1="258" x2="98" y2="258" stroke="#f59e0b" strokeWidth="2" />
              <line x1="82" y1="378" x2="98" y2="378" stroke="#f59e0b" strokeWidth="2" />
              <text x="68" y="322" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                {palletTotalH}" Pallet
              </text>

              <line x1="700" y1="120" x2="700" y2="378" stroke="#38bdf8" strokeWidth="2" />
              <line x1="692" y1="120" x2="708" y2="120" stroke="#38bdf8" strokeWidth="2" />
              <line x1="692" y1="378" x2="708" y2="378" stroke="#38bdf8" strokeWidth="2" />
              <text x="715" y="254" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="start">
                Total Stack: {cumulativeStackHeight}"
              </text>
            </g>

            {/* Cumulative Formula Banner */}
            <rect x="140" y="425" width="520" height="32" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.1)" />
            <text x="400" y="446" fill="#cbd5e1" fontSize="11" textAnchor="middle">
              Cumulative Stack = Bottom Lead (0.75") + Middle Wood (3.5") + Top Lead (0.75") + Product ({productHeight}") = <tspan fill="#f59e0b" fontWeight="bold">{cumulativeStackHeight}"</tspan>
            </text>
          </svg>
        )}
      </div>

      {/* Visual Legend */}
      <div className="diagram-footer">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-swatch amber"></span>
            <span>Top Lead Boards (0.75" × 5.5")</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch cyan"></span>
            <span>
              {middleCount === 2
                ? "2 Middle Wood Pieces (Very Middle Together)"
                : "1 Middle Wood Piece (Center)"}
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch dark-wood"></span>
            <span>
              {middleCount === 2
                ? "4 Outer Runners (2 Left Together + 2 Right Together)"
                : "2 Outer Runners (1 Left + 1 Right)"}
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch brown"></span>
            <span>Bottom Lead Boards (Base)</span>
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
          min-height: 400px;
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
          max-height: 460px;
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
