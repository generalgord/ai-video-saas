import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const videoId = url.searchParams.get("videoId");

    try {

        const body = await req.json();

        if (body.status === "succeeded" && body.output) {
            const outputUrl = Array.isArray(body.output) ? body.output[0] : body.output;

            // 1. SENARYO: FİLİGRAN İŞLEMİ BİTTİYSE (ZİNCİRİN SONU)
            if (type === "watermark" && videoId) {
                await prisma.video.update({
                    where: { id: videoId },
                    data: {
                        watermarked_video_url: outputUrl,
                        status: "COMPLETED", // Artık kullanıcıya gösterebiliriz!
                    },
                });
                console.log("💧 Filigranlı video hazır, zincir tamamlandı:", outputUrl);
            }
            // 2. SENARYO: TEMİZ VİDEO BİTTİYSE (ZİNCİRİN ORTASI - OTOMATİK FİLİGRANA GÖNDER)
            else {
                const predictionId = body.id;
                const video = await prisma.video.findUnique({
                    where: { ai_generation_id: predictionId },
                });

                if (video) {
                    // Temiz videoyu kaydet ama durumu "WATERMARKING" (Filigranlanıyor) yap
                    await prisma.video.update({
                        where: { id: video.id },
                        data: {
                            status: "WATERMARKING",
                            clean_video_url: outputUrl,
                        },
                    });

                    console.log("✅ Temiz video geldi. Otomatik filigrana gönderiliyor...", outputUrl);

                    // Anında filigran modelini tetikle
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                    await replicate.predictions.create({
                        model: "nateraw/ffmpeg",
                        input: {
                            input_file: outputUrl,
                            command: `-vf "drawtext=text='AI Video SaaS':fontcolor=white@0.8:fontsize=32:x=20:y=20" -c:a copy`
                        },
                        webhook: `${appUrl}/api/webhooks/replicate?type=watermark&videoId=${video.id}`,
                        webhook_events_filter: ["completed"],
                    });
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook hatası:", error);

        // HATA ANINDA KURTARMA DENEMESİ
        if (videoId && type === "watermark") {
            // Eğer filigran eklerken hata aldıysak, durumu "ERROR" yapmak yerine 
            // 1 dakika sonra tekrar denemek üzere bir işaret koyabiliriz 
            // veya admin'e bildirim yollayabiliriz.
            await prisma.video.update({
                where: { id: videoId },
                data: { status: "WATERMARKING" } // Cron Job birazdan gelip bunu kurtaracak
            });
        }

        return NextResponse.json({ success: false }, { status: 500 });
    }
}