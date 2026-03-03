import { PrismaClient } from ".prisma/search-client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
