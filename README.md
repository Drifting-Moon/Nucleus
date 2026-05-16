# ⚛️ Nucleus

**Enterprise Goal & Performance Management Platform**

Built specifically for the **Atomquest Hackathon** (Atomberg problem statement), Nucleus is a comprehensive, role-based internal tool designed to streamline quarterly goal setting, manager reviews, and continuous performance feedback. 

It completely replaces fragmented spreadsheets and legacy processes with a unified, transparent, and user-friendly dashboard.

---

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct, fully secured experiences for **Employees**, **Managers**, and **HR/Admins**.
- **Employee Goal Sheets:** Draft, validate, and submit goals with automatic 100% weightage validation. Supports numeric, percentage, zero-based, and timeline targets.
- **Manager Workflows:** Single-pane-of-glass dashboard for managers to review direct reports, send goals back for rework, and track team completion.
- **Quarterly Check-ins:** Structured pipelines for quarterly progress tracking and continuous feedback.
- **Weighted Scoring Engine:** Real-time computation of individual and team performance scores based on goal achievement versus allocated weightage.
- **Admin Analytics:** Comprehensive HR views including completion heatmaps, QoQ trends, manager effectiveness, and one-click data exports.
- **Enterprise UI:** Built with an emphasis on "User Friendliness" (Evaluation Parameter #3), featuring dark mode, semantic charts, and built-in onboarding guides.

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS, Shadcn UI, Recharts
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Native Auth
- **Deployment:** Vercel

---

## 🚀 Deployment to Vercel

Nucleus is optimized for zero-configuration deployment on Vercel. 

1. **Push your code to GitHub.**
2. Log into **Vercel** and click **Add New Project**.
3. Import your GitHub repository.
4. **Environment Variables:** Before clicking Deploy, you **must** add the following environment variables. You can find these in your Supabase project settings (`Project Settings > API`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically detect the Next.js framework and build the project perfectly.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- `pnpm` package manager
- A Supabase Project

### Setup Instructions
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/YourUsername/Nucleus.git
   cd Nucleus
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file in the root directory and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## 🧪 Quick Test Accounts

The platform comes pre-configured with three robust personas for hackathon judges to evaluate:

| Role | Email | Password |
|---|---|---|
| **Employee** | `emp1@test.com` | `password123` |
| **Manager** | `manager1@test.com` | `password123` |
| **Admin** | `admin@test.com` | `password123` |

*(Note: The login page includes quick-select buttons that can sign in with these demo credentials for rapid testing).*
