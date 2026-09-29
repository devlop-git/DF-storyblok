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
        ${active ? "bg-[#9C6D4B]" : "bg-[#9C6D4B]/40 hover:bg-[#9C6D4B]/70"}
        ${className}
      `}
    />
  );
}
