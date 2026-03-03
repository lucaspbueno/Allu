import { PrismaClient } from ".prisma/cart-client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
