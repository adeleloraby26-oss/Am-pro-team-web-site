// ====================================================
// SUPABASE INIT — v2 UMD
// ====================================================
const { createClient } = supabase;
const sb = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

console.log("[AM-PRO] Supabase client initialized");

// ====================================================
// TOAST NOTIFICATION
// ====================================================
function show(msg, type) {
  console.log("[AM-PRO] Notification:", type, "—", msg);
  var box  = document.getElementById("notif");
  var text = document.getElementById("notifText");
  if (!box || !text) { alert(msg); return; }
  var icon = box.querySelector("i");
  text.innerText = msg;
  if (icon) {
    icon.setAttribute("data-lucide", type === "error" ? "x-circle" : "check-circle");
    lucide.createIcons();
  }
  box.classList.remove("show");
  void box.offsetWidth;
  box.classList.add("show");
  box.style.borderColor = type === "error" ? "#ff3b30" : "#30d158";
  setTimeout(function () { box.classList.remove("show"); }, 3500);
}

// ====================================================
// PASSWORD EYE TOGGLE
// ====================================================
window.toggleEye = function (inputId, btn) {
  var input = document.getElementById(inputId);
  var icon  = btn.querySelector("i");
  if (!input) return;
  if (input.style.webkitTextSecurity === "none") {
    input.style.webkitTextSecurity = "disc";
    if (icon) icon.setAttribute("data-lucide", "eye");
  } else {
    input.style.webkitTextSecurity = "none";
    if (icon) icon.setAttribute("data-lucide", "eye-off");
  }
  lucide.createIcons();
};

// ====================================================
// PASSWORD STRENGTH
// ====================================================
window.checkStrength = function (value) {
  var score = 0;
  if (value.length >= 8)          score++;
  if (/[A-Z]/.test(value))        score++;
  if (/[a-z]/.test(value))        score++;
  if (/[0-9]/.test(value))        score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  var bars   = document.querySelectorAll(".strength-bar span");
  var label  = document.getElementById("strengthLabel");
  var colors = ["#ff3b30","#ff9500","#ffcc00","#30d158","#30d158"];
  var labels = ["Very Weak","Weak","Fair","Strong","Very Strong"];

  bars.forEach(function (bar, i) {
    bar.className = "";
    if (i < score) bar.classList.add("s" + score);
  });

  if (value.length === 0) {
    if (label) { label.textContent = "Password strength"; label.style.color = "rgba(255,255,255,0.45)"; }
  } else {
    if (label) { label.textContent = labels[score - 1] || labels[0]; label.style.color = colors[score - 1] || colors[0]; }
  }
};

// ====================================================
// VALIDATE PASSWORD
// ====================================================
function validatePassword(pw) {
  if (pw.length < 8)            return "At least 8 characters required";
  if (!/[A-Z]/.test(pw))        return "At least one uppercase letter";
  if (!/[a-z]/.test(pw))        return "At least one lowercase letter";
  if (!/[0-9]/.test(pw))        return "At least one number";
  if (!/[^A-Za-z0-9]/.test(pw)) return "At least one special character (!@#$)";
  return null;
}

// ====================================================
// REDIRECT HELPER — works on localhost AND online hosting
// ====================================================
function redirectTo(relativePath) {
  var a = document.createElement("a");
  a.href = relativePath;
  console.log("[AM-PRO] Redirecting to:", a.href);
  window.location.href = a.href;
}

