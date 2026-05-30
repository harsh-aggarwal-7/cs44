# 🎯 AnswerHub

AnswerHub is a complete, production-ready, community-driven Q&A and FAQ platform designed for institutional portals and university hubs. Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Supabase**, it features a secure role-based access control system and a unique moderated answer pipeline to ensure content quality and institutional integrity.

---

## 🌟 Key Product Features

### 👤 Role-Based Access Control (RBAC)
*   **Guest:** Can browse verified answers, search questions, view FAQ quick summaries, and filter by categories.
*   **Registered User:** Can sign up/in (via email/password), ask new questions (with duplicate detection warning and file attachments), submit answers, edit their own submissions, upvote questions/answers, and track notifications.
*   **Admin:** Has access to a comprehensive **Moderation Dashboard** to review pending answers, approve/reject answers, add admin notes, flag content as spam, run bulk operations, and monitor platform metrics.

### 🛡️ Moderated Answer Verification Pipeline
*   **Core Rule:** Answers submitted by users remain **private** and are only visible to the author and admins until they are verified by an administrator.
*   **Real-time Notifications:** Authors are instantly notified via an in-app notification bell when their submitted answers are approved, rejected, or flagged, along with custom admin feedback notes.

### 🧠 Smart Duplicate Question Warning
*   Uses **Fuse.js** fuzzy matching algorithms to scan existing questions in real-time as a user types.
*   Presents a helpful duplicate warning modal displaying matching questions and similarity scores before submission, giving users the choice to view existing answers or "Ask Anyway".

### 🚫 Automatic Heuristic Spam Detector
*   An inline, automatic spam analyzer scans answers upon submission for repeated characters, excessive URLs, promotional keywords, and excessive uppercase letters.
*   Flagged answers are automatically redirected to the admin moderation queue as `spam`, preserving feed hygiene.

### 🎨 Premium Dark/Light UI System
*   Curated Indigo/Violet color palette with advanced glassmorphism cards (`backdrop-blur-xl bg-white/80`).
*   Smooth micro-interactions powered by **Framer Motion** (animated counts, layout reflows, page transitions).
*   Built-in theme toggle with `localStorage` state persistence.

---

## 💻 Technology Stack

*   **Frontend Core:** React 19, Vite, React Router, React Hook Form
*   **Styling & Icons:** Tailwind CSS v4 (CSS-first engine), Lucide Icons
*   **Animations:** Framer Motion
*   **Backend & DB:** Supabase (PostgreSQL, Auth, Storage, Realtime Pub/Sub, Edge Triggers)
*   **Search Engine:** Fuse.js (Client-side fuzzy query engine)

---

## 🚀 Getting Started

### 📋 Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A free [Supabase](https://supabase.com) account

### 🛠️ Installation & Setup

1.  **Clone & Install Dependencies:**
    ```bash
    git clone https://github.com/sonivishal66666/Answerhub.git
    cd Answerhub
    npm install
    ```

2.  **Database Initialization:**
    *   Create a new project on your **Supabase Dashboard**.
    *   Go to **SQL Editor** in the left sidebar and click **New Query** -> **Blank Query**.
    *   Copy the entire SQL schema script located in [supabase/schema.sql](supabase/schema.sql) and paste it into the editor.
    *   Click **Run** to set up tables, triggers, search analytics, and seed categories.

3.  **Storage Configuration:**
    *   In the Supabase Dashboard, navigate to **Storage**.
    *   Click **New Bucket** and name it `attachments`.
    *   Make sure to toggle **Public Bucket** to **ON** (required for hosting image and document attachments) and click **Create**.

4.  **Local API Configuration:**
    *   Our app's Supabase connection has been pre-configured directly inside the client engine. No additional `.env` variables are required for immediate execution.
    *   To view or manage database endpoints, refer to the client file:
        *   [`src/config/supabase.js`](src/config/supabase.js)

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

6.  **Build for Production:**
    ```bash
    npm run build
    ```

---

## 📂 Database Architecture

The PostgreSQL database is organized into **8 core tables** with strict relational constraints and Row-Level Security (RLS) policies:

*   `users`: Syncs automatically with Supabase `auth.users` via database triggers, maintaining custom display names, avatars, and roles (`user`/`admin`).
*   `categories`: Stores navigation headers (e.g. Placements, DSA, Hostel).
*   `questions`: Holds user inquiries, views counters, upvotes, and attachment URLs.
*   `answers`: Houses answers linked to questions, tracking verification status (`pending`/`verified`/`rejected`/`spam`).
*   `notifications`: Tracks real-time, user-specific notifications for approved answers.
*   `question_upvotes` & `answer_upvotes`: Prevents duplicate voting through unique composite keys.
*   `search_analytics`: Stores search histories and queries to generate trending keyword lists.

---

## 🔑 Activating the Admin Dashboard

To gain access to the Moderation Dashboard and manage submitted answers:
1.  Navigate to your running website and click **Sign Up** to create an account.
2.  Go to your **Supabase Dashboard** -> **Table Editor** -> select the `users` table.
3.  Locate your row, double-click the `role` column, change the value from `'user'` to `'admin'`, and press Enter to save.
4.  Refresh your browser. An **Admin** link will appear in the navigation bar, granting you access to the metrics cards, bulk approval tools, and user queues.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
