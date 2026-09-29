import Image from "next/image";
import Link from "next/link";
import LanguageDropdown from "./LanguageDropdown";
import { HiOutlineShoppingBag, HiOutlineUserCircle } from "react-icons/hi2";
import { IoIosSearch, IoMdHeartEmpty } from "react-icons/io";
import { FiPhoneCall } from "react-icons/fi";
import { IoLocationOutline, IoCalendarClearOutline } from "react-icons/io5";

// `logo` is a Storyblok asset ({ filename, alt }) from the "header" story.
const HeaderTabs = ({ logo, languages, locale }) => {
  return (
    <div className="lg:border-b lg:border-[#E8DDCF] ">
      <div className=" gap-x-1 mx-auto flex lg:grid grid-cols-3 h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-x-1 md:gap-x-2 lg:gap-x-6">
          <button className="hover:text-[#A5744A] transition">
            <FiPhoneCall className="text-lg lg:text-2xl" />
          </button>

          <button className="hover:text-[#A5744A] transition">
            <IoLocationOutline className="text-lg lg:text-2xl" />
          </button>

          {/* Hide calendar on mobile */}
          <button className="hidden lg:block hover:text-[#A5744A] transition">
            <IoCalendarClearOutline className="text-lg md:text-2xl" />
          </button>
        </div>

        {/* Logo */}
        <Link href="/" className="lg:flex justify-center">
          {logo ? (
            <div className="relative w-50.25 h-[14px]">
              <Image
                src={logo.filename}
                alt={logo.alt || "Logo"}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            languages && (
              <span className="font-serif text-[14px] tracking-wide">DIAMONDS FACTORY</span>
            )
          )}
        </Link>

        {/* Right */}

        <div className="flex lg:justify-end items-center gap-x-4 ">
          <LanguageDropdown languages={languages} locale={locale} />
          <button className="hover:text-[#A5744A] hidden lg:block">
            <IoIosSearch className="text-md md:text-2xl" />
          </button>

          <button className="hover:text-[#A5744A]  hidden lg:block">
            <HiOutlineUserCircle className="text-lg md:text-2xl" />
          </button>

          {/* Hide wishlist on very small screens */}
          <button className="hidden lg:block hover:text-[#A5744A]">
            <IoMdHeartEmpty className="text-lg md:text-2xl" />
          </button>

          <button className="hover:text-[#A5744A]">
            <HiOutlineShoppingBag className="text-lg lg:text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderTabs;
