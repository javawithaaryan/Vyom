import React from "react";
import { pricingPlans } from "../data/pricingData";

const Pricing = () => {
  return (
    <section className="min-h-screen bg-[#0a0b1e] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-bold">
          Simple Pricing
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-white/60">
          Flexible plans for individuals, teams,
          and enterprise fraud monitoring.
        </p>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-8"
            >
              <h3 className="text-3xl font-bold">
                {plan.name}
              </h3>

              <div className="mt-4 text-4xl font-bold text-cyan-300">
                {plan.price}
              </div>

              <p className="mt-4 text-white/60">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3 text-white/70">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    • {feature}
                  </li>
                ))}
              </ul>

              <button className="mt-10 w-full rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-cyan-400">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;