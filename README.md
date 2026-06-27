# LeanKanban v1.3 - לוח קנבן מינימליסטי ומתקדם
(For English, see below)

אפליקציית לוח קנבן (Kanban) מתקדמת ברמת פרימיום, הפועלת כולה בצד לקוח (Client-Side). היא בנויה מ-HTML נקי, CSS בסיסי (בתוספת Tailwind CSS Play CDN), ו-JavaScript טהור (Vanilla).

מושלמת לניהול משימות בהיקף גבוה, מתאפיינת בעיצוב מודרני ונקי (תצוגת יום/לילה), פאנל סינונים נשלף בצד ימין, ומערכת קפדנית לניהול תלויות (Prerequisites) בין משימות.

---

## 🚀 תכונות מרכזיות

* **עיצוב מודרני ומהיר**: בנוי עם אסתטיקה נקייה ומקצועית, עם פלטת צבעי אפור (Slate/Zinc) בשילוב צבעי הדגשה (אינדיגו, אמרלד, ענבר וורוד).
* **גרירה והשלכה טבעית (HTML5 Drag-and-Drop)**: העברה קלה של כרטיסיות משימות בין העמודות (`לביצוע`, `בתהליך`, `בוצע`) עם סמני השלכה ברורים והדגשת צבע בעת גרירה.
* **שורת סיכום דינמית**: תצוגה חיה של סך המשימות, המשימות המוצגות לאחר סינון, ופירוט לפי עדיפות ממש מעל הלוח.
* **מערכת תלויות (Prerequisite Dependencies)**: הגדרת משימות מקדימות לכל משימה. המערכת מונעת העברת משימות לעמודות `בתהליך` או `בוצע` אם המשימות המקדימות שלהן טרם הושלמו. במקרה כזה, קופצת התראת שגיאה ברורה, מפרטת את המשימות החסרות על הכרטיסייה עצמה והמשימה חוזרת אוטומטית לעמודת ה`לביצוע`.
* **מגירת סינונים ומיון צדדית נשלפת**: שומרת על הלוח נקי מסרגלי כלים עמוסים. המגירה נשלפת מימין וחושפת:
  * **סינון עדיפויות מרובה**: הפעלה או כיבוי של עדיפויות נמוכה, בינונית וגבוהה במקביל.
  * **רשימת אחראים דינמית**: אפשרות לסנן לפי אנשי צוות פעילים המופיעים בלוח.
  * **סינון מצב נעילה**: סינון משימות חסומות/פנויות.
  * **סינון לפי מסגרת זמן**: צפייה במשימות שנוצרו או עודכנו בשעתיים האחרונות, ב-24 השעות האחרונות או אי פעם.
  * **מיון חכם**: סידור משימות ידני, לפי רמת עדיפות, אלפביתי או לפי תאריך יצירה.
  * **פקדי פעולה קבוצתית**: הרחבה או כיווץ של כל הכרטיסים בלוח בלחיצת כפתור אחת.
* **הרחבה וכיווץ כרטיסיות**: המשימות מוצגות באופן קומפקטי כברירת מחדל, כדי לאפשר צפייה בעשרות פריטים בו-זמנית. ניתן להרחיב ולכווץ כל כרטיסיה בעזרת כפתור חץ קטן (Chevron) ללא פתיחת חלונות קופצים, ולראות בהן גם את המשימות המקדימות שחסרות.
* **היסטוריית פעולות (Timeline)**: לכל משימה יש יומן אוטומטי העוקב אחר ההיסטוריה שלה (יצירה, עדכוני סטטוס, שינויי שם/תיאור, העברה לארכיון ושחזור).
* **מגירת ארכיון (מחיקה רכה - Soft Delete)**: הגנה מפני אובדן נתונים בטעות. מחיקת כרטיסיות מעבירה אותן למגירת ארכיון מאובטחת, משם ניתן לשחזר אותן לעמודה המקורית או למחוק אותן לצמיתות.
* **קיצורי מקלדת**:
  * הקש `N` לפתיחת מסך יצירת משימה חדשה.
  * הקש `ESC` לסגירת כל החלונות, אישור דיאלוגים או סגירת מגירת הסינונים.
