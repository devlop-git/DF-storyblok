export const LANGUAGES = {
  germany: [
    { code: "de", label: "Deutsch" },
    { code: "en", label: "English" },
  ],
  uk: [
    { code: "en", label: "English" },
  ],
  netharlands: [
    { code: "nl", label: "Nederlands" },
    { code: "en", label: "English" },
  ],
};

export const MARKET = process.env.NEXT_PUBLIC_MARKET || "germany";
