import React from "react";
import LiveMetricCard from "./LiveMetricCard";

// Mock telemetry data
// Replace with real API data later if needed
const mockData = [
  {
    label: "AI Confidence",
    value: "96%",
    icon: "⚡",
    color: "cyan",
  },
  {
    label: "Transactions Reviewed",
    value: "14.2K",
    icon: "📊",
    color: "emerald",
  },
  {
    label: "Behavior Anomalies",
    value: "12",
    icon: "🧠",
    color: "blue",
  },
  {
    label: "Live Monitoring",
    value: "Active",
    icon: "🌐",
    color: "teal",
  },
];

const TelemetryPanel = ({ data = mockData }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {data.map((item, index) => (
        <LiveMetricCard
          key={index}
          label={item.label}
          value={item.value}
          icon={<span>{item.icon}</span>}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default React.memo(TelemetryPanel);