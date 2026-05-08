const { createClient } = supabase;
const sb = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

function show(msg, type) {
  var box  = document.getElementById("notif");
  var text = document.getElementById("notifText");
  var icon = box.querySelector("i");
  text.innerText = msg;
  icon.setAttribute("data-lucide", type === "error" ? "x-circle" : "check-circle");
  lucide.createIcons();
  box.classList.add("show");
  setTimeout(function(){ box.classList.remove("show"); }, 3500);
}

function toggleEye(inputId, btn) {
  var input = document.getElementById(inputId);
  var icon  = btn.querySelector("i");
  if (input.style.webkitTextSecurity === "none") {
    input.style.webkitTextSecurity = "disc";
    icon.setAttribute("data-lucide", "eye");
  } else {
    input.style.webkitTextSecurity = "none";
    icon.setAttribute("data-lucide", "eye-off");
  }
  lucide.createIcons();
}

function checkStrength(value) {
  var score = 0;
  if (value.length >= 8)          score++;
  if (/[A-Z]/.test(value))        score++;
  if (/[a-z]/.test(value))        score++;
  if (/[0-9]/.test(value))        score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  var bars  = document.querySelectorAll(".strength-bar span");
  var label = document.getElementById("strengthLabel");
  var colors = ["#ff3b30","#ff9500","#ffcc00","#30d158","#30d158"];
  var labels = ["Very Weak","Weak","Fair","Strong","Very Strong"];
  bars.forEach(function(bar, i){
    bar.className = "";
    if (i < score) bar.classList.add("s" + score);
  });
  if (value.length === 0) {
    label.textContent = "Password strength";
    label.style.color = "rgba(255,255,255,0.45)";
  } else {
    label.textContent = labels[score-1] || labels[0];
    label.style.color  = colors[score-1] || colors[0];
  }
}

function validatePassword(pw) {
  if (pw.length < 8)            return "At least 8 characters required";
  if (!/[A-Z]/.test(pw))        return "At least one uppercase letter";
  if (!/[a-z]/.test(pw))        return "At least one lowercase letter";
  if (!/[0-9]/.test(pw))        return "At least one number";
  if (!/[^A-Za-z0-9]/.test(pw)) return "At least one special character (!@#$)";
  return null;
}

window.signup = async function() {
  var name     = document.getElementById("name").value.trim();
  var username = document.getElementById("username").value.trim();
  var gender   = document.getElementById("gender").value;
  var field    = document.getElementById("field").value;
  var email    = document.getElementById("email").value.trim();
  var password = document.getElementById("pass").value;
  var confirm  = document.getElementById("confirmPass").value;

  if (!name || !username || !gender || !field || !email || !password) {
    show("Please fill in all fields", "error"); return;
  }
  var pwErr = validatePassword(password);
  if (pwErr) { show(pwErr, "error"); return; }
  if (password !== confirm) { show("Passwords do not match", "error"); return; }

  show("Creating account...", "success");

  try {
    var r1 = await sb.auth.signUp({ email: email, password: password });
    if (r1.error) { show(r1.error.message, "error"); return; }

    var r2 = await sb.from("users").insert({
      id: r1.data.user.id,
      uid: r1.data.user.id,
      name: name,
      username: username,
      gender: gender,
      field: field,
      email: email
    });
    if (r2.error) { show(r2.error.message, "error"); return; }

    show("Account Created Successfully", "success");
    setTimeout(function(){ window.location.href = "../dashboard/index.html"; }, 1500);

  } catch(e) {
    show(e.message || "Something went wrong", "error");
  }
};

window.login = async function() {
  var email    = document.getElementById("loginEmail").value.trim();
  var password = document.getElementById("loginPass").value;

  if (!email || !password) { show("Please enter email and password", "error"); return; }

  show("Signing in...", "success");

  try {
    var r = await sb.auth.signInWithPassword({ email: email, password: password });
    if (r.error) { show(r.error.message, "error"); return; }

    show("Welcome Back", "success");
    setTimeout(function(){ window.location.href = "../dashboard/index.html"; }, 1500);

  } catch(e) {
    show(e.message || "Wrong email or password", "error");
  }
};

window.switchTab = function(e, tab) {
  document.getElementById("loginBox").classList.toggle("hidden",  tab !== "login");
  document.getElementById("signupBox").classList.toggle("hidden", tab !== "signup");
  document.querySelectorAll(".tab").forEach(function(t){ t.classList.remove("active"); });
  e.target.classList.add("active");
};

window.toggleEye   = toggleEye;
window.checkStrength = checkStrength;

document.addEventListener("DOMContentLoaded", function(){ lucide.createIcons(); });
