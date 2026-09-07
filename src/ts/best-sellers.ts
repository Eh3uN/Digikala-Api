import Swiper from "swiper";
import { A11y, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import type { BestSellersResponse } from "./types";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

const formatRank = (rank: number): string =>
  String(rank).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);

const resolveImageSource = (source: string): string => {
  if (!source.startsWith("/assets/")) return source;

  return `${import.meta.env.BASE_URL}${source.slice(1)}`;
};

const BestSellers = async (): Promise<void> => {
  const container = document.querySelector<HTMLDivElement>("#best-sellers");

  if (!container) return;

  try {
    const data = await fetch(
      new URL("../components/BestSellersData/best-sellers.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت محصولات پرفروش");
    }

    const response: BestSellersResponse = await data.json();
    const products = [...response.products].sort((a, b) => a.rank - b.rank);
    const columns = Array.from(
      { length: Math.ceil(products.length / 3) },
      (_, index) => products.slice(index * 3, index * 3 + 3),
    );

    const slides = columns.map(
      (column) => `
        <div class="swiper-slide">
          <div class="grid grid-rows-[repeat(3,88px)] gap-y-4">
            ${column
              .map(
                (item) => `
                  <a
                    href="${escapeHtml(item.url)}"
                    class="flex min-w-0 items-center gap-2"
                    aria-label="${formatRank(item.rank)}. ${escapeHtml(item.title)}"
                  >
                    <img
                      src="${escapeHtml(resolveImageSource(item.image))}"
                      alt="${escapeHtml(item.title)}"
                      width="600"
                      height="600"
                      class="h-22 w-22 shrink-0 object-contain"
                      loading="lazy"
                    />
                    <h3 class="line-clamp-2 min-w-0 text-right text-[17px] leading-[26px] text-[#62648c]" title="${escapeHtml(item.title)}">
                      <span
                        class="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ef4056] align-middle text-[18px] leading-none text-white"
                        aria-hidden="true"
                      >${formatRank(item.rank)}</span>
                      ${escapeHtml(item.title)}
                    </h3>
                  </a>
                `,
              )
              .join("")}
          </div>
        </div>
      `,
    );

    container.innerHTML = `
      <div class="flex items-center gap-2 px-4 pt-5 pb-6 lg:px-6">
        <svg class="h-6 w-6 shrink-0 fill-current text-[#ff2d12]" viewBox="0 0 24 24" aria-hidden="true">
          <use href="${import.meta.env.BASE_URL}assets/images/header/Navbar/mostSellings.svg#searchTrend"></use>
        </svg>
        <h2 id="best-sellers-title" class="text-[22px] leading-8 text-[#0c0c0c] lg:text-[26px]">${escapeHtml(response.title)}</h2>
      </div>

      <div class="swiper best-sellers-swiper relative px-4! pb-6! lg:px-6!" dir="rtl">
        <div class="swiper-wrapper">${slides.join("")}</div>
        <button
          type="button"
          class="best-sellers-prev absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e0e0e2] bg-white text-lg text-[#81858b] [&.swiper-button-disabled]:invisible [&.swiper-button-disabled]:opacity-0 [&.swiper-button-lock]:hidden"
          aria-label="محصولات قبلی"
        >
          <span aria-hidden="true" class="[direction:ltr] [unicode-bidi:isolate]">❯</span>
        </button>
        <button
          type="button"
          class="best-sellers-next absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e0e0e2] bg-white text-lg text-[#81858b] [&.swiper-button-disabled]:invisible [&.swiper-button-disabled]:opacity-0 [&.swiper-button-lock]:hidden"
          aria-label="محصولات بعدی"
        >
          <span aria-hidden="true" class="[direction:ltr] [unicode-bidi:isolate]">❮</span>
        </button>
      </div>
    `;

    const swiperElement = container.querySelector<HTMLElement>(
      ".best-sellers-swiper",
    );

    if (!swiperElement || products.length === 0) return;

    new Swiper(swiperElement, {
      modules: [Navigation, A11y],
      slidesPerView: 1,
      spaceBetween: 16,
      slidesPerGroup: 1,
      loop: false,
      watchOverflow: true,
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 4 },
      },
      navigation: {
        nextEl: container.querySelector<HTMLElement>(".best-sellers-next"),
        prevEl: container.querySelector<HTMLElement>(".best-sellers-prev"),
      },
      a11y: {
        prevSlideMessage: "محصولات قبلی",
        nextSlideMessage: "محصولات بعدی",
        firstSlideMessage: "اولین محصولات پرفروش",
        lastSlideMessage: "آخرین محصولات پرفروش",
        slideLabelMessage: "ستون {{index}} از {{slidesLength}}",
      },
    });
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش محصولات پرفروش:", error);
  }
};

export default BestSellers;
