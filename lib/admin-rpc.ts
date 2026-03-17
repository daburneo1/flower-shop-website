type RpcResult<T> = { data: T } | { error: { message?: string; status?: number } }

type AdminRpcOptions = {
  redirectOnAuthError?: boolean
}

export async function adminRpc<T>(
    fn: string,
    args: Record<string, unknown>,
    options: AdminRpcOptions = {},
): Promise<RpcResult<T>> {
  const { redirectOnAuthError = true } = options

  const res = await fetch("/api/admin/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fn, args }),
  })

  const json = await res.json()

  if (!res.ok || json?.error) {
    const status = res.status

    if (
        typeof window !== "undefined" &&
        redirectOnAuthError &&
        (status === 401 || status === 403)
    ) {
      window.location.href = "/admin"
    }

    return {
      error: {
        ...(json?.error ?? { message: "RPC error" }),
        status,
      },
    }
  }

  return { data: json.data as T }
}