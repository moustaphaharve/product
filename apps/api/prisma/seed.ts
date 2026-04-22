import { PrismaClient } from "@prisma/client";
import { SEED_COMPONENTS } from "@product/components-db/seed";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${SEED_COMPONENTS.length} components…`);
  for (const c of SEED_COMPONENTS) {
    await prisma.component.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        manufacturer: c.manufacturer,
        category: c.category,
        subcategory: c.subcategory ?? null,
        description: c.description,
        specs: c.specs,
        compatibility: c.compatibility,
        alternativeIds: c.alternativeIds,
        imageUrl: c.imageUrl ?? null,
        datasheetUrl: c.datasheetUrl ?? null,
        suppliers: {
          create: c.suppliers.map((s) => ({
            name: s.name,
            priceUsd: s.priceUsd,
            inStock: s.inStock,
            leadTimeDays: s.leadTimeDays,
            purchaseUrl: s.purchaseUrl,
            affiliateUrl: s.affiliateUrl ?? null,
            lastChecked: new Date(s.lastChecked),
          })),
        },
      },
      update: {
        name: c.name,
        manufacturer: c.manufacturer,
        category: c.category,
        subcategory: c.subcategory ?? null,
        description: c.description,
        specs: c.specs,
        compatibility: c.compatibility,
        alternativeIds: c.alternativeIds,
      },
    });
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
