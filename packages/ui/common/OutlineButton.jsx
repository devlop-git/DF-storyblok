export default function OutlineButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        mx-auto
        flex
        h-[58px]
        w-[158px]
        items-center
        justify-center
        border
        border-brand-primary
        bg-white
        text-base
        font-semibold
        text-brand-primary
        transition-all
        duration-300
        hover:bg-brand-primary
        hover:text-white
        hover:cursor-pointer
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}
