import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "images"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

function sanitizeFileName(fileName: string) {
    return fileName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.\-_]/g, "-")
        .replace(/-+/g, "-")
}

export async function uploadImageToSupabase(file: File, folder = "admin") {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error("Solo se permiten imagenes JPG, PNG o WEBP")
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("La imagen supera el tamano maximo de 5MB")
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