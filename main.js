const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env) ? (import.meta.env.BASE_URL || './') : './';
const video1 = `${baseUrl}videos/video_2026-06-09_13-59-02.mp4`;
const video2 = `${baseUrl}videos/video_2026-06-09_14-00-02.mp4`;


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Check user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initPreloader();
  
  // Dynamically render video cards before initializing tilts, reveals, and video controls
  renderVideoCards();
  
  if (!prefersReducedMotion) {
    initCustomCursor();
    initHeroParallax();
    init3DTilt();
    initTimelineScroll();
    initMagneticButtons();
  }
  
  initScrollReveals();
  initMobileMenu();
  initContactForm();
  initVideos();

  // Intercept anchor link clicks for smooth Lenis scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl && lenis) {
        e.preventDefault();
        
        // Offset for the fixed header
        lenis.scrollTo(targetEl, {
          offset: -80,
          duration: 1.2
        });
      }
    });
  });
});

/* ==========================================================================
   Smooth Scrolling (Lenis)
   ========================================================================== */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    infinite: false,
  });

  // Synchronize Lenis scrolling with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);
}

/* ==========================================================================
   Preloader / Intro Animation
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloader-bar');
  const chars = document.querySelectorAll('.preloader-title .char');
  const header = document.getElementById('header');
  
  if (prefersReducedMotion) {
    // Skip animations for reduced motion
    if (preloader) preloader.style.display = 'none';
    if (header) header.style.opacity = '1';
    return;
  }

  // Preloader GSAP Timeline
  const tl = gsap.timeline({
    onComplete: () => {
      if (preloader) {
        preloader.style.pointerEvents = 'none';
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            preloader.style.display = 'none';
            // Enable scrolling after loading completes
            document.body.style.overflow = 'auto';
          }
        });
      }
    }
  });

  // Step 1: Animate progress bar
  tl.to(bar, {
    width: '100%',
    duration: 1.2,
    ease: 'power2.inOut'
  });

  // Step 2: Stagger reveal title characters
  tl.to(chars, {
    opacity: 1,
    y: 0,
    stagger: 0.04,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, '-=0.4');

  // Step 3: Fade out preloader bar
  tl.to([bar, '.preloader-bar-container'], {
    opacity: 0,
    duration: 0.3
  }, '+=0.2');

  // Step 4: Slide out preloader & reveal Hero Elements
  tl.addLabel('revealHero');
  
  // Reveal Header
  tl.fromTo(header, 
    { y: -30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
    'revealHero'
  );

  // Reveal Hero Words Staggered
  tl.fromTo('.hero-title .word',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'out' },
    'revealHero'
  );

  // Reveal Hero Subtitle
  tl.fromTo('#hero-subtitle',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
    'revealHero+=0.3'
  );

  // Reveal Hero Buttons
  tl.fromTo('#hero-cta-buttons',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
    'revealHero+=0.5'
  );

  // Reveal Hero Profile Image (Scale + Fade + Slight Rotate)
  tl.fromTo('.hero-image-card',
    { scale: 0.9, rotate: -3, opacity: 0 },
    { scale: 1, rotate: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.2)' },
    'revealHero+=0.2'
  );

  // Reveal Floating Badges
  tl.fromTo('.floating-badge',
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'back.out(1.7)' },
    'revealHero+=0.6'
  );
}

/* ==========================================================================
   Custom Follower Mouse Cursor Glow
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor-glow');
  if (!cursor) return;

  // Disable custom cursor on touch/mobile devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || window.innerWidth < 992) {
    cursor.style.display = 'none';
    return;
  }

  // Smooth mouse coordinates tracking using GSAP quickTo
  const xTo = gsap.quickTo(cursor, 'left', { duration: 0.4, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'top', { duration: 0.4, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  // Shrink/Glow effect on interactive elements hover
  const interactives = document.querySelectorAll('a, button, [data-tilt], .skill-card, .gallery-item, .video-card, .video-play-btn, .video-modal-close-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor, { width: 500, height: 500, duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursor, { width: 400, height: 400, duration: 0.3 });
    });
  });
}

/* ==========================================================================
   Hero Mouse Move Parallax
   ========================================================================== */
