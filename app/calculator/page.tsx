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
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  Building2,
  FileText,
} from "lucide-react";

export default function CalculatorPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    workOrderId,
    productName,
    customer,
    cadDimensions,
    palletConfig,
    calculationResult,
    notes,
  } = useAppSelector((state) => state.calculator);

  const { user } = useAppSelector((state) => state.auth);
  const [isSaving, setIsSaving] = useState(false);

  const handleCadChange = (field: keyof typeof cadDimensions, value: number) => {
    dispatch(setCadDimensions({ [field]: isNaN(value) ? 0 : value }));
  };

  const handleConfigChange = (field: keyof typeof palletConfig, value: any) => {
    dispatch(setPalletConfig({ [field]: value }));
  };

  const handleSaveOrder = async () => {
    if (!user) {
      toast.warning("Please sign in or use a demo login to save work orders to history");
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(
        saveWorkOrder({
          workOrderId,
          productName,
          customer,
          cadDimensions,
          palletConfig,
          calculationResult,
          notes,
          status: "READY_FOR_BUILD",
        })
      ).unwrap();
      toast.success(`Work order ${workOrderId} saved successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save work order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="calc-page-container">
      {/* Top Work Order Status Bar */}
      <div className="order-bar glass-panel">
        <div className="order-bar-meta">
          <div className="form-group flex-1">
            <label className="form-label">Work Order #</label>
            <input
              type="text"
              className="form-input mono font-bold"
              value={workOrderId}
              onChange={(e) => dispatch(setOrderMetadata({ workOrderId: e.target.value }))}
            />
          </div>

          <div className="form-group flex-2">
            <label className="form-label">CAD Product / Assembly Name</label>
            <input
              type="text"
              className="form-input"
              value={productName}
              onChange={(e) => dispatch(setOrderMetadata({ productName: e.target.value }))}
            />
          </div>

          <div className="form-group flex-2">
            <label className="form-label">Customer / Project</label>
            <input
              type="text"
              className="form-input"
              value={customer}
              onChange={(e) => dispatch(setOrderMetadata({ customer: e.target.value }))}
            />
          </div>
        </div>

        <div className="order-bar-actions">
          <button
            onClick={() => dispatch(resetCalculator())}
            className="btn btn-secondary"
            title="Reset to default"
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
            <span>{isSaving ? "Saving..." : "Save Work Order"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Visualizer & Cut List */}
      <div className="calc-grid">
        {/* Left Column: Form Controls */}
        <div className="inputs-column">
          {/* Section 1: CAD Dimensions */}
          <div className="control-section glass-panel">
            <div className="section-title">
              <Box size={16} className="text-cyan" />
              <span>CAD Product Dimensions (Work Order)</span>
            </div>

            <div className="dimensions-grid">
              <div className="form-group">
                <label className="form-label">Length (Inches)</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={cadDimensions.length}
                    onChange={(e) => handleCadChange("length", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Width (Inches)</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={cadDimensions.width}
                    onChange={(e) => handleCadChange("width", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Height (Inches)</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={cadDimensions.height}
                    onChange={(e) => handleCadChange("height", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Weight (Lbs)</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="10"
                    className="form-input mono font-bold"
                    value={cadDimensions.weight}
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

            {/* Clearance Allowances */}
            <div className="config-grid mt-2">
              <div className="form-group">
                <label className="form-label">Length Allowance</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={palletConfig.lengthAllowance}
                    onChange={(e) => handleConfigChange("lengthAllowance", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Width Allowance</label>
                <div className="input-unit-wrapper">
                  <input
                    type="number"
                    step="0.5"
                    className="form-input mono"
                    value={palletConfig.widthAllowance}
                    onChange={(e) => handleConfigChange("widthAllowance", parseFloat(e.target.value))}
                  />
                  <span className="unit-label">in</span>
                </div>
              </div>
            </div>

            {/* Target Max Gap */}
            <div className="form-group mt-2">
              <div className="label-with-val">
                <label className="form-label">Target Max Deckboard Gap</label>
                <span className="val-preview mono">{palletConfig.targetMaxGap}"</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="4.0"
                step="0.25"
                className="slider-input"
                value={palletConfig.targetMaxGap}
                onChange={(e) => handleConfigChange("targetMaxGap", parseFloat(e.target.value))}
              />
              <div className="slider-hints">
                <span>Dense 1.5"</span>
                <span>Standard 3.0"</span>
                <span>Open 4.0"</span>
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
          />

          <CutListTable
            workOrderId={workOrderId}
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
          gap: 16px;
          flex: 1;
          min-width: 320px;
        }
        .flex-1 { flex: 1; min-width: 140px; }
        .flex-2 { flex: 2; min-width: 180px; }
        .order-bar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
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
        .val-preview {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-cyan);
        }
        .slider-input {
          width: 100%;
          accent-color: var(--accent-cyan);
          cursor: pointer;
        }
        .slider-hints {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .notes-textarea {
          resize: vertical;
          min-height: 70px;
        }
        .mt-2 { margin-top: 8px; }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
        .font-bold { font-weight: 700; }

        @media (max-width: 1080px) {
          .calc-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
