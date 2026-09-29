// Builds the full product SKU from the current option selections.
//
// The SKU is REF + one segment per prefix, in this fixed order:
//   MS  metal option                       (e.g. Metal)
//   MT  metal team                         (Band Width + Ring Size)
//   MF  metal non-dimensional features     (none defined yet -> empty)
//   CT  carat                              (Carat)
//   ST  stone team                         (Stone Type + Shape)
//   SF  stone features x2 digits each      (Clarity, Colour, Cut, ... by featureSequence)
//
// Segments are variable-length: each option contributes its 2-digit valueCode,
// concatenated after the prefix. The full SKU is REF + "_" + those segments
// joined together, e.g.:
//   CLRN349_MS00MT0005MFCT00ST0000SF0102000302
//
// `selections` is keyed by option name -> chosen valueCode. Options fall back to
// their `isSelected` value when a selection has not been made yet.

export const SKU_PART_ORDER = ["MS", "MT", "MF", "CT", "ST", "SF"];

export function selectedCode(option, selections = {}) {
  const chosen =
    selections[option.name] ??
    option.values.find((v) => v.isSelected)?.valueCode;
  // A null valueCode means the value has no SKU code yet (not orderable).
  return chosen ?? "";
}

// Full value object (displayName, valueCode, ...) currently selected for an
// option, given the same `selections` map used by buildSku/selectedCode.
export function selectedValue(option, selections = {}) {
  const code =
    selections[option.name] ??
    option.values.find((v) => v.isSelected)?.valueCode;
  return option.values.find((v) => v.valueCode === code) ?? null;
}

// Every option belonging to a given SKU prefix (e.g. "MT" -> Band Width,
// Ring Size), in the exact order their codes are concatenated. Shared by
// buildSku and parseSku so encoding/decoding can never drift out of sync.
export function optionsForPart(options, part) {
  const list = options.filter((o) => o.partOf === part);
  if (part === "SF") {
    return [...list].sort(
      (a, b) => (a.featureSequence ?? 0) - (b.featureSequence ?? 0),
    );
  }
  return list;
}

export function buildSku(options = [], ref = "", selections = {}) {
  const segment = (part) =>
    part +
    optionsForPart(options, part)
      .map((o) => selectedCode(o, selections))
      .join("");

  return `${ref}_${SKU_PART_ORDER.map(segment).join("")}`;
}

// Inverse of buildSku: decodes a full SKU string back into a
// { optionName: valueCode } selections map, by walking the same
// prefix/option order buildSku used to encode it. Returns null if the SKU
// doesn't match this product's option shape.
export function parseSku(options = [], sku = "") {
  const separator = sku.indexOf("_");
  if (separator === -1) return null;

  let cursor = separator + 1;
  const selections = {};

  for (const part of SKU_PART_ORDER) {
    if (sku.slice(cursor, cursor + part.length) !== part) return null;
    cursor += part.length;

    for (const option of optionsForPart(options, part)) {
      const code = sku.slice(cursor, cursor + 2);
      cursor += 2;
      if (!code) continue;
      if (!option.values.some((v) => v.valueCode === code)) return null;
      selections[option.name] = code;
    }
  }

  return selections;
}

// Initial selections map derived from the options' default `isSelected` values.
export function initialSelections(options = []) {
  return options.reduce((acc, option) => {
    const def = option.values.find((v) => v.isSelected);
    if (def) acc[option.name] = def.valueCode;
    return acc;
  }, {});
}

// Which featureId(s) contribute to each SKU part, in the exact order their
// codes are concatenated -- keyed by featureId since that's all a PLP
// product's `defaultSelection` gives us. MF and SF stay empty on purpose.
const PART_FEATURE_ORDER = {
  MS: ["FEATURE-METAL"],
  MT: ["FEATURE-BANDWIDTH", "FEATURE-RINGSIZE"],
  MF: [],
  CT: ["FEATURE-CARAT"],
  ST: ["FEATURE-STONETYPE", "FEATURE-SHAPE"],
  SF: [],
};

// Builds a PDP-shaped SKU from a PLP product's `designRef` + `defaultSelection`
// (featureId -> valueCode), for the PLP card's default-configuration link.
export function buildSkuFromFeatures(designRef = "", defaultSelection = {}) {
  const segment = (part) =>
    part +
    PART_FEATURE_ORDER[part]
      .map((featureId) => defaultSelection[featureId] ?? "")
      .join("");

  return `${designRef}_${SKU_PART_ORDER.map(segment).join("")}`;
}
