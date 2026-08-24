import type {
  BannerResponse,
  HeaderResponse,
  MenuItem,
  MenuResponse,
} from "./types";

const imagePath = (path: string): string => {
  return `${import.meta.env.BASE_URL}${path}`;
};

const createMegaMenu = (item: MenuItem): string => {
  const categories = [...item.submenu].sort(
    (a, b) => a.priority - b.priority,
  );
  const activeCategory = categories.find(
    (category) => category.submenu.length > 0,
  );

  const categoryItems = categories
    .map((category) => {
      const icon = category.icon
        ? `<img src="${imagePath(category.icon)}" alt="" title="${category.title}" class="h-5 w-5" />`
        : "";
      const hasContent = category.submenu.length > 0;
      const isActive = category.id === activeCategory?.id;
      const categoryClass =
        isActive
          ? "flex h-13 items-center justify-start gap-2 bg-white px-5 font-yekan text-[16px] text-[#ef394e]"
          : "flex h-13 items-center justify-start gap-2 px-5 font-yekan text-[16px] hover:bg-white hover:text-[#ef394e]";
      const categoryData = hasContent
        ? `data-mega-category-id="${category.id}" aria-controls="mega-content-${category.id}" aria-selected="${isActive}"`
        : "";

      return `
        <a href="${category.url}" class="${categoryClass}" data-menu-type="${category.type}" ${categoryData}>
          ${icon}<span>${category.title}</span>
        </a>
      `;
    })
    .join("");

  const megaContents = categories
    .filter((category) => category.submenu.length > 0)
    .map((category) => {
      const columns = [...category.submenu]
        .sort((a, b) => a.priority - b.priority)
        .map((column) => {
          const links = [...column.submenu]
            .sort((a, b) => a.priority - b.priority)
            .map((link) => {
              return `
                <li>
                  <a href="${link.url}" class="font-yekan hover:text-[#ef394e]" data-menu-type="${link.type}">${link.title}</a>
                </li>
              `;
            })
            .join("");

          return `
            <div>
              <a href="${column.url}" class="mb-4 flex items-center gap-2 text-[17px] font-yekan text-[#23254e] hover:text-[#ef394e]" data-menu-type="${column.type}">
                <span class="h-4 w-0.5 rounded-full bg-[#ef394e]"></span>
                <span>${column.title} ‹</span>
              </a>
              <ul class="space-y-2.5 text-[15px] font-yekan text-[#81858b]">${links}</ul>
            </div>
          `;
        })
        .join("");

      return `
        <div id="mega-content-${category.id}" data-mega-content-id="${category.id}" class="h-full flex-1 overflow-y-auto bg-white px-8 py-6" ${category.id === activeCategory?.id ? "" : "hidden"}>
          <a href="${category.url}" class="mb-7 inline-flex items-center text-[14px] font-yekan text-[#1976d2]" data-menu-type="${category.type}">
            ${category.allLabel ?? category.title} ‹
          </a>
          <div class="grid grid-cols-4 gap-x-14 gap-y-7">${columns}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="header-mega-menu absolute right-0 top-full z-50 hidden h-[calc(100vh-205px)] max-h-155 min-h-130 w-[calc(100vw-48px)] max-w-340 overflow-hidden rounded-b-lg bg-white text-right font-yekan text-[14px] leading-7 text-[#3f4064] shadow-[0_8px_28px_rgba(0,0,0,0.18)] group-hover:flex">
      <aside class="h-full w-64 shrink-0 overflow-y-auto border-l border-[#e0e0e2] bg-[#f5f5f5] py-2 text-[#3f4064]">
        ${categoryItems}
      </aside>
      ${megaContents}
    </div>
  `;
};

const createDesktopMenu = (items: MenuItem[]): string => {
  const divider =
    '<span class="h-4.5 w-[0.5px] shrink-0 bg-[#d6d5d5]" aria-hidden="true"></span>';

  return [...items]
    .sort((a, b) => a.priority - b.priority)
    .map((item) => {
      const dividerBefore = item.divider === "before" ? divider : "";
      const dividerAfter = item.divider === "after" ? divider : "";
      const isCategory = item.variant === "category" && item.mega;
      const icon = item.icon
        ? `<img src="${imagePath(item.icon)}" alt="" title="${item.title}" class="${isCategory ? "h-5 w-5" : "h-4.5 w-4.5"}" />`
        : "";

      const menuItem = isCategory
        ? `
            <div class="header-navbar-category group flex items-center gap-1" data-menu-id="${item.id}">
              ${icon}
              <a href="${item.url}" class="font-yekan relative flex h-full items-center whitespace-nowrap text-[18px] text-[#3f4064]" data-menu-type="${item.type}" aria-haspopup="true" aria-expanded="false">${item.title}</a>
              ${createMegaMenu(item)}
            </div>
          `
        : `
            <div class="${
              item.variant === "service"
                ? "header-navbar-services items-center"
                : "header-navbar-item flex items-center gap-2"
            }" data-menu-id="${item.id}">
              ${icon}
              <a href="${item.url}" class="text-[#62666d]" data-menu-type="${item.type}">${item.title}</a>
            </div>
          `;

      return `${dividerBefore}${menuItem}${dividerAfter}`;
    })
    .join("");
};

const createMobileMenu = (items: MenuItem[], depth = 0): string => {
  const listClass =
    depth === 0
      ? "space-y-1"
      : "mt-2 space-y-1 border-r border-[#e0e0e2] pr-3";

  const menuItems = [...items]
    .sort((a, b) => a.priority - b.priority)
    .map((item) => {
      if (item.submenu.length === 0) {
        return `
          <li data-menu-id="${item.id}">
            <a href="${item.url}" class="block rounded-lg px-3 py-2 text-[14px] text-[#3f4064] hover:bg-[#f5f5f5] hover:text-[#ef394e]" data-menu-type="${item.type}">${item.title}</a>
          </li>
        `;
      }

      return `
        <li data-menu-id="${item.id}">
          <details class="group/mobile">
            <summary class="cursor-pointer list-none rounded-lg px-3 py-2 text-[15px] font-bold text-[#3f4064] hover:bg-[#f5f5f5] hover:text-[#ef394e]">${item.title}</summary>
            <a href="${item.url}" class="mr-3 mt-1 block text-[13px] text-[#1976d2] hover:text-[#ef394e]" data-menu-type="${item.type}">مشاهده همه ${item.title}</a>
            ${createMobileMenu(item.submenu, depth + 1)}
          </details>
        </li>
      `;
    })
    .join("");

  return `<ul data-menu-depth="${depth}" class="${listClass}">${menuItems}</ul>`;
};

const Header = async (): Promise<void> => {
  try {
    const [headerRequest, bannerRequest, menuRequest] = await Promise.all([
      fetch(new URL("../components/Header/header.json", import.meta.url)),
      fetch(new URL("../components/Header/banner.json", import.meta.url)),
      fetch(new URL("../components/Header/menu.json", import.meta.url)),
    ]);

    if (!headerRequest.ok || !bannerRequest.ok || !menuRequest.ok) {
      throw new Error("خطا در دریافت اطلاعات هدر");
    }

    const [headerResponse, bannerResponse, menuResponse]: [
      HeaderResponse,
      BannerResponse,
      MenuResponse,
    ] = await Promise.all([
      headerRequest.json(),
      bannerRequest.json(),
      menuRequest.json(),
    ]);

    const header = headerResponse.header;
    document.title = header.seo.title;

    const description =
      document.querySelector<HTMLMetaElement>("#seo-description");
    const keywords = document.querySelector<HTMLMetaElement>("#seo-keywords");
    const heading =
      document.querySelector<HTMLHeadingElement>("#header-heading");
    if (description) description.content = header.seo.description;
    if (keywords) keywords.content = header.seo.keywords.join(", ");
    if (heading) heading.textContent = header.heading1;

    const headerLogo = document.querySelector<HTMLAnchorElement>("#header-logo");
    if (headerLogo) {
      headerLogo.href = import.meta.env.BASE_URL;
      headerLogo.title = header.company.logo.title;
      headerLogo.setAttribute("aria-label", header.company.name);
      headerLogo.innerHTML = `
        <picture>
          <source media="(min-width: 768px)" srcset="${imagePath(header.company.logo.desktop)}" />
          <img src="${imagePath(header.company.logo.mobile)}" alt="${header.company.logo.alt}" title="${header.company.logo.title}" class="h-7 w-auto max-w-42 lg:h-7.5 lg:max-w-48.75" />
        </picture>
      `;
    }

    const headerBanner =
      document.querySelector<HTMLDivElement>("#header-banner");
    if (headerBanner) {
      const banners = bannerResponse.banner
        .filter((item) => item.active)
        .sort((a, b) => a.priority - b.priority)
        .map((item) => {
          const bannerUrl =
            item.url === "/" ? import.meta.env.BASE_URL : item.url;

          return `
            <a href="${bannerUrl}" title="${item.title}" aria-label="${item.title}" data-banner-id="${item.id}" data-priority="${item.priority}" class="block w-full">
              <picture>
                <source media="(min-width: 768px)" srcset="${imagePath(item.images.desktop)}" />
                <img src="${imagePath(item.images.mobile)}" alt="${item.alt}" title="${item.title}" class="h-10 w-full object-cover sm:h-12 lg:h-15" />
              </picture>
            </a>
          `;
        })
        .join("");

      headerBanner.innerHTML = banners;
      headerBanner.hidden = banners.length === 0;
    }

    const desktopMenu = document.querySelector<HTMLElement>("#desktop-menu");
    const mobileMenu = document.querySelector<HTMLElement>("#mobile-menu");
    if (desktopMenu) {
      desktopMenu.innerHTML = createDesktopMenu(menuResponse.menu);

      const activeCategoryClass =
        "flex h-13 items-center justify-start gap-2 bg-white px-5 font-yekan text-[16px] text-[#ef394e]";
      const categoryClass =
        "flex h-13 items-center justify-start gap-2 px-5 font-yekan text-[16px] hover:bg-white hover:text-[#ef394e]";
      const categoryLinks =
        desktopMenu.querySelectorAll<HTMLAnchorElement>(
          "[data-mega-category-id]",
        );

      for (const categoryLink of categoryLinks) {
        for (const eventName of ["mouseenter", "focus"] as const) {
          categoryLink.addEventListener(eventName, () => {
            const megaMenu = categoryLink.closest<HTMLElement>(
              ".header-mega-menu",
            );
            const categoryId = categoryLink.dataset.megaCategoryId;
            if (!megaMenu || !categoryId) return;

            for (const link of megaMenu.querySelectorAll<HTMLAnchorElement>(
              "[data-mega-category-id]",
            )) {
              const isActive = link.dataset.megaCategoryId === categoryId;
              link.className = isActive ? activeCategoryClass : categoryClass;
              link.setAttribute("aria-selected", String(isActive));
            }

            for (const content of megaMenu.querySelectorAll<HTMLElement>(
              "[data-mega-content-id]",
            )) {
              content.hidden = content.dataset.megaContentId !== categoryId;
            }
          });
        }
      }
    }
    if (mobileMenu) mobileMenu.innerHTML = createMobileMenu(menuResponse.menu);

    const mobileMenuToggle =
      document.querySelector<HTMLButtonElement>("#mobile-menu-toggle");
    const mobileMenuPanel = document.querySelector<HTMLElement>(
      "#mobile-menu-panel",
    );

    if (mobileMenuToggle && mobileMenuPanel) {
      mobileMenuToggle.addEventListener("click", () => {
        const isOpen = !mobileMenuPanel.hidden;
        mobileMenuPanel.hidden = isOpen;
        mobileMenuToggle.setAttribute("aria-expanded", String(!isOpen));
      });
    }
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش اطلاعات هدر:", error);
  }
};

export default Header;
