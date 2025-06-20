const defaultConfig = {
  autoplay: true,
  showNav: true,
  showProgress: true,
  showIndicators: true,
  swipeThreshold: 50,
  checkPath: 'check.php',
  mediaPath: 'gallery/',
  gal_onclick: null
};

export class SliceboxApp {
  constructor({
    elementId,
    slides = [],
    options = {},
    onCycleComplete = () => {}
  }) {
    this.container = document.getElementById(elementId);
    this.slides = slides;
    this.options = Object.assign({}, defaultConfig, options);
    this.current = 0;
    this.onCycleComplete = onCycleComplete;
    this.intervalId = null;
    this.cycleCount = 0;
    this.checkUpdateEvery = 10;
    this.lastUpdateHash = null;
    this.inactivityTimer = null;
  }

  async init() {
    const t = new URLSearchParams(window.location.search).get('t');
    if (!t || !(await this.checkValidToken(t))) {
      document.body.remove();
      return;
    }

    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.classList.add('sb-slider');

    for (const slide of this.slides) {
      const li = document.createElement('li');
      if (slide.type === 'image') {
        const img = document.createElement('img');
        img.src = this.options.mediaPath + slide.src;
        li.appendChild(img);
      } else if (slide.type === 'video') {
        const img = document.createElement('img');
        img.classList.add('preview-image');
        const video = document.createElement('video');
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        const source = document.createElement('source');
        source.src = this.options.mediaPath + slide.src;
        source.type = 'video/' + slide.ext;
        video.appendChild(source);
        li.appendChild(img);
        li.appendChild(video);
        this.generatePreview(video, img);
      }
      this.container.appendChild(li);
    }
    this.items = this.container.querySelectorAll('li');
    this.addNavigationControls();
    this.addProgressBar();
    this.addIndicators();
    this.addSwipeSupport();
    this.showSlide(this.current);
    if (this.options.autoplay) this.start();
    if (this._progressUpdater) this._progressUpdater();
    if (this.options.gal_onclick) this.setupIframeOverlay(this.options.gal_onclick);
    this.setupOfflineIcon();
  }

  async checkValidToken(t) {
    try {
      const res = await fetch(`${this.options.checkPath}?t=${t}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  showSlide(index) {
    this.items.forEach((item, i) => {
      item.style.display = i === index ? 'block' : 'none';
    });
    this.updateIndicators?.();
  }

  next() {
    this.createTransition();
    this.current = (this.current + 1) % this.items.length;
    if (this.current === 0) {
      this.cycleCount++;
      this.onCycleComplete();
      if (this.cycleCount % this.checkUpdateEvery === 0) {
        this.checkForUpdates();
      }
    }
  }

  start() {
    clearTimeout(this.intervalId);
    const duration = this.slides[this.current].duration || this.options.defaultInterval;
    this.intervalId = setTimeout(() => {
      this.next();
      this.start();
    }, duration);
    if (this._progressUpdater) this._progressUpdater();
  }

  stop() {
    clearTimeout(this.intervalId);
    this.intervalId = null;
  }

  async generatePreview(video, img) {
    return new Promise(resolve => {
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        img.src = canvas.toDataURL('image/jpeg');
        resolve();
      }, {
        once: true
      });
    });
  }

  async checkForUpdates() {
    try {
      const t = new URLSearchParams(window.location.search).get('t') || 'default';
      const res = await fetch(`${this.options.checkPath.replace('check.php','check_update.php')}?t=${t}&r=${Math.random()}`);
      const hash = await res.text();
      if (!this.lastUpdateHash) {
        this.lastUpdateHash = hash;
      } else if (this.lastUpdateHash !== hash) {
        localStorage.removeItem('previewHash_' + t);
        location.reload(true);
      }
    } catch {}
  }

  addNavigationControls() {
    const navWrapper = document.createElement('div');
    navWrapper.className = 'sb-nav';
    navWrapper.style.position = 'absolute';
    navWrapper.style.bottom = '20px';
    navWrapper.style.left = '50%';
    navWrapper.style.transform = 'translateX(-50%)';
    navWrapper.style.zIndex = '10002';
    navWrapper.style.display = this.options.showNav === false ? 'none' : 'flex';
    navWrapper.style.gap = '10px';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '⟵';
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '⟶';

    [prevBtn, nextBtn].forEach(btn => {
      btn.style.padding = '10px';
      btn.style.background = 'rgba(255,255,255,0.5)';
      btn.style.border = 'none';
      btn.style.borderRadius = '5px';
      btn.style.cursor = 'pointer';
    });

    prevBtn.addEventListener('click', () => {
      this.stop();
      this.current = (this.current - 1 + this.items.length) % this.items.length;
      this.showSlide(this.current);
      this.updateIndicators();
      if (this.options.autoplay) this.start();
    });

    nextBtn.addEventListener('click', () => {
      this.stop();
      this.next();
      if (this.options.autoplay) this.start();
    });

    navWrapper.appendChild(prevBtn);
    navWrapper.appendChild(nextBtn);
    document.body.appendChild(navWrapper);
  }

  addProgressBar() {
    if (this.options.showProgress === false) return;

    const bar = document.createElement('div');
    bar.id = 'sb-progress';
    bar.style.position = 'absolute';
    bar.style.bottom = '0';
    bar.style.left = '0';
    bar.style.height = '5px';
    bar.style.background = '#0f0';
    bar.style.width = '0%';
    bar.style.transition = 'width linear';
    bar.style.zIndex = '10003';

    document.body.appendChild(bar);

    const updateBar = () => {
      const duration = this.slides[this.current].duration || this.options.defaultInterval;
      bar.style.transitionDuration = duration + 'ms';
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.transitionDuration = '0ms';
        bar.style.width = '0%';
      }, duration);
    };

    this._progressUpdater = updateBar;
  }

  addIndicators() {
    if (this.options.showIndicators === false) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'sb-indicators';
    wrapper.style.position = 'absolute';
    wrapper.style.bottom = '60px';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translateX(-50%)';
    wrapper.style.zIndex = '10002';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '8px';

    this.indicatorDots = [];

    for (let i = 0; i < this.slides.length; i++) {
      const dot = document.createElement('div');
      dot.style.width = '10px';
      dot.style.height = '10px';
      dot.style.borderRadius = '50%';
      dot.style.background = i === this.current ? '#fff' : '#888';
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', () => {
        this.stop();
        this.current = i;
        this.showSlide(this.current);
        this.updateIndicators();
        if (this.options.autoplay) this.start();
      });
      wrapper.appendChild(dot);
      this.indicatorDots.push(dot);
    }

    document.body.appendChild(wrapper);
  }

  updateIndicators() {
    if (!this.indicatorDots) return;
    this.indicatorDots.forEach((dot, i) => {
      dot.style.background = i === this.current ? '#fff' : '#888';
    });
  }

  addSwipeSupport() {
    let startX = 0;
    let endX = 0;
    const threshold = 50;

    this.container.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });

    this.container.addEventListener('touchend', e => {
      endX = e.changedTouches[0].clientX;
      const delta = endX - startX;

      if (Math.abs(delta) > threshold) {
        this.stop();
        if (delta > 0) {
          this.current = (this.current - 1 + this.items.length) % this.items.length;
        } else {
          this.current = (this.current + 1) % this.items.length;
        }
        this.showSlide(this.current);
        this.updateIndicators();
        if (this.options.autoplay) this.start();
      }
    });
  }
}
