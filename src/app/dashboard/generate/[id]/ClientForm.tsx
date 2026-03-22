'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { generateVideoAction } from "@/actions/generate-video";
import { useRouter } from "next/navigation";

export default function ClientForm({ template }: { template: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Veritabanındaki required_inputs nesnesini döngüye sokabilmek için diziye çeviriyoruz
    const inputFields = template.required_inputs ? Object.entries(template.required_inputs) : [];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const userInputs = Object.fromEntries(formData.entries());

        // Yeni Server Action'ı çağırıyoruz
        const result = await generateVideoAction(template.id, userInputs);

        if (!result.success) {
            alert(result.error); // Kredi bittiyse hata verecek
            setIsLoading(false);
            return;
        }

        // Başarılıysa kullanıcıyı oluşturulan videonun detay sayfasına veya dashboard'a yönlendir
        alert("Videonuz sıraya alındı! 1 Kredi düşüldü.");
        router.push("/dashboard");
        // Yönlendirmeden sonra Next.js önbelleği yenilediği için Dashboard'da kredinin 1'e düştüğünü göreceğiz.
    };

    return (
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-6">
                    {inputFields.map(([key, label]) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="text-sm font-medium">
                                {String(label)}
                            </Label>
                            <Input
                                id={key}
                                name={key}
                                required
                                className="h-11"
                                placeholder={
                                    key === 'prompt' && template.id === 'travel-vlog-1'
                                        ? "Örn: Geçtiğimiz yıl yaptığım Azerbaycan gezisindeki unutulmaz anlar..."
                                        : `${String(label)} değerini girin...`
                                }
                            />
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 py-4 border-t">
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? "Videonuz Üretiliyor..." : "🚀 Videoyu Üret (1 Kredi)"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}