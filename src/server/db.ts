import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "~/env.mjs";
import { PrismaClient } from "../../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  const baseClient = new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  // Audit logging via $extends (replaces removed $use middleware)
  const extendedClient = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args);
          if (
            model !== "Audit" &&
            [
              "create",
              "createMany",
              "update",
              "updateMany",
              "upsert",
              "delete",
              "deleteMany",
            ].includes(operation)
          ) {
            await baseClient.audit.create({
              data: {
                model: model ?? "",
                action: operation,
                args: JSON.stringify(args),
                result: JSON.stringify(result),
              },
            });
          }
          return result;
        },
      },
    },
  });

  return extendedClient;
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
export type AppPrismaClient = typeof prisma;
