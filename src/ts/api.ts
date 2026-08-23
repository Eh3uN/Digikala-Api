import type {
  BannerResponse,
  HeaderResources,
  HeaderResponse,
  MenuResponse,
} from "./types";

const headerUrl = new URL("../components/Header/header.json", import.meta.url);
const bannerUrl = new URL("../components/Header/banner.json", import.meta.url);
const menuUrl = new URL("../components/Header/menu.json", import.meta.url);

async function fetchJson<T>(url: URL, resourceName: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`Could not fetch ${resourceName}: ${message}`);
  }

  if (!response.ok) {
    throw new Error(
      `Could not fetch ${resourceName}: ${response.status} ${response.statusText}`,
    );
  }

  try {
    const payload: unknown = await response.json();
    return payload as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new Error(`Could not parse ${resourceName}: ${message}`);
  }
}

export async function getHeaderResources(): Promise<HeaderResources> {
  const [headerResponse, bannerResponse, menuResponse] = await Promise.all([
    fetchJson<HeaderResponse>(headerUrl, "header.json"),
    fetchJson<BannerResponse>(bannerUrl, "banner.json"),
    fetchJson<MenuResponse>(menuUrl, "menu.json"),
  ]);

  return {
    header: headerResponse.header,
    banners: bannerResponse.banner,
    menu: menuResponse.menu,
  };
}
