// "Product Description" + "Ring & Diamond Details" collapsibles, shown
// below the Add to Bag / appointment / delivery block on the PDP.
//
// - `basicDetails.description` -> the paragraph in "Product Description".
// - `bomDetails` -> the static build-of-materials facts (design number,
//   dimensions, setting, total weight).
// - Metal / Stone Type / Shape / Carat / Colour / Clarity follow the
//   shopper's live `selections`, falling back to bomDetails.
import Accordion from "./Accordion";
import { selectedValue } from "@df/core/utils/buildSku";

function findOption(options, name) {
  return options.find((o) => o.name === name);
}

// Live display value for an option (e.g. "18K Yellow Gold"), or null if the
// option doesn't exist in this product's option list.
function liveDisplayName(options, name, selections) {
  const option = findOption(options, name);
  if (!option) return null;
  return selectedValue(option, selections)?.displayName ?? null;
}

function Row({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center justify-between border-b border-[#F0E9DF] py-2 text-sm last:border-b-0">
      <dt className="font-bold">{label}:</dt>
      <dd className="text-right font-medium text-[#1F1F1F]">{value}</dd>
    </div>
  );
}

export default function PdpProductDetails({
  description,
  bomDetails,
  meta,
  options,
  selections,
}) {
  const stone = bomDetails?.stoneGroups?.[0];
  const dims = bomDetails?.dimensions;

  // Product Code falls back to the design slug, same as the header code.
  const productCode = (bomDetails?.productCode || meta?.slug || "").toUpperCase();

  const metal = liveDisplayName(options, "Metal", selections) ?? bomDetails?.metal;
  const stoneType =
    liveDisplayName(options, "Stone Type", selections) ?? stone?.stoneType;
  const shape = liveDisplayName(options, "Shape", selections) ?? stone?.shape;
  const carat = liveDisplayName(options, "Carat", selections);
  const colour = liveDisplayName(options, "Colour", selections) ?? stone?.colour;
  const clarity =
    liveDisplayName(options, "Clarity", selections) ?? stone?.clarity;

  return (
    <div>
      {description && (
        <Accordion title="Product Description">
          <p className="text-sm leading-relaxed text-[#4A4A4A]">
            {description}
          </p>
        </Accordion>
      )}

      <Accordion title="Ring & Diamond Details">
        <dl>
          <Row label="Product Code" value={productCode} />
          <Row label="Design Number" value={bomDetails?.designNumber} />
          <Row label="Certificate" value={bomDetails?.certificate} />
          <Row label="Metal" value={metal} />

          {dims && (
            <div className="pb-1 pt-3 text-sm font-semibold text-[#1F1F1F]">
              Dimension
            </div>
          )}
          <Row
            label="Setting Height"
            value={dims?.settingHeight != null ? `${dims.settingHeight} mm` : null}
          />
          <Row
            label="Shoulder Width"
            value={dims?.settingWidth != null ? `${dims.settingWidth} mm` : null}
          />
          <Row
            label="Band Thickness"
            value={dims?.bandThickness != null ? `${dims.bandThickness} mm` : null}
          />

          <Row label="Stone Type" value={stoneType} />
          <Row label="Shape" value={shape} />
          <Row label="Colour" value={colour} />
          <Row label="Clarity" value={clarity} />
          <Row label="Carat" value={carat} />
          <Row label="Setting" value={stone?.setting} />
          <Row label="Total Weight" value={stone?.totalWeightLabel} />
        </dl>
      </Accordion>
    </div>
  );
}
