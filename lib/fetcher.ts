// One JSON-fetch helper used everywhere: SWR's fetcher option, the Zenoti
// client, and admin mutation calls. Replaces duplicated fetch/parse/throw
// logic that used to live separately in each of those places.
export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const raw = await res.text();
    try {
      const parsed = JSON.parse(raw);
      throw new Error(parsed.error ?? raw);
    } catch {
      throw new Error(raw || `Request failed (${res.status})`);
    }
  }
  return res.json();
}

export function postJSON<T>(url: string, body: unknown): Promise<T> {
  return fetchJSON<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export function patchJSON<T>(url: string, body: unknown): Promise<T> {
  return fetchJSON<T>(url, { method: "PATCH", body: JSON.stringify(body) });
}
