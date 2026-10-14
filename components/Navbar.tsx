"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { useToast } from "@/context/ToastContext";
import { Box, Layers, History, LogOut, User as UserIcon, Shield, Sparkles } from "lucide-react";
import { loadPreset } from "@/store/slices/calculatorSlice";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.info("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    if (presetKey === "standard") {
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
      toast.success("Loaded Standard 48x40 Freight Preset");
    } else if (presetKey === "aerospace") {
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
      toast.success("Loaded Aerospace Heavy Spindle Preset");
    } else if (presetKey === "skid") {
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
      toast.success("Loaded Heavy-Duty Skid Preset (4x4s)");
    }

    if (pathname !== "/calculator") {
      router.push("/calculator");
    }
  };

  return (
    <header className="navbar-container no-print">
      <div className="navbar-inner">
        {/* Brand */}
        <Link href="/" className="brand-link">
          <div className="brand-logo-icon">
            <Box size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              PALLET<span className="brand-highlight">CALC</span>
              <span className="brand-pro-tag">PRO</span>
            </div>
            <div className="brand-sub">Manufacturing Shipping & Cut Lists</div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="nav-links">
          <Link
            href="/calculator"
            className={`nav-item ${pathname === "/calculator" ? "active" : ""}`}
          >
            <Layers size={17} />
            <span>Calculator</span>
          </Link>

          <Link
            href="/history"
            className={`nav-item ${pathname === "/history" ? "active" : ""}`}
          >
            <History size={17} />
            <span>Work Orders</span>
          </Link>

          {/* Quick Presets Menu */}
          <div className="nav-dropdown">
            <button className="preset-pill-btn">
              <Sparkles size={14} className="text-amber" />
              <span>CAD Presets</span>
            </button>
            <div className="dropdown-menu">
              <button onClick={() => handlePresetSelect("standard")} className="dropdown-item">
                <div className="item-title">Standard Freight (48" x 40")</div>
                <div className="item-desc">950 lbs • 1x4 Deck • 2x4 Stringer</div>
              </button>
              <button onClick={() => handlePresetSelect("aerospace")} className="dropdown-item">
                <div className="item-title">Aerospace Spindle (60" x 46")</div>
                <div className="item-desc">1,850 lbs • 1x6 Deck • 4 Stringers</div>
              </button>
              <button onClick={() => handlePresetSelect("skid")} className="dropdown-item">
                <div className="item-title">Heavy Equipment Skid (84" x 54")</div>
                <div className="item-desc">3,400 lbs • 4x4 Heavy Timber Skid</div>
              </button>
            </div>
          </div>
        </nav>

        {/* User Session / Auth */}
        <div className="nav-auth-section">
          {user ? (
            <div className="user-profile-badge">
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role-tag">
                  <Shield size={11} />
                  <span>{user.role.replace("_", " ")}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="logout-btn"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-secondary btn-sm">
              <UserIcon size={15} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar-container {
          background: rgba(11, 16, 27, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
        }
        .navbar-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .brand-logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(245, 158, 11, 0.2));
          border: 1px solid rgba(6, 182, 212, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-cyan);
        }
        .brand-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.02em;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .brand-highlight {
          color: var(--accent-cyan);
        }
        .brand-pro-tag {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 5px;
          background: var(--accent-amber);
          color: #000;
          border-radius: 4px;
          margin-left: 2px;
        }
        .brand-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s;
        }
        .nav-item:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-item.active {
          color: #ffffff;
          background: rgba(6, 182, 212, 0.12);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .nav-dropdown {
          position: relative;
        }
        .preset-pill-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fef08a;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-pill-btn:hover {
          background: rgba(245, 158, 11, 0.2);
        }
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          width: 270px;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          padding: 6px;
          z-index: 100;
        }
        .nav-dropdown:hover .dropdown-menu {
          display: block;
        }
        .dropdown-item {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          padding: 8px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.07);
        }
        .item-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #ffffff;
        }
        .item-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #ffffff;
        }
        .user-role-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: var(--accent-amber);
          text-transform: capitalize;
        }
        .logout-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .logout-btn:hover {
          color: var(--accent-rose);
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }
        @media (max-width: 768px) {
          .brand-sub, .nav-item span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
