import Swiper from "swiper";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import type { ProductResponse } from "./types";

const Amazing = async (): Promise<void> => {
  try {
    const data = await fetch(
      new URL("../../dbdbdb/ProductData/products.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت محصولات شگفت‌انگیز");
    }

    const response: ProductResponse = await data.json();
    const amazingProducts = response
      .filter((item) => item.is_amazing && item.stock)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 10);

    const wrapper = document.querySelector<HTMLDivElement>(
      ".amazing-swiper .swiper-wrapper",
    );
    const swiperElement = document.querySelector<HTMLElement>(
      ".amazing-swiper",
    );

    if (!wrapper || !swiperElement) return;

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
const tomanIcon = `${import.meta.env.BASE_URL}assets/images/amazing/Tooman.svg`;

    wrapper.innerHTML = amazingProducts
      .map((item, index) => {
        const currentPrice = Math.round(item.price / 10);
        const previousPrice =
          item.discount > 0
            ? Math.round(currentPrice / (1 - item.discount / 100))
            : currentPrice;
        const radiusClass =
          index === 0
            ? "rounded-r-xl"
            : index === amazingProducts.length - 1
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
          <div class="swiper-slide h-68.5! w-41! shrink-0 overflow-hidden bg-white ${radiusClass}">
            <a
              href="${escapeHtml(item.url)}"
              class="flex h-full flex-col px-3 py-2"
            >
              <div class="flex h-32.5 shrink-0 items-center justify-center">
                <img
                  src="${escapeHtml(item.image)}"
                  alt="${escapeHtml(item.title)}"
                  class="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              <h3 class="amazing-product-title mt-2 h-10 line-clamp-2 text-right text-[20px] leading-5 text-[#424750]">
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

    if (amazingProducts.length === 0) return;

    new Swiper(swiperElement, {
      modules: [Navigation],
      slidesPerView: "auto",
      spaceBetween: 3,
      slidesPerGroup: 1,
      loop: false,
      watchOverflow: true,
      navigation: {
        nextEl: ".amazing-swiper-next",
        prevEl: ".amazing-swiper-prev",
      },
    });

    const hours = document.querySelector<HTMLSpanElement>("#amazing-hours");
    const minutes =
      document.querySelector<HTMLSpanElement>("#amazing-minutes");
    const seconds =
      document.querySelector<HTMLSpanElement>("#amazing-seconds");

    if (hours && minutes && seconds) {
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
    }
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش محصولات شگفت‌انگیز:", error);
  }
};

export default Amazing;
