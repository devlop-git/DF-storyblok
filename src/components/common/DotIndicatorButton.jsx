export default function DotIndicatorButton({
  active,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-2.5
        w-2.5
        rounded-full
        transition-all
        ${active ? "bg-brand-pdp" : "bg-brand-pdp/40 hover:bg-brand-pdp/70"}
        ${className}
      `}
    />
  );
}
