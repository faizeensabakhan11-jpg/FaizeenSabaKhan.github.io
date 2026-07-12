// --- Global Variables & Initialization ---
let portfolioData = null;
const LOCAL_STORAGE_KEY = 'fsn_portfolio_data';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Load Theme
  initTheme();
  
  // Check Admin Access (Hidden Edit Mode)
  checkAdminAccess();
  
  // Fetch Portfolio Data
  await loadPortfolioData();
  
  // Render Everything
  renderAll();
  
  // Initialize Interactions (Typewriter, Nav menu, Modal, Filters)
  initInteractions();
  
  // Initialize Admin Panel Forms & Logic
  initAdminDashboard();
}

// --- Admin Access Verification (Edit Mode Hiding) ---
function checkAdminAccess() {
  const adminToggle = document.getElementById('admin-toggle');
  if (!adminToggle) return;

  // 1. Check for ?edit=true URL Query Parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit') === 'true') {
    localStorage.setItem('admin_authorized', 'true');
    // Clean up URL parameter cleanly
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 2. Check if authorized in localStorage
  if (localStorage.getItem('admin_authorized') === 'true') {
    adminToggle.classList.add('visible');
  }

  // 3. Secret Keyboard Shortcut: Ctrl + Shift + E to toggle Edit Mode visibility
  document.addEventListener('keydown', (e) => {
    // Check if Ctrl + Shift + E is pressed
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      const isAuthorized = localStorage.getItem('admin_authorized') === 'true';
      if (isAuthorized) {
        localStorage.removeItem('admin_authorized');
        adminToggle.classList.remove('visible');
        showLocalToast('Edit Mode deactivated and hidden.');
      } else {
        localStorage.setItem('admin_authorized', 'true');
        adminToggle.classList.add('visible');
        showLocalToast('Edit Mode activated! "Edit Mode" button is now visible.');
      }
    }
  });
}

// --- Theme Management ---
function initTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  
  // Default to Dark Mode if not set
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  }

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
      body.classList.replace('dark-mode', 'light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.replace('light-mode', 'dark-mode');
      localStorage.setItem('theme', 'dark');
    }
  });
}

// --- Data Loading ---
async function loadPortfolioData() {
  const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cachedData) {
    try {
      portfolioData = JSON.parse(cachedData);
      console.log('Loaded data from localStorage.');
      return;
    } catch (e) {
      console.error('Error parsing cached data, fetching defaults...', e);
    }
  }

  // Fallback to portfolio-data.json
  try {
    const response = await fetch('portfolio-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    portfolioData = await response.json();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(portfolioData));
    console.log('Loaded default data from portfolio-data.json.');
  } catch (error) {
    console.error('Failed to fetch portfolio-data.json:', error);
    // Hardcoded fallback data in case of fetch errors (e.g. running file directly)
    portfolioData = getHardcodedFallback();
  }
}

