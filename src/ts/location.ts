import type { Map as LeafletMap, LeafletMouseEvent } from "leaflet";
import cities from "../components/Header/cities.json";

type SavedLocation = { lat: number; lng: number };

const storageKey = "digi-naqib:delivery-location";
const defaultLocation: SavedLocation = { lat: 35.6892, lng: 51.389 };
const normalize = (value: string): string =>
  value.trim().replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\s\u200c]/g, "");

const readLocation = (): SavedLocation | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (
      saved &&
      Number.isFinite(saved.lat) && Math.abs(saved.lat) <= 85 &&
      Number.isFinite(saved.lng) && Math.abs(saved.lng) <= 180
    ) {
      return { lat: saved.lat, lng: saved.lng };
    }
  } catch {
    // The picker also works when browser storage is unavailable.
  }
  return null;
};

const LocationPicker = (): void => {
  const dialog = document.querySelector<HTMLDialogElement>("#location-modal");
  const search = document.querySelector<HTMLInputElement>("#location-search");
  const results = document.querySelector<HTMLDivElement>("#location-search-results");
  const mapElement = document.querySelector<HTMLDivElement>("#location-map");
  const status = document.querySelector<HTMLParagraphElement>("#location-map-status");
  const confirm = document.querySelector<HTMLButtonElement>("[data-location-confirm]");
  const close = document.querySelector<HTMLButtonElement>("[data-location-close]");
  const triggers = document.querySelectorAll<HTMLButtonElement>("[data-location-open]");
  if (!dialog || !search || !results || !mapElement || !status || !confirm || !close) return;

  let savedLocation = readLocation();
  let map: LeafletMap | undefined;
  let mapLoading: Promise<void> | undefined;
  let opener: HTMLButtonElement | undefined;
  let closeTimer: number | undefined;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const updateLabels = (): void => {
    document.querySelectorAll<HTMLElement>("[data-location-label]").forEach((label) => {
      label.textContent = savedLocation ? "موقعیت شما" : "انتخاب آدرس";
    });
  };
  updateLabels();

  const hideResults = (): void => {
    results.hidden = true;
  };

  const loadMap = async (): Promise<void> => {
    if (map) return;
    status.textContent = "در حال بارگذاری نقشه…";
    status.hidden = false;
    confirm.disabled = true;
    try {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const center = savedLocation ?? defaultLocation;
      map = L.map(mapElement, {
        center: [center.lat, center.lng],
        zoom: 14,
        minZoom: 5,
        maxZoom: 19,
        zoomControl: false,
        fadeAnimation: !reducedMotion.matches,
        zoomAnimation: !reducedMotion.matches,
      });
      L.control.zoom({
        position: "bottomleft",
        zoomInTitle: "بزرگ‌نمایی",
        zoomOutTitle: "کوچک‌نمایی",
      }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        maxZoom: 19,
      })
        .on("tileerror", () => {
          status.textContent = "نقشه بارگذاری نشد. اتصال اینترنت را بررسی کنید.";
          status.hidden = false;
        })
        .on("tileload", () => { status.hidden = true; })
        .addTo(map);
      map.on("click", (event: LeafletMouseEvent) => {
        hideResults();
        map?.panTo(event.latlng, { animate: !reducedMotion.matches });
      });
      map.on("dragstart", hideResults);
      new ResizeObserver(() => map?.invalidateSize({ pan: false })).observe(mapElement);
      confirm.disabled = false;
    } catch {
      status.textContent = "بارگذاری نقشه انجام نشد. پنجره را ببندید و دوباره باز کنید.";
      status.hidden = false;
    }
  };

  const closeDialog = (): void => {
    if (!dialog.open || dialog.dataset.state === "closing") return;
    dialog.dataset.state = "closing";
    hideResults();
    closeTimer = window.setTimeout(() => dialog.close(), reducedMotion.matches ? 0 : 200);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (dialog.open) return;
      opener = trigger;
      search.value = "";
      hideResults();
      dialog.dataset.state = "open";
      document.documentElement.classList.add("location-modal-open");
      dialog.showModal();
      triggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
      close.focus({ preventScroll: true });
      if (map) {
        const center = savedLocation ?? defaultLocation;
        map.invalidateSize({ pan: false });
        map.setView([center.lat, center.lng], 14, { animate: false });
      } else if (!mapLoading) {
        mapLoading = loadMap().finally(() => { mapLoading = undefined; });
      }
    });
  });

  close.addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("close", () => {
    window.clearTimeout(closeTimer);
    document.documentElement.classList.remove("location-modal-open");
    triggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
    opener?.focus({ preventScroll: true });
  });

  const outsideDialog = (event: PointerEvent | MouseEvent): boolean => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  let startedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    startedOnBackdrop = event.target === dialog && outsideDialog(event);
  });
  dialog.addEventListener("click", (event) => {
    if (startedOnBackdrop && event.target === dialog && outsideDialog(event)) closeDialog();
    startedOnBackdrop = false;
    if (!(event.target instanceof Element && event.target.closest(".location-search"))) hideResults();
  });

  const showResults = (): void => {
    const query = normalize(search.value);
    const matches = cities.filter((city) => normalize(`${city.name}${city.province}`).includes(query));
    results.replaceChildren();
    const hint = document.createElement("p");
    hint.className = "location-search-hint";
    hint.textContent = matches.length
      ? "مراکز استان‌ها"
      : "شهری پیدا نشد؛ موقعیت را روی نقشه انتخاب کنید.";
    results.append(hint);
    matches.forEach((city) => {
      const button = document.createElement("button");
      button.type = "button";
      const name = document.createElement("span");
      const province = document.createElement("small");
      name.textContent = city.name;
      province.textContent = city.province;
      button.append(name, province);
      button.addEventListener("click", () => {
        if (!map) return;
        map.setView([city.lat, city.lng], 14, { animate: false });
        search.value = city.name;
        hideResults();
        mapElement.focus({ preventScroll: true });
      });
      results.append(button);
    });
    results.hidden = false;
  };
  search.addEventListener("input", showResults);
  search.addEventListener("focus", showResults);
  search.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter") {
      event.preventDefault();
      if (results.hidden) showResults();
      results.querySelector<HTMLButtonElement>("button")?.focus();
    }
  });
  results.addEventListener("keydown", (event) => {
    const buttons = [...results.querySelectorAll<HTMLButtonElement>("button")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = index + (event.key === "ArrowDown" ? 1 : -1);
      if (next < 0) search.focus();
      else buttons[Math.min(next, buttons.length - 1)]?.focus();
    }
  });
  dialog.addEventListener("focusin", (event) => {
    if (!(event.target instanceof Element && event.target.closest(".location-search"))) hideResults();
  });

  confirm.addEventListener("click", () => {
    if (!map || dialog.dataset.state === "closing") return;
    const { lat, lng } = map.getCenter().wrap();
    savedLocation = { lat, lng };
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedLocation));
    } catch {
      // Keep the selection for this visit if storage is disabled.
    }
    updateLabels();
    closeDialog();
  });
};

export default LocationPicker;
