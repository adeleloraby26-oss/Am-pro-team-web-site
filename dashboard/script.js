import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tzojjwnqodcrhwjaasja.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6b2pqd25xb2Rjcmh3amFhc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzA2ODAsImV4cCI6MjA5MzI0NjY4MH0.G4IGSUgjVIKTNVszU5GpxNaD0VUnSmzUXe8p7uUl418"
);

// 3. زر تسجيل الخروج
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        window.location.href = "../auth/index.html";
    };
}

// 4. التحقق من حالة المستخدم وجلب الـ UID
const { data: { session } } = await supabase.auth.getSession();

if (session) {
    console.log("Logged in UID:", session.user.id);
    initDashboard(session.user.id);
} else {
    console.log("No user logged in");
    const container = document.querySelector(".container");
    if (container) {
        container.innerHTML = `    
            <div class="empty-state">    
                <h3>Session expired or not logged in</h3>    
                <p>Please sign in to access this page.</p>    
                <br>    
                <a href="/auth/index.html" class="btn-logout" style="background:var(--apple-blue); color:white; border:none; padding:10px 20px; text-decoration:none; display:inline-block;">Sign In</a>    
            </div>`;
    }
}

// 5. دالة تشغيل الداش بورد
async function initDashboard(currentUserId) {    
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUserId)
            .single();

        if (error) throw error;

        if (data) {    
            document.getElementById("userName").innerText = data.username || data.name || "AM PRO Member";    
            document.getElementById("greetingText").innerText = `Welcome, ${data.name || data.username || ""}`;    
                
            const r = getRank(data.level || 1);    
            const rankEl = document.getElementById("userRank");
            if (rankEl) {
                rankEl.innerText = `${r.name} • Level ${r.level}`;    
                rankEl.style.background = r.color;
            }
        } else {
            console.warn("No document found for this UID");
            document.getElementById("userName").innerText = "Data not found";
        }

        // جلب المهام بناءً على الـ UID
        const { data: tasks } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", currentUserId);

        const list = document.getElementById("tasksList");
        const countEl = document.getElementById("taskCount");

        if (!list) return;

        const renderTasks = (tasks) => {
            if (!tasks || tasks.length === 0) {    
                list.innerHTML = '<div class="empty-state">No tasks right now. Enjoy your day! ✨</div>';    
                if (countEl) countEl.innerText = "0 TASKS";    
                return;    
            }    

            if (countEl) countEl.innerText = `${tasks.length} TASKS`;    
            list.innerHTML = "";    
            tasks.forEach(task => {    
                list.innerHTML += `    
                    <div class="task-card">    
                        <div class="task-icon"></div>    
                        <div class="task-content">    
                            <h4>${task.text || "New Task"}</h4>    
                            <p>Official task from team management</p>    
                        </div>    
                    </div>    
                `;    
            });
        };

        renderTasks(tasks);

        // Real-time للمهام
        supabase
            .channel("tasks-channel")
            .on("postgres_changes", 
                { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${currentUserId}` },
                async () => {
                    const { data: updated } = await supabase
                        .from("tasks").select("*").eq("user_id", currentUserId);
                    renderTasks(updated);
                }
            )
            .subscribe();

    } catch (error) {
        console.error("Error in initDashboard:", error);
    }
}    

// 6. نظام الرتب
const ranks = [    
    { name: "Dust", max: 5, color: "#8e8e93" }, 
    { name: "Stone", max: 6, color: "#636366" }, 
    { name: "Iron", max: 6, color: "#aeaeb2" },    
    { name: "Bronze", max: 7, color: "#a2845e" }, 
    { name: "Silver", max: 7, color: "#cfd3d6" }, 
    { name: "Gold", max: 7, color: "#ffcc00" },    
    { name: "Platinum", max: 8, color: "#e5e5ea" }, 
    { name: "Diamond", max: 8, color: "#007aff" }, 
    { name: "Emerald", max: 9, color: "#34c759" },    
    { name: "Sapphire", max: 9, color: "#5856d6" }, 
    { name: "Obsidian", max: 10, color: "#1c1c1e" }, 
    { name: "Mythic", max: 10, color: "#ff2d55" },    
    { name: "Legend", max: 10, color: "#af52de" }, 
    { name: "Master", max: 12, color: "#5ac8fa" }, 
    { name: "Grandmaster", max: 15, color: "#ff9500" },    
    { name: "Imperial", max: 20, color: "linear-gradient(135deg, #ffd60a, #ff9500)" }, 
    { name: "Royal", max: 20, color: "linear-gradient(135deg, #bf5af2, #5e5ce6)" }, 
    { name: "Founder", max: 999999, color: "linear-gradient(135deg, #64d2ff, #0a84ff)" }    
];    

function getRank(level) {    
    let sum = 0;    
    for (let i = 0; i < ranks.length; i++) {    
        if (level <= sum + ranks[i].max) return { ...ranks[i], level: level - sum };    
        sum += ranks[i].max;    
    }    
    return { ...ranks[ranks.length-1], level: 1 };    
}
