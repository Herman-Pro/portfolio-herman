const toggle = document.querySelector(".navbar__hamburger");
const menu = document.querySelector(".navbar__menu");

toggle.addEventListener("click", () => {
  const isOpen = toggle.classList.toggle("navbar__hamburger--open");
  menu.classList.toggle("navbar__menu--show");
  toggle.setAttribute("aria-expanded", isOpen);
});
