/* =============================
   Animated Counter
============================= */

const counters = document.querySelectorAll(".counter");

const speed = 150;

counters.forEach(counter=>{

const update=()=>{

const target=+counter.getAttribute("data-target");

const count=+counter.innerText;

const increment=target/speed;

if(count<target){

counter.innerText=Math.ceil(count+increment);

setTimeout(update,15);

}else{

counter.innerText=target.toLocaleString()+"+";

}

}

update();

});