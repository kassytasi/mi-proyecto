// -----------------------------
// Slider del Hero
// -----------------------------
const heroImages = ["image1.png", "image2.png"]; // Agrega más imágenes si quieres
let heroIndex = 0;

const heroImgElement = document.querySelector(".hero-image img");
const heroCircles = document.querySelectorAll(".hero-image .circulo");

function showHeroImage(index) {
  heroImgElement.src = heroImages[index];
  heroCircles.forEach((circle, i) => {
    circle.classList.toggle("active", i === index);
  });
}

heroCircles.forEach((circle, i) => {
  circle.addEventListener("click", () => {
    heroIndex = i;
    showHeroImage(heroIndex);
  });
});

// Cambio automático cada 4s
setInterval(() => {
  heroIndex = (heroIndex + 1) % heroImages.length;
  showHeroImage(heroIndex);
}, 4000);

// -----------------------------
// Slider de productos Trending
// -----------------------------
const trendingProducts = document.querySelector(".trending-products");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");
const scrollStep = 200;

nextBtn.addEventListener("click", () => {
  trendingProducts.scrollBy({ left: scrollStep, behavior: "smooth" });
});

prevBtn.addEventListener("click", () => {
  trendingProducts.scrollBy({ left: -scrollStep, behavior: "smooth" });
});

// -----------------------------
// Menú hamburguesa responsive
// -----------------------------
const menuToggle = document.createElement("div");
menuToggle.classList.add("menu-toggle");
menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".navbar").appendChild(menuToggle);

const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  if (navLinks.classList.contains("active")) {
    navLinks.style.display = "flex";
  } else {
    navLinks.style.display = "none";
  }
});

