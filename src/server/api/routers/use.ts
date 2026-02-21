import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
      const [data, total] = await Promise.all([
        ctx.prisma.use.findMany({
          where: { itemId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        ctx.prisma.use.count({ where: { itemId } }),
      ]);
      return { data, total, page, pageSize };
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
        return ctx.prisma.use.update({
          where: { id: input.id },
          data: {
            createdAt: input.createdAt,
          },
        });
      } else if (input.itemId) {
        return ctx.prisma.use.create({
          data: {
            itemId: input.itemId,
          },
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.use.delete({ where: { id: input.id } });
    }),
});
