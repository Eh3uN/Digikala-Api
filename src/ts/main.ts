import { getHeaderResources } from "./api";
import { renderHeader } from "./components";
import Slider from "./slider";

async function initializeHeader(): Promise<void> {
  try {
    const resources = await getHeaderResources();
    renderHeader(resources);
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش اطلاعات هدر:", error);
  }
}

void initializeHeader();

const desktopSlider = window.matchMedia("(min-width: 1024px)");

if (desktopSlider.matches) {
  void Slider();
}
