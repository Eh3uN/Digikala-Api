interface ProductGroupItem {
  id: number;
  priority: number;
  title: string;
  url: string;
  src: string;
}

interface ProductGroupResponse {
  categories: ProductGroupItem[];
}

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

const resolveImageSource = (source: string): string => {
  if (!source.startsWith("/assets/")) return source;

  return `${import.meta.env.BASE_URL}${source.slice(1)}`;
};

const Categories = async (): Promise<void> => {
  const container = document.querySelector<HTMLDivElement>("#product-groups");

  if (!container) return;

  try {
    const data = await fetch(
      new URL("../components/ProductData/productGroup.json", import.meta.url),
    );

    if (!data.ok) {
      throw new Error("خطا در دریافت دسته‌بندی محصولات");
    }

    const response: ProductGroupResponse = await data.json();
    const categories = [...response.categories].sort(
      (a, b) => a.priority - b.priority,
    );

    container.innerHTML = categories
      .map(
        (item) => `
          <a
            href="${escapeHtml(item.url)}"
            class="group flex min-w-0 flex-col items-center gap-1 text-center"
          >
            <img
              src="${escapeHtml(resolveImageSource(item.src))}"
              alt="${escapeHtml(item.title)}"
              class="aspect-square h-auto w-[100px] max-w-full rounded-full object-contain transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            <span class="min-h-10 text-[14px] leading-5 text-[#3f4064] sm:text-[15px] lg:text-[16px]">
              ${escapeHtml(item.title)}
            </span>
          </a>
        `,
      )
      .join("");
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش دسته‌بندی محصولات:", error);
  }
};

export default Categories;
