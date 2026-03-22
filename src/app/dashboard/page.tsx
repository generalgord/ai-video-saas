import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    // Kullanıcının videolarını en yeniden eskiye doğru çekiyoruz
    const videos = await prisma.video.findMany({
        where: { userId: user.id },
        include: { template: true }, // Şablonun adını da alabilmek için
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-8">
            {/* Üst Kısım: Kredi ve İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Ücretsiz Üretim Hakkı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{dbUser?.free_generation_count ?? 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Temiz İndirme Kredisi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{dbUser?.paid_download_credits ?? 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Mevcut Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="text-lg bg-zinc-100 capitalize">
                            {dbUser?.subscription_plan === 'free' ? 'Başlangıç (Ücretsiz)' : dbUser?.subscription_plan}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Orta Kısım: Aksiyon Alanı */}
            {/* Siyah Afiş - Yeni İçerik Üret */}
            <div className="bg-zinc-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between text-zinc-50">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Yeni İçerik Üret</h2>
                    <p className="text-zinc-400">
                        Yapay zeka şablonlarımızı kullanarak anında video oluşturun.
                    </p>
                </div>

                {/* Link sarmalaması buraya eklendi */}
                <Link href="/dashboard/templates" className="mt-4 md:mt-0">
                    <Button variant="secondary" size="lg" className="bg-white text-zinc-900 hover:bg-zinc-200">
                        Şablon Seç
                    </Button>
                </Link>
            </div>

            {/* Alt Kısım: Geçmiş Videolar */}
            {/* Son Videolarım Bölümü */}
            <div className="mt-12 space-y-4">
                <h2 className="text-2xl font-bold">Son Videolarım</h2>

                {videos.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-xl border-zinc-200 text-zinc-500">
                        Henüz hiç video üretmediniz. Hemen bir şablon seçerek başlayın!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <Card key={video.id} className="overflow-hidden">
                                {/* Video Thumbnail (Şimdilik yer tutucu) */}
                                <div className="aspect-video bg-zinc-100 relative flex items-center justify-center">
                                    {video.status === 'PROCESSING' ? (
                                        <div className="flex flex-col items-center text-zinc-400">
                                            <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mb-2" />
                                            <span className="text-sm font-medium">İşleniyor...</span>
                                        </div>
                                    ) : (
                                        <video
                                            src={video.watermarked_video_url || ""}
                                            className="w-full h-full object-cover"
                                            controls
                                        />
                                    )}
                                </div>

                                <CardContent className="p-4">
                                    <h3 className="font-semibold truncate">
                                        {video.template?.name || "Özel Şablon"}
                                    </h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <Badge variant={video.status === 'PROCESSING' ? "secondary" : "default"}>
                                            {video.status === 'PROCESSING' ? 'Üretiliyor' : 'Tamamlandı'}
                                        </Badge>
                                        <span className="text-xs text-zinc-500">
                                            {new Date(video.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}