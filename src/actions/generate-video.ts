'use server';

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateVideoAction(templateId: string, formData: Record<string, any>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Giriş yapmanız gerekiyor." };
    }

    // 1. Kullanıcıyı ve kredisini bul
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    if (!dbUser || dbUser.free_generation_count <= 0) {
        return { success: false, error: "Yetersiz kredi! Lütfen planınızı yükseltin." };
    }

    try {
        // 3. Veritabanına yeni bir Video kaydı ekle (Şimdilik "PROCESSING" yani işleniyor durumunda)
        const newVideo = await prisma.video.create({
            data: {
                userId: user.id,
                templateId: templateId,
                // title: `${templateId} - Yeni Video`,
                // prompt: JSON.stringify(formData), // Kullanıcının girdiği veriler
                // video_url: "", // Yapay zekadan gelince dolacak
                status: "PROCESSING",
            },
        });

        // 4. (SİMÜLASYON) Yapay Zeka API'sine istek atıyormuşuz gibi yapıyoruz
        // Gerçek entegrasyonda buraya Replicate veya Luma API kodları gelecek
        console.log(`[Yapay Zeka Motoru] ${templateId} için üretim başladı... Veriler:`, formData);

        // 2. Krediyi yapay zeka sistemine istek başarılı şekilde giderse 1 düşür
        await prisma.user.update({
            where: { id: user.id },
            data: { free_generation_count: { decrement: 1 } },
        });

        // Dashboard'u güncelle (kredinin düştüğünü göstermek için)
        revalidatePath("/dashboard");

        return { success: true, videoId: newVideo.id };

    } catch (error) {
        console.error("Video üretim hatası:", error);
        return { success: false, error: "Video üretilirken bir hata oluştu." };
    }
}