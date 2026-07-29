import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ":***@"));

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@yuniexpress.co.mz" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@yuniexpress.co.mz",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create categories
  const categories = [
    { name: "Electrónica", slug: "electronics", icon: "Smartphone", featured: true, order: 1 },
    { name: "Moda", slug: "fashion", icon: "Shirt", featured: true, order: 2 },
    { name: "Casa & Jardim", slug: "home", icon: "Home", featured: true, order: 3 },
    { name: "Beleza & Saúde", slug: "beauty", icon: "Sparkles", featured: true, order: 4 },
    { name: "Desporto", slug: "sports", icon: "Dumbbell", featured: true, order: 5 },
    { name: "Brinquedos", slug: "toys", icon: "Gamepad2", featured: true, order: 6 },
    { name: "Automóveis", slug: "automotive", icon: "Car", featured: true, order: 7 },
    { name: "Telemóveis", slug: "phones", icon: "Smartphone", featured: true, order: 8 },
    { name: "Relógios", slug: "watches", icon: "Watch", featured: false, order: 9 },
    { name: "Computadores", slug: "computers", icon: "Monitor", featured: false, order: 10 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`${categories.length} categories created`);

  // Create initial settings
  const settings = [
    { key: "default_margin_percent", value: "25", type: "number" },
    { key: "store_name", value: "YuniExpress", type: "string" },
    { key: "support_email", value: "suporte@yuniexpress.co.mz", type: "string" },
    { key: "support_phone", value: "+258 84 000 0000", type: "string" },
    { key: "sync_interval_minutes", value: "30", type: "number" },
    { key: "currency", value: "MZN", type: "string" },
    { key: "min_order_value", value: "500", type: "number" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`${settings.length} settings created`);

  // Create initial exchange rate
  await prisma.exchangeRate.create({
    data: {
      fromCurrency: "USD",
      toCurrency: "MZN",
      rate: 63.5,
      source: "seed",
    },
  });
  console.log("Initial exchange rate set: 1 USD = 63.5 MZN");

  // Create sample banner
  await prisma.banner.create({
    data: {
      title: "Bem-vindo ao YuniExpress",
      subtitle: "Produtos internacionais com preços em Meticais",
      image: "https://ae01.alicdn.com/kf/S87faab048fdb45f3b11ea9d07e2a8d1dg.png",
      link: "/search",
      order: 1,
      active: true,
    },
  });
  console.log("Sample banner created");

  // Create a sample coupon
  await prisma.coupon.create({
    data: {
      code: "BEMVINDO10",
      description: "10% de desconto na primeira compra",
      type: "PERCENTAGE",
      value: 10,
      minOrderMZN: 1000,
      maxDiscountMZN: 5000,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      active: true,
    },
  });
  console.log("Sample coupon created: BEMVINDO10");

  console.log("\nSeed completed successfully!");
  console.log("\nAdmin credentials:");
  console.log("  Email: admin@yuniexpress.co.mz");
  console.log("  Password: admin123456");
  console.log("\n  IMPORTANTE: Altere a password do admin apos o primeiro login!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
