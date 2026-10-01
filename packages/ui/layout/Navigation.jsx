import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import { getNavigation } from "@df/core/services/commerce";

// Category menu from the Commerce category API (see services/commerce.js).
const Navigation = async ({ languages, locale }) => {
  let navigation = [];
  try {
    navigation = await getNavigation(locale);
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
