import Swiper from "swiper";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import type { ProductResponse } from "./types";

interface AmazingSectionConfig {
  sectionSelector: string;
  productFlag: "is_amazing" | "is_green_amazing";
  productLimit: number;
}

const sectionConfigs: AmazingSectionConfig[] = [
  {
    sectionSelector: ".amazing-red",
    productFlag: "is_amazing",
    productLimit: 10,
  },
  {
    sectionSelector: ".amazing-green",
    productFlag: "is_green_amazing",
    productLimit: 11,
  },
];

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

const startCountdown = (section: HTMLElement): void => {
  const hours = section.querySelector<HTMLSpanElement>("[data-amazing-hours]");
  const minutes = section.querySelector<HTMLSpanElement>(
    "[data-amazing-minutes]",
  );
  const seconds = section.querySelector<HTMLSpanElement>(
    "[data-amazing-seconds]",
  );

  if (!hours || !minutes || !seconds) return;

  let remainingSeconds = 23 * 60 * 60 + 59 * 60 + 59;

  const countdown = window.setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds -= 1;
    }

    const currentHours = Math.floor(remainingSeconds / 3600);
    const currentMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const currentSeconds = remainingSeconds % 60;

    hours.textContent = String(currentHours).padStart(2, "0");
    minutes.textContent = String(currentMinutes).padStart(2, "0");
    seconds.textContent = String(currentSeconds).padStart(2, "0");

    if (remainingSeconds === 0) {
      window.clearInterval(countdown);
    }
  }, 1000);
};

const Amazing = async (): Promise<void> => {
  try {
    const data = await fetch(
      new URL("../components/ProductData/products.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت محصولات شگفت‌انگیز");
    }

    const response: ProductResponse = await data.json();
    const tomanIcon = `${import.meta.env.BASE_URL}assets/images/amazing-red/Tooman.svg`;

    sectionConfigs.forEach((config) => {
      const section = document.querySelector<HTMLElement>(
        config.sectionSelector,
      );
      const wrapper = section?.querySelector<HTMLDivElement>(
        ".swiper-wrapper",
      );
      const swiperElement = section?.querySelector<HTMLElement>(
        ".amazing-swiper",
      );

      if (!section || !wrapper || !swiperElement) return;

      const sectionProducts = response
        .filter((item) => item[config.productFlag] && item.stock)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, config.productLimit);

      wrapper.innerHTML = sectionProducts
        .map((item, index) => {
          const currentPrice = Math.round(item.price / 10);
          const previousPrice =
            item.previous_price !== undefined
              ? Math.round(item.previous_price / 10)
              : item.discount > 0
              ? Math.round(currentPrice / (1 - item.discount / 100))
              : currentPrice;
          const radiusClass =
            index === 0
              ? "rounded-r-xl"
              : index === sectionProducts.length - 1
                ? "rounded-l-xl"
                : "";
          const discountBadge =
            item.discount > 0
              ? `<span class="inline-flex h-5 min-w-8 items-center justify-center rounded-full bg-[#d32f2f] px-1 text-center text-[12px] leading-none tracking-tighter text-white">${formatNumber(item.discount)}٪</span>`
              : "";
          const previousPriceMarkup =
            item.discount > 0
              ? `<div class="mb-1 flex items-center justify-end gap-1">
                ${discountBadge}
                <div class="text-left text-[16px] tracking-tighter text-[#c0c2c5] line-through">${formatNumber(previousPrice)}</div>
              </div>`
              : "";

          return `
          <div class="swiper-slide h-full! w-41! shrink-0 overflow-hidden bg-white ${radiusClass}">
            <a
              href="${escapeHtml(item.url)}"
              class="flex h-full flex-col px-3 py-2"
            >
              <div class="flex h-28 shrink-0 items-center justify-center lg:h-32.5">
                <img
                  src="${escapeHtml(resolveImageSource(item.image))}"
                  alt="${escapeHtml(item.title)}"
                  class="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              <h3 class="amazing-product-title mt-2 h-10 shrink-0 line-clamp-2 text-right text-[18px] leading-5 text-[#424750] sm:text-[20px]">
                ${escapeHtml(item.title)}
              </h3>

              <div class="mt-auto">
                ${previousPriceMarkup}

                <div class="mt-1 flex items-center justify-end">
                  <div class="text-[22px] font-extrabold tracking-tighter text-[#3f4064]">
                    ${formatNumber(currentPrice)}
                    <img
                      src="${tomanIcon}"
                      alt="تومان"
                      class="inline-block h-4 w-4 object-contain align-middle"
                    />
                  </div>
                </div>
              </div>
            </a>
          </div>
        `;
        })
        .join("");

      if (sectionProducts.length === 0) return;

      new Swiper(swiperElement, {
        modules: [Navigation],
        slidesPerView: "auto",
        spaceBetween: 3,
        slidesPerGroup: 1,
        loop: false,
        watchOverflow: true,
        navigation: {
          nextEl: section.querySelector<HTMLElement>(".amazing-swiper-next"),
          prevEl: section.querySelector<HTMLElement>(".amazing-swiper-prev"),
        },
      });

      startCountdown(section);
    });
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش محصولات شگفت‌انگیز:", error);
  }
};

export default Amazing;
