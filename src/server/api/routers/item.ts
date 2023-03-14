import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.item.findFirst({
        where: { id: input.id },
        include: {
          rates: { orderBy: { from: "desc" } },
          usage: { orderBy: { createdAt: "desc" } },
        },
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.item.findMany({
      include: {
        rates: true,
        usage: true,
      },
    });
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), description: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.create({
        data: { name: input.name, description: input.description },
      });
    }),
});