// --- Rendering Engine ---
function renderAll() {
  if (!portfolioData) return;
  
  renderHero(portfolioData);
  renderAbout(portfolioData);
  renderEducation(portfolioData);
  renderExperience(portfolioData);
  renderProjects(portfolioData);
  renderSkills(portfolioData);
  renderPublications(portfolioData);
  
  // Re-run Lucide Icons rendering
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderHero(data) {
  document.getElementById('hero-name').textContent = data.name || 'Faizeen Saba Naz';
  document.getElementById('hero-about-preview').textContent = data.about || '';
  
  // Update links
  const contact = data.contact || {};
  const linkGithub = document.getElementById('link-github');
  const linkLinkedin = document.getElementById('link-linkedin');
  const linkTwitter = document.getElementById('link-twitter');
  
  if (linkGithub && contact.github) linkGithub.href = contact.github;
  if (linkLinkedin && contact.linkedin) linkLinkedin.href = contact.linkedin;
  if (linkTwitter && contact.twitter) linkTwitter.href = contact.twitter;

  // Large social buttons in contact section
  const linkedinLarge = document.getElementById('linkedin-large-btn');
  if (linkedinLarge && contact.linkedin) linkedinLarge.href = contact.linkedin;

  // Profile Image URL
  const profileImg = document.getElementById('hero-profile-img');
  if (profileImg) {
    profileImg.src = contact.imgUrl || 'profile.jpg';
    profileImg.onerror = () => {
      profileImg.src = 'profile.jpg'; // fallback
    };
  }
}

function renderAbout(data) {
  document.getElementById('about-full-text').textContent = data.about || '';
  
  const contact = data.contact || {};
  document.getElementById('contact-email').textContent = contact.email || '';
  document.getElementById('contact-phone').textContent = contact.phone || '';
  document.getElementById('contact-location').textContent = contact.location || '';
}

function renderEducation(data) {
  const container = document.getElementById('education-container');
  if (!container) return;
  
  const education = data.education || [];
  container.innerHTML = education.map(edu => `
    <div class="edu-item">
      <div class="edu-degree">${escapeHTML(edu.degree)}</div>
      <div class="edu-school">${escapeHTML(edu.institution)}</div>
      <div class="edu-meta">
        <span>${escapeHTML(edu.period)}</span>
        <span>${escapeHTML(edu.gpa)}</span>
      </div>
    </div>
  `).join('');
}

function renderExperience(data) {
  const container = document.getElementById('experience-container');
  if (!container) return;
  
  const experience = data.experience || [];
  container.innerHTML = experience.map((exp, idx) => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-content card">
        <span class="timeline-date">${escapeHTML(exp.period)}</span>
        <h3 class="timeline-role">${escapeHTML(exp.role)}</h3>
        <h4 class="timeline-company">${escapeHTML(exp.company)} — ${escapeHTML(exp.location)}</h4>
        <ul class="timeline-list">
          ${(exp.description || []).map(bullet => `<li>${escapeHTML(bullet)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function renderProjects(data, filter = 'all', searchQuery = '') {
  const container = document.getElementById('projects-container');
  if (!container) return;
  
  let projects = data.projects || [];
  
  // Apply Tag Filter
  if (filter !== 'all') {
    projects = projects.filter(p => 
      p.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );
  }
  
  // Apply Text Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="colspan-2 text-center text-muted py-5" style="grid-column: 1 / -1; padding: 4rem 0;">
        <i data-lucide="folder-open" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No projects match your search criteria.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = projects.map(proj => `
    <div class="project-card card" data-id="${escapeHTML(proj.id)}">
      <div class="project-tags">
        ${proj.tags.slice(0, 3).map(tag => `<span class="project-tag">${escapeHTML(tag)}</span>`).join('')}
        ${proj.tags.length > 3 ? `<span class="project-tag">+${proj.tags.length - 3}</span>` : ''}
      </div>
      <h3 class="card-title">${escapeHTML(proj.title)}</h3>
      <p>${escapeHTML(proj.description)}</p>
      <div class="project-footer">
        <span>Read More Details</span>
        <i data-lucide="arrow-up-right" style="width: 18px; height: 18px;"></i>
      </div>
    </div>
  `).join('');

  // Add click events to open project details modal
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const projId = card.getAttribute('data-id');
      const project = (data.projects || []).find(p => p.id === projId);
      if (project) {
        openProjectModal(project);
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderSkills(data) {
  const container = document.getElementById('skills-container');
  if (!container) return;
  
  const skills = data.skills || [];
  container.innerHTML = skills.map(skillGroup => `
    <div class="skill-category-card card">
      <h3 class="card-title text-gradient">
        <i data-lucide="terminal"></i>
        <span>${escapeHTML(skillGroup.category)}</span>
      </h3>
      <div class="skills-list">
        ${skillGroup.items.map(skill => `<span class="skill-badge">${escapeHTML(skill)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderPublications(data) {
  const container = document.getElementById('publications-container');
  if (!container) return;
  
  const publications = data.publications || [];
  container.innerHTML = publications.map(pub => `
    <div class="pub-card card">
      <div class="pub-info">
        <h3 class="pub-title">${escapeHTML(pub.title)}</h3>
        <p class="pub-meta">
          <span class="pub-journal">${escapeHTML(pub.publisher)}</span> &bull; 
          <span class="pub-date">${escapeHTML(pub.period)}</span>
        </p>
      </div>
      <a href="${escapeHTML(pub.link)}" class="btn btn-secondary btn-sm" target="_blank" ${pub.link === '#' || !pub.link ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
        <i data-lucide="external-link"></i>
        <span>Paper</span>
      </a>
    </div>
  `).join('');
}

// --- Modals & Interactions ---
function initInteractions() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      // Slide panel animation in CSS if active
      if (navLinks.classList.contains('active')) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = 'var(--bg-color)';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderBottom = '1px solid var(--card-border)';
      } else {
        navLinks.style.display = '';
      }
    });
  }

  // Typewriter effect
  initTypewriter();

  // Project filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('project-search');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      const query = searchInput ? searchInput.value : '';
      renderProjects(portfolioData, filter, query);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      renderProjects(portfolioData, filter, e.target.value);
    });
  }

  // Contact Form Submission (Simulated save)
  const contactForm = document.getElementById('portfolio-contact-form');
  const successMsg = document.getElementById('form-success-msg');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const msgData = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        message: document.getElementById('form-message').value,
        timestamp: new Date().toISOString()
      };
      
      // Save message in local storage messages list
      const existingMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      existingMsgs.push(msgData);
      localStorage.setItem('portfolio_messages', JSON.stringify(existingMsgs));
      
      contactForm.classList.add('hide');
      successMsg.classList.remove('hide');
      
      setTimeout(() => {
        contactForm.reset();
        contactForm.classList.remove('hide');
        successMsg.classList.add('hide');
      }, 5000);
    });
  }

  // Project Modal Closures
  const projModal = document.getElementById('project-modal');
  const closeProjBtn = document.getElementById('close-modal');
  if (closeProjBtn && projModal) {
    closeProjBtn.addEventListener('click', () => projModal.classList.remove('active'));
    projModal.querySelector('.modal-overlay').addEventListener('click', () => projModal.classList.remove('active'));
  }
}

// Typewriter Execution
function initTypewriter() {
  const element = document.getElementById('typewriter');
  if (!element) return;
  
  const words = portfolioData.subtitles || ['AI/ML Engineer', 'Robotics Developer', 'Researcher'];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 150;

  function type() {
    const currentWord = words[wordIdx];
    if (isDeleting) {
      element.textContent = currentWord.substring(0, charIdx - 1);
      charIdx--;
      delay = 60;
    } else {
      element.textContent = currentWord.substring(0, charIdx + 1);
      charIdx++;
      delay = 120;
    }

    if (!isDeleting && charIdx === currentWord.length) {
      isDeleting = true;
      delay = 2000; // Pause at full word
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      delay = 500; // Pause before typing next word
    }

    setTimeout(type, delay);
  }

  type();
}

function openProjectModal(project) {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  document.getElementById('modal-project-title').textContent = project.title;
  document.getElementById('modal-project-desc').textContent = project.description;
  
  const tagsContainer = document.getElementById('modal-project-tags');
  tagsContainer.innerHTML = project.tags.map(t => `<span class="project-tag">${escapeHTML(t)}</span>`).join('');
  
  const detailsList = document.getElementById('modal-project-details');
  detailsList.innerHTML = (project.details || []).map(pt => `<li>${escapeHTML(pt)}</li>`).join('');
  
  modal.classList.add('active');
}

// --- Admin Panel (Dashboard) Logic ---
function initAdminDashboard() {
  const adminToggle = document.getElementById('admin-toggle');
  const adminModal = document.getElementById('admin-modal');
  const closeAdminBtn = document.getElementById('close-admin');
  const saveAdminBtn = document.getElementById('save-admin-btn');
  const resetLocalBtn = document.getElementById('reset-local-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  
  if (!adminModal) return;

  // Toggle dashboard open
  if (adminToggle) {
    adminToggle.addEventListener('click', () => {
      loadDataIntoAdminForms();
      adminModal.classList.add('active');
    });
  }

  // Close dashboard
  if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));
    adminModal.querySelector('.modal-overlay').addEventListener('click', () => adminModal.classList.remove('active'));
  }

  // Tab switching
  const tabs = adminModal.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const contents = adminModal.querySelectorAll('.tab-content');
      contents.forEach(c => c.classList.remove('active'));
      
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Save changes
  if (saveAdminBtn) {
    saveAdminBtn.addEventListener('click', () => {
      saveAdminFormsData();
      adminModal.classList.remove('active');
      renderAll();
      showLocalToast('Changes saved and refreshed!');
    });
  }

  // Reset defaults
  if (resetLocalBtn) {
    resetLocalBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to discard your edits and restore defaults? This resets localStorage.')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        loadPortfolioData().then(() => {
          renderAll();
          adminModal.classList.remove('active');
          showLocalToast('Reset to default content.');
        });
      }
    });
  }

  // Export JSON
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      // Re-compile data in case they didn't press "Save Changes" first
      const dataToExport = compileAdminData();
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Dynamic Add Item triggers
  setupDynamicAddButtons();
}

function loadDataIntoAdminForms() {
  const data = portfolioData;
  if (!data) return;

  // Profile Tab
  document.getElementById('admin-name').value = data.name || '';
  document.getElementById('admin-title').value = data.title || '';
  document.getElementById('admin-about').value = data.about || '';
  
  const contact = data.contact || {};
  document.getElementById('admin-email').value = contact.email || '';
  document.getElementById('admin-phone').value = contact.phone || '';
  document.getElementById('admin-location').value = contact.location || '';
  document.getElementById('admin-github').value = contact.github || '';
  document.getElementById('admin-linkedin').value = contact.linkedin || '';
  document.getElementById('admin-twitter').value = contact.twitter || '';
  document.getElementById('admin-img-url').value = contact.imgUrl || 'profile.jpg';

  // Skills Tab
  renderAdminSkillsList(data.skills || []);

  // Experience Tab
  renderAdminExperienceList(data.experience || []);

  // Projects Tab
  renderAdminProjectsList(data.projects || []);

  // Education Tab
  renderAdminEducationList(data.education || []);

  // Publications Tab
  renderAdminPublicationsList(data.publications || []);

  // Refresh lucide icons inside form list items
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- Admin Sub-Section Renders ---
function renderAdminSkillsList(skills) {
  const container = document.getElementById('admin-skills-list');
  container.innerHTML = skills.map((skillGroup, idx) => `
    <div class="admin-list-item" data-index="${idx}">
      <button class="admin-item-delete" onclick="deleteAdminSkillGroup(${idx})"><i data-lucide="trash-2"></i></button>
      <div class="form-group mb-2">
        <label>Skill Category Title</label>
        <input type="text" class="admin-skill-category" value="${escapeHTML(skillGroup.category)}">
      </div>
      <div class="form-group">
        <label>Skills (comma separated)</label>
        <input type="text" class="admin-skill-items" value="${escapeHTML(skillGroup.items.join(', '))}">
      </div>
    </div>
  `).join('');
}

function renderAdminExperienceList(experience) {
  const container = document.getElementById('admin-experience-list');
  container.innerHTML = experience.map((exp, idx) => `
    <div class="admin-list-item" data-index="${idx}">
      <button class="admin-item-delete" onclick="deleteAdminExperience(${idx})"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group">
          <label>Role</label>
          <input type="text" class="admin-exp-role" value="${escapeHTML(exp.role)}">
        </div>
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="admin-exp-company" value="${escapeHTML(exp.company)}">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="admin-exp-location" value="${escapeHTML(exp.location)}">
        </div>
        <div class="form-group">
          <label>Period</label>
          <input type="text" class="admin-exp-period" value="${escapeHTML(exp.period)}">
        </div>
        <div class="form-group colspan-2">
          <label>Contributions (one bullet per line)</label>
          <textarea class="admin-exp-description" rows="4">${escapeHTML((exp.description || []).join('\n'))}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

function renderAdminProjectsList(projects) {
  const container = document.getElementById('admin-projects-list');
  container.innerHTML = projects.map((proj, idx) => `
    <div class="admin-list-item" data-index="${idx}">
      <button class="admin-item-delete" onclick="deleteAdminProject(${idx})"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" class="admin-proj-title" value="${escapeHTML(proj.title)}">
        </div>
        <div class="form-group">
          <label>Project ID (unique lowercase key)</label>
          <input type="text" class="admin-proj-id" value="${escapeHTML(proj.id)}">
        </div>
        <div class="form-group colspan-2">
          <label>Technologies / Tags (comma separated)</label>
          <input type="text" class="admin-proj-tags" value="${escapeHTML(proj.tags.join(', '))}">
        </div>
        <div class="form-group colspan-2">
          <label>Short Summary Description</label>
          <input type="text" class="admin-proj-desc" value="${escapeHTML(proj.description)}">
        </div>
        <div class="form-group colspan-2">
          <label>Detailed Achievements & Accuracies (one bullet per line)</label>
          <textarea class="admin-proj-details" rows="4">${escapeHTML((proj.details || []).join('\n'))}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

function renderAdminEducationList(education) {
  const container = document.getElementById('admin-education-list');
  container.innerHTML = education.map((edu, idx) => `
    <div class="admin-list-item" data-index="${idx}">
      <button class="admin-item-delete" onclick="deleteAdminEducation(${idx})"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group">
          <label>Degree / Certificate</label>
          <input type="text" class="admin-edu-degree" value="${escapeHTML(edu.degree)}">
        </div>
        <div class="form-group">
          <label>School / University</label>
          <input type="text" class="admin-edu-institution" value="${escapeHTML(edu.institution)}">
        </div>
        <div class="form-group">
          <label>Period</label>
          <input type="text" class="admin-edu-period" value="${escapeHTML(edu.period)}">
        </div>
        <div class="form-group">
          <label>GPA / Marks Score</label>
          <input type="text" class="admin-edu-gpa" value="${escapeHTML(edu.gpa)}">
        </div>
      </div>
    </div>
  `).join('');
}

function renderAdminPublicationsList(publications) {
  const container = document.getElementById('admin-publications-list');
  container.innerHTML = publications.map((pub, idx) => `
    <div class="admin-list-item" data-index="${idx}">
      <button class="admin-item-delete" onclick="deleteAdminPublication(${idx})"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group colspan-2">
          <label>Paper Title</label>
          <input type="text" class="admin-pub-title" value="${escapeHTML(pub.title)}">
        </div>
        <div class="form-group">
          <label>Journal / Conference / Publisher</label>
          <input type="text" class="admin-pub-publisher" value="${escapeHTML(pub.publisher)}">
        </div>
        <div class="form-group">
          <label>Period / Date</label>
          <input type="text" class="admin-pub-period" value="${escapeHTML(pub.period)}">
        </div>
        <div class="form-group colspan-2">
          <label>Publication Document URL Link</label>
          <input type="text" class="admin-pub-link" value="${escapeHTML(pub.link)}">
        </div>
      </div>
    </div>
  `).join('');
}

// --- Admin Actions Handling ---
function setupDynamicAddButtons() {
  document.getElementById('add-skill-cat-btn').addEventListener('click', () => {
    const list = document.getElementById('admin-skills-list');
    const newDiv = document.createElement('div');
    newDiv.className = 'admin-list-item';
    newDiv.innerHTML = `
      <button class="admin-item-delete" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
      <div class="form-group mb-2">
        <label>Skill Category Title</label>
        <input type="text" class="admin-skill-category" placeholder="e.g. Programming Languages">
      </div>
      <div class="form-group">
        <label>Skills (comma separated)</label>
        <input type="text" class="admin-skill-items" placeholder="e.g. Python, Java, Go">
      </div>
    `;
    list.appendChild(newDiv);
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById('add-exp-btn').addEventListener('click', () => {
    const list = document.getElementById('admin-experience-list');
    const newDiv = document.createElement('div');
    newDiv.className = 'admin-list-item';
    newDiv.innerHTML = `
      <button class="admin-item-delete" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group">
          <label>Role</label>
          <input type="text" class="admin-exp-role" placeholder="e.g. Senior Machine Learning Engineer">
        </div>
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="admin-exp-company" placeholder="e.g. Google Research">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="admin-exp-location" placeholder="e.g. Bengaluru, India">
        </div>
        <div class="form-group">
          <label>Period</label>
          <input type="text" class="admin-exp-period" placeholder="e.g. Aug 2026 - Present">
        </div>
        <div class="form-group colspan-2">
          <label>Contributions (one bullet per line)</label>
          <textarea class="admin-exp-description" rows="4" placeholder="Implemented pipeline...&#10;Integrated system..."></textarea>
        </div>
      </div>
    `;
    list.appendChild(newDiv);
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById('add-project-btn').addEventListener('click', () => {
    const list = document.getElementById('admin-projects-list');
    const newDiv = document.createElement('div');
    newDiv.className = 'admin-list-item';
    newDiv.innerHTML = `
      <button class="admin-item-delete" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" class="admin-proj-title" placeholder="Project Name">
        </div>
        <div class="form-group">
          <label>Project ID (unique lowercase key)</label>
          <input type="text" class="admin-proj-id" placeholder="project-slug-id">
        </div>
        <div class="form-group colspan-2">
          <label>Technologies / Tags (comma separated)</label>
          <input type="text" class="admin-proj-tags" placeholder="Python, PyTorch, CNN">
        </div>
        <div class="form-group colspan-2">
          <label>Short Summary Description</label>
          <input type="text" class="admin-proj-desc" placeholder="Brief summary of what project did">
        </div>
        <div class="form-group colspan-2">
          <label>Detailed Achievements & Accuracies (one bullet per line)</label>
          <textarea class="admin-proj-details" rows="4" placeholder="Built system X...&#10;Achieved accuracy 99%..."></textarea>
        </div>
      </div>
    `;
    list.appendChild(newDiv);
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById('add-edu-btn').addEventListener('click', () => {
    const list = document.getElementById('admin-education-list');
    const newDiv = document.createElement('div');
    newDiv.className = 'admin-list-item';
    newDiv.innerHTML = `
      <button class="admin-item-delete" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group">
          <label>Degree / Certificate</label>
          <input type="text" class="admin-edu-degree" placeholder="e.g. Master of Science">
        </div>
        <div class="form-group">
          <label>School / University</label>
          <input type="text" class="admin-edu-institution" placeholder="e.g. IIT Delhi">
        </div>
        <div class="form-group">
          <label>Period</label>
          <input type="text" class="admin-edu-period" placeholder="e.g. 2024 - 2026">
        </div>
        <div class="form-group">
          <label>GPA / Marks Score</label>
          <input type="text" class="admin-edu-gpa" placeholder="e.g. CGPA: 9.2/10">
        </div>
      </div>
    `;
    list.appendChild(newDiv);
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById('add-pub-btn').addEventListener('click', () => {
    const list = document.getElementById('admin-publications-list');
    const newDiv = document.createElement('div');
    newDiv.className = 'admin-list-item';
    newDiv.innerHTML = `
      <button class="admin-item-delete" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
      <div class="form-grid">
        <div class="form-group colspan-2">
          <label>Paper Title</label>
          <input type="text" class="admin-pub-title" placeholder="Research paper name">
        </div>
        <div class="form-group">
          <label>Journal / Conference / Publisher</label>
          <input type="text" class="admin-pub-publisher" placeholder="e.g. IEEE Transactions on Medical Imaging">
        </div>
        <div class="form-group">
          <label>Period / Date</label>
          <input type="text" class="admin-pub-period" placeholder="e.g. December 2025">
        </div>
        <div class="form-group colspan-2">
          <label>Publication Document URL Link</label>
          <input type="text" class="admin-pub-link" placeholder="https://doi.org/...">
        </div>
      </div>
    `;
    list.appendChild(newDiv);
    if (window.lucide) window.lucide.createIcons();
  });
}

// Window globally-exposed actions for dynamic lists delete
window.deleteAdminSkillGroup = function(idx) {
  const item = document.querySelector(`#admin-skills-list .admin-list-item[data-index="${idx}"]`);
  if (item) item.remove();
};

window.deleteAdminExperience = function(idx) {
  const item = document.querySelector(`#admin-experience-list .admin-list-item[data-index="${idx}"]`);
  if (item) item.remove();
};

window.deleteAdminProject = function(idx) {
  const item = document.querySelector(`#admin-projects-list .admin-list-item[data-index="${idx}"]`);
  if (item) item.remove();
};

window.deleteAdminEducation = function(idx) {
  const item = document.querySelector(`#admin-education-list .admin-list-item[data-index="${idx}"]`);
  if (item) item.remove();
};

window.deleteAdminPublication = function(idx) {
  const item = document.querySelector(`#admin-publications-list .admin-list-item[data-index="${idx}"]`);
  if (item) item.remove();
};

function compileAdminData() {
  const data = {};
  
  // Profile
  data.name = document.getElementById('admin-name').value;
  data.title = document.getElementById('admin-title').value;
  data.about = document.getElementById('admin-about').value;
  
  data.subtitles = (portfolioData && portfolioData.subtitles) || ["AI/ML Engineer", "Robotics AI Developer", "Research Scholar"];
  if (data.title && !data.subtitles.includes(data.title)) {
    data.subtitles = [data.title, ...data.subtitles.slice(1)];
  }

  data.contact = {
    email: document.getElementById('admin-email').value,
    phone: document.getElementById('admin-phone').value,
    location: document.getElementById('admin-location').value,
    github: document.getElementById('admin-github').value,
    linkedin: document.getElementById('admin-linkedin').value,
    twitter: document.getElementById('admin-twitter').value,
    imgUrl: document.getElementById('admin-img-url').value
  };

  // Skills
  data.skills = [];
  document.querySelectorAll('#admin-skills-list .admin-list-item').forEach(item => {
    const category = item.querySelector('.admin-skill-category').value;
    const itemsText = item.querySelector('.admin-skill-items').value;
    if (category) {
      data.skills.push({
        category: category,
        items: itemsText.split(',').map(s => s.trim()).filter(s => s)
      });
    }
  });

  // Experience
  data.experience = [];
  document.querySelectorAll('#admin-experience-list .admin-list-item').forEach(item => {
    const role = item.querySelector('.admin-exp-role').value;
    const company = item.querySelector('.admin-exp-company').value;
    const location = item.querySelector('.admin-exp-location').value;
    const period = item.querySelector('.admin-exp-period').value;
    const descText = item.querySelector('.admin-exp-description').value;
    
    if (role && company) {
      data.experience.push({
        role: role,
        company: company,
        location: location,
        period: period,
        description: descText.split('\n').map(l => l.trim()).filter(l => l)
      });
    }
  });

  // Projects
  data.projects = [];
  document.querySelectorAll('#admin-projects-list .admin-list-item').forEach(item => {
    const title = item.querySelector('.admin-proj-title').value;
    const id = item.querySelector('.admin-proj-id').value;
    const tagsText = item.querySelector('.admin-proj-tags').value;
    const desc = item.querySelector('.admin-proj-desc').value;
    const detailsText = item.querySelector('.admin-proj-details').value;
    
    if (title && id) {
      data.projects.push({
        id: id,
        title: title,
        tags: tagsText.split(',').map(t => t.trim()).filter(t => t),
        description: desc,
        details: detailsText.split('\n').map(l => l.trim()).filter(l => l)
      });
    }
  });

  // Education
  data.education = [];
  document.querySelectorAll('#admin-education-list .admin-list-item').forEach(item => {
    const degree = item.querySelector('.admin-edu-degree').value;
    const institution = item.querySelector('.admin-edu-institution').value;
    const period = item.querySelector('.admin-edu-period').value;
    const gpa = item.querySelector('.admin-edu-gpa').value;
    
    if (degree && institution) {
      data.education.push({
        degree: degree,
        institution: institution,
        period: period,
        gpa: gpa
      });
    }
  });

  // Publications
  data.publications = [];
  document.querySelectorAll('#admin-publications-list .admin-list-item').forEach(item => {
    const title = item.querySelector('.admin-pub-title').value;
    const publisher = item.querySelector('.admin-pub-publisher').value;
    const period = item.querySelector('.admin-pub-period').value;
    const link = item.querySelector('.admin-pub-link').value;
    
    if (title && publisher) {
      data.publications.push({
        title: title,
        publisher: publisher,
        period: period,
        link: link || '#'
      });
    }
  });

  return data;
}

function saveAdminFormsData() {
  const updatedData = compileAdminData();
  portfolioData = updatedData;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(portfolioData));
}

// --- Utility Functions ---
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function showLocalToast(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.right = '2rem';
  toast.style.backgroundColor = 'var(--secondary)';
  toast.style.color = '#fff';
  toast.style.padding = '0.75rem 1.5rem';
  toast.style.borderRadius = '30px';
  toast.style.zIndex = '9999';
  toast.style.fontFamily = 'var(--font-heading)';
  toast.style.fontWeight = '600';
  toast.style.fontSize = '0.9rem';
  toast.style.boxShadow = '0 10px 20px rgba(20, 184, 166, 0.3)';
  toast.textContent = msg;
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Fallback dataset if everything fails (local browser direct launch without server)
function getHardcodedFallback() {
  return {
    "name": "Faizeen Saba Naz",
    "title": "AI/ML Engineer / Robotics AI Developer",
    "subtitles": ["AI/ML Engineer", "Robotics AI Developer", "Research Scholar"],
    "about": "AI/ML Engineer and M.Tech Computer Science postgraduate with hands-on experience in creating, fine-tuning, evaluating, and deploying machine learning, deep learning, and NLP models.",
    "contact": {
      "email": "faizeensabakhan@gmail.com",
      "phone": "+91 9354430271",
      "location": "New Delhi, India",
      "github": "#",
      "linkedin": "#",
      "twitter": "#"
    },
    "education": [],
    "skills": [],
    "experience": [],
    "projects": [],
    "publications": []
  };
}
