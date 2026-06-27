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

## 💻 System Requirements / דרישות מערכת

### English
* **Modern Web Browser**: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+, or any other browser supporting ES5/ES6 and standard CSS.
* **Storage Permission**: Local storage enabled (essential for task persistence across page loads).
* **Internet Connection**: Optional. An active connection is needed during the first load to pull Tailwind CSS (CDN Play) and Google Fonts.
* **Optional Server (Recommended)**: Python 3+ or another static HTTP server tool for local deployment (needed to run Option B).

### עברית
* **דפדפן אינטרנט מודרני**: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+, או כל דפדפן אחר התומך ב-ES5/ES6 ו-CSS סטנדרטי.
* **הרשאות אחסון**: Local Storage מופעל בדפדפן (חיוני עבור שמירת המשימות בין טעינות עמודים).
* **חיבור לאינטרנט**: אופציונלי. חיבור פעיל נדרש בטעינה הראשונה כדי למשוך את Tailwind CSS (CDN Play) ופונטים של Google.
* **שרת אופציונלי (מומלץ)**: Python 3+ או כל כלי שרת HTTP סטטי אחר להרצה מקומית (נדרש להרצת אפשרות ב').

---

## 📂 File Structure

```
3_kanban/
│
├── js/                   # Modular application logic files
│   ├── helpers.js        # Core helper utilities (XSS escaping, avatar hashes)
│   ├── state.js          # App state registry, persistence and dependency validation
│   ├── dom.js            # CSS dictionaries and DOM cache element getters
│   ├── filters.js        # Multi-select filters, sort triggers and state resets
│   ├── board.js          # Board visual rendering, grouping and card generation
│   ├── modals.js         # Dialog modal controller layers and theme switches
│   └── events.js         # Listeners setup, hotkeys and native drag-and-drop
│
├── index.html            # Main HTML layout structure
├── styles.css            # Custom CSS styling and scrollbars
├── app.js                # Bootstrap orchestrator and HTML inline variables mapper
└── README.md             # Documentation file
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
