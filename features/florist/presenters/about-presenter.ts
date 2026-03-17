import type { AboutParagraph, AboutSection, AboutStat } from "@/lib/types"

export interface PresentedAboutSection {
    title: string
    imageUrl: string | null
    imageAlt: string
    paragraphs: Array<Pick<AboutParagraph, "id" | "content">>
    stats: AboutStat[]
    contentClassName: string
}

export function presentAboutSection(about: AboutSection | null): PresentedAboutSection | null {
    if (!about) return null

    const paragraphs =
        about.paragraphs && about.paragraphs.length > 0
            ? about.paragraphs.map((paragraph) => ({
                id: paragraph.id,
                content: paragraph.content,
            }))
            : about.description || about.content
                ? [
                    {
                        id: "legacy",
                        content: about.description ?? about.content ?? "",
                    },
                ]
                : []

    return {
        title: about.title || "Sobre Nosotros",
        imageUrl: about.image_url ?? null,
        imageAlt: about.title || "Sobre nosotros",
        paragraphs,
        stats: about.stats ?? [],
        contentClassName: about.image_url ? "lg:w-1/2" : "max-w-2xl",
    }
}