document.querySelector(`.sell-btn`).addEventListener("click",(e) => {
    document.querySelector(`.booking-page`).classList.add(`show`);
    document.querySelector(`main`).classList.add(`fixed`);
        //booking-pg close btn
    const cross_btn = document.querySelector(`.js-cross`);

    cross_btn.addEventListener("click", () => {
        document.querySelector(`.booking-page`).classList.remove(`show`);
        document.querySelector(`main`).classList.remove(`fixed`);
    })
});

let mob_page = document.querySelector(`.mob-page`);
let menu_btn = document.querySelector(`.hamburger`);
let mob_links = document.querySelector(`.mob-links`);

menu_btn.addEventListener(`click`,() => {
    menu_btn.classList.toggle(`is-active`);
    mob_page.classList.toggle(`is-active`);
});

function hide () {
    mob_page.classList.toggle(`is-active`);
    menu_btn.classList.toggle(`is-active`);
}





function changecolor () {
let header = document.querySelector(`header`);
if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500){
        header.style.backgroundColor = `black`;
        header.style.color = `gold`;
            } else {
                header.style.backgroundColor = `transparent`;
            }
}


let scroll = window.onscroll = function () {
    changecolor();
}




let car1 = new Cars(`../images/cars/ferrari.png`,`$300K /`,`Spider`,`Ferrari`,`2017`,`2/5`,`Yes`,`Auto`,`Diesel`);
let car2 = new Cars(`../images/cars/bmw.png`,`$150K /`,`320`,`BMW`,`2013`,`4/5`,`Yes`,`Manual`,`Petrol`);
let car3 = new Cars(`../images/cars/koegnisegg.png`,`$420K /`,`Speedster`,`Koenigsegg`,`2021`,`2/5`,`Yes`,`Manual`,`Diesel`);
let car4 = new Cars(`../images/cars/lamborghini.png`,`$210K /`,`Spider`,`Ferrari`,`2017`,`2/5`,`Yes`,`Auto`,`Diesel`); ;
let car5 = new Cars(`../images/cars/mercedes.png`,`$130K /`,`S-class`,`Mercedes`,`2011`,`4/5`,`Yes`,`Manual`,`Petrol`);
let car6 = new Cars(`../images/cars/mclaren.png`,`$350K /`,`570s`,`MClaren`,`2016`,`2/5`,`Yes`,`Auto`,`Diesel`,);

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

let imgselected = $(`.js-img`);
let rent = $(`.js-rent`);
let model = $(`.js-model`);
let mark = $(`.js-mark`);
let year = $(`.js-year`);
let doors = $(`.js-doors`);
let transmission = $(`.js-transmission`);
let fuel = $(`.js-fuel`);

function carDisplay (m) {
imgselected.attr("src", `${m.img}`);
rent.html(`${m.rent}`);
model.html(`${m.model}`);
mark.html(`${m.mark}`);
year.html(`${m.year}`);
doors.html(`${m.doors}`);
transmission.html(`${m.transmission}`);
fuel.html(`${m.fuel}`);
}

let btn_1 = $(`.js-btn-1`);
btn_1.on("click",()=> {
carDisplay(car1);
})

let btn_2 = $(`.js-btn-2`);
btn_2.on(`click`, ()=> {
carDisplay(car2);
})

let btn_3 = $(`.js-btn-3`);
btn_3.on(`click`, ()=> {
carDisplay(car3);
})

let btn_4 = $(`.js-btn-4`);
btn_4.on(`click`, ()=> {
carDisplay(car4);
});

let btn_5 = $(`.js-btn-5`);
btn_5.on(`click`, ()=> {
carDisplay(car5);
});

let btn_6 = $(`.js-btn-6`);
btn_6.on(`click`, ()=> {
carDisplay(car6);
});

window.addEventListener('scroll', () => {
    let reveals = document.querySelectorAll('.reveal');
    reveals.forEach((reveal) => {
        let windowheight = window.innerHeight;
        let revealtop = reveal.getBoundingClientRect().top;
        let revealpoint = 150;

        if (revealtop < windowheight - revealpoint) {
            reveal.classList.add('active');
        } else {
            reveal.classList.remove('active');
        }
    })
})