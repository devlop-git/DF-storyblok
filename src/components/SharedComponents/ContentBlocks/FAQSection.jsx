"use client";

import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { asset } from "@/utils/storyblok";

function FAQList({ faqItem, active, setActive }) {
  return (
    <div>
      {faqItem?.map((item, index) => {
        const isOpen = active === index;

        return (
          <div key={item?._uid ?? index} className="border-b border-[#E8DDCF]">
            <button
              onClick={() => setActive(isOpen ? null : index)}
              className="flex w-full items-center justify-between py-4 lg:py-5 text-left hover:cursor-pointer"
            >
              <span className="pr-8 text-base font-semibold leading-6 lg:leading-8 text-[#1D1D1B]">
                {item?.question}
              </span>

              {isOpen ? (
                <FiMinus className="h-5 w-5  shrink-0 text-[#1D1D1B]" />
              ) : (
                <FiPlus className="h-5 w-5 shrink-0 text-[#1D1D1B]" />
              )}
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] pb-8" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-4xl text-base  leading-6  text-[#333]">
                  {item?.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQSection({ data }) {
  const [active, setActive] = useState(null);
  const titlePosition = data?.titlePosition || "left";
  const image = asset(data?.image);

  if (titlePosition === "top") {
    return (
      <section className="bg-[#FAF7F3] py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-[28px] lg:text-[36px] text-[#1D1D1B]">
              {data?.title}
            </h2>

            <p className="mt-2 text-base text-[#1D1D1B]">{data?.description}</p>
          </div>

          <div
            className={`mt-10 gap-y-8 ${
              image
                ? "grid grid-cols-1 lg:grid-cols-[1fr_1fr] lg:gap-16 items-start"
                : ""
            }`}
          >
            {image && (
              <img
                src={image.filename}
                alt={image.alt || data?.title}
                className="block h-auto w-full object-cover"
              />
            )}

            <FAQList faqItem={data?.faqItem} active={active} setActive={setActive} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAF7F3] py-14 lg:py-18">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:mx-24 grid-cols-1 gap-y-6 lg:grid-cols-[440px_1fr] lg:gap-24">
          {/* Title */}
          <div className={titlePosition === "right" ? "lg:order-2" : "lg:order-1"}>
            <h2 className="font-serif text-[28px] text-center lg:text-left  lg:text-[36px] text-[#1D1D1B]">
              {data?.title}
            </h2>

            <p className=" text-base  text-[#1D1D1B]">{data?.description}</p>
          </div>

          {/* FAQs */}
          <div className={titlePosition === "right" ? "lg:order-1" : "lg:order-2"}>
            <FAQList faqItem={data?.faqItem} active={active} setActive={setActive} />
          </div>
        </div>
      </div>
    </section>
  );
}
