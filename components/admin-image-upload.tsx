"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, Upload, X } from "lucide-react"
import { replaceImageInSupabase } from "@/lib/storage-upload"
import { ImageCropModal } from "@/components/image-crop-modal"

type AdminImageUploadProps = {
    label: string
    value: string
    onChange: (url: string) => void
    folder?: string
    cropAspect?: number | null
    previousValue?: string | null
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export function AdminImageUpload({
                                     label,
                                     value,
                                     onChange,
                                     folder = "admin",
                                     cropAspect = null,
                                     previousValue = null,
                                 }: AdminImageUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [pendingImageSrc, setPendingImageSrc] = useState("")
    const [pendingFileName, setPendingFileName] = useState("cropped.jpg")

    const uploadFile = async (file: File) => {
        try {
            setError("")
            setUploading(true)

            const result = await replaceImageInSupabase({
                file,
                folder,
                previousUrl: value || previousValue,
            })

            onChange(result.url)
            setPendingImageSrc("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al subir la imagen")
        } finally {
            setUploading(false)
        }
    }

    const handleFile = async (file: File) => {
        try {
            setError("")

            if (!file.type.startsWith("image/")) {
                setError("Solo se permiten imagenes")
                return
            }

            if (cropAspect) {
                const imageSrc = await readFileAsDataUrl(file)
                setPendingFileName(file.name || "cropped.jpg")
                setPendingImageSrc(imageSrc)
                return
            }

            await uploadFile(file)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo procesar la imagen")
        }
    }

    const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await handleFile(file)
        }
        e.target.value = ""
    }

    const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            await handleFile(file)
        }
    }

    return (
        <>
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">{label}</span>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onInputChange}
                />

                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault()
                        setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`rounded-sm border border-dashed p-4 transition-colors ${
                        dragging ? "border-primary bg-primary/5" : "border-border bg-background"
                    }`}
                >
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                        {value ? (
                            <div className="relative h-40 w-full overflow-hidden rounded-sm border border-border bg-muted">
                                <Image src={value} alt={label} fill className="object-contain" />
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Arrastra una imagen aqui o haz clic para seleccionarla
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Formatos permitidos: JPG, PNG, WEBP. Maximo 5MB.
                                </p>
                            </>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    inputRef.current?.click()
                                }}
                                disabled={uploading}
                                className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:bg-muted"
                            >
                                <Upload className="h-4 w-4" />
                                {uploading ? "Subiendo..." : "Seleccionar"}
                            </button>

                            {value && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onChange("")
                                    }}
                                    className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                    Quitar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {value && (
                    <p className="text-xs text-muted-foreground">
                        Imagen cargada correctamente.
                    </p>
                )}

                {error && (
                    <div className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                        {error}
                    </div>
                )}
            </div>

            {pendingImageSrc && cropAspect && (
                <ImageCropModal
                    imageSrc={pendingImageSrc}
                    fileName={pendingFileName}
                    aspect={cropAspect}
                    onCancel={() => setPendingImageSrc("")}
                    onConfirm={uploadFile}
                />
            )}
        </>
    )
}