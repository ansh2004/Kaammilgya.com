/*=====================================
  KaamMilGya - Find Workers (Vanilla JS)
  - Dynamic worker cards
  - Search + filter + sort
  - Pagination (12/page)
  - Profile modal
  - Bookmark/Favorite (localStorage)
=====================================*/

(() => {
  const state = {
    allWorkers: [],
    filtered: [],
    currentPage: 1,
    pageSize: 12,
    query: "",
    filters: {
      category: "",
      experience: "",
      location: "",
      availability: "",
    },
    sort: "newest",

    favorites: new Set(),
    bookmarks: new Set(),
  };

  const els = {
    workerSearch: document.getElementById("workerSearch"),
    filterCategory: document.getElementById("filterCategory"),
    filterExperience: document.getElementById("filterExperience"),
    filterLocation: document.getElementById("filterLocation"),
    filterAvailability: document.getElementById("filterAvailability"),

    applyFilters: document.getElementById("applyFilters"),
    clearFilters: document.getElementById("clearFilters"),

    sortOption: document.getElementById("sortOption"),

    workersGrid: document.getElementById("workersGrid"),
    pagination: document.getElementById("pagination"),

    resultsCount: document.getElementById("resultsCount"),

    loadingWrap: document.getElementById("loadingWrap"),
    noResults: document.getElementById("noResults"),

    profileModalOverlay: document.getElementById("profileModalOverlay"),
    profileModal: document.getElementById("profileModal"),
    profileModalBody: document.getElementById("profileModalBody"),
    closeProfile: document.getElementById("closeProfile"),
  };

  const IMG_FALLBACK = "assets/images/workers/worker-default.jpg";

  function safeText(v) {
    return (v ?? "").toString();
  }

  function parseExperienceRank(exp) {
    // Fresher -> 0, 1+ -> 1, 3+ -> 3, 5+ -> 5, 10+ -> 10
    const map = { Fresher: 0, "1+": 1, "3+": 3, "5+": 5, "10+": 10 };
    return map[exp] ?? 0;
  }

  function experienceMatches(worker, selected) {
    if (!selected) return true;
    const rank = parseExperienceRank(selected);
    // worker.experience contains e.g. "3 Years" or "5+ Years".
    const w = (worker.experience ?? "").toString();
    const num = parseInt((w.match(/\d+/) || ["0"])[0], 10);

    if (selected === "Fresher") return num === 0 || num < 1;
    return num >= rank;
  }

  function availabilityMatches(worker, selected) {
    if (!selected) return true;
    return safeText(worker.availability).toLowerCase() === selected.toLowerCase();
  }

  function locationMatches(worker, selected) {
    if (!selected) return true;
    const wCity = safeText(worker.city).toLowerCase();
    const wState = safeText(worker.state).toLowerCase();
    const sel = selected.toLowerCase();

    return wCity === sel || wState === sel;
  }

  function categoryMatches(worker, selected) {
    if (!selected) return true;
    return safeText(worker.category).toLowerCase() === selected.toLowerCase();
  }

  function searchMatches(worker, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();

    const name = safeText(worker.name).toLowerCase();
    const profession = safeText(worker.profession).toLowerCase();
    const category = safeText(worker.category).toLowerCase();
    const city = safeText(worker.city).toLowerCase();
    const state = safeText(worker.state).toLowerCase();
    const skills = (worker.skills || []).join(" ").toLowerCase();

    // also check languages
    const languages = (worker.languages || []).join(" ").toLowerCase();

    return (
      name.includes(q) ||
      profession.includes(q) ||
      category.includes(q) ||
      city.includes(q) ||
      state.includes(q) ||
      skills.includes(q) ||
      languages.includes(q)
    );
  }

  function filterWorkers(list) {
    return list.filter((w) => {
      return (
        categoryMatches(w, state.filters.category) &&
        experienceMatches(w, state.filters.experience) &&
        locationMatches(w, state.filters.location) &&
        availabilityMatches(w, state.filters.availability) &&
        searchMatches(w, state.query)
      );
    });
  }

  function sortWorkers(list) {
    const arr = [...list];

    switch (state.sort) {
      case "rating":
        arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "salaryAsc":
        arr.sort((a, b) => (a.salary ?? 0) - (b.salary ?? 0));
        break;
      case "experience":
        arr.sort((a, b) => {
          const an = parseInt((a.experience || "").match(/\d+/)?.[0] || "0", 10);
          const bn = parseInt((b.experience || "").match(/\d+/)?.[0] || "0", 10);
          return bn - an;
        });
        break;
      case "alpha":
        arr.sort((a, b) => safeText(a.name).localeCompare(safeText(b.name)));
        break;
      case "newest":
      default:
        // newest => recently joined / joinDate fallback
        arr.sort((a, b) => (b.joinedAt ?? 0) - (a.joinedAt ?? 0));
        break;
    }

    return arr;
  }

  function formatINR(value) {
    const n = Number(value ?? 0);
    return `₹${n.toLocaleString("en-IN")}`;
  }

  function createWorkerCard(worker) {
    const verifiedLabel = worker.verified ? "Verified" : "";

    const isFav = state.favorites.has(worker.id);
    const isBooked = state.bookmarks.has(worker.id);

    const skills = (worker.skills || []).slice(0, 4).join(", ");

    const availabilityDot = worker.availability === "Available Now" ? "online" : "";

    const joinedText = worker.joinedAtText || "";

    const featuredBadge = worker.featured ? `
      <span class="tag featured"><i class="fa-solid fa-star"></i> Featured</span>
    ` : "";

    const recentlyJoinedBadge = worker.recentlyJoined ? `
      <span class="tag joined"><i class="fa-solid fa-bolt"></i> Recently Joined</span>
    ` : "";

    return `
      <article class="worker-card" data-worker-id="${worker.id}">
        <div class="worker-card-top">
          <div class="worker-image" style="height:220px;">
            <img loading="lazy" src="${worker.photo || IMG_FALLBACK}" alt="${safeText(worker.name)}">

            ${worker.verified ? `
              <span class="verified-badge"><i class="fa-solid fa-circle-check"></i> Verified</span>
            ` : ""}

            ${worker.availability ? `
              <span class="available">
                ${worker.availability === "Available Now" ? `<span class="dot ${availabilityDot}"></span>` : ""}
                ${safeText(worker.availability)}
              </span>
            ` : ""}

            ${recentlyJoinedBadge}
            ${featuredBadge}
          </div>

          <div class="worker-profile-row">
            <img loading="lazy" class="worker-avatar" src="${worker.photo || IMG_FALLBACK}" alt="${safeText(worker.name)}">
            <div class="worker-profile-meta">
              <div class="worker-header">
                <h3>${safeText(worker.name)}</h3>
                <span class="rating">★ ${safeText(worker.rating)} <small>(${safeText(worker.ratingCount || "")})</small></span>
              </div>
              <div class="profession">${safeText(worker.profession)}</div>
              <div class="worker-details">
                <span><i class="fa-solid fa-briefcase"></i> ${safeText(worker.experience)}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${safeText(worker.city)}, ${safeText(worker.state)}</span>
                <span><i class="fa-solid fa-language"></i> ${(worker.languages || []).slice(0, 3).join(", ")}</span>
              </div>
              <div class="skills-line">Skills: ${safeText(skills)}</div>
            </div>

            <div class="worker-icons">
              <button class="icon-btn bookmark ${isBooked ? "active" : ""}" data-action="bookmark" aria-label="Bookmark" type="button" data-worker-id="${worker.id}">
                <i class="fa-solid fa-bookmark"></i>
              </button>
              <button class="icon-btn favorite ${isFav ? "active" : ""}" data-action="favorite" aria-label="Favorite" type="button" data-worker-id="${worker.id}">
                <i class="fa-solid fa-heart"></i>
              </button>
            </div>
          </div>

          <div class="worker-content">
            <p class="worker-desc">${safeText(worker.description)}</p>

            <div class="salary-box">
              <div><i class="fa-solid fa-indian-rupee-sign"></i> <strong>${formatINR(worker.dailyRate)}</strong> / day</div>
              <div><i class="fa-solid fa-calendar-days"></i> <strong>${formatINR(worker.salary)}</strong> / month</div>
            </div>

            <div class="worker-actions">
              <button type="button" class="btn-primary action-view" data-worker-id="${worker.id}">View Profile</button>
              <a class="btn-secondary action-hire" href="#" data-worker-id="${worker.id}">Hire Now</a>
              <a class="btn-whatsapp" href="#" data-worker-id="${worker.id}" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
              <a class="btn-call" href="#" data-worker-id="${worker.id}" aria-label="Call"><i class="fa-solid fa-phone"></i></a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderWorkers() {
    const loading = !!els.loadingWrap;
    if (loading) {
      els.loadingWrap.style.display = "flex";
    }

    const all = state.allWorkers;
    const filtered = filterWorkers(all);
    const sorted = sortWorkers(filtered);
    state.filtered = sorted;

    if (els.resultsCount) {
      els.resultsCount.innerHTML = `${sorted.length}`;
    }

    const totalPages = Math.max(1, Math.ceil(sorted.length / state.pageSize));
    state.currentPage = Math.min(state.currentPage, totalPages);

    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    const pageItems = sorted.slice(start, end);

    els.workersGrid.innerHTML = pageItems.map(createWorkerCard).join("");

    if (els.noResults) {
      els.noResults.style.display = sorted.length === 0 ? "block" : "none";
    }

    renderPagination(totalPages);

    if (loading) {
      els.loadingWrap.style.display = "none";
    }
  }

  function renderPagination(totalPages) {
    const container = els.pagination;
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    const current = state.currentPage;

    const pages = [];
    // simple window: show prev/next with around current
    for (let p = 1; p <= totalPages; p++) {
      const near = Math.abs(p - current) <= 2;
      if (p === 1 || p === totalPages || near) pages.push(p);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }

    container.innerHTML = `
      <button class="page-btn" type="button" data-page="${Math.max(1, current - 1)}" aria-label="Previous" ${current === 1 ? "disabled" : ""}>
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      ${pages
        .map((p) => {
          if (p === "…") {
            return `<span class="page-ellipsis">…</span>`;
          }
          return `<button class="page-btn ${p === current ? "active" : ""}" type="button" data-page="${p}">${p}</button>`;
        })
        .join("")}

      <button class="page-btn" type="button" data-page="${Math.min(totalPages, current + 1)}" aria-label="Next" ${current === totalPages ? "disabled" : ""}>
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;
  }

  function openProfile(workerId) {
    const worker = state.allWorkers.find((w) => String(w.id) === String(workerId));
    if (!worker) return;

    const education = (worker.education || []).join("<br>");
    const certificates = (worker.certificates || []).map((c) => `<li>${safeText(c)}</li>`).join("");
    const skills = (worker.skills || []).map((s) => `<span class="pill">${safeText(s)}</span>`).join("");

    const prevJobs = (worker.previousJobs || []).map((j) => `<li>${safeText(j)}</li>`).join("");

    const languages = (worker.languages || []).map((l) => `<span class="pill">${safeText(l)}</span>`).join("");

    const availability = safeText(worker.availability);

    els.profileModalBody.innerHTML = `
      <div class="profile-hero">
        <img loading="lazy" src="${worker.photo || IMG_FALLBACK}" alt="${safeText(worker.name)}" class="profile-photo">
        ${worker.verified ? `<span class="verified-pill"><i class="fa-solid fa-circle-check"></i> Verified</span>` : ""}
      </div>

      <h2 class="profile-name">${safeText(worker.name)}</h2>
      <p class="profile-profession">${safeText(worker.profession)} • ${safeText(worker.category)}</p>

      <div class="profile-grid">
        <section class="profile-about">
          <h3>About</h3>
          <p>${safeText(worker.description)}</p>

          <h3>Experience</h3>
          <p>${safeText(worker.experience)}</p>

          <h3>Education</h3>
          <div class="muted">${education || "—"}</div>

          <h3>Availability</h3>
          <div class="muted">${availability}</div>
        </section>

        <section class="profile-details">
          <div class="detail-row"><i class="fa-solid fa-phone"></i><span>${safeText(worker.phone)}</span></div>
          <div class="detail-row"><i class="fa-solid fa-envelope"></i><span>${safeText(worker.email)}</span></div>
          <div class="detail-row"><i class="fa-solid fa-location-dot"></i><span>${safeText(worker.address || "")} • ${safeText(worker.city)}, ${safeText(worker.state)}</span></div>
          <div class="detail-row"><i class="fa-solid fa-user"></i><span>${safeText(worker.age)} yrs • ${safeText(worker.gender)}</span></div>

          <h3>Skills</h3>
          <div class="pill-wrap">${skills || "—"}</div>

          <h3>Certificates</h3>
          <ul class="list">${certificates || "<li>—</li>"}</ul>

          <h3>Languages</h3>
          <div class="pill-wrap">${languages || "—"}</div>

          <h3>Previous jobs</h3>
          <ul class="list">${prevJobs || "<li>—</li>"}</ul>

          <h3>Expected salary</h3>
          <div class="salary-expected">
            <div><i class="fa-solid fa-indian-rupee-sign"></i> Daily: <strong>${formatINR(worker.dailyRate)}</strong></div>
            <div><i class="fa-solid fa-calendar-days"></i> Monthly: <strong>${formatINR(worker.salary)}</strong></div>
          </div>
        </section>
      </div>

      <div class="profile-actions">
        <a class="btn-secondary" href="${worker.resume || '#'}" download>Download Resume</a>
        <a class="btn-primary" href="#" data-worker-id="${worker.id}">Hire Now</a>
        <div class="profile-quick" aria-label="Quick actions">
          <a class="btn-whatsapp" href="#" data-worker-id="${worker.id}" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          <a class="btn-call" href="#" data-worker-id="${worker.id}" aria-label="Call"><i class="fa-solid fa-phone"></i></a>
        </div>
      </div>
    `;

    els.profileModalOverlay.style.display = "block";
    els.profileModal.style.display = "block";
    els.profileModalOverlay.classList.add("show");
    els.profileModal.classList.add("show");

    // accessibility-ish
    els.profileModal.focus?.();
  }

  function closeProfile() {
    els.profileModalOverlay.classList.remove("show");
    els.profileModal.classList.remove("show");
    els.profileModal.style.display = "none";
    els.profileModalOverlay.style.display = "none";
  }

  function bookmarkWorker(workerId) {
    const id = String(workerId);
    if (state.bookmarks.has(id)) state.bookmarks.delete(id);
    else state.bookmarks.add(id);
    persistFavorites();
  }

  function favoriteWorker(workerId) {
    const id = String(workerId);
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    persistFavorites();
  }

  function persistFavorites() {
    try {
      localStorage.setItem("kaammilgya_bookmarks", JSON.stringify([...state.bookmarks]));
      localStorage.setItem("kaammilgya_favorites", JSON.stringify([...state.favorites]));
    } catch (_) {
      // ignore
    }
  }

  function loadFavorites() {
    try {
      const b = JSON.parse(localStorage.getItem("kaammilgya_bookmarks") || "[]");
      const f = JSON.parse(localStorage.getItem("kaammilgya_favorites") || "[]");
      state.bookmarks = new Set((b || []).map(String));
      state.favorites = new Set((f || []).map(String));
    } catch (_) {
      // ignore
    }
  }

  function getFakeWorkers() {
    const now = Date.now();
    const days = (d) => now - d * 24 * 60 * 60 * 1000;

    const base = [
      {
        profession: "Painter",
        category: "Painter",
        city: "Ludhiana",
        state: "Punjab",
        skills: ["Wall painting", "Emulsion", "Texture painting", "Color matching"],
        languages: ["Hindi", "Punjabi"],
        phone: "+91 98765 10001",
        whatsapp: "+91 98765 10001",
        email: "painter1@kaammilgya.com",
        availability: "Available Now",
        dailyRate: 900,
        salary: 22000,
        rating: 4.9,
        ratingCount: 220,
        description: "Clean finishing, premium paint selection guidance, and on-time completion.",
        education: ["ITI (Painting)"],
        certificates: ["Verified Painting Certificate"],
      },
    ];

    const names = [
      ["Ramesh Kumar", "Male"],
      ["Sunil Sharma", "Male"],
      ["Ajay Singh", "Male"],
      ["Priya Verma", "Female"],
      ["Neha Gupta", "Female"],
      ["Vikram Singh", "Male"],
      ["Kiran Patel", "Female"],
      ["Rahul Yadav", "Male"],
      ["Mohammed Ali", "Male"],
      ["Suresh Raj", "Male"],
      ["Manisha Rao", "Female"],
      ["Imran Khan", "Male"],
      ["Rohit Chauhan", "Male"],
      ["Deepika Nair", "Female"],
      ["Sanjay Das", "Male"],
      ["Zoya Khan", "Female"],
      ["Arun Menon", "Male"],
      ["Meera Iyer", "Female"],
      ["Prakash Jaiswal", "Male"],
      ["Tanya Chopra", "Female"],
    ];

    const professions = [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Painter",
      "Mason",
      "Driver",
      "Cook",
      "House Maid",
      "AC Technician",
      "Welder",
      "Tailor",
      "Beautician",
      "Mechanic",
    ];

    const experiencePool = ["Fresher", "1 Years", "3 Years", "5 Years", "10 Years"];
    const availabilityPool = ["Available Now", "Busy", "Weekend"];

    const locations = [
      ["Amritsar", "Punjab"],
      ["Chandigarh", "Punjab"],
      ["Ludhiana", "Punjab"],
      ["Jaipur", "Rajasthan"],
      ["Udaipur", "Rajasthan"],
      ["Gurugram", "Haryana"],
      ["Faridabad", "Haryana"],
      ["Delhi", "Delhi"],
      ["Lucknow", "Uttar Pradesh"],
      ["Noida", "Uttar Pradesh"],
      ["Mumbai", "Maharashtra"],
      ["Pune", "Maharashtra"],
      ["Ahmedabad", "Gujarat"],
      ["Surat", "Gujarat"],
      ["Bengaluru", "Karnataka"],
      ["Mysuru", "Karnataka"],
      ["Chennai", "Tamil Nadu"],
      ["Kolkata", "West Bengal"],
      ["Visakhapatnam", "Andhra Pradesh"],
      ["Hyderabad", "Telangana"],
      ["Kochi", "Kerala"],
      ["Indore", "Madhya Pradesh"],
      ["Bhopal", "Madhya Pradesh"],
      ["Ranchi", "Jharkhand"],
    ];

    const genderPool = ["Male", "Female"];

    const fake = [];

    for (let i = 1; i <= 30; i++) {
      const [name, gender] = names[(i - 1) % names.length];
      const profession = professions[(i - 1) % professions.length];
      const category = profession;
      const [city, state] = locations[(i * 2) % locations.length];

      const expIdx = i % experiencePool.length;
      const exp = experiencePool[expIdx];
      const expNum = exp === "Fresher" ? 0 : parseInt((exp.match(/\d+/) || ["0"])[0], 10);

      const availability = availabilityPool[i % availabilityPool.length];

      const rating = Math.max(3.8, Math.min(5.0, 4.2 + (i % 9) * 0.08));
      const ratingCount = 50 + i * 7;

      const dailyRate = 650 + i * 55;
      const salary = dailyRate * 26;

      const verified = i % 2 === 0;

      const joinedAt = days(30 - i);
      const recentlyJoined = i % 3 === 0;
      const featured = i % 5 === 0;

      const skillsMap = {
        Electrician: ["Wiring", "Switchboard", "MCB", "Safety checks"],
        Plumber: ["Leak fixing", "Pipes", "Taps", "Drain cleaning"],
        Carpenter: ["Woodwork", "Furniture", "Door fitting", "Polishing"],
        Painter: ["Wall painting", "Emulsion", "Putty", "Texture"],
        Mason: ["Brickwork", "Cementing", "Plastering", "Foundation"],
        Driver: ["Local transport", "Road safety", "Vehicle handling", "Timely delivery"],
        Cook: ["North Indian", "Hygiene", "Meal planning", "Tandoor support"],
        "House Maid": ["Cleaning", "Cooking support", "Organizing", "Care assistance"],
        "AC Technician": ["Gas refill", "Service", "Installation", "Cooling diagnostics"],
        Welder: ["Arc welding", "Metal cutting", "Repairs", "Safety"],
        Tailor: ["Stitching", "Alterations", "Fitting", "Measurements"],
        Beautician: ["Makeup", "Skincare", "Threading", "Hair care"],
        Mechanic: ["Engine check", "Repairs", "Diagnostics", "Maintenance"],
      };

      const languages = ["Hindi", "English"].slice(0, 2 - (i % 2));
      if (i % 4 === 0) languages.push("Punjabi");

      const age = 20 + (i % 15);

      fake.push({
        id: i,
        name,
        photo: `assets/images/workers/${(i % 5) + 1}.jpg`,
        profession,
        category,
        experience: exp === "Fresher" ? "Fresher" : `${expNum} Years`,
        skills: skillsMap[profession] || ["Skilled work", "Quality finishing"],
        location: `${city}, ${state}`,
        city,
        state,
        phone: `+91 98${String(1000000 + i * 12345).slice(-9)}`,
        whatsapp: `+91 98${String(1000000 + i * 12345).slice(-9)}`,
        email: `${name.toLowerCase().replace(/\s+/g, "")}${i}@kaammilgya.com`,
        languages,
        availability,
        rating: Number(rating.toFixed(1)),
        salary,
        dailyRate,
        resume: `assets/resumes/resume-${i}.pdf`,
        verified,
        description: `Professional ${profession.toLowerCase()} with reliable service, clear communication, and quality results.`,
        education: ["High School / Relevant Training"],
        certificates: verified ? ["Verified Worker Certificate"] : ["Training Certificate"],
        age,
        gender,
        joinedAt,
        joinedAtText: recentlyJoined ? "Recently" : "",
        recentlyJoined,
        featured,
        previousJobs: [
          `Worked on residential projects in ${city}`,
          `Delivered services for multiple clients in ${state}`,
        ],
        address: `${10 + i} Main Street`,
      });
    }

    // ensure 30
    return fake.slice(0, 30);
  }

  function bindUI() {
    if (els.workerSearch) {
      els.workerSearch.addEventListener("input", (e) => {
        state.query = e.target.value;
        state.currentPage = 1;
        renderWorkers();
      });
    }

    els.applyFilters?.addEventListener("click", () => {
      state.filters.category = els.filterCategory?.value || "";
      state.filters.experience = els.filterExperience?.value || "";
      state.filters.location = els.filterLocation?.value || "";
      state.filters.availability = els.filterAvailability?.value || "";

      state.currentPage = 1;
      renderWorkers();
    });

    els.clearFilters?.addEventListener("click", () => {
      state.filters = { category: "", experience: "", location: "", availability: "" };

      if (els.filterCategory) els.filterCategory.value = "";
      if (els.filterExperience) els.filterExperience.value = "";
      if (els.filterLocation) els.filterLocation.value = "";
      if (els.filterAvailability) els.filterAvailability.value = "";

      state.currentPage = 1;
      renderWorkers();
    });

    els.sortOption?.addEventListener("change", (e) => {
      state.sort = e.target.value;
      state.currentPage = 1;
      renderWorkers();
    });

    els.pagination?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-page]");
      if (!btn) return;
      const page = Number(btn.getAttribute("data-page"));
      if (!page || page < 1) return;
      state.currentPage = page;
      renderWorkers();
    });

    document.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("button.icon-btn[data-action]");
      if (actionBtn) {
        const workerId = actionBtn.getAttribute("data-worker-id");
        const action = actionBtn.getAttribute("data-action");
        if (action === "bookmark") bookmarkWorker(workerId);
        if (action === "favorite") favoriteWorker(workerId);

        // re-render to reflect active state
        renderWorkers();
        return;
      }

      const viewBtn = e.target.closest("button.action-view[data-worker-id]");
      if (viewBtn) {
        openProfile(viewBtn.getAttribute("data-worker-id"));
        return;
      }
    });

    els.closeProfile?.addEventListener("click", closeProfile);

    els.profileModalOverlay?.addEventListener("click", () => closeProfile());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeProfile();
    });
  }

  function init() {
    loadFavorites();

    // Later: replace with fetch('/api/workers')
    state.allWorkers = getFakeWorkers();

    state.filtered = state.allWorkers;

    bindUI();

    // Initial render
    renderWorkers();
  }

  init();
})();

