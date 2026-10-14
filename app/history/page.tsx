"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchWorkOrders,
  deleteWorkOrder,
  updateWorkOrderStatus,
  setSearchQuery,
  setStatusFilter,
} from "@/store/slices/workOrderSlice";
import { loadExistingWorkOrder } from "@/store/slices/calculatorSlice";
import { useToast } from "@/context/ToastContext";
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  PlusCircle,
  FileText,
  Hammer,
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { items, isLoading, searchQuery, statusFilter } = useAppSelector(
    (state) => state.workOrders
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchWorkOrders({ query: searchQuery, status: statusFilter }));
  }, [dispatch, searchQuery, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleStatusFilterChange = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const handleLoadOrder = (order: any) => {
    dispatch(loadExistingWorkOrder(order));
    toast.success(`Loaded work order ${order.workOrderId} into calculator`);
    router.push("/calculator");
  };

  const handleDelete = async (id: string, woId: string) => {
    if (confirm(`Are you sure you want to delete work order ${woId}?`)) {
      try {
        await dispatch(deleteWorkOrder(id)).unwrap();
        toast.info(`Deleted work order ${woId}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete work order");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await dispatch(updateWorkOrderStatus({ id, status: newStatus })).unwrap();
      toast.success("Work order status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="history-page-container">
      {/* Page Header */}
      <div className="history-header">
        <div>
          <h1 className="page-title">
            <History size={24} className="text-cyan" />
            <span>Shipping Work Order History</span>
          </h1>
          <p className="page-subtitle">
            Search, review, and load historical manufacturing cut sheets and pallet builds
          </p>
        </div>

        <Link href="/calculator" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>New Pallet Calculation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-bar glass-panel">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by Work Order #, Customer, or Product Name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="status-filters">
          {["ALL", "READY_FOR_BUILD", "BUILT", "SHIPPED", "DRAFT"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`filter-pill ${statusFilter === status ? "active" : ""}`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="orders-table-card glass-panel">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading work orders...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <h3>No Work Orders Found</h3>
            <p>
              {searchQuery
                ? `No orders matching "${searchQuery}"`
                : "No saved pallet work orders yet in this plant database."}
            </p>
            <Link href="/calculator" className="btn btn-amber mt-4">
              <Hammer size={16} />
              <span>Create First Pallet Build</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="work-order-table">
              <thead>
                <tr>
                  <th>Work Order #</th>
                  <th>Product & Customer</th>
                  <th>CAD Dimensions</th>
                  <th>Pallet Size (L × W × H)</th>
                  <th>Board Feet</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((order: any) => (
                  <tr key={order._id || order.workOrderId}>
                    <td className="mono font-bold text-amber">
                      {order.workOrderId}
                    </td>
                    <td>
                      <div className="product-cell">
                        <div className="prod-name">{order.productName}</div>
                        <div className="cust-name">{order.customer}</div>
                      </div>
                    </td>
                    <td className="mono">
                      {order.cadDimensions.length}" × {order.cadDimensions.width}" × {order.cadDimensions.height}"
                      <div className="weight-tag">{order.cadDimensions.weight} lbs</div>
                    </td>
                    <td className="mono font-bold text-cyan">
                      {order.calculationResult?.palletDimensions
                        ? `${order.calculationResult.palletDimensions.length}" × ${order.calculationResult.palletDimensions.width}" × ${order.calculationResult.palletDimensions.height}"`
                        : "—"}
                    </td>
                    <td className="mono">
                      {order.calculationResult?.totalBoardFeet
                        ? `${order.calculationResult.totalBoardFeet.toFixed(1)} BF`
                        : "—"}
                    </td>
                    <td>
                      <select
                        className={`status-select status-${order.status.toLowerCase()}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id || order.workOrderId, e.target.value)}
                      >
                        <option value="READY_FOR_BUILD">READY FOR BUILD</option>
                        <option value="BUILT">BUILT</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </td>
                    <td className="created-cell">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <div className="by-tag">{order.createdBy}</div>
                    </td>
                    <td className="text-right">
                      <div className="row-actions">
                        <button
                          onClick={() => handleLoadOrder(order)}
                          className="btn-action load"
                          title="Load into Calculator"
                        >
                          <ArrowUpRight size={16} />
                          <span>Load</span>
                        </button>

                        <button
                          onClick={() => handleDelete(order._id || order.workOrderId, order.workOrderId)}
                          className="btn-action delete"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .history-page-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .page-title {
          font-size: 1.75rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 4px;
        }
        .search-filter-bar {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 300px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
        }
        .search-input {
          padding-left: 40px;
        }
        .status-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .filter-pill.active {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.4);
          color: var(--accent-cyan);
        }
        .orders-table-card {
          padding: 8px;
          min-height: 380px;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .work-order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .work-order-table th {
          text-align: left;
          padding: 12px 16px;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .work-order-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #e2e8f0;
        }
        .work-order-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .product-cell {
          display: flex;
          flex-direction: column;
        }
        .prod-name {
          font-weight: 600;
          color: #ffffff;
        }
        .cust-name {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .weight-tag {
          font-size: 0.72rem;
          color: var(--accent-amber);
        }
        .status-select {
          background: #0b1120;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
        }
        .status-select.status-ready_for_build {
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.4);
        }
        .status-select.status-built {
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.4);
        }
        .status-select.status-shipped {
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.4);
        }
        .status-select.status-draft {
          color: #94a3b8;
        }
        .created-cell {
          font-size: 0.8rem;
          color: #cbd5e1;
        }
        .by-tag {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }
        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-action.load {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.3);
          color: var(--accent-cyan);
        }
        .btn-action.load:hover {
          background: rgba(6, 182, 212, 0.2);
          color: #fff;
        }
        .btn-action.delete {
          background: transparent;
          color: var(--text-muted);
        }
        .btn-action.delete:hover {
          color: var(--accent-rose);
          background: rgba(244, 63, 94, 0.1);
        }
        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 12px;
          text-align: center;
        }
        .empty-icon {
          color: var(--text-subtle);
          margin-bottom: 6px;
        }
        .empty-state h3 {
          font-size: 1.25rem;
        }
        .empty-state p {
          color: var(--text-muted);
          font-size: 0.88rem;
          max-width: 400px;
        }
        .mt-4 { margin-top: 16px; }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
      `}</style>
    </div>
  );
}
