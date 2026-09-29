"use client";

// Renders the option rows (Metal, Band Width, Ring Size, ...) and reports
// selections back to the parent -- it does NOT own the selection state.
// That state lives in PdpDetails, because the "Ring & Diamond Details"
// accordion reads the same live selections.
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaRegQuestionCircle } from "react-icons/fa";
import { selectedCode } from "@/utils/buildSku";
import RingSizeControl from "./RingSizeControl";

// Names that make up the primary (always-visible) configurator, in display order.
// Any other SF option (Polish, Symmetry, Fluorescence, ...) drops into "More Options".
const PRIMARY_ORDER = [
  "Band Width",
  "Metal",
  "Ring Size",
  "Stone Type",
  "Shape",
  "Carat",
  "Clarity",
  "Colour",
  "Cut Grade",
  "Certificate",
];

// Best-effort swatch colour for a metal, derived from its name.
function metalColor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("rose") || n.includes("rosé") || n.includes("rotgold")) return "#E0B0A0";
  if (n.includes("yellow") || n.includes("gelbgold")) return "#E6C67A";
  if (n.includes("platinum") || n.includes("white") || n.includes("platin")) return "#E5E4E2";
  return "#E5E4E2";
}

function metalAbbr(name = "") {
  const karat = name.match(/(\d+)\s*(?:K|Karat)/i);
  const isPlatinum = /platinum|platin/i.test(name);

  if (isPlatinum && karat) return `PL ${karat[1]}K`;
  if (isPlatinum) return "PL";

  return karat ? `${karat[1]}K` : name.slice(0, 2).toUpperCase();
}

function Label({ option }) {
  return (
    <span className="flex items-center gap-1 text-sm font-bold">
      <FaRegQuestionCircle className="text-[11px] text-[#BCA98F]" />
      {option.displayName}
    </span>
  );
}

// ---- individual control renderers -----------------------------------------

function IconControl({ option, current, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {option.values.map((v, i) => {
        const disabled = v.valueCode == null;
        const active = current === v.valueCode;
        return (
          <button
            key={v.valueName + i}
            type="button"
            disabled={disabled}
            title={v.displayName}
            onClick={() => onSelect(v.valueCode)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-medium transition ${
              active ? "ring-2 ring-[#9C6D4B] ring-offset-1" : ""
            } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            style={{ backgroundColor: metalColor(v.valueName), color: "#5A4A38" }}
          >
            {metalAbbr(v.valueName)}
          </button>
        );
      })}
    </div>
  );
}

function PillControl({ option, current, onSelect, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {option.values.map((v, i) => {
        const disabled = v.valueCode == null;
        const active = current === v.valueCode;
        return (
          <button
            key={v.valueName + i}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(v.valueCode)}
            className={`min-w-[54px] border px-3 py-2 text-center text-xs transition ${
              active
                ? "border-[#9C6D4B] bg-[#9C6D4B] text-white"
                : "border-[#E0D5C6] bg-white text-[#4A4A4A] hover:border-[#C9B79E]"
            } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
          >
            {v.displayName}
          </button>
        );
      })}
    </div>
  );
}

function Control({ option, current, onSelect }) {
  if (option.renderAs === "icon")
    return <IconControl option={option} current={current} onSelect={onSelect} />;
  // pill, shape, carat and all SF features render as pills. Ring Size is
  // special-cased to <RingSizeControl /> in the render loop below.
  return <PillControl option={option} current={current} onSelect={onSelect} />;
}

function OptionRow({ option, current, onSelect }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 border-t border-[#F0E9DF] py-3">
      <Label option={option} />
      <Control option={option} current={current} onSelect={onSelect} />
    </div>
  );
}

// ---- main configurator -----------------------------------------------------

export default function PdpConfigurator({
  options = [],
  selections,
  onSelect,
  sku,
}) {
  const [showMore, setShowMore] = useState(false);
  const [ringSizeOpen, setRingSizeOpen] = useState(false);

  const byName = (name) => options.find((o) => o.name === name);
  const primary = PRIMARY_ORDER.map(byName).filter(Boolean);
  const primaryNames = new Set(PRIMARY_ORDER);
  const more = options.filter((o) => !primaryNames.has(o.name));

  return (
    <div>
      {primary.map((option) =>
        option.name === "Ring Size" ? (
          <RingSizeControl
            key={option.name}
            option={option}
            current={selectedCode(option, selections)}
            onSelect={(code) => {
              onSelect(option, code);
              setRingSizeOpen(false);
            }}
            open={ringSizeOpen}
            onToggle={() => setRingSizeOpen((prev) => !prev)}
          />
        ) : (
          <OptionRow
            key={option.name}
            option={option}
            current={selectedCode(option, selections)}
            onSelect={(code) => onSelect(option, code)}
          />
        ),
      )}

      {more.length > 0 && (
        <div className="border-t border-[#F0E9DF]">
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className="flex w-full items-center justify-center gap-1 py-3 text-sm font-medium text-[#9C6D4B]"
          >
            More Options
            <FiChevronDown
              className={`transition-transform ${showMore ? "rotate-180" : ""}`}
            />
          </button>
          {showMore &&
            more.map((option) => (
              <OptionRow
                key={option.name}
                option={option}
                current={selectedCode(option, selections)}
                onSelect={(code) => onSelect(option, code)}
              />
            ))}
        </div>
      )}

      {/* Live SKU (POC visibility) */}
      <p className="mt-3 break-all text-[11px] text-gray-400">
        SKU: <span className="font-mono text-gray-500">{sku}</span>
      </p>
    </div>
  );
}
