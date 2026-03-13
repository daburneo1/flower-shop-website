"use client"

import React, {useState, useEffect, useCallback} from "react"
import Link from "next/link"
import Image from "next/image"
import {useRouter} from "next/navigation"
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Phone,
    LogOut,
    Plus,
    Pencil,
    Trash2,
    X,
    Menu,
    ImageIcon,
    CreditCard,
    Info,
} from "lucide-react"
import {clearAdminSession, getAdminSession} from "@/lib/admin-auth"
import {adminRpc} from "@/lib/admin-rpc"
import {
    mapAboutRow,
    mapCategoryRow,
    mapFloristRow,
    mapMobilePaymentProviderRow,
    mapPaymentMethodRow,
    mapProductRow,
} from "@/lib/mappers"
import type {
    Florist,
    Category,
    Product,
    PaymentMethod,
    MobilePaymentProvider,
    AboutSection,
    AboutParagraph,
    AboutStat,
    ContactMethod,
    SocialLink,
} from "@/lib/types"
import {AdminImageUpload} from "@/components/admin-image-upload";

const floristId = process.env.NEXT_PUBLIC_FLORIST_ID ?? ""

type Tab = "dashboard" | "products" | "categories" | "about" | "contact" | "payments"

const sidebarItems: { key: Tab; label: string; icon: React.ElementType }[] = [
    {key: "dashboard", label: "Panel", icon: LayoutDashboard},
    {key: "products", label: "Productos", icon: Package},
    {key: "categories", label: "Categorias", icon: FolderTree},
    {key: "about", label: "Nosotros", icon: Info},
    {key: "contact", label: "Contacto", icon: Phone},
    {key: "payments", label: "Pagos / QR", icon: CreditCard},
]

/* ── Helpers ── */
function Field({label, id, children}: { label: string; id: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
            {children}
        </div>
    )
}

const inputCls = "rounded-sm border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"

