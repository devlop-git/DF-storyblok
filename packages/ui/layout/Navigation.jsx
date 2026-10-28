import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import { getMenu } from "@df/core/services/navigation";

// Header menu: the Storyblok "Main Navigation" story, or the PIM category API
// when the brand's space doesn't have one (see services/navigation.js).
const Navigation = async ({ languages, locale }) => {
  let navigation = [];
  try {
    navigation = await getMenu(locale);
  } catch (error) {
    // Keep the rest of the page working when the Commerce API is down.
    console.error("Header navigation:", error.message);
  }

  return (
    <div>
      <div className="hidden lg:block">
        <DesktopNavigation navigation={navigation} />
      </div>
      <div className="block lg:hidden">
        <MobileNavigation
          navigation={navigation}
          languages={languages}
          locale={locale}
        />
      </div>
    </div>
  );
};

export default Navigation;
