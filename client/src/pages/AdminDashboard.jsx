import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservationService } from '../services/reservationService';
import { userService } from '../services/userService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    totalUsers: 0,
    recentReservations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar reservas
      const reservations = await reservationService.getReservations();
      const pendingReservations = reservations.filter(r => r.status === 'pending');
      const recentReservations = reservations.slice(0, 5);

      let totalUsers = 0;
      if (user?.role === 'admin') {
        const users = await userService.getUsers();
        totalUsers = users.length;
      }

      setStats({
        totalReservations: reservations.length,
        pendingReservations: pendingReservations.length,
        totalUsers,
        recentReservations
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <div className="card-luxury p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-stone/70 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`text-4xl opacity-20`}>{icon}</div>
      </div>
      {link && (
        <Link to={link} className="text-gold hover:text-copper text-sm font-medium mt-2 inline-block">
          Ver detalles →
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display text-stone mb-2">
          Dashboard {user?.role === 'admin' ? 'Administrativo' : 'de Operador'}
        </h1>
        <p className="text-stone/70">
          Resumen general del sistema Hotel Supay
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reservas"
          value={stats.totalReservations}
          icon="📅"
          color="text-blue-600"
          link="/admin/reservations"
        />
        
        <StatCard
          title="Reservas Pendientes"
          value={stats.pendingReservations}
          icon="⏳"
          color="text-orange-600"
          link="/admin/reservations?status=pending"
        />
        
        {user?.role === 'admin' && (
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon="👥"
            color="text-green-600"
            link="/admin/users"
          />
        )}
        
        <StatCard
          title="Habitaciones"
          value="6"
          icon="🏨"
          color="text-purple-600"
          link="/admin/rooms"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div className="card-luxury p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-stone">Reservas Recientes</h2>
            <Link to="/admin/reservations" className="text-gold hover:text-copper text-sm">
              Ver todas →
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentReservations.length > 0 ? (
              stats.recentReservations.map((reservation) => (
                <div key={reservation._id} className="flex items-center justify-between p-3 bg-stone/5 rounded-lg">
                  <div>
                    <p className="font-medium text-stone">{reservation.name}</p>
                    <p className="text-sm text-stone/70">{reservation.room?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone/70">
                      {new Date(reservation.checkIn).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' :
                       reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone/70 text-center py-4">No hay reservas recientes</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-luxury p-6">
          <h2 className="text-xl font-display text-stone mb-4">Acciones Rápidas</h2>
          
          <div className="space-y-3">
            <Link
              to="/admin/reservations"
              className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📅</span>
                <span className="font-medium text-stone">Gestionar Reservas</span>
              </div>
              <span className="text-gold">→</span>
            </Link>
            
            <Link
              to="/admin/rooms"
              className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏨</span>
                <span className="font-medium text-stone">Administrar Habitaciones</span>
              </div>
              <span className="text-gold">→</span>
            </Link>
            
            {user?.role === 'admin' && (
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👥</span>
                  <span className="font-medium text-stone">Gestionar Usuarios</span>
                </div>
                <span className="text-gold">→</span>
              </Link>
            )}
            
            <Link
              to="/admin/inquiries"
              className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💬</span>
                <span className="font-medium text-stone">Ver Consultas</span>
              </div>
              <span className="text-gold">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Only Section */}
      {user?.role === 'admin' && (
        <div className="card-luxury p-6">
          <h2 className="text-xl font-display text-stone mb-4">Herramientas de Administrador</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/reports"
              className="p-4 bg-gradient-to-br from-gold/10 to-copper/10 rounded-lg hover:from-gold/20 hover:to-copper/20 transition-all"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-medium text-stone">Reportes y Gráficos</h3>
                <p className="text-sm text-stone/70 mt-1">Consultas parametrizadas</p>
              </div>
            </Link>
            
            <Link
              to="/admin/settings"
              className="p-4 bg-gradient-to-br from-sage/10 to-cactus/10 rounded-lg hover:from-sage/20 hover:to-cactus/20 transition-all"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-medium text-stone">Configuración</h3>
                <p className="text-sm text-stone/70 mt-1">Ajustes del sistema</p>
              </div>
            </Link>
            
            <Link
              to="/admin/backup"
              className="p-4 bg-gradient-to-br from-terracotta/10 to-gold/10 rounded-lg hover:from-terracotta/20 hover:to-gold/20 transition-all"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">💾</div>
                <h3 className="font-medium text-stone">Respaldos</h3>
                <p className="text-sm text-stone/70 mt-1">Backup y restauración</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
