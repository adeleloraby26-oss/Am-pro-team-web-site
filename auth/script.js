import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

/* عناصر الصفحة */
const loginEmail    = document.getElementById("loginEmail");
const loginPass     = document.getElementById("loginPass");
const nameInput     = document.getElementById("name");
const usernameInput = document.getElementById("username");
const genderInput   = document.getElementById("gender");
const fieldInput    = document.getElementById("field");
const emailInput    = document.getElementById("email");
const passInput     = document.getElementById("pass");
const confirmPassInput = document.getElementById("confirmPass");
const loginBox      = document.getElementById("loginBox");
const signupBox     = document.getElementById("signupBox");

/* ──────────────────────────────────────────
   دالة عرض التنبيهات
─────────────────────────────────────────── */
function show(msg, type = "success") {
  const box  = document.getElementById("notif");
  const text = document.getElementById("notifText");
  const icon = box.querySelector("i");
  text.innerText = msg;
  icon.setAttribute("data-lucide", type === "error" ? "x-circle" : "check-circle");
  lucide.createIcons();
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 3000);
}

/* ──────────────────────────────────────────
   Eye toggle – إظهار / إخفاء كلمة المرور
─────────────────────────────────────────── */
window.toggleEye = function(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.setAttribute("data-lucide", "eye-off");
  } else {
    input.type = "password";
    icon.setAttribute("data-lucide", "eye");
  }
  lucide.createIcons();
};

/* ──────────────────────────────────────────
   Password strength – مؤشر قوة كلمة المرور
─────────────────────────────────────────── */
const strengthLevels = [
  { label: "Very Weak",  color: "#ff3b30" },
  { label: "Weak",       color: "#ff9500" },
  { label: "Fair",       color: "#ffcc00" },
  { label: "Strong",     color: "#30d158" },
  { label: "Very Strong",color: "#30d158" },
];

window.checkStrength = function(value) {
  let score = 0;
  if (value.length >= 8)              score++;
  if (/[A-Z]/.test(value))            score++;
  if (/[a-z]/.test(value))            score++;
  if (/[0-9]/.test(value))            score++;
  if (/[^A-Za-z0-9]/.test(value))     score++;

  const bars  = document.querySelectorAll(".strength-bar span");
  const label = document.getElementById("strengthLabel");

  bars.forEach((bar, i) => {
    bar.className = "";
    if (i < score) bar.classList.add(`s${score}`);
  });

  if (value.length === 0) {
    label.textContent = "Password strength";
    label.style.color = "rgba(255,255,255,0.45)";
  } else {
    const lvl = strengthLevels[score - 1] || strengthLevels[0];
    label.textContent = lvl.label;
    label.style.color  = lvl.color;
  }
};

/* ──────────────────────────────────────────
   Password validation rules
─────────────────────────────────────────── */
function validatePassword(password) {
  const errors = [];
  if (password.length < 8)             errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password))         errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password))         errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password))         errors.push("At least one number");
  if (!/[^A-Za-z0-9]/.test(password))  errors.push("At least one special character (!@#$...)");
  return errors;
}

/* ──────────────────────────────────────────
   Check HIBP (Have I Been Pwned)
─────────────────────────────────────────── */
async function isBreached(password) {
  try {
    const msgBuffer  = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
    const hashArray  = Array.from(new Uint8Array(hashBuffer));
    const hashHex    = hashArray.map(b => b.toString(16).padStart(2,"0")).join("").toUpperCase();
    const prefix     = hashHex.slice(0, 5);
    const suffix     = hashHex.slice(5);

    const res  = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();
    return text.split("\n").some(line => line.startsWith(suffix));
  } catch {
    // إذا فشل الطلب نكمل بدون حجب المستخدم
    return false;
  }
}

/* ──────────────────────────────────────────
   SIGNUP – إنشاء حساب
─────────────────────────────────────────── */
window.signup = async function() {
  const password = passInput.value;

  // 1. تحقق من قوة كلمة المرور
  const errors = validatePassword(password);
  if (errors.length > 0) {
    show(errors[0], "error");
    return;
  }

  // 2. تحقق من تطابق كلمتَي المرور
  if (password !== confirmPassInput.value) {
    show("Passwords do not match", "error");
    return;
  }

  // 3. تحقق من HIBP
  show("Checking password security...", "success");
  const breached = await isBreached(password);
  if (breached) {
    show("This password was found in a data breach. Please choose a different one.", "error");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email:    emailInput.value,
      password: password
    });

    if (error) throw error;

    const { error: dbError } = await supabase.from("users").insert({
      id:       data.user.id,
      uid:      data.user.id,
      name:     nameInput.value,
      username: usernameInput.value,
      gender:   genderInput.value,
      field:    fieldInput.value,
      email:    emailInput.value
    });

    if (dbError) throw dbError;

    show("Account Created Successfully", "success");
    setTimeout(() => window.location.href = "../dashboard/index.html", 1500);

  } catch (e) {
    show(e.message, "error");
  }
};

/* ──────────────────────────────────────────
   LOGIN – تسجيل الدخول
─────────────────────────────────────────── */
window.login = async function() {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email:    loginEmail.value,
      password: loginPass.value
    });

    if (error) throw error;

    show("Welcome Back 👋", "success");
    setTimeout(() => window.location.href = "../dashboard/index.html", 1500);

  } catch (e) {
    show("Wrong email or password", "error");
  }
};

/* ──────────────────────────────────────────
   SWITCH TABS – التبديل بين اللوجن والساين أب
─────────────────────────────────────────── */
window.switchTab = function(e, tab) {
  loginBox.classList.toggle("hidden",  tab !== "login");
  signupBox.classList.toggle("hidden", tab !== "signup");
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  e.target.classList.add("active");
};

// تفعيل الأيقونات عند التحميل
window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});
