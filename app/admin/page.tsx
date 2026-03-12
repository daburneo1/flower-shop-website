"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { setAdminSession } from "@/lib/admin-auth"
import { adminRpc } from "@/lib/admin-rpc"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [shopName, setShopName] = useState("Floristeria")
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const floristId = process.env.NEXT_PUBLIC_FLORIST_ID
    if (floristId) {
      createClient()
        .rpc("sp_get_florist", { p_florist_id: floristId })
        .single()
        .then(({ data }) => {
          const name = (data as { name?: string } | null)?.name
          if (name) setShopName(name)
        })
      adminRpc<{ admin_exists?: boolean; exists?: boolean } | Array<{ admin_exists?: boolean; exists?: boolean }>>(
        "sp_admin_exists",
        { p_florist_id: floristId },
      ).then((result) => {
        if ("error" in result) {
          setIsRegister(false)
          return
        }
        const row = Array.isArray(result.data) ? result.data[0] : result.data
        const exists = row?.admin_exists ?? row?.exists
        setIsRegister(!exists)
      })
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const floristId = process.env.NEXT_PUBLIC_FLORIST_ID
      if (!floristId) {
        setError("Falta NEXT_PUBLIC_FLORIST_ID")
        setLoading(false)
        return
      }

      if (isRegister) {
        const result = await adminRpc("sp_admin_register", {
          p_florist_id: floristId,
          p_email: email,
          p_password: password,
        })
        if ("error" in result) {
          setError("No se pudo registrar el administrador")
          setLoading(false)
          return
        }
      } else {
        const result = await adminRpc<Array<{ ok: boolean }> | { ok: boolean }>("sp_admin_login", {
          p_florist_id: floristId,
          p_email: email,
          p_password: password,
        })
        if ("error" in result) {
          setError("Correo o contrasena incorrectos")
          setLoading(false)
          return
        }
        const row = Array.isArray(result.data) ? result.data[0] : result.data
        const ok = row?.ok
        if (!ok) {
          setError("Correo o contrasena incorrectos")
          setLoading(false)
          return
        }
      }

      setAdminSession({ floristId, email })
      router.replace("/admin/dashboard")
    } catch {
      setError("Error al procesar la solicitud")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-wide text-primary">
              {shopName}
            </span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister ? "Crear Administrador" : "Panel de Administracion"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 border border-border bg-card p-8"
        >
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {isRegister ? "Registrar Administrador" : "Iniciar Sesion"}
          </h1>

          {error && (
            <div className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {"Correo Electr\u00f3nico"}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tienda.com"
              className="rounded-sm border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {"Contrase\u00f1a"}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={"Tu contrase\u00f1a"}
                className="w-full rounded-sm border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-sm bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Procesando..." : isRegister ? "Crear" : "Ingresar"}
          </button>

          <Link
            href="/"
            className="text-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {"← Volver al sitio"}
          </Link>
        </form>
      </div>
    </div>
  )
}
