import { FaGift as Gift } from "react-icons/fa6";
import { HiOutlineSparkles as Sparkles } from "react-icons/hi2";
import { FaLock as Lock } from "react-icons/fa";
import { brand } from "@/brands";

export default function NewsletterSignup({ data }) {
  const benefits = (data.description ?? "")
    .split("\n")
    .filter((item) => item.trim() !== "");

  const icons = [Lock, Gift, Sparkles];

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-14 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-y-4  ">
          {/* Left Content */}
          <div>
            <h2 className="font-serif text-[28px] lg:text-[38px] leading-[1.08] font-light text-[#111]">
              {data.heading}
            </h2>

            <div className="mt-10 space-y-6">
              {benefits?.map((item, index) => {
                const Icon = icons[index] || Sparkles;

                return (
                  <div key={index} className="flex items-start gap-4">
                    <Icon size={18} className="text-brand-primary mt-1" />

                    <p className="text-[17px] text-[#333] leading-7">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Form */}
          <div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 ">Name</label>

                <input
                  type="text"
                  className="w-full border-0 border-b border-brand-primary bg-transparent focus:outline-none focus:border-black "
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  {brand.copy.newsletterBirthday}
                </label>

                <input
                  type="date"
                  className="w-full border-0 border-b border-brand-primary bg-transparent focus:outline-none focus:border-black pb-3"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  className="w-full border-0 border-b border-brand-primary bg-transparent focus:outline-none focus:border-black "
                />
              </div>

              <button
                type="submit"
                className="bg-brand-primary w-full lg:w-auto text-white px-8 py-4 font-medium hover:bg-brand-primary-hover transition-colors"
              >
                {data.btnLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
