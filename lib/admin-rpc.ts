type RpcResult<T> = { data: T } | { error: { message?: string } }

export async function adminRpc<T>(fn: string, args: Record<string, unknown>): Promise<RpcResult<T>> {
  const res = await fetch("/api/admin/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fn, args }),
  })
  const json = await res.json()
  if (!res.ok || json?.error) {
    return { error: json?.error ?? { message: "RPC error" } }
  }
  return { data: json.data as T }
}
