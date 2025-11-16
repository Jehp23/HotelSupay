import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#D4AF37', '#C9A961', '#8B7355', '#5C4A3A', '#B8860B', '#CD853F'];

const AdminReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days'); // 7days, 30days, 90days, year, custom
  const [reportData, setReportData] = useState({
    reservations: [],
    rooms: [],
    users: [],
    inquiries: []
  });

  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      byMonth: [],
      byRoomType: [],
      trend: []
    },
    occupancy: {
      current: 0,
      average: 0,
      byRoomType: [],
      trend: []
    },
    reservations: {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      conversionRate: 0,
      bySource: []
    },
    customers: {
      total: 0,
      new: 0,
      returning: 0,
      averageStay: 0
    }
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadReportData();
    }
  }, [user, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const [reservations, rooms, users, inquiries] = await Promise.all([
        api.getAllReservations(),
        api.getRooms(),
        api.getAllUsers(),
        api.getAllInquiries()
      ]);

      setReportData({ reservations, rooms, users, inquiries });
      calculateAnalytics({ reservations, rooms, users, inquiries });
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data) => {
    const { reservations, rooms, users } = data;
    
    // Filtrar por rango de fechas
    const filteredReservations = filterByDateRange(reservations);

    // Calcular ingresos
    const totalRevenue = filteredReservations
      .filter(r => r.status === 'confirmed' && r.totalPrice)
      .reduce((sum, r) => sum + parseFloat(r.totalPrice || 0), 0);

    // Ingresos por mes (últimos 12 meses)
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM yyyy', { locale: es });
      const monthRevenue = reservations
        .filter(r => {
          const checkIn = new Date(r.checkIn);
          return checkIn.getMonth() === date.getMonth() && 
                 checkIn.getFullYear() === date.getFullYear() &&
                 r.status === 'confirmed';
        })
        .reduce((sum, r) => sum + parseFloat(r.totalPrice || 0), 0);
      
      revenueByMonth.push({
        mes: monthKey,
        ingresos: Math.round(monthRevenue)
      });
    }

    // Ingresos por tipo de habitación
    const revenueByRoomType = {};
    filteredReservations
      .filter(r => r.status === 'confirmed' && r.totalPrice)
      .forEach(r => {
        const type = r.roomType || 'Sin especificar';
        revenueByRoomType[type] = (revenueByRoomType[type] || 0) + parseFloat(r.totalPrice);
      });

    const revenueByRoomTypeArray = Object.keys(revenueByRoomType).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: Math.round(revenueByRoomType[type])
    }));

    // Ocupación
    const occupiedRooms = rooms.filter(r => r.status === 'ocupada').length;
    const currentOccupancy = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

    // Ocupación por tipo
    const occupancyByType = {};
    rooms.forEach(r => {
      if (!occupancyByType[r.type]) {
        occupancyByType[r.type] = { total: 0, occupied: 0 };
      }
      occupancyByType[r.type].total++;
      if (r.status === 'ocupada') occupancyByType[r.type].occupied++;
    });

    const occupancyByTypeArray = Object.keys(occupancyByType).map(type => ({
      tipo: type.charAt(0).toUpperCase() + type.slice(1),
      ocupacion: Math.round((occupancyByType[type].occupied / occupancyByType[type].total) * 100),
      disponibles: occupancyByType[type].total - occupancyByType[type].occupied
    }));

    // Tendencia de ocupación (últimos 30 días)
    const occupancyTrend = [];
    for (let i = 29; i >= 0; i--) {
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

    // Estadísticas de reservas
    const confirmedCount = filteredReservations.filter(r => r.status === 'confirmed').length;
    const pendingCount = filteredReservations.filter(r => r.status === 'pending').length;
    const cancelledCount = filteredReservations.filter(r => r.status === 'cancelled').length;
    const conversionRate = filteredReservations.length > 0 
      ? (confirmedCount / filteredReservations.length) * 100 
      : 0;

    // Clientes
    const guestUsers = users.filter(u => u.role === 'guest');
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const newCustomers = guestUsers.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

    // Duración promedio de estadía
    const completedReservations = filteredReservations.filter(r => 
      r.status === 'confirmed' || r.status === 'completed'
    );
    const totalDays = completedReservations.reduce((sum, r) => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const averageStay = completedReservations.length > 0 
      ? totalDays / completedReservations.length 
      : 0;

    setAnalytics({
      revenue: {
        total: totalRevenue,
        byMonth: revenueByMonth,
        byRoomType: revenueByRoomTypeArray,
        trend: revenueByMonth
      },
      occupancy: {
        current: currentOccupancy,
        average: occupancyTrend.reduce((sum, d) => sum + d.ocupacion, 0) / occupancyTrend.length,
        byRoomType: occupancyByTypeArray,
        trend: occupancyTrend
      },
      reservations: {
        total: filteredReservations.length,
        confirmed: confirmedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        conversionRate: conversionRate,
        bySource: []
      },
      customers: {
        total: guestUsers.length,
        new: newCustomers,
        returning: guestUsers.length - newCustomers,
        averageStay: averageStay
      }
    });
  };

  const filterByDateRange = (reservations) => {
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return reservations.filter(r => new Date(r.createdAt) >= startDate);
  };

  const exportToCSV = () => {
    const { reservations } = reportData;
    const csvContent = [
      ['ID', 'Cliente', 'Email', 'Tipo Habitación', 'Check-in', 'Check-out', 'Personas', 'Estado', 'Precio Total', 'Fecha Creación'],
      ...reservations.map(r => [
        r.id,
        r.name,
        r.email,
        r.roomType,
        format(new Date(r.checkIn), 'dd/MM/yyyy'),
        format(new Date(r.checkOut), 'dd/MM/yyyy'),
        r.people,
        r.status,
        r.totalPrice || 0,
        format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-reservas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportRevenuePDF = () => {
    alert('Funcionalidad de exportación a PDF en desarrollo. Por ahora usa CSV o imprime esta página.');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-display text-stone mb-4">Acceso Denegado</h1>
          <p className="text-stone/70">Solo administradores pueden acceder a reportes.</p>
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display text-stone mb-2">
            Reportes y Análisis
          </h1>
          <p className="text-stone/70">
            Métricas de rendimiento y análisis de negocio - Hotel Supay
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
            <option value="year">Este año</option>
          </select>
          <button onClick={exportToCSV} className="btn-outline">
            📊 Exportar CSV
          </button>
          <button onClick={exportRevenuePDF} className="btn-primary">
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-luxury p-6">
          <p className="text-sm text-stone/70 mb-1">Ingresos Totales</p>
          <p className="text-3xl font-bold text-green-600 mb-2">
            ${analytics.revenue.total.toLocaleString()}
          </p>
          <p className="text-xs text-stone/60">Reservas confirmadas</p>
        </div>

        <div className="card-luxury p-6">
          <p className="text-sm text-stone/70 mb-1">Ocupación Actual</p>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(analytics.occupancy.current)}%
          </p>
          <p className="text-xs text-stone/60">
            Promedio: {Math.round(analytics.occupancy.average)}%
          </p>
        </div>

        <div className="card-luxury p-6">
          <p className="text-sm text-stone/70 mb-1">Tasa de Conversión</p>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(analytics.reservations.conversionRate)}%
          </p>
          <p className="text-xs text-stone/60">
            {analytics.reservations.confirmed} de {analytics.reservations.total} confirmadas
          </p>
        </div>

        <div className="card-luxury p-6">
          <p className="text-sm text-stone/70 mb-1">Estadía Promedio</p>
          <p className="text-3xl font-bold text-orange-600 mb-2">
            {analytics.customers.averageStay.toFixed(1)} días
          </p>
          <p className="text-xs text-stone/60">
            {analytics.customers.total} clientes totales
          </p>
        </div>
      </div>

      {/* Gráficos de Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Evolución de Ingresos (12 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.revenue.byMonth}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="mes" stroke="#5C4A3A" />
              <YAxis stroke="#5C4A3A" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #D4AF37' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Area 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#D4AF37" 
                fillOpacity={1} 
                fill="url(#colorIngresos)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Ingresos por Tipo de Habitación</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.revenue.byRoomType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.revenue.byRoomType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos de Ocupación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Tendencia de Ocupación (30 días)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.occupancy.trend}>
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
                strokeWidth={3}
                dot={{ fill: '#D4AF37', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-luxury p-6">
          <h3 className="text-lg font-display text-stone mb-4">Ocupación por Tipo de Habitación</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.occupancy.byRoomType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="tipo" stroke="#5C4A3A" />
              <YAxis stroke="#5C4A3A" unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #D4AF37' }}
              />
              <Legend />
              <Bar dataKey="ocupacion" fill="#D4AF37" name="% Ocupación" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen de Reservas */}
      <div className="card-luxury p-6">
        <h3 className="text-lg font-display text-stone mb-4">Resumen de Reservas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Total</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.reservations.total}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">{analytics.reservations.confirmed}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{analytics.reservations.pending}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Canceladas</p>
            <p className="text-2xl font-bold text-red-600">{analytics.reservations.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Clientes */}
      <div className="card-luxury p-6">
        <h3 className="text-lg font-display text-stone mb-4">Análisis de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Total Clientes</p>
            <p className="text-2xl font-bold text-purple-600">{analytics.customers.total}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Nuevos (30 días)</p>
            <p className="text-2xl font-bold text-green-600">{analytics.customers.new}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-stone/70 mb-1">Recurrentes</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.customers.returning}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
