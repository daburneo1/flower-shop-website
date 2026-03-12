type CropArea = {
    x: number
    y: number
    width: number
    height: number
}

function createImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error) => reject(error))
        image.setAttribute("crossOrigin", "anonymous")
        image.src = src
    })
}

export async function getCroppedFile(
    imageSrc: string,
    crop: CropArea,
    fileName = "cropped.jpg",
) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")

    canvas.width = crop.width
    canvas.height = crop.height

    const ctx = canvas.getContext("2d")
    if (!ctx) {
        throw new Error("No se pudo inicializar el canvas")
    }

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height,
    )

    const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92),
    )

    if (!blob) {
        throw new Error("No se pudo generar la imagen recortada")
    }

    return new File([blob], fileName, { type: "image/jpeg" })
}