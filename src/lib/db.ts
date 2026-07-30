import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // During build time, return a proxy that will throw only when actually used
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        if (prop === "then" || prop === "catch") return undefined;
        return new Proxy(() => {}, {
          get() {
            return () => Promise.resolve(null);
          },
          apply() {
            return Promise.resolve(null);
          },
        });
      },
    });
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
