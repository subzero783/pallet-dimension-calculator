"use client";

import React from "react";
import { ICalculationResult } from "@/models/WorkOrder";
import { useToast } from "@/context/ToastContext";
import { Copy, Download, Printer, Hammer, Weight, ShieldCheck, Ruler } from "lucide-react";

interface CutListTableProps {
  jobId?: string;
  workOrderId?: string;
  productName?: string;
  customer?: string;
  calculationResult: ICalculationResult;
  palletDimensions: { length: number; width: number; height: number };
}

export default function CutListTable({
  jobId,
  workOrderId,
  productName,
  customer,
  calculationResult,
  palletDimensions,
}: CutListTableProps) {
  const toast = useToast();
  const activeJobId = jobId || workOrderId || "JOB-PENDING";

  const {
    cutList,
    totalBoardFeet,
    estimatedTareWeight,
    maxSafeLoad,
    fastenersCount,
    actualSpacing,
  } = calculationResult;

  const handleCopyClipboard = () => {
    let text = `=== PALLET CUT SHEET: ${activeJobId} ===\n`;
    if (productName) text += `Product: ${productName} | Customer: ${customer || "N/A"}\n`;
    text += `Pallet Size: ${palletDimensions.length}"L x ${palletDimensions.width}"W x ${palletDimensions.height}"H\n`;
    text += `Board Spacing: ${actualSpacing}" Uniform Gap\n\n`;
    text += `ITEMIZED WOOD CUT LIST:\n`;
    cutList.forEach((item) => {
      text += `- ${item.name} | Qty: ${item.quantity} pcs | Cut Dimensions: ${item.actualDimension}\n`;
    });
    text += `\nTOTALS:\n`;
    text += `Total Board Feet: ${totalBoardFeet} BF\n`;
    text += `Estimated Tare Weight: ${estimatedTareWeight} lbs\n`;
    text += `Fasteners Required: ${fastenersCount} nails\n`;

    navigator.clipboard.writeText(text);
    toast.success("Cut list copied to clipboard!");
  };

  const handleExportCSV = () => {
    let csv = "Part / Board Name,Quantity (pcs),Cut Dimensions (Thickness x Width x Cut Length)\n";
    cutList.forEach((item) => {
      csv += `"${item.name}",${item.quantity},"${item.actualDimension}"\n`;
    });
    csv += `\n"Total Board Feet",,"${totalBoardFeet} BF"\n`;
    csv += `"Estimated Tare Weight",,"${estimatedTareWeight} lbs"\n`;
    csv += `"Fasteners Required",,"${fastenersCount} nails"\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cut_sheet_${activeJobId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded cut sheet CSV");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cut-sheet-card glass-panel">
      {/* Header & Tools */}
      <div className="cut-sheet-header">
        <div className="cut-sheet-title-group">
          <div className="cut-sheet-title">
            <Hammer size={18} className="text-amber" />
            <span>Itemized Wood Cut List</span>
          </div>
          <div className="cut-sheet-subtitle">
            Shipping Floor Build Sheet: {cutList.reduce((acc, i) => acc + i.quantity, 0)} total wood pieces to cut
          </div>
        </div>

        <div className="action-buttons no-print">
          <button onClick={handleCopyClipboard} className="btn btn-secondary btn-sm" title="Copy to clipboard">
            <Copy size={14} />
            <span>Copy</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="Export CSV">
            <Download size={14} />
            <span>CSV</span>
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print Cut Sheet">
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Simplified Table for Shipping Dept Employees */}
      <div className="table-responsive">
        <table className="cut-table">
          <thead>
            <tr>
              <th>Part / Board Name</th>
              <th className="text-center">Quantity (pcs)</th>
              <th>Cut Dimensions (Thickness × Width × Cut Length)</th>
            </tr>
          </thead>
          <tbody>
            {cutList.map((item, idx) => (
              <tr key={idx} className={item.name.includes("Middle") ? "middle-row" : ""}>
                <td>
                  <div className="item-name-cell">
                    <span className="item-name">{item.name}</span>
                    {item.name.includes("Top") && (
                      <span className="deck-tag">Uniform Top Deck</span>
                    )}
                    {item.name.includes("Middle") && (
                      <span className="middle-tag">
                        {item.quantity === 6
                          ? "6 Doubled Pieces (2 Left, 2 Mid, 2 Right)"
                          : "3 Support Pieces (1 Left, 1 Mid, 1 Right)"}
                      </span>
                    )}
                    {item.name.includes("Bottom") && (
                      <span className="base-tag">Uniform Base Deck</span>
                    )}
                  </div>
                </td>
                <td className="text-center mono font-bold qty-cell">
                  <span className="qty-badge">{item.quantity} pcs</span>
                </td>
                <td className="mono font-semibold cut-dim-cell">{item.actualDimension}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Engineering Summary Footer Cards */}
      <div className="metrics-grid">
        <div className="stat-card">
          <div className="stat-title">Total Board Feet</div>
          <div className="stat-value text-cyan">
            {totalBoardFeet.toFixed(2)}
            <span className="stat-unit">BF</span>
          </div>
        </div>

        <div className="stat-card amber">
          <div className="stat-title">Estimated Tare Weight</div>
          <div className="stat-value text-amber">
            {estimatedTareWeight}
            <span className="stat-unit">lbs</span>
          </div>
        </div>

        <div className="stat-card emerald">
          <div className="stat-title">Max Safe Distributed Load</div>
          <div className="stat-value text-emerald">
            {maxSafeLoad.toLocaleString()}
            <span className="stat-unit">lbs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Fasteners Required</div>
          <div className="stat-value">
            {fastenersCount}
            <span className="stat-unit">spiral nails</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cut-sheet-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cut-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cut-sheet-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }
        .cut-sheet-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .cut-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .cut-table th {
          text-align: left;
          padding: 10px 14px;
          background: rgba(15, 23, 42, 0.7);
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .cut-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #e2e8f0;
        }
        .cut-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .middle-row {
          background: rgba(6, 182, 212, 0.03);
        }
        .item-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .item-name {
          font-weight: 600;
          color: #ffffff;
        }
        .deck-tag {
          font-size: 0.65rem;
          background: rgba(245, 158, 11, 0.15);
          color: #fef08a;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .base-tag {
          font-size: 0.65rem;
          background: rgba(180, 83, 9, 0.2);
          color: #fdba74;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(180, 83, 9, 0.35);
        }
        .middle-tag {
          font-size: 0.65rem;
          background: rgba(6, 182, 212, 0.15);
          color: #67e8f9;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .qty-cell {
          vertical-align: middle;
        }
        .qty-badge {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.85rem;
        }
        .cut-dim-cell {
          color: #38bdf8;
          font-size: 0.92rem;
          letter-spacing: 0.02em;
        }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
        .text-emerald { color: var(--accent-emerald); }
        .metrics-grid {
          display: none;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
