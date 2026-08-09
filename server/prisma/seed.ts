import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.user.findUnique({
    where: {
      email: "teacher@edutrack.com",
    },
  });

  if (exists) {
    console.log("✅ Teacher already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      name: "Main Teacher",
      email: "teacher@edutrack.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Teacher created successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });