import { cookies } from "next/headers";

// The language picked in the header's LanguageDropdown (cookie "language").
export async function getCurrentLocale() {
  const cookieStore = await cookies();
  return cookieStore.get("language")?.value || "de";
}
