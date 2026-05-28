import React from "react";
import { useNavigate, Link } from "react-router-dom";
import RhythmicRipplesBackground from "./RhythmicRipplesBackground";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterApp = (tab) => {
    if (tab === "dashboard") navigate("/dashboard");
    else if (tab === "analyzer") navigate("/fraud-detection");
    else if (tab === "detection") navigate("/scam-analyzer");
    else navigate("/login");
  };

  return (
    <RhythmicRipplesBackground
      backgroundColor="#f5f7fb"
      rippleColor="rgba(0,181,216,0.08)"
      rippleCount={12}
      rippleSpeed={0.18}
    >
      <div className="relative min-h-screen w-full overflow-hidden">

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto h-full px-6 lg:px-10 flex items-center justify-between">

            <div className="flex items-center gap-12">
              <Link
                to="/"
                className="flex items-center gap-2 text-[#4353c3] font-bold text-xl tracking-tight"
              >
                <span className="material-symbols-outlined">
                  shield
                </span>

                <span>VYOM AI</span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link
                  to="/"
                  className="text-[#4353c3] font-semibold text-sm"
                >
                  Platform
                </Link>

                <Link
                  to="/solutions"
                  className="text-slate-600 hover:text-[#4353c3] transition-colors text-sm"
                >
                  Solutions
                </Link>

                <Link
                  to="/security"
                  className="text-slate-600 hover:text-[#4353c3] transition-colors text-sm"
                >
                  Security
                </Link>

                <Link
                  to="/pricing"
                  className="text-slate-600 hover:text-[#4353c3] transition-colors text-sm"
                >
                  Pricing
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign in
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
              >
                Get started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <main className="relative z-10 pt-36">

          <section className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[85vh]">

            {/* Left */}
            <div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 mb-8">
                <span className="material-symbols-outlined text-teal-700 text-[18px]">
                  verified_user
                </span>

                <span className="text-sm font-semibold text-teal-800">
                  Real-time protection before money moves
                </span>
              </div>

              <h1 className="text-[52px] md:text-[78px] font-black leading-[0.95] tracking-tight text-slate-900">
                Know the risk
                <br />
                before the
                <br />
                money moves
              </h1>

              <p className="mt-8 text-lg leading-relaxed text-slate-600 max-w-xl">
                Vyom reviews transactions and messages in real time,
                translating fraud signals into calm, human-readable explanations
                before financial damage occurs.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">

                <button
                  onClick={() => handleEnterApp("dashboard")}
                  className="px-8 py-4 bg-[#0d1b52] hover:bg-[#13256d] text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl"
                >
                  Start Monitoring

                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>

                <button
                  onClick={() => handleEnterApp("analyzer")}
                  className="px-8 py-4 bg-white border border-slate-300 text-[#0d1b52] rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_circle
                  </span>

                  Run Transaction Analyzer
                </button>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative">

              <div className="absolute -top-10 right-10 w-72 h-72 bg-[#4353c3]/10 blur-[120px] rounded-full" />

              <div className="relative bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-6 shadow-2xl">

                <div className="flex justify-between items-center border-b border-slate-200 pb-5 mb-6">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-[#4353c3]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#4353c3]">
                        security
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        Fraud Monitoring
                      </p>

                      <h3 className="font-bold text-slate-800">
                        Active Transaction Queue
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide">
                    Real-Time
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">

                  <div className="bg-[#f4f2fe] rounded-2xl p-5">
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Detection Rate
                    </p>

                    <h2 className="text-4xl font-black text-[#0d1b52] mt-2">
                      99.98%
                    </h2>
                  </div>

                  <div className="bg-[#f4f2fe] rounded-2xl p-5">
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      False Positives
                    </p>

                    <h2 className="text-4xl font-black text-[#006783] mt-2">
                      &lt;0.01%
                    </h2>
                  </div>
                </div>

                <div className="space-y-3 mb-6">

                  <div className="flex justify-between items-center rounded-xl bg-white border border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />

                      <span className="text-sm text-slate-700 font-medium">
                        Wire anomalies #8921
                      </span>
                    </div>

                    <span className="text-red-600 font-bold text-sm">
                      $128,400.00
                    </span>
                  </div>

                  <div className="flex justify-between items-center rounded-xl bg-white border border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4353c3]" />

                      <span className="text-sm text-slate-700 font-medium">
                        POS payments #2294
                      </span>
                    </div>

                    <span className="text-slate-500 font-bold text-sm">
                      $12.50
                    </span>
                  </div>
                </div>

                <div className="h-40 bg-[#eeecf8] rounded-2xl overflow-hidden relative">

                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-1 bg-white rounded-md text-[10px] font-bold text-slate-500">
                      VOL SURGE DETECTED
                    </span>
                  </div>

                  <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 500 100"
                  >
                    <path
                      d="M0,85 Q60,30 120,70 T240,40 T360,75 T480,25"
                      fill="none"
                      stroke="#0d1b52"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Partners */}
          <section className="mt-20 border-y border-slate-200 bg-white/50 py-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">

              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-slate-400 mb-10">
                Powering International Financial Infrastructure
              </p>

              <div className="flex flex-wrap justify-center gap-14 text-slate-500 font-bold uppercase text-sm">

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    account_balance
                  </span>
                  Global Bank
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    account_balance_wallet
                  </span>
                  Fintech+
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    token
                  </span>
                  BlockSec
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    assured_workload
                  </span>
                  Federal Fund
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    corporate_fare
                  </span>
                  Corp Trust
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-20 bg-[#f4f2fe] border-t border-slate-200 py-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">

              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  VYOM AI
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  © 2026 VYOM AI. All rights reserved.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-500">

                <Link to="/security" className="hover:text-slate-900">
                  Privacy Policy
                </Link>

                <Link to="/security" className="hover:text-slate-900">
                  Terms of Service
                </Link>

                <Link to="/security" className="hover:text-slate-900">
                  Compliance
                </Link>

                <button
                  onClick={() => handleEnterApp("dashboard")}
                  className="font-semibold text-[#4353c3]"
                >
                  Enterprise Admin
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </RhythmicRipplesBackground>
  );
}