* **ללא שרת / ללא בסיס נתונים (Zero Backend / Serverless)**: פועל לחלוטין בתוך הדפדפן, ושומר את מצב הלוח ישירות ב-`localStorage` המקומי כך שהנתונים נשמרים בין טעינות של הדף. כולל 10 משימות דוגמה בהפעלה ראשונה.

---

## 🛠️ כיצד להריץ

מכיוון שהאפליקציה פועלת במלואה בצד הלקוח, אין צורך בהתקנה או בהידור (Compilation).

### אפשרות א': פתיחה ישירה בדפדפן מקומי
פשוט לחץ לחיצה כפולה על הקובץ `index.html` במחשב שלך כדי לפתוח אותו ישירות בכל דפדפן אינטרנט מודרני (Chrome, Edge, Firefox, Safari).

### אפשרות ב': שרת אינטרנט מקומי (מומלץ)
כדי להריץ אותו על שרת מקומי, נווט לתיקייה בשורת הפקודה (Terminal) והרץ:

```bash
# Using Python 3
python -m http.server 8080
```

לאחר מכן פתח את הדפדפן ונווט לכתובת:
[http://localhost:8080](http://localhost:8080)

---

## 💻 דרישות מערכת

* **דפדפן אינטרנט מודרני**: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+, או כל דפדפן אחר התומך ב-ES5/ES6 ו-CSS סטנדרטי.
* **הרשאות אחסון**: Local Storage מופעל בדפדפן (חיוני עבור שמירת המשימות בין טעינות עמודים).
* **חיבור לאינטרנט**: אופציונלי. חיבור פעיל נדרש בטעינה הראשונה כדי למשוך את Tailwind CSS (CDN Play) ופונטים של Google.
* **שרת אופציונלי (מומלץ)**: Python 3+ או כל כלי שרת HTTP סטטי אחר להרצה מקומית (נדרש להרצת אפשרות ב').

---
---

# English Documentation

# LeanKanban - High-Density Minimalist Kanban Board

A premium, client-side, high-density single-page Kanban board application built using pure HTML, vanilla CSS (utilizing Tailwind CSS Play CDN), and vanilla JavaScript. 

Perfect for high-volume task management, featuring a clean modern light/dark-theme, right-hand slide-out filter options panel, and a strict prerequisite dependencies system.

---

## 🚀 Key Features

* **Sleek Light/Dark Theme**: Built with a spacious, professional aesthetic using a slate/zinc gray palette with vibrant indigo, emerald, amber, and rose accents.
* **HTML5 Native Drag-and-Drop**: Easily move task cards between columns (`To Do`, `Doing`, `Done`) with clean drop indicators and drag-hover visual column highlights.
* **Dynamic Results Summary Bar**: Live overview of total tasks, tasks currently showing, and a priority breakdown of filtered results right above the board.
* **Prerequisite Dependencies System**: Establish prerequisites for tasks. The system prevents moving tasks to `Doing` or `Done` if their prerequisites are not yet completed (marked as `Done`), dynamically injecting a validation modal, marking missing prerequisites on the cards, and returning the task to the `To Do` column.
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

## 💻 System Requirements

* **Modern Web Browser**: Chrome 90+, Edge 90+, Firefox 90+, Safari 15+, or any other browser supporting ES5/ES6 and standard CSS.
* **Storage Permission**: Local storage enabled (essential for task persistence across page loads).
* **Internet Connection**: Optional. An active connection is needed during the first load to pull Tailwind CSS (CDN Play) and Google Fonts.
* **Optional Server (Recommended)**: Python 3+ or another static HTTP server tool for local deployment (needed to run Option B).

---

## 📂 File Structure

\`\`\`
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
\`\`\`

---

## 📋 Data Model

Each task object is structured as follows in `localStorage` under the key `lean_kanban_tasks_v7`:

\`\`\`typescript
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
\`\`\`

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
