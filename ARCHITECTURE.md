# System Architecture / ארכיטקטורת מערכת

---

## Part 1: English - Architecture Design

This document details the software architecture of LeanKanban, a high-density single-page Kanban board application.

### 1. Architectural Philosophy & Constraints
LeanKanban is designed as a **serverless, client-side, zero-dependency** application. It runs entirely within the user's web browser, persisting state using the browser's web storage API (`localStorage`). 

To address the constraint of allowing users to open the application directly from their filesystem (via the `file://` protocol) without encountering CORS issues (which block modern ES Modules), the application implements the **Namespace Pattern**. All module namespaces are attached to the global `window` object, allowing modularity while maintaining local execution compatibility.

---

### 2. Module Breakdown
The application logic is decomposed into seven distinct logical units housed in the `js/` folder, orchestrated by a central bootstrap entry point (`app.js`):

```
                     ┌──────────────────┐
                     │    index.html    │ (Main UI & Layout)
                     └────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │      app.js       │ (Entry Point & Global Bridge)
                    └────┬──────────┬───┘
                         │          │
        ┌────────────────┼──────────┼────────────────┐
        │                │          │                │
┌───────▼───────┐┌───────▼───────┐┌──▼────────────┐┌─▼─────────────┐
│  helpers.js   ││   state.js    ││    dom.js     ││  filters.js   │
│(Pure Helpers) ││ (State & Sync)││(Cached Getters││ (Filter/Sort) │
└───────────────┘└───────┬───────┘└───────────────┘└───────────────┘
                         │
        ┌────────────────┼───────────────────────────┐
        │                │                           │
┌───────▼───────┐┌───────▼───────┐           ┌───────▼───────┐
│   board.js    ││   events.js   │           │   modals.js   │
│(Card & Board  ││ (Drag/Drop &  │           │ (Dialogs &    │
│ Rendering)    ││  Listeners)   │           │  Theme Toggles│
└───────────────┘└───────────────┘           └───────────────┘
```

* **`KanbanHelpers` (`js/helpers.js`)**
  * Contains stateless helper functions. Handles HTML escaping (XSS mitigation), formatting timestamps, extracting name initials, and generating deterministic avatar theme classes from string hashes.
* **`KanbanState` (`js/state.js`)**
  * The single source of truth for the application state (`tasks` array, filter states, and active items). Handles serialization/deserialization to `localStorage` and evaluates task blocking statuses based on prerequisite constraints.
* **`KanbanDOM` (`js/dom.js`)**
  * Houses static color dictionaries and provides dynamic ES5 property getters to query and cache DOM elements. This avoids timing bugs caused by querying DOM elements before they are parsed.
* **`KanbanFilters` (`js/filters.js`)**
  * Handles toggling priority filters, building assignee checklists, clearing active filters, and resetting the board state (wiping data or loading demo data).
* **`KanbanBoard` (`js/board.js`)**
  * Responsible for executing the filtering, sorting, and grouping algorithms, producing card component HTML, and updating columns in the DOM.
* **`KanbanModals` (`js/modals.js`)**
  * Controls the visibility, input forms, and data binding for the Create Task, Detail Viewer, Archive drawer, Delete confirmation, and Dependency Error dialogs. Also handles dark/light theme triggers.
* **`KanbanEvents` (`js/events.js`)**
  * Connects DOM events such as native HTML5 drag-and-drop actions, keyboard hotkeys, and general overlay backdrop clicks.

---

### 3. Data Flow and Synchronization
Every user interaction follows a unidirectional flow to ensure data consistency and UI responsiveness:

