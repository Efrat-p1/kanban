/**
 * Kanban board drag-and-drop, keyboard shortcuts, and layout events setup
 */
(function() {
  window.KanbanEvents = {
    /**
     * Set up main page event listeners (input search, backdrop click closing)
     */
    setupEventListeners() {
      const searchInput = KanbanDOM.searchInput;
      if (searchInput) {
        searchInput.addEventListener('input', () => KanbanBoard.renderBoard());
      }

      // Close dropdowns & modals when clicking backdrop
      const createModal = document.getElementById('create-modal');
      if (createModal) {
        createModal.addEventListener('click', (e) => {
          if (e.target === e.currentTarget) KanbanModals.closeCreateModal();
        });
      }

      const detailModal = document.getElementById('detail-modal');
      if (detailModal) {
        detailModal.addEventListener('click', (e) => {
          if (e.target === e.currentTarget) KanbanModals.closeDetailModal();
        });
      }

      const archiveModal = document.getElementById('archive-modal');
      if (archiveModal) {
        archiveModal.addEventListener('click', (e) => {
          if (e.target === e.currentTarget) KanbanModals.closeArchiveModal();
        });
      }

      const deleteModal = document.getElementById('delete-modal');
      if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
          if (e.target === e.currentTarget) KanbanModals.cancelDelete();
        });
      }

      const depErrorModal = document.getElementById('dependency-error-modal');
      if (depErrorModal) {
        depErrorModal.addEventListener('click', (e) => {
          if (e.target === e.currentTarget) KanbanModals.closeDependencyErrorModal();
        });
      }

      // Close actions dropdown on click outside
      document.addEventListener('click', (e) => {
        const actionsContainer = document.getElementById('board-actions-container');
        const actionsMenu = document.getElementById('board-actions-menu');
        if (actionsContainer && actionsMenu && !actionsContainer.contains(e.target)) {
          actionsMenu.classList.add('hidden');
        }
      });
    },

    /**
     * Key shortcuts logic: 'Escape' to close all interfaces, 'N' to create new task
     */
    setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Close all modals on ESC (regardless of focus)
        if (e.key === 'Escape') {
          KanbanModals.closeCreateModal();
          KanbanModals.closeDetailModal();
          KanbanModals.closeArchiveModal();
          KanbanModals.cancelDelete();
          KanbanModals.closeDependencyErrorModal();
          
          // Also close filters drawer on escape
          const drawer = document.getElementById('filters-drawer');
          if (drawer && !drawer.classList.contains('translate-x-full')) {
            KanbanEvents.toggleFilterPanel();
          }
          return;
        }

        // Ignore single-key shortcuts when typing inside form elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // "N" opens the Create Task Modal
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          KanbanModals.openCreateModal();
        }
      });
    },

    /**
     * Toggles the filter panel right sidebar slide-out
     */
    toggleFilterPanel(e) {
      if (e) e.stopPropagation();
      const drawer = document.getElementById('filters-drawer');
      const overlay = document.getElementById('filters-overlay');
      const btn = document.getElementById('toggle-filters-btn');
      
      if (!drawer || !overlay || !btn) return;

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
    },

    /**
     * Toggles the action menu dropdown
     */
    toggleActionsDropdown(e) {
      if (e) e.stopPropagation();
      const menu = document.getElementById('board-actions-menu');
      if (menu) menu.classList.toggle('hidden');
    },

    /**
     * Closes the action menu dropdown
     */
    closeActionsDropdown() {
      const menu = document.getElementById('board-actions-menu');
      if (menu) menu.classList.add('hidden');
    },

    /* ==========================================================================
       DRAG & DROP MECHANICAL HANDLERS
       ========================================================================== */
    handleDragStart(e, taskId) {
      KanbanState.activeDragTaskId = taskId;
      document.body.classList.add('dragging-active');
      
      const card = document.getElementById(`task-card-${taskId}`);
      if (card) {
        setTimeout(() => {
          card.classList.add('opacity-40');
        }, 0);
      }
      
      e.dataTransfer.setData('text/plain', taskId);
      e.dataTransfer.effectAllowed = 'move';
    },

    handleDragEnd() {
      document.body.classList.remove('dragging-active');
      
      if (KanbanState.activeDragTaskId) {
        const card = document.getElementById(`task-card-${KanbanState.activeDragTaskId}`);
        if (card) {
          card.classList.remove('opacity-40');
        }
      }
      KanbanState.activeDragTaskId = null;
    },

    handleDragOver(e) {
      e.preventDefault();
      const col = e.currentTarget;
      if (col && !col.classList.contains('drag-hover')) {
        col.classList.add('drag-hover');
      }
    },

    handleDragLeave(e) {
      const col = e.currentTarget;
      if (!col) return;
      if (e.relatedTarget && col.contains(e.relatedTarget)) {
        return;
      }
      col.classList.remove('drag-hover');
    },

    handleDrop(e, targetStatus) {
      e.preventDefault();
      const col = e.currentTarget;
      if (col) col.classList.remove('drag-hover');

      const taskId = e.dataTransfer.getData('text/plain');
      const task = KanbanState.tasks.find(t => t.id === taskId);
      
      if (task) {
        const oldStatus = task.status;
        if (oldStatus !== targetStatus) {
          // Dependency constraint logic: moving to Doing or Done
          if (targetStatus === 'Doing' || targetStatus === 'Done') {
            const blocking = KanbanState.checkDependenciesCompleted(task);
            if (blocking.length > 0) {
              // Forced back to To Do
              task.status = 'To Do';
              KanbanState.saveTasks();
              KanbanModals.showDependencyError(task.title, blocking);
              KanbanBoard.renderBoard();
              return;
            }
          }

          task.status = targetStatus;
          task.updatedAt = Date.now().toString(); // Timestamp last modification
          task.history.unshift({
            timestamp: KanbanHelpers.getFormattedTimestamp(),
            action: `Moved from ${oldStatus} to ${targetStatus}`
          });
          KanbanState.saveTasks();
          KanbanBoard.renderBoard();
        }
      }
    }
  };
})();
