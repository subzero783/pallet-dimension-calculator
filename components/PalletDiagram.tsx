"use client";

import React, { useState } from "react";
import { ICalculationResult } from "@/models/WorkOrder";
import { Box, Layers, Shield, Ruler } from "lucide-react";

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

  // Total wood pieces in middle area:
  // - 1 piece mode (Light): 1 left + 1 middle + 1 right = 3 wood pieces
  // - 2 pieces mode (Heavy): 2 left + 2 middle + 2 right = 6 wood pieces (doubled side-by-side)
  const totalMiddleAreaRunners = middleCount === 2 ? 6 : 3;
  const topDeckboardCount = calculationResult.topDeckboardCount || 8;
  const bottomDeckboardCount = calculationResult.bottomDeckboardCount ?? 2;
  const actualSpacing = calculationResult.actualSpacing ?? 3.0;

  // Accurate Cumulative Stack Height:
  // Bottom Boards (0.75") + Middle Boards Height (3.5") + Top Boards (0.75") + Product Height
  const bottomDeckThickness = 0.75;
  const middleBoardHeight = 3.5;
  const topDeckThickness = 0.75;
  const palletTotalH = Math.round((bottomDeckThickness + middleBoardHeight + topDeckThickness) * 10) / 10;
  const cumulativeStackHeight = Math.round((palletTotalH + productHeight) * 10) / 10;

  // Clearance allowances per side (inches)
  const clearanceLength = Math.max(0, Math.round(((palletLength - productLength) / 2) * 10) / 10);
  const clearanceWidth = Math.max(0, Math.round(((palletWidth - productWidth) / 2) * 10) / 10);

  // Top CAD Blueprint scaling and positioning:
  // Pallet spans along X: 150 to 650 (500px length), Y: 70 to 410 (340px width)
  const topScaleX = 500 / Math.max(1, palletLength);
  const topScaleY = 340 / Math.max(1, palletWidth);
  const topProdClearanceX = clearanceLength * topScaleX;
  const topProdClearanceY = clearanceWidth * topScaleY;
  const topProdX = 150 + topProdClearanceX;
  const topProdW = Math.max(20, 500 - 2 * topProdClearanceX);
  const topProdY = 70 + topProdClearanceY;
  const topProdH = Math.max(20, 340 - 2 * topProdClearanceY);

  // Elevation Side scaling and positioning:
  // Pallet width spans along X: 140 to 660 (520px)
  const sideScaleW = 520 / Math.max(1, palletWidth);
  const sideProdClearance = clearanceWidth * sideScaleW;
  const sideProdX = 140 + sideProdClearance;
  const sideProdW = Math.max(40, 520 - 2 * sideProdClearance);

  // 3D Isometric product placement based on exact proportional margins:
  const isoFractionW = Math.min(0.96, Math.max(0.2, productWidth / Math.max(1, palletWidth)));
  const isoFractionL = Math.min(0.96, Math.max(0.2, productLength / Math.max(1, palletLength)));
  const isoMarginW = (420 * (1 - isoFractionW)) / 2;
  const isoMarginL = (1 - isoFractionL) / 2;
  const isoX1 = Math.round(180 + isoMarginW + isoMarginL * 92);
  const isoY1 = Math.round(264 - isoMarginL * 100);
  const isoX2 = Math.round(600 - isoMarginW + isoMarginL * 92);
  const isoY2 = isoY1;
  const isoX3 = Math.round(600 - isoMarginW + (1 - isoMarginL) * 92);
  const isoY3 = Math.round(264 - (1 - isoMarginL) * 100);
  const isoX4 = Math.round(180 + isoMarginW + (1 - isoMarginL) * 92);
  const isoY4 = isoY3;
  const isoH = Math.min(160, Math.max(70, Math.round(productHeight * 3.2)));

  // 3D Isometric runner positions:
  // When middleCount === 1: 3 pieces (left, center, right)
  // When middleCount === 2: 6 pieces (2 left touching, 2 middle touching, 2 right touching)
  const isoRunners =
    middleCount === 2
      ? [
          { xLeft: 180, xRight: 200, isMiddle: false, label: "Left Outer (1/2)" },
          { xLeft: 200, xRight: 220, isMiddle: false, label: "Left Outer (2/2)" },
          { xLeft: 370, xRight: 390, isMiddle: true, label: "Middle Wood (1/2)" },
          { xLeft: 390, xRight: 410, isMiddle: true, label: "Middle Wood (2/2)" },
          { xLeft: 560, xRight: 580, isMiddle: false, label: "Right Outer (1/2)" },
          { xLeft: 580, xRight: 600, isMiddle: false, label: "Right Outer (2/2)" },
        ]
      : [
          { xLeft: 180, xRight: 200, isMiddle: false, label: "Left Outer Runner" },
          { xLeft: 380, xRight: 400, isMiddle: true, label: "Middle Wood Piece" },
          { xLeft: 580, xRight: 600, isMiddle: false, label: "Right Outer Runner" },
        ];

  // Proportional layout of top and bottom deckboards along pallet length in 3D:
  const boardNominalWidth = deckboardNominal === "1x6" ? 5.5 : 3.5;

  const numTop = Math.max(1, topDeckboardCount);
  const gapTop =
    numTop > 1
      ? Math.max(0, (palletLength - numTop * boardNominalWidth) / (numTop - 1))
      : 0;

  const topBoards3D = Array.from({ length: numTop }).map((_, i) => {
    let startInch = i * (boardNominalWidth + gapTop);
    let endInch = startInch + boardNominalWidth;
    if (numTop === 1) {
      startInch = 0;
      endInch = palletLength;
    } else if (i === numTop - 1) {
      endInch = palletLength;
      startInch = Math.max(0, palletLength - boardNominalWidth);
    }
    const t0 = Math.min(1, Math.max(0, startInch / Math.max(1, palletLength)));
    const t1 = Math.min(1, Math.max(t0 + 0.005, endInch / Math.max(1, palletLength)));
    return { index: i, t0, t1 };
  });

  // Bottom Boards (Uniform Base Deck): 2 to 5 boards, spaced out evenly from front to rear
  const numBot = Math.min(5, Math.max(2, bottomDeckboardCount));
  const botBoards3D = Array.from({ length: numBot }).map((_, i) => {
    const stepInch = (palletLength - boardNominalWidth) / (numBot - 1);
    const startInch = i * stepInch;
    const endInch = startInch + boardNominalWidth;
    const t0 = Math.min(1, Math.max(0, startInch / Math.max(1, palletLength)));
    const t1 = Math.min(1, Math.max(t0 + 0.005, endInch / Math.max(1, palletLength)));
    return { index: i, t0, t1 };
  });

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
  // In 2D Top CAD view, runners run along X-axis (width 500, from x=150 to x=650).
  // Runner thickness along Y-axis = 18px.
  // When middleCount === 2, each pair must touch directly side-by-side with 0 visual gap!
  const runnerThickness2D = 18;
  const topRunners =
    middleCount === 2
      ? [
          { y: 70, height: runnerThickness2D, isMiddle: false, label: "Left Outer (1/2)" },
          { y: 70 + runnerThickness2D, height: runnerThickness2D, isMiddle: false, label: "Left Outer (2/2)" },
          { y: 240 - runnerThickness2D, height: runnerThickness2D, isMiddle: true, label: "Middle Wood (1/2)" },
          { y: 240, height: runnerThickness2D, isMiddle: true, label: "Middle Wood (2/2)" },
          { y: 410 - 2 * runnerThickness2D, height: runnerThickness2D, isMiddle: false, label: "Right Outer (1/2)" },
          { y: 410 - runnerThickness2D, height: runnerThickness2D, isMiddle: false, label: "Right Outer (2/2)" },
        ]
      : [
          { y: 70, height: runnerThickness2D, isMiddle: false, label: "Left Outer Runner" },
          { y: 240 - runnerThickness2D / 2, height: runnerThickness2D, isMiddle: true, label: "Middle Wood Piece" },
          { y: 410 - runnerThickness2D, height: runnerThickness2D, isMiddle: false, label: "Right Outer Runner" },
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
        {/* ========================================================
            1. ISOMETRIC 3D VIEW
           ======================================================== */}
        {viewMode === "3d" && (
          <svg viewBox="0 0 800 520" className="cad-svg">
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
            <ellipse cx="430" cy="305" rx="270" ry="42" fill="rgba(0,0,0,0.55)" filter="blur(16px)" />

            {/* 1. BOTTOM BOARDS (Evenly spaced across base, supporting runners from underneath) */}
            {[...botBoards3D].reverse().map((b) => {
              const xL0 = Math.round(180 + b.t0 * 92);
              const xR0 = Math.round(600 + b.t0 * 92);
              const xL1 = Math.round(180 + b.t1 * 92);
              const xR1 = Math.round(600 + b.t1 * 92);

              const yTop0 = Math.round(316 - b.t0 * 100);
              const yBot0 = Math.round(324 - b.t0 * 100);
              const yTop1 = Math.round(316 - b.t1 * 100);
              const yBot1 = Math.round(324 - b.t1 * 100);

              return (
                <g key={`bot-board-${b.index}`} className="bottom-board-group">
                  {/* Top Face of bottom board (visible in gaps and fork cavities) */}
                  <polygon
                    points={`${xL0},${yTop0} ${xR0},${yTop0} ${xR1},${yTop1} ${xL1},${yTop1}`}
                    fill="url(#bottomLeadGradient)"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Front Face */}
                  <polygon
                    points={`${xL0},${yTop0} ${xR0},${yTop0} ${xR0},${yBot0} ${xL0},${yBot0}`}
                    fill="#542306"
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                  {/* Right Side Face */}
                  <polygon
                    points={`${xR0},${yTop0} ${xR1},${yTop1} ${xR1},${yBot1} ${xR0},${yBot0}`}
                    fill="#3b1604"
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* 2. MIDDLE WOOD PIECES & OUTER RUNNERS (Sitting on bottom boards) */}
            {isoRunners.map((runner, i) => {
              const { xLeft, xRight, isMiddle } = runner;

              return (
                <g key={`runner-3d-${i}`} className={isMiddle ? "middle-wood-piece" : "outer-runner"}>
                  {/* Runner Top */}
                  <polygon
                    points={`${xLeft},272 ${xRight},272 ${xRight + 92},172 ${xLeft + 92},172`}
                    fill="url(#stringerGradient)"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Runner Front Face */}
                  <polygon
                    points={`${xLeft},272 ${xRight},272 ${xRight},316 ${xLeft},316`}
                    fill={isMiddle ? "#632707" : "#542306"}
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                  {/* Runner Side Face */}
                  <polygon
                    points={`${xRight},272 ${xRight + 92},172 ${xRight + 92},216 ${xRight},316`}
                    fill={isMiddle ? "#481b05" : "#3b1604"}
                    stroke="#2e1002"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* 3. UNIFORM TOP BOARDS (Spread out evenly across pallet length) */}
            {[...topBoards3D].reverse().map((b) => {
              const xL0 = Math.round(180 + b.t0 * 92);
              const xR0 = Math.round(600 + b.t0 * 92);
              const xL1 = Math.round(180 + b.t1 * 92);
              const xR1 = Math.round(600 + b.t1 * 92);

              const yTop0 = Math.round(264 - b.t0 * 100);
              const yBot0 = Math.round(272 - b.t0 * 100);
              const yTop1 = Math.round(264 - b.t1 * 100);
              const yBot1 = Math.round(272 - b.t1 * 100);

              return (
                <g key={`deck-3d-${b.index}`} className="deckboard-group">
                  {/* Top Face */}
                  <polygon
                    points={`${xL0},${yTop0} ${xR0},${yTop0} ${xR1},${yTop1} ${xL1},${yTop1}`}
                    fill="url(#lumberGradient)"
                    stroke="#78350f"
                    strokeWidth="1"
                  />
                  {/* Front Face */}
                  <polygon
                    points={`${xL0},${yTop0} ${xR0},${yTop0} ${xR0},${yBot0} ${xL0},${yBot0}`}
                    fill="#92400e"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                  {/* Right Side Face */}
                  <polygon
                    points={`${xR0},${yTop0} ${xR1},${yTop1} ${xR1},${yBot1} ${xR0},${yBot0}`}
                    fill="#542306"
                    stroke="#451a03"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* 4. CAD PRODUCT (Accurately proportioned to clearances, sitting on top deckboards) */}
            {showProduct && (
              <g className="cad-product-group" opacity="0.95">
                {/* Bottom Base */}
                <polygon
                  points={`${isoX1},${isoY1} ${isoX2},${isoY2} ${isoX3},${isoY3} ${isoX4},${isoY4}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Top Face */}
                <polygon
                  points={`${isoX1},${isoY1 - isoH} ${isoX2},${isoY2 - isoH} ${isoX3},${isoY3 - isoH} ${isoX4},${isoY4 - isoH}`}
                  fill="url(#productGlass)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Front Face */}
                <polygon
                  points={`${isoX1},${isoY1} ${isoX2},${isoY2} ${isoX2},${isoY2 - isoH} ${isoX1},${isoY1 - isoH}`}
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Right Side Face */}
                <polygon
                  points={`${isoX2},${isoY2} ${isoX3},${isoY3} ${isoX3},${isoY3 - isoH} ${isoX2},${isoY2 - isoH}`}
                  fill="rgba(2, 132, 199, 0.3)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                <rect
                  x={(isoX1 + isoX2) / 2 - 100}
                  y={(isoY1 + isoY1 - isoH) / 2 - 17}
                  width="200"
                  height="34"
                  rx="5"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke="#06b6d4"
                  strokeWidth="1"
                />
                <text
                  x={(isoX1 + isoX2) / 2}
                  y={(isoY1 + isoY1 - isoH) / 2 + 5}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  CAD PAYLOAD: {productWeight} lbs
                </text>
              </g>
            )}

            {/* 5. RESTORED 3D DIMENSION CALLOUTS (WIDTH, LENGTH, HEIGHT) */}
            {/* Front Width Dimension Callout */}
            <g className="width-callout-3d">
              <line x1="180" y1="345" x2="600" y2="345" stroke="#38bdf8" strokeWidth="2" />
              <line x1="180" y1="337" x2="180" y2="353" stroke="#38bdf8" strokeWidth="2" />
              <line x1="600" y1="337" x2="600" y2="353" stroke="#38bdf8" strokeWidth="2" />
              <rect x="340" y="333" width="100" height="22" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1" />
              <text x="390" y="348" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                Width: {palletWidth}" W
              </text>
            </g>

            {/* Length Dimension Callout along Isometric Depth */}
            <g className="length-callout-3d">
              <line x1="620" y1="340" x2="712" y2="238" stroke="#a855f7" strokeWidth="2" />
              <line x1="614" y1="334" x2="626" y2="346" stroke="#a855f7" strokeWidth="2" />
              <line x1="706" y1="232" x2="718" y2="244" stroke="#a855f7" strokeWidth="2" />
              <rect x="655" y="275" width="105" height="22" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#a855f7" strokeWidth="1" />
              <text x="707" y="290" fill="#c084fc" fontSize="11" fontWeight="bold" textAnchor="middle">
                Length: {palletLength}" L
              </text>
            </g>

            {/* Vertical Stack & Pallet Height Callouts */}
            <g className="height-callout">
              <line x1="120" y1="324" x2="120" y2={Math.min(200, 264 - isoH)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="110" y1="324" x2="130" y2="324" stroke="#f59e0b" strokeWidth="2" />
              <line x1="110" y1={Math.min(200, 264 - isoH)} x2="130" y2={Math.min(200, 264 - isoH)} stroke="#f59e0b" strokeWidth="2" />
              <text
                x="95"
                y={(324 + Math.min(200, 264 - isoH)) / 2}
                fill="#f59e0b"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-90 95 ${(324 + Math.min(200, 264 - isoH)) / 2})`}
              >
                Total Stack: {cumulativeStackHeight}" H
              </text>

              <line x1="150" y1="324" x2="150" y2="264" stroke="#10b981" strokeWidth="2" />
              <line x1="142" y1="324" x2="158" y2="324" stroke="#10b981" strokeWidth="2" />
              <line x1="142" y1="264" x2="158" y2="264" stroke="#10b981" strokeWidth="2" />
              <text x="135" y="294" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="end">
                {palletTotalH}" Pallet
              </text>
            </g>
          </svg>
        )}

        {/* ========================================================
            2. TOP CAD BLUEPRINT VIEW (ACCURATE FLUSH & CLEARANCES)
           ======================================================== */}
        {viewMode === "top" && (
          <svg viewBox="0 0 800 500" className="cad-svg">
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#cadGrid)" />

            {/* RESTORED DIMENSION CALLOUTS: HORIZONTAL LENGTH (TOP) */}
            <g className="dim-length-callout">
              <line x1="150" y1="38" x2="650" y2="38" stroke="#a855f7" strokeWidth="2" />
              <line x1="150" y1="30" x2="150" y2="46" stroke="#a855f7" strokeWidth="2" />
              <line x1="650" y1="30" x2="650" y2="46" stroke="#a855f7" strokeWidth="2" />
              <polygon points="150,38 158,34 158,42" fill="#a855f7" />
              <polygon points="650,38 642,34 642,42" fill="#a855f7" />
              <rect x="340" y="26" width="120" height="24" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#a855f7" strokeWidth="1" />
              <text x="400" y="42" fill="#c084fc" fontSize="12" fontWeight="bold" textAnchor="middle">
                Length: {palletLength}" L
              </text>
            </g>

            {/* RESTORED DIMENSION CALLOUTS: VERTICAL WIDTH (LEFT) */}
            <g className="dim-width-callout">
              <line x1="90" y1="70" x2="90" y2="410" stroke="#38bdf8" strokeWidth="2" />
              <line x1="82" y1="70" x2="98" y2="70" stroke="#38bdf8" strokeWidth="2" />
              <line x1="82" y1="410" x2="98" y2="410" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="90,70 86,78 94,78" fill="#38bdf8" />
              <polygon points="90,410 86,402 94,402" fill="#38bdf8" />
              <rect x="30" y="228" width="115" height="24" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1" />
              <text x="87" y="244" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                Width: {palletWidth}" W
              </text>
            </g>

            {/* Bottom Boards Footprints (Dotted outlines underneath, evenly spaced across base) */}
            {(() => {
              const totalBot = Math.min(5, Math.max(2, bottomDeckboardCount));
              const availableW = 500;
              const scale = availableW / Math.max(1, palletLength);
              const boardW = Math.max(16, Math.min(48, boardNominalWidth * scale));
              const step = (availableW - boardW) / (totalBot - 1);

              return Array.from({ length: totalBot }).map((_, i) => {
                const x = 150 + i * step;
                return (
                  <g key={`bot-fp-${i}`} className="bottom-board-footprint">
                    <rect
                      x={x}
                      y="70"
                      width={boardW}
                      height="340"
                      rx="2"
                      fill="rgba(180, 83, 9, 0.16)"
                      stroke="#b45309"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <text
                      x={x + boardW / 2}
                      y="402"
                      fill="#d97706"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      B{i + 1}
                    </text>
                  </g>
                );
              });
            })()}

            {/* Runners / Wood Pieces Footprints (FLUSH / TOUCHING WITH ZERO GAP WHEN DOUBLED) */}
            {topRunners.map((runner, i) => (
              <g key={`top-runner-${i}`}>
                <rect
                  x="150"
                  y={runner.y}
                  width="500"
                  height={runner.height}
                  fill={runner.isMiddle ? "rgba(6, 182, 212, 0.35)" : "rgba(120, 53, 15, 0.4)"}
                  stroke={runner.isMiddle ? "#06b6d4" : "#b45309"}
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x="400"
                  y={runner.y + runner.height / 2 + 3}
                  fill={runner.isMiddle ? "#67e8f9" : "#fcd34d"}
                  fontSize="9.5"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {runner.label}
                </text>
              </g>
            ))}

            {/* Uniform Top Boards (ACCURATE FLUSH ZERO-GAP WHEN GAP IS OMITTED OR TOUCHING) */}
            {(() => {
              const totalBoards = Math.max(2, topDeckboardCount);
              const availableW = 500;
              const isOmitted = actualSpacing <= 0;

              return Array.from({ length: totalBoards }).map((_, i) => {
                let x: number;
                let boardW: number;

                if (isOmitted) {
                  // Exactly flush: each board touches the next edge-to-edge with 0 gap
                  boardW = availableW / totalBoards;
                  x = 150 + i * boardW;
                } else {
                  // Real-world proportional spacing: boards and uniform gaps
                  const boardInches = deckboardNominal === "1x6" ? 5.5 : 3.5;
                  const scale = availableW / palletLength;
                  boardW = Math.max(16, Math.min(48, boardInches * scale));
                  const step = (availableW - boardW) / Math.max(1, totalBoards - 1);
                  x = 150 + i * step;
                }

                return (
                  <g key={`top-deck-${i}`}>
                    <rect
                      x={x}
                      y="70"
                      width={boardW}
                      height="340"
                      rx={isOmitted ? 0 : 2}
                      fill="rgba(217, 119, 6, 0.75)"
                      stroke="#451a03"
                      strokeWidth={isOmitted ? "1" : "1.5"}
                    />
                    <text
                      x={x + boardW / 2}
                      y="240"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      transform={`rotate(-90 ${x + boardW / 2} 240)`}
                    >
                      Top Board #{i + 1}
                    </text>
                  </g>
                );
              });
            })()}

            {/* CAD Product Outline (Takes into account Width and Length Allowance on all sides) */}
            {showProduct && (
              <g className="product-blueprint-outline">
                <rect
                  x={topProdX}
                  y={topProdY}
                  width={topProdW}
                  height={topProdH}
                  rx="3"
                  fill="rgba(6, 182, 212, 0.12)"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeDasharray="8 5"
                />
                <rect
                  x={topProdX + topProdW / 2 - 110}
                  y={topProdY + topProdH / 2 - 15}
                  width="220"
                  height="30"
                  rx="4"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke="#06b6d4"
                  strokeWidth="1"
                />
                <text
                  x={topProdX + topProdW / 2}
                  y={topProdY + topProdH / 2 + 5}
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  CAD Product: {productLength}" L × {productWidth}" W
                </text>
              </g>
            )}

            {/* Blueprint Status & Spacing Legend */}
            <text x="400" y="445" fill="#38bdf8" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              Top Deck: {topDeckboardCount} Boards ({deckboardNominal} • {boardNominalWidth}" Actual Width) • Actual Gap: {actualSpacing}" {actualSpacing === 0 ? "(Omitted / Flush)" : `(Target: ${calculationResult.boardGap || 3.0}")`} • {bottomDeckboardCount} Bottom Base Boards
            </text>
            <text x="400" y="468" fill="#94a3b8" fontSize="10.5" textAnchor="middle">
              Length Breakdown: {topDeckboardCount} Boards × {boardNominalWidth}" ({Math.round(topDeckboardCount * boardNominalWidth * 10) / 10}") + {Math.max(0, topDeckboardCount - 1)} Gaps × {actualSpacing}" ({Math.round(Math.max(0, topDeckboardCount - 1) * actualSpacing * 10) / 10}") = {palletLength}" Pallet Length
            </text>
          </svg>
        )}

        {/* ========================================================
            3. ELEVATION SIDE VIEW
           ======================================================== */}
        {viewMode === "side" && (
          <svg viewBox="0 0 800 490" className="cad-svg">
            {/* Floor Line */}
            <line x1="60" y1="380" x2="740" y2="380" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" />
            <text x="400" y="402" fill="#94a3b8" fontSize="11" textAnchor="middle">
              Warehouse Concrete Floor Level
            </text>

            {/* 1. BOTTOM BOARDS (Base of pallet underneath runners) */}
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
            <text x="400" y="372" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
              Bottom Boards (Base) — 0.75" Thickness ({bottomDeckboardCount} Boards Evenly Distributed)
            </text>

            {/* 2. MIDDLE WOOD PIECES & OUTER RUNNERS (Rendered between bottom & top boards) */}
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

            {/* 3. TOP BOARDS SURFACE (Sitting on top of runners) */}
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
              Top Boards Surface — 0.75" Thickness ({topDeckboardCount} Boards Evenly Distributed)
            </text>

            {/* 4. PRODUCT SITTING ON TOP (Accurate proportional clearance) */}
            {showProduct && (
              <g>
                <rect
                  x={sideProdX}
                  y={120}
                  width={sideProdW}
                  height={138}
                  rx="4"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="400" y="180" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                  CAD Product: {productHeight}" H • {productWeight} lbs
                </text>
                <text x="400" y="202" fill="#38bdf8" fontSize="11" textAnchor="middle">
                  Payload Enclosure Footprint • +{clearanceWidth}" Clearance (Per Side)
                </text>
              </g>
            )}

            {/* 5. RESTORED DIMENSION CALLOUTS: HORIZONTAL WIDTH (BOTTOM) */}
            <g className="elevation-width-callout">
              <line x1="140" y1="420" x2="660" y2="420" stroke="#38bdf8" strokeWidth="2" />
              <line x1="140" y1="412" x2="140" y2="428" stroke="#38bdf8" strokeWidth="2" />
              <line x1="660" y1="412" x2="660" y2="428" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="140,420 148,416 148,424" fill="#38bdf8" />
              <polygon points="660,420 652,416 652,424" fill="#38bdf8" />
              <rect x="340" y="408" width="120" height="24" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1" />
              <text x="400" y="424" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                Width: {palletWidth}" W
              </text>
            </g>

            {/* 6. VERTICAL STACK & PALLET HEIGHT CALLOUTS */}
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
            <rect x="140" y="445" width="520" height="30" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.1)" />
            <text x="400" y="465" fill="#cbd5e1" fontSize="10.5" textAnchor="middle">
              Cumulative Stack = Bottom (0.75") + Runners (3.5") + Top (0.75") + Product ({productHeight}") = <tspan fill="#f59e0b" fontWeight="bold">{cumulativeStackHeight}"</tspan> • Pallet: {palletLength}" L × {palletWidth}" W
            </text>
          </svg>
        )}
      </div>

      {/* Visual Legend */}
      <div className="diagram-footer">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-swatch amber"></span>
            <span>Top Boards (0.75" × {deckboardNominal === "1x6" ? "5.5" : "3.5"}")</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch cyan"></span>
            <span>
              {middleCount === 2
                ? "2 Middle Wood Pieces (Center Support)"
                : "1 Middle Wood Piece (Center Support)"}
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch dark-wood"></span>
            <span>
              {middleCount === 2
                ? "4 Outer Runners (2 Left Doubled + 2 Right Doubled)"
                : "2 Outer Runners (1 Left + 1 Right)"}
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch brown"></span>
            <span>Bottom Boards ({bottomDeckboardCount} Base Deck Boards Evenly Distributed)</span>
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
          min-height: 420px;
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
          max-height: 480px;
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
