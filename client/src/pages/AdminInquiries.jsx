import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator') {
      loadInquiries();
    }
  }, [user]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAllInquiries();
      setInquiries(data);
    } catch (err) {
      setError('Error al cargar consultas: ' + (err.message || 'Error desconocido'));
      console.error('Error loading inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReplied = async (id) => {
    try {
      await api.replyInquiry(id);
      loadInquiries();
    } catch (err) {
      setError('Error al marcar como respondida');
      console.error(err);
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgente: 'bg-red-100 text-red-800',
      alta: 'bg-orange-100 text-orange-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-blue-100 text-blue-800',
      normal: 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || colors.normal;
  };

  const getTypeBadge = (type) => {
    return type === 'experiencia_vip' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-green-100 text-green-800';
  };

  if (user?.role !== 'admin' && user?.role !== 'operator') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-display text-stone mb-4">Acceso Denegado</h1>
          <p className="text-stone/70">No tienes permisos para acceder a esta página.</p>
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
      <div className="mb-8">
        <h1 className="text-4xl font-display text-stone mb-2">
          Gestión de Consultas
        </h1>
        <p className="text-stone/70">
          Consultas y solicitudes de clientes - Hotel Supay
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-luxury p-4">
          <p className="text-sm text-stone/70 mb-1">Total</p>
          <p className="text-2xl font-bold text-stone">{inquiries.length}</p>
        </div>
        <div className="card-luxury p-4">
          <p className="text-sm text-stone/70 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {inquiries.filter(i => !i.repliedAt).length}
          </p>
        </div>
        <div className="card-luxury p-4">
          <p className="text-sm text-stone/70 mb-1">Respondidas</p>
          <p className="text-2xl font-bold text-green-600">
            {inquiries.filter(i => i.repliedAt).length}
          </p>
        </div>
        <div className="card-luxury p-4">
          <p className="text-sm text-stone/70 mb-1">VIP</p>
          <p className="text-2xl font-bold text-purple-600">
            {inquiries.filter(i => i.type === 'experiencia_vip').length}
          </p>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="card-luxury p-6">
        {inquiries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone/70 text-lg">No hay consultas registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`border rounded-lg p-4 transition-all ${
                  inquiry.repliedAt 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-stone/20 hover:border-gold/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-stone text-lg">
                        {inquiry.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(inquiry.type)}`}>
                        {inquiry.type === 'experiencia_vip' ? 'VIP' : 'Consulta'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(inquiry.priority)}`}>
                        {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-stone/70 space-y-1">
                      <p>📧 {inquiry.email}</p>
                      {inquiry.phone && <p>📱 {inquiry.phone}</p>}
                      {inquiry.service && <p>🎯 Servicio: {inquiry.service}</p>}
                      {inquiry.guests && <p>👥 Huéspedes: {inquiry.guests}</p>}
                      {inquiry.budget && <p>💰 Presupuesto: {inquiry.budget}</p>}
                      {inquiry.eventDate && (
                        <p>📅 Fecha evento: {format(new Date(inquiry.eventDate), 'dd/MM/yyyy', { locale: es })}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone/60">
                      {format(new Date(inquiry.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                    {inquiry.repliedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Respondida {format(new Date(inquiry.repliedAt), "dd/MM/yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-stone/5 rounded p-3 mb-3">
                  <p className="text-sm text-stone whitespace-pre-wrap">{inquiry.message}</p>
                </div>

                {!inquiry.repliedAt && (
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${inquiry.email}?subject=Re: Consulta Hotel Supay&body=Hola ${inquiry.name},%0D%0A%0D%0AGracias por contactarnos.%0D%0A%0D%0ASaludos,%0D%0AHotel Supay`}
                      className="btn-primary text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📧 Responder Email
                    </a>
                    <button
                      onClick={() => handleMarkAsReplied(inquiry.id)}
                      className="btn-outline text-sm"
                    >
                      ✓ Marcar como Respondida
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
