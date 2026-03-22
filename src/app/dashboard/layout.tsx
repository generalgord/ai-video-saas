import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <header className="border-b bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">VideoSaaS</h1>
                <nav className="flex gap-4">
                    <Link href="/dashboard" className="text-sm font-medium hover:underline">Panel</Link>
                    <Link href="/dashboard/billing" className="text-sm font-medium text-zinc-500 hover:underline">Abonelik & Kredi</Link>
                </nav>
            </header>

            <main className="p-6 max-w-5xl mx-auto">
                {children}
            </main>
        </div>
    );
}