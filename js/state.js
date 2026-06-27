/**
 * Kanban board state management
 */
var KanbanState;
(function() {
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
      dependencies: [id1],
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
      dependencies: [id7],
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

  KanbanState = window.KanbanState = {
    // App State properties
    tasks: [],
    activeDragTaskId: null,
    taskToDeleteId: null,
    isDeletingPermanently: false,

    // Filter states
    activePriorities: ['low', 'medium', 'high'],
    activeAssignees: [],

    // Exposed constants
    mockTasks,

    /**
     * Load tasks from LocalStorage
     */
    loadTasks() {
      const stored = localStorage.getItem('lean_kanban_tasks_v7');
      if (stored) {
        try {
          this.tasks = JSON.parse(stored);
          this.tasks.forEach(t => {
            if (t.archived === undefined) t.archived = false;
            if (t.expanded === undefined) t.expanded = false;
            if (t.dependencies === undefined) t.dependencies = [];
          });
        } catch (e) {
          console.error("Error parsing localstorage tasks. Reverting to default.", e);
          this.tasks = JSON.parse(JSON.stringify(mockTasks));
          this.saveTasks();
        }
      } else {
        this.tasks = JSON.parse(JSON.stringify(mockTasks));
        this.saveTasks();
      }
    },

    /**
     * Save tasks to LocalStorage
     */
    saveTasks() {
      localStorage.setItem('lean_kanban_tasks_v7', JSON.stringify(this.tasks));
      
      // Update archive count badge
      const archivedCount = this.tasks.filter(t => t.archived).length;
      const archiveCountBadge = document.getElementById('archive-count');
      if (archiveCountBadge) {
        archiveCountBadge.textContent = archivedCount;
      }
    },

    /**
     * Verify if all pre-requisite task dependencies are completed
     * @param {Object} task 
     * @returns {string[]} titles of blocking uncompleted tasks
     */
    checkDependenciesCompleted(task) {
      console.log("state.js: checkDependenciesCompleted called for task:", task.title, "dependencies list:", task.dependencies);
      const deps = task.dependencies || [];
      const uncompleted = [];

      deps.forEach(depId => {
        const depTask = this.tasks.find(t => t.id === depId);
        console.log("state.js: evaluating dependency ID:", depId, "found task:", depTask ? depTask.title : null, "status:", depTask ? depTask.status : null);
        if (!depTask || depTask.archived || depTask.status !== 'Done') {
          uncompleted.push(depTask ? depTask.title : `Unknown Task (#${depId})`);
        }
      });

      console.log("state.js: uncompleted dependencies for task:", task.title, "is:", uncompleted);
      return uncompleted;
    },

    /**
     * Helper to verify if a task is currently blocked
     * @param {Object} task 
     * @returns {boolean}
     */
    isTaskBlocked(task) {
      if (task.status === 'Done') return false; // Done tasks are never blocked
      return this.checkDependenciesCompleted(task).length > 0;
    }
  };
})();
