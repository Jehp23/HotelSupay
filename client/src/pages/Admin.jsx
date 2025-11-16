export default function Admin() {
  return (
    <main className="max-w-6xl mx-auto px-6 md:px-10 py-12">
      <h1 className="font-display text-3xl md:text-4xl mb-6">Panel Admin</h1>
      <p className="text-stone/80 mb-6">Gestión avanzada del hotel. Próximamente.</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="font-medium mb-2">Usuarios</p>
          <p className="text-stone/70">Roles y activación.</p>
        </div>
        <div className="card p-6">
          <p className="font-medium mb-2">Habitaciones</p>
          <p className="text-stone/70">CRUD y disponibilidad.</p>
        </div>
        <div className="card p-6">
          <p className="font-medium mb-2">Reportes</p>
          <p className="text-stone/70">Ocupación y reservas por período.</p>
        </div>
      </div>
    </main>
  )
}
