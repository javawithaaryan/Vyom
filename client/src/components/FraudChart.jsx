import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function FraudChart() {
  const data = [
    { day: "Mon", fraud: 12 },
    { day: "Tue", fraud: 18 },
    { day: "Wed", fraud: 9 },
    { day: "Thu", fraud: 24 },
    { day: "Fri", fraud: 15 },
  ];

  return (
    <div className="chart-container">
      <h2>Fraud Activity Overview</h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="fraud"
            stroke="#ff4d4f"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FraudChart;