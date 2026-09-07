import "../css/services.css";
import services from "../components/Services/services.json";

type ServiceItem = {
  title: string;
  url: string;
  image?: string;
  icon?: string;
  color?: string;
};

const icons: Record<string, string> = {
  school: '<rect x="8" y="7" width="16" height="22" rx="4"/><path d="M12 7V5a4 4 0 0 1 8 0v2M8 15h16M12 12v5m8-5v5"/><rect x="12" y="20" width="8" height="5" rx="1"/>',
  car: '<path d="m6 12 2-6h16l2 6M6 12h20l2 4v9H4v-9l2-4Z"/><path d="M7 25v3h4v-3m10 0v3h4v-3M4 12H2m26 0h2M8 17h3m10 0h3M12 22h8"/>',
  summer: '<g transform="rotate(30 16 16)"><path d="M9 3h14l-2 20H11L9 3Zm2 6h10M13 23v4h6v-4"/><circle cx="16" cy="15" r="2"/><path d="M16 11v1m0 6v1m-4-4h1m6 0h1"/></g><path d="M7 25c-4 4-4 6 0 6s4-2 0-6Z"/>',
  smile: '<path d="M4 13q12 13 24 0" stroke-width="6"/>',
  store: '<path d="m6 4-3 8c0 4 6 4 7 0 0 4 6 4 6 0 0 4 6 4 6 0 1 4 7 4 7 0l-3-8H6Z" fill="currentColor" stroke-width="1"/><path d="M6 17v11h20V17M11 20q5 6 10 0"/>',
  digipay: '<path d="m4 18 10-10a3 3 0 0 1 4 0l10 10" stroke-width="6"/>',
};

const createServiceLink = (service: ServiceItem, isCard: boolean): HTMLAnchorElement => {
  const link = document.createElement("a");
  link.className = isCard ? "services-card" : "services-shortcut";
  link.href = service.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", service.title.replace(/\s+/g, " "));

  const icon = document.createElement("span");
  icon.className = "services-icon";
  icon.setAttribute("aria-hidden", "true");
  if (service.image) {
    const image = document.createElement("img");
    image.src = `${import.meta.env.BASE_URL}assets/images/story/${service.image}`;
    image.alt = "";
    image.width = 52;
    image.height = 52;
    icon.append(image);
  } else {
    icon.style.backgroundColor = service.color ?? "#286c69";
    if (service.icon === "digicard" || service.icon === "digistyle") {
      icon.classList.add(`services-icon--${service.icon}`);
      icon.textContent = service.icon === "digicard" ? "digicard" : "DS";
    } else {
      icon.innerHTML = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">${icons[service.icon ?? "smile"] ?? icons.smile}</svg>`;
    }
  }

  const title = document.createElement("span");
  title.className = "services-item-title";
  title.textContent = service.title;
  link.append(icon, title);
  if (isCard) {
    const arrow = document.createElement("span");
    arrow.className = "services-card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M20 12H4m7-7-7 7 7 7"/></svg>';
    link.append(arrow);
  }
  return link;
};

const Services = (): void => {
  const trigger = document.querySelector<HTMLButtonElement>("#services-more");
  const dialog = document.querySelector<HTMLDialogElement>("#services-modal");
  const close = dialog?.querySelector<HTMLButtonElement>(".services-modal-close");
  const content = dialog?.querySelector<HTMLDivElement>(".services-modal-content");
  const shortcuts = document.querySelector<HTMLElement>("#services-shortcuts");
  const group = document.querySelector<HTMLDivElement>("#services-group");
  if (!trigger || !dialog || !close || !content || !shortcuts || !group) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closeTimer: number | undefined;
  let rendered = false;

  trigger.addEventListener("click", () => {
    if (dialog.open) return;
    if (!rendered) {
      shortcuts.replaceChildren(...services.shortcuts.map((item) => createServiceLink(item, false)));
      group.replaceChildren(...services.group.map((item) => createServiceLink(item, true)));
      rendered = true;
    }
    dialog.dataset.state = "open";
    document.documentElement.classList.add("services-modal-open");
    dialog.showModal();
    content.scrollTop = 0;
    trigger.setAttribute("aria-expanded", "true");
    close.focus({ preventScroll: true });
  });

  const closeDialog = (): void => {
    if (!dialog.open || dialog.dataset.state === "closing") return;
    dialog.dataset.state = "closing";
    closeTimer = window.setTimeout(() => dialog.close(), reducedMotion.matches ? 0 : 200);
  };

  close.addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("close", () => {
    window.clearTimeout(closeTimer);
    document.documentElement.classList.remove("services-modal-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus({ preventScroll: true });
  });

  const outsideDialog = (event: MouseEvent): boolean => {
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
  });
};

export default Services;