// ====================================================
// SIGN UP
// ====================================================
window.signup = async function () {
  console.log("[AM-PRO] signup() called");

  var signupBox = document.getElementById("signupBox");
  // FIX: select only the real submit button, not the eye-toggle buttons
  var buttons   = signupBox ? signupBox.querySelectorAll("button:not(.eye-toggle)") : [];
  var btn       = buttons[buttons.length - 1];

  if (!btn) { console.error("[AM-PRO] Signup button not found!"); return; }
  if (btn.disabled) return;

  var name     = (document.getElementById("name")        || {}).value || "";
  var username = (document.getElementById("username")    || {}).value || "";
  var gender   = (document.getElementById("gender")      || {}).value || "";
  var field    = (document.getElementById("field")       || {}).value || "";
  var email    = (document.getElementById("email")       || {}).value || "";
  var password = (document.getElementById("pass")        || {}).value || "";
  var confirm  = (document.getElementById("confirmPass") || {}).value || "";

  name     = name.trim();
  username = username.trim();
  email    = email.trim();

  console.log("[AM-PRO] Signup fields:", { name, username, gender, field, email, passwordLength: password.length });

  if (!name || !username || !gender || !field || !email || !password) {
    show("Please fill in all fields", "error"); return;
  }
  var pwErr = validatePassword(password);
  if (pwErr) { show(pwErr, "error"); return; }
  if (password !== confirm) { show("Passwords do not match", "error"); return; }

  btn.disabled = true;
  btn.textContent = "Creating account...";
  show("Creating account...", "success");

  try {
    // STEP 1: Create auth user
    console.log("[AM-PRO] Calling sb.auth.signUp...");
    var r1 = await sb.auth.signUp({ email: email, password: password });
    console.log("[AM-PRO] signUp response:", JSON.stringify(r1));

    if (r1.error) {
      console.error("[AM-PRO] signUp error:", r1.error);
      show(r1.error.message, "error");
      return;
    }

    // FIX: Supabase always returns data.user even when email confirmation is ON.
    // Never skip the INSERT based on missing session — always grab uid from data.user.
    var uid = r1.data && r1.data.user ? r1.data.user.id : null;

    if (!uid) {
      console.warn("[AM-PRO] signUp: no uid returned at all");
      show("Account created! Check your email to confirm, then sign in.", "success");
      btn.textContent = "Create Account";
      btn.disabled = false;
      return;
    }

    console.log("[AM-PRO] Auth user created. UID:", uid);

    // STEP 2: Insert into users table
    // NOTE: If Email Confirmation is ON in Supabase, the user is still "anon" at
    // this point so the RLS policy must allow INSERT for the anon role.
    // See SUPABASE_SETUP.sql for the corrected policy.
    console.log("[AM-PRO] Inserting into users table...");
    var r2 = await sb.from("users").insert([{
      id:       uid,
      uid:      uid,
      name:     name,
      username: username,
      gender:   gender,
      field:    field,
      email:    email
    }]);

    console.log("[AM-PRO] insert response:", JSON.stringify(r2));

    if (r2.error) {
      console.error("[AM-PRO] insert error:", r2.error);
      var errMsg = r2.error.message;
      if (r2.error.code === "42501") errMsg = "DB permission denied — check RLS policies for users table.";
      if (r2.error.code === "23505") errMsg = "Username or email already exists.";
      show(errMsg, "error");
      return;
    }

    console.log("[AM-PRO] User row inserted successfully");

    // Redirect to dashboard if session is ready, otherwise ask user to confirm email
    var hasSession = r1.data.session !== null;
    if (hasSession) {
      show("Account Created Successfully!", "success");
      setTimeout(function () {
        redirectTo("../dashboard/index.html");
      }, 1600);
    } else {
      // Email confirmation is ON — data is saved, but user must confirm before login
      show("Account Created! Please confirm your email then sign in.", "success");
      btn.textContent = "Create Account";
      btn.disabled = false;
    }

  } catch (e) {
    console.error("[AM-PRO] Unexpected signup error:", e);
    show(e.message || "Something went wrong", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
};

// ====================================================
// SIGN IN
// ====================================================
window.login = async function () {
  console.log("[AM-PRO] login() called");

  var loginBox = document.getElementById("loginBox");
  var btn      = loginBox ? loginBox.querySelector("button:not(.eye-toggle)") : null;

  if (!btn) { console.error("[AM-PRO] Login button not found!"); return; }
  if (btn.disabled) return;

  var email    = (document.getElementById("loginEmail") || {}).value || "";
  var password = (document.getElementById("loginPass")  || {}).value || "";
  email = email.trim();

  console.log("[AM-PRO] Login with email:", email);

  if (!email || !password) { show("Please enter email and password", "error"); return; }

  btn.disabled = true;
  btn.textContent = "Signing in...";
  show("Signing in...", "success");

  try {
    console.log("[AM-PRO] Calling sb.auth.signInWithPassword...");
    var r = await sb.auth.signInWithPassword({ email: email, password: password });
    console.log("[AM-PRO] signIn response:", JSON.stringify(r));

    if (r.error) {
      console.error("[AM-PRO] signIn error:", r.error);
      var msg = r.error.message;
      if (msg.toLowerCase().includes("invalid login"))      msg = "Wrong email or password.";
      if (msg.toLowerCase().includes("email not confirmed")) msg = "Please confirm your email first.";
      show(msg, "error");
      return;
    }

    console.log("[AM-PRO] Login successful. UID:", r.data.user.id);
    show("Welcome Back!", "success");

    setTimeout(function () {
      redirectTo("../dashboard/index.html");
    }, 1600);

  } catch (e) {
    console.error("[AM-PRO] Unexpected login error:", e);
    show(e.message || "Wrong email or password", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
};

// ====================================================
// TAB SWITCH
// ====================================================
window.switchTab = function (e, tab) {
  var loginBox  = document.getElementById("loginBox");
  var signupBox = document.getElementById("signupBox");
  if (loginBox)  loginBox.classList.toggle("hidden",  tab !== "login");
  if (signupBox) signupBox.classList.toggle("hidden", tab !== "signup");
  document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
  e.target.classList.add("active");
};

// ====================================================
// INIT
// ====================================================
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();
  console.log("[AM-PRO] auth.js loaded");

  // If already logged in, skip login page
  sb.auth.getSession().then(function (result) {
    if (result.data && result.data.session) {
      console.log("[AM-PRO] Session found — redirecting to dashboard...");
      redirectTo("../dashboard/index.html");
    }
  });
});
