# System Architecture / ארכיטקטורת מערכת (v1.3)

---

## Part 1: English - Architecture Design

This document details the software architecture of **LeanKanban v1.3**, a high-density, single-page Kanban board application.

### 1. Architectural Philosophy & Constraints
LeanKanban is designed as a **serverless, client-side, zero-dependency** application. It runs entirely within the user's web browser, persisting state using the browser's web storage API (`localStorage`). 

To address the constraint of allowing users to open the application directly from their filesystem (via the `file://` protocol) without encountering CORS issues (which block modern ES Modules), the application implements the **Namespace Pattern**. All module namespaces are securely attached to the global `window` object, allowing modularity while maintaining local execution compatibility.

---

### 2. Module Breakdown
The application logic is cleanly decomposed into seven distinct logical units housed in the `js/` folder, orchestrated by a central bootstrap entry point (`app.js`):

```text
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
  * Contains stateless helper utilities. Handles HTML escaping (XSS mitigation), formatting timestamps, extracting name initials, and generating deterministic avatar theme classes from string hashes.
* **`KanbanState` (`js/state.js`)**
  * The single source of truth for the application state (the `tasks` array, filter states, and active IDs). Handles serialization/deserialization to `localStorage` and evaluates task blocking statuses based on prerequisite constraints.
* **`KanbanDOM` (`js/dom.js`)**
  * Houses static color dictionaries and provides dynamic ES5 property getters to query and cache DOM elements. This avoids timing bugs caused by querying DOM elements before they are parsed.
* **`KanbanFilters` (`js/filters.js`)**
  * Handles toggling priority filters, building assignee checklists, clearing active filters, and resetting the board state (wiping data or loading demo data).
* **`KanbanBoard` (`js/board.js`)**
  * Responsible for executing the filtering, sorting, and grouping algorithms, producing card component HTML, injecting inline prerequisite lists, updating the dynamic results summary bar with real-time filtered task breakdowns, and updating columns in the DOM.
* **`KanbanModals` (`js/modals.js`)**
  * Controls the visibility, input forms, and data binding for the Create Task, Detail Viewer, Archive drawer, and Delete confirmation. Features **Dynamic HTML Injection** for high-priority modals (like the Dependency Error) to prevent browser rendering conflicts and ghost-clicks. Also handles dark/light theme triggers.
* **`KanbanEvents` (`js/events.js`)**
  * Connects DOM events such as native HTML5 drag-and-drop actions, keyboard hotkeys, and general overlay backdrop clicks.

---

### 3. Data Flow and Synchronization
Every user interaction follows a strict unidirectional flow to ensure data consistency and UI responsiveness:

1. **User Interaction**: The user triggers an event (e.g., drags a card, clicks "Archive", submits the edit form).
2. **State Mutation**: The event handler updates properties in `KanbanState` (e.g., updates a task's status, pushes a new history entry).
3. **Synchronization**: `KanbanState.saveTasks()` is called. This encodes the task list into JSON, stores it in `localStorage`, and updates the global archive badge counter.
4. **Rendering**: `KanbanBoard.renderBoard()` is invoked. It filters tasks according to active filter criteria, sorts them by the selected key, and rebuilds the column card listings.

---

### 4. Prerequisite Dependency Safety & Ghost-Click Prevention (v1.3)
Task prerequisite checks are strictly executed during state modification:
* When a user attempts to drag a task or edit its status to `Doing` or `Done`, the system invokes `KanbanState.checkDependenciesCompleted(task)`.
* If any dependencies are uncompleted, the status change is rejected. The task status defaults back to `To Do` in `KanbanState.tasks`.
* `KanbanModals.showDependencyError()` is triggered to render a dynamic modal listing the blocking titles. This is dynamically injected into the DOM with a micro-delay to prevent HTML5 Drag-and-Drop `mouseup` "ghost clicks" from instantly dismissing the alert.

---
---

## חלק 2: עברית - תיאור הארכיטקטורה (v1.3)

מסמך זה מפרט את ארכיטקטורת התוכנה של יישום ה-**LeanKanban (גרסה 1.3)**, לוח קנבן חד-עמודי בעל צפיפות גבוהה.

### 1. קווי יסוד ואילוצי מערכת
מערכת LeanKanban מתוכננת כיישום **ללא שרת (Serverless), הפועל לחלוטין בצד הלקוח (Client-side) וללא תלויות חיצוניות**. האפליקציה רצה כולה בדפדפן המשתמש ושומרת את מצבה באמצעות ממשק ה-`localStorage`.

על מנת לאפשר למשתמשים לפתוח את היישום ישירות מתוך קובץ מקומי במחשבם (באמצעות פרוטוקול `file://`) ללא היתקלות בשגיאות אבטחת CORS (החוסמות מודולים מסוג ES Modules), היישום מיישם את **תבנית מרחב השמות (Namespace Pattern)**. כל מרחבי השמות של המודולים מוצמדים לאובייקט הגלובלי `window`, דבר המאפשר חלוקה מודולרית נוחה לקבצים תוך שמירה על תאימות מלאה להרצה מקומית.

