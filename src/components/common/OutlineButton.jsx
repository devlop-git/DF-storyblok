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
        border-[#A5744A]
        bg-white
        text-base
        font-semibold
        text-[#A5744A]
        transition-all
        duration-300
        hover:bg-[#A5744A]
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
