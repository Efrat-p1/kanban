/**
 * Kanban board DOM element caching and styles mapping
 */
var KanbanDOM;
(function() {
  KanbanDOM = window.KanbanDOM = {
    // Priority colors styling dictionary
    priorityColors: {
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
    },

    // DOM Getters
    get searchInput() { return document.getElementById('search-input'); },
    get filterPriorityContainer() { return document.getElementById('priority-filter-container'); },
    get filterAssigneeMenu() { return document.getElementById('assignee-dropdown-menu'); },
    get filterTimeSelect() { return document.getElementById('filter-time'); },
    get filterBlockedSelect() { return document.getElementById('filter-blocked'); },
    get sortBySelect() { return document.getElementById('sort-by'); },
    get columns() {
      return {
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
    }
  };
})();