1. **User Interaction**: The user triggers an event (e.g., drags a card, clicks "Archive", submits the edit form).
2. **State Mutation**: The event handler updates properties in `KanbanState` (e.g., updates a task's status, pushes a new history entry).
3. **Synchronization**: `KanbanState.saveTasks()` is called. This encodes the task list into JSON, stores it in `localStorage`, and updates the global archive badge counter.
4. **Rendering**: `KanbanBoard.renderBoard()` is invoked. It filters tasks according to active filter criteria, sorts them by the selected key, and rebuilds the column card listings.

---

### 4. Prerequisite Dependency Safety
Task prerequisite checks are executed during state modification:
* When a user attempts to drag a task or edit its status to `Doing` or `Done`, the system invokes `KanbanState.checkDependenciesCompleted(task)`.
* If any dependencies are uncompleted, the status change is rejected. The task status defaults back to `To Do` in `KanbanState.tasks`.
* `KanbanModals.showDependencyError()` is triggered to render a modal listing the blocking titles, and `KanbanBoard.renderBoard()` refreshes the visual columns.

---
---

## חלק 2: עברית - תיאור הארכיטקטורה

מסמך זה מפרט את ארכיטקטורת התוכנה של יישום ה-LeanKanban, לוח קנבן חד-עמודי בעל צפיפות גבוהה.

### 1. קווי יסוד ואילוצי מערכת
מערכת LeanKanban מתוכננת כיישום **ללא שרת (Serverless), הפועל לחלוטין בצד הלקוח (Client-side) וללא תלויות חיצוניות**. האפליקציה רצה כולה בדפדפן המשתמש ושומרת את מצבה באמצעות ממשק ה-`localStorage`.

על מנת לאפשר למשתמשים לפתוח את היישום ישירות מתוך קובץ מקומי במחשבם (באמצעות פרוטוקול `file://`) ללא היתקלות בשגיאות אבטחת CORS (החוסמות מודולים מסוג ES Modules), היישום מיישם את **תבנית מרחב השמות (Namespace Pattern)**. כל מרחבי השמות של המודולים מוצמדים לאובייקט הגלובלי `window`, דבר המאפשר חלוקה מודולרית נוחה לקבצים תוך שמירה על תאימות להרצה מקומית.

---

### 2. פירוט המודולים
לוגיקת היישום מחולקת לשבעה קבצים לוגיים נפרדים הממוקמים בתיקייה `js/`, המנוהלים ומאורגנים על ידי מנהל האפליקציה הראשי (`app.js`):

* **`KanbanHelpers` (`js/helpers.js`)**
  * מכיל פונקציות עזר ללא מצב (Stateless). מטפל בנטרול תווים מסוכנים למניעת פרצות אבטחה (XSS), עיצוב חותמות זמן, חילוץ ראשי תיבות של שמות, והפקת צבעי אווטאר קבועים על בסיס שם המשתמש.
* **`KanbanState` (`js/state.js`)**
  * מקור האמת היחיד של מצב האפליקציה (מערך המשימות, פילטרים פעילים ומזהים בטיפול). מטפל בטעינה ושמירה של הנתונים מול ה-`localStorage` ובחישוב תלויות קדם בין משימות.
* **`KanbanDOM` (`js/dom.js`)**
  * מכיל מילוני עיצוב קבועים ומאפשר גישה דינמית לרכיבי ה-DOM דרך מאפייני getter. שיטה זו מונעת שגיאות הנובעות מניסיון גישה לרכיבי HTML לפני שטעינתם הושלמה.
* **`KanbanFilters` (`js/filters.js`)**
  * מטפל בסינון משימות לפי עדיפויות, בניית רשימת מקבלי המשימות בדוח הסינון, איפוס סינונים, ושחזור מצב הלוח (ניקוי נתונים או טעינת נתוני דוגמה).
* **`KanbanBoard` (`js/board.js`)**
  * אחראי על הפעלת אלגוריתמי הסינון, המיון והחלוקה של המשימות לעמודות, הפקת ה-HTML של המשימות, ורענון העמודות ב-DOM.
* **`KanbanModals` (`js/modals.js`)**
  * שולט על הנראות, טפסי הקלט וקישור הנתונים עבור חלונות יצירת משימה, צפייה בפרטים, ארכיון משימות, אישור מחיקה סופית ושגיאות תלות קדם. כמו כן מנהל את החלפת מצבי תצוגת היום/לילה.
* **`KanbanEvents` (`js/events.js`)**
  * מקשר את אירועי ה-DOM כגון גרירה והשלכה מובנית (HTML5 Drag & Drop), מקשי קיצור של המקלדת, ולחיצה על הרקע לסגירת דיאלוגים.

---

### 3. זרימת נתונים וסנכרון
כל אינטראקציה של המשתמש פועלת בזרימה חד-כיוונית להבטחת עקביות הנתונים ומהירות תגובת ממשק המשתמש:

1. **פעולת משתמש**: המשתמש מבצע אינטראקציה (לדוגמה, גורר כרטיסייה, לוחץ על "העבר לארכיון", או שולח טופס עריכה).
2. **עדכון המצב**: מאזין האירועים מעדכן את המשתנים בתוך `KanbanState` (למשל, שינוי סטטוס המשימה או הוספת רישום היסטוריה).
3. **סנכרון**: הפונקציה `KanbanState.saveTasks()` נקראת באופן אוטומטי, ממירה את הנתונים לפורמט JSON, שומרת אותם ב-`localStorage` ומעדכנת את מספר המשימות בארכיון.
4. **רישום מחדש**: נקראת הפונקציה `KanbanBoard.renderBoard()`, אשר מסננת את המשימות לפי הפילטרים הפעילים, ממיינת אותן ומציירת מחדש את כרטיסי המשימות בעמודות המתאימות בלוח.

---

### 4. בטיחות תלויות קדם
בדיקות תלות קדם מתבצעות בעת שינוי מצב המשימה:
* כאשר משתמש מנסה להעביר משימה לעמודת `Doing` או `Done`, המערכת מפעילה את `KanbanState.checkDependenciesCompleted(task)`.
* במידה וקיימות משימות קדם שטרם הושלמו, השינוי נדחה והמשימה מוחזרת אוטומטית לעמודת `To Do`.
* המערכת מציגה את חלון אזהרת התלויות דרך `KanbanModals.showDependencyError()` כדי להציג את המשימות החוסמות, ומבצעת רענון חזותי ללוח.
