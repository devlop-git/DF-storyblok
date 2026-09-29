"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { firstAsset } from "@/utils/storyblok";

const AUTO_ADVANCE_MS = 3000;
const TRANSITION_MS = 250;

export default function InstagramFeed({ data }) {
  const title = data?.title ?? "";
  const [prefix, handle] = title.split("@");
  const posts = data?.posts ?? [];

  // Rendered twice back-to-back so the track can keep sliding past the
  // "real" last post into a lookalike copy of the first one -- that's what
  // lets the carousel loop forever instead of snapping backwards once it
  // runs out of posts. A single post doesn't slide, so it's shown once.
  const loopPosts = posts.length > 1 ? [...posts, ...posts] : posts;

  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  // Measures the actual on-screen distance between two posts (item width +
  // gap) rather than hardcoding a pixel value -- the column count changes
  // per breakpoint (2/3/5 up), so the step size has to be re-measured
  // whenever the layout does.
  useEffect(() => {
    if (posts.length < 2) return;

    const measure = () => {
      const track = trackRef.current;
      if (!track || track.children.length < 2) return;
      const first = track.children[0].getBoundingClientRect();
      const second = track.children[1].getBoundingClientRect();
      setStep(second.left - first.left);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [posts.length]);

  // No visible arrows -- the carousel just keeps advancing on its own.
  useEffect(() => {
    if (posts.length < 2) return;
    const id = setInterval(() => setIndex((i) => i + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [posts.length]);

  // Once the track has slid through all the real posts and onto the cloned
  // set, snap it back to the start with the transition switched off so the
  // reset is invisible, then switch the transition back on for the next step.
  useEffect(() => {
    if (index !== posts.length) return;
    const resetTimer = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(resetTimer);
  }, [index, posts.length]);

  useEffect(() => {
    if (withTransition) return;
    const raf = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(raf);
  }, [withTransition]);

  return (
    <section className="bg-white  ">
      <div className="max-w-7xl mx-auto px-6 lg:px-0">
        {/* Heading */}
        <div className="mb-14 text-center">
          {title && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-x-4">
              <h2 className="font-serif text-3xl font-light text-[#111] sm:text-4xl lg:text-[36px]">
                {prefix}
              </h2>
              {handle && (
                <span className="text-[#A5744A] text-[28px] lg:text-[36px]">
                  @{handle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Instagram Posts */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex flex-nowrap gap-8"
            style={{
              transform: `translate3d(-${index * step}px, 0px, 0px)`,
              transition: withTransition ? `transform ${TRANSITION_MS}ms ease` : "none",
            }}
          >
            {loopPosts.map((post, i) => {
              const imageForDesktop = firstAsset(post?.desktopInstaImage);
              const imageForMobile = firstAsset(post?.mobileInstaImage);
              const imageForTablet = firstAsset(post?.tabInstaImage);

              return (
                <Link
                  key={`${post._uid}-${i}`}
                  href={post.instaURL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#F8F8F8]">
                    {imageForDesktop && (
                      <Image
                        src={imageForDesktop.filename}
                        alt={imageForDesktop.alt || "Instagram Post"}
                        fill
                        priority={false}
                        className="hidden object-cover transition-transform duration-500 lg:block"
                      />
                    )}

                    {imageForTablet && (
                      <Image
                        src={imageForTablet.filename}
                        alt={imageForTablet.alt || "Instagram Post"}
                        fill
                        priority={false}
                        className="hidden object-cover transition-transform duration-500 md:block lg:hidden"
                      />
                    )}

                    {imageForMobile && (
                      <Image
                        src={imageForMobile.filename}
                        alt={imageForMobile.alt || "Instagram Post"}
                        fill
                        priority={false}
                        className="object-cover transition-transform duration-500 md:hidden"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/0 transition duration-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
