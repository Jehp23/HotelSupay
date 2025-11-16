import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/reservations', label: 'Reservas', icon: '📅' },
    { path: '/admin/rooms', label: 'Habitaciones', icon: '🏨' },
    { path: '/admin/rooms-map', label: 'Mapa de Habitaciones', icon: '🗺️' },
    { path: '/admin/rooms-crud', label: 'CRUD Habitaciones', icon: '⚙️', adminOnly: true },
    { path: '/admin/users', label: 'Usuarios', icon: '👥', adminOnly: true },
    { path: '/admin/inquiries', label: 'Consultas', icon: '💬' },
    { path: '/admin/reports', label: 'Reportes', icon: '📈', adminOnly: true },
  ];

  const visibleMenuItems = adminMenuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone/5 to-gold/5">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="font-display text-2xl text-gradient">
                Hotel Supay
              </Link>
              <span className="text-sm text-stone/70">
                Panel {user?.role === 'admin' ? 'Administrativo' : 'de Operador'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-stone/70">
                Bienvenido, <span className="font-medium text-stone">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="btn-outline px-4 py-2 text-sm rounded-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white/50 backdrop-blur-sm border-r border-stone/10 min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            <ul className="space-y-2">
              {visibleMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-gold/20 to-copper/20 text-stone border border-gold/30'
                        : 'text-stone/70 hover:bg-stone/10 hover:text-stone'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