function initHeroParallax() {
  const heroSection = document.getElementById('hero');
  const heroImg = document.getElementById('hero-profile-img');
  const badges = document.querySelectorAll('.floating-badge');

  if (!heroSection || !heroImg || window.innerWidth < 992) return;

  heroSection.addEventListener('mousemove', (e) => {
    const { width, height } = heroSection.getBoundingClientRect();
    const mouseX = e.clientX - width / 2;
    const mouseY = e.clientY - height / 2;
    
    // Normalize coordinates (-0.5 to 0.5)
    const normX = mouseX / (width / 2);
    const normY = mouseY / (height / 2);

    // Parallax values
    gsap.to(heroImg, {
      x: normX * 12,
      y: normY * 12,
      duration: 0.6,
      ease: 'power2.out'
    });

    badges.forEach((badge, index) => {
      const factor = (index + 1) * -15; // Move badges in opposite direction
      gsap.to(badge, {
        x: normX * factor,
        y: normY * factor,
        duration: 0.8,
        ease: 'power3.out'
      });
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    gsap.to([heroImg, ...badges], {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
}

/* ==========================================================================
   3D Hover Tilt Effect
   ========================================================================== */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt], .hero-image-card');
  if (window.innerWidth < 992) return;

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate rotation based on pointer position relative to card center
      const rotateY = ((x - width / 2) / (width / 2)) * 12; // max 12 deg
      const rotateX = -((y - height / 2) / (height / 2)) * 12; // max 12 deg

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.5
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        ease: 'power2.out',
        duration: 0.8
      });
    });
  });
}

/* ==========================================================================
   Timeline Scroll-Drawing & Milestones Highlight
   ========================================================================== */
function initTimelineScroll() {
  const progressBar = document.getElementById('timeline-progress-bar');
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!progressBar) return;

  // Animate the vertical line drawing y2 attribute (0 to 100) on scroll
  gsap.fromTo(progressBar,
    { attr: { y2: 0 } },
    {
      attr: { y2: 100 },
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline-container',
        start: 'top 30%',
        end: 'bottom 60%',
        scrub: true,
      }
    }
  );

  // Toggle active class on milestone dots as they hit 50% height in viewport
  timelineItems.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => item.classList.add('active'),
      onEnterBack: () => item.classList.add('active'),
      onLeave: () => {
        // keep it active once scrolled past
      },
      onLeaveBack: () => item.classList.remove('active')
    });
  });
}

/* ==========================================================================
   Magnetic Buttons (GSAP spring hover)
   ========================================================================== */
