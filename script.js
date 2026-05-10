document.addEventListener("DOMContentLoaded", () => {
  const pickerArea = document.getElementById("pickerArea");
  const pickerPointer = document.getElementById("pickerPointer");
  const hueSlider = document.getElementById("hueSlider");
  const previewCard = document.getElementById("previewCard");
  const hexValue = document.getElementById("hexValue");
  const hexText = document.getElementById("hexText");
  const rgbText = document.getElementById("rgbText");
  const hslText = document.getElementById("hslText");
  const paletteGrid = document.getElementById("paletteGrid");
  const complementaryGrid = document.getElementById("complementaryGrid");
  const analogousGrid = document.getElementById("analogousGrid");
  const toast = document.getElementById("toast");

  let hue = 260;
  let saturation = 100;
  let value = 100;
  let dragging = false;

  updatePicker();
  updatePointer();
  updateColor();

  pickerArea.addEventListener("pointerdown", (e) => {
    dragging = true;
    movePicker(e);
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    movePicker(e);
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  hueSlider.addEventListener("input", () => {
    hue = parseInt(hueSlider.value, 10);
    updatePicker();
    updateColor();
  });

  function movePicker(e) {
    const rect = pickerArea.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    saturation = Math.round((x / rect.width) * 100);
    value = Math.round(100 - (y / rect.height) * 100);

    pickerPointer.style.left = `${x}px`;
    pickerPointer.style.top = `${y}px`;

    updateColor();
  }

  function updatePointer() {
    const width = pickerArea.clientWidth;
    const height = pickerArea.clientHeight;

    pickerPointer.style.left = `${(saturation / 100) * width}px`;
    pickerPointer.style.top = `${((100 - value) / 100) * height}px`;
  }

  function updatePicker() {
    pickerArea.style.background = `hsl(${hue}, 100%, 50%)`;
  }

  function hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
      r = c; g = x;
    } else if (h < 120) {
      r = x; g = c;
    } else if (h < 180) {
      g = c; b = x;
    } else if (h < 240) {
      g = x; b = c;
    } else if (h < 300) {
      r = x; b = c;
    } else {
      r = c; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function updateColor() {
    const rgb = hsvToRgb(hue, saturation, value);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    previewCard.style.background = hex;
    hexValue.innerText = hex;
    hexText.innerText = hex;
    rgbText.innerText = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslText.innerText = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  function copyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("Copied");
  }

  window.copyText = copyText;

  window.randomColor = function () {
    hue = Math.floor(Math.random() * 360);
    saturation = Math.floor(Math.random() * 100);
    value = Math.floor(Math.random() * 100);

    hueSlider.value = hue;
    updatePicker();
    updatePointer();
    updateColor();
    showToast("Random Color");
  };

  function createPaletteBox(color, target) {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.background = color;

    const label = document.createElement("span");
    label.innerText = color;
    box.appendChild(label);

    box.onclick = () => copyText(color);
    target.appendChild(box);
  }

  window.generatePalette = function () {
    paletteGrid.innerHTML = "";
    complementaryGrid.innerHTML = "";
    analogousGrid.innerHTML = "";

    [100, 80, 60, 40].forEach((v) => {
      const rgb = hsvToRgb(hue, saturation, v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      createPaletteBox(hex, paletteGrid);
    });

    const compHue = (hue + 180) % 360;
    [100, 80, 60, 40].forEach((v) => {
      const rgb = hsvToRgb(compHue, saturation, v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      createPaletteBox(hex, complementaryGrid);
    });

    [(hue - 30 + 360) % 360, hue, (hue + 30) % 360].forEach((h) => {
      const rgb = hsvToRgb(h, saturation, value);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      createPaletteBox(hex, analogousGrid);
    });

    showToast("Palette Generated");
  };

  window.exportCSS = function () {
    const rgb = hsvToRgb(hue, saturation, value);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    const css = `:root{
  --primary: ${hex};
  --primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
}`;

    copyText(css);
    showToast("CSS Exported");
  };

  window.clearPalette = function () {
    paletteGrid.innerHTML = "";
    complementaryGrid.innerHTML = "";
    analogousGrid.innerHTML = "";
    showToast("Palettes Cleared");
  };

  function showToast(text) {
    toast.innerText = text;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 1500);
  }

  function startAnimation() {
    const cards = document.querySelectorAll(
      ".top-card,.picker-card,.preview-card,.info-card,.buttons,.palette-card"
    );

    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(40px)";
      card.style.transition = "0.8s ease";

      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 150 + index * 120);
    });
  }

  startAnimation();
});
