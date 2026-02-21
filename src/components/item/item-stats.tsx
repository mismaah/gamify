import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import React from "react";
import type { ItemStatsData } from "./types";

export interface ItemStatsProps {
  data: ItemStatsData;
}

export const ItemStats: React.FC<ItemStatsProps> = ({ data }) => {
  const {
    totalUsage,
    totalAccumulated,
    avgUsagePerDay,
    currentRate,
    streakDays,
    longestStreakDays,
  } = data;

  const available = totalAccumulated - totalUsage;
  const usageRatio =
    totalAccumulated > 0
      ? Math.round((totalUsage / totalAccumulated) * 100)
      : 0;

  return (
    <div className="w-full max-w-4xl">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Available"
              value={available}
              valueStyle={{
                color: available > 0 ? "#3f8600" : "#cf1322",
              }}
              prefix={
                available > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic title="Total Used" value={totalUsage} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic title="Total Generated" value={totalAccumulated} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Usage Rate"
              value={usageRatio}
              suffix="%"
              valueStyle={{
                color: usageRatio > 90 ? "#cf1322" : "#3f8600",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Avg Usage / Day"
              value={avgUsagePerDay}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Current Rate / Day"
              value={currentRate ?? "N/A"}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Current Streak"
              value={streakDays}
              suffix="days"
              prefix={<FireOutlined />}
              valueStyle={{
                color: streakDays > 0 ? "#faad14" : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Best Streak"
              value={longestStreakDays}
              suffix="days"
              prefix={<TrophyOutlined />}
              valueStyle={{
                color: longestStreakDays > 0 ? "#1890ff" : undefined,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
