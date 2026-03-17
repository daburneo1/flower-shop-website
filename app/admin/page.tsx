"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { adminRpc } from "@/lib/admin-rpc"
import { createClient } from "@/lib/supabase/client"
import { clearAdminSession, signInAdmin, signUpAdmin } from "@/lib/admin-auth"

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
    if (!floristId) return

    const supabase = createClient()

    void supabase
        .rpc("sp_get_florist", { p_florist_id: floristId })
        .single()
        .then(({ data }) => {
          const name = (data as { name?: string } | null)?.name
          if (name) setShopName(name)
        })

    void adminRpc<{ admin_exists?: boolean; exists?: boolean } | Array<{ admin_exists?: boolean; exists?: boolean }>>(
        "sp_admin_exists",
        { p_florist_id: floristId },
        { redirectOnAuthError: false },
    ).then((result) => {
      if ("error" in result) {
        setIsRegister(false)
        return
      }

      const row = Array.isArray(result.data) ? result.data[0] : result.data
      const exists = Boolean(row?.admin_exists ?? row?.exists ?? false)

      setIsRegister(!exists)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const floristId = process.env.NEXT_PUBLIC_FLORIST_ID
      if (!floristId) {
        setError("Falta NEXT_PUBLIC_FLORIST_ID")
        return
      }

      if (isRegister) {
        try {
          await signUpAdmin(email, password)
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : ""

          if (
              message.includes("already registered") ||
              message.includes("already been registered") ||
              message.includes("user already registered")
          ) {
            setIsRegister(false)
            setError("Ese correo ya existe. Intenta iniciar sesion.")
            return
          }

          setError("No se pudo registrar el administrador")
          return
        }

        const bootstrapResult = await adminRpc<Array<{ ok: boolean; message: string }> | { ok: boolean; message: string }>(
            "sp_admin_bootstrap",
            { p_florist_id: floristId },
        )

        if ("error" in bootstrapResult) {
          setError("No se pudo registrar el administrador")
          return
        }

        const row = Array.isArray(bootstrapResult.data) ? bootstrapResult.data[0] : bootstrapResult.data
        if (!row?.ok) {
          setError(row?.message ?? "No se pudo registrar el administrador")
          return
        }

        setError("Administrador creado. Revisa tu correo y confirma la cuenta antes de iniciar sesion.")
        return
      } else {
        try {
          await signInAdmin(email, password)
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : ""

          if (message.includes("email not confirmed")) {
            setError("Debes confirmar tu correo antes de iniciar sesion.")
            return
          }

          if (message.includes("invalid login credentials")) {
            setError("Correo o contrasena incorrectos")
            return
          }

          setError(error instanceof Error ? error.message : "Error al iniciar sesion")
          return
        }

        const adminMeResult = await adminRpc<
            Array<{ ok: boolean; email: string; florist_id: string }> |
            { ok: boolean; email: string; florist_id: string }
        >(
            "sp_admin_me",
            { p_florist_id: floristId },
            { redirectOnAuthError: false },
        )

        if ("error" in adminMeResult) {
          await clearAdminSession()
          setError(adminMeResult.error.message ?? "No tienes permisos para acceder al panel")
          return
        }

        const row = Array.isArray(adminMeResult.data) ? adminMeResult.data[0] : adminMeResult.data
        if (!row?.ok) {
          await clearAdminSession()
          setError("No tienes permisos para acceder al panel")
          return
        }
      }

      router.replace("/admin/dashboard")
      router.refresh()
    } catch {
      setError("Error al procesar la solicitud")
    } finally {
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
                Correo Electronico
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
                Contrasena
              </label>
              <div className="relative">
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contrasena"
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
              ← Volver al sitio
            </Link>
          </form>
        </div>
      </div>
  )
}