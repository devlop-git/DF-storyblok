// Product listing from Algolia for the menu links, e.g. /engagement-rings/solitaire
// (shared route in @df/ui).
export { default } from "@df/ui/routes/AlgoliaCategoryRoute";

// The Algolia PLP is server-rendered per request (react-instantsearch-nextjs).
export const dynamic = "force-dynamic";
