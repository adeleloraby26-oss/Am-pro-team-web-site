// ====================================================
// SUPABASE INIT — v2 UMD
// ====================================================
const { createClient } = supabase;
const sb = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

console.log("[AM-PRO] Dashboard: Supabase initialized");

// ====================================================
// LOGOUT BUTTON
// ====================================================
document.addEventListener("DOMContentLoaded", function () {
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
      console.log("[AM-PRO] Signing out...");
      var { error } = await sb.auth.signOut();
      if (error) console.error("[AM-PRO] signOut error:", error);
      window.location.href = "../auth/index.html";
    });
  }
});

// ====================================================
// SESSION CHECK & INIT
// ====================================================
(async function () {
  try {
    console.log("[AM-PRO] Checking session...");
    var { data, error } = await sb.auth.getSession();

    if (error) {
      console.error("[AM-PRO] getSession error:", error);
    }

    if (data && data.session) {
      console.log("[AM-PRO] Session valid. UID:", data.session.user.id);
      initDashboard(data.session.user.id);
    } else {
      console.warn("[AM-PRO] No active session — redirecting to login");
      var container = document.querySelector(".container");
      if (container) {
        container.innerHTML =
          '<div class="empty-state">' +
            '<h3>Session expired or not logged in</h3>' +
            '<p>Please sign in to access this page.</p><br>' +
            '<a href="../auth/index.html" class="btn-logout" ' +
               'style="background:var(--apple-blue);color:white;border:none;' +
               'padding:10px 20px;text-decoration:none;display:inline-block;border-radius:10px;">' +
              'Sign In' +
            '</a>' +
          '</div>';
      }
    }
  } catch (e) {
    console.error("[AM-PRO] Unexpected error in session check:", e);
  }
})();

// ====================================================
// DASHBOARD INIT
// ====================================================
async function initDashboard(currentUserId) {
  try {
    console.log("[AM-PRO] initDashboard for UID:", currentUserId);

    // FIX: use sb (the local client), not the global supabase object
    var { data, error } = await sb
      .from("users")
      .select("*")
      .eq("id", currentUserId)
      .single();

    if (error) {
      console.error("[AM-PRO] users fetch error:", error);
      // Still show the dashboard shell even if user row is missing
    }

    if (data) {
      console.log("[AM-PRO] User data:", data);
      var userNameEl    = document.getElementById("userName");
      var greetingEl    = document.getElementById("greetingText");
      var rankEl        = document.getElementById("userRank");

      if (userNameEl) userNameEl.innerText  = data.username || data.name || "AM PRO Member";
      if (greetingEl) greetingEl.innerText  = "Welcome, " + (data.name || data.username || "");

      if (rankEl) {
        var r = getRank(data.level || 1);
        rankEl.innerText        = r.name + " \u2022 Level " + r.level;
        rankEl.style.background = r.color;
      }
    } else {
      console.warn("[AM-PRO] No user row found for UID:", currentUserId);
      var el = document.getElementById("userName");
      if (el) el.innerText = "AM PRO Member";
    }

    // ── TASKS ──────────────────────────────────────
    var { data: tasks, error: taskErr } = await sb
      .from("tasks")
      .select("*")
      .eq("user_id", currentUserId);

    if (taskErr) console.error("[AM-PRO] tasks fetch error:", taskErr);

    renderTasks(tasks || []);

    // Real-time subscription for tasks
    sb.channel("tasks-channel-" + currentUserId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: "user_id=eq." + currentUserId },
        async function () {
          console.log("[AM-PRO] Real-time tasks update received");
          var { data: updated, error: rtErr } = await sb
            .from("tasks")
            .select("*")
            .eq("user_id", currentUserId);
          if (rtErr) console.error("[AM-PRO] real-time tasks error:", rtErr);
          renderTasks(updated || []);
        }
      )
      .subscribe(function (status) {
        console.log("[AM-PRO] Realtime subscription status:", status);
      });

  } catch (e) {
    console.error("[AM-PRO] Unexpected error in initDashboard:", e);
  }
}

// ====================================================
// RENDER TASKS
// ====================================================
function renderTasks(tasks) {
  var list    = document.getElementById("tasksList");
  var countEl = document.getElementById("taskCount");
  if (!list) return;

  if (!tasks || tasks.length === 0) {
    list.innerHTML = '<div class="empty-state">No tasks right now. Enjoy your day! \u2728</div>';
    if (countEl) countEl.innerText = "0 TASKS";
    return;
  }

  if (countEl) countEl.innerText = tasks.length + " TASKS";
  list.innerHTML = "";
  tasks.forEach(function (task) {
    list.innerHTML +=
      '<div class="task-card">' +
        '<div class="task-icon"></div>' +
        '<div class="task-content">' +
          '<h4>' + (task.text || "New Task") + '</h4>' +
          '<p>Official task from team management</p>' +
        '</div>' +
      '</div>';
  });
}

// ====================================================
// RANK SYSTEM
// ====================================================
var ranks = [
  { name: "Dust",        max: 5,      color: "#8e8e93" },
  { name: "Stone",       max: 6,      color: "#636366" },
  { name: "Iron",        max: 6,      color: "#aeaeb2" },
  { name: "Bronze",      max: 7,      color: "#a2845e" },
  { name: "Silver",      max: 7,      color: "#cfd3d6" },
  { name: "Gold",        max: 7,      color: "#ffcc00" },
  { name: "Platinum",    max: 8,      color: "#e5e5ea" },
  { name: "Diamond",     max: 8,      color: "#007aff" },
  { name: "Emerald",     max: 9,      color: "#34c759" },
  { name: "Sapphire",    max: 9,      color: "#5856d6" },
  { name: "Obsidian",    max: 10,     color: "#1c1c1e" },
  { name: "Mythic",      max: 10,     color: "#ff2d55" },
  { name: "Legend",      max: 10,     color: "#af52de" },
  { name: "Master",      max: 12,     color: "#5ac8fa" },
  { name: "Grandmaster", max: 15,     color: "#ff9500" },
  { name: "Imperial",    max: 20,     color: "linear-gradient(135deg,#ffd60a,#ff9500)" },
  { name: "Royal",       max: 20,     color: "linear-gradient(135deg,#bf5af2,#5e5ce6)" },
  { name: "Founder",     max: 999999, color: "linear-gradient(135deg,#64d2ff,#0a84ff)" }
];

function getRank(level) {
  var sum = 0;
  for (var i = 0; i < ranks.length; i++) {
    if (level <= sum + ranks[i].max) return Object.assign({}, ranks[i], { level: level - sum });
    sum += ranks[i].max;
  }
  return Object.assign({}, ranks[ranks.length - 1], { level: 1 });
}
