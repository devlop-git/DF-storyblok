import OutlineButton from "@/components/common/OutlineButton";

// "Load More" isn't wired to the API yet (same as the Strapi version).
const Pagination = () => {
  return (
    <div className="lg:mt-12 mt-6 md:my-8">
      <OutlineButton>Load More</OutlineButton>
    </div>
  );
};

export default Pagination;
