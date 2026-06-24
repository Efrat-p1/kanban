    // Mock Data for Initial Load if LocalStorage is empty (10 distinct mock tasks distributed across columns, some with dependencies)
    const nowTimestamp = Date.now();
    const id1 = (nowTimestamp - 3600000 * 3).toString(); // Database maintenance (To Do)
    const id2 = (nowTimestamp - 60000).toString(); // Redesign sidebar (Doing)
    const id3 = (nowTimestamp - 3600000 * 20).toString(); // Localize error boundary (Doing)
    const id4 = (nowTimestamp - 3600000 * 48).toString(); // Safari bug (Done)
    const id5 = (nowTimestamp - 3600000 * 12).toString(); // OAuth2 login (To Do) - depends on database index (id1) -> BLOCKED
    const id6 = (nowTimestamp - 3600000 * 2).toString(); // Redis cache (To Do)
    const id7 = (nowTimestamp - 3600000 * 36).toString(); // DB backups (Done)
    const id8 = (nowTimestamp - 3600000 * 4).toString(); // Integration tests (Doing) - depends on db backups (id7) -> UNBLOCKED
    const id9 = (nowTimestamp - 60000 * 5).toString(); // Upgrade tailwind (To Do)
    const id10 = (nowTimestamp - 3600000 * 8).toString(); // Patch package-lock (Done)

    const mockTasks = [
      {
        id: id1,
        updatedAt: id1,
        title: "Database index maintenance",
        description: "Analyze query execution plans and add secondary index to the 'users_transactions' table to speed up analytics queries.",
        assignee: "Alex Riviera",
        priority: "high",
        status: "To Do",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [{ timestamp: "2026-06-23 09:15", action: "Created task" }]
      },
      {
        id: id2,
        updatedAt: id2,
        title: "Redesign workspace sidebar layout",
        description: "Condense panel sizes, reduce borders, and implement drawer collapse logic to save vertical and horizontal pixel real estate.",
        assignee: "Jessica Chen",
        priority: "medium",
        status: "Doing",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [
          { timestamp: "2026-06-23 10:20", action: "Created task" },
          { timestamp: "2026-06-23 11:05", action: "Moved from To Do to Doing" }
        ]
      },
      {
        id: id3,
        updatedAt: id3,
        title: "Localize error boundary system",
        description: "Translate dynamic network-level exception error blocks. Standardize fallbacks across core client modules.",
        assignee: "Jessica Chen",
        priority: "low",
        status: "Doing",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [
          { timestamp: "2026-06-23 11:30", action: "Created task" },
          { timestamp: "2026-06-23 11:45", action: "Moved from To Do to Doing" }
        ]
      },
      {
        id: id4,
        updatedAt: id4,
        title: "Resolve safari grid rendering bug",
        description: "Safari v15 displays column wrap issues with flex containers. Set grid layouts with standard CSS values.",
        assignee: "Marcus Vance",
        priority: "high",
        status: "Done",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [
          { timestamp: "2026-06-23 08:30", action: "Created task" },
          { timestamp: "2026-06-23 08:45", action: "Moved from To Do to Doing" },
          { timestamp: "2026-06-23 15:30", action: "Moved from Doing to Done" }
        ]
      },
      {
        id: id5,
        updatedAt: id5,
        title: "Implement OAuth2 login flow",
        description: "Setup Google and GitHub identity provider redirects, token exchanges, and profile sync layers.",
        assignee: "David Kim",
        priority: "high",
        status: "To Do",
        archived: false,
        expanded: false,
        dependencies: [id1], // Depends on Task 1 (Database maintenance - To Do) -> BLOCKED
        history: [{ timestamp: "2026-06-23 11:00", action: "Created task" }]
      },
      {
        id: id6,
        updatedAt: id6,
        title: "Setup Redis cache layers",
        description: "Configure key-value store for session caching and dynamic homepage server responses.",
        assignee: "Alex Riviera",
        priority: "medium",
        status: "To Do",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [{ timestamp: "2026-06-23 21:00", action: "Created task" }]
      },
      {
        id: id7,
        updatedAt: id7,
        title: "Setup automatic database backups",
        description: "Write cron scripts to compress postgres data daily and push backups to AWS S3 storage buckets.",
        assignee: "David Kim",
        priority: "low",
        status: "Done",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [
          { timestamp: "2026-06-22 10:00", action: "Created task" },
          { timestamp: "2026-06-22 22:00", action: "Moved from To Do to Done" }
        ]
      },
      {
        id: id8,
        updatedAt: id8,
        title: "Write integration test suite for payment module",
        description: "Test checkout success redirects, payment webhook exceptions, and subscription trial logic.",
        assignee: "Marcus Vance",
        priority: "high",
        status: "Doing",
        archived: false,
        expanded: false,
        dependencies: [id7], // Depends on Task 7 (Database backups - Done) -> UNBLOCKED
        history: [
          { timestamp: "2026-06-23 19:00", action: "Created task" },
          { timestamp: "2026-06-23 21:30", action: "Moved from To Do to Doing" }
        ]
      },
      {
        id: id9,
        updatedAt: id9,
        title: "Upgrade Tailwind CSS play CDN configuration",
        description: "Update inline tailwind scripts to load custom plugins and compile themes faster.",
        assignee: "Jessica Chen",
        priority: "low",
        status: "To Do",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [{ timestamp: "2026-06-23 23:03", action: "Created task" }]
      },
      {
        id: id10,
        updatedAt: id10,
        title: "Patch package-lock vulnerability alerts",
        description: "Run npm audit to resolve critical security advisory path overrides on sub-dependency packages.",
        assignee: "David Kim",
        priority: "medium",
        status: "Done",
        archived: false,
        expanded: false,
        dependencies: [],
        history: [
          { timestamp: "2026-06-23 15:00", action: "Created task" },
          { timestamp: "2026-06-23 15:15", action: "Moved from To Do to Done" }
        ]
      }
    ];

    // App State
    let tasks = [];
    let activeDragTaskId = null;
    let taskToDeleteId = null;
    let isDeletingPermanently = false; 

    // Multi-select Filters State
    let activePriorities = ['low', 'medium', 'high'];
    let activeAssignees = []; 
    
    // Priority Colors Design System
    const priorityColors = {
      low: {
        border: 'border-l-emerald-500',
        badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/60',
        dot: 'bg-emerald-500'
      },
      medium: {
        border: 'border-l-amber-500',
        badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-800/60',
        dot: 'bg-amber-500'
      },
      high: {
        border: 'border-l-rose-500',
        badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-250 dark:border-rose-800/60',
        dot: 'bg-rose-500'
      }
    };

    // Assignee Avatar Colors Design System
    const avatarColors = [
      'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
      'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
      'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/60',
      'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/60'
    ];

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const filterPriorityContainer = document.getElementById('priority-filter-container');
    const filterAssigneeMenu = document.getElementById('assignee-dropdown-menu');
    const filterTimeSelect = document.getElementById('filter-time');
    const filterBlockedSelect = document.getElementById('filter-blocked');
    const sortBySelect = document.getElementById('sort-by');
    
    const columns = {
      'To Do': {
        list: document.getElementById('list-todo'),
        count: document.getElementById('count-todo')
      },
      'Doing': {
        list: document.getElementById('list-doing'),
        count: document.getElementById('count-doing')
      },
      'Done': {
        list: document.getElementById('list-done'),
        count: document.getElementById('count-done')
      }
    };

    // Initialize Application
    window.addEventListener('DOMContentLoaded', () => {
      loadTasks();
      setupEventListeners();
      setupKeyboardShortcuts();
      updatePriorityPillStyles();
      populateAssigneeDropdown();
      renderBoard();
    });

    // Event Listeners Setup
    function setupEventListeners() {
      searchInput.addEventListener('input', renderBoard);

      // Close dropdowns & modals when clicking backdrop
      document.getElementById('create-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeCreateModal();
      });
      document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDetailModal();
      });
      document.getElementById('archive-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeArchiveModal();
      });
      document.getElementById('delete-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) cancelDelete();
      });
      document.getElementById('dependency-error-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDependencyErrorModal();
      });

      // Close dropdowns on outer click
      document.addEventListener('click', (e) => {
        const actionsContainer = document.getElementById('board-actions-container');
        const actionsMenu = document.getElementById('board-actions-menu');
        if (actionsContainer && !actionsContainer.contains(e.target)) {
          actionsMenu.classList.add('hidden');
        }
      });
    }

    // Keyboard Shortcuts Setup (Efficiency Boost)
    function setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Close all modals on ESC (regardless of focus)
        if (e.key === 'Escape') {
          closeCreateModal();
          closeDetailModal();
          closeArchiveModal();
          cancelDelete();
          closeDependencyErrorModal();
          // Also close filters drawer on escape
          const drawer = document.getElementById('filters-drawer');
          if (drawer && !drawer.classList.contains('translate-x-full')) {
            toggleFilterPanel();
          }
          return;
        }

        // Ignore single-key shortcuts when typing inside form elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // "N" opens the Create Task Modal
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          openCreateModal();
        }
      });
    }

    // Toggle slide-out filter drawer
    function toggleFilterPanel(e) {
      if (e) e.stopPropagation();
      const drawer = document.getElementById('filters-drawer');
      const overlay = document.getElementById('filters-overlay');
      const btn = document.getElementById('toggle-filters-btn');
      
      const isOpen = !drawer.classList.contains('translate-x-full');
      if (isOpen) {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        btn.classList.remove('bg-zinc-150', 'border-zinc-300');
      } else {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        btn.classList.add('bg-zinc-150', 'border-zinc-300');
      }
    }

    // Toggle Actions Dropdown
    function toggleActionsDropdown(e) {
      e.stopPropagation();
      const menu = document.getElementById('board-actions-menu');
      menu.classList.toggle('hidden');
    }

    function closeActionsDropdown() {
      const menu = document.getElementById('board-actions-menu');
      if (menu) menu.classList.add('hidden');
    }

    // Helper: Hash function to assign distinct color-codes to assignee initials
    function getAvatarStyle(name) {
      if (!name) return avatarColors[0];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const idx = Math.abs(hash) % avatarColors.length;
      return avatarColors[idx];
    }

    // Helper: Get Initials of a name
    function getInitials(name) {
      if (!name) return '';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // Helper: Get Formatted Timestamp
    function getFormattedTimestamp() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // Load tasks from LocalStorage
    function loadTasks() {
      const stored = localStorage.getItem('lean_kanban_tasks_v7');
      if (stored) {
        try {
          tasks = JSON.parse(stored);
          tasks.forEach(t => {
            if (t.archived === undefined) t.archived = false;
            if (t.expanded === undefined) t.expanded = false;
            if (t.dependencies === undefined) t.dependencies = [];
          });
        } catch (e) {
          console.error("Error parsing localstorage tasks. Reverting to default.", e);
          tasks = [...mockTasks];
          saveTasks();
        }
      } else {
        tasks = [...mockTasks];
        saveTasks();
      }
    }

    // Save tasks to LocalStorage
    function saveTasks() {
      localStorage.setItem('lean_kanban_tasks_v7', JSON.stringify(tasks));
      
      // Update archive count badge
      const archivedCount = tasks.filter(t => t.archived).length;
      document.getElementById('archive-count').textContent = archivedCount;
    }

    // Multi-Select: Priority Pills
    function togglePriorityFilter(priority) {
      const idx = activePriorities.indexOf(priority);
      if (idx > -1) {
        activePriorities.splice(idx, 1);
      } else {
        activePriorities.push(priority);
      }
      updatePriorityPillStyles();
      renderBoard();
    }

    function updatePriorityPillStyles() {
      const priorities = ['low', 'medium', 'high'];
      const activeStyles = {
        low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/60 font-semibold',
        medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-800/60 font-semibold',
        high: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-250 dark:border-rose-800/60 font-semibold'
      };
      const inactiveStyles = 'bg-transparent text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-normal';

      priorities.forEach(p => {
        const pill = document.getElementById(`pill-${p}`);
        if (pill) {
          if (activePriorities.includes(p)) {
            pill.className = `flex-1 py-1 text-xs rounded border transition-all text-center ${activeStyles[p]}`;
          } else {
            pill.className = `flex-1 py-1 text-xs rounded border transition-all text-center ${inactiveStyles}`;
          }
        }
      });
    }

    // Dynamic Assignee checklist compilation in the drawer
    function populateAssigneeDropdown() {
      const allAssignees = Array.from(new Set(tasks.filter(t => !t.archived).map(t => t.assignee.trim()).filter(Boolean))).sort();
      
      activeAssignees = activeAssignees.filter(a => allAssignees.includes(a) || a === '__none__');
      filterAssigneeMenu.innerHTML = '';

      if (allAssignees.length === 0) {
        filterAssigneeMenu.innerHTML = '<div class="text-[11px] text-zinc-400 text-center py-2">No assignees available</div>';
        return;
      }

      // 1. Select All Checkbox
      const selectAllDiv = document.createElement('div');
      selectAllDiv.className = 'flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 rounded cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1';
      const isAllSelected = activeAssignees.length === 0;
      selectAllDiv.innerHTML = `
        <input type="checkbox" id="assignee-select-all" ${isAllSelected ? 'checked' : ''} class="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-650 focus:ring-indigo-500 cursor-pointer">
        <label for="assignee-select-all" class="cursor-pointer select-none flex-1">Select All</label>
      `;
      selectAllDiv.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          activeAssignees = [];
        } else {
          activeAssignees = ['__none__']; 
        }
        populateAssigneeDropdown();
        renderBoard();
      });
      filterAssigneeMenu.appendChild(selectAllDiv);

      // 2. Individual Assignees
      allAssignees.forEach(assignee => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center gap-2 px-2 py-1 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 rounded cursor-pointer text-xs text-zinc-650 dark:text-zinc-400';
        
        const isChecked = activeAssignees.length === 0 || activeAssignees.includes(assignee);
        itemDiv.innerHTML = `
          <input type="checkbox" id="assignee-check-${assignee.replace(/\s+/g, '-')}" ${isChecked ? 'checked' : ''} value="${assignee}" class="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-650 focus:ring-indigo-500 cursor-pointer">
          <label for="assignee-check-${assignee.replace(/\s+/g, '-')}" class="cursor-pointer select-none flex-1 truncate">${escapeHTML(assignee)}</label>
        `;

        itemDiv.querySelector('input').addEventListener('change', (e) => {
          const val = e.target.value;
          if (activeAssignees.length === 0) {
            activeAssignees = allAssignees.filter(a => a !== val);
          } else {
            activeAssignees = activeAssignees.filter(a => a !== '__none__');
            const idx = activeAssignees.indexOf(val);
            if (idx > -1) {
              activeAssignees.splice(idx, 1);
            } else {
              activeAssignees.push(val);
            }
          }

          if (activeAssignees.length === allAssignees.length || activeAssignees.length === 0) {
            activeAssignees = [];
          } else if (activeAssignees.length === 0) {
            activeAssignees = ['__none__'];
          }

          populateAssigneeDropdown();
          renderBoard();
        });

        filterAssigneeMenu.appendChild(itemDiv);
      });
    }

    // Reset All Active Filters
    function clearAllFilters() {
      searchInput.value = '';
      activePriorities = ['low', 'medium', 'high'];
      activeAssignees = [];
      filterTimeSelect.value = 'all';
      filterBlockedSelect.value = 'all';
      sortBySelect.value = 'manual';

      updatePriorityPillStyles();
      populateAssigneeDropdown();
      renderBoard();
    }

    // Wipe Board (Hard reset)
    function wipeBoard() {
      if (confirm("Are you sure you want to permanently delete all tasks (including archived ones)? This action cannot be undone and will clear the board memory.")) {
        tasks = [];
        saveTasks();
        populateAssigneeDropdown();
        renderBoard();
      }
    }

    // Load Demo Data (Reset to initial 10 tasks)
    function loadDemoData() {
      if (confirm("Are you sure you want to load the 10 demo tasks? This will overwrite your current board state.")) {
        tasks = JSON.parse(JSON.stringify(mockTasks));
        saveTasks();
        populateAssigneeDropdown();
        renderBoard();
      }
    }

    // Bulk Expand / Collapse tasks
    function expandAllTasks(expanded) {
      tasks.forEach(t => {
        t.expanded = expanded;
      });
      saveTasks();
      renderBoard();
    }

    // Task dependency checker (returns list of uncompleted blocking task titles)
    function checkDependenciesCompleted(task) {
      const deps = task.dependencies || [];
      const uncompleted = [];

      deps.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (!depTask || depTask.archived || depTask.status !== 'Done') {
          uncompleted.push(depTask ? depTask.title : `Unknown Task (#${depId})`);
        }
      });

      return uncompleted;
    }

    function isTaskBlocked(task) {
      if (task.status === 'Done') return false; // Done tasks are never blocked
      return checkDependenciesCompleted(task).length > 0;
    }

    // Dependency Warning Fatal Modal
    function showDependencyError(taskTitle, blockingTitles) {
      document.getElementById('blocked-task-title').textContent = taskTitle;
      const list = document.getElementById('blocking-tasks-list');
      list.innerHTML = '';
      blockingTitles.forEach(title => {
        const li = document.createElement('li');
        li.textContent = title;
        list.appendChild(li);
      });
      const modal = document.getElementById('dependency-error-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeDependencyErrorModal() {
      const modal = document.getElementById('dependency-error-modal');
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }

    // Render Kanban Board Cards
    function renderBoard() {
      const searchQuery = searchInput.value.toLowerCase().trim();
      const sortBy = sortBySelect.value;
      const timeFilter = filterTimeSelect.value;
      const blockedFilter = filterBlockedSelect.value;
      const now = Date.now();

      // Ensure archive count badge is set on render
      const archivedCount = tasks.filter(t => t.archived).length;
      document.getElementById('archive-count').textContent = archivedCount;

      // 1. Filter tasks (Hide archived tasks from the board)
      const filtered = tasks.filter(task => {
        if (task.archived) return false;

        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                              task.description.toLowerCase().includes(searchQuery) || 
                              task.assignee.toLowerCase().includes(searchQuery);
        
        const matchesPriority = activePriorities.includes(task.priority);
        const matchesAssignee = activeAssignees.length === 0 || activeAssignees.includes(task.assignee);
        
        // Time Filter logic
        let matchesTime = true;
        if (timeFilter !== 'all') {
          const createdTime = Number(task.id);
          const updatedTime = Number(task.updatedAt || task.id);
          const timeDiffCreated = now - createdTime;
          const timeDiffUpdated = now - updatedTime;

          if (timeFilter === 'created-2m') {
            matchesTime = timeDiffCreated <= 2 * 60 * 1000;
          } else if (timeFilter === 'created-1h') {
            matchesTime = timeDiffCreated <= 60 * 60 * 1000;
          } else if (timeFilter === 'created-1d') {
            matchesTime = timeDiffCreated <= 24 * 60 * 60 * 1000;
          } else if (timeFilter === 'updated-2m') {
            matchesTime = timeDiffUpdated <= 2 * 60 * 1000;
          } else if (timeFilter === 'updated-1h') {
            matchesTime = timeDiffUpdated <= 60 * 60 * 1000;
          } else if (timeFilter === 'updated-1d') {
            matchesTime = timeDiffUpdated <= 24 * 60 * 60 * 1000;
          }
        }
        
         // Blocked Filter logic
        let matchesBlocked = true;
        if (blockedFilter !== 'all') {
          const isBlocked = isTaskBlocked(task);
          if (blockedFilter === 'blocked') {
            matchesBlocked = isBlocked;
          } else if (blockedFilter === 'unblocked') {
            matchesBlocked = !isBlocked;
          }
        }
        
        return matchesSearch && matchesPriority && matchesAssignee && matchesTime && matchesBlocked;
      });

      // Show/Hide Reset filters button dynamically
      const isFiltersActive = searchQuery !== '' || 
                             activePriorities.length < 3 || 
                             activeAssignees.length > 0 || 
                             timeFilter !== 'all' || 
                             blockedFilter !== 'all' || 
                             sortBy !== 'manual';
      
      const resetBtn = document.getElementById('clear-filters-btn');
      if (isFiltersActive) {
        resetBtn.classList.remove('hidden');
      } else {
        resetBtn.classList.add('hidden');
      }

      // Update filters active badge
      const activeBadge = document.getElementById('active-filters-badge');
      if (activeBadge) {
        if (isFiltersActive) {
          activeBadge.classList.remove('hidden');
        } else {
          activeBadge.classList.add('hidden');
        }
      }

      // 2. Sort tasks
      const sorted = [...filtered];
      if (sortBy === 'priority-desc') {
        const weight = { high: 3, medium: 2, low: 1 };
        sorted.sort((a, b) => weight[b.priority] - weight[a.priority]);
      } else if (sortBy === 'priority-asc') {
        const weight = { high: 3, medium: 2, low: 1 };
        sorted.sort((a, b) => weight[a.priority] - weight[b.priority]);
      } else if (sortBy === 'title-asc') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'assignee-asc') {
        sorted.sort((a, b) => a.assignee.localeCompare(b.assignee));
      } else if (sortBy === 'created-desc') {
        sorted.sort((a, b) => Number(b.id) - Number(a.id));
      } else if (sortBy === 'created-asc') {
        sorted.sort((a, b) => Number(a.id) - Number(b.id));
      } else if (sortBy === 'blocked-first') {
        sorted.sort((a, b) => {
          const aBlocked = isTaskBlocked(a) ? 1 : 0;
          const bBlocked = isTaskBlocked(b) ? 1 : 0;
          return bBlocked - aBlocked;
        });
      } else if (sortBy === 'unblocked-first') {
        sorted.sort((a, b) => {
          const aBlocked = isTaskBlocked(a) ? 1 : 0;
          const bBlocked = isTaskBlocked(b) ? 1 : 0;
          return aBlocked - bBlocked;
        });
      }

      // 3. Group tasks by status
      const grouped = {
        'To Do': [],
        'Doing': [],
        'Done': []
      };
      
      sorted.forEach(task => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        } else {
          task.status = 'To Do';
          grouped['To Do'].push(task);
        }
      });

      // 4. Render DOM cards
      Object.keys(columns).forEach(status => {
        const columnData = columns[status];
        columnData.list.innerHTML = '';
        columnData.count.textContent = grouped[status].length;

        if (grouped[status].length === 0) {
          const empty = document.createElement('div');
          empty.className = 'py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg select-none bg-white/40 dark:bg-zinc-900/40';
          empty.textContent = 'No tasks in this category';
          columnData.list.appendChild(empty);
          return;
        }

        grouped[status].forEach(task => {
          if (task.expanded === undefined) task.expanded = false;

          const card = document.createElement('div');
          card.id = `task-card-${task.id}`;
          card.className = `task-card bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 border-l-4 ${priorityColors[task.priority].border} rounded-lg ${task.expanded ? 'p-2.5' : 'p-2'} cursor-grab active:cursor-grabbing hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-[1px] transition-all duration-150 relative group`;
          card.draggable = true;
          
          card.addEventListener('dragstart', (e) => handleDragStart(e, task.id));
          card.addEventListener('dragend', handleDragEnd);
          card.addEventListener('click', () => openDetailModal(task.id));

          const userAvatarStyle = getAvatarStyle(task.assignee);
          const isBlocked = isTaskBlocked(task);

          // Render collapsed vs expanded layout (Compact Mode)
          if (task.expanded) {
            card.innerHTML = `
              <div class="task-card-content space-y-1.5">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-250 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors leading-tight line-clamp-2">${escapeHTML(task.title)}</h3>
                  <button type="button" class="chevron-toggle text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 shrink-0 focus:outline-none transition-colors" title="Collapse card">
                    <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </button>
                </div>
                
                ${task.description.trim() ? `
                  <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">${escapeHTML(task.description)}</p>
                ` : ''}

                <div class="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 mt-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-3.5 h-3.5 rounded-full ${userAvatarStyle} border flex items-center justify-center text-[9px] font-bold shrink-0" title="${escapeHTML(task.assignee)}">
                      ${escapeHTML(getInitials(task.assignee))}
                    </span>
                    <span class="text-[10px] text-zinc-500 dark:text-zinc-450 max-w-[80px] truncate" title="${escapeHTML(task.assignee)}">${escapeHTML(task.assignee)}</span>
                  </div>
                  
                  <div class="flex items-center gap-1.5">
                    ${isBlocked ? `
                      <span class="text-[9px] text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5" title="Blocked by dependencies">
                        🔒 Blocked
                      </span>
                    ` : ''}
                    <span class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${priorityColors[task.priority].badge}">
                      ${task.priority}
                    </span>
                  </div>
                </div>
              </div>
            `;
          } else {
            // Collapsed view: extremely compact
            card.innerHTML = `
              <div class="task-card-content flex items-center justify-between gap-2">
                <span class="w-1.5 h-1.5 rounded-full ${priorityColors[task.priority].dot} shrink-0"></span>
                <h3 class="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate flex-1 leading-tight select-none flex items-center gap-1">
                  ${isBlocked ? '<span class="text-rose-600 dark:text-rose-450 text-[10px] shrink-0" title="Blocked by dependencies">🔒</span>' : ''}
                  ${escapeHTML(task.title)}
                </h3>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="w-3.5 h-3.5 rounded-full ${userAvatarStyle} border flex items-center justify-center text-[8px] font-bold shrink-0" title="${escapeHTML(task.assignee)}">
                    ${escapeHTML(getInitials(task.assignee))}
                  </span>
                  <button type="button" class="chevron-toggle text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none transition-colors" title="Expand card">
                    <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            `;
          }

          // Attach toggle event to chevron icon
          card.querySelector('.chevron-toggle').addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid modal popup
            task.expanded = !task.expanded;
            saveTasks();
            renderBoard();
          });

          columnData.list.appendChild(card);
        });
      });
    }

    // Escape HTML to prevent XSS
    function escapeHTML(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // NATIVE DRAG & DROP HANDLERS

    function handleDragStart(e, taskId) {
      activeDragTaskId = taskId;
      document.body.classList.add('dragging-active');
      
      const card = document.getElementById(`task-card-${taskId}`);
      if (card) {
        setTimeout(() => {
          card.classList.add('opacity-40');
        }, 0);
      }
      
      e.dataTransfer.setData('text/plain', taskId);
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd() {
      document.body.classList.remove('dragging-active');
      
      if (activeDragTaskId) {
        const card = document.getElementById(`task-card-${activeDragTaskId}`);
        if (card) {
          card.classList.remove('opacity-40');
        }
      }
      activeDragTaskId = null;
    }

    function handleDragOver(e) {
      e.preventDefault();
      const col = e.currentTarget;
      if (!col.classList.contains('drag-hover')) {
        col.classList.add('drag-hover');
      }
    }

    function handleDragLeave(e) {
      const col = e.currentTarget;
      if (e.relatedTarget && col.contains(e.relatedTarget)) {
        return;
      }
      col.classList.remove('drag-hover');
    }

    function handleDrop(e, targetStatus) {
      e.preventDefault();
      const col = e.currentTarget;
      col.classList.remove('drag-hover');

      const taskId = e.dataTransfer.getData('text/plain');
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        const oldStatus = task.status;
        if (oldStatus !== targetStatus) {
          // Dependency constraint logic: moving to Doing or Done
          if (targetStatus === 'Doing' || targetStatus === 'Done') {
            const blocking = checkDependenciesCompleted(task);
            if (blocking.length > 0) {
              // Forced back to To Do
              task.status = 'To Do';
              saveTasks();
              renderBoard();
              showDependencyError(task.title, blocking);
              return;
            }
          }

          task.status = targetStatus;
          task.updatedAt = Date.now().toString(); // Timestamp last modification
          task.history.unshift({
            timestamp: getFormattedTimestamp(),
            action: `Moved from ${oldStatus} to ${targetStatus}`
          });
          saveTasks();
          renderBoard();
        }
      }
    }

    // CRUD - CREATE DIALOG HANDLERS

    function openCreateModal() {
      populateCreateDependencies();
      const modal = document.getElementById('create-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => {
        document.getElementById('create-title').focus();
      }, 50);
    }

    function populateCreateDependencies() {
      const container = document.getElementById('create-dependencies-list');
      container.innerHTML = '';
      
      const availableTasks = tasks.filter(t => !t.archived);
      
      if (availableTasks.length === 0) {
        container.innerHTML = '<div class="text-[11px] text-zinc-500 py-1">No other tasks available to depend on.</div>';
        return;
      }
      
      availableTasks.forEach(t => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 text-xs text-zinc-300';
        
        div.innerHTML = `
          <input type="checkbox" id="create-dep-check-${t.id}" value="${t.id}" class="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500">
          <label for="create-dep-check-${t.id}" class="truncate cursor-pointer select-none flex-1">
            ${escapeHTML(t.title)} <span class="text-[9px] text-zinc-500">(${t.status})</span>
          </label>
        `;
        container.appendChild(div);
      });
    }

    function closeCreateModal() {
      const modal = document.getElementById('create-modal');
      modal.classList.remove('flex');
      modal.classList.add('hidden');
      document.getElementById('create-form').reset();
    }

    function handleCreateTask(e) {
      e.preventDefault();
      
      const title = document.getElementById('create-title').value.trim();
      const description = document.getElementById('create-desc').value.trim();
      const assignee = document.getElementById('create-assignee').value.trim();
      const priority = document.getElementById('create-priority').value;

      if (!title || !assignee) return;

      // Extract selected dependencies from checkboxes
      const selectedDeps = [];
      const checkboxes = document.querySelectorAll('#create-dependencies-list input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.checked) selectedDeps.push(cb.value);
      });

      const creationTimestamp = Date.now().toString();
      const newTask = {
        id: creationTimestamp,
        updatedAt: creationTimestamp,
        title,
        description,
        assignee,
        priority,
        status: 'To Do',
        archived: false,
        expanded: false,
        dependencies: selectedDeps,
        history: [
          {
            timestamp: getFormattedTimestamp(),
            action: 'Created task'
          }
        ]
      };

      tasks.unshift(newTask);
      saveTasks();
      populateAssigneeDropdown();
      renderBoard();
      closeCreateModal();
    }

    // CRUD - DETAIL / EDIT / TIMELINE MODAL HANDLERS

    let activeDetailTaskId = null;

    function openDetailModal(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      activeDetailTaskId = taskId;
      toggleEditMode(false);

      // Populate details
      document.getElementById('detail-task-id').textContent = `#${task.id}`;
      document.getElementById('detail-title').textContent = task.title;
      document.getElementById('detail-desc').textContent = task.description || 'No description provided.';
      document.getElementById('detail-assignee').textContent = task.assignee;
      
      // Assign stylized avatar initials background color
      const avatarEl = document.getElementById('detail-assignee-avatar');
      avatarEl.textContent = getInitials(task.assignee);
      avatarEl.className = `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold border ${getAvatarStyle(task.assignee)}`;

      document.getElementById('detail-priority').textContent = task.priority;

      // Status Badge
      const statusBadge = document.getElementById('detail-status-badge');
      statusBadge.textContent = task.status;
      statusBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ';
      if (task.status === 'To Do') statusBadge.className += 'bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 border border-zinc-250 dark:border-zinc-700/50';
      if (task.status === 'Doing') statusBadge.className += 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/30';
      if (task.status === 'Done') statusBadge.className += 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-750 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30';

      // Priority Dot
      const pDot = document.getElementById('detail-priority-dot');
      pDot.className = `w-2 h-2 rounded-full ${priorityColors[task.priority].dot}`;

      // Render Read-Only Dependencies
      renderReadonlyDependencies(task);

      // Populate Edit Form inputs
      document.getElementById('edit-id').value = task.id;
      document.getElementById('edit-title').value = task.title;
      document.getElementById('edit-desc').value = task.description;
      document.getElementById('edit-assignee').value = task.assignee;
      document.getElementById('edit-priority').value = task.priority;

      // Populate Edit Form dependencies checklist
      populateEditDependencies(task);

      // Render History Timeline
      renderHistory(task.history);

      const modal = document.getElementById('detail-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function renderReadonlyDependencies(task) {
      const depContainer = document.getElementById('detail-dependencies-list');
      depContainer.innerHTML = '';
      
      const deps = task.dependencies || [];
      if (deps.length === 0) {
        depContainer.innerHTML = '<span class="text-zinc-500 text-xs italic">None</span>';
        return;
      }

      deps.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-zinc-100/80 dark:bg-zinc-950/40 px-2.5 py-1 rounded border border-zinc-200/80 dark:border-zinc-800/60 mt-1';
        
        if (depTask) {
          let statusColor = 'text-zinc-500 dark:text-zinc-400';
          if (depTask.status === 'Doing') statusColor = 'text-indigo-650 dark:text-indigo-400';
          if (depTask.status === 'Done') statusColor = 'text-emerald-650 dark:text-emerald-400';
          
          div.innerHTML = `
            <span class="text-zinc-700 dark:text-zinc-350 truncate max-w-[70%]">${escapeHTML(depTask.title)}</span>
            <span class="text-[10px] font-semibold ${statusColor}">${depTask.status}</span>
          `;
        } else {
          div.innerHTML = `
            <span class="text-zinc-500 dark:text-zinc-500 truncate max-w-[70%]">Deleted Task (#${depId})</span>
            <span class="text-[10px] font-semibold text-zinc-400 dark:text-zinc-650">Missing</span>
          `;
        }
        depContainer.appendChild(div);
      });
    }

    function populateEditDependencies(currentTask) {
      const container = document.getElementById('edit-dependencies-list');
      container.innerHTML = '';
      
      const otherTasks = tasks.filter(t => t.id !== currentTask.id && !t.archived);
      
      if (otherTasks.length === 0) {
        container.innerHTML = '<div class="text-[11px] text-zinc-500 dark:text-zinc-450 py-1">No other tasks available to depend on.</div>';
        return;
      }
      
      otherTasks.forEach(t => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300';
        const isChecked = currentTask.dependencies && currentTask.dependencies.includes(t.id);
        
        div.innerHTML = `
          <input type="checkbox" id="dep-check-${t.id}" value="${t.id}" ${isChecked ? 'checked' : ''} class="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-indigo-600 focus:ring-indigo-500">
          <label for="dep-check-${t.id}" class="truncate cursor-pointer select-none flex-1">
            ${escapeHTML(t.title)} <span class="text-[9px] text-zinc-500 dark:text-zinc-450">(${t.status})</span>
          </label>
        `;
        container.appendChild(div);
      });
    }

    function renderHistory(historyArray) {
      const list = document.getElementById('detail-history-list');
      list.innerHTML = '';

      if (!historyArray || historyArray.length === 0) {
        list.innerHTML = '<div class="text-xs text-zinc-500 text-center py-6">No activity logged.</div>';
        return;
      }

      historyArray.forEach(log => {
        const item = document.createElement('div');
        item.className = 'flex gap-3 relative items-start';

        let dotColor = 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300';
        if (log.action.toLowerCase().includes('created')) dotColor = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40';
        if (log.action.toLowerCase().includes('moved to done')) dotColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40';
        if (log.action.toLowerCase().includes('archive')) dotColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/20';
        if (log.action.toLowerCase().includes('restore')) dotColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30';
        if (log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('remove')) dotColor = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40';

        item.innerHTML = `
          <div class="w-3 h-3 rounded-full ${dotColor} border flex items-center justify-center shrink-0 z-10 bg-white dark:bg-zinc-900 mt-1"></div>
          <div class="space-y-0.5">
            <span class="block text-[10px] text-zinc-550 dark:text-zinc-450 font-medium">${escapeHTML(log.timestamp)}</span>
            <p class="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-snug">${escapeHTML(log.action)}</p>
          </div>
        `;
        list.appendChild(item);
      });
    }

    // Toggle detail modal display modal
    function closeDetailModal() {
      const modal = document.getElementById('detail-modal');
      modal.classList.remove('flex');
      modal.classList.add('hidden');
      activeDetailTaskId = null;
    }

    // Toggle view details vs edit fields
    function toggleEditMode(isEdit) {
      const viewMode = document.getElementById('detail-view-mode');
      const editForm = document.getElementById('edit-form');

      if (isEdit) {
        viewMode.classList.add('hidden');
        editForm.classList.remove('hidden');
        document.getElementById('edit-title').focus();
      } else {
        viewMode.classList.remove('hidden');
        editForm.classList.add('hidden');
      }
    }

    function handleEditTask(e) {
      e.preventDefault();

      const taskId = document.getElementById('edit-id').value;
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newTitle = document.getElementById('edit-title').value.trim();
      const newDesc = document.getElementById('edit-desc').value.trim();
      const newAssignee = document.getElementById('edit-assignee').value.trim();
      const newPriority = document.getElementById('edit-priority').value;

      if (!newTitle || !newAssignee) return;

      // Extract selected dependencies from checkboxes
      const selectedDeps = [];
      const checkboxes = document.querySelectorAll('#edit-dependencies-list input[type="checkbox"]');
      checkboxes.forEach(cb => {
        if (cb.checked) selectedDeps.push(cb.value);
      });

      const oldDeps = task.dependencies || [];
      const depsChanged = JSON.stringify([...oldDeps].sort()) !== JSON.stringify([...selectedDeps].sort());

      const changes = [];
      if (task.title !== newTitle) changes.push(`Subject updated to "${newTitle}"`);
      if ((task.description || '') !== newDesc) changes.push("Details updated");
      if (task.assignee !== newAssignee) changes.push(`Assignee updated to "${newAssignee}"`);
      if (task.priority !== newPriority) changes.push(`Priority changed from "${task.priority}" to "${newPriority}"`);
      if (depsChanged) changes.push("Pre-requisite dependencies updated");

      if (changes.length > 0) {
        task.title = newTitle;
        task.description = newDesc;
        task.assignee = newAssignee;
        task.priority = newPriority;
        task.dependencies = selectedDeps;
        task.updatedAt = Date.now().toString(); // Timestamp edit

        // Dependency constraint safety: if task is in Doing or Done and has new uncompleted dependencies, force back to To Do
        let dependencyErrorTriggered = false;
        let blocking = [];
        if (task.status === 'Doing' || task.status === 'Done') {
          blocking = checkDependenciesCompleted(task);
          if (blocking.length > 0) {
            task.status = 'To Do';
            changes.push("Returned to To Do due to uncompleted dependency updates");
            dependencyErrorTriggered = true;
          }
        }

        changes.forEach(change => {
          task.history.unshift({
            timestamp: getFormattedTimestamp(),
            action: change
          });
        });

        saveTasks();
        populateAssigneeDropdown();
        renderBoard();
        
        if (dependencyErrorTriggered) {
          closeDetailModal();
          showDependencyError(task.title, blocking);
        } else {
          openDetailModal(taskId);
        }
      } else {
        toggleEditMode(false);
      }
    }

    // ARCHIVE & RESTORE LOGIC (Soft-delete Workspace)

    function confirmArchive() {
      if (!activeDetailTaskId) return;
      taskToDeleteId = activeDetailTaskId;
      isDeletingPermanently = false; // We are archiving
      
      document.getElementById('confirm-modal-title').textContent = "Archive this task?";
      document.getElementById('confirm-modal-desc').textContent = "This task will be hidden from the board but can be restored or permanently deleted from the Archive at any time.";
      document.getElementById('execute-confirm-btn').textContent = "Yes, Archive";
      document.getElementById('execute-confirm-btn').className = "px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg active:scale-95 transition-all";

      const modal = document.getElementById('delete-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function executeArchive() {
      if (!taskToDeleteId) return;

      if (isDeletingPermanently) {
        // Hard-delete logic
        tasks = tasks.filter(t => t.id !== taskToDeleteId);
        
        // Remove this task from any other tasks' dependency lists
        tasks.forEach(t => {
          if (t.dependencies) {
            t.dependencies = t.dependencies.filter(depId => depId !== taskToDeleteId);
          }
        });

        saveTasks();
        cancelDelete();
        populateArchiveList();
        populateAssigneeDropdown();
        renderBoard();
      } else {
        // Archive (soft-delete) logic
        const task = tasks.find(t => t.id === taskToDeleteId);
        if (task) {
          task.archived = true;
          task.updatedAt = Date.now().toString();
          task.history.unshift({
            timestamp: getFormattedTimestamp(),
            action: `Archived from ${task.status}`
          });
          saveTasks();
          closeDetailModal();
          cancelDelete();
          populateAssigneeDropdown();
          renderBoard();
        }
      }
    }

    // Close confirmation modal
    function cancelDelete() {
      const modal = document.getElementById('delete-modal');
      modal.classList.remove('flex');
      modal.classList.add('hidden');
      taskToDeleteId = null;
      isDeletingPermanently = false;
    }

    // ARCHIVE VIEW MODAL
    function openArchiveModal() {
      populateArchiveList();
      const modal = document.getElementById('archive-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeArchiveModal() {
      const modal = document.getElementById('archive-modal');
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }

    function populateArchiveList() {
      const list = document.getElementById('archive-list');
      const archivedTasks = tasks.filter(t => t.archived);
      list.innerHTML = '';

      if (archivedTasks.length === 0) {
        list.innerHTML = '<div class="text-xs text-zinc-500 text-center py-10">No tasks in archive.</div>';
        document.getElementById('empty-archive-btn').classList.add('hidden');
        return;
      }

      document.getElementById('empty-archive-btn').classList.remove('hidden');

      archivedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex items-center justify-between gap-4 text-zinc-800';
        
        item.innerHTML = `
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-semibold text-zinc-900 truncate">${escapeHTML(task.title)}</h4>
            <div class="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
              <span class="capitalize border border-zinc-200 bg-white px-1 py-0.5 rounded">${task.priority}</span>
              <span>Assignee: <strong class="text-zinc-700 font-normal">${escapeHTML(task.assignee)}</strong></span>
              <span>Column: <strong class="text-zinc-700 font-normal">${task.status}</strong></span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Restore Button -->
            <button onclick="restoreTask('${task.id}')" title="Restore task to board"
              class="p-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-emerald-650 hover:text-emerald-500 rounded transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
              </svg>
            </button>
            <!-- Hard-Delete Button -->
            <button onclick="confirmPermanentDelete('${task.id}')" title="Delete permanently"
              class="p-1.5 bg-white border border-zinc-200 hover:border-zinc-300 text-rose-650 hover:text-rose-500 rounded transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        `;
        list.appendChild(item);
      });
    }

    function restoreTask(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.archived = false;
        task.updatedAt = Date.now().toString();
        task.history.unshift({
          timestamp: getFormattedTimestamp(),
          action: `Restored to ${task.status}`
        });
        saveTasks();
        populateArchiveList();
        populateAssigneeDropdown();
        renderBoard();
      }
    }

    function confirmPermanentDelete(taskId) {
      taskToDeleteId = taskId;
      isDeletingPermanently = true; 

      document.getElementById('confirm-modal-title').textContent = "Permanently delete this task?";
      document.getElementById('confirm-modal-desc').textContent = "This action is final, permanent, and cannot be undone. The task will be erased from browser memory.";
      document.getElementById('execute-confirm-btn').textContent = "Yes, Delete Permanently";
      document.getElementById('execute-confirm-btn').className = "px-3 py-1.5 bg-rose-650 hover:bg-rose-500 text-white text-xs font-medium rounded-lg active:scale-95 transition-all";

      const modal = document.getElementById('delete-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function emptyArchive() {
      if (confirm("Are you sure you want to permanently empty the archive? All archived tasks will be deleted forever.")) {
        const archivedIds = tasks.filter(t => t.archived).map(t => t.id);
        
        // Remove archived tasks
        tasks = tasks.filter(t => !t.archived);

        // Clean up dependency lists for remaining tasks
        tasks.forEach(t => {
          if (t.dependencies) {
            t.dependencies = t.dependencies.filter(depId => !archivedIds.includes(depId));
          }
        });

        saveTasks();
        populateArchiveList();
        populateAssigneeDropdown();
        renderBoard();
      }
    }

    function toggleTheme() {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }