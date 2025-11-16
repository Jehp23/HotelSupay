import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import Services from './pages/Services'
import BookingNew from './pages/BookingNew'
import Contact from './pages/Contact'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Account from './pages/Account'
import AdminLayout from './components/Layout/AdminLayout'
import AdminDashboardNew from './pages/AdminDashboardNew'
import AdminUsers from './pages/AdminUsers'
import AdminReservationsNew from './pages/AdminReservationsNew'
import AdminRooms from './pages/AdminRooms'
import AdminRoomsCRUD from './pages/AdminRoomsCRUD'
import AdminInquiries from './pages/AdminInquiries'
import AdminReports from './pages/AdminReports'
import RoomsMap from './pages/RoomsMap'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'habitaciones', element: <Rooms /> },
      { path: 'servicios', element: <Services /> },
      { path: 'servicios/:slug', element: <ServiceDetail /> },
      { path: 'reservas', element: <BookingNew /> },
      { path: 'contacto', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: 'registro', element: <Register /> },
      { path: 'mi-cuenta', element: <ProtectedRoute><Account /></ProtectedRoute> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={["operator", "admin"]}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboardNew /> },
      { path: 'dashboard', element: <AdminDashboardNew /> },
      { path: 'reservations', element: <AdminReservationsNew /> },
      { path: 'rooms', element: <AdminRooms /> },
      { path: 'rooms-map', element: <RoomsMap /> },
      { path: 'rooms-crud', element: <ProtectedRoute roles={["admin"]}><AdminRoomsCRUD /></ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute> },
      { path: 'inquiries', element: <AdminInquiries /> },
      { path: 'reports', element: <ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
