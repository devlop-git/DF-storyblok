"use client";

import { useState } from "react";

// Same styles as the Strapi version's custom rich-text blocks
// (h1/h2 large, h3+ smaller, everything centred).
const expandedClassName =
  "text-center [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h4]:font-serif [&_h1]:text-[24px] [&_h2]:text-[24px] lg:[&_h1]:text-[28px] lg:[&_h2]:text-[28px] [&_h1]:my-4 [&_h2]:my-4 lg:[&_h1]:my-2 lg:[&_h2]:my-2 [&_h3]:text-[20px] [&_h4]:text-[20px] lg:[&_h3]:text-[22px] lg:[&_h4]:text-[22px] [&_h3]:my-3 [&_h4]:my-3 [&_h1]:leading-tight [&_h2]:leading-tight [&_h3]:leading-tight [&_h1]:text-[#1D1D1D] [&_h2]:text-[#1D1D1D] [&_h3]:text-[#1D1D1D] [&_p]:text-[16px] [&_p]:my-3 lg:[&_p]:leading-8 [&_p]:text-[#262626] [&_blockquote]:italic [&_ul]:my-3 [&_ol]:my-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:items-center [&_ol]:flex [&_ol]:flex-col [&_ol]:items-center [&_li]:text-[16px] [&_li]:text-[#262626] [&_a]:text-[#A0704F] [&_a]:underline";

export default function ReadMoreContentClient({ data, expandedHtml }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={` transition-all duration-500 `}>
      <div
        className={`mx-auto  flex max-w-7xl flex-col justify-center px-5   md:px-8 lg:px-12 transition-all duration-500`}
      >
        {/* Heading */}
        <h2 className="text-center font-serif text-2xl md:text-3xl leading-tight text-[#1D1D1D] lg:text-4xl lg:leading-15">
          {data?.title}
        </h2>

        {/* Description */}
        <div className="mx-auto mt-8 max-w-5xl">
          <p className="text-center line-clamp-3  text-[16px] lg:leading-6 text-[#262626] ">
            {data?.previewContent}
          </p>

          {expanded && expandedHtml && (
            <div
              className={expandedClassName}
              dangerouslySetInnerHTML={{ __html: expandedHtml }}
            />
          )}

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[18px] hover:cursor-pointer font-medium text-[#A0704F] transition "
            >
              {expanded ? data?.readLessLabel : data?.readMoreLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
