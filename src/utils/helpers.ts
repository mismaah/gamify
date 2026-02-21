import type { Rate } from "@prisma/client";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export const DATETIME_FORMATS = {
  date: "YYYY-MM-DD",
  dateAndTime: "YYYY-MM-DD HH:mm",
  dayDateAndTime: "ddd, YYYY-MM-DD HH:mm",
};

export const isSameOrAfter = (d1: Dayjs, d2: Dayjs) => {
  if (d1.isSame(d2, "day") || d1.isAfter(d2, "day")) return true;
  return false;
};

export const isSameOrBefore = (d1: Dayjs, d2: Dayjs) => {
  if (d1.isSame(d2, "day") || d1.isBefore(d2, "day")) return true;
  return false;
};

export const rateInSec = (unit: string) => {
  let val = 0;
  switch (unit) {
    case "Minute":
      val = 60;
      break;
    case "Hour":
      val = 60 * 60;
      break;
    case "Day":
      val = 60 * 60 * 24;
      break;
    case "Week":
      val = 60 * 60 * 24 * 7;
      break;
    case "Month":
      val = 60 * 60 * 24 * 30;
      break;
    case "Year":
      val = 60 * 60 * 24 * 365;
      break;
  }
  return val;
};

export const countAccumulated = (
  rates?: Rate[]
): [number, number | null, number | null] => {
  if (!rates) return [0, null, null];
  let total = 0;
  let currentRate: number | null = null;
  for (const rate of rates) {
    const ratePerSec = rate.value / rateInSec(rate.unit);
    const from = dayjs(rate.from);
    // Skip rate if starting after current time
    if (from.isAfter(dayjs())) continue;
    let to = dayjs();
    if (rate.to && dayjs(rate.to).isBefore(dayjs())) {
      to = dayjs(rate.to);
    }
    const seconds = to.diff(from, "seconds");
    total += ratePerSec * seconds;
    if (
      !rate.to ||
      (isSameOrAfter(dayjs(), from) && isSameOrBefore(dayjs(), to))
    ) {
      currentRate = ratePerSec;
    }
  }
  const floored = Math.floor(total);
  const remainder = 1 - (total - floored);
  let nextInSecs: number | null = null;
  if (currentRate) {
    nextInSecs = remainder / currentRate;
  }
  return [floored, nextInSecs, currentRate];
};

export const plural = (val: number, unit: string) => {
  return val === 1 ? `${val} ${unit}` : `${val} ${unit}s`;
};

export const timeDuration = (s: number) => {
  if (s < 1) {
    return `${plural(Math.floor(s * 1000), "millisecond")}`;
  } else if (s < 60) {
    return `${plural(Math.floor(s), "second")}`;
  } else if (s < 60 * 60) {
    const mins = Math.floor(s / 60);
    const seconds = Math.floor(s - mins * 60);
    return `${plural(mins, "min")} ${plural(seconds, "second")}`;
  } else if (s < 60 * 60 * 24) {
    const hours = Math.floor(s / 60 / 60);
    const mins = Math.floor((s - hours * 60 * 60) / 60);
    return `${plural(hours, "hour")} ${plural(mins, "min")}`;
  } else if (s < 60 * 60 * 24 * 30) {
    const days = Math.floor(s / 60 / 60 / 24);
    const hours = Math.floor((s - days * 60 * 60 * 24) / 60 / 60);
    return `${plural(days, "day")} ${plural(hours, "hour")}`;
  } else {
    const months = Math.floor(s / 60 / 60 / 24 / 30);
    const days = Math.floor((s - months * 60 * 60 * 24 * 30) / 60 / 60 / 24);
    return `${plural(months, "month")} ${plural(days, "day")}`;
  }
};
