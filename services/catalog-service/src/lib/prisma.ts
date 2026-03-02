import { PrismaClient } from ".prisma/catalog-client";

const prisma = new PrismaClient();

export { prisma };
export type { PrismaClient };
