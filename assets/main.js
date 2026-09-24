
const menuBtn=document.querySelector('.menu-btn');
const navLinks=document.querySelector('.nav-links');
if(menuBtn&&navLinks){menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));}
document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
