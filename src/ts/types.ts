export interface HeaderLogo {
  desktop: string;
  mobile: string;
  alt: string;
  title: string;
}

export interface CompanyInfo {
  name: string;
  logo: HeaderLogo;
  tagline: string;
}

export interface SeoInfo {
  title: string;
  description: string;
  keywords: string[];
}

export interface HeaderData {
  company: CompanyInfo;
  heading1: string;
  seo: SeoInfo;
}

export interface HeaderResponse {
  header: HeaderData;
}

export interface BannerImages {
  desktop: string;
  mobile: string;
}

export interface BannerItem {
  id: number;
  title: string;
  alt: string;
  url: string;
  images: BannerImages;
  priority: number;
  active: boolean;
}

export interface BannerResponse {
  banner: BannerItem[];
}

export type MenuType = "normalMenu" | "subMenu";

export type MenuVariant =
  | "category"
  | "navigation"
  | "service"
  | "megaCategory"
  | "megaColumn"
  | "megaLink";

export type MenuDivider = "before" | "after";

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  type: MenuType;
  submenu: MenuItem[];
  mega: boolean;
  priority: number;
  icon?: string;
  variant?: MenuVariant;
  divider?: MenuDivider;
  allLabel?: string;
}

export interface MenuResponse {
  menu: MenuItem[];
}

export interface HeaderResources {
  header: HeaderData;
  banners: BannerItem[];
  menu: MenuItem[];
}

export interface SliderImages {
  desktop: string;
  mobile: string;
}

export interface SliderItem {
  id: number;
  title: string;
  description: string;
  images: SliderImages;
  alt: string;
  url: string;
  priority: number;
  active: boolean;
}

export type SliderResponse = SliderItem[];
