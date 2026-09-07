import Swiper from "swiper";
import { A11y, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import type { YourTasteResponse } from "./types";

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

const formatNumber = (value: number): string =>
  value
    .toLocaleString("en-US")
    .replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);

const resolveImageSource = (source: string): string => {
  if (!source.startsWith("/assets/")) return source;

  return `${import.meta.env.BASE_URL}${source.slice(1)}`;
};

const YourTaste = async (): Promise<void> => {
  const container = document.querySelector<HTMLDivElement>("#your-taste");

  if (!container) return;

  try {
    const data = await fetch(
      new URL("../components/YourTasteData/your-taste.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت محصولات بر اساس سلیقه شما");
    }

    const response: YourTasteResponse = await data.json();
    const products = [...response.products].sort(
      (a, b) => a.priority - b.priority,
    );
    const tomanIcon = `${import.meta.env.BASE_URL}assets/images/amazing-red/Tooman.svg`;

    const slides = products.map((item) => {
      const hasDiscount =
        item.price !== null &&
        item.previous_price !== null &&
        item.previous_price > item.price &&
        item.discount > 0;
      const discountMarkup = hasDiscount
        ? `<div class="flex items-center justify-end gap-1">
            <span class="inline-flex h-4 min-w-7 items-center justify-center rounded-full bg-[#d32f2f] px-1 text-[14px] leading-none text-white">${formatNumber(item.discount)}٪</span>
            <del class="text-[14px] leading-4 text-[#c0c2c5]" dir="ltr">${formatNumber(Math.round(item.previous_price! / 10))}</del>
          </div>`
        : "";
      const priceMarkup =
        item.price !== null
          ? `${discountMarkup}
            <div class="flex items-center justify-end gap-1 text-[22px] font-extrabold leading-6 text-[#3f4064]">
              <span dir="ltr">${formatNumber(Math.round(item.price / 10))}</span>
              <img src="${tomanIcon}" alt="تومان" class="h-4 w-4 shrink-0" />
            </div>`
          : `<span class="block text-left text-[14px] leading-6 text-[#19bfd3]">${escapeHtml(response.product_link_label)}</span>`;

      return `
        <div class="swiper-slide h-[276px]! w-[164px]! shrink-0 overflow-hidden rounded-lg border border-[#f0f0f1] bg-white">
          <a href="${escapeHtml(item.url)}" class="flex h-full flex-col px-2 py-2">
            <img
              src="${escapeHtml(resolveImageSource(item.image))}"
              alt="${escapeHtml(item.title)}"
              width="600"
              height="600"
              class="h-40 w-full shrink-0 object-contain"
              loading="lazy"
            />
            <h3 class="mt-2 line-clamp-2 h-13 shrink-0 text-right text-[18px] leading-[26px] text-[#62666d] sm:text-[20px]" title="${escapeHtml(item.title)}">
              ${escapeHtml(item.title)}
            </h3>
            <div class="mt-auto">${priceMarkup}</div>
          </a>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="flex items-start justify-between gap-3 px-4 pt-4 pb-5 lg:px-6">
        <div class="min-w-0">
          <h2 id="your-taste-title" class="text-[22px] leading-8 text-[#0c0c0c] lg:text-[26px]">${escapeHtml(response.title)}</h2>
          <p class="text-[16px] leading-6 text-[#81858b]">${escapeHtml(response.subtitle)}</p>
        </div>
        <a href="${escapeHtml(response.view_all.url)}" class="flex shrink-0 items-center gap-2 rounded-lg bg-[#f0f0f1] px-3 py-2 text-[14px] leading-6 text-[#3f4064] sm:px-4 sm:text-[16px]">
          ${escapeHtml(response.view_all.label)}
          <span aria-hidden="true" class="[direction:ltr] [unicode-bidi:isolate]">❮</span>
        </a>
      </div>

      <div class="swiper your-taste-swiper relative px-4! pb-4! lg:px-6! lg:pb-6!" dir="rtl">
        <div class="swiper-wrapper">${slides.join("")}</div>
        <button
          type="button"
          class="your-taste-prev absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e0e0e2] bg-white text-lg text-[#81858b] [&.swiper-button-disabled]:invisible [&.swiper-button-disabled]:opacity-0 [&.swiper-button-lock]:hidden"
          aria-label="محصولات قبلی"
        >
          <span aria-hidden="true" class="[direction:ltr] [unicode-bidi:isolate]">❯</span>
        </button>
        <button
          type="button"
          class="your-taste-next absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e0e0e2] bg-white text-lg text-[#81858b] [&.swiper-button-disabled]:invisible [&.swiper-button-disabled]:opacity-0 [&.swiper-button-lock]:hidden"
          aria-label="محصولات بعدی"
        >
          <span aria-hidden="true" class="[direction:ltr] [unicode-bidi:isolate]">❮</span>
        </button>
      </div>
    `;

    const swiperElement = container.querySelector<HTMLElement>(
      ".your-taste-swiper",
    );

    if (!swiperElement || products.length === 0) return;

    new Swiper(swiperElement, {
      modules: [Navigation, A11y],
      slidesPerView: "auto",
      spaceBetween: 12,
      slidesPerGroup: 1,
      loop: false,
      watchOverflow: true,
      navigation: {
        nextEl: container.querySelector<HTMLElement>(".your-taste-next"),
        prevEl: container.querySelector<HTMLElement>(".your-taste-prev"),
      },
      a11y: {
        prevSlideMessage: "محصولات قبلی",
        nextSlideMessage: "محصولات بعدی",
        firstSlideMessage: "اولین محصول",
        lastSlideMessage: "آخرین محصول",
        slideLabelMessage: "محصول {{index}} از {{slidesLength}}",
      },
    });
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش محصولات بر اساس سلیقه شما:", error);
  }
};

export default YourTaste;
