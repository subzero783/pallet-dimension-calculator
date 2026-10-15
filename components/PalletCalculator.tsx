"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCadDimensions,
  setPalletConfig,
  setOrderMetadata,
  resetCalculator,
} from "@/store/slices/calculatorSlice";
import { saveWorkOrder } from "@/store/slices/workOrderSlice";
import { useToast } from "@/context/ToastContext";
import PalletDiagram from "@/components/PalletDiagram";
import CutListTable from "@/components/CutListTable";
import {
  Box,
  Layers,
  Save,
  RotateCcw,
  UserCheck,
  Building2,
  FileText,
  BadgeInfo,
  CheckCircle2,
  Sliders,
  Shield,
  Briefcase,
} from "lucide-react";

interface PalletCalculatorProps {
  isCompanyPage?: boolean;
}

export default function PalletCalculator({ isCompanyPage = false }: PalletCalculatorProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    jobId,
    workOrderId,
    employeeId,
    employeeFirstName,
    productName,
    customer,
    cadDimensions,
    palletConfig,
    calculationResult,
    notes,
  } = useAppSelector((state) => state.calculator);

  const { user } = useAppSelector((state) => state.auth);
  const [isSaving, setIsSaving] = useState(false);

  const activeJobId = jobId || workOrderId || "";

  const handleCadChange = (field: keyof typeof cadDimensions, value: number) => {
    dispatch(setCadDimensions({ [field]: isNaN(value) ? 0 : value }));
  };

  const handleConfigChange = (field: keyof typeof palletConfig, value: any) => {
    dispatch(setPalletConfig({ [field]: value }));
  };

  // Toggle for middle wood pieces (1 vs 2 pieces)
  const handleMiddlePiecesToggle = (count: 1 | 2) => {
    dispatch(setPalletConfig({ middleBoardCount: count }));
  };

  // Gap between boards: 3 to 5 inches OR 0 (omitted)
  const currentGap = palletConfig.boardGap ?? palletConfig.targetMaxGap ?? 3.0;
  const isGapOmitted = currentGap === 0;

  const handleGapChange = (gap: number) => {
    dispatch(setPalletConfig({ boardGap: gap, targetMaxGap: gap }));
  };

  const handleToggleOmitGap = () => {
    if (isGapOmitted) {
      handleGapChange(3.0); // restore default 3"
    } else {
      handleGapChange(0); // omit gap
    }
  };

  const handleSaveOrder = async () => {
    // If on Pacific Maritime page, require employee info and job ID
    if (isCompanyPage) {
      if (!activeJobId.trim()) {
        toast.warning("Please enter a Job ID before saving");
        return;
      }
      if (!employeeId.trim()) {
        toast.warning("Please enter your Employee ID");
        return;
      }
      if (!employeeFirstName.trim()) {
        toast.warning("Please enter your First Name");
        return;
      }
    }

    if (!cadDimensions.length || !cadDimensions.width || !cadDimensions.height) {
      toast.warning("Please verify CAD product dimensions are greater than zero");
      return;
    }

    setIsSaving(true);
    try {
      const orderPayload = {
        jobId: activeJobId.trim() || `JOB-${Math.floor(10000 + Math.random() * 90000)}`,
        workOrderId: activeJobId.trim() || `JOB-${Math.floor(10000 + Math.random() * 90000)}`,
        employeeId: employeeId.trim(),
        employeeFirstName: employeeFirstName.trim(),
        productName: productName.trim() || "Pallet Assembly",
        customer: customer.trim() || (isCompanyPage ? "Pacific Maritime Industries Corp." : "Standard Customer"),
        cadDimensions,
        palletConfig,
        calculationResult,
        notes,
        status: "READY_FOR_BUILD" as const,
      };

      await dispatch(saveWorkOrder(orderPayload)).unwrap();
      toast.success(`Job ${orderPayload.jobId} saved to plant register successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="calc-page-container">
      {/* Top Banner for Pacific Maritime */}
      {isCompanyPage && (
        <div className="company-banner glass-panel">
          <div className="company-brand">
            <div className="company-logo">
              <Building2 size={24} className="text-cyan" />
            </div>
            <div>
              <h1 className="company-title">Pacific Maritime Industries Corp.</h1>
              <p className="company-subtitle">
                Plant Crating & Pallet Dimension Calculator • Shipping Floor Station
              </p>
            </div>
          </div>
          <div className="company-badge">
            <Shield size={14} className="text-amber" />
            <span>Authorized Manufacturing Portal</span>
          </div>
        </div>
      )}

      {/* Top Job & Employee Identification Bar */}
      <div className="order-bar glass-panel">
        <div className="order-bar-meta">
          {/* Job ID */}
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="jobId">
              {isCompanyPage ? "Job ID *" : "Job ID / Work Order #"}
            </label>
            <input
              id="jobId"
              type="text"
              className="form-input mono font-bold"
              placeholder="e.g. JOB-10492"
              value={activeJobId}
              onChange={(e) => dispatch(setOrderMetadata({ jobId: e.target.value }))}
            />
          </div>

          {/* Employee ID */}
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="employeeId">
              Employee ID {isCompanyPage && "*"}
            </label>
            <input
              id="employeeId"
              type="text"
              className="form-input mono"
              placeholder="e.g. EMP-402"
              value={employeeId}
              onChange={(e) => dispatch(setOrderMetadata({ employeeId: e.target.value }))}
            />
          </div>

          {/* Employee First Name */}
          <div className="form-group flex-1">
            <label className="form-label" htmlFor="employeeFirstName">
              First Name {isCompanyPage && "*"}
            </label>
            <input
              id="employeeFirstName"
              type="text"
              className="form-input"
              placeholder="e.g. Oliver"
              value={employeeFirstName}
              onChange={(e) => dispatch(setOrderMetadata({ employeeFirstName: e.target.value }))}
            />
          </div>

          {/* CAD Product Name */}
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="productName">
              CAD Product / Assembly Name
            </label>
            <input
              id="productName"
              type="text"
              className="form-input"
              placeholder="e.g. Marine Propulsion Shaft Assembly"
              value={productName}
              onChange={(e) => dispatch(setOrderMetadata({ productName: e.target.value }))}
            />
          </div>

          {/* Customer / Project */}
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="customer">
              Customer / Project
            </label>
            <input
              id="customer"
              type="text"
              className="form-input"
              placeholder="e.g. Pacific Maritime / US Coast Guard"
              value={customer}
              onChange={(e) => dispatch(setOrderMetadata({ customer: e.target.value }))}
            />
          </div>
        </div>

        <div className="order-bar-actions">
          <button
            onClick={() => dispatch(resetCalculator())}
            className="btn btn-secondary"
            title="Reset inputs"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="btn btn-amber"
          >
            <Save size={15} />
            <span>{isSaving ? "Saving..." : "Save Job to Plant"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Controls vs Visualizer & Cut List */}
      <div className="calc-grid">
        {/* Left Column: Form Controls */}
        <div className="inputs-column">
          {/* Section 1: CAD Product Dimensions (Width inputted FIRST, Length inputted SECOND) */}
          <div className="control-section glass-panel">
            <div className="section-title">
              <Box size={16} className="text-cyan" />
              <span>CAD Product Dimensions (Work Order)</span>
            </div>

            <div className="dimensions-grid">
              {/* WIDTH (FIRST) */}
              <div className="form-group">
                <label className="form-label">Width (Inches) *</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={cadDimensions.width || ""}
                    placeholder="38.0"
                    onChange={(e) => handleCadChange("width", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              {/* LENGTH (SECOND) */}
              <div className="form-group">
                <label className="form-label">Length (Inches) *</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={cadDimensions.length || ""}
                    placeholder="46.0"
                    onChange={(e) => handleCadChange("length", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              {/* HEIGHT */}
              <div className="form-group">
                <label className="form-label">Height (Inches) *</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={cadDimensions.height || ""}
                    placeholder="32.0"
                    onChange={(e) => handleCadChange("height", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              {/* WEIGHT */}
              <div className="form-group">
                <label className="form-label">Weight (Lbs) *</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="10"
                    className="form-input mono font-bold"
                    value={cadDimensions.weight || ""}
                    placeholder="850"
                    onChange={(e) => handleCadChange("weight", parseFloat(e.target.value))}
                  />
                  <span className="unit-label text-amber">lbs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pallet Style & Lumber Specifications */}
          <div className="control-section glass-panel">
            <div className="section-title">
              <Layers size={16} className="text-amber" />
              <span>Pallet Style & Lumber Selection</span>
            </div>

            <div className="form-group">
              <label className="form-label">Pallet Construction Style</label>
              <select
                className="form-select"
                value={palletConfig.palletStyle}
                onChange={(e) => handleConfigChange("palletStyle", e.target.value)}
              >
                <option value="2-Way Stringer (Flush)">2-Way Stringer (Flush)</option>
                <option value="2-Way Stringer (Overhang)">2-Way Stringer (Overhang)</option>
                <option value="4-Way Notched Stringer">4-Way Notched Stringer</option>
                <option value="Heavy-Duty Skid">Heavy-Duty Skid (Solid Runners)</option>
              </select>
            </div>

            <div className="config-grid">
              <div className="form-group">
                <label className="form-label">Top Deckboard Spec</label>
                <select
                  className="form-select"
                  value={palletConfig.deckboardNominal}
                  onChange={(e) => handleConfigChange("deckboardNominal", e.target.value)}
                >
                  <option value="1x4">Nominal 1x4 (0.75" × 3.5")</option>
                  <option value="1x6">Nominal 1x6 (0.75" × 5.5")</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stringer / Runner Spec</label>
                <select
                  className="form-select"
                  value={palletConfig.stringerNominal}
                  onChange={(e) => handleConfigChange("stringerNominal", e.target.value)}
                >
                  <option value="2x4">Nominal 2x4 (1.5" × 3.5")</option>
                  <option value="4x4">Nominal 4x4 (3.5" × 3.5" Heavy Timber)</option>
                </select>
              </div>
            </div>

            {/* Clearance Allowances (Default 2" Length & Width) */}
            <div className="config-grid mt-2">
              <div className="form-group">
                <div className="label-with-val">
                  <label className="form-label">Length Allowance</label>
                  <span className="hint-tag">Default 2"</span>
                </div>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={palletConfig.lengthAllowance}
                    onChange={(e) => handleConfigChange("lengthAllowance", parseFloat(e.target.value) || 0)}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-val">
                  <label className="form-label">Width Allowance</label>
                  <span className="hint-tag">Default 2"</span>
                </div>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={palletConfig.widthAllowance}
                    onChange={(e) => handleConfigChange("widthAllowance", parseFloat(e.target.value) || 0)}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>
            </div>

            {/* Middle Wood Pieces Toggle (1 vs 2 pieces) */}
            <div className="form-group mt-3">
              <div className="label-with-val">
                <label className="form-label">Middle Wood Pieces (Center Support)</label>
                <span className="val-preview mono text-amber">
                  {palletConfig.middleBoardCount === 2 ? "2 Pieces Doubled (6 Pieces Total)" : "1 Piece (3 Pieces Total)"}
                </span>
              </div>
              <p className="field-desc">
                Toggle between 1 piece (3 wood runners total) for light items like chairs, or 2 pieces right next to each other (6 wood runners total: 2 left, 2 middle, 2 right) for heavy items like lockers.
              </p>
              <div className="toggle-segmented">
                <button
                  type="button"
                  onClick={() => handleMiddlePiecesToggle(1)}
                  className={`segment-btn ${(palletConfig.middleBoardCount || 1) === 1 ? "active" : ""}`}
                >
                  <div className="segment-title">1 Piece (3 Total Pieces)</div>
                  <div className="segment-sub">Light Items (e.g. Chairs) — 1 Left, 1 Middle, 1 Right</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleMiddlePiecesToggle(2)}
                  className={`segment-btn ${(palletConfig.middleBoardCount || 1) === 2 ? "active" : ""}`}
                >
                  <div className="segment-title">2 Pieces Doubled (6 Total Pieces)</div>
                  <div className="segment-sub">Heavy Items (e.g. Lockers) — 2 Left, 2 Middle, 2 Right side-by-side</div>
                </button>
              </div>
            </div>

            {/* Gap Between Boards (Default 3", Range 3" - 5" OR Omit Gap) */}
            <div className="form-group mt-3">
              <div className="label-with-val">
                <label className="form-label">Gap Between Boards</label>
                <span className="val-preview mono">
                  {isGapOmitted ? "Omitted (0\")" : `${currentGap.toFixed(2)}"`}
                </span>
              </div>
              <div className="gap-control-row">
                <button
                  type="button"
                  onClick={handleToggleOmitGap}
                  className={`btn-omit-gap ${isGapOmitted ? "active" : ""}`}
                >
                  {isGapOmitted ? "✓ Gap Omitted (0\")" : "Omit Gap (0\")"}
                </button>

                {!isGapOmitted && (
                  <div className="gap-slider-group">
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.25"
                      className="slider-input"
                      value={currentGap}
                      onChange={(e) => handleGapChange(parseFloat(e.target.value))}
                    />
                    <div className="slider-hints">
                      <span>3.0" (Default)</span>
                      <span>4.0"</span>
                      <span>5.0" (Max)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Shipping Instructions */}
          <div className="control-section glass-panel">
            <div className="section-title">
              <FileText size={16} className="text-cyan" />
              <span>Sawyer Instructions & Packaging Notes</span>
            </div>
            <textarea
              className="form-input notes-textarea"
              rows={3}
              placeholder="e.g., Band with 2x 3/4-inch polyester strapping. Add foam corner protectors."
              value={notes}
              onChange={(e) => dispatch(setOrderMetadata({ notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Right Column: Visual Pallet Diagram + Sawyer Cut List Table */}
        <div className="outputs-column">
          <PalletDiagram
            palletLength={calculationResult.palletDimensions.length}
            palletWidth={calculationResult.palletDimensions.width}
            palletHeight={calculationResult.palletDimensions.height}
            productLength={cadDimensions.length}
            productWidth={cadDimensions.width}
            productHeight={cadDimensions.height}
            productWeight={cadDimensions.weight}
            calculationResult={calculationResult}
            palletStyle={palletConfig.palletStyle}
            deckboardNominal={palletConfig.deckboardNominal}
            stringerNominal={palletConfig.stringerNominal}
            middleBoardCount={palletConfig.middleBoardCount || 1}
          />

          <CutListTable
            jobId={activeJobId}
            workOrderId={activeJobId}
            productName={productName}
            customer={customer}
            calculationResult={calculationResult}
            palletDimensions={calculationResult.palletDimensions}
          />
        </div>
      </div>

      <style jsx>{`
        .calc-page-container {
          max-width: 1540px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .company-banner {
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border-left: 4px solid var(--accent-cyan);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.7));
        }
        .company-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .company-logo {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .company-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .company-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .company-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fef08a;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .order-bar {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .order-bar-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          flex-wrap: wrap;
          min-width: 320px;
        }
        .flex-1 { flex: 1; min-width: 130px; }
        .flex-2 { flex: 2; min-width: 170px; }
        .order-bar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: 440px 1fr;
          gap: 20px;
          align-items: start;
        }
        .inputs-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .outputs-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .control-section {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
        }
        .dimensions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .input-unit-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .unit-label {
          position: absolute;
          right: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          pointer-events: none;
        }
        .label-with-val {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hint-tag {
          font-size: 0.68rem;
          color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .val-preview {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-cyan);
        }
        .field-desc {
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-top: 2px;
          margin-bottom: 6px;
        }
        .toggle-segmented {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .segment-btn {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .segment-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(6, 182, 212, 0.3);
        }
        .segment-btn.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: var(--accent-amber);
        }
        .segment-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #ffffff;
        }
        .segment-btn.active .segment-title {
          color: #fef08a;
        }
        .segment-sub {
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.3;
        }
        .gap-control-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
        }
        .btn-omit-gap {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .btn-omit-gap.active {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(239, 68, 68, 0.5);
          color: #fca5a5;
        }
        .gap-slider-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .slider-input {
          width: 100%;
          accent-color: var(--accent-cyan);
          cursor: pointer;
        }
        .slider-hints {
          display: flex;
          justify-content: space-between;
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .notes-textarea {
          resize: vertical;
          min-height: 70px;
        }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
        .font-bold { font-weight: 700; }

        @media (max-width: 1120px) {
          .calc-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