function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  if (window.innerWidth < 992) return;

  magneticBtns.forEach(btn => {
    const text = btn.querySelector('.btn-text');
    const icon = btn.querySelector('.btn-icon-svg');

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // Magnetic pull effect on outer button container
      gsap.to(btn, {
        x: mouseX * 0.35,
        y: mouseY * 0.35,
        duration: 0.3,
        ease: 'power2.out'
      });

      // Extra parallax shift on inner button text & icon
      if (text) {
        gsap.to(text, {
          x: mouseX * 0.15,
          y: mouseY * 0.15,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
      if (icon) {
        gsap.to(icon, {
          x: mouseX * 0.2,
          y: mouseY * 0.2,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      // Return elements to original positions smoothly
      gsap.to([btn, text, icon], {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });
}

/* ==========================================================================
   Scroll Reveals (Sections, Cards, and Images)
   ========================================================================== */
function initScrollReveals() {
  // 1. General Header scroll glass transformation
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (prefersReducedMotion) return;

  // 2. Sections/Cards entry scroll reveals
  // Stagger reveal skill cards
  gsap.from('#skills-grid-container .skill-card', {
    scrollTrigger: {
      trigger: '#skills-grid-container',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    y: 50,
    opacity: 0,
    scale: 0.95,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power2.out'
  });

  // Stagger reveal gallery items
  gsap.from('#gallery-grid-container .gallery-item', {
    scrollTrigger: {
      trigger: '#gallery-grid-container',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    y: 60,
    opacity: 0,
    scale: 0.96,
    stagger: 0.15,
    duration: 1.0,
    ease: 'power3.out'
  });

  // Stagger reveal video cards
  gsap.from('#video-grid-container .video-card', {
    scrollTrigger: {
      trigger: '#video-grid-container',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    y: 60,
    opacity: 0,
    scale: 0.96,
    stagger: 0.15,
    duration: 1.0,
    ease: 'power3.out'
  });

  // Section Headers Upward Fade & Blur Reveal
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(hdr => {
    gsap.from(hdr, {
      scrollTrigger: {
        trigger: hdr,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      filter: 'blur(5px)',
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  // About Section Staggered Left/Right Reveal
  gsap.from('.about-image-wrapper', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 75%'
    },
    x: -60,
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out'
  });

  gsap.from('.about-text-content', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 75%'
    },
    x: 60,
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out'
  });

  // Learning room image reveal
  gsap.from('.timeline-visual-side', {
    scrollTrigger: {
      trigger: '.timeline-grid',
      start: 'top 70%'
    },
    x: 50,
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out'
  });

  // Final CTA card upreveal
  gsap.from('.cta-glowing-wrapper', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 75%'
    },
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  });
}

/* ==========================================================================
   Mobile Nav Menu Overlay Drawer
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.nav-link, #header-contact-btn');

  if (!toggle || !menu) return;

  const toggleMenu = () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    
    // Toggle aria state
    const expanded = toggle.classList.contains('active');
    toggle.setAttribute('aria-expanded', expanded);
    
    // Lock scrolling when menu is active on mobile
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  toggle.addEventListener('click', toggleMenu);

  // Close menu on navigation link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

/* ==========================================================================
   Contact Form Validation & Submittal Success Interaction
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status-msg');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form || !statusMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Disable submit button during animation/sending simulation
    if (submitBtn) submitBtn.disabled = true;
    statusMsg.className = 'form-status-msg';
    statusMsg.innerText = 'Надсилання повідомлення...';

    // Simulate server request
    setTimeout(() => {
      statusMsg.classList.add('success');
      statusMsg.innerText = 'Дякую, Артур отримав ваше повідомлення! Він відповість найближчим часом.';
      
      // Reset form fields
      form.reset();
      
      if (submitBtn) submitBtn.disabled = false;
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        gsap.to(statusMsg, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            statusMsg.innerText = '';
            statusMsg.style.opacity = 1;
            statusMsg.className = 'form-status-msg';
          }
        });
      }, 5000);
      
    }, 1500);
  });
}

/* ==========================================================================
   Video Player Controls & Interactions (Cinematic Custom Controls)
   ========================================================================== */
/* ==========================================================================
   Video Cards Render & Player Controls (Cinematic Custom Controls)
   ========================================================================== */
function renderVideoCards() {
  const container = document.getElementById('video-grid-container');
  if (!container) return;
  
  const videosData = [
    {
      src: video1,
      title: 'Артур у русі',
      description: 'Бо фото — це добре, але іноді треба доказати, що персонаж не NPC.',
      poster: ''
    },
    {
      src: video2,
      title: 'Живий вайб',
      description: 'Той самий момент, коли портфоліо стало трохи менш офіційним.',
      poster: ''
    }
  ];

  container.innerHTML = videosData.map((video) => `
    <article class="video-card glass-card scroll-reveal-scale" data-tilt>
      <div class="video-frame">
        <video 
          src="${video.src}#t=0.001" 
          class="video-element" 
          playsinline 
          preload="metadata"
          ${video.poster ? `poster="${video.poster}"` : ''}
        >
          Ваш браузер не підтримує відео.
        </video>
        <div class="video-overlay">
          <button class="video-play-btn" aria-label="Відтворити відео">
            <svg viewBox="0 0 24 24" class="play-icon">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      <h3 class="video-card-title">${video.title}</h3>
      <p class="video-card-desc">${video.description}</p>
    </article>
  `).join('');
}

function initVideos() {
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video-element');
  const modalTitle = document.getElementById('modal-video-title');
  const modalDesc = document.getElementById('modal-video-desc');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = modal ? modal.querySelector('.video-modal-backdrop') : null;
  
  const videoCards = document.querySelectorAll('.video-card');
  
  if (!modal || !modalVideo || !modalTitle || !modalDesc) return;
  
  // Custom Controls elements caching
  const videoContainer = document.getElementById('modal-video-container');
  const playPauseBtn = document.getElementById('video-play-pause-btn');
  const playIcon = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
  const pauseIcon = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
  const replayIcon = playPauseBtn ? playPauseBtn.querySelector('.icon-replay') : null;
  const timeDisplay = document.getElementById('video-time-display');
  const muteBtn = document.getElementById('video-mute-btn');
  const volumeOnIcon = muteBtn ? muteBtn.querySelector('.icon-volume-on') : null;
  const volumeMuteIcon = muteBtn ? muteBtn.querySelector('.icon-volume-mute') : null;
  const volumeSlider = document.getElementById('video-volume-slider');
  const fullscreenBtn = document.getElementById('video-fullscreen-btn');
  const fullscreenEnterIcon = fullscreenBtn ? fullscreenBtn.querySelector('.icon-fullscreen-enter') : null;
  const fullscreenExitIcon = fullscreenBtn ? fullscreenBtn.querySelector('.icon-fullscreen-exit') : null;
  const speedBtn = document.getElementById('video-speed-btn');
  const speedMenu = document.getElementById('video-speed-menu');
  const progressContainer = document.getElementById('video-progress-container');
  const progressFill = document.getElementById('video-progress-fill');
  const progressHandle = document.getElementById('video-progress-handle');
  const errorOverlay = document.getElementById('modal-video-error');
  const loaderOverlay = document.getElementById('modal-video-loader');
  const playOverlay = document.getElementById('modal-video-play-overlay');
  const largePlayBtn = playOverlay ? playOverlay.querySelector('.modal-large-play-btn') : null;
  const largePlayIcon = largePlayBtn ? largePlayBtn.querySelector('.large-icon-play') : null;
  const largeReplayIcon = largePlayBtn ? largePlayBtn.querySelector('.large-icon-replay') : null;
  
  let controlsTimeout;
  let isModalOpen = false;
  
  // Reset controls timer
  const resetControlsTimer = () => {
    if (!videoContainer) return;
    videoContainer.classList.remove('hide-controls');
    clearTimeout(controlsTimeout);
    
    // Hide controls only if video is currently playing
    if (!modalVideo.paused) {
      controlsTimeout = setTimeout(() => {
        videoContainer.classList.add('hide-controls');
      }, 2500);
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
  // Toggle Play / Pause
  const togglePlay = () => {
    if (modalVideo.paused) {
      modalVideo.play().catch(err => console.log("Play failed:", err));
    } else {
      modalVideo.pause();
    }
    resetControlsTimer();
  };
  
  // Open modal function
  const openModal = (videoSrc, title, desc) => {
    isModalOpen = true;
    
    // Hide overlays initially
    if (errorOverlay) errorOverlay.classList.remove('active');
    if (loaderOverlay) loaderOverlay.classList.remove('active');
    if (videoContainer) {
      videoContainer.classList.add('paused'); // shows controls
      videoContainer.classList.remove('playing');
    }
    
    // Reset volume slider & playback speed
    if (volumeSlider) {
      modalVideo.volume = volumeSlider.value;
      modalVideo.muted = false;
    }
    modalVideo.playbackRate = 1.0;
    if (speedBtn) speedBtn.innerText = '1x';
    if (speedMenu) {
      const options = speedMenu.querySelectorAll('.speed-option');
      options.forEach(o => o.classList.remove('active'));
      const defaultOpt = speedMenu.querySelector('.speed-option[data-speed="1"]');
      if (defaultOpt) defaultOpt.classList.add('active');
    }
    
    // Reset control buttons state
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (replayIcon) replayIcon.style.display = 'none';
    if (largePlayIcon) largePlayIcon.style.display = 'block';
    if (largeReplayIcon) largeReplayIcon.style.display = 'none';
    
    // Populate details
    modalVideo.src = videoSrc;
    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    
    // Lock body scrolling and stop Lenis scroll
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    
    // GSAP show timeline
    const tl = gsap.timeline();
    tl.to(modal, {
      display: 'flex',
      visibility: 'visible',
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
    tl.to(modal.querySelector('.video-modal-wrapper'), {
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.2)'
    }, '-=0.15');
    
    // Pause all page videos to prevent simultaneous playbacks
    document.querySelectorAll('.video-element').forEach(vid => {
      if (vid !== modalVideo) {
        vid.pause();
      }
    });

    // Attempt autoplay
    modalVideo.play().catch(err => {
      console.warn("Autoplay prevented:", err);
    });
  };
  
  // Close modal function
  const closeModal = () => {
    isModalOpen = false;
    modalVideo.pause();
    clearTimeout(controlsTimeout);
    
    // Hide loading / error states
    if (loaderOverlay) loaderOverlay.classList.remove('active');
    if (errorOverlay) errorOverlay.classList.remove('active');
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log("Exit fullscreen failed:", err));
    }
    
    const tl = gsap.timeline({
      onComplete: () => {
        modalVideo.src = '';
        document.body.style.overflow = '';
        if (lenis) lenis.start(); // Restart Lenis smooth scroll
      }
    });
    tl.to(modal.querySelector('.video-modal-wrapper'), {
      scale: 0.92,
      duration: 0.25,
      ease: 'power2.in'
    });
    tl.to(modal, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.15');
    tl.to(modal, {
      display: 'none',
      visibility: 'hidden',
      duration: 0
    });
  };
  
  // Video listeners to keep HTML elements in sync
  modalVideo.addEventListener('play', () => {
    if (playIcon && pauseIcon && replayIcon) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      replayIcon.style.display = 'none';
    }
    if (largePlayIcon && largeReplayIcon) {
      largePlayIcon.style.display = 'none';
      largeReplayIcon.style.display = 'none';
    }
    if (videoContainer) {
      videoContainer.classList.remove('paused');
      videoContainer.classList.add('playing');
    }
    resetControlsTimer();
  });
  
  modalVideo.addEventListener('pause', () => {
    const isEnded = modalVideo.ended || modalVideo.currentTime >= modalVideo.duration;
    if (!isEnded) {
      if (playIcon && pauseIcon && replayIcon) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        replayIcon.style.display = 'none';
      }
      if (largePlayIcon && largeReplayIcon) {
        largePlayIcon.style.display = 'block';
        largeReplayIcon.style.display = 'none';
      }
    }
    if (videoContainer) {
      videoContainer.classList.add('paused');
      videoContainer.classList.remove('playing');
    }
    clearTimeout(controlsTimeout);
    if (videoContainer) videoContainer.classList.remove('hide-controls');
  });
  
  modalVideo.addEventListener('ended', () => {
    if (playIcon && pauseIcon && replayIcon) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'none';
      replayIcon.style.display = 'block';
    }
    if (largePlayIcon && largeReplayIcon) {
      largePlayIcon.style.display = 'none';
      largeReplayIcon.style.display = 'block';
    }
    if (videoContainer) {
      videoContainer.classList.add('paused');
      videoContainer.classList.remove('playing');
      videoContainer.classList.remove('hide-controls');
    }
  });

  // Buffering and loading indicators
  modalVideo.addEventListener('loadstart', () => {
    if (loaderOverlay) loaderOverlay.classList.add('active');
  });
  modalVideo.addEventListener('waiting', () => {
    if (loaderOverlay) loaderOverlay.classList.add('active');
  });
  modalVideo.addEventListener('seeking', () => {
    if (loaderOverlay) loaderOverlay.classList.add('active');
  });
  modalVideo.addEventListener('playing', () => {
    if (loaderOverlay) loaderOverlay.classList.remove('active');
  });
  modalVideo.addEventListener('canplay', () => {
    if (loaderOverlay) loaderOverlay.classList.remove('active');
  });
  modalVideo.addEventListener('seeked', () => {
    if (loaderOverlay) loaderOverlay.classList.remove('active');
  });
  
  modalVideo.addEventListener('timeupdate', () => {
    const duration = modalVideo.duration || 0;
    const currentTime = modalVideo.currentTime;
    
    // Update progress track
    if (progressFill && duration > 0) {
      const pct = (currentTime / duration) * 100;
      progressFill.style.width = `${pct}%`;
      if (progressHandle) progressHandle.style.left = `${pct}%`;
    }
    
    // Update text counter
    if (timeDisplay) {
      timeDisplay.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
  });
  
  // Error state listener
  modalVideo.addEventListener('error', () => {
    if (loaderOverlay) loaderOverlay.classList.remove('active');
    if (errorOverlay) errorOverlay.classList.add('active');
    modalVideo.removeAttribute('controls');
  });
  
  // Click on screen toggles play
  modalVideo.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // Click on modal play/replay overlay toggles play
  if (playOverlay) {
    playOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }
  
  // Play button click in control bar
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  // Stop click propagation from controls bar
  const controlsBar = document.getElementById('modal-video-controls');
  if (controlsBar) {
    controlsBar.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  // Progress Bar Scrubbing logic
  if (progressContainer) {
    const scrub = (e) => {
      const rect = progressContainer.getBoundingClientRect();
      let clickX = (e.clientX || e.touches[0].clientX) - rect.left;
      clickX = Math.max(0, Math.min(clickX, rect.width));
      const duration = modalVideo.duration || 0;
      if (duration > 0) {
        modalVideo.currentTime = (clickX / rect.width) * duration;
      }
    };
    
    let isDragging = false;
    
    progressContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      scrub(e);
    });
    
    window.addEventListener('mousemove', (e) => {
      if (isDragging) scrub(e);
    });
    
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Mobile touch support
    progressContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      scrub(e);
    });
    
    window.addEventListener('touchmove', (e) => {
      if (isDragging) scrub(e);
    });
    
    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
  
  // Mute / Unmute
  const toggleMute = () => {
    modalVideo.muted = !modalVideo.muted;
    if (modalVideo.muted) {
      if (volumeSlider) volumeSlider.value = 0;
      if (volumeOnIcon && volumeMuteIcon) {
        volumeOnIcon.style.display = 'none';
        volumeMuteIcon.style.display = 'block';
      }
    } else {
      const lastVol = parseFloat(modalVideo.dataset.lastVolume || 1);
      modalVideo.volume = lastVol;
      if (volumeSlider) volumeSlider.value = lastVol;
      if (volumeOnIcon && volumeMuteIcon) {
        volumeOnIcon.style.display = 'block';
        volumeMuteIcon.style.display = 'none';
      }
    }
    resetControlsTimer();
  };
  
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }
  
  // Volume Slider change
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      modalVideo.volume = vol;
      
      if (vol === 0) {
        modalVideo.muted = true;
        if (volumeOnIcon && volumeMuteIcon) {
          volumeOnIcon.style.display = 'none';
          volumeMuteIcon.style.display = 'block';
        }
      } else {
        modalVideo.muted = false;
        modalVideo.dataset.lastVolume = vol; // save last volume level
        if (volumeOnIcon && volumeMuteIcon) {
          volumeOnIcon.style.display = 'block';
          volumeMuteIcon.style.display = 'none';
        }
      }
      resetControlsTimer();
    });
  }
  
  // Playback Speed control
  if (speedMenu) {
    const options = speedMenu.querySelectorAll('.speed-option');
    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        
        const speed = parseFloat(opt.dataset.speed);
        modalVideo.playbackRate = speed;
        if (speedBtn) speedBtn.innerText = `${speed}x`;
        resetControlsTimer();
      });
    });
  }
  
  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen()
        .then(() => {
          if (fullscreenEnterIcon && fullscreenExitIcon) {
            fullscreenEnterIcon.style.display = 'none';
            fullscreenExitIcon.style.display = 'block';
          }
        })
        .catch(err => {
          console.error("Fullscreen request failed:", err);
        });
    } else {
      document.exitFullscreen()
        .then(() => {
          if (fullscreenEnterIcon && fullscreenExitIcon) {
            fullscreenEnterIcon.style.display = 'block';
            fullscreenExitIcon.style.display = 'none';
          }
        })
        .catch(err => {
          console.error("Exit fullscreen failed:", err);
        });
    }
    resetControlsTimer();
  };
  
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }
  
  // Listen for fullscreen change event to toggle icons in case users press Esc to exit fullscreen
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      if (fullscreenEnterIcon && fullscreenExitIcon) {
        fullscreenEnterIcon.style.display = 'block';
        fullscreenExitIcon.style.display = 'none';
      }
    }
  });
  
  // Auto-hiding event listeners
  if (videoContainer) {
    videoContainer.addEventListener('mousemove', resetControlsTimer);
    videoContainer.addEventListener('mouseleave', () => {
      if (!modalVideo.paused) {
        videoContainer.classList.add('hide-controls');
      }
    });
  }
  
  // Bind click event on video cards
  videoCards.forEach(card => {
    const video = card.querySelector('.video-element');
    const titleEl = card.querySelector('.video-card-title');
    const descEl = card.querySelector('.video-card-desc');
    const triggerElements = card.querySelectorAll('.video-frame, .video-overlay, .video-play-btn, .video-element');
    
    if (!video || !titleEl || !descEl) return;
    
    const videoSrc = video.src;
    const title = titleEl.innerText;
    const desc = descEl.innerText;
    
    triggerElements.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(videoSrc, title, desc);
      });
    });
  });
  
  // Bind close buttons click events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }
  
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }
  
  // Bind escape & space keys
  window.addEventListener('keydown', (e) => {
    if (isModalOpen) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); // prevent page scroll
        togglePlay();
      }
    }
  });
}
