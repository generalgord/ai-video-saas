import "dotenv/config"; // Seed scriptinin .env dosyasını okumasını garantiye alır
import { prisma } from "../src/lib/prisma"; // Ayarlanmış, hazır Prisma motorumuz!

async function main() {
    const t1 = await prisma.template.upsert({
        where: { id: 'travel-vlog-1' },
        update: {},
        create: {
            id: 'travel-vlog-1',
            name: "Seyahat & Macera",
            description: "Tatil fotoğraflarınızı sinematik bir gezi vloguna dönüştürün.",
            ai_model_name: "minimax/video-01",
            base_prompt: "Create a cinematic travel video with smooth transitions, highlighting: {user_input}",
            required_inputs: { prompt: "Nereye gittiniz? (Örn: Bakü sokakları)", style: "Vlog" },
        },
    });

    const t2 = await prisma.template.upsert({
        where: { id: 'ai-avatar-1' },
        update: {},
        create: {
            id: 'ai-avatar-1',
            name: "Yapay Zeka Sunucu",
            description: "Metninizi gerçekçi bir dijital insanın seslendirmesini sağlayın.",
            ai_model_name: "heygen/avatar-v2",
            base_prompt: "Digital human speaking clearly: {user_input}",
            required_inputs: { text: "Ne söylesin?", voice: "Erkek/Kadın" },
        },
    });

    console.log("Şablonlar başarıyla oluşturuldu! ✅");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());