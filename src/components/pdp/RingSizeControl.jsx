// Ring Size gets a bespoke control instead of the generic pill renderer in
// PdpConfigurator: a collapsed summary row (label + current size + "Ring
// Size Guide" link) that expands into an "I don't know" option plus a grid
// of every size.
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaRegQuestionCircle } from "react-icons/fa";

// External sizing guide the shopper is sent to via "Ring Size Guide".
const RING_SIZE_GUIDE_URL =
  "https://www.diamondsfactory.de/anleitung/ringmass-anleitung";

export default function RingSizeControl({ option, current, onSelect, open, onToggle }) {
  const selected = option.values.find((v) => v.valueCode === current);

  return (
    <div className="border-t border-[#F0E9DF] py-3">
      {/* Collapsed summary row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <FaRegQuestionCircle className="shrink-0 text-[11px] text-[#BCA98F]" />
          <span className="text-sm font-bold">{option.displayName}</span>
          <span className="text-sm text-gray-400">
            {selected?.displayName ?? "Choose your size"}
          </span>
        </button>

        <a
          href={RING_SIZE_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-xs font-medium text-[#9C6D4B] underline"
        >
          Ring Size Guide
        </a>

        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse ring size options" : "Expand ring size options"}
          className="text-[#9C7A58]"
        >
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {/* Expanded picker */}
      {open && (
        <div className="mt-3">
          <button
            type="button"
            className="mb-3 w-full border border-[#E0D5C6] bg-white py-2 text-center text-sm text-[#4A4A4A] transition hover:border-[#C9B79E]"
          >
            I don&apos;t know
          </button>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {option.values.map((v, i) => {
              const disabled = v.valueCode == null;
              const active = current === v.valueCode;
              return (
                <button
                  key={v.valueName + i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(v.valueCode)}
                  className={`border px-2 py-2 text-center text-xs transition ${
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
        </div>
      )}
    </div>
  );
}
