// Server-only helper for calling our own Node API.
// Keep NODE_API_URL server-side (no NEXT_PUBLIC_ prefix) so it never reaches the browser.

const baseUrl = process.env.NODE_API_URL;

export async function fetchNodeApi(path, init) {
  if (!baseUrl) {
    throw new Error("NODE_API_URL is not set in .env.local");
  }

  const url = new URL(path, baseUrl);
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(process.env.NODE_API_KEY && {
        Authorization: `Bearer ${process.env.NODE_API_KEY}`,
      }),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Node API ${res.status} ${res.statusText} for ${url}`);
  }

  return res.json();
}
