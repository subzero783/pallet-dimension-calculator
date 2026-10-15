"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchWorkOrders } from "@/store/slices/workOrderSlice";
import { useToast } from "@/context/ToastContext";
import {
  Shield,
  Search,
  RefreshCw,
  Box,
  Layers,
  User,
  Ruler,
  Weight,
  FileText,
  ChevronDown,
  ChevronUp,
  Hammer,
  Clock,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function SupervisorDashboardPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { items: workOrders, isLoading } = useAppSelector((state) => state.workOrders);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWorkOrders());
  }, [dispatch]);

  const handleRefresh = async () => {
    try {
      await dispatch(fetchWorkOrders()).unwrap();
      toast.info("Refreshed jobs from plant register");
    } catch {
      toast.error("Failed to refresh jobs");
    }
  };

  const filteredOrders = workOrders.filter((order: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const jId = (order.jobId || order.workOrderId || "").toLowerCase();
    const empId = (order.employeeId || "").toLowerCase();
    const empName = (order.employeeFirstName || "").toLowerCase();
    const pName = (order.productName || "").toLowerCase();
    const cust = (order.customer || "").toLowerCase();
    return (
      jId.includes(q) ||
      empId.includes(q) ||
      empName.includes(q) ||
      pName.includes(q) ||
      cust.includes(q)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <div className="supervisor-container">
      {/* Dashboard Header */}
      <div className="dashboard-header glass-panel">
        <div className="header-info">
          <div className="supervisor-badge">
            <Shield size={22} className="text-amber" />
          </div>
          <div>
            <div className="header-tag">Pacific Maritime Industries Corp.</div>
            <h1 className="header-title">Plant Supervisor Dashboard</h1>
            <p className="header-desc">
              Audit log of employee crating calculations, wood cut specifications, and submitted pallet jobs.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-pill">
            <span className="dot online"></span>
            <span className="user-title">Supervisor:</span>
            <span className="user-name">{user?.name || "Oliver"}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            title="Refresh submissions"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card glass-panel">
          <div className="metric-label">Total Submitted Jobs</div>
          <div className="metric-value text-cyan">{workOrders.length}</div>
          <div className="metric-sub">Recorded in plant register</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-label">Active Shipping Station</div>
          <div className="metric-value text-amber">Station A</div>
          <div className="metric-sub">Pacific Maritime Crate Shop</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-label">Lead Lumber Spec</div>
          <div className="metric-value text-emerald">Nominal 1x6</div>
          <div className="metric-sub">0.75" × 5.5" impact lead boards</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-label">Middle Pieces Support</div>
          <div className="metric-value text-cyan">1 or 2 pcs</div>
          <div className="metric-sub">Dynamic weight-bearing runners</div>
        </div>
      </div>

      {/* Main Jobs Table / Card List */}
      <div className="table-card glass-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Job ID, Employee ID, First Name, or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="count-label">
            Showing <span className="text-cyan font-bold">{filteredOrders.length}</span> of {workOrders.length} jobs
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Box size={40} className="text-muted" />
            <h3>No Submitted Jobs Found</h3>
            <p>
              {searchQuery
                ? "No jobs matched your search criteria."
                : "No jobs have been submitted yet from the Pacific Maritime calculator."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Employee Info</th>
                  <th>Inputted Dimensions & Settings</th>
                  <th>Pallet Output & Cut List</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => {
                  const id = order._id || order.jobId || order.workOrderId;
                  const isExpanded = expandedJobId === id;
                  const activeJobId = order.jobId || order.workOrderId || "JOB-N/A";
                  const empId = order.employeeId || "—";
                  const empFirstName = order.employeeFirstName || "—";
                  const cad = order.cadDimensions || {};
                  const cfg = order.palletConfig || {};
                  const res = order.calculationResult || {};
                  const dims = res.palletDimensions || {};
                  const cutList = res.cutList || [];

                  const middleCount = cfg.middleBoardCount || res.middleBoardCount || 1;
                  const boardGapVal = cfg.boardGap ?? cfg.targetMaxGap ?? res.boardGap ?? 3.0;

                  return (
                    <React.Fragment key={id}>
                      <tr className={`job-row ${isExpanded ? "expanded" : ""}`}>
                        {/* 1. Job ID */}
                        <td className="job-id-cell">
                          <div className="job-id-badge mono">{activeJobId}</div>
                          <div className="timestamp-sub">
                            <Clock size={11} />
                            <span>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString() + " " + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : "Recent"}
                            </span>
                          </div>
                        </td>

                        {/* 2. Employee ID & First Name */}
                        <td>
                          <div className="employee-info-cell">
                            <div className="employee-name">
                              <User size={14} className="text-cyan" />
                              <span>{empFirstName}</span>
                            </div>
                            <div className="employee-id-tag mono">
                              ID: {empId}
                            </div>
                          </div>
                        </td>

                        {/* 3. Inputted Dimensions & Settings */}
                        <td>
                          <div className="input-settings-summary">
                            <div className="dim-line">
                              <span className="dim-label">CAD Size:</span>
                              <span className="mono font-semibold">
                                {cad.width || "—"}" W × {cad.length || "—"}" L × {cad.height || "—"}" H
                              </span>
                              <span className="weight-tag">{cad.weight || 0} lbs</span>
                            </div>
                            <div className="settings-tags">
                              <span className="setting-pill">
                                Allowances: +{cfg.lengthAllowance ?? 4}" L / +{cfg.widthAllowance ?? 4}" W
                              </span>
                              <span className="setting-pill">
                                Board Gap: {boardGapVal === 0 ? "Omitted (0\")" : `${boardGapVal}"`}
                              </span>
                              <span className="setting-pill amber">
                                Middle Wood: {middleCount === 2 ? "2 pcs doubled (6 total pieces)" : "1 pc (3 total pieces)"}
                              </span>
                            </div>
                            {order.notes && (
                              <div className="notes-preview" title={order.notes}>
                                <FileText size={11} className="text-muted" />
                                <span>{order.notes}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 4. Calculator Output (Dimensions, Height, Weight, Cut List summary) */}
                        <td>
                          <div className="output-summary">
                            <div className="output-dims">
                              <span className="output-size text-cyan font-bold mono">
                                {dims.length || "—"}" L × {dims.width || "—"}" W
                              </span>
                              <span className="output-height mono">
                                H: {dims.height || "5.0"}"
                              </span>
                              <span className="output-weight text-amber mono">
                                Tare: {res.estimatedTareWeight || 0} lbs
                              </span>
                            </div>
                            <div className="cut-summary-line">
                              <span>Cut List: {cutList.length} items ({cutList.reduce((acc: number, i: any) => acc + (i.quantity || 0), 0)} pcs total)</span>
                            </div>
                          </div>
                        </td>

                        {/* Expand Cut List Action */}
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => toggleExpand(id)}
                            className="btn btn-secondary btn-sm"
                          >
                            <span>{isExpanded ? "Hide Cut List" : "View Cut List"}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Cut List Details Drawer */}
                      {isExpanded && (
                        <tr className="expanded-row">
                          <td colSpan={5}>
                            <div className="expanded-drawer">
                              <div className="drawer-header">
                                <div className="drawer-title">
                                  <Hammer size={16} className="text-amber" />
                                  <span>Itemized Wood Cut List Specification for {activeJobId}</span>
                                </div>
                                <div className="drawer-sub">
                                  Lumber cuts required for shipping department sawyer
                                </div>
                              </div>

                              <div className="drawer-table-wrapper">
                                <table className="drawer-table">
                                  <thead>
                                    <tr>
                                      <th>Part / Board Name</th>
                                      <th className="text-center">Quantity (pcs)</th>
                                      <th>Cut Dimensions (Thickness × Width × Cut Length)</th>
                                      <th className="text-right">Board Feet (BF)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {cutList.map((item: any, cIdx: number) => (
                                      <tr key={cIdx}>
                                        <td className="font-semibold text-white">{item.name}</td>
                                        <td className="text-center mono font-bold text-amber">
                                          {item.quantity} pcs
                                        </td>
                                        <td className="mono text-cyan font-semibold">
                                          {item.actualDimension}
                                        </td>
                                        <td className="text-right mono">
                                          {item.boardFeet ? Number(item.boardFeet).toFixed(2) : "—"} BF
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="drawer-footer">
                                <div>
                                  <strong>Notes / Special Sawyer Packaging Instructions:</strong>{" "}
                                  <span>{order.notes || "Standard shipping preparation."}</span>
                                </div>
                                <div>
                                  <strong>Fasteners:</strong> {res.fastenersCount || 0} nails •{" "}
                                  <strong>Safe Load:</strong> {res.maxSafeLoad?.toLocaleString() || "—"} lbs
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .supervisor-container {
          max-width: 1540px;
          margin: 0 auto;
          padding: 30px 24px 60px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dashboard-header {
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          border-left: 4px solid var(--accent-amber);
        }
        .header-info {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .supervisor-badge {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-tag {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--accent-cyan);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .header-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
          margin: 2px 0 4px;
        }
        .header-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 600px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          font-size: 0.82rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot.online {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .user-title {
          color: var(--text-muted);
        }
        .user-name {
          font-weight: 700;
          color: #ffffff;
        }
        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }
        .metric-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .metric-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .metric-value {
          font-size: 1.8rem;
          font-weight: 800;
          font-family: var(--font-mono);
          line-height: 1.1;
        }
        .metric-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .table-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 340px;
          flex: 1;
          max-width: 600px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: #ffffff;
          font-size: 0.85rem;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--accent-cyan);
        }
        .count-label {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .jobs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .jobs-table th {
          text-align: left;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.7);
          color: var(--text-muted);
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .jobs-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }
        .job-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .job-row.expanded {
          background: rgba(6, 182, 212, 0.03);
        }
        .job-id-cell {
          min-width: 130px;
        }
        .job-id-badge {
          font-weight: 800;
          font-size: 0.95rem;
          color: #ffffff;
        }
        .timestamp-sub {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 3px;
        }
        .employee-info-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 120px;
        }
        .employee-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: #ffffff;
        }
        .employee-id-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .input-settings-summary {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 280px;
        }
        .dim-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }
        .dim-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .weight-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-amber);
          background: rgba(245, 158, 11, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .settings-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .setting-pill {
          font-size: 0.68rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 2px 6px;
          color: #cbd5e1;
        }
        .setting-pill.amber {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: #fef08a;
          font-weight: 700;
        }
        .notes-preview {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: var(--text-muted);
          max-width: 320px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .output-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 220px;
        }
        .output-dims {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .output-size {
          font-size: 0.95rem;
        }
        .output-height {
          font-size: 0.78rem;
          color: #94a3b8;
        }
        .output-weight {
          font-size: 0.78rem;
          font-weight: 600;
        }
        .cut-summary-line {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .expanded-row {
          background: rgba(15, 23, 42, 0.9);
        }
        .expanded-drawer {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-left: 3px solid var(--accent-cyan);
          background: rgba(6, 182, 212, 0.02);
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        .drawer-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #ffffff;
          font-size: 0.92rem;
        }
        .drawer-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .drawer-table-wrapper {
          overflow-x: auto;
        }
        .drawer-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }
        .drawer-table th {
          text-align: left;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          font-size: 0.7rem;
        }
        .drawer-table td {
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .drawer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          font-size: 0.78rem;
          color: #cbd5e1;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }
        .empty-state h3 {
          font-size: 1.15rem;
          color: #ffffff;
        }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
        .text-emerald { color: var(--accent-emerald); }
        .text-white { color: #ffffff; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .mono { font-family: var(--font-mono); }
      `}</style>
    </div>
  );
}
