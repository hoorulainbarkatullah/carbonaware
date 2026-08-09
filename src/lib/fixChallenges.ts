import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fix() {
  console.log("Updating legacy challenge records...");
  const challenges = await prisma.challenge.findMany();
  for (const c of challenges) {
    if (!c.updatedAt) {
      await prisma.challenge.update({
        where: { id: c.id },
        data: { updatedAt: new Date() },
      });
    }
  }
  console.log("Fix complete.");
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
