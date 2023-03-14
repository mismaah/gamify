import { createTRPCRouter } from "~/server/api/trpc";
import { itemRouter } from "~/server/api/routers/item";
import { rateRouter } from "./routers/rate";
import { usageRouter } from "./routers/use";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  item: itemRouter,
  rate: rateRouter,
  usage: usageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
