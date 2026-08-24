import Swiper from "swiper";
import {
  A11y,
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { SliderResponse } from "./types";

const Slider = async (): Promise<void> => {
  try {
    const data = await fetch(
      new URL("../components/SliderData/slider.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت اطلاعات اسلایدر");
    }

    const response: SliderResponse = await data.json();

    const activeSlides = response
      .filter((item) => item.active)
      .sort((a, b) => a.priority - b.priority);

    const slides = activeSlides.map((item, index) => {
      const imagePath = `${import.meta.env.BASE_URL}${item.images.desktop}`;

      return `
        <div class="swiper-slide" data-slide-id="${item.id}">
          <a
            href="${item.url}"
            class="hero-swiper-link"
            aria-label="${item.title}"
          >
            <img
              class="hero-swiper-image"
              src="${imagePath}"
              alt="${item.alt}"
              title="${item.title}"
              loading="${index === 0 ? "eager" : "lazy"}"
            />
          </a>
        </div>
      `;
    });

    const wrapper = document.querySelector<HTMLDivElement>(
      ".hero-swiper .swiper-wrapper",
    );

    if (!wrapper) return;

    wrapper.innerHTML = slides.join("");

    const hasMultipleSlides = activeSlides.length > 1;
    const pagination = document.querySelector<HTMLDivElement>(
      ".hero-swiper-pagination",
    );
    const previousButton = document.querySelector<HTMLButtonElement>(
      ".hero-swiper-prev",
    );
    const nextButton = document.querySelector<HTMLButtonElement>(
      ".hero-swiper-next",
    );

    pagination?.toggleAttribute("hidden", !hasMultipleSlides);
    previousButton?.toggleAttribute("hidden", !hasMultipleSlides);
    nextButton?.toggleAttribute("hidden", !hasMultipleSlides);

    if (activeSlides.length === 0) return;

    new Swiper(".hero-swiper", {
      modules: [Navigation, Pagination, Autoplay, Keyboard, A11y],
      slidesPerView: 1,
      loop: hasMultipleSlides,
      speed: 500,
      autoplay: hasMultipleSlides
        ? {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }
        : false,
      navigation: {
        nextEl: ".hero-swiper-next",
        prevEl: ".hero-swiper-prev",
      },
      pagination: {
        el: ".hero-swiper-pagination",
        clickable: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      a11y: {
        enabled: true,
      },
    });
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش اسلایدر:", error);
  }
};

export default Slider;
