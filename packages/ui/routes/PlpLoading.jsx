import Loader from "@df/ui/common/Loader";

// Shown automatically (via Suspense) while this page's data is fetching --
// e.g. clicking a subcategory in the header navigation.
export default function Loading() {
  return <Loader />;
}
