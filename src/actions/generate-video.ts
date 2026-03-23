'use server';

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateVideoAction(templateId: string, formData: Record<string, any>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Giriş yapmanız gerekiyor." };
    }

    // 1. Kullanıcıyı ve şablonu veritabanından çek (Dinamik model ve prompt için)
    const [dbUser, template] = await Promise.all([
        prisma.user.findUnique({ where: { id: user.id } }),
        prisma.template.findUnique({ where: { id: templateId } }),
    ]);

    if (!dbUser || dbUser.free_generation_count <= 0) {
        return { success: false, error: "Yetersiz kredi! Lütfen planınızı yükseltin veya kredi satın alın." };
    }

    if (!template) {
        return { success: false, error: "Şablon bulunamadı." };
    }

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

    try {

        // 4. Dinamik Prompt Oluşturma: Kullanıcının girdilerini şablondaki {user_input} ile değiştir
        // Seed dosyamızda base_prompt: "Seyahat videosu: {user_input}" gibi bir yapı kurmuştuk.
        // Kullanıcının formda doldurduğu 'prompt' inputunu buraya yerleştiriyoruz.
        let finalPrompt = template.base_prompt;
        if (formData.prompt) {
            finalPrompt = finalPrompt.replace("{user_input}", formData.prompt);
        }

        // Not: Eğer şablonun 'file' (dosya) girdisi varsa, formData içindeki URL'i 
        // Replicate'in beklediği 'image' veya 'video' parametresine eklemeliyiz.
        // (Dosya yükleme UI'ını ve Supabase Storage entegrasyonunu henüz yapmadık, şimdilik text-to-video üzerinden gidiyoruz.)

        // 5. Replicate API'sine İsteği Gönder (Dinamik Model ve Prompt)
        // Uygulamanın çalışacağı tam URL (Webhook için)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://droitural-pendantly-cherelle.ngrok-free.dev";

        const prediction = await replicate.predictions.create({
            // Şablondan gelen gerçek model adını kullanıyoruz (Örn: minimax/video-01)
            model: template.ai_model_name as any,
            input: {
                // Dinamik olarak oluşturulan nihai prompt
                prompt: finalPrompt,
                // Eğer model başka parametreler bekliyorsa (style, aspect_ratio vb.), 
                // onları da formData'dan alıp buraya ekleyebiliriz.
            },
            // Replicate video bitince bu adrese bir POST isteği atacak
            webhook: `${appUrl}/api/webhooks/replicate`,
            webhook_events_filter: ["completed"],
        });

        console.log(`[Yapay Zeka Motoru] ${templateId} için üretim başladı... Veriler:`, formData);

        // 6. Veritabanındaki kaydı Replicate'den gelen prediction.id ile güncelle
        // Böylece webhook geldiğinde hangi videoyu güncelleyeceğimizi bileceğiz.
        await prisma.video.update({
            where: { id: newVideo.id },
            data: {
                ai_generation_id: prediction.id, // Bu çok önemli!
            },
        });

        // 7. Krediyi yapay zeka sistemine istek başarılı şekilde giderse 1 düşür
        await prisma.user.update({
            where: { id: user.id },
            data: { free_generation_count: { decrement: 1 } },
        });

        // Dashboard'u güncelle (kredinin düştüğünü göstermek için)
        revalidatePath("/dashboard");

        return { success: true, videoId: newVideo.id };

    } catch (error) {
        console.error("Video üretim hatası:", error);

        // Hata durumunda kullanıcıya kredisini geri yüklemek iyi bir fikir olabilir.
        // Hatta burda hata olmazsa bile ai callbackten veri geldiğinde başarısız olarak gelmişse
        // Müşteriye kredisi iade edilebilir.
        // Yeniden dene dediğinde tekrar arttırılır vs.
        await prisma.user.update({
            where: { id: user.id },
            data: { free_generation_count: { increment: 1 } },
        });

        return { success: false, error: "Video isteği gönderilirken hata oluştu." };
    }
}