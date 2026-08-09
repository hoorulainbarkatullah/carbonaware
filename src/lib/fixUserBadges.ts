import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixUserBadges() {
  console.log("Fixing UserBadge null earnedDate values...");
  const userBadges = await prisma.userBadge.findMany();
  for (const ub of userBadges) {
    if (!ub.earnedDate || !ub.unlockedAt) {
      await prisma.userBadge.update({
        where: { id: ub.id },
        data: {
          earnedDate: ub.earnedDate || new Date(),
          unlockedAt: ub.unlockedAt || new Date(),
        },
      });
    }
  }
  console.log("UserBadge repair finished!");
}

fixUserBadges()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
