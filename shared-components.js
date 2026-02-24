// Shared Components - Header, Navbar, and Footer

function loadSharedComponents() {
  // Load combined header with sticky container
  const siteHeader = `
    <header id="siteHeader" class="sticky top-0 z-50">
      <div class="top-bar bg-gradient-to-r from-red-600 via-slate-100 to-blue-600 text-slate-400 transition-transform duration-300 will-change-transform">
        <div class="top-bar-container">
          <div class="top-bar-contact">
            <span>📞 06 288 3126 | 27 | 28</span>
            <span>📱 06 288 3135</span>
            <span>✉️ info@micost.edu.my</span>
          </div>
          <div class="top-bar-social">
            <a class="social-link" href="#" aria-label="YouTube">YouTube</a>
            <a class="social-link" href="#" aria-label="Facebook">Facebook</a>
            <a class="social-link" href="#" aria-label="Instagram">Instagram</a>
            <a class="social-link" href="#" aria-label="TikTok">TikTok</a>
          </div>
        </div>
      </div>

      <nav class="navbar border-b bg-white/95 backdrop-blur w-full">
        <div class="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <a href="./index.html" class="flex items-center gap-3 flex-shrink-0">
            <!-- MiCoST Logo -->
            <img src="./resources/MiCoST-Logo-Vector.svg-.png" alt="MiCoST Logo" class="h-10 w-10 object-contain" />
            <div class="leading-tight">
              <div class="font-semibold">MiCoST</div>
              <div class="text-xs text-slate-500">EST. 2006</div>
            </div>
          </a>

          <!-- Desktop nav -->
          <nav class="hidden md:flex items-center gap-6 flex-nowrap">
            <a class="font-medium hover:text-slate-900 text-slate-700" href="./index.html">Home</a>

            <!-- Dropdown: About Us -->
            <div class="relative group dropdown">
              <button class="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900" type="button">
                About Us
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
              </button>
              <div
                class="invisible absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-xl border bg-white shadow-lg opacity-0 pointer-events-none transition group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto"
              >
                <a class="block px-4 py-3 text-sm hover:bg-slate-50" href="./introduction.html">Introduction</a>
                <a class="block px-4 py-3 text-sm hover:bg-slate-50" href="./location.html">Location</a>
              </div>
            </div>

            <!-- Dropdown: Admission -->
            <div class="relative group dropdown">
              <button class="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900" type="button">
                Admission
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
              </button>
              <div
                class="invisible absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-xl border bg-white shadow-lg opacity-0 pointer-events-none transition group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto"
              >
                <a class="block px-4 py-3 text-sm hover:bg-slate-50" href="./program-catalogue.html">Program Catalogue</a>
              </div>
            </div>

            <!-- Dropdown: Quick Links -->
            <div class="relative group dropdown">
              <button class="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900" type="button">
                Quick Links
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
              </button>
              <div
                class="invisible absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border bg-white shadow-lg opacity-0 pointer-events-none transition group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto"
              >
                <a class="block px-4 py-3 text-sm hover:bg-slate-50" href="./Convocation.html">Convocation</a>
              </div>
            </div>

            <a
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              href="./program-catalogue.html">Programs
            </a>
          </nav>

          <!-- Mobile menu button -->
          <button
            id="menuBtn"
            class="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-slate-700 hover:bg-slate-50 md:hidden"
            aria-expanded="false"
            aria-controls="mobileMenu"
          >
            <span class="sr-only">Open menu</span>
            ☰
          </button>
        </div>

        <!-- Mobile menu -->
        <div id="mobileMenu" class="hidden border-t bg-white md:hidden">
          <div class="mx-auto max-w-7xl px-4 py-3">
            <a class="block rounded-lg px-3 py-2 hover:bg-slate-50" href="./index.html">Home</a>

            <details class="group">
              <summary class="cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50">
                About Us
              </summary>
              <div class="ml-3 border-l pl-3">
                <a class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" href="./introduction.html">Introduction</a>
                <a class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" href="./location.html">Location</a>
              </div>
            </details>

            <details class="group">
              <summary class="cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50">
                Admission
              </summary>
              <div class="ml-3 border-l pl-3">
                <a class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" href="./program-catalogue.html">Program Catalogue</a>
              </div>
            </details>

            <details class="group">
              <summary class="cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50">
                Quick Links
              </summary>
              <div class="ml-3 border-l pl-3">
                <a class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" href="./Convocation.html">Convocation</a>
              </div>
            </details>

            <a class="mt-2 block rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800" href="./program-catalogue.html">
              Programs
            </a>
          </div>
        </div>
      </nav>
    </header>
  `;

  // Load Footer
  const footer = `
    <footer>
      <div class="footer-container">
        <div>
          <div class="footer-title">MiCoST</div>
          <p class="footer-text">
            © 2006 - 2026 MiCoST. All Rights Reserved.
          </p>
          <p class="footer-text">
            MOE Registration Certification No: DK002(M)
          </p>
        </div>

        <div>
          <div class="footer-section-title">Quality Management System</div>
          <p class="footer-section-content">ISO 9001:2015 (Since 2011)</p>
        </div>

        <div>
          <img src="./resources/header_putih-01.png" alt="Connect with Us" class="footer-connect-image" />
        </div>
      </div>
    </footer>
  `;

  // Inject components into the page
  const body = document.body;
  body.insertAdjacentHTML('afterbegin', siteHeader);
  body.insertAdjacentHTML('beforeend', footer);

  // Initialize mobile menu toggle
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.toggle("hidden");
      menuBtn.setAttribute("aria-expanded", String(!isHidden));
    });
  }

  // Auto-hide top bar on scroll down, show on scroll up
  const topBarElement = document.querySelector(".top-bar");

  if (topBarElement) {
    let lastScrollPosition = window.scrollY;
    let isTopBarHidden = false;
    let isAnimating = false;
    const transitionDuration = 500; // Match CSS transition duration

    window.addEventListener(
      "scroll",
      () => {
        // Skip if animation is in progress
        if (isAnimating) return;

        const currentScrollPosition = window.scrollY;

        // Only hide/show after scrolling past 50px
        if (currentScrollPosition > 50) {
          if (currentScrollPosition > lastScrollPosition && !isTopBarHidden) {
            // Scrolling down - hide top bar (only if not already hidden)
            isAnimating = true;
            topBarElement.classList.add("topbar-hidden");
            isTopBarHidden = true;
            setTimeout(() => {
              isAnimating = false;
            }, transitionDuration);
          } else if (currentScrollPosition < lastScrollPosition && isTopBarHidden) {
            // Scrolling up - show top bar (only if currently hidden)
            isAnimating = true;
            topBarElement.classList.remove("topbar-hidden");
            isTopBarHidden = false;
            setTimeout(() => {
              isAnimating = false;
            }, transitionDuration);
          }
        } else {
          // At top of page - always show
          if (isTopBarHidden) {
            isAnimating = true;
            topBarElement.classList.remove("topbar-hidden");
            isTopBarHidden = false;
            setTimeout(() => {
              isAnimating = false;
            }, transitionDuration);
          }
        }

        lastScrollPosition = currentScrollPosition;
      },
      { passive: true }
    );
  }
}

// Load components when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSharedComponents);
} else {
  loadSharedComponents();
}
