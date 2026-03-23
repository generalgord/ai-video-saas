import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET() {
    try {
        // Eğer video son 15 dakika içinde güncellendiyse, hala normal sürecinde olabilir.
        // 15 dakikayı geçtiyse "takılmış" kabul ediyoruz.
        const timeoutThreshold = new Date(Date.now() - 15 * 60 * 1000);

        const stuckVideos = await prisma.video.findMany({
            where: {
                status: "WATERMARKING",
                clean_video_url: { not: null },
                updatedAt: { lt: timeoutThreshold }
            }
        });

        if (stuckVideos.length === 0) {
            return NextResponse.json({ message: "İşlemde olan videolar var ama henüz zaman aşımına uğramamışlar." });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // 2. Takılı kalan her video için filigran sürecini baştan başlat
        for (const video of stuckVideos) {
            await prisma.video.update({
                where: { id: video.id },
                data: { updatedAt: new Date() }
            });

            await replicate.predictions.create({
                model: "nateraw/ffmpeg",
                input: {
                    input_file: video.clean_video_url,
                    command: `-vf "drawtext=text='AI Video SaaS':fontcolor=white@0.8:fontsize=32:x=20:y=20" -c:a copy`
                },
                webhook: `${appUrl}/api/webhooks/replicate?type=watermark&videoId=${video.id}`,
                webhook_events_filter: ["completed"],
            });
            console.log(`🔄 ${video.id} ID'li video yeniden kuyruğa alındı.`);
        }

        return NextResponse.json({
            success: true,
            message: `${stuckVideos.length} adet takılı video başarıyla filigran kuyruğuna eklendi!`
        });

    } catch (error) {
        console.error("Kurtarma hatası:", error);
        return NextResponse.json({ success: false, error: "Kurtarma işlemi başarısız oldu." }, { status: 500 });
    }
}