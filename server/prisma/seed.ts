import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedAdminPassword = await bcrypt.hash("123456", 10);
  const hashedTeacherPassword = await bcrypt.hash("123456", 10);

  // =========================
  // ADMIN ACCOUNT - YOU
  // =========================
  await prisma.user.upsert({
    where: {
      email: "admin@edutrack.com",
    },
    update: {
      role: UserRole.ADMIN,
    },
    create: {
      name: "Jana Admin",
      email: "admin@edutrack.com",
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log("✅ Admin account ready.");

  // =========================
  // TEACHER ACCOUNT - CLIENT
  // =========================
  await prisma.user.upsert({
    where: {
      email: "teacher@edutrack.com",
    },
    update: {
      role: UserRole.TEACHER,
    },
    create: {
      name: "Main Teacher",
      email: "teacher@edutrack.com",
      password: hashedTeacherPassword,
      role: UserRole.TEACHER,
    },
  });

  console.log("✅ Teacher account ready.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

