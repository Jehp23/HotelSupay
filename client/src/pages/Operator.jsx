export default function Operator() {
  return (
    <main className="max-w-6xl mx-auto px-6 md:px-10 py-12">
      <h1 className="font-display text-3xl md:text-4xl mb-6">Panel Operador</h1>
      <p className="text-stone/80 mb-6">Gestión operativa del hotel (reservas y habitaciones). Próximamente.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="font-medium mb-2">Reservas</p>
          <p className="text-stone/70">Listado de reservas y acciones rápidas.</p>
        </div>
        <div className="card p-6">
          <p className="font-medium mb-2">Habitaciones</p>
          <p className="text-stone/70">Estados, liberar/ocupar, mantenimiento.</p>
        </div>
      </div>
    </main>
  )
}
