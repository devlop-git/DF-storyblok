import { LANGUAGES, MARKET } from "@df/core/constants/languages";
import { getCurrentLocale } from "@df/core/lib/locale";
import { fetchStory } from "@df/core/lib/storyblok";
import { firstAsset } from "@df/core/utils/storyblok";
import HeaderTabs from "./HeaderTabs";
import Navigation from "./Navigation";

// Header content (logo) comes from the Storyblok "header" story (content type
// "header", slug "global/header"); the category menu comes from the Commerce API.
const Header = async () => {
  const locale = await getCurrentLocale();
  const headerStory = await fetchStory("global/header").catch(() => null);

  const languages = LANGUAGES[MARKET];
  const logo = firstAsset(headerStory?.content?.Logo);

  return (
    <div className="sticky top-0 z-50 w-full bg-white">
      <header className="bg-white text-black shadow-sm">
        <div className="hidden lg:block">
          <HeaderTabs logo={logo} languages={languages} locale={locale} />
        </div>

        <div className="px-2 lg:px-8">
          <Navigation locale={locale} languages={languages} />
        </div>
      </header>
    </div>
  );
};

export default Header;
