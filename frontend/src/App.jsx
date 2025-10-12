import { Routes, Route, Outlet } from 'react-router-dom';

// A placeholder for our main layout component
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-md p-4">
        <h1 className="text-xl font-bold">Shikshak Navbar</h1>
      </nav>
      <main className="p-8">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Add main routes here later */}
        <Route index element={<div>Welcome to Shikshak!</div>} />
      </Route>

      {/* Add auth routes here later */}
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />
    </Routes>
  )
}

export default App