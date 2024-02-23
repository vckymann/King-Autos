// hamburger menu functonality
const mob_page = document.querySelector(`.mob-page`);
const menu_btn = document.querySelector(`.hamburger`);
const header = document.querySelector(`header`);
const body = document.querySelector(`body`);

menu_btn.addEventListener(`click`,() => {
    body.classList.toggle(`is-active`);
    menu_btn.classList.toggle(`is-active`);
    mob_page.classList.toggle(`is-active`);
    mob_links.classList.toggle(`is-active`);
    header.classList.toggle(`is-active`);
});

//constructor function
function Cars (img,rent,model,mark,year,doors,ac,transmission,fuel) {
    this.img = img;
    this.rent = rent;
    this.model = model;
    this.mark = mark;
    this.year = year;
    this.doors = doors;
    this.ac = ac;
    this.transmission = transmission;
    this.fuel = fuel;
    };

const cars = [
    new Cars(`../images/cars/ferrari.png`,`$300K /`,`Spider`,`Ferrari`,`2017`,`2/5`,`Yes`,`Auto`,`Diesel`),
    new Cars(`../images/cars/bmw.png`,`$150K /`,`320`,`BMW`,`2013`,`4/5`,`Yes`,`Manual`,`Petrol`),
    new Cars(`../images/cars/koegnisegg.png`,`$420K /`,`Speedster`,`Koenigsegg`,`2021`,`2/5`,`Yes`,`Manual`,`Diesel`),
    new Cars(`../images/cars/lamborghini.png`,`$210K /`,`Spider`,`Ferrari`,`2017`,`2/5`,`Yes`,`Auto`,`Diesel`),
    new Cars(`../images/cars/mercedes.png`,`$130K /`,`S-class`,`Mercedes`,`2011`,`4/5`,`Yes`,`Manual`,`Petrol`),
    new Cars(`../images/cars/mclaren.png`,`$350K /`,`570s`,`MClaren`,`2016`,`2/5`,`Yes`,`Auto`,`Diesel`,),
];

//DOM elements
const imgselected = $(`.js-img`);
const rent = $(`.js-rent`);
const model = $(`.js-model`); 
const mark = $(`.js-mark`);
const year = $(`.js-year`);
const doors = $(`.js-doors`);
const transmission = $(`.js-transmission`);
const fuel = $(`.js-fuel`);

//function to manipulate DOM elements
function carDisplay (car) {
imgselected.attr("src", `${car.img}`);
rent.html(`${car.rent}`);
model.html(`${car.model}`);
mark.html(`${car.mark}`);
year.html(`${car.year}`);
doors.html(`${car.doors}`);
transmission.html(`${car.transmission}`);
fuel.html(`${car.fuel}`);
};

//event listener for each button
document.querySelectorAll('[class^="js-btn-"]').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        carDisplay(cars[index]);
    })
});

//fade in effect while scrolling
window.addEventListener('scroll',() => {
    const reveals = document.querySelectorAll('.reveal');
    const windowheight = window.innerHeight;
    reveals.forEach((reveal) => {
        const revealtop = reveal.getBoundingClientRect().top;
        const revealpoint = 150;

        if (revealtop < windowheight - revealpoint) {
            reveal.classList.add('active');
        } else {
            reveal.classList.remove('active');
        }
    });
});

