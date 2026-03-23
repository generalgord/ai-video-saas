'use client';

import { Button } from "@/components/ui/button";

export default function VideoActions({ video }: { video: any }) {
    const handleCleanDownload = () => {
        alert("Kredi düşülecek ve temiz video inecek. (Stripe Entegrasyonu Bekleniyor)");
        // Gerçekte burada: window.open(video.clean_video_url, "_blank"); çalışacak
    };

    return (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
            {/* Kredisi Olanlar İçin: Temiz İndir */}
            <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCleanDownload}
            >
                ✨ Temiz İndir (1 Kredi)
            </Button>

            {/* Herkes İçin: Filigranlı İndir */}
            <Button
                variant="secondary"
                className="w-full"
                onClick={() => window.open(video.watermarked_video_url, "_blank")}
            >
                ⬇️ Ücretsiz İndir (Filigranlı)
            </Button>
        </div>
    );
}