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

export function getStoragePathFromPublicUrl(url: string | null | undefined) {
    if (!url) return null

    try {
        const parsed = new URL(url)
        const marker = `/storage/v1/object/public/${bucketName}/`
        const index = parsed.pathname.indexOf(marker)

        if (index === -1) return null

        return decodeURIComponent(parsed.pathname.slice(index + marker.length))
    } catch {
        return null
    }
}

export async function deleteImageFromSupabaseByUrl(url: string | null | undefined) {
    const path = getStoragePathFromPublicUrl(url)
    if (!path) return

    const { error } = await supabase.storage.from(bucketName).remove([path])

    if (error) {
        throw new Error(error.message || "No se pudo eliminar la imagen anterior")
    }
}

export async function replaceImageInSupabase(params: {
    file: File
    folder?: string
    previousUrl?: string | null
}) {
    const { file, folder = "admin", previousUrl } = params
    const uploaded = await uploadImageToSupabase(file, folder)

    try {
        if (previousUrl && previousUrl !== uploaded.url) {
            await deleteImageFromSupabaseByUrl(previousUrl)
        }
    } catch {
        // Si falla la limpieza del archivo anterior, no rompemos el flujo principal.
    }

    return uploaded
}

export async function uploadImageToSupabase(file: File, folder = "admin") {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error("Solo se permiten imagenes JPG, PNG o WEBP")
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("La imagen supera el tamano maximo de 5MB")
    }

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
        throw new Error("Debes iniciar sesion para subir imagenes")
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
        if (
            uploadError.message?.toLowerCase().includes("row-level security") ||
            uploadError.message?.toLowerCase().includes("unauthorized")
        ) {
            throw new Error("No tienes permisos para subir imagenes")
        }

        throw new Error(uploadError.message || "No se pudo subir la imagen")
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return {
        path: filePath,
        url: data.publicUrl,
    }
}