---

### 2. פירוט המודולים
לוגיקת היישום מחולקת באופן נקי לשבעה קבצים לוגיים נפרדים הממוקמים בתיקייה `js/`, המנוהלים ומאורגנים על ידי מנהל האפליקציה הראשי (`app.js`):

* **`KanbanHelpers` (`js/helpers.js`)**
  * מכיל פונקציות עזר ללא מצב (Stateless). מטפל בנטרול תווים מסוכנים למניעת פרצות אבטחה (XSS), עיצוב חותמות זמן, חילוץ ראשי תיבות של שמות, והפקת צבעי אווטאר קבועים על בסיס שם המשתמש.
* **`KanbanState` (`js/state.js`)**
  * מקור האמת היחיד של מצב האפליקציה (מערך המשימות, פילטרים פעילים ומזהים בטיפול). מטפל בטעינה ושמירה של הנתונים מול ה-`localStorage` ובחישוב חסימות של תלויות קדם בין משימות.
* **`KanbanDOM` (`js/dom.js`)**
  * מכיל מילוני עיצוב קבועים ומאפשר גישה דינמית לרכיבי ה-DOM דרך מאפייני getter. שיטה זו מונעת שגיאות תזמון הנובעות מניסיון גישה לרכיבי HTML לפני שטעינתם הושלמה.
* **`KanbanFilters` (`js/filters.js`)**
  * מטפל בסינון משימות לפי עדיפויות, בניית רשימת מקבלי המשימות הדינמית במגירת הסינון, איפוס סינונים, ושחזור מצב הלוח (ניקוי נתונים או טעינת נתוני דוגמה).
* **`KanbanBoard` (`js/board.js`)**
  * אחראי על הפעלת אלגוריתמי הסינון, המיון והחלוקה של המשימות לעמודות, הפקת ה-HTML המורכב של המשימות (כולל רשימות התלויות החסרות), עדכון שורת סיכום התוצאות הדינמית בזמן אמת, ורענון העמודות ב-DOM.
* **`KanbanModals` (`js/modals.js`)**
  * שולט על הנראות, טפסי הקלט וקישור הנתונים עבור חלונות יצירת משימה, צפייה בפרטים, ארכיון משימות, ואישור מחיקה סופית. מנהל גם את **הזרקת ה-HTML הדינמית** של מסך התראות התלות (Dependency Error) כדי למנוע התנגשויות תצוגה. בנוסף מטפל בהחלפת מצבי תצוגת היום/לילה.
* **`KanbanEvents` (`js/events.js`)**
  * מקשר את אירועי ה-DOM המרכזיים כגון גרירה והשלכה מובנית (HTML5 Drag & Drop), מקשי קיצור של המקלדת, ולחיצה על הרקע לסגירת דיאלוגים.

---

### 3. זרימת נתונים וסנכרון
כל אינטראקציה של המשתמש פועלת בזרימה חד-כיוונית קפדנית להבטחת עקביות הנתונים ומהירות תגובת הממשק:

1. **פעולת משתמש**: המשתמש מבצע אינטראקציה (לדוגמה, גורר כרטיסייה, לוחץ על "העבר לארכיון", או שולח טופס עריכה).
2. **עדכון המצב**: מאזין האירועים (Event Handler) מעדכן את המשתנים בתוך `KanbanState` (למשל, שינוי סטטוס המשימה או הוספת רישום היסטוריה).
3. **סנכרון**: הפונקציה `KanbanState.saveTasks()` נקראת באופן אוטומטי, ממירה את הנתונים לפורמט JSON, שומרת אותם ב-`localStorage` המקומי, ומעדכנת את מספר המשימות בארכיון.
4. **רישום מחדש**: נקראת הפונקציה `KanbanBoard.renderBoard()`, אשר מסננת את המשימות לפי הפילטרים הפעילים, ממיינת אותן לפי הבחירה ומציירת מחדש את כרטיסי המשימות בעמודות המתאימות בלוח.

---

### 4. בטיחות תלויות קדם ומניעת לחיצות-רפאים (Ghost Clicks) - תכונות מגרסה 1.3
בדיקות תלות קדם מתבצעות באדיקות בעת שינוי מצב המשימה:
* כאשר משתמש מנסה להעביר משימה באמצעות גרירה לעמודת `Doing` או `Done`, המערכת מפעילה מיד את `KanbanState.checkDependenciesCompleted(task)`.
* במידה וקיימות משימות קדם שטרם הושלמו, השינוי נדחה והמשימה מוחזרת אוטומטית לעמודת `To Do`.
* המערכת מזריקה בזמן אמת חלון אזהרת תלויות (Modal) דרך `KanbanModals.showDependencyError()` כדי להציג את המשימות החוסמות. פעולה זו מלווה בהשהייה זעירה כדי להתגבר על באג ה"לחיצת-רפאים" (Ghost Click) של הדפדפן שעלול היה לסגור את ההתראה מיד בשחרור העכבר.
