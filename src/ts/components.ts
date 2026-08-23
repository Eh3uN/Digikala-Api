import type {
  BannerItem,
  HeaderData,
  HeaderResources,
  MenuItem,
} from "./types";

type MenuVariant = "desktop" | "mobile";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function safeUrl(value: string, fallback: string): string {
  try {
    const url = new URL(value, document.baseURI);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function sortByPriority<T extends { priority: number }>(items: T[]): T[] {
  return [...items].sort((first, second) => first.priority - second.priority);
}

function createImage(
  source: string,
  alt: string,
  title: string,
  className: string,
): HTMLImageElement {
  const image = document.createElement("img");
  image.src = safeUrl(source, "");
  image.alt = alt;
  image.title = title;
  image.className = className;
  return image;
}

function createResponsivePicture(
  desktop: string,
  mobile: string,
  alt: string,
  title: string,
  imageClassName: string,
): HTMLPictureElement {
  const picture = document.createElement("picture");
  const desktopSource = document.createElement("source");
  desktopSource.media = "(min-width: 768px)";
  desktopSource.srcset = safeUrl(desktop, "");

  picture.append(
    desktopSource,
    createImage(mobile, alt, title, imageClassName),
  );
  return picture;
}

function createLink(item: MenuItem, className: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = safeUrl(item.url, "#");
  link.textContent = item.title;
  link.className = className;
  link.dataset.menuType = item.type;
  return link;
}

function createMenuIcon(item: MenuItem, className: string): HTMLImageElement | null {
  if (!item.icon) return null;

  return createImage(item.icon, "", item.title, className);
}

function createDivider(): HTMLSpanElement {
  const divider = document.createElement("span");
  divider.className = "h-4.5 w-[0.5px] shrink-0 bg-[#d6d5d5]";
  divider.setAttribute("aria-hidden", "true");
  return divider;
}

function createMegaContent(category: MenuItem): HTMLDivElement {
  const content = document.createElement("div");
  content.className = "h-full flex-1 overflow-y-auto bg-white px-8 py-6";

  const allProducts = createLink(
    category,
    "mb-7 inline-flex items-center text-[14px] font-yekan text-[#1976d2]",
  );
  allProducts.textContent = `${category.allLabel ?? category.title} ‹`;

  const columns = document.createElement("div");
  columns.className = "grid grid-cols-4 gap-x-14 gap-y-7";

  for (const column of sortByPriority(category.submenu)) {
    const columnContainer = document.createElement("div");
    const heading = createLink(
      column,
      "mb-4 flex items-center gap-2 text-[17px] font-yekan text-[#23254e] hover:text-[#ef394e]",
    );
    const marker = document.createElement("span");
    marker.className = "h-4 w-0.5 rounded-full bg-[#ef394e]";
    const headingText = document.createElement("span");
    headingText.textContent = `${column.title} ‹`;
    heading.replaceChildren(marker, headingText);

    const links = document.createElement("ul");
    links.className = "space-y-2.5 text-[15px] font-yekan text-[#81858b]";

    for (const item of sortByPriority(column.submenu)) {
      const listItem = document.createElement("li");
      listItem.append(
        createLink(item, "font-yekan hover:text-[#ef394e]"),
      );
      links.append(listItem);
    }

    columnContainer.append(heading, links);
    columns.append(columnContainer);
  }

  content.append(allProducts, columns);
  return content;
}

function createMegaMenu(item: MenuItem): HTMLDivElement {
  const megaMenu = document.createElement("div");
  megaMenu.className =
    "header-mega-menu absolute right-0 top-full z-50 hidden h-[calc(100vh-205px)] max-h-155 min-h-130 w-[calc(100vw-48px)] max-w-340 overflow-hidden rounded-b-lg bg-white text-right font-yekan text-[14px] leading-7 text-[#3f4064] shadow-[0_8px_28px_rgba(0,0,0,0.18)] group-hover:flex";

  const categories = sortByPriority(item.submenu);
  const aside = document.createElement("aside");
  aside.className =
    "h-full w-64 shrink-0 overflow-y-auto border-l border-[#e0e0e2] bg-[#f5f5f5] py-2 text-[#3f4064]";

  for (const [index, category] of categories.entries()) {
    const categoryLink = createLink(
      category,
      index === 0
        ? "flex h-13 items-center justify-start gap-2 bg-white px-5 font-yekan text-[16px] text-[#ef394e]"
        : "flex h-13 items-center justify-start gap-2 px-5 font-yekan text-[16px] hover:bg-white hover:text-[#ef394e]",
    );
    const icon = createMenuIcon(category, "h-5 w-5");
    const title = document.createElement("span");
    title.textContent = category.title;
    categoryLink.replaceChildren(...(icon ? [icon, title] : [title]));
    aside.append(categoryLink);
  }

  const activeCategory = categories.find((category) => category.submenu.length > 0);
  megaMenu.append(aside);
  if (activeCategory) megaMenu.append(createMegaContent(activeCategory));
  return megaMenu;
}

function createDesktopNavbar(items: MenuItem[]): DocumentFragment {
  const fragment = document.createDocumentFragment();

  for (const item of sortByPriority(items)) {
    if (item.divider === "before") fragment.append(createDivider());

    const container = document.createElement("div");
    container.dataset.menuId = String(item.id);

    if (item.variant === "category" && item.mega) {
      container.className = "header-navbar-category group flex items-center gap-1";
      const icon = createMenuIcon(item, "h-5 w-5");
      const link = createLink(
        item,
        "font-yekan relative flex h-full items-center whitespace-nowrap text-[18px] text-[#3f4064]",
      );
      link.setAttribute("aria-haspopup", "true");
      link.setAttribute("aria-expanded", "false");
      if (icon) container.append(icon);
      container.append(link, createMegaMenu(item));
    } else {
      container.className =
        item.variant === "service"
          ? "header-navbar-services items-center"
          : "header-navbar-item flex items-center gap-2";
      const icon = createMenuIcon(item, "h-4.5 w-4.5");
      if (icon) container.append(icon);
      container.append(createLink(item, "text-[#62666d]"));
    }

    fragment.append(container);
    if (item.divider === "after") fragment.append(createDivider());
  }

  return fragment;
}

function createMobileMenuList(items: MenuItem[], depth: number): HTMLUListElement {
  const list = document.createElement("ul");
  list.dataset.menuDepth = String(depth);
  list.className = depth === 0 ? "space-y-1" : "mt-2 space-y-1 border-r border-[#e0e0e2] pr-3";

  for (const item of sortByPriority(items)) {
    const listItem = document.createElement("li");
    listItem.dataset.menuId = String(item.id);

    if (item.submenu.length === 0) {
      listItem.append(
        createLink(
          item,
          "block rounded-lg px-3 py-2 text-[14px] text-[#3f4064] hover:bg-[#f5f5f5] hover:text-[#ef394e]",
        ),
      );
    } else {
      const details = document.createElement("details");
      details.className = "group/mobile";

      const summary = document.createElement("summary");
      summary.textContent = item.title;
      summary.className =
        "cursor-pointer list-none rounded-lg px-3 py-2 text-[15px] font-bold text-[#3f4064] hover:bg-[#f5f5f5] hover:text-[#ef394e]";

      const allLink = createLink(
        item,
        "mr-3 mt-1 block text-[13px] text-[#1976d2] hover:text-[#ef394e]",
      );
      allLink.textContent = `مشاهده همه ${item.title}`;

      details.append(summary, allLink, createMobileMenuList(item.submenu, depth + 1));
      listItem.append(details);
    }

    list.append(listItem);
  }

  return list;
}

export function createMenuList(
  items: MenuItem[],
  variant: MenuVariant,
): DocumentFragment | HTMLUListElement {
  return variant === "desktop"
    ? createDesktopNavbar(items)
    : createMobileMenuList(items, 0);
}

export function renderHeaderInformation(header: HeaderData): void {
  document.title = header.seo.title;

  const description = getElement<HTMLMetaElement>("seo-description");
  const keywords = getElement<HTMLMetaElement>("seo-keywords");
  const heading = getElement<HTMLHeadingElement>("header-heading");
  const logoContainer = getElement<HTMLAnchorElement>("header-logo");

  if (description) description.content = header.seo.description;
  if (keywords) keywords.content = header.seo.keywords.join(", ");
  if (heading) heading.textContent = header.heading1;

  if (logoContainer) {
    logoContainer.href = safeUrl("/", "#");
    logoContainer.title = header.company.logo.title;
    logoContainer.setAttribute("aria-label", header.company.name);
    logoContainer.replaceChildren(
      createResponsivePicture(
        header.company.logo.desktop,
        header.company.logo.mobile,
        header.company.logo.alt,
        header.company.logo.title,
        "h-7 w-auto max-w-42 lg:h-7.5 lg:max-w-48.75",
      ),
    );
  }
}

export function renderBanners(banners: BannerItem[]): void {
  const container = getElement<HTMLDivElement>("header-banner");
  if (!container) return;

  const activeBanners = sortByPriority(
    banners.filter((banner) => banner.active),
  );
  const fragment = document.createDocumentFragment();

  for (const banner of activeBanners) {
    const link = document.createElement("a");
    link.href = safeUrl(banner.url, "#");
    link.title = banner.title;
    link.setAttribute("aria-label", banner.title);
    link.dataset.bannerId = String(banner.id);
    link.dataset.priority = String(banner.priority);
    link.className = "block w-full";
    link.append(
      createResponsivePicture(
        banner.images.desktop,
        banner.images.mobile,
        banner.alt,
        banner.title,
        "h-10 w-full object-cover sm:h-12 lg:h-15",
      ),
    );
    fragment.append(link);
  }

  container.replaceChildren(fragment);
  container.hidden = activeBanners.length === 0;
}

export function renderNavigation(menu: MenuItem[]): void {
  const desktopContainer = getElement<HTMLElement>("desktop-menu");
  const mobileContainer = getElement<HTMLElement>("mobile-menu");

  desktopContainer?.replaceChildren(createMenuList(menu, "desktop"));
  mobileContainer?.replaceChildren(createMenuList(menu, "mobile"));
}

function setupMobileMenu(): void {
  const toggle = getElement<HTMLButtonElement>("mobile-menu-toggle");
  const panel = getElement<HTMLElement>("mobile-menu-panel");
  if (!toggle || !panel || toggle.dataset.initialized === "true") return;

  toggle.dataset.initialized = "true";
  toggle.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    toggle.setAttribute("aria-expanded", String(willOpen));
  });
}

export function renderHeader(resources: HeaderResources): void {
  renderHeaderInformation(resources.header);
  renderBanners(resources.banners);
  renderNavigation(resources.menu);
  setupMobileMenu();
}
