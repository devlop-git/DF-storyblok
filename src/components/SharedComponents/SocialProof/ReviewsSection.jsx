import Image from "next/image";
import { assetSize, firstAsset } from "@/utils/storyblok";

export default function ReviewsSection({ data }) {
  if (!data) return null;

  const trustpilot = firstAsset(data?.trustpilotImage);
  const google = firstAsset(data?.googleImage);

  const renderReviewImage = (image, fallbackAlt, widthClass) => {
    if (!image) return null;
    const { width, height } = assetSize(image);

    return (
      <div className="transition-transform duration-300 hover:scale-105 flex justify-center">
        <Image
          src={image.filename}
          alt={image.alt || fallbackAlt}
          width={width}
          height={height}
          className={`h-auto ${widthClass} object-contain`}
        />
      </div>
    );
  };

  return (
    <section className="bg-white ">
      <div className="mx-auto  px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        {data?.heading && (
          <h2 className="text-center font-serif text-[28px] pt-8 font-light leading-tight text-[#111]  lg:text-[36px]">
            {data.heading}
          </h2>
        )}

        {/* Review Images */}
        <div className=" grid grid-cols-2 lg:flex items-center justify-center mt-6 md:mt-0  md:gap-16 lg:gap-24">
          {renderReviewImage(trustpilot, "Trustpilot", "")}

          {renderReviewImage(google, "Google Reviews", "")}
        </div>
      </div>
    </section>
  );
}
