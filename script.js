/*==========================================================
    KAAMMILGYA
    Main JavaScript
==========================================================*/

"use strict";

/*==========================================================
    SELECTORS
==========================================================*/

const navbar = document.querySelector(".navbar");
const backToTop = document.getElementById("backToTop");
const navLinks = document.querySelectorAll(".nav-menu a");

/*==========================================================
    STICKY NAVBAR
==========================================================*/

function stickyNavbar() {

    if (window.scrollY > 80) {

        navbar.classList.add("sticky");

    } else {

        navbar.classList.remove("sticky");

    }

}

window.addEventListener("scroll", stickyNavbar);

/*==========================================================
    BACK TO TOP BUTTON
==========================================================*/

function toggleBackToTop() {

    if (window.scrollY > 500) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

}

window.addEventListener("scroll", toggleBackToTop);

/*==========================================================
    BACK TO TOP CLICK
==========================================================*/

if (backToTop) {

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*==========================================================
    SMOOTH SCROLL
==========================================================*/

navLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        const target = this.getAttribute("href");

        if (target.startsWith("#")) {

            e.preventDefault();

            const section = document.querySelector(target);

            if (section) {

                section.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

        }

    });

});

/*==========================================================
    ACTIVE MENU LINK
==========================================================*/

const sections = document.querySelectorAll("section");

function activeMenu() {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

}

window.addEventListener("scroll", activeMenu);

/*==========================================================
    NAVBAR SHADOW
==========================================================*/

window.addEventListener("scroll", () => {

    if (window.scrollY > 20) {

        navbar.style.boxShadow = "0 12px 30px rgba(0,0,0,.08)";

    } else {

        navbar.style.boxShadow = "none";

    }

});

/*==========================================================
    CURRENT YEAR
==========================================================*/

const yearElement = document.getElementById("year");

if (yearElement) {

    yearElement.textContent = new Date().getFullYear();

}

/*==========================================================
    WINDOW LOAD
==========================================================*/

window.addEventListener("load", () => {

    stickyNavbar();

    toggleBackToTop();

    activeMenu();

});


/*==========================================================
    FAQ ACCORDION
==========================================================*/

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = question.querySelector("i");

    question.addEventListener("click", () => {

        faqItems.forEach(other => {

            if(other !== item){

                other.querySelector(".faq-answer").style.display = "none";

                other.querySelector("i").classList.remove("fa-minus");

                other.querySelector("i").classList.add("fa-plus");

            }

        });

        if(answer.style.display === "block"){

            answer.style.display = "none";

            icon.classList.remove("fa-minus");
            icon.classList.add("fa-plus");

        }

        else{

            answer.style.display = "block";

            icon.classList.remove("fa-plus");
            icon.classList.add("fa-minus");

        }

    });

});


/*==========================================================
    COUNTER ANIMATION
==========================================================*/

const counters = document.querySelectorAll(".stat-card h2");

let counterStarted = false;

function startCounter(){

    if(counterStarted) return;

    const section = document.querySelector(".statistics");

    if(!section) return;

    const triggerPoint = section.offsetTop - window.innerHeight + 100;

    if(window.scrollY < triggerPoint) return;

    counterStarted = true;

    counters.forEach(counter=>{

        const text = counter.innerText.replace(/,/g,"");

        const target = parseInt(text.replace(/\D/g,""));

        const suffix = text.replace(/[0-9,]/g,"");

        let current = 0;

        const increment = Math.ceil(target/100);

        const updateCounter = ()=>{

            current += increment;

            if(current >= target){

                counter.innerText = target.toLocaleString() + suffix;

                return;

            }

            counter.innerText = current.toLocaleString() + suffix;

            requestAnimationFrame(updateCounter);

        }

        updateCounter();

    });

}

window.addEventListener("scroll",startCounter);


/*==========================================================
    REVEAL ON SCROLL
==========================================================*/

const revealElements = document.querySelectorAll(

".skill-card, .worker-card, .why-card, .step-card, .testimonial-card, .contact-card"

);

function revealElementsOnScroll(){

    const trigger = window.innerHeight * 0.85;

    revealElements.forEach(element=>{

        const top = element.getBoundingClientRect().top;

        if(top < trigger){

            element.classList.add("show");

        }

    });

}

window.addEventListener("scroll",revealElementsOnScroll);

window.addEventListener("load",revealElementsOnScroll);


/*==========================================================
    HERO IMAGE FLOAT EFFECT
==========================================================*/

const heroImage = document.querySelector(".hero-image img");

window.addEventListener("mousemove",(e)=>{

    if(!heroImage) return;

    const x = (window.innerWidth/2 - e.pageX)/45;

    const y = (window.innerHeight/2 - e.pageY)/45;

    heroImage.style.transform =

    `translate(${x}px, ${y}px)`;

});


/*==========================================================
    SECTION FADE EFFECT
==========================================================*/

const allSections = document.querySelectorAll("section");

function fadeSections(){

    const trigger = window.innerHeight * 0.9;

    allSections.forEach(section=>{

        if(section.getBoundingClientRect().top < trigger){

            section.classList.add("visible");

        }

    });

}

window.addEventListener("scroll",fadeSections);

window.addEventListener("load",fadeSections);

/*==========================================================
                MOBILE MENU
==========================================================*/

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

        menuToggle.classList.toggle("active");

    });

}

/*==========================================================
            CLOSE MENU AFTER CLICK
==========================================================*/

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active");

        menuToggle.classList.remove("active");

    });

});


/*==========================================================
            SEARCH VALIDATION
==========================================================*/

