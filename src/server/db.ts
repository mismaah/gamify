import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Audit middleware
prisma.$use(async (params, next) => {
  console.log("MIDDLEWARED!!!!!");
  const result = await next(params);
  if (
    params.model !== "Audit" &&
    [
      "create",
      "createMany",
      "update",
      "updateMany",
      "upsert",
      "delete",
      "deleteMany",
    ].includes(params.action)
  ) {
    await prisma.audit.create({
      data: {
        model: params.model ?? "",
        action: params.action,
        args: JSON.stringify(params.args),
        result: JSON.stringify(result),
      },
    });
  }
  return result;
});

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
