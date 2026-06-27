/**
 * LeanKanban - Application orchestrator and entry point
 */
(function() {
  // Bind module-level handlers to the global window scope to maintain compatibility 
  // with existing inline HTML event handlers (e.g. onclick, onsubmit, ondragover).

  // Global filters and workspace handlers
  window.toggleFilterPanel = (e) => KanbanEvents.toggleFilterPanel(e);
  window.toggleActionsDropdown = (e) => KanbanEvents.toggleActionsDropdown(e);
  window.closeActionsDropdown = () => KanbanEvents.closeActionsDropdown();
  window.togglePriorityFilter = (priority) => KanbanFilters.togglePriorityFilter(priority);
  window.clearAllFilters = () => KanbanFilters.clearAllFilters();
  window.wipeBoard = () => KanbanFilters.wipeBoard();
  window.loadDemoData = () => KanbanFilters.loadDemoData();
  window.expandAllTasks = (expanded) => KanbanFilters.expandAllTasks(expanded);

  // Global Modals handlers
  window.openCreateModal = () => KanbanModals.openCreateModal();
  window.closeCreateModal = () => KanbanModals.closeCreateModal();
  window.handleCreateTask = (e) => KanbanModals.handleCreateTask(e);

  window.openDetailModal = (taskId) => KanbanModals.openDetailModal(taskId);
  window.closeDetailModal = () => KanbanModals.closeDetailModal();
  window.toggleEditMode = (isEdit) => KanbanModals.toggleEditMode(isEdit);
  window.handleEditTask = (e) => KanbanModals.handleEditTask(e);

  window.confirmArchive = () => KanbanModals.confirmArchive();
  window.executeArchive = () => KanbanModals.executeArchive();
  window.cancelDelete = () => KanbanModals.cancelDelete();
  
  window.openArchiveModal = () => KanbanModals.openArchiveModal();
  window.closeArchiveModal = () => KanbanModals.closeArchiveModal();
  window.restoreTask = (taskId) => KanbanModals.restoreTask(taskId);
  window.confirmPermanentDelete = (taskId) => KanbanModals.confirmPermanentDelete(taskId);
  window.emptyArchive = () => KanbanModals.emptyArchive();

  window.closeDependencyErrorModal = () => KanbanModals.closeDependencyErrorModal();
  window.toggleTheme = () => KanbanModals.toggleTheme();

  // Native drag & drop handlers
  window.handleDragOver = (e) => KanbanEvents.handleDragOver(e);
  window.handleDragLeave = (e) => KanbanEvents.handleDragLeave(e);
  window.handleDrop = (e, targetStatus) => KanbanEvents.handleDrop(e, targetStatus);

  // Initialize the Kanban application
  window.addEventListener('DOMContentLoaded', () => {
    // 1. Load tasks from local storage
    KanbanState.loadTasks();

    // 2. Setup listeners and shortcuts
    KanbanEvents.setupEventListeners();
    KanbanEvents.setupKeyboardShortcuts();

    // 3. Initialize visual elements states
    KanbanFilters.updatePriorityPillStyles();
    KanbanFilters.populateAssigneeDropdown();

    // 4. Perform initial board render
    KanbanBoard.renderBoard();
  });
})();
