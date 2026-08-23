import { getHeaderResources } from "./api";
import { renderHeader } from "./components";

async function initializeHeader(): Promise<void> {
  try {
    const resources = await getHeaderResources();
    renderHeader(resources);
  } catch (error: unknown) {
    console.error("خطا در دریافت یا نمایش اطلاعات هدر:", error);
  }
}

void initializeHeader();
