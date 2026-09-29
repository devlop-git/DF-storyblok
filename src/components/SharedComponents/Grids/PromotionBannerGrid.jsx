import PromotionBannerCard from "../Banners/PromotionBannerCard";

const GRID_COLUMNS_BY_COUNT = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
};

export default function PromotionBannerGrid({ data }) {
  const items = data.items ?? [];
  const columnsClass = GRID_COLUMNS_BY_COUNT[items.length] || "lg:grid-cols-4";

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        {(data.heading || data.description) && (
          <div className="max-w-4xl mx-auto text-center mb-8">
            {data.heading && (
              <h2 className="font-serif text-[28px] lg:text-[36px] text-center font-light text-[#171717] leading-tight">
                {data.heading}
              </h2>
            )}

            {data.description && (
              <p className="mt-6 text-base leading-6 text-[#4B4B4B] text-center">
                {data.description}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${columnsClass} gap-4 lg:gap-6`}>
          {items.map((item) => (
            <PromotionBannerCard key={item._uid} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
