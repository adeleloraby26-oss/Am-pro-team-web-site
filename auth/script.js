import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

/* عناصر الصفحة */
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");

const nameInput = document.getElementById("name");
const usernameInput = document.getElementById("username");
const genderInput = document.getElementById("gender");
const fieldInput = document.getElementById("field");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("pass");
const confirmPassInput = document.getElementById("confirmPass");

const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");

/* دالة عرض التنبيهات */
function show(msg, type="success"){
  const box = document.getElementById("notif");
  const text = document.getElementById("notifText");
  const icon = box.querySelector("i");

  text.innerText = msg;

  if(type === "error"){
    icon.setAttribute("data-lucide","x-circle");
  }else{
    icon.setAttribute("data-lucide","check-circle");
  }

  lucide.createIcons();
  box.classList.add("show");

  setTimeout(()=>box.classList.remove("show"),3000);
}

/* SIGNUP - إنشاء حساب */
window.signup = async function(){
  if(passInput.value !== confirmPassInput.value){
    show("Passwords not match","error");
    return;
  }

  try{
    const { data, error } = await supabase.auth.signUp({
      email: emailInput.value,
      password: passInput.value
    });

    if(error) throw error;

    const { error: dbError } = await supabase.from("users").insert({
      id: data.user.id,
      uid: data.user.id,
      name: nameInput.value,
      username: usernameInput.value,
      gender: genderInput.value,
      field: fieldInput.value,
      email: emailInput.value
    });

    if(dbError) throw dbError;

    show("Account Created Successfully","success");
    setTimeout(()=>window.location.href="../dashboard/index.html",1500);

  }catch(e){
    show(e.message,"error");
  }
};

/* LOGIN - تسجيل الدخول */
window.login = async function(){
  try{
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPass.value
    });

    if(error) throw error;

    show("Welcome Back 👋","success");
    setTimeout(()=>window.location.href="../dashboard/index.html",1500);

  }catch(e){
    show("Wrong email or password","error");
  }
};

/* SWITCH TABS - التبديل بين اللوجن والساين أب */
window.switchTab = function(e,tab){
  loginBox.classList.toggle("hidden",tab!=="login");
  signupBox.classList.toggle("hidden",tab!=="signup");
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  e.target.classList.add("active");
};

// تفعيل الأيقونات عند التحميل
window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});
