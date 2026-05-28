import React from "react";
import { securityData } from "../data/securityData";

const Security = () => {
  return (
    <section className="min-h-screen bg-[#0a0b1e] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-bold">
          Security Infrastructure
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-white/60">
          Built with secure infrastructure, intelligent
          monitoring, and production-ready protection systems.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {securityData.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-8"
            >
              <h3 className="text-2xl font-semibold">
                {item.title}
              </h3>

              <p className="mt-4 text-white/60">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;