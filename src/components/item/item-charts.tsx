import { Card, Empty, Tabs } from "antd";
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ItemStatsData } from "./types";

export interface ItemChartsProps {
  data: ItemStatsData;
}

const chartColors = {
  rate: "#1890ff",
  cumulativeUsage: "#ff7a45",
  cumulativeAccumulated: "#52c41a",
  dailyUsage: "#faad14",
  dow: "#722ed1",
  hour: "#13c2c2",
};

export const ItemCharts: React.FC<ItemChartsProps> = ({ data }) => {
  if (data.daily.length === 0) {
    return <Empty description="No data yet" />;
  }

  const { daily, usageByDayOfWeek, usageByHour } = data;

  // For the combined rate vs usage chart, we show rate and cumulative usage on the same line graph
  const rateVsUsageData = daily.map((d) => ({
    date: d.date,
    "Rate (per day)": d.rate,
    "Cumulative Usage": d.cumulativeUsage,
  }));

  // For the accumulation chart
  const accumulationData = daily.map((d) => ({
    date: d.date,
    Generated: d.cumulativeAccumulated,
    Used: d.cumulativeUsage,
    Available: d.cumulativeAccumulated - d.cumulativeUsage,
  }));

  // For the daily usage bar chart
  const dailyUsageData = daily
    .filter((d) => d.dailyUsage > 0)
    .map((d) => ({
      date: d.date,
      Usage: d.dailyUsage,
    }));

  const tabItems = [
    {
      key: "rate-vs-usage",
      label: "Rate vs Usage",
      children: (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={rateVsUsageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#aaa" }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#aaa" }}
              label={{
                value: "Rate / day",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#aaa", fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#aaa" }}
              label={{
                value: "Cumulative Usage",
                angle: 90,
                position: "insideRight",
                style: { fill: "#aaa", fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: 8,
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="stepAfter"
              dataKey="Rate (per day)"
              stroke={chartColors.rate}
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Cumulative Usage"
              stroke={chartColors.cumulativeUsage}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "accumulation",
      label: "Accumulation",
      children: (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={accumulationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#aaa" }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: "#aaa" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: 8,
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Generated"
              stroke={chartColors.cumulativeAccumulated}
              fill={chartColors.cumulativeAccumulated}
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Used"
              stroke={chartColors.cumulativeUsage}
              fill={chartColors.cumulativeUsage}
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Available"
              stroke={chartColors.rate}
              fill={chartColors.rate}
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "daily-usage",
      label: "Daily Usage",
      children: (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dailyUsageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#aaa" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: 8,
              }}
            />
            <Bar
              dataKey="Usage"
              fill={chartColors.dailyUsage}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "day-of-week",
      label: "By Day of Week",
      children: (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={usageByDayOfWeek}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#aaa" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: 8,
              }}
            />
            <Bar
              dataKey="count"
              name="Usage"
              fill={chartColors.dow}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: "hour-of-day",
      label: "By Hour",
      children: (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={usageByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#aaa" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: 8,
              }}
            />
            <Bar
              dataKey="count"
              name="Usage"
              fill={chartColors.hour}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <Tabs defaultActiveKey="rate-vs-usage" items={tabItems} />
      </Card>
    </div>
  );
};
