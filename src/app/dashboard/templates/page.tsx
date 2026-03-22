import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TemplatesPage() {
    const templates = await prisma.template.findMany({ where: { isActive: true } });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Bir Şablon Seçin</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link href={`/dashboard/generate/${template.id}`} className="w-full">
                                <Button className="w-full">Bu Şablonu Kullan</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}