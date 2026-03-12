import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "images"

function sanitizeFileName(fileName: string) {
    return fileName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.\-_]/g, "-")
        .replace(/-+/g, "-")
}

export async function uploadImageToSupabase(file: File, folder = "admin") {
    if (!file.type.startsWith("image/")) {
        throw new Error("Solo se permiten imagenes")
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
    const safeBaseName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, ""))
    const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeBaseName}.${extension}`

    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
        })

    if (uploadError) {
        throw new Error(uploadError.message || "No se pudo subir la imagen")
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return {
        path: filePath,
        url: data.publicUrl,
    }
}