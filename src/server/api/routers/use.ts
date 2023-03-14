import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const usageRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.use.findMany({ where: { itemId: input.itemId } });
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
