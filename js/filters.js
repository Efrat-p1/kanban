/**
 * Kanban board filters and sorting controllers
 */
(function() {
  window.KanbanFilters = {
    /**
     * Toggle active state of priority filter pills
     * @param {string} priority 
     */
    togglePriorityFilter(priority) {
      const activePriorities = KanbanState.activePriorities;
      const idx = activePriorities.indexOf(priority);
      if (idx > -1) {
        activePriorities.splice(idx, 1);
      } else {
        activePriorities.push(priority);
      }
      KanbanFilters.updatePriorityPillStyles();
      KanbanBoard.renderBoard();
    },

    /**
     * Re-render priority filter pills visual styles depending on selection
     */
    updatePriorityPillStyles() {
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
          if (KanbanState.activePriorities.includes(p)) {
            pill.className = `flex-1 py-1 text-xs rounded border transition-all text-center ${activeStyles[p]}`;
          } else {
            pill.className = `flex-1 py-1 text-xs rounded border transition-all text-center ${inactiveStyles}`;
          }
        }
      });
    },

    /**
     * Compile assignee multi-select checkboxes checklist in filters drawer
     */
    populateAssigneeDropdown() {
      const allAssignees = Array.from(
        new Set(
          KanbanState.tasks
            .filter(t => !t.archived)
            .map(t => t.assignee.trim())
            .filter(Boolean)
        )
      ).sort();
      
      KanbanState.activeAssignees = KanbanState.activeAssignees.filter(
        a => allAssignees.includes(a) || a === '__none__'
      );

      const menu = KanbanDOM.filterAssigneeMenu;
      if (!menu) return;
      menu.innerHTML = '';

      if (allAssignees.length === 0) {
        menu.innerHTML = '<div class="text-[11px] text-zinc-400 text-center py-2">No assignees available</div>';
        return;
      }

      // 1. Select All Checkbox
      const selectAllDiv = document.createElement('div');
      selectAllDiv.className = 'flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 rounded cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1';
      const isAllSelected = KanbanState.activeAssignees.length === 0;
      selectAllDiv.innerHTML = `
        <input type="checkbox" id="assignee-select-all" ${isAllSelected ? 'checked' : ''} class="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-650 focus:ring-indigo-500 cursor-pointer">
        <label for="assignee-select-all" class="cursor-pointer select-none flex-1">Select All</label>
      `;
      selectAllDiv.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          KanbanState.activeAssignees = [];
        } else {
          KanbanState.activeAssignees = ['__none__']; 
        }
        KanbanFilters.populateAssigneeDropdown();
        KanbanBoard.renderBoard();
      });
      menu.appendChild(selectAllDiv);

      // 2. Individual Assignees
      allAssignees.forEach(assignee => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center gap-2 px-2 py-1 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 rounded cursor-pointer text-xs text-zinc-650 dark:text-zinc-400';
        
        const isChecked = KanbanState.activeAssignees.length === 0 || KanbanState.activeAssignees.includes(assignee);
        itemDiv.innerHTML = `
          <input type="checkbox" id="assignee-check-${assignee.replace(/\s+/g, '-')}" ${isChecked ? 'checked' : ''} value="${assignee}" class="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-indigo-650 focus:ring-indigo-500 cursor-pointer">
          <label for="assignee-check-${assignee.replace(/\s+/g, '-')}" class="cursor-pointer select-none flex-1 truncate">${KanbanHelpers.escapeHTML(assignee)}</label>
        `;

        itemDiv.querySelector('input').addEventListener('change', (e) => {
          const val = e.target.value;
          if (KanbanState.activeAssignees.length === 0) {
            KanbanState.activeAssignees = allAssignees.filter(a => a !== val);
          } else {
            KanbanState.activeAssignees = KanbanState.activeAssignees.filter(a => a !== '__none__');
            const idx = KanbanState.activeAssignees.indexOf(val);
            if (idx > -1) {
              KanbanState.activeAssignees.splice(idx, 1);
            } else {
              KanbanState.activeAssignees.push(val);
            }
          }

          if (KanbanState.activeAssignees.length === allAssignees.length || KanbanState.activeAssignees.length === 0) {
            KanbanState.activeAssignees = [];
          } else if (KanbanState.activeAssignees.length === 0) {
            KanbanState.activeAssignees = ['__none__'];
          }

          KanbanFilters.populateAssigneeDropdown();
          KanbanBoard.renderBoard();
        });

        menu.appendChild(itemDiv);
      });
    },

    /**
     * Reset all filtering parameters to default
     */
    clearAllFilters() {
      KanbanDOM.searchInput.value = '';
      KanbanState.activePriorities = ['low', 'medium', 'high'];
      KanbanState.activeAssignees = [];
      KanbanDOM.filterTimeSelect.value = 'all';
      KanbanDOM.filterBlockedSelect.value = 'all';
      KanbanDOM.sortBySelect.value = 'manual';

      KanbanFilters.updatePriorityPillStyles();
      KanbanFilters.populateAssigneeDropdown();
      KanbanBoard.renderBoard();
    },

    /**
     * Clear all board memory permanently
     */
    wipeBoard() {
      if (confirm("Are you sure you want to permanently delete all tasks (including archived ones)? This action cannot be undone and will clear the board memory.")) {
        KanbanState.tasks = [];
        KanbanState.saveTasks();
        KanbanFilters.populateAssigneeDropdown();
        KanbanBoard.renderBoard();
      }
    },

    /**
     * Overwrite current tasks with mock task list
     */
    loadDemoData() {
      if (confirm("Are you sure you want to load the 10 demo tasks? This will overwrite your current board state.")) {
        KanbanState.tasks = JSON.parse(JSON.stringify(KanbanState.mockTasks));
        KanbanState.saveTasks();
        KanbanFilters.populateAssigneeDropdown();
        KanbanBoard.renderBoard();
      }
    },

    /**
     * Expand or collapse all cards on board
     * @param {boolean} expanded 
     */
    expandAllTasks(expanded) {
      KanbanState.tasks.forEach(t => {
        t.expanded = expanded;
      });
      KanbanState.saveTasks();
      KanbanBoard.renderBoard();
    }
  };
})();
