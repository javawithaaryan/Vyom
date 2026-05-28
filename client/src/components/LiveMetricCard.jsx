import React from "react";

const colorVariants = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  blue: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  teal: "border-teal-400/20 bg-teal-400/10 text-teal-300",
  indigo: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
};

const LiveMetricCard = ({
  label,
  value,
  icon,
  color = "cyan",
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 ${
        colorVariants[color] || colorVariants.cyan
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-white">
            {value}
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiveMetricCard);