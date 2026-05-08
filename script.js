AOS.init({duration:800, once:true});  

window.addEventListener("scroll",()=>{  
  document.getElementById("nav").classList.toggle("scrolled", window.scrollY>50);  
});  

function toggleMenu(){  
  document.getElementById("navLinks").classList.toggle("show");  
}  

/* CURSOR */  
const cursor=document.querySelector(".cursor");  
document.addEventListener("mousemove",(e)=>{  
  cursor.style.left=e.clientX+"px";  
  cursor.style.top=e.clientY+"px";  
});  

/* BUBBLES */  
const names=[  
  "Adel El-Oraby","Ahmed sadek","gana Mustafa","Saif Ahmed","Menna allah Ali ","Malak El-Naggar","Abdelrahman Ahmed","M*****","Marawan Abdallah","Fedora","Ubuntu"  
];  

function bubble(){  
  const b=document.createElement("div");  
  b.className="bubble";  
  b.innerText=names[Math.floor(Math.random()*names.length)];  
  b.style.left=Math.random()*100+"vw";  
  b.style.top=Math.random()*100+"vh";  
  b.style.setProperty("--x",(Math.random()*200-100)+"px");  
  b.style.setProperty("--y",(Math.random()*200-100)+"px");  
  document.getElementById("bubbles").appendChild(b);  
  setTimeout(()=>b.remove(),4000);  
}  

setInterval(bubble,800);  

/* COUNTER ANIMATION */  
const counters = document.querySelectorAll('.counter');  
const statsSection = document.getElementById('stats');  
let hasStarted = false; 

function startCounting() {  
  if (hasStarted) return; 
  hasStarted = true;  
  
  counters.forEach(counter => {  
    const target = +counter.getAttribute('data-target');  
    let count = 0;  
    const duration = 2000; 
    const increment = target / (duration / 16); 
  
    const update = () => {  
      count += increment;  
      if (count < target) {  
        counter.innerText = Math.floor(count);  
        requestAnimationFrame(update);  
      } else {  
        counter.innerText = target;  
      }  
    };  
    update();  
  });  
}  
  
const observer = new IntersectionObserver(entries => {  
  entries.forEach(entry => {  
    if (entry.isIntersecting) {  
      startCounting();  
    }  
  });  
}, { threshold: 0.4 });  
  
observer.observe(statsSection);

