export type ItemStatsData = {
  daily: {
    date: string;
    rate: number;
    cumulativeUsage: number;
    cumulativeAccumulated: number;
    dailyUsage: number;
  }[];
  usageByDayOfWeek: { day: string; count: number }[];
  usageByHour: { hour: string; count: number }[];
  totalUsage: number;
  totalAccumulated: number;
  avgUsagePerDay: number;
  currentRate: number | null;
  streakDays: number;
  longestStreakDays: number;
};
