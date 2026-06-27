/**
 * Kanban board modals and dialog controllers
 */
var KanbanModals;
(function() {
  let activeDetailTaskId = null;

  KanbanModals = window.KanbanModals = {
    // Getter for active detail task id (if needed outside)
    get activeDetailTaskId() { return activeDetailTaskId; },

    /* ==========================================================================
       CREATE TASK MODAL
       ========================================================================== */
    openCreateModal() {
      KanbanModals.populateCreateDependencies();
      const modal = document.getElementById('create-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
          const titleInput = document.getElementById('create-title');
          if (titleInput) titleInput.focus();
        }, 50);
      }
    },

    closeCreateModal() {
      const modal = document.getElementById('create-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
      const form = document.getElementById('create-form');
      if (form) form.reset();
    },

    populateCreateDependencies() {
      const container = document.getElementById('create-dependencies-list');
      if (!container) return;
      container.innerHTML = '';
      
      const availableTasks = KanbanState.tasks.filter(t => !t.archived);
      
      if (availableTasks.length === 0) {
        container.innerHTML = '<div class="text-[11px] text-zinc-500 py-1">No other tasks available to depend on.</div>';
        return;
      }
      
      availableTasks.forEach(t => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 text-xs text-zinc-300';
        
        div.innerHTML = `
          <input type="checkbox" id="create-dep-check-${t.id}" value="${t.id}" class="rounded border-zinc-700 bg-zinc-950 text-indigo-650 focus:ring-indigo-500">
          <label for="create-dep-check-${t.id}" class="truncate cursor-pointer select-none flex-1">
            ${KanbanHelpers.escapeHTML(t.title)} <span class="text-[9px] text-zinc-500">(${t.status})</span>
          </label>
        `;
        container.appendChild(div);
      });
    },

    handleCreateTask(e) {
      if (e) e.preventDefault();
      
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
            timestamp: KanbanHelpers.getFormattedTimestamp(),
            action: 'Created task'
          }
        ]
      };

      KanbanState.tasks.unshift(newTask);
      KanbanState.saveTasks();
      KanbanFilters.populateAssigneeDropdown();
      KanbanBoard.renderBoard();
      KanbanModals.closeCreateModal();
    },

    /* ==========================================================================
       DETAIL & EDIT MODAL
       ========================================================================== */
    openDetailModal(taskId) {
      const task = KanbanState.tasks.find(t => t.id === taskId);
      if (!task) return;

      activeDetailTaskId = taskId;
      KanbanModals.toggleEditMode(false);

      // Populate details
      document.getElementById('detail-task-id').textContent = `#${task.id}`;
      document.getElementById('detail-title').textContent = task.title;
      document.getElementById('detail-desc').textContent = task.description || 'No description provided.';
      document.getElementById('detail-assignee').textContent = task.assignee;
      
      // Assign stylized avatar initials background color
      const avatarEl = document.getElementById('detail-assignee-avatar');
      if (avatarEl) {
        avatarEl.textContent = KanbanHelpers.getInitials(task.assignee);
        avatarEl.className = `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold border ${KanbanHelpers.getAvatarStyle(task.assignee)}`;
      }

      document.getElementById('detail-priority').textContent = task.priority;

      // Status Badge
      const statusBadge = document.getElementById('detail-status-badge');
      if (statusBadge) {
        statusBadge.textContent = task.status;
        statusBadge.className = 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ';
        if (task.status === 'To Do') statusBadge.className += 'bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 border border-zinc-250 dark:border-zinc-700/50';
        if (task.status === 'Doing') statusBadge.className += 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/30';
        if (task.status === 'Done') statusBadge.className += 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-750 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30';
      }

      // Priority Dot
      const pDot = document.getElementById('detail-priority-dot');
      if (pDot) {
        pDot.className = `w-2 h-2 rounded-full ${KanbanDOM.priorityColors[task.priority].dot}`;
      }

      // Render Read-Only Dependencies
      KanbanModals.renderReadonlyDependencies(task);

      // Populate Edit Form inputs
      document.getElementById('edit-id').value = task.id;
      document.getElementById('edit-title').value = task.title;
      document.getElementById('edit-desc').value = task.description;
      document.getElementById('edit-assignee').value = task.assignee;
      document.getElementById('edit-priority').value = task.priority;

      // Populate Edit Form dependencies checklist
      KanbanModals.populateEditDependencies(task);

      // Render History Timeline
      KanbanModals.renderHistory(task.history);

      const modal = document.getElementById('detail-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    },

    closeDetailModal() {
      const modal = document.getElementById('detail-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
      activeDetailTaskId = null;
    },

    toggleEditMode(isEdit) {
      const viewMode = document.getElementById('detail-view-mode');
      const editForm = document.getElementById('edit-form');

      if (!viewMode || !editForm) return;

      if (isEdit) {
        viewMode.classList.add('hidden');
        editForm.classList.remove('hidden');
        const editTitleInput = document.getElementById('edit-title');
        if (editTitleInput) editTitleInput.focus();
      } else {
        viewMode.classList.remove('hidden');
        editForm.classList.add('hidden');
      }
    },

    renderReadonlyDependencies(task) {
      const depContainer = document.getElementById('detail-dependencies-list');
      if (!depContainer) return;
      depContainer.innerHTML = '';
      
      const deps = task.dependencies || [];
      if (deps.length === 0) {
        depContainer.innerHTML = '<span class="text-zinc-500 text-xs italic">None</span>';
        return;
      }

      deps.forEach(depId => {
        const depTask = KanbanState.tasks.find(t => t.id === depId);
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-zinc-100/80 dark:bg-zinc-950/40 px-2.5 py-1 rounded border border-zinc-200/80 dark:border-zinc-800/60 mt-1';
        
        if (depTask) {
          let statusColor = 'text-zinc-500 dark:text-zinc-400';
          if (depTask.status === 'Doing') statusColor = 'text-indigo-650 dark:text-indigo-400';
          if (depTask.status === 'Done') statusColor = 'text-emerald-650 dark:text-emerald-400';
          
          div.innerHTML = `
            <span class="text-zinc-700 dark:text-zinc-350 truncate max-w-[70%]">${KanbanHelpers.escapeHTML(depTask.title)}</span>
            <span class="text-[10px] font-semibold ${statusColor}">${depTask.status}</span>
          `;
        } else {
          div.innerHTML = `
            <span class="text-zinc-550 dark:text-zinc-500 truncate max-w-[70%]">Deleted Task (#${depId})</span>
            <span class="text-[10px] font-semibold text-zinc-400 dark:text-zinc-650">Missing</span>
          `;
        }
        depContainer.appendChild(div);
      });
    },

    populateEditDependencies(currentTask) {
      const container = document.getElementById('edit-dependencies-list');
      if (!container) return;
      container.innerHTML = '';
      
      const otherTasks = KanbanState.tasks.filter(t => t.id !== currentTask.id && !t.archived);
      
      if (otherTasks.length === 0) {
        container.innerHTML = '<div class="text-[11px] text-zinc-500 dark:text-zinc-450 py-1">No other tasks available to depend on.</div>';
        return;
      }
      
      otherTasks.forEach(t => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300';
        const isChecked = currentTask.dependencies && currentTask.dependencies.includes(t.id);
        
        div.innerHTML = `
          <input type="checkbox" id="dep-check-${t.id}" value="${t.id}" ${isChecked ? 'checked' : ''} class="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-indigo-650 focus:ring-indigo-500">
          <label for="dep-check-${t.id}" class="truncate cursor-pointer select-none flex-1">
            ${KanbanHelpers.escapeHTML(t.title)} <span class="text-[9px] text-zinc-500 dark:text-zinc-450">(${t.status})</span>
          </label>
        `;
        container.appendChild(div);
      });
    },

    handleEditTask(e) {
      if (e) e.preventDefault();

      const taskId = document.getElementById('edit-id').value;
      const task = KanbanState.tasks.find(t => t.id === taskId);
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
          blocking = KanbanState.checkDependenciesCompleted(task);
          if (blocking.length > 0) {
            task.status = 'To Do';
            changes.push("Returned to To Do due to uncompleted dependency updates");
            dependencyErrorTriggered = true;
          }
        }

        changes.forEach(change => {
          task.history.unshift({
            timestamp: KanbanHelpers.getFormattedTimestamp(),
            action: change
          });
        });

        KanbanState.saveTasks();
        KanbanFilters.populateAssigneeDropdown();
        KanbanBoard.renderBoard();
        
        if (dependencyErrorTriggered) {
          KanbanModals.closeDetailModal();
          KanbanModals.showDependencyError(task.title, blocking);
        } else {
          KanbanModals.openDetailModal(taskId);
        }
      } else {
        KanbanModals.toggleEditMode(false);
      }
    },

    renderHistory(historyArray) {
      const list = document.getElementById('detail-history-list');
      if (!list) return;
      list.innerHTML = '';

      if (!historyArray || historyArray.length === 0) {
        list.innerHTML = '<div class="text-xs text-zinc-500 text-center py-6">No activity logged.</div>';
        return;
      }

      historyArray.forEach(log => {
        const item = document.createElement('div');
        item.className = 'flex gap-3 relative items-start';

        let dotColor = 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300';
        if (log.action.toLowerCase().includes('created')) dotColor = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 border-indigo-200 dark:border-indigo-850/40';
        if (log.action.toLowerCase().includes('moved to done')) dotColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-750 dark:text-emerald-400 border-emerald-200 dark:border-emerald-850/40';
        if (log.action.toLowerCase().includes('archive')) dotColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-850/20';
        if (log.action.toLowerCase().includes('restore')) dotColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-750 dark:text-emerald-400 border-emerald-200 dark:border-emerald-850/30';
        if (log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('remove')) dotColor = 'bg-rose-50 dark:bg-rose-950/40 text-rose-750 dark:text-rose-400 border-rose-200 dark:border-rose-850/40';

        item.innerHTML = `
          <div class="w-3 h-3 rounded-full ${dotColor} border flex items-center justify-center shrink-0 z-10 bg-white dark:bg-zinc-900 mt-1"></div>
          <div class="space-y-0.5">
            <span class="block text-[10px] text-zinc-550 dark:text-zinc-450 font-medium">${KanbanHelpers.escapeHTML(log.timestamp)}</span>
            <p class="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-snug">${KanbanHelpers.escapeHTML(log.action)}</p>
          </div>
        `;
        list.appendChild(item);
      });
    },

    /* ==========================================================================
       ARCHIVE & SOFT-DELETE VIEW MODAL
       ========================================================================== */
    openArchiveModal() {
      KanbanModals.populateArchiveList();
      const modal = document.getElementById('archive-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    },

    closeArchiveModal() {
      const modal = document.getElementById('archive-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    },

    populateArchiveList() {
      const list = document.getElementById('archive-list');
      if (!list) return;
      
      const archivedTasks = KanbanState.tasks.filter(t => t.archived);
      list.innerHTML = '';

      const emptyArchiveBtn = document.getElementById('empty-archive-btn');

      if (archivedTasks.length === 0) {
        list.innerHTML = '<div class="text-xs text-zinc-500 text-center py-10">No tasks in archive.</div>';
        if (emptyArchiveBtn) emptyArchiveBtn.classList.add('hidden');
        return;
      }

      if (emptyArchiveBtn) emptyArchiveBtn.classList.remove('hidden');

      archivedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-4 text-zinc-805 dark:text-zinc-300';
        
        item.innerHTML = `
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-semibold text-zinc-900 dark:text-white truncate">${KanbanHelpers.escapeHTML(task.title)}</h4>
            <div class="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
              <span class="capitalize border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1 py-0.5 rounded">${task.priority}</span>
              <span>Assignee: <strong class="text-zinc-700 dark:text-zinc-300 font-normal">${KanbanHelpers.escapeHTML(task.assignee)}</strong></span>
              <span>Column: <strong class="text-zinc-700 dark:text-zinc-300 font-normal">${task.status}</strong></span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Restore Button -->
            <button onclick="restoreTask('${task.id}')" title="Restore task to board"
              class="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-650 text-emerald-650 hover:text-emerald-500 dark:text-emerald-450 rounded transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
              </svg>
            </button>
            <!-- Hard-Delete Button -->
            <button onclick="confirmPermanentDelete('${task.id}')" title="Delete permanently"
              class="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-650 text-rose-650 hover:text-rose-500 dark:text-rose-450 rounded transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        `;
        list.appendChild(item);
      });
    },

    restoreTask(taskId) {
      const task = KanbanState.tasks.find(t => t.id === taskId);
      if (task) {
        task.archived = false;
        task.updatedAt = Date.now().toString();
        task.history.unshift({
          timestamp: KanbanHelpers.getFormattedTimestamp(),
          action: `Restored to ${task.status}`
        });
        KanbanState.saveTasks();
        KanbanModals.populateArchiveList();
        KanbanFilters.populateAssigneeDropdown();
        KanbanBoard.renderBoard();
      }
    },

    confirmPermanentDelete(taskId) {
      KanbanState.taskToDeleteId = taskId;
      KanbanState.isDeletingPermanently = true; 

      document.getElementById('confirm-modal-title').textContent = "Permanently delete this task?";
      document.getElementById('confirm-modal-desc').textContent = "This action is final, permanent, and cannot be undone. The task will be erased from browser memory.";
      
      const confirmBtn = document.getElementById('execute-confirm-btn');
      if (confirmBtn) {
        confirmBtn.textContent = "Yes, Delete Permanently";
        confirmBtn.className = "px-3 py-1.5 bg-rose-650 hover:bg-rose-500 text-white text-xs font-medium rounded-lg active:scale-95 transition-all";
      }

      const modal = document.getElementById('delete-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    },

    emptyArchive() {
      KanbanModals.showConfirmDialog(
        "Empty Archive?",
        "Are you sure you want to permanently empty the archive? All archived tasks will be deleted forever.",
        "Delete All",
        () => {
          const archivedIds = KanbanState.tasks.filter(t => t.archived).map(t => t.id);
          
          // Remove archived tasks
          KanbanState.tasks = KanbanState.tasks.filter(t => !t.archived);

          // Clean up dependency lists for remaining tasks
          KanbanState.tasks.forEach(t => {
            if (t.dependencies) {
              t.dependencies = t.dependencies.filter(depId => !archivedIds.includes(depId));
            }
          });

          KanbanState.saveTasks();
          KanbanModals.populateArchiveList();
          KanbanFilters.populateAssigneeDropdown();
          KanbanBoard.renderBoard();
        }
      );
    },

    /* ==========================================================================
       CONFIRM DELETE / ARCHIVE DIALOG
       ========================================================================== */
    confirmArchive() {
      if (!activeDetailTaskId) return;
      KanbanState.taskToDeleteId = activeDetailTaskId;
      KanbanState.isDeletingPermanently = false; // We are archiving
      
      document.getElementById('confirm-modal-title').textContent = "Archive this task?";
      document.getElementById('confirm-modal-desc').textContent = "This task will be hidden from the board but can be restored or permanently deleted from the Archive at any time.";
      
      const confirmBtn = document.getElementById('execute-confirm-btn');
      if (confirmBtn) {
        confirmBtn.textContent = "Yes, Archive";
        confirmBtn.className = "px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg active:scale-95 transition-all";
      }

      const modal = document.getElementById('delete-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    },

    executeArchive() {
      if (!KanbanState.taskToDeleteId) return;

      if (KanbanState.isDeletingPermanently) {
        // Hard-delete logic
        KanbanState.tasks = KanbanState.tasks.filter(t => t.id !== KanbanState.taskToDeleteId);
        
        // Remove this task from any other tasks' dependency lists
        KanbanState.tasks.forEach(t => {
          if (t.dependencies) {
            t.dependencies = t.dependencies.filter(depId => depId !== KanbanState.taskToDeleteId);
          }
        });

        KanbanState.saveTasks();
        KanbanModals.cancelDelete();
        KanbanModals.populateArchiveList();
        KanbanFilters.populateAssigneeDropdown();
        KanbanBoard.renderBoard();
      } else {
        // Archive (soft-delete) logic
        const task = KanbanState.tasks.find(t => t.id === KanbanState.taskToDeleteId);
        if (task) {
          task.archived = true;
          task.updatedAt = Date.now().toString();
          task.history.unshift({
            timestamp: KanbanHelpers.getFormattedTimestamp(),
            action: `Archived from ${task.status}`
          });
          KanbanState.saveTasks();
          KanbanModals.closeDetailModal();
          KanbanModals.cancelDelete();
          KanbanFilters.populateAssigneeDropdown();
          KanbanBoard.renderBoard();
        }
      }
    },

    cancelDelete() {
      const modal = document.getElementById('delete-modal');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
      KanbanState.taskToDeleteId = null;
      KanbanState.isDeletingPermanently = false;
    },

    /* ==========================================================================
       DYNAMIC CONFIRM MODAL (Replaces native window.confirm)
       ========================================================================== */
    showConfirmDialog(title, message, confirmText, callback) {
      // Remove any existing dynamic confirm modal
      const existing = document.getElementById('dynamic-confirm-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'dynamic-confirm-modal';
      modal.className = "fixed inset-0 bg-zinc-950/70 flex items-center justify-center p-4 transition-all";
      modal.style.cssText = "z-index: 2147483647 !important; display: flex !important;";
      
      window.closeDynamicConfirmModal = () => {
        const m = document.getElementById('dynamic-confirm-modal');
        if (m) m.remove();
      };

      window.executeDynamicConfirm = () => {
        window.closeDynamicConfirmModal();
        if (typeof callback === 'function') callback();
      };

      const isDestructive = confirmText.toLowerCase().includes('delete') || confirmText.toLowerCase().includes('wipe');
      const btnClass = isDestructive 
        ? "bg-rose-600 hover:bg-rose-500 text-white"
        : "bg-indigo-600 hover:bg-indigo-500 text-white";
        
      const iconClass = isDestructive
        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
        : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40";

      const iconPath = isDestructive
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>`
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;

      modal.innerHTML = `
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl w-full max-w-sm overflow-hidden p-5 transform transition-transform duration-200 text-zinc-800 dark:text-zinc-200" onclick="event.stopPropagation()">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full ${iconClass} border flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                ${iconPath}
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-zinc-900 dark:text-white">${title}</h4>
              <p class="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-normal">${message}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2 mt-5">
            <button onclick="closeDynamicConfirmModal()"
              class="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg active:scale-95 transition-colors">
              Cancel
            </button>
            <button onclick="executeDynamicConfirm()"
              class="px-3 py-1.5 ${btnClass} text-xs font-medium rounded-lg active:scale-95 transition-all font-semibold">
              ${confirmText}
            </button>
          </div>
        </div>
      `;
      
      modal.onclick = window.closeDynamicConfirmModal;

      setTimeout(() => {
        document.body.appendChild(modal);
      }, 10);
    },

    /* ==========================================================================
       DEPENDENCY ERROR MODAL
       ========================================================================== */
    showDependencyError(taskTitle, blockingTitles) {
      console.log("modals.js: dynamically generating dependency error modal for task:", taskTitle);
      
      // Remove any existing dynamic modal to prevent duplicates
      const existing = document.getElementById('dynamic-dependency-modal');
      if (existing) {
        existing.remove();
      }

      // Create modal container
      const modal = document.createElement('div');
      modal.id = 'dynamic-dependency-modal';
      modal.className = "fixed inset-0 bg-zinc-950/70 flex items-center justify-center p-4 transition-all";
      modal.style.cssText = "z-index: 2147483647 !important; display: flex !important;"; // Max z-index
      
      // Global close function
      window.closeDynamicDependencyModal = () => {
        const m = document.getElementById('dynamic-dependency-modal');
        if (m) m.remove();
      };

      // Modal HTML structure
      modal.innerHTML = `
        <div class="bg-white dark:bg-zinc-900 border border-rose-400 dark:border-rose-800/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-zinc-800 dark:text-zinc-200" onclick="event.stopPropagation()">
          <div class="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/30 p-4 flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
            <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 class="font-bold text-sm uppercase tracking-wider">Fatal Error: Blocked Task</h3>
          </div>
          <div class="p-5 space-y-3">
            <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-normal">
              Cannot start work on <strong class="text-zinc-900 dark:text-white">${KanbanHelpers.escapeHTML(taskTitle)}</strong>. 
              The following pre-requisite tasks must be completed (set to <strong>Done</strong>) first:
            </p>
            <ul class="list-disc pl-5 text-xs text-rose-600 dark:text-rose-450 space-y-1 font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg max-h-40 overflow-y-auto">
              ${blockingTitles.map(title => `<li>${KanbanHelpers.escapeHTML(title)}</li>`).join('')}
            </ul>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-450 italic">This task has been returned to the <strong>To Do</strong> column.</p>
          </div>
          <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button type="button" onclick="window.closeDynamicDependencyModal()" 
              class="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-md active:scale-95 transition-all cursor-pointer">
              Acknowledge
            </button>
          </div>
        </div>
      `;
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeDynamicDependencyModal();
      });

      document.body.appendChild(modal);
    },

    /* ==========================================================================
       THEME TOGGLER
       ========================================================================== */
    toggleTheme() {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  };
})();
