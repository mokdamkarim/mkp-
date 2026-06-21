document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const handleNavbarScroll = () => {
            if (window.scrollY >= 1) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleNavbarScroll, { passive: true });
        handleNavbarScroll();
    }
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    const canvas = document.getElementById("interactive-particles");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particlesArray = [];
        let mouse = { x: null, y: null, radius: 145 };
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= dx * force * 0.035;
                        this.y -= dy * force * 0.035;
                    }
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }
        const initParticles = () => {
            particlesArray = [];
            const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 80);
            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 1.5 + 0.5;
                let x = Math.random() * (canvas.width - size * 2) + size;
                let y = Math.random() * (canvas.height - size * 2) + size;
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                let color = "rgba(200, 240, 245, 0.15)";
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        };
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
            requestAnimationFrame(animateParticles);
        };
        const connectParticles = () => {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 110) {
                        const alpha = (110 - distance) / 110 * 0.12;
                        ctx.strokeStyle = `rgba(200, 240, 245, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        };
        initParticles();
        animateParticles();
    }
    const splitWordsElements = document.querySelectorAll('.split-words');
    const splitLinesElements = document.querySelectorAll('.split-lines');
    const runSplitText = (elements) => {
        elements.forEach(element => {
            const text = element.textContent.trim();
            element.innerHTML = '';
            const words = text.split(/\s+/);
            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'char-container';
                wordSpan.style.display = 'inline-block';
                const wordText = wordIndex === words.length - 1 ? word : word + '\u00A0';
                const innerSpan = document.createElement('span');
                innerSpan.className = 'char-reveal';
                innerSpan.textContent = wordText;
                wordSpan.appendChild(innerSpan);
                element.appendChild(wordSpan);
            });
        });
    };
    runSplitText(splitWordsElements);
    runSplitText(splitLinesElements);
    const preloader = document.getElementById("preloader");
    const appContainer = document.getElementById("app-container");
    const scrollInd = document.querySelector('.premium-scroll-indicator');
    const preloaderBar = document.getElementById("preloader-bar");
    let loadingProgress = { value: 0 };
    const activeLoadTween = gsap.to(loadingProgress, {
        value: 75,
        duration: 3.5,
        ease: "power2.out",
        onUpdate: () => {
            if (preloaderBar) preloaderBar.style.width = `${loadingProgress.value}%`;
        }
    });
    const dismissPreloader = () => {
        activeLoadTween.kill();
        const dismissalTimeline = gsap.timeline({
            onComplete: () => {
                if (preloader) preloader.style.display = "none";
                if (appContainer) appContainer.style.opacity = "1";
                if (scrollInd) scrollInd.classList.add('visible');
                ScrollTrigger.refresh();
                initCinematicReveals();
            }
        });
        dismissalTimeline
            .to(loadingProgress, {
                value: 100,
                duration: 0.6,
                ease: "power2.out",
                onUpdate: () => {
                    if (preloaderBar) preloaderBar.style.width = `${loadingProgress.value}%`;
                }
            })
            .to(".progress-bar-container", { opacity: 0, duration: 0.5, ease: "power2.inOut" })
            .to(".loading-text", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "-=0.25")
            .to(".preloader-logo", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "-=0.25")
            .to(".preloader-main-black-bg", { yPercent: -100, duration: 1.0, ease: "power3.inOut" })
            .to({}, { duration: 0.3 })
            .to(".preloader-curtain-accent", { yPercent: -100, duration: 1.0, ease: "power3.inOut" })
            .to({}, { duration: 0.3 })
            .to(".preloader-curtain-deep", { yPercent: -100, duration: 1.0, ease: "power3.inOut" });
    };
    if (document.readyState === "complete") {
        setTimeout(dismissPreloader, 1000);
    } else {
        window.addEventListener("load", () => {
            setTimeout(dismissPreloader, 500);
        });
    }
    setTimeout(() => {
        if (preloader && preloader.style.opacity !== "0" && loadingProgress.value < 100) {
            dismissPreloader();
        }
    }, 4500);
    const elCursorOutline = document.getElementById("cursor-outline");
    if (elCursorOutline && window.innerWidth > 1024) {
        gsap.set(elCursorOutline, { xPercent: -50, yPercent: -50, top: 0, left: 0 });
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mousePos = { x: pos.x, y: pos.y };
        const damping = 0.12;
        const fx = gsap.quickTo(elCursorOutline, "x", { duration: 0.25, ease: "power3.out" });
        const fy = gsap.quickTo(elCursorOutline, "y", { duration: 0.25, ease: "power3.out" });
        window.addEventListener("mousemove", (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
        });
        gsap.ticker.add(() => {
            pos.x += (mousePos.x - pos.x) * damping;
            pos.y += (mousePos.y - pos.y) * damping;
            fx(pos.x);
            fy(pos.y);
        });
        document.addEventListener("mouseleave", () => gsap.to(elCursorOutline, { opacity: 0, duration: 0.3 }));
        document.addEventListener("mouseenter", () => gsap.to(elCursorOutline, { opacity: 1, duration: 0.3 }));
        const magneticTargets = document.querySelectorAll(".magnetic-target");
        magneticTargets.forEach(el => {
            const speed = parseFloat(el.getAttribute("data-magnet-speed")) || 0.25;
            el.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-hover");
                gsap.to(elCursorOutline, { scale: 1.3, duration: 0.3 });
            });
            el.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-hover");
                gsap.to(elCursorOutline, { scale: 1, duration: 0.3 });
                gsap.to(el, { x: 0, y: 0, rotateX: 0, rotateY: 0, ease: "elastic.out(1, 0.3)", duration: 0.8 });
            });
            el.addEventListener("mousemove", (e) => {
                const bounds = el.getBoundingClientRect();
                const center = {
                    x: bounds.left + bounds.width / 2,
                    y: bounds.top + bounds.height / 2
                };
                const delta = {
                    x: e.clientX - center.x,
                    y: e.clientY - center.y
                };
                const rotX = (delta.y / bounds.height) * -20;
                const rotY = (delta.x / bounds.width) * 20;
                el.style.setProperty('--mouse-x', `${(e.clientX - bounds.left) / bounds.width * 100}%`);
                el.style.setProperty('--mouse-y', `${(e.clientY - bounds.top) / bounds.height * 100}%`);
                gsap.to(el, {
                    x: delta.x * speed,
                    y: delta.y * speed,
                    rotateX: rotX,
                    rotateY: rotY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }
    const initCinematicReveals = () => {
        gsap.timeline({ defaults: { ease: "power4.out" } })
            .to("#home .char-reveal", {
                opacity: 1,
                y: 0,
                rotate: 0,
                stagger: 0.02,
                duration: 1.4
            })
            .fromTo("#home .trigger-fade", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0 }, "-=0.8")
            .fromTo(".interactive-3d-cards .mockup-card", { opacity: 0, scale: 0.85, y: 60, rotateY: -15 }, { opacity: 1, scale: 1, y: 0, rotateY: 0, stagger: 0.15, duration: 1.5 }, "-=0.8");
        const sections = document.querySelectorAll("section, footer");
        sections.forEach(sec => {
            const chars = sec.querySelectorAll(".char-reveal");
            if (chars.length > 0) {
                gsap.to(chars, {
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                    stagger: 0.015,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sec,
                        start: "top 75%",
                        toggleActions: "play none none none"
                    }
                });
            }
            const structures = sec.querySelectorAll(".services-grid-lux, .partnership-container-grid, .tab-content-wrapper, .contact-grid");
            if (structures.length > 0) {
                gsap.fromTo(structures, { opacity: 0, y: 40 }, {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sec,
                        start: "top 70%",
                        toggleActions: "play none none none"
                    }
                });
            }
        });
    };
    const navHomeBtn = document.getElementById("nav-home-btn");
    const mobHomeBtn = document.getElementById("mob-home-btn");
    const heroScrollTrigger = document.getElementById("hero-scroll-trigger");
    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    const scrollToAnchor = (targetSelector) => {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 60;
            const startPosition = window.scrollY;
            const distance = targetPosition - startPosition;
            const duration = 800; 
            let startTime = null;
            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const easeProgress = easeInOutCubic(progress);
                window.scrollTo(0, startPosition + distance * easeProgress);
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };
            requestAnimationFrame(animation);
        }
    };
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId !== '#') {
                e.preventDefault();
                scrollToAnchor(targetId);
            }
        });
    });
    if (navHomeBtn) {
        navHomeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            scrollToAnchor("#home");
        });
    }
    if (mobHomeBtn) {
        mobHomeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            scrollToAnchor("#home");
        });
    }
    const outroLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"])');
    outroLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            if (link.target === "_blank" || e.ctrlKey || e.metaKey) return;
            if (targetUrl) {
                e.preventDefault();
                const outroContainer = document.getElementById('page-outro');
                if (outroContainer) {
                    outroContainer.style.display = "flex";
                    outroContainer.style.pointerEvents = "auto";
                    const tl = gsap.timeline({
                        onComplete: () => {
                            window.location.href = targetUrl;
                        }
                    });
                    tl.fromTo('.outro-curtain-deep', { yPercent: -100 }, { yPercent: 0, duration: 1.0, ease: "power3.inOut" })
                      .fromTo('.outro-curtain-accent', { yPercent: -100 }, { yPercent: 0, duration: 1.0, ease: "power3.inOut" }, "-=0.75")
                      .fromTo('.outro-curtain-black', { yPercent: -100 }, { yPercent: 0, duration: 1.0, ease: "power3.inOut" }, "-=0.75");
                } else {
                    window.location.href = targetUrl;
                }
            }
        });
    });
    if (heroScrollTrigger) {
        heroScrollTrigger.addEventListener("click", () => {
            scrollToAnchor("#space-gallery");
        });
    }
    const cardPartnership = document.querySelector(".card-action-partnership");
    const cardAbout = document.querySelector(".card-action-about");
    const cardInquiry = document.querySelector(".card-action-inquiry");
    const primaryBrowseBtn = document.querySelector('.primary-btn[href="#services"]');
    if (primaryBrowseBtn) {
        primaryBrowseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            scrollToAnchor("#services");
        });
    }
    if (cardPartnership) {
        cardPartnership.addEventListener("click", () => scrollToAnchor("#partnership"));
    }
    if (cardAbout) {
        cardAbout.addEventListener("click", () => scrollToAnchor("#about"));
    }
    if (cardInquiry) {
        cardInquiry.addEventListener("click", () => scrollToAnchor("#main-form-panel"));
    }
    const observedArrow = document.getElementById("gallery-vector-arrow");
    if (observedArrow) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: "0px 0px -10% 0px"
        };
        const arrowIntersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observedArrow.classList.add("visible");
                } else {
                    observedArrow.classList.remove("visible");
                }
            });
        }, observerOptions);
        const targetSection = document.getElementById("space-gallery");
        if (targetSection) {
            arrowIntersectionObserver.observe(targetSection);
        }
    }
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
        ScrollTrigger.create({
            trigger: "body",
            start: "bottom bottom",
            end: "bottom bottom",
            onToggle: (self) => {
                if (self.isActive) {
                    backToTopBtn.classList.add("visible");
                } else {
                    backToTopBtn.classList.remove("visible");
                }
            }
        });
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }, { passive: true });
        backToTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const startPosition = window.scrollY;
            const duration = 800;
            let startTime = null;
            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const easeProgress = easeInOutCubic(progress);
                window.scrollTo(0, startPosition - startPosition * easeProgress);
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };
            requestAnimationFrame(animation);
        });
    }
    const tiltContainer = document.getElementById('tilt-container');
    if (tiltContainer && window.innerWidth > 1024) {
        let bounds = tiltContainer.getBoundingClientRect();
        const handleGalleryTilt = (e) => {
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            const normX = (mouseX / bounds.width - 0.5) * 2;
            const normY = (mouseY / bounds.height - 0.5) * 2;
            gsap.to(".center-img", { x: normX * -30, y: normY * -30, rotateX: normY * -6, rotateY: normX * 6, duration: 0.6, ease: "power2.out" });
            gsap.to(".top-right-img", { x: normX * -60, y: normY * -60, rotateX: normY * -10, rotateY: normX * 10, duration: 0.6, ease: "power2.out" });
            gsap.to(".bottom-left-img", { x: normX * -90, y: normY * -90, rotateX: normY * -14, rotateY: normX * 14, duration: 0.6, ease: "power2.out" });
        };
        tiltContainer.addEventListener('mousemove', handleGalleryTilt);
        tiltContainer.addEventListener('mouseenter', () => {
            bounds = tiltContainer.getBoundingClientRect();
            if (elCursorOutline) {
                elCursorOutline.classList.add("gallery-hover-cursor");
            }
        });
        tiltContainer.addEventListener('mouseleave', () => {
            if (elCursorOutline) {
                elCursorOutline.classList.remove("gallery-hover-cursor");
            }
            gsap.to([".center-img", ".top-right-img", ".bottom-left-img"], {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                duration: 1.2,
                ease: "elastic.out(1, 0.4)"
            });
        });
    }
    const tabBtns = document.querySelectorAll(".ios-tab-btn");
    const indicator = document.getElementById("ios-tab-indicator");
    let isTabAnimating = false;
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.classList.contains("active") || isTabAnimating) return;
            isTabAnimating = true;
            const targetTab = btn.getAttribute("data-tab");
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            if (indicator) {
                indicator.className = `ios-tab-indicator pos-${targetTab}`;
            }
            const activeCard = document.querySelector(".tab-card-lux.active-tab");
            const targetCard = document.getElementById(`tab-${targetTab}`);
            if (activeCard && targetCard) {
                gsap.timeline({
                        onComplete: () => { isTabAnimating = false; }
                    })
                    .to(activeCard, {
                        opacity: 0,
                        y: 15,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                            activeCard.classList.remove("active-tab");
                            targetCard.classList.add("active-tab");
                        }
                    })
                    .fromTo(targetCard, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
            } else {
                isTabAnimating = false;
            }
        });
    });
    const quickLinks = document.querySelectorAll(".quick-link");
    quickLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSec = document.querySelector(targetId);
            if (targetSec) {
                const targetPosition = targetSec.getBoundingClientRect().top + window.scrollY - 60;
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const duration = 800;
                let startTime = null;
                const animation = (currentTime) => {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);
                    const easeProgress = easeInOutCubic(progress);
                    window.scrollTo(0, startPosition + distance * easeProgress);
                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    } else {
                        targetSec.classList.add("section-glow-active");
                        setTimeout(() => {
                            targetSec.classList.remove("section-glow-active");
                        }, 1000);
                    }
                };
                requestAnimationFrame(animation);
            }
        });
    });
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const toggleMobileMenu = () => {
        const isActive = hamburgerBtn.classList.toggle("is-active");
        if (isActive) {
            mobileMenuOverlay.classList.add("open");
            document.body.style.overflow = "hidden";
        } else {
            mobileMenuOverlay.classList.remove("open");
            document.body.style.overflow = "";
        }
    };
    if (hamburgerBtn) hamburgerBtn.addEventListener("click", toggleMobileMenu);
    mobileLinks.forEach(link => link.addEventListener("click", () => {
        if (hamburgerBtn.classList.contains("is-active")) toggleMobileMenu();
    }));
    const contactModal = document.getElementById("contact-modal");
    const openModalBtns = document.querySelectorAll(".open-contact-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const openContactModal = () => {
        if (contactModal) {
            contactModal.style.display = "flex";
            gsap.fromTo(".modal-content", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" });
        }
    };
    const closeContactModal = () => {
        if (contactModal) {
            gsap.to(".modal-content", {
                y: 40,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    contactModal.style.display = "none";
                }
            });
        }
    };
    openModalBtns.forEach(btn => btn.addEventListener("click", openContactModal));
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeContactModal);
    if (contactModal) {
        contactModal.addEventListener("click", (e) => {
            if (e.target === contactModal) closeContactModal();
        });
    }
    const scrollFill = document.getElementById('scroll-fill');
    const scrollPercentageText = document.getElementById('scroll-percentage');
    const mainContactForm = document.getElementById("main-contact-form");
    if (mainContactForm) {
        mainContactForm.addEventListener("submit", (e) => {
            e.preventDefault(); 
            const wrapper = mainContactForm.closest(".glass-panel");
            const successState = wrapper ? wrapper.querySelector(".success-state-container") : null;
            const formTitle = wrapper ? wrapper.querySelector(".form-title") : null;
            mainContactForm.style.opacity = "0";
            if (formTitle) {
                formTitle.style.transition = "opacity 0.4s ease";
                formTitle.style.opacity = "0";
            }
            setTimeout(() => {
                mainContactForm.style.display = "none";
                if (formTitle) {
                    formTitle.style.display = "none";
                }
                if (successState) {
                    successState.style.display = "flex";
                    void successState.offsetWidth;
                    successState.style.opacity = "1";
                    successState.classList.add("active");
                }
            }, 400);
            const name = document.getElementById("name") ? document.getElementById("name").value : "";
            const phone = document.getElementById("phone") ? document.getElementById("phone").value : "";
            const email = document.getElementById("email") ? document.getElementById("email").value : "";
            const message = document.getElementById("message") ? document.getElementById("message").value : "";
            const portalId = "148734306";
            const formId = "2b7dc5ed-31f8-4a9b-869c-4c64e888d003";
            const url = `https://api-eu1.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
            const data = {
                fields: [
                    { name: "firstname", value: name },
                    { name: "phone", value: phone },
                    { name: "email", value: email },
                    { name: "message", value: message }
                ],
                context: {
                    pageUri: window.location.href,
                    pageName: document.title
                }
            };
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).catch(err => console.error("Form submit error:", err));
        });
    }
    const updateScrollIndicators = () => {
        const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPosition = window.scrollY;
        const scrollPercentage = scrollTotal > 0 ? (scrollPosition / scrollTotal) * 100 : 0;
        if (scrollFill) {
            if (window.innerWidth > 768) {
                scrollFill.style.height = `${scrollPercentage}%`;
                scrollFill.style.width = `100%`;
            } else {
                scrollFill.style.width = `${scrollPercentage}%`;
                scrollFill.style.height = `100%`;
            }
        }
        if (scrollPercentageText) {
            scrollPercentageText.textContent = Math.round(scrollPercentage).toString().padStart(2, '0');
        }
    };
    window.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators, { passive: true });
    updateScrollIndicators();
    const mobileGalleryBtn = document.querySelector('.mobile-gallery-btn');
    const spaceGallerySection = document.getElementById('space-gallery');
    if (mobileGalleryBtn && spaceGallerySection) {
        ScrollTrigger.create({
            trigger: spaceGallerySection,
            start: "top center",
            end: "bottom center",
            onEnter: () => mobileGalleryBtn.classList.add('show-btn'),
            onLeave: () => mobileGalleryBtn.classList.remove('show-btn'),
            onEnterBack: () => mobileGalleryBtn.classList.add('show-btn'),
            onLeaveBack: () => mobileGalleryBtn.classList.remove('show-btn')
        });
    }
    const ghostContainer = document.getElementById('hotel-horizontal-gallery');
    if (ghostContainer) {
        const track = document.querySelector('.horizontal-track');
        const progressFill = document.querySelector('.horizontal-progress-fill');
        let currentProgress = 0; 
        let targetProgress = 0;  
        const lerp = (start, end, factor) => start + (end - start) * factor;
        let isInView = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isInView = entry.isIntersecting;
            });
        });
        observer.observe(ghostContainer);
        const updateTargetProgress = () => {
            if (!isInView) return;
            const rect = ghostContainer.getBoundingClientRect();
            const scrollStart = 0;
            const scrollDistance = rect.height - window.innerHeight;
            let rawProgress = -rect.top / scrollDistance;
            targetProgress = Math.max(0, Math.min(1, rawProgress));
        };
        window.addEventListener('scroll', updateTargetProgress, { passive: true });
        window.addEventListener('resize', updateTargetProgress, { passive: true });
        const render = () => {
            if (isInView) {
                currentProgress = lerp(currentProgress, targetProgress, 0.08);
                const maxTranslateX = track.scrollWidth - window.innerWidth;
                const moveX = -(maxTranslateX * currentProgress);
                track.style.transform = `translate3d(${moveX}px, 0, 0)`;
                if (progressFill) {
                    progressFill.style.width = `${currentProgress * 100}%`;
                }
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }
    const qiForm = document.getElementById('qi-registration-form');
    if (qiForm) {
        qiForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const name = document.getElementById("qi-name") ? document.getElementById("qi-name").value : "";
            const phone = document.getElementById("qi-phone") ? document.getElementById("qi-phone").value : "";
            const portalId = "148734306";
            const formId = "e279096b-8bcc-4578-a5b5-94f9e326a017";
            const url = `https://api-eu1.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
            const data = {
                fields: [
                    { name: "firstname", value: name },
                    { name: "phone", value: phone }
                ],
                context: {
                    pageUri: window.location.href,
                    pageName: document.title
                }
            };
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).catch(err => console.error("Qi Form submit error:", err));
            const formTitle = document.getElementById('contact-form-title');
            const successState = document.getElementById('qi-success-state');
            qiForm.style.opacity = '0';
            qiForm.style.transition = 'opacity 0.4s ease';
            if (formTitle) {
                formTitle.style.opacity = '0';
                formTitle.style.transition = 'opacity 0.4s ease';
            }
            setTimeout(() => {
                qiForm.style.display = 'none';
                if (formTitle) formTitle.style.display = 'none';
                successState.style.display = 'flex';
                successState.style.transition = 'opacity 0.5s ease';
                void successState.offsetWidth;
                successState.style.opacity = '1';
            }, 400); 
        });
    }
});