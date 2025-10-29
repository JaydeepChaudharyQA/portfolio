  document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuIcon = document.getElementById("menuIcon");
    const closeIcon = document.getElementById("closeIcon");    
    const sunIcon = document.getElementById("sunIcon");
    const moonIcon = document.getElementById("moonIcon");


    // --- Mobile Menu Toggle ---
    if (menuToggle) {
      menuToggle.onclick = () => {
        const isOpen = !mobileMenu.classList.contains("hidden");
        mobileMenu.classList.toggle("hidden");
        menuIcon.classList.toggle("hidden");
        closeIcon.classList.toggle("hidden");
      };
    }

    // --- Scroll Navbar Background ---
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navbar.classList.add(
          "bg-white/95",
          "dark:bg-slate-900/95",
          "backdrop-blur-sm",
          "shadow-md"
        );
      } else {
        navbar.classList.remove(
          "bg-white/95",
          "dark:bg-slate-900/95",
          "backdrop-blur-sm",
          "shadow-md"
        );
      }
    });

    // --- Smooth Scroll with Offset ---
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          e.preventDefault();
          const offset = 80;
          const position =
            target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: position, behavior: "smooth" });

          // Close mobile menu after click
          if (mobileMenu && menuIcon && closeIcon) {
            mobileMenu.classList.add("hidden");
            menuIcon.classList.remove("hidden");
            closeIcon.classList.add("hidden");
          }
        }
      });
    });

    // --- Scroll to Section (external use) ---
    window.scrollToSection = function (sectionId) {
      const element = document.querySelector(sectionId);
      if (element) {
        const offset = 80;
        const position =
          element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: position, behavior: "smooth" });
      }
    };
  });
