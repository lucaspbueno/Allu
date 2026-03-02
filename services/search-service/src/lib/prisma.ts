import { PrismaClient } from ".prisma/search-client";

const prisma = new PrismaClient();

export { prisma };
export type { PrismaClient };
