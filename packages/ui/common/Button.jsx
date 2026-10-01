import clsx from "clsx";

const Button = ({
  text,
  count,
  icon: Icon,
  onClick,
  className = "",
  textClassName = "",
  badgeClassName = "",
  iconClassName = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx("flex items-center justify-center gap-4", className)}
    >
      {Icon && <Icon className={iconClassName} />}

      <span className={textClassName}>{text}</span>

      {count !== undefined && (
        <span
          className={clsx("flex items-center justify-center", badgeClassName)}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default Button;
