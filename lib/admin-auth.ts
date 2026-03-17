import { createClient } from "@/lib/supabase/client"

export type AdminSession = {
  floristId: string
  email: string
  userId: string
}

const supabase = createClient()

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message || "No se pudo iniciar sesion")
  }

  return data
}

export async function signUpAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message || "No se pudo registrar el administrador")
  }

  return data
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return {
    floristId: process.env.NEXT_PUBLIC_FLORIST_ID ?? "",
    email: data.user.email ?? "",
    userId: data.user.id,
  }
}

export async function clearAdminSession() {
  await supabase.auth.signOut()
}

export async function updateAdminPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message || "No se pudo actualizar la contrasena")
  }

  return data
}