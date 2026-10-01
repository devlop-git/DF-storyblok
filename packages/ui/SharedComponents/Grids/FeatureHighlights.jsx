import Image from "next/image";
import Link from "next/link";
import { asset, firstAsset, toNumber } from "@df/core/utils/storyblok";

function FeatureMedia({ item, className, objectFit = "cover" }) {
  const desktop = firstAsset(item?.desktopIcon);
  const tablet = asset(item?.tabIcon);
  const mobile = asset(item?.mobileIcon);
  const altFallback = item?.lines?.[0]?.text || "";
  const objectFitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  if (!desktop && !tablet && !mobile) return null;

  return (
    <>
      {desktop && (
        <Image
          src={desktop.filename}
          alt={desktop.alt || altFallback}
          width={400}
          height={240}
          className={`hidden ${objectFitClass} lg:block ${className}`}
        />
      )}

      {tablet && (
        <Image
          src={tablet.filename}
          alt={tablet.alt || altFallback}
          width={400}
          height={240}
          className={`hidden ${objectFitClass} md:block lg:hidden ${className}`}
        />
      )}

      {mobile && (
        <Image
          src={mobile.filename}
          alt={mobile.alt || altFallback}
          width={400}
          height={240}
          className={`block ${objectFitClass} md:hidden ${className}`}
        />
      )}
    </>
  );
}

function FeatureLines({ lines, textAlignClass, className }) {
  if (!lines?.length) return null;

  return (
    <div className={`flex flex-col ${className}`}>
      {lines.map((line, index) => {
        if (!line?.text) return null;

        const isHeading = line.variant === "heading";
        const isCta = line.variant === "cta";
        const isLink = Boolean(line.url);
        const style = {
          ...(line.fontColor && { color: line.fontColor }),
          ...(line.fontFamily && { fontFamily: line.fontFamily }),
        };

        if (isCta) {
          const ctaAlignClass = textAlignClass === "text-right"
            ? "self-end"
            : textAlignClass === "text-left"
            ? "self-start"
            : "self-center";

          return (
            <Link
              key={line._uid ?? index}
              href={line?.url || ""}
              className={`mt-4 inline-flex border border-black px-8 py-3 text-sm font-semibold tracking-wide text-black transition-all duration-300 hover:bg-black hover:text-white ${ctaAlignClass}`}
              style={style}
            >
              {line.text}
            </Link>
          );
        }

        const sizeWeightClass = isHeading ? "text-[28px] font-medium" : "text-sm font-medium";
        const defaultColorClass = line.fontColor
          ? ""
          : isHeading
          ? "text-[#171714]"
          : "text-[#4B4B4B]";

        const lineClassName = `${sizeWeightClass} ${textAlignClass} ${defaultColorClass} ${
          isLink ? "hover:underline" : ""
        }`;

        return isLink ? (
          <Link key={line._uid ?? index} href={line?.url} className={lineClassName} style={style}>
            {line.text}
          </Link>
        ) : (
          <span key={line._uid ?? index} className={lineClassName} style={style}>
            {line.text}
          </span>
        );
      })}
    </div>
  );
}

function ImageFeatureCard({ item }) {
  return (
    <div className="flex flex-col items-center text-center">
      <FeatureMedia item={item} className="h-48 w-full lg:h-56" />

      <FeatureLines
        lines={item.lines}
        textAlignClass="text-center"
        className="mt-4 items-center gap-1"
      />
    </div>
  );
}

function IconFeatureCard({ item }) {
  const iconPosition = item?.iconPosition || "top";
  const isSideIcon = iconPosition === "left" || iconPosition === "right";
  const textAlignClass = isSideIcon ? "text-left" : "text-center";

  const wrapperClass = isSideIcon
    ? `flex items-center justify-center gap-5 ${
        iconPosition === "right" ? "flex-row-reverse" : "flex-row"
      }`
    : `flex items-center justify-center gap-5 ${
        iconPosition === "bottom" ? "flex-col-reverse" : "flex-col"
      }`;

  return (
    <div className={wrapperClass}>
      <FeatureMedia item={item} className="h-15 w-15" objectFit="contain" />

      <FeatureLines
        lines={item.lines}
        textAlignClass={textAlignClass}
        className={`gap-1 ${isSideIcon ? "items-start" : "items-center"}`}
      />
    </div>
  );
}

export default function FeatureHighlights({ data }) {
  const gap = toNumber(data?.gap);
  const columns = Number.isFinite(gap) && gap > 0 ? gap : 4;
  const tabletColumns = Math.min(columns, 2);

  return (
    <section
      className="w-full mt-2"
      style={data.bgColor ? { backgroundColor: data.bgColor } : undefined}
    >
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Heading */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-[28px] lg:text-[36px] text-center font-light text-[#171717] leading-tight">
            {data.title}
          </h2>

          <p className="mt-6 text-base leading-6 text-[#4B4B4B] text-center">
            {data.description}
          </p>
        </div>

        {/* Features */}
        <div
          className="grid grid-cols-1 mt-8 gap-4 md:grid-cols-[repeat(var(--tablet-cols),minmax(0,1fr))] lg:gap-12 lg:grid-cols-[repeat(var(--desktop-cols),minmax(0,1fr))]"
          style={{
            "--tablet-cols": tabletColumns,
            "--desktop-cols": columns,
          }}
        >
          {data.items?.map((item) =>
            item.mediaType === "image" ? (
              <ImageFeatureCard key={item._uid} item={item} />
            ) : (
              <IconFeatureCard key={item._uid} item={item} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
