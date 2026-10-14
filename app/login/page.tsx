"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store";
import { loginUser } from "@/store/slices/authSlice";
import { useToast } from "@/context/ToastContext";
import { Shield, KeyRound, User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = searchParams.get("from") || "/calculator";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      await dispatch(loginUser({ username, password })).unwrap();
      toast.success("Welcome back! Signed in successfully");
      router.push(from);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoUser: string) => {
    setUsername(demoUser);
    setPassword("pallet2026!");
  };

  return (
    <div className="login-card glass-panel">
      <div className="login-header">
        <div className="icon-badge">
          <KeyRound size={24} className="text-cyan" />
        </div>
        <h2>Plant Access Portal</h2>
        <p>Sign in to manage and record shipping crating work orders</p>
      </div>

      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label className="form-label" htmlFor="username">Username</label>
          <div className="input-with-icon">
            <User size={16} className="input-icon" />
            <input
              id="username"
              type="text"
              className="form-input with-icon"
              placeholder="e.g. clerk, supervisor, or admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon" />
            <input
              id="password"
              type="password"
              className="form-input with-icon"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          <span>{loading ? "Authenticating..." : "Sign In to Station"}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Demo Quick Logins */}
      <div className="demo-section">
        <div className="demo-title">
          <Shield size={14} className="text-amber" />
          <span>One-Click Station Presets</span>
        </div>
        <div className="demo-buttons">
          <button
            type="button"
            onClick={() => setDemoCredentials("clerk")}
            className="demo-btn"
          >
            <div className="demo-role">Shipping Clerk</div>
            <div className="demo-sub">clerk / pallet2026!</div>
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials("supervisor")}
            className="demo-btn"
          >
            <div className="demo-role">Plant Supervisor</div>
            <div className="demo-sub">supervisor / pallet2026!</div>
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials("admin")}
            className="demo-btn"
          >
            <div className="demo-role">Operations Admin</div>
            <div className="demo-sub">admin / pallet2026!</div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-card {
          width: 100%;
          max-width: 440px;
          margin: 60px auto;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .icon-badge {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .login-header h2 {
          font-size: 1.5rem;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .with-icon {
          padding-left: 38px;
        }
        .w-full {
          width: 100%;
        }
        .demo-section {
          border-top: 1px solid var(--border-subtle);
          padding-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .demo-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .demo-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .demo-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .demo-btn:hover {
          background: rgba(6, 182, 212, 0.1);
          border-color: rgba(6, 182, 212, 0.4);
        }
        .demo-role {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
        }
        .demo-sub {
          font-size: 0.62rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .text-cyan { color: var(--accent-cyan); }
        .text-amber { color: var(--accent-amber); }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
