import Amazing from "./amazing";
import Header from "./components";
import Slider from "./slider";
import Ads from "./ads";

void Header();

const desktopSlider = window.matchMedia("(min-width: 1024px)");

if (desktopSlider.matches) {
  void Slider();
}

void Amazing();
void Ads();
