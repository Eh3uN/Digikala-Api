import type { AdsItem } from "./types";

const WideBanners = async (): Promise<void> => {
  const container = document.querySelector<HTMLDivElement>("#wide-banners");

  if (!container) return;

  try {
    const data = await fetch(
      new URL("../components/WideBannersData/wide-banners.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت بنرهای عریض");
    }

    const response: AdsItem[] = await data.json();

    container.innerHTML = response
      .map((item) => {
        const imagePath = `${import.meta.env.BASE_URL}${item.image}`;

        return `
          <a
            href="${item.url}"
            class="block min-w-0 overflow-hidden rounded-2xl"
          >
            <img
              src="${imagePath}"
              alt="${item.alt}"
              width="820"
              height="328"
              class="block h-auto w-full"
              loading="lazy"
            />
          </a>
        `;
      })
      .join("");
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش بنرهای عریض:", error);
  }
};

export default WideBanners;
