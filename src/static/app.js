// Carga y renderiza actividades con sección de participantes y maneja el signup form.

document.addEventListener("DOMContentLoaded", () => {
  const activitiesListEl = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");

  function showMessage(text, type = "info") {
    messageEl.textContent = text;
    messageEl.className = ""; // reset
    messageEl.classList.add("message", type);
    messageEl.classList.remove("hidden");
    setTimeout(() => {
      messageEl.classList.add("hidden");
    }, 4000);
  }

  function createActivityCard(name, data) {
    const card = document.createElement("div");
    card.className = "activity-card";
    // Build inner HTML with participants section
    card.innerHTML = `
      <h4>${escapeHtml(name)}</h4>
      <p><strong>Horario:</strong> ${escapeHtml(data.schedule)}</p>
      <p>${escapeHtml(data.description)}</p>
      <div class="participants" data-activity="${escapeHtml(name)}">
        <div class="participants-title">Participantes <small style="color:#666;font-weight:500;">(${data.participants.length})</small></div>
        ${data.participants.length > 0
          ? `<ul class="participants-list">
               ${data.participants.map(p => `<li><span class="participant-badge">${escapeHtml(p)}</span></li>`).join("")}
             </ul>`
          : `<div class="participants-empty">No hay participantes aún.</div>`
        }
      </div>
    `;
    return card;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadActivities() {
    activitiesListEl.innerHTML = "<p>Loading activities...</p>";
    try {
      const res = await fetch("/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");
      const activities = await res.json();

      // Clear and render
      activitiesListEl.innerHTML = "";
      activitySelect.innerHTML = `<option value="">-- Select an activity --</option>`;

      Object.keys(activities).forEach(name => {
        const card = createActivityCard(name, activities[name]);
        activitiesListEl.appendChild(card);

        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        activitySelect.appendChild(opt);
      });
    } catch (err) {
      activitiesListEl.innerHTML = `<p class="error">Error loading activities.</p>`;
      console.error(err);
    }
  }

  async function submitSignup(email, activityName) {
    // FastAPI endpoint expects POST to /activities/{activity_name}/signup?email=...
    const url = `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`;
    try {
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || "Signup failed");
      }
      const data = await res.json();
      showMessage(data.message || "Signed up successfully", "success");
      await loadActivities(); // refresh UI to show new participant
    } catch (err) {
      showMessage(err.message || "Error during signup", "error");
    }
  }

  signupForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activityName = activitySelect.value;
    if (!email || !activityName) {
      showMessage("Por favor, complete el correo y seleccione una actividad.", "error");
      return;
    }
    submitSignup(email, activityName);
    signupForm.reset();
  });

  // Inicializar
  loadActivities();
});
