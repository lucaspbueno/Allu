import { PrismaClient } from ".prisma/catalog-client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
