import PromotionBannerCard from "./PromotionBannerCard";

export default function PromotionBanner({ data }) {
  if (!data) return null;

  return (
    <section className="py-8">
      <PromotionBannerCard data={data} />
    </section>
  );
}
