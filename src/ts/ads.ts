import type { AdsItem } from "./types";

const Ads = async () => {
  try {
    const data = await fetch(
      new URL("../components/AdsData/ads.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت بنرهای تبلیغاتی");
    }

    const response: AdsItem[] = await data.json();

    const firstRow = response.slice(0, 4);
    const secondRow = response.slice(4, 8);

    const firstRowContainer =
      document.querySelector<HTMLDivElement>("#ads-first-row");

    const secondRowContainer =
      document.querySelector<HTMLDivElement>("#ads-second-row");

    if (!firstRowContainer || !secondRowContainer) {
      return;
    }

    const firstRowAds = firstRow.map((item) => {
      const imagePath = `${import.meta.env.BASE_URL}${item.image}`;

      return `
        <a
          href="${item.url}"
          class="block h-full flex-1 overflow-hidden rounded-2xl mx-auto"
        >
          <img
            src="${imagePath}"
            alt="${item.alt}"
            class="h-full w-78.5 object-cover rounded-2xl"
          />
        </a>
      `;
    });

    const secondRowAds = secondRow.map((item) => {
      const imagePath = `${import.meta.env.BASE_URL}${item.image}`;

      return `
        <a
          href="${item.url}"
          class="block h-full flex-1 overflow-hidden rounded-2xl"
        >
          <img
            src="${imagePath}"
            alt="${item.alt}"
            class="h-full w-78.5 rounded-2xl object-cover"
          />
        </a>
      `;
    });

    firstRowContainer.innerHTML = firstRowAds.join("");
    secondRowContainer.innerHTML = secondRowAds.join("");
  } catch (error) {
    console.error(error);
  }
};

export default Ads;
