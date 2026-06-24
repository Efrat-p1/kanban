# LeanKanban - High-Density Minimalist Kanban Board

A premium, client-side, high-density single-page Kanban board application built using pure HTML, vanilla CSS (utilizing Tailwind CSS Play CDN), and vanilla JavaScript. 

Perfect for high-volume task management, featuring a clean modern light-theme, right-hand slide-out filter options panel, and a strict prerequisite dependencies system.

---

## 🚀 Key Features

* **Sleek Light Theme**: Built with a spacious, professional light-mode aesthetic using a slate/zinc gray palette with vibrant indigo, emerald, amber, and rose accents.
* **HTML5 Native Drag-and-Drop**: Easily move task cards between columns (`To Do`, `Doing`, `Done`) with clean drop indicators and drag-hover visual column highlights.
* **Prerequisite Dependencies System**: Establish prerequisites for tasks. The system prevents moving tasks to `Doing` or `Done` if their prerequisites are not yet completed (marked as `Done`), triggering a validation modal and returning the task to the `To Do` column.
* **Spacious Slide-Out Drawer ("Filters & Sort")**: Keeps the board completely clean of cluttered toolbars. Slides out from the right to reveal:
  * **Multi-Select Priority Filter**: Toggle Low, Medium, and High task priorities simultaneously.
  * **Dynamic Assignees Checklist**: Checkbox-based selector pulling active team members from the board.
  * **Blocked Status Selector**: Filter by Blocked / Unblocked status.
  * **Time-Frame Filter**: View tasks created or updated within the last 2 minutes, 1 hour, or 24 hours.
  * **Sort Dropdown**: Order tasks manually, by priority level, alphabetically, or by creation timestamp.
  * **Bulk Controls**: One-click to expand or collapse all cards on the board.
* **Compact Card Expansion**: Tasks are compact by default to display dozens of items at once. You can expand/collapse cards inline using a simple chevron button without opening any modal dialogs.
* **Activity & History Timeline**: Each task has an automatic log tracking its history (creation, status updates, title/description edits, archiving, and restoration).
* **Archive Bin (Soft Delete)**: Prevent accidental data loss. Deleting cards moves them to a secure archive drawer where they can be restored back to their status column or permanently deleted.
* **Keyboard Shortcuts**:
  * Press `N` to open the **New Task** modal.
  * Press `ESC` to close all modals, confirm dialogs, or the filter drawer.
* **Zero Backend / Serverless**: Operates entirely in the browser, persisting the board state directly to `localStorage` across page reloads. Includes 10 default mock tasks on first launch.

---

## 🛠️ How to Run

Since the application is fully client-side, no installation or compilation is needed.

### Option A: Local Browser Open
Simply double-click `index.html` on your computer to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option B: Local Web Server (Recommended)
To run it on a local server, navigate to the folder in your terminal and run:

```bash
# Using Python 3
python -m http.server 8080
```

Then open your browser and navigate to:
[http://localhost:8080](http://localhost:8080)

---

## 📂 File Structure

```
3_kanban/
│
├── index.html        # Main self-contained application (HTML, CSS, JS)
└── README.md         # Documentation file
```

---

## 📋 Data Model

Each task object is structured as follows in `localStorage` under the key `lean_kanban_tasks_v7`:

```typescript
interface Task {
  id: string;            // Creation timestamp (UUID equivalent)
  updatedAt: string;     // Last modification timestamp
  title: string;         // Subject of the task
  description: string;   // Details/Description
  assignee: string;      // Assigned employee name
  priority: 'low' | 'medium' | 'high';
  status: 'To Do' | 'Doing' | 'Done';
  archived: boolean;     // Soft-deleted state
  expanded: boolean;     // Inline collapse state
  dependencies: string[]; // List of parent Task IDs
  history: Array<{
    timestamp: string;   // Formatted timestamp (YYYY-MM-DD HH:MM)
    action: string;      // Log action description
  }>;
}
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
