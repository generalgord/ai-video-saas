'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        const origin = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL : '';

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        })
    }
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Tekrar Hoş Geldiniz</CardTitle>
                    <CardDescription className="text-zinc-500">
                        Hesabınıza giriş yapmak veya yeni kayıt oluşturmak için devam edin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Butonu */}
                    <Button variant="outline" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 h-11">
                        <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google ile devam et
                    </Button>

                    {/* Ayırıcı */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
                                Veya e-posta ile
                            </span>
                        </div>
                    </div>

                    {/* E-posta/Şifre Formu */}
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input id="email" type="email" placeholder="ornek@sirket.com" required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input id="password" type="password" required className="h-11" />
                        </div>
                        <Button className="w-full h-11 text-md" type="submit">
                            Giriş Yap / Kayıt Ol
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}