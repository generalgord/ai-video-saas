import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientForm from "./ClientForm";

// Next.js 15'te params artık bir Promise'dir, asenkron olarak çözülmesi gerekir
export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    const template = await prisma.template.findUnique({
        where: { id: resolvedParams.id },
    });

    // Eğer URL'ye geçersiz bir ID yazılırsa şablonlar sayfasına geri at
    if (!template) {
        redirect("/dashboard/templates");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 mt-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                <p className="text-zinc-500 mt-2">{template.description}</p>
            </div>

            {/* Etkileşimli formu (Client Component) çağırıyoruz */}
            <ClientForm template={template} />
        </div>
    );
}