const heroSearch = document.querySelector(".hero-search");

if(heroSearch){

    const searchButton = heroSearch.querySelector("button");

    const inputs = heroSearch.querySelectorAll("input");

    searchButton.addEventListener("click",(e)=>{

        e.preventDefault();

        let valid = true;

        inputs.forEach(input=>{

            if(input.value.trim()===""){

                input.style.border="2px solid red";

                valid=false;

            }

            else{

                input.style.border="2px solid #10b981";

            }

        });

        if(valid){

            alert("Search feature will be connected with backend.");

        }

    });

}


/*==========================================================
            BUTTON RIPPLE EFFECT
==========================================================*/

const buttons = document.querySelectorAll(

".btn-primary,.btn-secondary"

);

buttons.forEach(button=>{

    button.addEventListener("click",function(e){

        const circle=document.createElement("span");

        const diameter=Math.max(

            this.clientWidth,

            this.clientHeight

        );

        const radius=diameter/2;

        circle.style.width=circle.style.height=

        `${diameter}px`;

        circle.style.left=

        `${e.clientX-this.getBoundingClientRect().left-radius}px`;

        circle.style.top=

        `${e.clientY-this.getBoundingClientRect().top-radius}px`;

        circle.classList.add("ripple");

        const ripple=this.querySelector(".ripple");

        if(ripple){

            ripple.remove();

        }

        this.appendChild(circle);

    });

});


/*==========================================================
            IMAGE HOVER ZOOM
==========================================================*/

const workerImages=document.querySelectorAll(

".worker-image img"

);

workerImages.forEach(image=>{

    image.addEventListener("mouseenter",()=>{

        image.style.transform="scale(1.08)";

    });

    image.addEventListener("mouseleave",()=>{

        image.style.transform="scale(1)";

    });

});


/*==========================================================
            LOADING ANIMATION
==========================================================*/

window.addEventListener("load",()=>{

    document.body.classList.add("loaded");

});


/*==========================================================
            PARALLAX EFFECT
==========================================================*/

window.addEventListener("scroll",()=>{

    const hero=document.querySelector(".hero");

    if(!hero) return;

    hero.style.backgroundPositionY=

    `${window.pageYOffset*0.35}px`;

});


/*==========================================================
            CONSOLE MESSAGE
==========================================================*/

console.log(

"%cKaamMilGya",

"color:#2563eb;font-size:26px;font-weight:bold"

);

console.log(

"%cWebsite Developed Professionally",

"color:#10b981;font-size:14px"

);

/*==========================================================
                    SCRIPT.JS
                    PART 4
==========================================================*/


/*==========================================================
                DISABLE RIGHT CLICK
==========================================================*/

// Remove this section if you don't want to disable right click.

document.addEventListener("contextmenu", function(e){

    e.preventDefault();

});


/*==========================================================
                DISABLE IMAGE DRAG
==========================================================*/

const allImages = document.querySelectorAll("img");

allImages.forEach((image)=>{

    image.setAttribute("draggable","false");

});


/*==========================================================
                BUTTON HOVER SCALE
==========================================================*/

const allButtons = document.querySelectorAll(

".btn-primary,.btn-secondary"

);

allButtons.forEach((button)=>{

    button.addEventListener("mouseenter",()=>{

        button.style.transform="translateY(-3px) scale(1.02)";

    });

    button.addEventListener("mouseleave",()=>{

        button.style.transform="translateY(0) scale(1)";

    });

});


/*==========================================================
                LAZY IMAGE EFFECT
==========================================================*/

const lazyImages = document.querySelectorAll("img");

const imageObserver = new IntersectionObserver(

(entries)=>{

entries.forEach((entry)=>{

if(entry.isIntersecting){

entry.target.classList.add("loaded-image");

imageObserver.unobserve(entry.target);

}

});

},

{

threshold:0.2

}

);

lazyImages.forEach((image)=>{

imageObserver.observe(image);

});


/*==========================================================
                PREVENT EMPTY LINKS
==========================================================*/

const emptyLinks = document.querySelectorAll(

'a[href="#"]'

);

emptyLinks.forEach((link)=>{

link.addEventListener("click",(e)=>{

e.preventDefault();

});

});


/*==========================================================
                SIMPLE PAGE LOADER
==========================================================*/

window.addEventListener("load",()=>{

document.body.classList.add("page-loaded");

});


/*==========================================================
                WINDOW RESIZE
==========================================================*/

window.addEventListener("resize",()=>{

if(window.innerWidth>992){

if(navMenu){

navMenu.classList.remove("active");

}

if(menuToggle){

menuToggle.classList.remove("active");

}

}

});


/*==========================================================
                ESC KEY CLOSE MENU
==========================================================*/

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

if(navMenu){

navMenu.classList.remove("active");

}

if(menuToggle){

menuToggle.classList.remove("active");

}

}

});


/*==========================================================
                SIMPLE PERFORMANCE LOG
==========================================================*/

window.addEventListener("load",()=>{

const loadTime = performance.now();

console.log(

`Website Loaded Successfully in ${loadTime.toFixed(0)} ms`

);

});


/*==========================================================
                PROJECT INFO
==========================================================*/

console.log(
"%cKaamMilGya",
"color:#2563eb;font-size:24px;font-weight:bold;"
);

console.log(
"%cVersion 1.0",
"color:#10b981;font-size:16px;"
);

console.log(
"%cFrontend Developed with HTML CSS JavaScript",
"color:#6b7280;font-size:14px;"
);


/*==========================================================
                END OF FILE
==========================================================*/