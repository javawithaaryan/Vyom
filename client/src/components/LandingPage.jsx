import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterApp = (tab) => {
    if (tab === "dashboard") navigate("/dashboard");
    else if (tab === "analyzer") navigate("/fraud-detection");
    else if (tab === "detection") navigate("/scam-analyzer");
    else navigate("/login");
  };

  return (
    <div className="font-sans text-[#1a1b23] bg-gradient-to-b from-[#F5F3FF] to-[#FAFAFF] min-h-screen selection:bg-[#4353c3]/20 relative overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 h-20 bg-white/72 backdrop-blur-xl border-b border-[#c6c5d5]/30 shadow-xs">
        <div className="flex items-center gap-12">
          <span className="text-xl font-bold text-[#4353c3] tracking-tight flex items-center gap-2 select-none">
            <span className="material-symbols-outlined text-2xl font-bold text-[#4353c3]">
              shield
            </span>
            VYOM AI
          </span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#platform" className="text-[#4353c3] font-semibold border-b-2 border-[#4353c3] pb-1 text-sm">
              Platform
            </a>
            <a href="#solutions" className="text-[#454653] hover:text-[#4353c3] transition-colors text-sm">
              Solutions
            </a>
            <a href="#security" className="text-[#454653] hover:text-[#4353c3] transition-colors text-sm">
              Security
            </a>
            <a href="#pricing" className="text-[#454653] hover:text-[#4353c3] transition-colors text-sm">
              Pricing
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-[#454653] hover:text-teal-800 transition-colors text-sm px-4 py-2 font-medium min-h-[44px]"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-800 transition-all shadow-md min-h-[44px]"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-36 pb-20">
        <section className="max-w-[1440px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 rounded-full border border-teal-100">
              <span className="material-symbols-outlined text-[16px] text-teal-700 font-bold select-none">
                verified_user
              </span>
              <span className="text-xs font-bold text-teal-800 tracking-wide">
                Real-time protection before money moves
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1a1b23] tracking-tight leading-[1.15]">
              Fraud intelligence that feels <span className="text-teal-700">human and clear</span>
            </h1>
            <p className="text-lg text-[#454653] leading-relaxed max-w-xl">
              Vyom reviews transactions and messages as they happen—explaining risk in plain language,
              not alarmist jargon, so you can act calmly before financial damage occurs.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleEnterApp("dashboard")}
                className="px-8 py-4 bg-[#4353c3] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#4353c3]/90 transition-all shadow-xl shadow-[#4353c3]/20 hover:scale-[1.03]"
              >
                Start Monitoring
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                onClick={() => handleEnterApp("analyzer")}
                className="px-8 py-4 bg-white border border-[#c6c5d5]/40 text-[#4353c3] rounded-xl font-bold flex items-center gap-2 hover:bg-white/70 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_circle
                </span>
                Run Transaction Analyzer
              </button>
            </div>
          </div>

          {/* Hero Right Preview Card */}
          <div className="lg:col-span-6 relative flex justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-80 h-80 bg-[#4353c3]/8 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Glass Dashboard Simulated Card */}
            <div className="glass-card rounded-3xl p-6 w-full max-w-[540px] shadow-2xl relative z-10 overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4353c3]/10 flex items-center justify-center text-[#4353c3]">
                    <span className="material-symbols-outlined text-[#4353c3]">security</span>
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Fraud Monitoring
                    </h3>
                    <p className="text-[#1a1b23] font-bold text-sm">
                      Active Transaction Queue
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#8FD6B5]/20 text-[#006a44] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  Real-Time
                </span>
              </div>

              {/* Stat figures */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[#f4f2fe] rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-[#454653] tracking-widest select-none">
                    DETECTION RATE
                  </p>
                  <p className="text-2xl font-extrabold text-[#4353c3]">99.98%</p>
                </div>
                <div className="p-4 bg-[#f4f2fe] rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-[#454653] tracking-widest select-none">
                    FALSE POSITIVES
                  </p>
                  <p className="text-2xl font-extrabold text-[#006783]">&lt;0.01%</p>
                </div>
              </div>

              {/* Feed lists */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs text-[#1a1b23] font-medium font-mono">
                      Wire anomalies #8921
                    </span>
                  </div>
                  <span className="text-xs font-bold text-red-600 font-mono">$128,400.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4353c3]"></div>
                    <span className="text-xs text-[#1a1b23] font-medium font-mono">
                      POS payments #2294
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 font-mono">$12.50</span>
                </div>
              </div>

              {/* Fake curve graphic */}
              <div className="h-28 bg-[#eeecf8] rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-end">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                    <defs>
                      <linearGradient id="heroGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4353c3" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4353c3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,85 Q60,30 120,70 T240,40 T360,75 T480,25 L500,25 L500,100 L0,100 Z"
                      fill="url(#heroGradient)"
                    />
                    <path
                      d="M0,85 Q60,30 120,70 T240,40 T360,75 T480,25"
                      fill="none"
                      stroke="#4353c3"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-0.5 bg-white/80 rounded text-[9px] font-bold text-gray-500 font-mono">
                    VOL SURGE DETECTED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand partners list */}
        <section className="mt-28 py-8 border-t border-b border-gray-100 bg-white/40">
          <div className="max-w-[1440px] mx-auto px-10 text-center">
            <p className="text-[10px] font-bold text-[#454653] uppercase tracking-widest mb-8">
              Powering International Financial Infrastructure
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-gray-600 font-bold">account_balance</span>
                <span className="font-extrabold text-sm text-gray-600 uppercase tracking-wider">
                  Global Bank
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-gray-600 font-bold">
                  account_balance_wallet
                </span>
                <span className="font-extrabold text-sm text-gray-600 uppercase tracking-wider">
                  Fintech+
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-gray-600 font-bold">token</span>
                <span className="font-extrabold text-sm text-gray-600 uppercase tracking-wider">
                  BlockSec
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-gray-600 font-bold">assured_workload</span>
                <span className="font-extrabold text-sm text-gray-600 uppercase tracking-wider">
                  Federal Fund
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-gray-600 font-bold">corporate_fare</span>
                <span className="font-extrabold text-sm text-gray-600 uppercase tracking-wider">
                  Corp Trust
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento highlights key features */}
        <section className="mt-28 max-w-[1440px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl col-span-1 md:col-span-2 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4 text-gray-100 text-9xl select-none group-hover:text-gray-200 pointer-events-none transition-colors">
                <span className="material-symbols-outlined text-[150px] font-light">shield_person</span>
              </div>
              <div className="relative z-10 space-y-3">
                <h3 className="text-xl font-bold text-[#1a1b23]">
                  Neural Pattern Matching
                </h3>
                <p className="text-sm text-[#454653] max-w-md leading-relaxed">
                  Our advanced deep learning models check behavioral patterns, velocity limits, and geographical proxies.
                  We evaluate complex threat profiles in real-time under 20 milliseconds.
                </p>
                <button
                  onClick={() => handleEnterApp("detection")}
                  className="mt-4 text-[#4353c3] font-bold flex items-center gap-1 hover:text-[#4353c3]/80 group"
                >
                  Verify system live detection
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-[#4353c3] p-8 rounded-3xl text-white flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div>
                <span className="material-symbols-outlined text-4xl mb-6">auto_graph</span>
                <h3 className="text-xl font-bold mb-2">Scale Without Latency</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Safely process high-velocity online assets and verify identity triggers without adding latency to customer checkouts.
                </p>
              </div>
              <button
                onClick={() => handleEnterApp("dashboard")}
                className="mt-6 bg-white text-[#4353c3] font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-white/90 transition-all shadow-md"
              >
                Access Surveillance Console
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 px-10 bg-[#f4f2fe] border-t border-[#c6c5d5]/30 mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-extrabold text-lg text-[#1a1b23] tracking-tight">VYOM AI</span>
            <p className="text-xs text-gray-500 mt-1">
              © 2026 VYOM AI. All rights reserved. Registered Federal Security Suite.
            </p>
          </div>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <a href="#privacy" className="hover:text-[#4353c3] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#4353c3] transition-colors">Terms of Service</a>
            <a href="#compliance" className="hover:text-[#4353c3] transition-colors">Compliance Auditing</a>
            <button
              onClick={() => handleEnterApp("dashboard")}
              className="text-[#4353c3] font-semibold hover:underline"
            >
              Enterprise Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
