const sunIcon = document.querySelector(".sun");
const moonIcon = document.querySelector(".moon");

const userTheme = localStorage.getItem("theme");
const systemTheme = window.matchMedia("(prefers-color-schme: dark)").matches;

const iconToggle = () => {
  moonIcon.classList.toggle("display-none");
  sunIcon.classList.toggle("display-none");
};

const themeCheck = () => {
  if (userTheme === "dark" || (!userTheme && systemTheme)) {
    document.documentElement.classList.add("dark");
    moonIcon.classList.add("display-none");
    return;
  }
  sunIcon.classList.add("display-none");
};

const themeSwitch = () => {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    iconToggle();
    return;
  }
  document.documentElement.classList.add("dark");
  localStorage.setItem("theme", "dark");
  iconToggle();
};

sunIcon.addEventListener("click", () => {
  themeSwitch();
});

moonIcon.addEventListener("click", () => {
  themeSwitch();
});

themeCheck();

const showSignup = () => {
  const signupSection = document.getElementById("signup-section");
  const signinSection = document.getElementById("signin-section");
  const signinIdSection = document.getElementById("signinId-section");
  const signupIdSection = document.getElementById("signupId-section");

  signupSection.classList.remove("hidden");
  signupIdSection.classList.remove("hidden");
  signupSection.classList.add("animate__animated", "animate__flipInY");

  signinSection.classList.add("hidden");
  signinIdSection.classList.add("hidden");
};

const showSignin = () => {
  const signupSection = document.getElementById("signup-section");
  const signinSection = document.getElementById("signin-section");
  const signinIdSection = document.getElementById("signinId-section");
  const signupIdSection = document.getElementById("signupId-section");

  signinSection.classList.remove("hidden");
  signinIdSection.classList.remove("hidden");
  signinSection.classList.add("animate__animated", "animate__flipInY");

  signupSection.classList.add("hidden");
  signupIdSection.classList.add("hidden");
};

const logoText = document.querySelector(".logoText");
let text = new SplitType(logoText);
let characters = document.querySelectorAll(".char");
for (let i = 0; i < characters.length; i++) {
  characters[i].classList.add("translate-y-full");
}
gsap.to(".char", {
  y: 0,
  stagger: 0.05,
  delay: 0.02,
  duration: 0.5,
});

// Function to disable scroll
function disableScroll() {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  document.body.style.overflow = "hidden";
  document.body.style.top = `-${scrollTop}px`;
  document.body.style.left = `-${scrollLeft}px`;
}

// JavaScript function to enable scroll
function enableScroll() {
  var scrollTop = parseInt(document.body.style.top, 10);
  var scrollLeft = parseInt(document.body.style.left, 10);

  document.body.style.overflow = "";
  document.body.style.top = "";
  document.body.style.left = "";

  window.scrollTo(-scrollLeft, -scrollTop);
}

// Function to check the screen width and call appropriate function
function handleScrollBasedOnScreenWidth() {
  if (window.innerWidth > 640) {
    disableScroll();
  } else {
    enableScroll();
  }
}

// Call the function initially to set the scroll behavior based on the initial screen size
handleScrollBasedOnScreenWidth();

// Attach the function to the window.onresize event to handle changes in screen size
window.onresize = handleScrollBasedOnScreenWidth;

// Call the functions when needed
// Example: call disableScroll() when you want to remove the scrollbar
// and call enableScroll() when you want to bring it back.
