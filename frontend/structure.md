/src
├── /api/
│   └── apiClient.js       # Central Axios instance setup and interceptors
├── /assets/               # Images, logos, etc.
├── /components/
│   ├── /ui/               # Reusable UI elements (cards, loaders, modals)
│   └── /layout/           # Navbar, Footer, MainLayout
├── /hooks/                # Custom hooks (e.g., useAuth)
├── /lib/                  # Utility functions (e.g., date formatting)
├── /pages/
│   ├── /auth/             # Login, Register pages
│   ├── /student/          # All student-facing pages
│   └── /teacher/          # All teacher-facing pages
├── /store/
│   └── authStore.js       # Zustand store for authentication state
├── App.jsx                # Main component with routing setup
└── main.jsx               # Entry point of the application