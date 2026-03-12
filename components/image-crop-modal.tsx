"use client"

import React, { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { getCroppedFile } from "@/lib/image-crop"

type ImageCropModalProps = {
    imageSrc: string
    fileName?: string
    aspect?: number
    onCancel: () => void
    onConfirm: (file: File) => Promise<void> | void
}

export function ImageCropModal({
                                   imageSrc,
                                   fileName = "cropped.jpg",
                                   aspect = 1,
                                   onCancel,
                                   onConfirm,
                               }: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [loading, setLoading] = useState(false)

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels)
    }, [])

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return

        try {
            setLoading(true)
            const croppedFile = await getCroppedFile(imageSrc, croppedAreaPixels, fileName)
            await onConfirm(croppedFile)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-2xl rounded-sm border border-border bg-card p-6">
                <div className="mb-4">
                    <h2 className="font-serif text-xl font-bold text-foreground">Recortar imagen</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ajusta la imagen antes de subirla.
                    </p>
                </div>

                <div className="relative h-[420px] w-full overflow-hidden rounded-sm bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    <label className="text-sm text-foreground">Zoom</label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {loading ? "Procesando..." : "Recortar y subir"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}