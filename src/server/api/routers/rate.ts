import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const rateRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.rate.findMany({ where: { itemId: input.itemId } });
    }),

  createOrUpdate: publicProcedure
    .input(
      z.object({
        id: z.number().nullable(),
        itemId: z.number(),
        from: z.date(),
        to: z.date().nullable(),
        value: z.number(),
        unit: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkRateOverlap(
        input.id ? [input.id] : [],
        ctx.prisma,
        input.itemId,
        input.from,
        input.to
      );
      if (input.id) {
        return ctx.prisma.rate.update({
          where: { id: input.id },
          data: {
            from: input.from,
            to: input.to,
            value: input.value,
            unit: input.unit,
          },
        });
      }
      return ctx.prisma.rate.create({
        data: {
          itemId: input.itemId,
          from: input.from,
          to: input.to,
          value: input.value,
          unit: input.unit,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.rate.delete({ where: { id: input.id } });
    }),
});

export const checkRateOverlap = async (
  dontCountIds: number[],
  prisma: PrismaClient,
  itemId: number,
  from: Date,
  to: Date | null
) => {
  if (!to) {
    const ratesWithoutTo = await prisma.rate.findMany({
      where: { itemId, to: null, id: { not: { in: dontCountIds } } },
    });
    if (ratesWithoutTo.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Rate without to date already exists.",
      });
    }
  }
  const checks: any = [{ from: { lte: from }, to: { gte: from } }];
  if (to) {
    checks.push(
      { from: { gte: from }, to: { lte: to } },
      { from: { lte: to }, to: null },
      { from: { lte: to }, to: { gte: to } }
    );
  } else {
    checks.push({ from: { gte: from } });
  }
  const overlaps = await prisma.rate.findMany({
    where: {
      itemId,
      OR: checks,
    },
  });
  if (overlaps.filter((o) => !dontCountIds.includes(o.id)).length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Overlaps with existing rate dates.",
    });
  }
};
