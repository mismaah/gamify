import { Button, DatePicker, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { api } from "../../utils/api";
import { ItemCharts } from "./item-charts";
import { ItemStats } from "./item-stats";

const { RangePicker } = DatePicker;

export interface ItemAnalyticsProps {
  itemId: number;
}

const presets: { label: string; from: Dayjs; to: Dayjs }[] = [
  {
    label: "Past Week",
    from: dayjs().subtract(7, "day").startOf("day"),
    to: dayjs().endOf("day"),
  },
  {
    label: "Past Month",
    from: dayjs().subtract(1, "month").startOf("day"),
    to: dayjs().endOf("day"),
  },
  {
    label: "Past Year",
    from: dayjs().subtract(1, "year").startOf("day"),
    to: dayjs().endOf("day"),
  },
];

export const ItemAnalytics: React.FC<ItemAnalyticsProps> = ({ itemId }) => {
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const from = dateRange?.[0]?.toDate() ?? null;
  const to = dateRange?.[1]?.toDate() ?? null;

  const stats = api.item.stats.useQuery({ id: itemId, from, to });

  const handlePreset = (preset: (typeof presets)[number]) => {
    setDateRange([preset.from, preset.to]);
  };

  const handleClear = () => {
    setDateRange(null);
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
          }}
          allowClear
        />
        {presets.map((p) => (
          <Button
            key={p.label}
            size="small"
            type={
              dateRange &&
              dateRange[0]?.isSame(p.from, "day") &&
              dateRange[1]?.isSame(p.to, "day")
                ? "primary"
                : "default"
            }
            onClick={() => handlePreset(p)}
          >
            {p.label}
          </Button>
        ))}
        {dateRange && (
          <Button size="small" type="link" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {stats.isLoading && (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      )}

      {stats.data && (
        <>
          <ItemStats data={stats.data} />
          <ItemCharts data={stats.data} />
        </>
      )}
    </div>
  );
};
