# Jobtica - Full-Stack Government Job Portal & Admin Panel

Jobtica is a comprehensive, full-stack single-page application (SPA) built with React. It serves as a portal for government job notifications, featuring a public-facing website for job seekers and a complete, secure admin panel for managing all site content.

The application is built on a modern architecture using a **React (Vite) frontend**, an **Express.js backend**, and a **MySQL database**, optimized for deployment on Vercel.

## Features

### Public Website
- **Dynamic Job Listings:** A clean, searchable, and paginated job board.
- **Advanced Search & Filter:** Users can filter jobs by keyword, department, and qualification, and sort by posted or last date.
- **SEO-Optimized Detail Pages:** All job and blog pages are dynamically rendered with SEO-friendly URLs, titles, meta descriptions, and structured data (Schema.org's `JobPosting` and `Article` schemas) to improve search engine visibility.
- **Content Sections:** Dedicated sections for Exam Notices, Latest Results, and a full-featured Blog with category filtering.
- **Exam Preparation:** A central hub for affiliate courses and recommended books to help users prepare for exams.
- **Responsive Design:** A fully mobile-friendly layout ensures a seamless experience on all devices.
- **Automated SEO:** Dynamically generated `sitemap.xml` and `robots.txt` for optimal search engine crawling.
- **User Engagement:** Includes a newsletter subscription form and a contact page for user inquiries.
- **Dynamic Theming:** The entire site's color scheme can be changed from the admin panel.
- **Content Protection:** Optional feature to disable text selection, right-clicking, and printing to deter content theft.

### Admin Panel (`/admin`)
- **Secure Authentication:** Admin access is protected by server-side authentication using `iron-session` for encrypted, cookie-based sessions.
- **Demo User Mode:** A safe, sandboxed mode for demonstrating admin panel features with restricted permissions.
- **Comprehensive Dashboard:** An overview of site statistics (active jobs, subscribers) and quick actions.
- **Full CRUD Management:**
    - **Job Listings:** Includes bulk CSV upload and a manual notification parsing helper.
    - **Content Posts:** Manage the Blog, Exam Notices, and Results.
    - **Exam Preparation:** Add and manage affiliate Courses, Books, and Upcoming Exam deadlines.
    - **Site Elements:** Control Quick Links and the Breaking News ticker.
- **Audience Management:** View contact form submissions and manage the subscriber list (with CSV export).
- **Marketing Suite:**
    - **Email Campaigns:** A composer to send custom emails to all subscribers, with support for templates.
    - **Ad Management:** Control Sponsored Ads and a configurable Popup Ad for the public site.
- **System-wide Settings:**
    - **General:** Set the site title, upload a logo, and toggle maintenance mode.
    - **SEO:** Configure global meta tags, social media (Open Graph) previews, and schema toggles.
    - **Advertisements:** A central library for ad network codes, placement control, and an A/B testing simulation mode.
    - **Theme:** A color picker to customize the site's primary and accent colors instantly.
    - **Security:** Manage Content Security Policy (CSP), session timeouts, and demo mode permissions.
- **Activity Logs:** A complete, timestamped audit trail of all admin actions for security and monitoring.

## Tech Stack
- **Frontend:** React 18, Vite, TypeScript
- **Backend:** Node.js, Express.js (as a Vercel Serverless Function)
- **Database:** MySQL (via `mysql2` driver)
- **Authentication:** `iron-session` (for encrypted, cookie-based sessions)
- **Styling:** Tailwind CSS (via CDN), Font Awesome

## Project Structure
```
/
├── api/                  # Express.js backend server (runs as a Serverless Function on Vercel)
│   ├── index.js          # Main Express server entry point for Vercel
│   └── ...               # Route handler files
├── components/           # Reusable React components (public and admin)
│   ├── admin/            # Components specific to the admin panel
│   └── ...
├── contexts/             # React Context for global state (AuthContext, DataContext)
├── pages/                # Top-level page components used for client-side routing
├── lib/                  # Shared server-side logic (database connection, session config)
├── App.tsx               # Main application component with client-side routing logic
├── index.tsx             # Application entry point
├── vercel.json           # Deployment configuration for Vercel
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This documentation file
```

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)
- A local MySQL server instance.

### Installation & Running
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd jobtica-portal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Environment Variables:**
    - Create a file named `.env` in the root of the project.
    - Add your MySQL database connection string:
      ```
      # Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
      DATABASE_URL="mysql://root:password@localhost:3306/jobtica"
      ```
    - Add a secret for session encryption (a random string of at least 32 characters):
      ```
      SESSION_SECRET="your_long_random_secret_for_session_encryption"
      ```

4.  **Run the development server:**
    - The `dev` script uses `concurrently` to run both the Vite frontend dev server and the Express backend API in a single terminal.
      ```bash
      npm run dev
      ```
    The application will be available at `http://localhost:5173`. Vite is configured to proxy API requests from `/api` to the backend running on port 3001.

### Admin Access
- Navigate to `/admin`.
- On your first visit, the app will prompt you to create a secure admin account (this only happens if no users exist in the database).
- On subsequent visits, you will use the standard login page.

## Deployment to Vercel
This project is configured for seamless deployment to **Vercel**. The `vercel.json` file handles the necessary build commands and rewrite rules.

1.  **Push to GitHub:** Create a new repository on GitHub and push your project code.
2.  **Create a New Project on Vercel:**
    - From your Vercel dashboard, click "Add New..." -> "Project".
    - Import your GitHub repository. Vercel will automatically detect the Vite preset and use the configuration from `vercel.json`.
3.  **Configure Environment Variables:**
    - In the project settings on Vercel, navigate to "Settings" -> "Environment Variables".
    - Add the following secrets:
      - `DATABASE_URL`: Your full MySQL database connection string.
      - `SESSION_SECRET`: A secure, random string of at least 32 characters for session encryption.
4.  **Deploy:** Click "Deploy". Vercel will build the frontend, deploy the Express API as a serverless function, and make your site live.
