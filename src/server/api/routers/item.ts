import dayjs from "dayjs";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/server/cache";
import { countAccumulated, rateInSec } from "~/utils/helpers";

export const itemRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const cacheKey = `item.get:${input.id}`;

      const fetchItem = async () => {
        const item = await ctx.prisma.item.findFirst({
          where: { id: input.id },
          include: {
            rates: { orderBy: { from: "desc" } },
            _count: { select: { usage: true } },
          },
        });
        if (!item) return null;

        const firstUsage = await ctx.prisma.use.findFirst({
          where: { itemId: input.id },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });

        const [accumulated, nextInSec, currentRatePerSec] = countAccumulated(
          item.rates
        );
        const { _count, ...rest } = item;
        return {
          ...rest,
          accumulated,
          nextInSec,
          currentRatePerSec,
          usageCount: _count.usage,
          firstUsageDate: firstUsage?.createdAt ?? null,
        };
      };

      type ItemGetResult = Awaited<ReturnType<typeof fetchItem>>;
      const cached = cache.get<ItemGetResult>(cacheKey);
      if (cached !== undefined) return cached;

      const result = await fetchItem();
      if (result) cache.set(cacheKey, result);
      return result;
    }),

  getAll: publicProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(12),
        })
        .default({})
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const [items, total] = await Promise.all([
        ctx.prisma.item.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            rates: true,
            _count: { select: { usage: true } },
          },
          orderBy: { id: "desc" },
        }),
        ctx.prisma.item.count(),
      ]);

      return {
        items: items.map(({ rates, _count, ...item }) => {
          const [accumulated, nextInSec, currentRatePerSec] =
            countAccumulated(rates);
          return {
            ...item,
            accumulated,
            nextInSec,
            currentRatePerSec,
            usageCount: _count.usage,
          };
        }),
        total,
        page,
        pageSize,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string(), description: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.create({
        data: { name: input.name, description: input.description },
      });
    }),

  stats: publicProcedure
    .input(
      z.object({
        id: z.number(),
        from: z.date().nullable().default(null),
        to: z.date().nullable().default(null),
      })
    )
    .query(async ({ ctx, input }) => {
      const rangeFrom = input.from ? dayjs(input.from) : null;
      const rangeTo = input.to ? dayjs(input.to) : null;

      const usageWhere: any = { itemId: input.id };
      if (rangeFrom || rangeTo) {
        usageWhere.createdAt = {};
        if (rangeFrom) usageWhere.createdAt.gte = rangeFrom.toDate();
        if (rangeTo) usageWhere.createdAt.lte = rangeTo.endOf("day").toDate();
      }

      const item = await ctx.prisma.item.findFirst({
        where: { id: input.id },
        include: {
          rates: { orderBy: { from: "asc" } },
        },
      });
      if (!item) return null;

      const usage = await ctx.prisma.use.findMany({
        where: usageWhere,
        orderBy: { createdAt: "asc" },
      });

      // --- Build daily time-series data ---
      const allDates: Date[] = [
        ...item.rates.map((r) => r.from),
        ...item.rates.filter((r) => r.to).map((r) => r.to!),
        ...usage.map((u) => u.createdAt),
      ];
      if (allDates.length === 0) {
        return {
          daily: [],
          usageByDayOfWeek: Array.from({ length: 7 }, (_, i) => ({
            day: dayjs().day(i).format("ddd"),
            count: 0,
          })),
          usageByHour: Array.from({ length: 24 }, (_, i) => ({
            hour: `${i.toString().padStart(2, "0")}:00`,
            count: 0,
          })),
          totalUsage: 0,
          totalAccumulated: 0,
          avgUsagePerDay: 0,
          currentRate: null,
          streakDays: 0,
          longestStreakDays: 0,
        };
      }

      const minDate = rangeFrom
        ? rangeFrom.startOf("day")
        : dayjs(
            allDates.reduce((min, d) => (d < min ? d : min), allDates[0]!)
          ).startOf("day");
      const maxDate = rangeTo ? rangeTo.endOf("day") : dayjs().endOf("day");

      // Build a map of daily usage counts
      const usageByDay = new Map<string, number>();
      for (const u of usage) {
        const key = dayjs(u.createdAt).format("YYYY-MM-DD");
        usageByDay.set(key, (usageByDay.get(key) ?? 0) + 1);
      }

      // Build daily series: rate (per day) and cumulative usage
      const daily: {
        date: string;
        rate: number;
        cumulativeUsage: number;
        cumulativeAccumulated: number;
        dailyUsage: number;
      }[] = [];

      let cumulativeUsage = 0;
      let cumulativeAccumulated = 0;

      let current = minDate;
      while (current.isBefore(maxDate) || current.isSame(maxDate, "day")) {
        const dateStr = current.format("YYYY-MM-DD");
        const dayStart = current;
        const dayEnd = current.endOf("day");

        // Find the effective rate for this day
        let effectiveRatePerDay = 0;
        for (const rate of item.rates) {
          const rateFrom = dayjs(rate.from);
          const rateTo = rate.to ? dayjs(rate.to) : null;
          // Check if rate overlaps with this day
          if (
            rateFrom.isBefore(dayEnd) &&
            (!rateTo || rateTo.isAfter(dayStart))
          ) {
            const ratePerSec = rate.value / rateInSec(rate.unit);
            effectiveRatePerDay = ratePerSec * 86400;
          }
        }

        const dailyUsage = usageByDay.get(dateStr) ?? 0;
        cumulativeUsage += dailyUsage;
        cumulativeAccumulated += effectiveRatePerDay;

        daily.push({
          date: dateStr,
          rate: Math.round(effectiveRatePerDay * 100) / 100,
          cumulativeUsage,
          cumulativeAccumulated: Math.floor(cumulativeAccumulated),
          dailyUsage,
        });

        current = current.add(1, "day");
      }

      // --- Usage by day of week ---
      const dowCounts = Array.from({ length: 7 }, () => 0);
      for (const u of usage) {
        dowCounts[dayjs(u.createdAt).day()]!++;
      }
      const usageByDayOfWeek = dowCounts.map((count, i) => ({
        day: dayjs().day(i).format("ddd"),
        count,
      }));

      // --- Usage by hour of day ---
      const hourCounts = Array.from({ length: 24 }, () => 0);
      for (const u of usage) {
        hourCounts[dayjs(u.createdAt).hour()]!++;
      }
      const usageByHour = hourCounts.map((count, i) => ({
        hour: `${i.toString().padStart(2, "0")}:00`,
        count,
      }));

      // --- Streak calculation ---
      let streakDays = 0;
      let longestStreakDays = 0;
      let tempStreak = 0;
      let checkDay = dayjs().startOf("day");
      // Current streak (backwards from today)
      while (usageByDay.has(checkDay.format("YYYY-MM-DD"))) {
        streakDays++;
        checkDay = checkDay.subtract(1, "day");
      }
      // Longest streak
      for (const entry of daily) {
        if (entry.dailyUsage > 0) {
          tempStreak++;
          longestStreakDays = Math.max(longestStreakDays, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      const totalDays = daily.length || 1;
      const [totalAccumulated, , currentRatePerSec] = countAccumulated(
        item.rates
      );

      return {
        daily,
        usageByDayOfWeek,
        usageByHour,
        totalUsage: usage.length,
        totalAccumulated,
        avgUsagePerDay: Math.round((usage.length / totalDays) * 100) / 100,
        currentRate: currentRatePerSec
          ? Math.round(currentRatePerSec * 86400 * 100) / 100
          : null,
        streakDays,
        longestStreakDays,
      };
    }),
});
