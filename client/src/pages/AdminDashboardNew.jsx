import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';

const COLORS = ['#D4AF37', '#C9A961', '#8B7355', '#5C4A3A', '#B8860B'];

const AdminDashboardNew = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    confirmedReservations: 0,
    pendingReservations: 0,
    cancelledReservations: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalUsers: 0,
    checkInsToday: 0,
    checkOutsToday: 0
  });
  
  const [chartData, setChartData] = useState({
    reservationsByMonth: [],
    revenueByMonth: [],
    roomTypeDistribution: [],
    occupancyTrend: [],
    reservationsByStatus: []
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [reservations, rooms, users] = await Promise.all([
        api.getAllReservations(),
        api.getRooms(),
        user?.role === 'admin' ? api.getAllUsers() : Promise.resolve([])
      ]);

      // Calcular estadísticas básicas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
      const pendingCount = reservations.filter(r => r.status === 'pending').length;
      const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
      
      const checkInsToday = reservations.filter(r => {
        const checkIn = new Date(r.checkIn);
        return checkIn.toDateString() === today.toDateString() && r.status !== 'cancelled';
      }).length;
      
      const checkOutsToday = reservations.filter(r => {
        const checkOut = new Date(r.checkOut);
        return checkOut.toDateString() === today.toDateString() && r.status !== 'cancelled';
      }).length;

      // Calcular ingresos totales
      const totalRevenue = reservations
        .filter(r => r.status === 'confirmed' && r.totalPrice)
        .reduce((sum, r) => sum + parseFloat(r.totalPrice || 0), 0);

      // Calcular ocupación
      const occupiedRooms = rooms.filter(r => r.status === 'ocupada').length;
      const availableRooms = rooms.filter(r => r.status === 'disponible').length;
      const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

      setStats({
        totalReservations: reservations.length,
        confirmedReservations: confirmedCount,
        pendingReservations: pendingCount,
        cancelledReservations: cancelledCount,
        totalRevenue,
        occupancyRate,
        totalRooms: rooms.length,
        occupiedRooms,
        availableRooms,
        totalUsers: users.length,
        checkInsToday,
        checkOutsToday
      });

      // Preparar datos para gráficos
      prepareChartData(reservations, rooms);
      
      // Actividad reciente
      const recent = reservations
        .sort((a, b) => new Date(b.createdAt || b.checkIn) - new Date(a.createdAt || a.checkIn))
        .slice(0, 10);
      setRecentActivity(recent);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (reservations, rooms) => {
    // Reservas por mes (últimos 6 meses)
    const monthsData = {};
    const revenueData = {};
    
    for (let i = 5; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const monthKey = format(date, 'MMM', { locale: es });
      monthsData[monthKey] = 0;
      revenueData[monthKey] = 0;
    }

    reservations.forEach(r => {
      const month = format(new Date(r.checkIn), 'MMM', { locale: es });
      if (monthsData.hasOwnProperty(month)) {
        monthsData[month]++;
        if (r.totalPrice && r.status === 'confirmed') {
          revenueData[month] += parseFloat(r.totalPrice);
        }
      }
    });

    const reservationsByMonth = Object.keys(monthsData).map(month => ({
      mes: month,
      reservas: monthsData[month]
    }));

    const revenueByMonth = Object.keys(revenueData).map(month => ({
      mes: month,
      ingresos: Math.round(revenueData[month])
    }));

    // Distribución por tipo de habitación
    const roomTypeCounts = {};
    reservations.forEach(r => {
      if (r.roomType) {
        roomTypeCounts[r.roomType] = (roomTypeCounts[r.roomType] || 0) + 1;
      }
    });

    const roomTypeDistribution = Object.keys(roomTypeCounts).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: roomTypeCounts[type]
    }));

    // Reservas por estado
    const reservationsByStatus = [
      { name: 'Confirmadas', value: reservations.filter(r => r.status === 'confirmed').length },
      { name: 'Pendientes', value: reservations.filter(r => r.status === 'pending').length },
      { name: 'Canceladas', value: reservations.filter(r => r.status === 'cancelled').length },
      { name: 'Completadas', value: reservations.filter(r => r.status === 'completed').length }
    ].filter(item => item.value > 0);

    // Tendencia de ocupación (últimos 7 días)
    const occupancyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'dd/MM');
      
      const reservationsOnDate = reservations.filter(r => {
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        return date >= checkIn && date <= checkOut && r.status === 'confirmed';
      }).length;
      
      const occupancy = rooms.length > 0 ? (reservationsOnDate / rooms.length) * 100 : 0;
      
      occupancyTrend.push({
        fecha: dateStr,
        ocupacion: Math.round(occupancy)
      });
    }

    setChartData({
      reservationsByMonth,
      revenueByMonth,
      roomTypeDistribution,
      occupancyTrend,
      reservationsByStatus
    });
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="card-luxury p-6 hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-stone/70 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
          {subtitle && <p className="text-xs text-stone/60">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`text-4xl opacity-20`}>{icon}</div>
      </div>
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
          Estadísticas y métricas en tiempo real - Hotel Supay
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reservas"
          value={stats.totalReservations}
          subtitle={`${stats.confirmedReservations} confirmadas`}
          icon="📅"
          color="text-blue-600"
        />
        
        <StatCard
          title="Tasa de Ocupación"
          value={`${Math.round(stats.occupancyRate)}%`}
          subtitle={`${stats.occupiedRooms} de ${stats.totalRooms} habitaciones`}
          icon="🏨"
          color="text-purple-600"
        />
        
        <StatCard
          title="Ingresos Totales"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="Reservas confirmadas"
          icon="💰"
          color="text-green-600"
        />
        
        <StatCard
          title="Check-ins Hoy"
          value={stats.checkInsToday}
          subtitle={`${stats.checkOutsToday} check-outs`}
          icon="✓"
          color="text-orange-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas por Mes */}
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Reservas por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.reservationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="mes" stroke="#5C4A3A" />
              <YAxis stroke="#5C4A3A" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #D4AF37' }}
                labelStyle={{ color: '#5C4A3A' }}
              />
              <Bar dataKey="reservas" fill="#D4AF37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por Mes */}
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Ingresos por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="mes" stroke="#5C4A3A" />
              <YAxis stroke="#5C4A3A" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #D4AF37' }}
                labelStyle={{ color: '#5C4A3A' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#C9A961" 
                strokeWidth={3}
                dot={{ fill: '#D4AF37', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Tipo */}
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Reservas por Tipo de Habitación</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.roomTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.roomTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tendencia de Ocupación */}
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Tendencia de Ocupación (7 días)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.occupancyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="fecha" stroke="#5C4A3A" />
              <YAxis stroke="#5C4A3A" unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #D4AF37' }}
                formatter={(value) => `${value}%`}
              />
              <Line 
                type="monotone" 
                dataKey="ocupacion" 
                stroke="#8B7355" 
                strokeWidth={2}
                dot={{ fill: '#D4AF37', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Estado de Reservas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-stone">Confirmadas</span>
              <span className="text-lg font-bold text-green-600">{stats.confirmedReservations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-stone">Pendientes</span>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingReservations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-stone">Canceladas</span>
              <span className="text-lg font-bold text-red-600">{stats.cancelledReservations}</span>
            </div>
          </div>
        </div>

        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Estado de Habitaciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-stone">Disponibles</span>
              <span className="text-lg font-bold text-green-600">{stats.availableRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-stone">Ocupadas</span>
              <span className="text-lg font-bold text-blue-600">{stats.occupiedRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <span className="text-sm font-medium text-stone">Total</span>
              <span className="text-lg font-bold text-stone">{stats.totalRooms}</span>
            </div>
          </div>
        </div>

        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <Link
              to="/admin/reservations"
              className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
            >
              <span className="text-sm font-medium text-stone">Gestionar Reservas</span>
              <span className="text-gold">→</span>
            </Link>
            <Link
              to="/admin/rooms"
              className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
            >
              <span className="text-sm font-medium text-stone">Ver Habitaciones</span>
              <span className="text-gold">→</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 bg-stone/5 rounded-lg hover:bg-stone/10 transition-colors"
              >
                <span className="text-sm font-medium text-stone">Gestionar Usuarios</span>
                <span className="text-gold">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-luxury p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display text-stone">Actividad Reciente</h3>
          <Link to="/admin/reservations" className="text-gold hover:text-copper text-sm">
            Ver todas →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone/20">
                <th className="text-left py-3 px-4 text-sm font-medium text-stone/70">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone/70">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone/70">Check-in</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone/70">Check-out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone/70">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-stone/70">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((reservation) => (
                <tr key={reservation.id} className="border-b border-stone/10 hover:bg-stone/5">
                  <td className="py-3 px-4 text-sm text-stone">{reservation.name}</td>
                  <td className="py-3 px-4 text-sm text-stone/70 capitalize">{reservation.roomType}</td>
                  <td className="py-3 px-4 text-sm text-stone/70">
                    {format(new Date(reservation.checkIn), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone/70">
                    {format(new Date(reservation.checkOut), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' :
                       reservation.status === 'pending' ? 'Pendiente' :
                       reservation.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-stone text-right font-medium">
                    ${reservation.totalPrice ? parseFloat(reservation.totalPrice).toLocaleString() : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
