import Header from "./components";
import Slider from "./slider";

void Header();

const desktopSlider = window.matchMedia("(min-width: 1024px)");

if (desktopSlider.matches) {
  void Slider();
}