const createTempId = () =>
    (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`)

const normalizeOrder = <T extends { sort_order: number }>(items: T[]) =>
    items.map((item, index) => ({...item, sort_order: index + 1}))

const parseCoordinate = (value: string): number | null => {
    const normalized = value.trim()
    if (!normalized) return null
    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : Number.NaN
}

const contactFieldDefs = [
    {key: "Direccion", label: "Dirección", placeholder: "Av. Principal #123, Centro Historico, Ciudad"},
    {key: "Telefono", label: "Teléfono", placeholder: "+593 988 774 455"},
    {key: "Email", label: "Email", placeholder: "contacto@jasamy.com"},
    {key: "WhatsApp", label: "WhatsApp (numero)", placeholder: "593988774455"},
    {
        key: "Horario",
        label: "Horario",
        placeholder: "Lun - Sab: 8:00 AM - 7:00 PM\nDom: 9:00 AM - 2:00 PM",
        multiline: true
    },
]

const socialFieldDefs = [
    {key: "facebook", label: "Facebook URL"},
    {key: "instagram", label: "Instagram URL"},
    {key: "tiktok", label: "TikTok URL"},
]

function ModalShell({title, onClose, children}: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-6">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-border bg-card p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-foreground">{title}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"
                            aria-label="Cerrar"><X className="h-5 w-5"/></button>
                </div>
                {children}
            </div>
        </div>
    )
}

function ConfirmDialog({title, message, onConfirm, onCancel}: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-6">
            <div className="w-full max-w-sm border border-border bg-card p-8">
                <h2 className="mb-2 font-serif text-lg font-bold text-foreground">{title}</h2>
                <p className="mb-6 text-sm text-muted-foreground">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onConfirm}
                            className="flex-1 rounded-sm bg-destructive py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Eliminar
                    </button>
                    <button onClick={onCancel}
                            className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}

function Thumb({src, alt}: { src: string | null; alt: string }) {
    return (
        <div className="relative h-10 w-10 overflow-hidden rounded-sm bg-muted">
            {src ? <Image src={src} alt={alt} fill className="object-cover"/> :
                <div className="flex h-full w-full items-center justify-center"><ImageIcon
                    className="h-4 w-4 text-muted-foreground"/></div>}
        </div>
    )
}

function SavedToast({show}: { show: boolean }) {
    if (!show) return null
    return (
        <div
            className="fixed bottom-6 right-6 z-[70] animate-in fade-in slide-in-from-bottom-4 rounded-sm border border-primary/30 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg">
            Cambios guardados
        </div>
    )
}

/* ── Category Modal ── */
function CategoryModal({category, onSave, onClose}: {
    category: Category | null;
    onSave: (d: { name: string; description: string; sort_order: number }) => void;
    onClose: () => void
}) {
    const [name, setName] = useState(category?.name ?? "")
    const [description, setDescription] = useState(category?.description ?? "")
    const [sortOrder, setSortOrder] = useState(category?.sort_order ?? category?.display_order ?? 1)
    return (
        <ModalShell title={category ? "Editar Categoria" : "Nueva Categoria"} onClose={onClose}>
            <form onSubmit={(e) => {
                e.preventDefault();
                onSave({name, description, sort_order: sortOrder})
            }} className="flex flex-col gap-4">
                <Field label="Nombre" id="cat-name"><input id="cat-name" type="text" value={name}
                                                           onChange={(e) => setName(e.target.value)}
                                                           className={inputCls} required/></Field>
                <Field label="Descripcion" id="cat-desc"><textarea id="cat-desc" rows={2} value={description}
                                                                   onChange={(e) => setDescription(e.target.value)}
                                                                   className={inputCls}/></Field>
                <Field label="Orden" id="cat-order"><input id="cat-order" type="number" min="1" value={sortOrder}
                                                           onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 1)}
                                                           className={inputCls}/></Field>
                <div className="mt-2 flex gap-3">
                    <button type="submit"
                            className="flex-1 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{category ? "Guardar" : "Crear"}</button>
                    <button type="button" onClick={onClose}
                            className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancelar
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}

/* ── Product Modal ── */
function ProductModal({product, categories, onSave, onClose}: {
    product: Product | null;
    categories: Category[];
    onSave: (d: { name: string; description: string; price: number; category_id: string; image_url: string }) => void;
    onClose: () => void
}) {
    const [name, setName] = useState(product?.name ?? "")
    const [description, setDescription] = useState(product?.description ?? "")
    const [price, setPrice] = useState(product?.price?.toString() ?? "")
    const [categoryId, setCategoryId] = useState(product?.category_id ?? (categories[0]?.id ?? ""))
    const [image, setImage] = useState(product?.image_url ?? "")
    return (
        <ModalShell title={product ? "Editar Producto" : "Nuevo Producto"} onClose={onClose}>
            <form onSubmit={(e) => {
                e.preventDefault();
                onSave({name, description, price: Number.parseFloat(price), category_id: categoryId, image_url: image})
            }} className="flex flex-col gap-4">
                <Field label="Nombre" id="prod-name"><input id="prod-name" type="text" value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className={inputCls} required/></Field>
                <Field label="Descripcion" id="prod-desc"><textarea id="prod-desc" rows={2} value={description}
                                                                    onChange={(e) => setDescription(e.target.value)}
                                                                    className={inputCls}/></Field>
                <Field label="Categoria" id="prod-cat">
                    <select id="prod-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                            className={inputCls} required>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>
                <Field label="Precio ($)" id="prod-price"><input id="prod-price" type="number" step="0.01" min="0"
                                                                 value={price}
                                                                 onChange={(e) => setPrice(e.target.value)}
                                                                 className={inputCls} required/></Field>
                <AdminImageUpload
                    label="Imagen del producto"
                    value={image}
                    onChange={setImage}
                    folder="products"
                    cropAspect={5 / 4}
                />
                <div className="mt-2 flex gap-3">
                    <button type="submit"
                            className="flex-1 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{product ? "Guardar" : "Agregar"}</button>
                    <button type="button" onClick={onClose}
                            className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancelar
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}

/* ── Provider Modal (QR) ── */
function ProviderModal({provider, paymentMethods, onSave, onClose}: {
    provider: MobilePaymentProvider | null;
    paymentMethods: PaymentMethod[];
    onSave: (d: { name: string; qr_code_url: string; payment_method_id: string }) => void;
    onClose: () => void
}) {
    const [name, setName] = useState(provider?.name ?? "")
    const [qrUrl, setQrUrl] = useState(provider?.qr_code_url ?? "")
    const [methodId, setMethodId] = useState(provider?.payment_method_id ?? (paymentMethods[0]?.id ?? ""))
    const hasMethods = paymentMethods.length > 0
    return (
        <ModalShell title={provider ? "Editar Proveedor QR" : "Nuevo Proveedor QR"} onClose={onClose}>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (hasMethods) onSave({name, qr_code_url: qrUrl, payment_method_id: methodId})
            }} className="flex flex-col gap-4">
                {!hasMethods && (
                    <div
                        className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                        Primero crea un metodo de pago de tipo "Pago movil".
                    </div>
                )}
                <Field label="Nombre" id="prov-name"><input id="prov-name" type="text" value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className={inputCls} required/></Field>
                <Field label="Metodo de pago" id="prov-method">
                    <select id="prov-method" value={methodId} onChange={(e) => setMethodId(e.target.value)}
                            className={inputCls} required disabled={!hasMethods}>
                        {paymentMethods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </Field>
                <AdminImageUpload
                    label="Imagen QR"
                    value={qrUrl}
                    onChange={setQrUrl}
                    folder="qr"
                    cropAspect={1}
                />
                <div className="mt-2 flex gap-3">
                    <button type="submit"
                            className="flex-1 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            disabled={!hasMethods}>{provider ? "Guardar" : "Agregar"}</button>
                    <button type="button" onClick={onClose}
                            className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancelar
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}

/* ── Payment Method Modal ── */
function PaymentMethodModal({method, onSave, onClose}: {
    method: PaymentMethod | null;
    onSave: (d: { code: string; name: string; description: string; sort_order: number; active: boolean }) => void;
    onClose: () => void
}) {
    const [code, setCode] = useState(method?.code ?? "CASH")
    const [name, setName] = useState(method?.name ?? "")
    const [description, setDescription] = useState(method?.description ?? "")
    const [sortOrder, setSortOrder] = useState(method?.sort_order ?? method?.display_order ?? 1)
    const [active, setActive] = useState(method?.is_active ?? method?.active ?? true)

    const handleCodeChange = (value: string) => {
        setCode(value)
        if (!method) {
            if (value === "TRANSFER") setName("Transferencia")
            else if (value === "CASH") setName("Efectivo")
            else if (value === "MOBILE_PAY") setName("Pago movil")
        }
    }

    return (
        <ModalShell title={method ? "Editar Metodo de pago" : "Nuevo Metodo de pago"} onClose={onClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSave({code, name, description, sort_order: sortOrder, active})
                }}
                className="flex flex-col gap-4"
            >
                <Field label="Tipo" id="pm-code">
                    <select id="pm-code" value={code} onChange={(e) => handleCodeChange(e.target.value)}
                            className={inputCls} required>
                        <option value="TRANSFER">Transferencia</option>
                        <option value="CASH">Efectivo</option>
                        <option value="MOBILE_PAY">Pago movil</option>
                    </select>
                </Field>
                <Field label="Nombre" id="pm-name">
                    <input id="pm-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                           className={inputCls} required/>
                </Field>
                <Field label="Descripcion" id="pm-desc">
                    <textarea id="pm-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                              className={inputCls}/>
                </Field>
                <Field label="Orden" id="pm-order">
                    <input id="pm-order" type="number" min="1" value={sortOrder}
                           onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 1)}
                           className={inputCls}/>
                </Field>
                <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)}/>
                    Activo
                </label>
                <div className="mt-2 flex gap-3">
                    <button type="submit"
                            className="flex-1 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{method ? "Guardar" : "Agregar"}</button>
                    <button type="button" onClick={onClose}
                            className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancelar
                    </button>
                </div>
            </form>
        </ModalShell>
    )
}

/* ════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════ */
export default function AdminDashboardPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>("dashboard")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showPassModal, setShowPassModal] = useState(false)
    const [oldPass, setOldPass] = useState("")
    const [newPass, setNewPass] = useState("")
    const [passError, setPassError] = useState("")

    // Data
    const [florist, setFlorist] = useState<Florist | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [providers, setProviders] = useState<MobilePaymentProvider[]>([])
    const [about, setAbout] = useState<AboutSection | null>(null)
    const [contactMethods, setContactMethods] = useState<ContactMethod[]>([])
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
    const [latitudeInput, setLatitudeInput] = useState("")
    const [longitudeInput, setLongitudeInput] = useState("")

    // Modals
    const [catModal, setCatModal] = useState<{ open: boolean; editing: Category | null }>({open: false, editing: null})
    const [prodModal, setProdModal] = useState<{ open: boolean; editing: Product | null }>({open: false, editing: null})
    const [providerModal, setProviderModal] = useState<{
        open: boolean;
        editing: MobilePaymentProvider | null
    }>({open: false, editing: null})
    const [paymentModal, setPaymentModal] = useState<{ open: boolean; editing: PaymentMethod | null }>({
        open: false,
        editing: null
    })
    const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [actionError, setActionError] = useState("")

    const flash = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000)
    }

    // ── Load data ──
    const loadData = useCallback(async () => {
        try {
            const [
                floristResult,
                categoriesResult,
                methodsResult,
                providersResult,
                aboutResult,
                aboutParagraphsResult,
                aboutStatsResult,
                contactResult,
                socialResult,
            ] = await Promise.all([
                adminRpc<Record<string, unknown> | Array<Record<string, unknown>>>("sp_get_florist", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_categories", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_payment_methods", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_mobile_payment_providers", {p_florist_id: floristId}),
                adminRpc<Record<string, unknown> | Array<Record<string, unknown>>>("sp_get_about_section", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_about_paragraphs", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_about_stats", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_contact_methods", {p_florist_id: floristId}),
                adminRpc<Array<Record<string, unknown>>>("sp_list_social_links", {p_florist_id: floristId}),
            ])

            const floristRow =
                "data" in floristResult
                    ? Array.isArray(floristResult.data)
                        ? floristResult.data[0]
                        : floristResult.data
                    : null
            const categoriesRows = "data" in categoriesResult ? categoriesResult.data : []
            const methodsRows = "data" in methodsResult ? methodsResult.data : []
            const providersRows = "data" in providersResult ? providersResult.data : []

            const mappedFlorist = floristRow ? mapFloristRow(floristRow as Record<string, unknown>, floristId) : null
            const mappedCategories = (categoriesRows ?? []).map((row: Record<string, unknown>) =>
                mapCategoryRow(row, floristId),
            )

            const productsByCategory = await Promise.all(
                mappedCategories.map(async (category) => {
                    const result = await adminRpc<Array<Record<string, unknown>>>("sp_list_products", {
                        p_florist_id: floristId,
                        p_category_id: category.id,
                    })
                    const rows = "data" in result ? result.data : []
                    return (rows ?? []).map((row: Record<string, unknown>) =>
                        mapProductRow(row, floristId, category.id, category.name),
                    )
                }),
            )

            const mappedMethods = (methodsRows ?? []).map((row: Record<string, unknown>) =>
                mapPaymentMethodRow(row, floristId),
            )
            const mappedProviders = (providersRows ?? []).map((row: Record<string, unknown>) =>
                mapMobilePaymentProviderRow(row, floristId),
            )

            setFlorist(mappedFlorist)
            setLatitudeInput(mappedFlorist?.latitude != null ? String(mappedFlorist.latitude) : "")
            setLongitudeInput(mappedFlorist?.longitude != null ? String(mappedFlorist.longitude) : "")
            setCategories(mappedCategories)
            setProducts(productsByCategory.flat() as Product[])
            setPaymentMethods(
                mappedMethods.map((method) =>
                    method.code?.toUpperCase() === "MOBILE_PAY"
                        ? {...method, providers: mappedProviders}
                        : method,
                ),
            )
            setProviders(mappedProviders)
            const aboutRow =
                "data" in aboutResult
                    ? Array.isArray(aboutResult.data)
                        ? aboutResult.data[0]
                        : aboutResult.data
                    : null
            const aboutParagraphsRows = "data" in aboutParagraphsResult ? aboutParagraphsResult.data : []
            const aboutStatsRows = "data" in aboutStatsResult ? aboutStatsResult.data : []

            const baseAbout = aboutRow
                ? mapAboutRow(aboutRow as Record<string, unknown>, floristId)
                : {
                    id: floristId,
                    florist_id: floristId,
                    title: "",
                    description: "",
                    content: "",
                    image_url: "",
                    years_experience: null,
                    products_count: null,
                    handmade_percentage: null,
                    created_at: null,
                    paragraphs: [],
                    stats: [],
                }
            const mappedParagraphs: AboutParagraph[] = (aboutParagraphsRows ?? []).map((row: Record<string, unknown>) => ({
                id: String(row.id),
                florist_id: floristId,
                content: String(row.content ?? ""),
                sort_order: Number(row.sort_order ?? 1),
                created_at: (row.created_at ?? null) as string | null,
            }))
            const mappedStats: AboutStat[] = (aboutStatsRows ?? []).map((row: Record<string, unknown>) => ({
                id: String(row.id),
                florist_id: floristId,
                label: String(row.label ?? ""),
                value: String(row.value ?? ""),
                sort_order: Number(row.sort_order ?? 1),
                created_at: (row.created_at ?? null) as string | null,
            }))
            const fallbackParagraphs =
                baseAbout?.description || baseAbout?.content
                    ? [
                        {
                            id: "legacy",
                            florist_id: floristId,
                            content: String(baseAbout?.description ?? baseAbout?.content ?? ""),
                            sort_order: 1,
                        },
                    ]
                    : []
            setAbout({
                ...baseAbout,
                paragraphs: mappedParagraphs.length > 0 ? mappedParagraphs : fallbackParagraphs,
                stats: mappedStats.length > 0 ? mappedStats : baseAbout.stats,
            })
            const contactRows = "data" in contactResult ? contactResult.data : []
            const socialRows = "data" in socialResult ? socialResult.data : []

            const mappedContacts: ContactMethod[] = (contactRows ?? []).map((row: Record<string, unknown>) => ({
                id: String(row.id),
                florist_id: floristId,
                type: String(row.type ?? ""),
                value: String(row.value ?? ""),
                icon: (row.icon ?? null) as string | null,
                position: (row.position ?? null) as number | null,
                sort_order: (row.position ?? null) as number | null,
                created_at: (row.created_at ?? null) as string | null,
            }))
            const mappedSocials: SocialLink[] = (socialRows ?? []).map((row: Record<string, unknown>) => ({
                id: String(row.id),
                florist_id: floristId,
                platform: String(row.platform ?? ""),
                url: String(row.url ?? ""),
                icon: (row.icon ?? null) as string | null,
                display_order: (row.display_order ?? null) as number | null,
                sort_order: (row.display_order ?? null) as number | null,
                created_at: (row.created_at ?? null) as string | null,
            }))

            setContactMethods(mappedContacts)
            setSocialLinks(mappedSocials)
            setIsLoading(false)
        } catch {
            setActionError("No se pudieron cargar los datos del panel.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        const session = getAdminSession()
        if (!session || session.floristId !== floristId) {
            router.replace("/admin")
            return
        }

        void loadData()
    }, [router, loadData])

    // ── Category CRUD ──
    const saveCategory = async (data: { name: string; description: string; sort_order: number }) => {
        try {
            setIsSaving(true)
            setActionError("")
            await adminRpc("sp_upsert_category", {
                p_florist_id: floristId,
                p_category_id: catModal.editing?.id ?? null,
                p_name: data.name,
                p_description: data.description,
                p_sort_order: data.sort_order,
            })
            setCatModal({open: false, editing: null})
            flash()
            await loadData()
        } catch {
            setActionError("No se pudo guardar la categoria.")
        } finally {
            setIsSaving(false)
        }
    }

    const deleteCategory = async (id: string) => {
        const result = await adminRpc<Array<{ success: boolean; message: string }>>("sp_delete_category", {
            p_category_id: id,
        })

        if ("error" in result) {
            alert("Error al eliminar la categoría.")
            return
        }

        const row = Array.isArray(result.data) ? result.data[0] : result.data
        if (!row?.success) {
            alert(row?.message ?? "No se puede eliminar la categoría.")
            return
        }

        setConfirmDelete(null)
        flash()
        loadData()
    }

    // ── Product CRUD ──
    const saveProduct = async (data: { name: string; description: string; price: number; category_id: string; image_url: string }) => {
        try {
            setIsSaving(true)
            setActionError("")

            await adminRpc("sp_upsert_product", {
                p_florist_id: floristId,
                p_product_id: prodModal.editing?.id ?? null,
                p_category_id: data.category_id,
                p_name: data.name,
                p_description: data.description,
                p_price: data.price,
                p_image_url: data.image_url,
            })

            setProdModal({ open: false, editing: null })
            flash()
            await loadData()
        } catch {
            setActionError("No se pudo guardar el producto.")
        } finally {
            setIsSaving(false)
        }
    }

    const deleteProduct = async (id: string) => {
        try {
            setIsSaving(true)
            setActionError("")

            const result = await adminRpc<Array<{ success: boolean; message?: string }> | { success: boolean; message?: string }>("sp_delete_product", {
                p_product_id: id,
            })

            if ("error" in result) {
                alert("Error al eliminar el producto.")
                return
            }

            const row = Array.isArray(result.data) ? result.data[0] : result.data
            if (!row?.success) {
                alert(row?.message ?? "No se puede eliminar el producto.")
                return
            }

            setConfirmDelete(null)
            flash()
            await loadData()
        } finally {
            setIsSaving(false)
        }
    }

    // ── Provider CRUD ──
    const saveProvider = async (data: { name: string; qr_code_url: string; payment_method_id: string }) => {
        try {
            setIsSaving(true)
            setActionError("")
            await adminRpc("sp_upsert_mobile_payment_provider", {
                p_florist_id: floristId,
                p_provider_id: providerModal.editing?.id ?? null,
                p_payment_method_id: data.payment_method_id,
                p_name: data.name,
                p_qr_image_url: data.qr_code_url,
                p_sort_order: providerModal.editing?.sort_order ?? 1,
            })
            setProviderModal({open: false, editing: null})
            flash()
            await loadData()
        } catch {
            setActionError("No se pudo guardar el proveedor.")
        } finally {
            setIsSaving(false)
        }
    }

    const deleteProvider = async (id: string) => {
        const result = await adminRpc<Array<{ success: boolean; message?: string }> | {
            success: boolean;
            message?: string
        }>("sp_delete_provider", {
            p_provider_id: id,
        })
        if ("error" in result) {
            alert("Error al eliminar el proveedor.")
            return
        }
        const row = Array.isArray(result.data) ? result.data[0] : result.data
        if (!row?.success) {
            alert(row?.message ?? "No se puede eliminar el proveedor.")
            return
        }
        setConfirmDelete(null)
        flash()
        loadData()
    }

    // ── Payment Method CRUD ──
    const savePaymentMethod = async (data: {
        code: string;
        name: string;
        description: string;
        sort_order: number;
        active: boolean
    }) => {
        try {
            setIsSaving(true)
            setActionError("")
            await adminRpc("sp_upsert_payment_method", {
                p_florist_id: floristId,
                p_payment_method_id: paymentModal.editing?.id ?? null,
                p_code: data.code,
                p_name: data.name,
                p_description: data.description,
                p_icon: null,
                p_active: data.active,
                p_sort_order: data.sort_order,
            })
            setPaymentModal({open: false, editing: null})
            flash()
            await loadData()
        } catch {
            setActionError("No se pudo guardar el metodo de pago.")
        } finally {
            setIsSaving(false)
        }
    }

    const deletePaymentMethod = async (id: string) => {
        const result = await adminRpc<Array<{ success: boolean; message?: string }> | {
            success: boolean;
            message?: string
        }>("sp_delete_payment_method", {
            p_payment_method_id: id,
        })
        if ("error" in result) {
            alert("Error al eliminar el metodo de pago.")
            return
        }
        const row = Array.isArray(result.data) ? result.data[0] : result.data
        if (!row?.success) {
            alert(row?.message ?? "No se puede eliminar el metodo de pago.")
            return
        }
        setConfirmDelete(null)
        flash()
        loadData()
    }

    // ── About save ──
    const saveAbout = async () => {
        if (!about) return
        try {
            setIsSaving(true)
            setActionError("")
            const paragraphPayload = (about.paragraphs ?? [])
                .map((p, index) => ({
                    content: p.content.trim(),
                    sort_order: index + 1,
                }))
                .filter((p) => p.content.length > 0)

            const statsPayload = (about.stats ?? [])
                .map((s, index) => ({
                    label: s.label.trim(),
                    value: s.value.trim(),
                    sort_order: index + 1,
                }))
                .filter((s) => s.label.length > 0 && s.value.length > 0)

            await adminRpc("sp_upsert_about_section", {
                p_florist_id: floristId,
                p_title: about.title ?? null,
                p_content: paragraphPayload.length > 0 ? paragraphPayload.map((p) => p.content).join("\n\n") : (about.description ?? about.content ?? null),
                p_image_url: about.image_url ?? null,
            })

            await adminRpc("sp_replace_about_paragraphs", {
                p_florist_id: floristId,
                p_items: paragraphPayload,
            })

            await adminRpc("sp_replace_about_stats", {
                p_florist_id: floristId,
                p_items: statsPayload,
            })
            flash()
            await loadData()
        } catch {
            setActionError("No se pudo guardar la seccion Nosotros.")
        } finally {
            setIsSaving(false)
        }
    }

    const addParagraph = () => {
        if (!about) return
        const next: AboutParagraph[] = [
            ...(about.paragraphs ?? []),
            {id: createTempId(), florist_id: floristId, content: "", sort_order: (about.paragraphs?.length ?? 0) + 1},
        ]
        setAbout({...about, paragraphs: next})
    }

    const updateParagraph = (index: number, value: string) => {
        if (!about) return
        const next = [...(about.paragraphs ?? [])]
        next[index] = {...next[index], content: value}
        setAbout({...about, paragraphs: next})
    }

    const removeParagraph = (id: string) => {
        if (!about) return
        const next = normalizeOrder((about.paragraphs ?? []).filter((p) => p.id !== id))
        setAbout({...about, paragraphs: next})
    }

    const addStat = () => {
        if (!about) return
        const next: AboutStat[] = [
            ...(about.stats ?? []),
            {
                id: createTempId(),
                florist_id: floristId,
                label: "",
                value: "",
                sort_order: (about.stats?.length ?? 0) + 1
            },
        ]
        setAbout({...about, stats: next})
    }

    const updateStat = (index: number, patch: Partial<AboutStat>) => {
        if (!about) return
        const next = [...(about.stats ?? [])]
        next[index] = {...next[index], ...patch}
        setAbout({...about, stats: next})
    }

    const removeStat = (id: string) => {
        if (!about) return
        const next = normalizeOrder((about.stats ?? []).filter((s) => s.id !== id))
        setAbout({...about, stats: next})
    }

    // ── Contact save ──
    const saveContact = async () => {
        try {
            setIsSaving(true)
            setActionError("")

            const parsedLatitude = parseCoordinate(latitudeInput)
            const parsedLongitude = parseCoordinate(longitudeInput)

            if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
                setActionError("Las coordenadas deben ser numeros validos.")
                return
            }

            if (parsedLatitude != null && (parsedLatitude < -90 || parsedLatitude > 90)) {
                setActionError("La latitud debe estar entre -90 y 90.")
                return
            }

            if (parsedLongitude != null && (parsedLongitude < -180 || parsedLongitude > 180)) {
                setActionError("La longitud debe estar entre -180 y 180.")
                return
            }

            const locationResult = await adminRpc<Array<{ success: boolean; message?: string }> | {
                success: boolean;
                message?: string
            }>("sp_upsert_florist_location", {
                p_florist_id: floristId,
                p_latitude: parsedLatitude,
                p_longitude: parsedLongitude,
            })

            if ("error" in locationResult) {
                setActionError("No se pudo guardar la ubicacion del mapa.")
                return
            }

            const locationRow = Array.isArray(locationResult.data) ? locationResult.data[0] : locationResult.data
            if (locationRow && locationRow.success === false) {
                setActionError(locationRow.message ?? "No se pudo guardar la ubicacion del mapa.")
                return
            }

            const contactItems = contactFieldDefs
                .map((field, index) => {
                    const value = (contactMethods.find((cm) => cm.type?.toLowerCase() === field.key.toLowerCase())?.value ?? "").trim()
                    return value.length > 0
                        ? {
                            type: field.key,
                            value,
                            icon: null,
                            position: index + 1,
                        }
                        : null
                })
                .filter(Boolean)

            const socialItems = socialFieldDefs
                .map((field, index) => {
                    const url = (socialLinks.find((sl) => sl.platform?.toLowerCase() === field.key)?.url ?? "").trim()
                    return url.length > 0
                        ? {
                            platform: field.key,
                            url,
                            icon: null,
                            display_order: index + 1,
                        }
                        : null
                })
                .filter(Boolean)

            await adminRpc("sp_replace_contact_methods", {
                p_florist_id: floristId,
                p_items: contactItems,
            })

            await adminRpc("sp_replace_social_links", {
                p_florist_id: floristId,
                p_items: socialItems,
            })
            flash()
            await loadData()
        } catch {
            setActionError("No se pudo guardar el contacto.")
        } finally {
            setIsSaving(false)
        }
    }

    const getContactValue = (key: string) =>
        contactMethods.find((cm) => cm.type?.toLowerCase() === key.toLowerCase())?.value ?? ""

    const updateContactValue = (key: string, value: string) => {
        const index = contactMethods.findIndex((cm) => cm.type?.toLowerCase() === key.toLowerCase())
        const position = contactFieldDefs.findIndex((f) => f.key.toLowerCase() === key.toLowerCase()) + 1
        if (index >= 0) {
            const copy = [...contactMethods]
            copy[index] = {...copy[index], type: key, value, position}
            setContactMethods(copy)
            return
        }
        setContactMethods([
            ...contactMethods,
            {id: createTempId(), florist_id: floristId, type: key, value, icon: null, position},
        ])
    }

    const getSocialUrl = (key: string) =>
        socialLinks.find((sl) => sl.platform?.toLowerCase() === key.toLowerCase())?.url ?? ""

    const updateSocialUrl = (key: string, url: string) => {
        const index = socialLinks.findIndex((sl) => sl.platform?.toLowerCase() === key.toLowerCase())
        const displayOrder = socialFieldDefs.findIndex((f) => f.key === key) + 1
        if (index >= 0) {
            const copy = [...socialLinks]
            copy[index] = {...copy[index], platform: key, url, display_order: displayOrder}
            setSocialLinks(copy)
            return
        }
        setSocialLinks([
            ...socialLinks,
            {id: createTempId(), florist_id: floristId, platform: key, url, icon: null, display_order: displayOrder},
        ])
    }

    // ── Logout ──
    const handleLogout = async () => {
        clearAdminSession()
        router.replace("/admin")
    }

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPassError("")
        const session = getAdminSession()
        if (!session) {
            setPassError("Sesion no valida")
            return
        }
        const result = await adminRpc<Array<{ ok: boolean }> | { ok: boolean }>("sp_admin_change_password", {
            p_florist_id: floristId,
            p_email: session.email,
            p_old_password: oldPass,
            p_new_password: newPass,
        })
        if ("error" in result) {
            setPassError("No se pudo cambiar la contrasena")
            return
        }
        const row = Array.isArray(result.data) ? result.data[0] : result.data
        if (!row?.ok) {
            setPassError("No se pudo cambiar la contrasena")
            return
        }
        setShowPassModal(false)
        setOldPass("")
        setNewPass("")
    }

    const getCategoryName = (cid: string) => categories.find((c) => c.id === cid)?.name ?? "Sin categoria"
    const getProductCount = (cid: string) => products.filter((p) => p.category_id === cid).length

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            <SavedToast show={saved}/>

            {sidebarOpen &&
                <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)}
                     role="button" tabIndex={-1} aria-label="Cerrar menu" onKeyDown={() => {
                }}/>}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                    <Link href="/" className="flex flex-col">
                        <span
                            className="font-serif text-xl font-bold tracking-wide text-primary">{florist?.name ?? "Admin"}</span>
                        <span className="text-xs text-muted-foreground">Administracion</span>
                    </Link>
                    <button className="text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(false)}
                            aria-label="Cerrar"><X className="h-5 w-5"/></button>
                </div>
                <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                    {sidebarItems.map((item) => (
                        <button key={item.key} onClick={() => {
                            setActiveTab(item.key);
                            setSidebarOpen(false)
                        }}
                                className={`flex items-center gap-3 rounded-sm px-4 py-2.5 text-sm transition-colors ${activeTab === item.key ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"}`}
                        >
                            <item.icon className="h-4 w-4"/>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="border-t border-border px-3 py-4">
                    <button onClick={() => setShowPassModal(true)}
                            className="mb-2 flex w-full items-center gap-3 rounded-sm px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted">Cambiar
                        contrasena
                    </button>
                    <button onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-sm px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted">
                        <LogOut className="h-4 w-4"/>Cerrar Sesion
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex flex-1 flex-col">
                <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-4">
                    <button className="text-foreground lg:hidden" onClick={() => setSidebarOpen(true)}
                            aria-label="Abrir menu"><Menu className="h-5 w-5"/></button>
                    <h1 className="font-serif text-lg font-semibold text-foreground">{sidebarItems.find((i) => i.key === activeTab)?.label}</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-6">

                    {/* ── Dashboard ── */}
                    {activeTab === "dashboard" && (
                        <div className="flex flex-col gap-8">
                            <div className="border border-accent/30 bg-accent/5 p-6">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Bienvenido al panel
                                    de {florist?.name}</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Todos los datos se gestionan desde esta interfaz y se guardan directamente en la
                                    base de datos.
                                </p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    {label: "Productos", value: products.length, icon: Package},
                                    {label: "Categorias", value: categories.length, icon: FolderTree},
                                    {label: "Proveedores QR", value: providers.length, icon: CreditCard},
                                ].map((card) => (
                                    <div key={card.label}
                                         className="flex items-start gap-4 border border-border bg-card p-6">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/10">
                                            <card.icon className="h-5 w-5 text-primary"/>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                                            <p className="text-sm text-muted-foreground">{card.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Products ── */}
                    {activeTab === "products" && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{products.length} productos</p>
                                <button onClick={() => setProdModal({open: true, editing: null})}
                                        className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4"/>Nuevo Producto
                                </button>
                            </div>
                            <div className="overflow-x-auto border border-border">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Img</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id} className="border-b border-border/50 last:border-0">
                                            <td className="px-4 py-3"><Thumb src={p.image_url ?? null} alt={p.name}/>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.category_name || getCategoryName(p.category_id ?? '')}</td>
                                            <td className="px-4 py-3 text-right text-foreground">${p.price.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setProdModal({open: true, editing: p})}
                                                            className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            aria-label="Editar"><Pencil className="h-4 w-4"/></button>
                                                    <button onClick={() => setConfirmDelete({
                                                        type: "product",
                                                        id: p.id,
                                                        name: p.name
                                                    })}
                                                            className="rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                            aria-label="Eliminar"><Trash2 className="h-4 w-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Categories ── */}
                    {activeTab === "categories" && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{categories.length} categorias</p>
                                <button onClick={() => setCatModal({open: true, editing: null})}
                                        className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4"/>Nueva Categoria
                                </button>
                            </div>
                            <div className="overflow-x-auto border border-border">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripcion</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Productos</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {categories.map((c) => (
                                        <tr key={c.id} className="border-b border-border/50 last:border-0">
                                            <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                                            <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{c.description}</td>
                                            <td className="px-4 py-3 text-right text-foreground">{getProductCount(c.id)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setCatModal({open: true, editing: c})}
                                                            className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            aria-label="Editar"><Pencil className="h-4 w-4"/></button>
                                                    <button onClick={() => setConfirmDelete({
                                                        type: "category",
                                                        id: c.id,
                                                        name: c.name
                                                    })}
                                                            className="rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                            aria-label="Eliminar"><Trash2 className="h-4 w-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "about" && about && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-6 border border-border bg-card p-8">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Seccion "Nosotros"</h2>
                                <Field label="Titulo" id="about-title">
                                    <input id="about-title" type="text" value={about.title ?? ""}
                                           onChange={(e) => setAbout({...about, title: e.target.value})}
                                           className={inputCls}/>
                                </Field>
                                <AdminImageUpload
                                    label="Imagen de la sección"
                                    value={about.image_url ?? ""}
                                    onChange={(url) => setAbout({...about, image_url: url})}
                                    folder="about"
                                    cropAspect={null}
                                />
                            </div>

                            <div className="flex flex-col gap-6 border border-border bg-card p-8">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Parrafos de la
                                    seccion</h2>
                                {(about.paragraphs ?? []).length === 0 && (
                                    <p className="text-sm text-muted-foreground">Agrega parrafos para mostrar en la
                                        seccion Nosotros.</p>
                                )}
                                <div className="flex flex-col gap-4">
                                    {(about.paragraphs ?? []).map((paragraph, index) => (
                                        <div key={paragraph.id} className="flex gap-3">
                      <textarea
                          rows={3}
                          value={paragraph.content}
                          onChange={(e) => updateParagraph(index, e.target.value)}
                          className={`${inputCls} flex-1`}
                      />
                                            <button
                                                type="button"
                                                onClick={() => removeParagraph(paragraph.id)}
                                                className="self-start rounded-sm p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                aria-label="Eliminar parrafo"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addParagraph}
                                    className="self-start text-sm text-primary hover:text-primary/80"
                                >
                                    + Agregar parrafo
                                </button>
                            </div>

                            <div className="flex flex-col gap-6 border border-border bg-card p-8">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Estadisticas</h2>
                                {(about.stats ?? []).length === 0 && (
                                    <p className="text-sm text-muted-foreground">Agrega cifras o hitos que quieres
                                        destacar.</p>
                                )}
                                <div className="flex flex-col gap-4">
                                    {(about.stats ?? []).map((stat, index) => (
                                        <div key={stat.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <input
                                                type="text"
                                                value={stat.value}
                                                onChange={(e) => updateStat(index, {value: e.target.value})}
                                                placeholder="15+"
                                                className={`${inputCls} sm:w-32`}
                                            />
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => updateStat(index, {label: e.target.value})}
                                                placeholder="Anios de experiencia"
                                                className={`${inputCls} flex-1`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeStat(stat.id)}
                                                className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                aria-label="Eliminar estadistica"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addStat}
                                    className="self-start text-sm text-primary hover:text-primary/80"
                                >
                                    + Agregar estadistica
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {actionError && <p className="text-sm text-destructive">{actionError}</p>}
                                <button onClick={saveAbout} disabled={isSaving}
                                        className="self-start rounded-sm bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                                    {isSaving ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Contact ── */}
                    {activeTab === "contact" && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-6 border border-border bg-card p-8">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Ubicacion en mapa</h2>
                                <p className="text-sm text-muted-foreground">
                                    Agrega las coordenadas para mostrar la ubicacion exacta en Google Maps.
                                </p>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Field label="Latitud" id="florist-latitude">
                                        <input
                                            id="florist-latitude"
                                            type="text"
                                            value={latitudeInput}
                                            onChange={(e) => setLatitudeInput(e.target.value)}
                                            placeholder="-0.180653"
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Longitud" id="florist-longitude">
                                        <input
                                            id="florist-longitude"
                                            type="text"
                                            value={longitudeInput}
                                            onChange={(e) => setLongitudeInput(e.target.value)}
                                            placeholder="-78.467834"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 border border-border bg-card p-8">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Contacto</h2>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {contactFieldDefs.map((field, index) => (
                                        <div key={field.key} className={field.multiline ? "sm:col-span-2" : ""}>
                                            <Field label={field.label} id={`contact-${index}`}>
                                                {field.multiline ? (
                                                    <textarea
                                                        id={`contact-${index}`}
                                                        rows={3}
                                                        value={getContactValue(field.key)}
                                                        onChange={(e) => updateContactValue(field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className={inputCls}
                                                    />
                                                ) : (
                                                    <input
                                                        id={`contact-${index}`}
                                                        type="text"
                                                        value={getContactValue(field.key)}
                                                        onChange={(e) => updateContactValue(field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className={inputCls}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 border border-border bg-card p-8">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Redes sociales</h2>
                                <div className="grid gap-6 sm:grid-cols-3">
                                    {socialFieldDefs.map((field, index) => (
                                        <Field key={field.key} label={field.label} id={`social-${index}`}>
                                            <input
                                                id={`social-${index}`}
                                                type="text"
                                                value={getSocialUrl(field.key)}
                                                onChange={(e) => updateSocialUrl(field.key, e.target.value)}
                                                placeholder="#"
                                                className={inputCls}
                                            />
                                        </Field>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {actionError && <p className="text-sm text-destructive">{actionError}</p>}
                                <button onClick={saveContact} disabled={isSaving}
                                        className="self-start rounded-sm bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                                    {isSaving ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Payments / QR ── */}
                    {activeTab === "payments" && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Métodos de pago</h2>
                                <button onClick={() => setPaymentModal({open: true, editing: null})}
                                        className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4"/>Nuevo metodo
                                </button>
                            </div>
                            <div className="overflow-x-auto border border-border">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripcion</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Activo</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {paymentMethods.map((m) => (
                                        <tr key={m.id} className="border-b border-border/50 last:border-0">
                                            <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{m.description}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{m.code}</td>
                                            <td className="px-4 py-3 text-right text-foreground">{m.is_active ? "Si" : "No"}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setPaymentModal({open: true, editing: m})}
                                                            className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            aria-label="Editar"><Pencil className="h-4 w-4"/></button>
                                                    <button onClick={() => setConfirmDelete({
                                                        type: "payment",
                                                        id: m.id,
                                                        name: m.name
                                                    })}
                                                            className="rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                            aria-label="Eliminar"><Trash2 className="h-4 w-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <h2 className="font-serif text-lg font-semibold text-foreground">Proveedores QR</h2>
                                <button onClick={() => setProviderModal({open: true, editing: null})}
                                        className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4"/>Nuevo QR
                                </button>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {providers.map((prov) => (
                                    <div key={prov.id}
                                         className="flex flex-col items-center gap-4 border border-border bg-card p-6">
                                        {prov.qr_code_url ? (
                                            <div
                                                className="relative aspect-square w-36 overflow-hidden border border-border bg-background">
                                                <Image src={prov.qr_code_url} alt={`QR ${prov.name}`} fill
                                                       className="object-contain p-2"/>
                                            </div>
                                        ) : (
                                            <div
                                                className="flex aspect-square w-36 items-center justify-center border border-border bg-background text-muted-foreground">Sin
                                                QR</div>
                                        )}
                                        <span className="text-sm font-semibold text-foreground">{prov.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setProviderModal({open: true, editing: prov})}
                                                    className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    aria-label="Editar"><Pencil className="h-4 w-4"/></button>
                                            <button onClick={() => setConfirmDelete({
                                                type: "provider",
                                                id: prov.id,
                                                name: prov.name
                                            })}
                                                    className="rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    aria-label="Eliminar"><Trash2 className="h-4 w-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* Modals */}
            {catModal.open && <CategoryModal category={catModal.editing} onSave={saveCategory}
                                             onClose={() => setCatModal({open: false, editing: null})}/>}
            {prodModal.open && <ProductModal product={prodModal.editing} categories={categories} onSave={saveProduct}
                                             onClose={() => setProdModal({open: false, editing: null})}/>}
            {providerModal.open && <ProviderModal provider={providerModal.editing}
                                                  paymentMethods={paymentMethods.filter((m) => m.code?.toUpperCase() === "MOBILE_PAY")}
                                                  onSave={saveProvider}
                                                  onClose={() => setProviderModal({open: false, editing: null})}/>}
            {paymentModal.open && <PaymentMethodModal method={paymentModal.editing} onSave={savePaymentMethod}
                                                      onClose={() => setPaymentModal({open: false, editing: null})}/>}
            {confirmDelete && (
                <ConfirmDialog
                    title={`Eliminar ${confirmDelete.name}?`}
                    message={confirmDelete.type === "category" ? "Se eliminaran todos los productos de esta categoria." : "Esta accion no se puede deshacer."}
                    onConfirm={() => {
                        if (confirmDelete.type === "category") void deleteCategory(confirmDelete.id)
                        else if (confirmDelete.type === "product") void deleteProduct(confirmDelete.id)
                        else if (confirmDelete.type === "provider") void deleteProvider(confirmDelete.id)
                        else void deletePaymentMethod(confirmDelete.id)
                    }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
            {showPassModal && (
                <ModalShell title="Cambiar contrasena" onClose={() => setShowPassModal(false)}>
                    <form onSubmit={changePassword} className="flex flex-col gap-4">
                        {passError && (
                            <div
                                className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                                {passError}
                            </div>
                        )}
                        <Field label="Contrasena actual" id="old-pass">
                            <input id="old-pass" type="password" value={oldPass}
                                   onChange={(e) => setOldPass(e.target.value)} className={inputCls} required/>
                        </Field>
                        <Field label="Nueva contrasena" id="new-pass">
                            <input id="new-pass" type="password" value={newPass}
                                   onChange={(e) => setNewPass(e.target.value)} className={inputCls} required/>
                        </Field>
                        <div className="mt-2 flex gap-3">
                            <button type="submit"
                                    className="flex-1 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Guardar
                            </button>
                            <button type="button" onClick={() => setShowPassModal(false)}
                                    className="flex-1 rounded-sm border border-border bg-transparent py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancelar
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}
        </div>
    )
}
