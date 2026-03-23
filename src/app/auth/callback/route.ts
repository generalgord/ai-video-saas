import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    // URL'den gelen 'next' parametresini al (yoksa varsayılan olarak /dashboard)
    const next = searchParams.get('next') ?? '/dashboard'

    // Next.js'in localhost sanmasını engelliyoruz, ngrok adresimizi zorluyoruz
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // ÇÖZÜM BURADA: request.url veya origin yerine kendi baseUrl'imizi kullanıyoruz
            return NextResponse.redirect(`${baseUrl}${next}`)
        }
    }

    // Hata durumunda da yine doğru adrese gönder
    return NextResponse.redirect(`${baseUrl}/login?error=auth-failed`)
}