/**
 * Kanban board layout renderer and task card component generator
 */
(function() {
  window.KanbanBoard = {
    /**
     * Main render entrypoint: Filter, sort, group, and draw task cards
     */
    renderBoard() {
      const searchInput = KanbanDOM.searchInput;
      if (!searchInput) return;

      const searchQuery = searchInput.value.toLowerCase().trim();
      const sortBy = KanbanDOM.sortBySelect.value;
      const timeFilter = KanbanDOM.filterTimeSelect.value;
      const blockedFilter = KanbanDOM.filterBlockedSelect.value;

      // Update archive count badge
      const archivedCount = KanbanState.tasks.filter(task => task.archived).length;
      const archiveCountBadge = document.getElementById('archive-count');
      if (archiveCountBadge) {
        archiveCountBadge.textContent = archivedCount;
      }

      // 1. Filter, Sort, and Group tasks
      const filtered = KanbanBoard.filterTasks(KanbanState.tasks, searchQuery, timeFilter, blockedFilter);
      const sorted = KanbanBoard.sortTasks(filtered, sortBy);
      const grouped = KanbanBoard.groupTasksByStatus(sorted);

      // Show/Hide Reset filters button dynamically
      const isFiltersActive = searchQuery !== '' || 
                              KanbanState.activePriorities.length < 3 || 
                              KanbanState.activeAssignees.length > 0 || 
                              timeFilter !== 'all' || 
                              blockedFilter !== 'all' || 
                              sortBy !== 'manual';
                              
      const resetBtn = document.getElementById('clear-filters-btn');
      if (resetBtn) {
        if (isFiltersActive) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
      }

      const activeBadge = document.getElementById('active-filters-badge');
      if (activeBadge) {
        if (isFiltersActive) activeBadge.classList.remove('hidden');
        else activeBadge.classList.add('hidden');
      }

      // 2. Render columns to DOM
      const columns = KanbanDOM.columns;
      Object.keys(columns).forEach(status => {
        const columnData = columns[status];
        if (!columnData) return;

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
          const card = KanbanBoard.createTaskCardDOM(task);
          columnData.list.appendChild(card);
        });
      });
    },

    /**
     * Generate HTML task card element
     * @param {Object} task 
     * @returns {HTMLElement}
     */
    createTaskCardDOM(task) {
      if (task.expanded === undefined) task.expanded = false;

      const card = document.createElement('div');
      card.id = `task-card-${task.id}`;
      card.className = `task-card bg-white dark:bg-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 border-l-4 ${KanbanDOM.priorityColors[task.priority].border} rounded-lg ${task.expanded ? 'p-2.5' : 'p-2'} cursor-grab active:cursor-grabbing hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-[1px] transition-all duration-150 relative group`;
      card.draggable = true;
      
      card.addEventListener('dragstart', (e) => KanbanEvents.handleDragStart(e, task.id));
      card.addEventListener('dragend', (e) => KanbanEvents.handleDragEnd(e));
      card.addEventListener('click', () => KanbanModals.openDetailModal(task.id));

      const userAvatarStyle = KanbanHelpers.getAvatarStyle(task.assignee);
      const isBlocked = KanbanState.isTaskBlocked(task);

      if (task.expanded) {
        card.innerHTML = `
          <div class="task-card-content space-y-1.5">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-xs font-semibold text-zinc-800 dark:text-zinc-250 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors leading-tight line-clamp-2">${KanbanHelpers.escapeHTML(task.title)}</h3>
              <button type="button" class="chevron-toggle text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 shrink-0 focus:outline-none transition-colors" title="Collapse card">
                <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path>
                </svg>
              </button>
            </div>
            ${task.description && task.description.trim() ? `<p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">${KanbanHelpers.escapeHTML(task.description)}</p>` : ''}
            <div class="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 mt-1.5">
              <div class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-full ${userAvatarStyle} border flex items-center justify-center text-[9px] font-bold shrink-0" title="${KanbanHelpers.escapeHTML(task.assignee)}">
                  ${KanbanHelpers.escapeHTML(KanbanHelpers.getInitials(task.assignee))}
                </span>
                <span class="text-[10px] text-zinc-500 dark:text-zinc-450 max-w-[80px] truncate" title="${KanbanHelpers.escapeHTML(task.assignee)}">${KanbanHelpers.escapeHTML(task.assignee)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                ${isBlocked ? `<span class="text-[9px] text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5" title="Blocked by dependencies">🔒 Blocked</span>` : ''}
                <span class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${KanbanDOM.priorityColors[task.priority].badge}">
                  ${task.priority}
                </span>
              </div>
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="task-card-content flex items-center justify-between gap-2">
            <span class="w-1.5 h-1.5 rounded-full ${KanbanDOM.priorityColors[task.priority].dot} shrink-0"></span>
            <h3 class="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate flex-1 leading-tight select-none flex items-center gap-1">
              ${isBlocked ? '<span class="text-rose-600 dark:text-rose-450 text-[10px] shrink-0" title="Blocked by dependencies">🔒</span>' : ''}
              ${KanbanHelpers.escapeHTML(task.title)}
            </h3>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="w-3.5 h-3.5 rounded-full ${userAvatarStyle} border flex items-center justify-center text-[8px] font-bold shrink-0" title="${KanbanHelpers.escapeHTML(task.assignee)}">
                ${KanbanHelpers.escapeHTML(KanbanHelpers.getInitials(task.assignee))}
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

      card.querySelector('.chevron-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        task.expanded = !task.expanded;
        KanbanState.saveTasks();
        KanbanBoard.renderBoard();
      });

      return card;
    },

    /**
     * Filter tasks array based on search and parameters criteria
     * @param {Object[]} allTasks 
     * @param {string} searchQuery 
     * @param {string} timeFilter 
     * @param {string} blockedFilter 
     * @returns {Object[]}
     */
    filterTasks(allTasks, searchQuery, timeFilter, blockedFilter) {
      const now = Date.now();
      return allTasks.filter(task => {
        if (task.archived) return false;

        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                              task.description.toLowerCase().includes(searchQuery) || 
                              task.assignee.toLowerCase().includes(searchQuery);
        
        const matchesPriority = KanbanState.activePriorities.includes(task.priority);
        const matchesAssignee = KanbanState.activeAssignees.length === 0 || KanbanState.activeAssignees.includes(task.assignee);
        
        let matchesTime = true;
        if (timeFilter !== 'all') {
          const createdTime = Number(task.id);
          const updatedTime = Number(task.updatedAt || task.id);
          const timeDiffCreated = now - createdTime;
          const timeDiffUpdated = now - updatedTime;

          if (timeFilter === 'created-2m') matchesTime = timeDiffCreated <= 2 * 60 * 1000;
          else if (timeFilter === 'created-1h') matchesTime = timeDiffCreated <= 60 * 60 * 1000;
          else if (timeFilter === 'created-1d') matchesTime = timeDiffCreated <= 24 * 60 * 60 * 1000;
          else if (timeFilter === 'updated-2m') matchesTime = timeDiffUpdated <= 2 * 60 * 1000;
          else if (timeFilter === 'updated-1h') matchesTime = timeDiffUpdated <= 60 * 60 * 1000;
          else if (timeFilter === 'updated-1d') matchesTime = timeDiffUpdated <= 24 * 60 * 60 * 1000;
        }
        
        let matchesBlocked = true;
        if (blockedFilter !== 'all') {
          const isBlocked = KanbanState.isTaskBlocked(task);
          if (blockedFilter === 'blocked') matchesBlocked = isBlocked;
          else if (blockedFilter === 'unblocked') matchesBlocked = !isBlocked;
        }
        
        return matchesSearch && matchesPriority && matchesAssignee && matchesTime && matchesBlocked;
      });
    },

    /**
     * Sort tasks based on sorting keys
     * @param {Object[]} tasksToSort 
     * @param {string} sortBy 
     * @returns {Object[]}
     */
    sortTasks(tasksToSort, sortBy) {
      const sorted = [...tasksToSort];
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
        sorted.sort((a, b) => (KanbanState.isTaskBlocked(b) ? 1 : 0) - (KanbanState.isTaskBlocked(a) ? 1 : 0));
      } else if (sortBy === 'unblocked-first') {
        sorted.sort((a, b) => (KanbanState.isTaskBlocked(a) ? 1 : 0) - (KanbanState.isTaskBlocked(b) ? 1 : 0));
      }
      return sorted;
    },

    /**
     * Group tasks array into To Do, Doing, and Done columns
     * @param {Object[]} tasksToGroup 
     * @returns {Object} { 'To Do': [], 'Doing': [], 'Done': [] }
     */
    groupTasksByStatus(tasksToGroup) {
      const grouped = { 'To Do': [], 'Doing': [], 'Done': [] };
      tasksToGroup.forEach(task => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        } else {
          task.status = 'To Do';
          grouped['To Do'].push(task);
        }
      });
      return grouped;
    }
  };
})();
