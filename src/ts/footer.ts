import "../css/footer.css";

type ContactResponse = typeof import("../components/Footer/contact.json");
type SupportsResponse = typeof import("../components/Footer/supports.json");
type LinkGroupsResponse = typeof import("../components/Footer/footerLinkGroups.json");
type LinksResponse = typeof import("../components/Footer/footerLinks.json");
type SocialResponse = typeof import("../components/Footer/social.json");
type ApplicationsResponse = typeof import("../components/Footer/applications.json");
type CertificatesResponse = typeof import("../components/Footer/certificates.json");
type BrandsResponse = typeof import("../components/Footer/brands.json");
type AboutResponse = typeof import("../components/Footer/about.json");
type NewsletterResponse = typeof import("../components/Footer/newsletter.json");

interface FooterImage {
  src: string;
  alt: string;
}

const assets = import.meta.glob<string>("../assets/**/*.{svg,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

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

const formatDigits = (value: string): string =>
  value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);

const safeHref = (value: string): string =>
  /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value.trim()) ? value.trim() : "#";

const sortByPriority = <T extends { priority?: number | string }>(items: T[]): T[] =>
  items
    .map((item, index) => ({ item, priority: Number(item.priority ?? index + 1) }))
    .sort((a, b) => a.priority - b.priority)
    .map(({ item }) => item);

const renderImage = (item: FooterImage, classes: string): string => {
  const source = item.src.startsWith("./src/assets/")
    ? assets[item.src.replace("./src/", "../")]
    : item.src.startsWith("/assets/")
      ? `${import.meta.env.BASE_URL}${item.src.slice(1)}`
      : item.src;

  if (!source) {
    return `<span class="text-center text-[15px] text-[#62666d]">${escapeHtml(item.alt)}</span>`;
  }

  return `<img src="${escapeHtml(source)}" alt="${escapeHtml(item.alt)}" class="${classes}" loading="lazy" />`;
};

const fetchFooterData = async <T>(url: URL): Promise<T | undefined> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    console.error("خطا در دریافت اطلاعات فوتر:", url.pathname, error);
    return undefined;
  }
};

// The about API contains rich text. Preserve its formatting and safe links only.
const prepareAbout = (content: string): { html: string; preview: string } => {
  const document = new DOMParser().parseFromString(content, "text/html");
  const allowedTags = new Set([
    "P", "BR", "H2", "H3", "H4", "A", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "SPAN",
  ]);

  document.body.querySelectorAll("script, style, iframe, object, embed, svg, math").forEach(
    (element) => element.remove(),
  );

  document.body.querySelectorAll("*").forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const href = element.getAttribute("href");
    [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));

    if (element.tagName === "A" && href) {
      element.setAttribute("href", safeHref(href));
    }
  });

  return {
    html: document.body.innerHTML,
    preview: document.body.querySelector("p")?.textContent?.trim() ?? "",
  };
};

const Footer = async (): Promise<void> => {
  const container = document.querySelector<HTMLElement>("#site-footer");

  if (!container) return;

  try {
    const [contactData, supportsData, groupsData, linksData, socialData, applicationsData, certificatesData, brandsData, aboutData, newsletterData] =
      await Promise.all([
        fetchFooterData<ContactResponse>(new URL("../components/Footer/contact.json", import.meta.url)),
        fetchFooterData<SupportsResponse>(new URL("../components/Footer/supports.json", import.meta.url)),
        fetchFooterData<LinkGroupsResponse>(new URL("../components/Footer/footerLinkGroups.json", import.meta.url)),
        fetchFooterData<LinksResponse>(new URL("../components/Footer/footerLinks.json", import.meta.url)),
        fetchFooterData<SocialResponse>(new URL("../components/Footer/social.json", import.meta.url)),
        fetchFooterData<ApplicationsResponse>(new URL("../components/Footer/applications.json", import.meta.url)),
        fetchFooterData<CertificatesResponse>(new URL("../components/Footer/certificates.json", import.meta.url)),
        fetchFooterData<BrandsResponse>(new URL("../components/Footer/brands.json", import.meta.url)),
        fetchFooterData<AboutResponse>(new URL("../components/Footer/about.json", import.meta.url)),
        fetchFooterData<NewsletterResponse>(new URL("../components/Footer/newsletter.json", import.meta.url)),
      ]);

    const contact = contactData?.contact;
    const about = aboutData ? prepareAbout(aboutData.content) : undefined;
    const logo = `${import.meta.env.BASE_URL}assets/images/header/header-logo.svg`;

    const phones = sortByPriority(contact?.supportPhones ?? []).map((phone) => {
      const type = contact?.phoneTypes.find((item) => item.id === phone.typeId)?.value ?? "";

      return `<a href="tel:${escapeHtml(phone.value.replace(/\s/g, ""))}" class="inline-flex items-center gap-2">
        <span>${escapeHtml(type)}</span>
        <bdi dir="ltr">${escapeHtml(formatDigits(phone.value))}</bdi>
      </a>`;
    }).join('<span class="hidden h-3 w-px bg-[#e0e0e2] sm:block" aria-hidden="true"></span>');

    const supports = sortByPriority(supportsData?.supports ?? []).map((item) => `
      <a href="${escapeHtml(safeHref(item.url))}" class="flex flex-col items-center gap-2 text-center text-[16px] leading-6 text-[#3f4064]">
        ${renderImage({ src: item.src, alt: item.text }, "h-14 w-14 object-contain")}
        <span>${escapeHtml(formatDigits(item.text))}</span>
      </a>
    `).join("");

    const linkGroups = sortByPriority(groupsData?.linkgroups ?? []).map((group) => {
      const links = sortByPriority((linksData?.links ?? []).filter((item) => item.LinkGroupId === group.id));

      return `<nav aria-labelledby="footer-links-${group.id}">
        <h2 id="footer-links-${group.id}" class="mb-4 text-[20px] font-bold leading-7 text-[#3f4064]">${escapeHtml(group.title)}</h2>
        <ul class="space-y-3 text-[18px] leading-6 text-[#81858b]">
          ${links.map((item) => `<li><a href="${escapeHtml(safeHref(item.url))}" class="transition-colors hover:text-[#ef4056]">${escapeHtml(item.title)}</a></li>`).join("")}
        </ul>
      </nav>`;
    }).join("");

    const social = sortByPriority(socialData?.social ?? []).map((item) => `
      <a href="${escapeHtml(safeHref(item.url))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.title)}" class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[#f0f0f1]">
        ${renderImage(item, "h-8 w-8 object-contain")}
      </a>
    `).join("");

    const renderApplications = (items: NonNullable<typeof applicationsData>["applicationsMobile"]): string =>
      sortByPriority(items).map((item) => `
        <a href="${escapeHtml(safeHref(item.url))}" aria-label="${escapeHtml(item.title)}" class="flex min-h-11 items-center justify-center overflow-hidden rounded-md">
          ${renderImage(item, "h-11 w-[142px] max-w-full object-contain")}
        </a>
      `).join("");

    const certificates = (certificatesData?.certificates ?? []).map((item) => `
      <a href="${escapeHtml(safeHref(item.url))}" aria-label="${escapeHtml(item.title)}" class="flex h-[108px] w-[108px] items-center justify-center rounded-lg border border-[#e0e0e2] p-4">
        ${renderImage({ src: item.image, alt: item.title }, "max-h-full max-w-full object-contain")}
      </a>
    `).join("");

    const renderBrands = (items: NonNullable<typeof brandsData>["brands"]): string =>
      sortByPriority(items).map((item) => `
        <a href="${escapeHtml(safeHref(item.url))}" aria-label="${escapeHtml(item.title)}" class="flex h-20 min-w-0 items-center justify-center border-b border-l border-[#e0e0e2] px-4 transition-colors hover:bg-[#e9eaec]">
          ${renderImage(item, "h-5 w-auto max-w-full object-contain")}
        </a>
      `).join("");

    container.innerHTML = `
      <div class="px-4 pt-8 lg:px-8">
        <div class="flex items-center justify-between gap-4">
          <a href="${import.meta.env.BASE_URL}" aria-label="صفحه اصلی دیجی‌کالا">
            <img src="${logo}" alt="دیجی‌کالا" class="h-auto w-28 sm:w-32" loading="lazy" />
          </a>
          <button type="button" data-footer-top class="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e0e0e2] px-4 py-2 text-[16px] leading-6 text-[#a1a3a8] hover:bg-[#f5f5f5]">
            بازگشت به بالا
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
          </button>
        </div>

        ${contact ? `
          <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[16px] leading-7 text-[#62666d]" data-footer-phones>
            ${phones}
            <span class="hidden h-3 w-px bg-[#e0e0e2] sm:block" aria-hidden="true"></span>
            <p>${escapeHtml(formatDigits(contact.description))}</p>
          </div>
          <details class="mt-3 text-[15px] leading-7 text-[#81858b]" id="footer-contact">
            <summary class="w-fit cursor-pointer text-[#19bfd3]">${escapeHtml(contact.title)} و اطلاعات پیامک‌ها</summary>
            <div class="mt-3 max-w-4xl space-y-3 rounded-lg bg-[#f8f8f8] p-4">
              ${sortByPriority(contact.addresses).map((address) => `<p><strong class="font-medium text-[#3f4064]">${escapeHtml(address.type)}:</strong> ${escapeHtml(address.value)}</p>`).join("")}
              <div class="flex flex-wrap gap-2" aria-label="شماره‌های پیامک">
                ${sortByPriority(contact.smsInfo.numbers).map((number) => `<bdi dir="ltr" class="rounded-md bg-white px-3 py-1">${escapeHtml(formatDigits(number.value))}</bdi>`).join("")}
              </div>
              <p>${escapeHtml(contact.smsInfo.warning)}</p>
              <p>${escapeHtml(contact.smsInfo.note)}</p>
              <a href="mailto:${escapeHtml(contact.smsInfo.reportEmail)}" class="inline-block text-[#19bfd3]" dir="ltr">${escapeHtml(contact.smsInfo.reportEmail)}</a>
            </div>
          </details>
        ` : ""}

        ${supports ? `<nav aria-label="خدمات دیجی‌کالا" class="grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-5" data-footer-supports>${supports}</nav>` : ""}

        <div class="grid grid-cols-2 gap-x-5 gap-y-8 py-6 lg:grid-cols-4 lg:gap-x-10" data-footer-links>
          ${linkGroups}
          <div class="col-span-2 sm:col-span-1">
            <h2 class="mb-4 text-[20px] font-bold leading-7 text-[#3f4064]">همراه ما باشید!</h2>
            <nav aria-label="شبکه‌های اجتماعی دیجی‌کالا" class="flex flex-wrap items-center gap-3" data-footer-social>${social}</nav>
            ${newsletterData ? `
              <div class="mt-7" data-footer-newsletter>
                <label for="footer-newsletter-email" class="mb-3 block text-[18px] font-bold leading-7 text-[#3f4064]">${escapeHtml(newsletterData.title)}</label>
                <div class="flex items-center gap-2">
                  <input id="footer-newsletter-email" type="email" placeholder="${escapeHtml(newsletterData.placeholder)}" autocomplete="off" class="h-12 min-w-0 flex-1 rounded-lg border border-transparent bg-[#f0f0f1] px-4 text-right text-[18px] text-[#3f4064] outline-none placeholder:text-[#a1a3a8] focus:border-[#a1a3a8]" />
                  <button type="button" disabled class="h-12 shrink-0 rounded-lg bg-[#e0e0e2] px-4 text-[18px] font-bold text-white">${escapeHtml(newsletterData.buttonText)}</button>
                </div>
              </div>
            ` : ""}
          </div>
        </div>

        ${applicationsData ? `
          <section class="my-7 flex flex-col gap-5 rounded-lg bg-[#3c4b6d] px-5 py-4 lg:flex-row lg:items-center lg:justify-between" aria-labelledby="footer-app-title">
            <div class="flex items-center gap-3">
              ${renderImage({ src: "/assets/images/footer/footerlogo2.webp", alt: "" }, "h-11 w-11 shrink-0 rounded-lg object-contain")}
              <h2 id="footer-app-title" class="text-[22px] leading-8 text-white lg:text-[26px]">${escapeHtml(applicationsData.title)}</h2>
            </div>
            <div class="hidden flex-wrap items-center justify-end gap-4 lg:flex" data-footer-apps-desktop>
              ${renderApplications(applicationsData.applications)}
              <a href="${escapeHtml(safeHref(applicationsData.more.url))}" aria-label="${escapeHtml(applicationsData.more.title)}" class="mr-2 flex h-11 w-11 items-center justify-center rounded border border-[#e0e0e2] bg-white" data-footer-app-more>
                ${renderImage(applicationsData.more, "h-10 w-10 object-contain")}
              </a>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 lg:hidden" data-footer-apps-mobile>
              ${renderApplications(applicationsData.applicationsMobile)}
              <a href="${escapeHtml(safeHref(applicationsData.more.url))}" class="flex w-full items-center justify-center gap-2 text-[16px] text-white" data-footer-app-more>${escapeHtml(applicationsData.more.title)}<span aria-hidden="true">‹</span></a>
            </div>
          </section>
        ` : ""}

        ${about || certificates ? `
          <div class="flex flex-col gap-8 border-y border-[#f0f0f1] py-8 lg:flex-row lg:items-start">
            ${about && aboutData ? `
              <section class="min-w-0 flex-1" aria-labelledby="footer-about-title" data-footer-about>
                <h2 id="footer-about-title" class="mb-2 text-[22px] leading-8 text-[#62666d] lg:text-[26px]">${escapeHtml(aboutData.title)}</h2>
                <p class="footer-about-preview text-[17px] leading-7 text-[#81858b]" data-footer-about-preview>${escapeHtml(about.preview)}</p>
                <div id="footer-about-full" class="footer-rich-text" hidden>${about.html}</div>
                <button type="button" data-footer-about-toggle aria-expanded="false" aria-controls="footer-about-full" class="mt-3 flex cursor-pointer items-center gap-1 text-[18px] leading-7 text-[#008eff]">
                  <span data-footer-about-label>مشاهده بیشتر</span>
                  <span aria-hidden="true">‹</span>
                </button>
              </section>
            ` : ""}
            ${certificates ? `<nav aria-label="نمادهای اعتماد و مجوزها" class="flex shrink-0 flex-wrap justify-center gap-2 lg:justify-end" data-footer-certificates>${certificates}</nav>` : ""}
          </div>
        ` : ""}

        ${aboutData ? `<p class="py-8 text-center text-[16px] leading-6 text-[#81858b]" data-footer-copyright>${escapeHtml(aboutData.copyright)}</p>` : ""}
      </div>

      ${brandsData ? `
        <div class="bg-[#f0f0f1]">
          <nav aria-label="برندهای گروه دیجی‌کالا" class="hidden w-full grid-cols-9 lg:grid" data-footer-brands-desktop>${renderBrands(brandsData.brands)}</nav>
          <nav aria-label="برندهای گروه دیجی‌کالا" class="grid w-full grid-cols-2 sm:grid-cols-3 lg:hidden" data-footer-brands-mobile>${renderBrands(brandsData.mobileBrands)}</nav>
        </div>
      ` : ""}
    `;

    container.querySelector<HTMLButtonElement>("[data-footer-top]")?.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });

    const aboutToggle = container.querySelector<HTMLButtonElement>("[data-footer-about-toggle]");
    const aboutPreview = container.querySelector<HTMLElement>("[data-footer-about-preview]");
    const aboutFull = container.querySelector<HTMLElement>("#footer-about-full");
    const aboutLabel = container.querySelector<HTMLElement>("[data-footer-about-label]");

    aboutToggle?.addEventListener("click", () => {
      if (!aboutPreview || !aboutFull || !aboutLabel) return;

      const expanded = aboutToggle.getAttribute("aria-expanded") !== "true";
      aboutToggle.setAttribute("aria-expanded", String(expanded));
      aboutPreview.hidden = expanded;
      aboutFull.hidden = !expanded;
      aboutLabel.textContent = expanded ? "بستن" : "مشاهده بیشتر";

      if (!expanded) {
        container.querySelector("[data-footer-about]")?.scrollIntoView({ block: "nearest" });
      }
    });
  } catch (error: unknown) {
    console.error("خطا در نمایش فوتر:", error);
  }
};

export default Footer;
