# SliceboxApp (ES6)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/ES6+-supported-yellow.svg)
![Responsive](https://img.shields.io/badge/mobile-friendly-green.svg)

Modern JavaScript ES6+ fullscreen media slider with animated 3D transitions, inspired by the original Slicebox jQuery plugin.

## ✨ Features
- Pure ES6 implementation (no jQuery, no external libs)
- 3D cube-style transitions between slides
- Supports images and HTML5 videos with canvas-based preview
- Autoplay with individual slide durations
- Manual controls: next/prev buttons, indicators, swipe
- Offline detection with custom overlay icon
- Optional iframe overlay with inactivity autoclose
- Dynamic reload on data change (check via hash)

---

## 🚀 Getting Started

```html
<script type="module">
import { SliceboxApp } from './SliceboxApp.js';

const slides = [
  { type: 'image', src: 'slide1.jpg', duration: 5000 },
  { type: 'video', src: 'video.mp4', ext: 'mp4', duration: 10000 },
  { type: 'image', src: 'slide2.webp', duration: 7000 }
];

const slicebox = new SliceboxApp({
  elementId: 'sb-slider',
  slides,
  options: {
    autoplay: true,
    showNav: true,
    showProgress: true,
    showIndicators: true,
    swipeThreshold: 50,
    checkPath: 'check.php',
    mediaPath: 'gallery/',
    gal_onclick: 'https://example.com/overlay-content'
  }
});

slicebox.init();
</script>
```

---

## 🛠 Options
| Option           | Type      | Default       | Description |
|------------------|-----------|---------------|-------------|
| `autoplay`       | `boolean` | `true`        | Start slideshow automatically |
| `showNav`        | `boolean` | `true`        | Show next/prev buttons |
| `showProgress`   | `boolean` | `true`        | Show progress bar |
| `showIndicators` | `boolean` | `true`        | Show navigation dots |
| `swipeThreshold` | `number`  | `50`          | Min px swipe distance |
| `checkPath`      | `string`  | `'check.php'` | URL to verify validity of `t` param |
| `mediaPath`      | `string`  | `'gallery/'`  | Base path for images/videos |
| `gal_onclick`    | `string`  | `null`        | URL to load into fullscreen iframe |

---

## 📂 Structure
```
project/
├── SliceboxApp.js
├── index.html
├── gallery/
│   ├── slide1.jpg
│   ├── slide2.webp
│   └── video.mp4
├── check.php
├── check_update.php
└── icons/
    └── offline.svg
```

---

## 🧪 Notes
- If network is offline, iframe click is disabled
- When changes are detected (via `check_update.php`), the page reloads automatically
- Preview images for videos are generated via canvas (no server-side thumbs required)

---

## 📄 License
MIT

---

## 🙏 Credits
Based on the original [Slicebox jQuery plugin](https://tympanus.net/codrops/2012/01/03/slicebox-3d-image-slider/) by Codrops
