import { PrismaClient } from ".prisma/catalog-client";

const prisma = new PrismaClient();

const products = [
  {
    name: "iPhone 15 Pro",
    description:
      "Smartphone Apple com chip A17 Pro, câmera 48MP e tela Super Retina XDR de 6.1 polegadas.",
    price: 219.9,
    imageUrl: "https://placehold.co/400x400?text=iPhone+15+Pro",
    category: "Smartphones",
    stock: 50,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      "Smartphone Samsung com S Pen integrada, câmera 200MP e tela Dynamic AMOLED de 6.8 polegadas.",
    price: 199.9,
    imageUrl: "https://placehold.co/400x400?text=Galaxy+S24+Ultra",
    category: "Smartphones",
    stock: 40,
  },
  {
    name: "MacBook Air M3",
    description: "Notebook Apple com chip M3, 16GB RAM, tela Liquid Retina de 13.6 polegadas.",
    price: 349.9,
    imageUrl: "https://placehold.co/400x400?text=MacBook+Air+M3",
    category: "Notebooks",
    stock: 30,
  },
  {
    name: "Dell XPS 15",
    description:
      "Notebook Dell com Intel Core i7, 16GB RAM, tela OLED InfinityEdge de 15.6 polegadas.",
    price: 299.9,
    imageUrl: "https://placehold.co/400x400?text=Dell+XPS+15",
    category: "Notebooks",
    stock: 25,
  },
  {
    name: "iPad Pro 12.9",
    description:
      "Tablet Apple com chip M2, tela Liquid Retina XDR de 12.9 polegadas, compatível com Apple Pencil.",
    price: 179.9,
    imageUrl: "https://placehold.co/400x400?text=iPad+Pro+12.9",
    category: "Tablets",
    stock: 35,
  },
  {
    name: "AirPods Pro 2",
    description:
      "Fones de ouvido Apple com cancelamento ativo de ruído, áudio adaptativo e estojo MagSafe.",
    price: 49.9,
    imageUrl: "https://placehold.co/400x400?text=AirPods+Pro+2",
    category: "Acessórios",
    stock: 100,
  },
  {
    name: "Apple Watch Series 9",
    description:
      "Smartwatch Apple com chip S9, tela Always-On Retina, monitoramento de saúde avançado.",
    price: 89.9,
    imageUrl: "https://placehold.co/400x400?text=Apple+Watch+S9",
    category: "Wearables",
    stock: 60,
  },
  {
    name: "Sony WH-1000XM5",
    description:
      "Headphone over-ear Sony com cancelamento de ruído líder do mercado e 30h de bateria.",
    price: 59.9,
    imageUrl: "https://placehold.co/400x400?text=Sony+WH-1000XM5",
    category: "Acessórios",
    stock: 45,
  },
  {
    name: "Monitor LG UltraWide 34",
    description: "Monitor ultrawide LG de 34 polegadas, resolução WQHD, painel IPS, USB-C com 90W.",
    price: 129.9,
    imageUrl: "https://placehold.co/400x400?text=LG+UltraWide+34",
    category: "Monitores",
    stock: 20,
  },
  {
    name: "Teclado Mecânico Keychron K8",
    description:
      "Teclado mecânico sem fio Keychron com hot-swap, switches Gateron e retroiluminação RGB.",
    price: 29.9,
    imageUrl: "https://placehold.co/400x400?text=Keychron+K8",
    category: "Acessórios",
    stock: 80,
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.product.deleteMany();

  const result = await prisma.product.createMany({ data: products });

  console.log(`Seed complete. Inserted ${result.count} products.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
