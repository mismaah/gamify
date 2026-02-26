import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/server/cache";

export const usageRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { itemId, page, pageSize } = input;

      // Cache only the default first-page request
      const cacheKey = `usage.getAll:${itemId}:${page}:${pageSize}`;
      if (page === 1 && pageSize === 10) {
        const cached = cache.get(cacheKey);
        if (cached)
          return cached as {
            data: any[];
            total: number;
            page: number;
            pageSize: number;
          };
      }

      const [data, total] = await Promise.all([
        ctx.prisma.use.findMany({
          where: { itemId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.prisma.use.count({ where: { itemId } }),
      ]);
      const result = { data, total, page, pageSize };
      if (page === 1 && pageSize === 10) {
        cache.set(cacheKey, result);
      }
      return result;
    }),

  createOrUpdate: publicProcedure
    .input(
      z.object({
        id: z.number().nullable(),
        itemId: z.number().nullable(),
        createdAt: z.date().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id && input.createdAt) {
        const result = await ctx.prisma.use.update({
          where: { id: input.id },
          data: {
            createdAt: input.createdAt,
          },
        });
        cache.invalidate(`item.get:${result.itemId}`);
        cache.invalidatePrefix(`usage.getAll:${result.itemId}:`);
        return result;
      } else if (input.itemId) {
        const result = await ctx.prisma.use.create({
          data: {
            itemId: input.itemId,
          },
        });
        cache.invalidate(`item.get:${input.itemId}`);
        cache.invalidatePrefix(`usage.getAll:${input.itemId}:`);
        return result;
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.use.delete({ where: { id: input.id } });
      cache.invalidate(`item.get:${result.itemId}`);
      cache.invalidatePrefix(`usage.getAll:${result.itemId}:`);
      return result;
    }),
});
