// ────────────────────────────────────────────
//  Supabase init  (CDN global – no import)
// ────────────────────────────────────────────
const { createClient } = supabase;

const sb = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

// ────────────────────────────────────────────
//  Notification
// ────────────────────────────────────────────
function show(msg, type = "success") {
  const box  = document.getElementById("notif");
  const text = document.getElementById("notifText");
  const icon = box.querySelector("i");
  text.innerText = msg;
  icon.setAttribute("data-lucide", type === "error" ? "x-circle" : "check-circle");
  lucide.createIcons();
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 3500);
}

// ────────────────────────────────────────────
//  Eye toggle
// ────────────────────────────────────────────
function toggleEye(inputId, btn) {
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
}

// ────────────────────────────────────────────
//  Password strength
// ────────────────────────────────────────────
const strengthLevels = [
  { label: "Very Weak",   color: "#ff3b30" },
  { label: "Weak",        color: "#ff9500" },
  { label: "Fair",        color: "#ffcc00" },
  { label: "Strong",      color: "#30d158" },
  { label: "Very Strong", color: "#30d158" },
];

function checkStrength(value) {
  let score = 0;
  if (value.length >= 8)           score++;
  if (/[A-Z]/.test(value))         score++;
  if (/[a-z]/.test(value))         score++;
  if (/[0-9]/.test(value))         score++;
  if (/[^A-Za-z0-9]/.test(value))  score++;

  const bars  = document.querySelectorAll(".strength-bar span");
  const label = document.getElementById("strengthLabel");

  bars.forEach((bar, i) => {
    bar.className = "";
    if (i < score) bar.classList.add("s" + score);
  });

  if (value.length === 0) {
    label.textContent = "Password strength";
    label.style.color = "rgba(255,255,255,0.45)";
  } else {
    const lvl = strengthLevels[score - 1] || strengthLevels[0];
    label.textContent = lvl.label;
    label.style.color = lvl.color;
  }
}

// ────────────────────────────────────────────
//  Validate password rules
// ────────────────────────────────────────────
function validatePassword(password) {
  if (password.length < 8)            return "At least 8 characters required";
  if (!/[A-Z]/.test(password))        return "At least one uppercase letter required";
  if (!/[a-z]/.test(password))        return "At least one lowercase letter required";
  if (!/[0-9]/.test(password))        return "At least one number required";
  if (!/[^A-Za-z0-9]/.test(password)) return "At least one special character required (!@#$...)";
  return null;
}

// ────────────────────────────────────────────
//  HIBP check
// ────────────────────────────────────────────
async function isBreached(password) {
  try {
    const buf    = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-1", buf);
    const hex    = Array.from(new Uint8Array(digest))
                        .map(b => b.toString(16).padStart(2, "0"))
                        .join("").toUpperCase();
    const prefix = hex.slice(0, 5);
    const suffix = hex.slice(5);
    const res    = await fetch("https://api.pwnedpasswords.com/range/" + prefix);
    const text   = await res.text();
    return text.split("\n").some(line => line.startsWith(suffix));
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────
//  SIGNUP
// ────────────────────────────────────────────
async function signup() {
  const name     = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const gender   = document.getElementById("gender").value;
  const field    = document.getElementById("field").value;
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("pass").value;
  const confirm  = document.getElementById("confirmPass").value;

  if (!name || !username || !gender || !field || !email || !password) {
    show("Please fill in all fields", "error"); return;
  }

  const pwErr = validatePassword(password);
  if (pwErr) { show(pwErr, "error"); return; }

  if (password !== confirm) { show("Passwords do not match", "error"); return; }

  show("Checking password security...", "success");
  const breached = await isBreached(password);
  if (breached) {
    show("This password was found in a data breach. Please choose a different one.", "error");
    return;
  }

  try {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;

    const { error: dbErr } = await sb.from("users").insert({
      id: data.user.id, uid: data.user.id,
      name, username, gender, field, email
    });
    if (dbErr) throw dbErr;

    show("Account Created Successfully ✅", "success");
    setTimeout(() => window.location.href = "../dashboard/index.html", 1500);

  } catch (e) {
    show(e.message, "error");
  }
}

// ────────────────────────────────────────────
//  LOGIN
// ────────────────────────────────────────────
async function login() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!email || !password) { show("Please enter email and password", "error"); return; }

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    show("Welcome Back 👋", "success");
    setTimeout(() => window.location.href = "../dashboard/index.html", 1500);

  } catch (e) {
    show("Wrong email or password", "error");
    console.error("Login error:", e.message);
  }
}

// ────────────────────────────────────────────
//  Switch tabs
// ────────────────────────────────────────────
function switchTab(e, tab) {
  document.getElementById("loginBox").classList.toggle("hidden",  tab !== "login");
  document.getElementById("signupBox").classList.toggle("hidden", tab !== "signup");
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  e.target.classList.add("active");
}

// ────────────────────────────────────────────
//  Init icons
// ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});

// expose to HTML onclick handlers
window.login       = login;
window.signup      = signup;
window.switchTab   = switchTab;
window.toggleEye   = toggleEye;
window.checkStrength = checkStrength;
