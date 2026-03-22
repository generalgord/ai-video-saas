import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

// Bağlantı havuzunu oluşturuyoruz
const pool = new Pool({
    connectionString,
    // Supabase bağlantıları için bazen SSL gerekebilir, şimdilik böyle kalsın
});

// TypeScript'in tip uyuşmazlığı hatasını 'as any' ile geçiyoruz. 
// Runtime'da (çalışma anında) pool nesnesi doğru olduğu için sorun çıkarmayacaktır.
const adapter = new PrismaPg(pool as any);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;