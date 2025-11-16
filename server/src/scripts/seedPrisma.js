import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'

const rooms = [
  // PISO 1 - HABITACIONES ESTÁNDAR (6)
  {
    name: 'Habitación Estándar 101',
    roomNumber: '101',
    type: 'estandar',
    floor: 1,
    price: 250,
    capacity: 2,
    maxCapacity: 3,
    status: 'disponible',
    cleaningStatus: 'limpia',
    building: 'Principal',
    view: 'jardin',
    description: 'Habitación acogedora con vista a los jardines del hotel.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Minibar', 'Caja fuerte', 'Baño privado'],
  },
  {
    name: 'Habitación Estándar 102',
    roomNumber: '102',
    type: 'estandar',
    floor: 1,
    price: 280,
    capacity: 2,
    maxCapacity: 3,
    building: 'Principal',
    view: 'lateral',
    description: 'Habitación con vista lateral a la cordillera.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Minibar', 'Balcón'],
  },
  {
    name: 'Habitación Estándar 103',
    roomNumber: '103',
    type: 'estandar',
    floor: 1,
    price: 260,
    capacity: 2,
    maxCapacity: 3,
    view: 'jardin',
    description: 'Habitación luminosa con acceso directo a los jardines.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Minibar'],
  },
  {
    name: 'Habitación Estándar 104',
    roomNumber: '104',
    type: 'estandar',
    floor: 1,
    price: 270,
    capacity: 2,
    maxCapacity: 3,
    view: 'piscina',
    description: 'Habitación con vista a la piscina del hotel.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Minibar'],
  },
  {
    name: 'Habitación Estándar 105',
    roomNumber: '105',
    type: 'estandar',
    floor: 1,
    price: 250,
    capacity: 2,
    maxCapacity: 3,
    view: 'jardin',
    description: 'Habitación confortable con decoración andina.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Minibar'],
  },
  {
    name: 'Habitación Estándar 106',
    roomNumber: '106',
    type: 'estandar',
    floor: 1,
    price: 290,
    capacity: 2,
    maxCapacity: 3,
    view: 'lateral',
    description: 'Habitación esquinera con doble ventana.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Balcón'],
  },

  // PISO 2 - HABITACIONES DE LUJO (4)
  {
    name: 'Habitación de Lujo 201',
    roomNumber: '201',
    type: 'lujo',
    floor: 2,
    price: 480,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Habitación de lujo con vista panorámica a la Cordillera.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi', 'Nespresso', 'Bata'],
  },
  {
    name: 'Habitación de Lujo 202',
    roomNumber: '202',
    type: 'lujo',
    floor: 2,
    price: 500,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Suite de lujo con jacuzzi privado en balcón.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi', 'Turndown'],
  },
  {
    name: 'Habitación de Lujo 203',
    roomNumber: '203',
    type: 'lujo',
    floor: 2,
    price: 470,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Habitación elegante con diseño minimalista andino.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi'],
  },
  {
    name: 'Habitación de Lujo 204',
    roomNumber: '204',
    type: 'lujo',
    floor: 2,
    price: 490,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Suite de lujo con amplios espacios.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi'],
  },

  // PISO 2 - ESTÁNDAR (4)
  {
    name: 'Habitación Estándar 205',
    roomNumber: '205',
    type: 'estandar',
    floor: 2,
    price: 300,
    capacity: 2,
    maxCapacity: 3,
    view: 'lateral',
    description: 'Habitación estándar en piso superior.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Balcón'],
  },
  {
    name: 'Habitación Estándar 206',
    roomNumber: '206',
    type: 'estandar',
    floor: 2,
    price: 310,
    capacity: 2,
    maxCapacity: 3,
    view: 'piscina',
    description: 'Vista privilegiada a la piscina.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Balcón'],
  },
  {
    name: 'Habitación Estándar 207',
    roomNumber: '207',
    type: 'estandar',
    floor: 2,
    price: 290,
    capacity: 2,
    maxCapacity: 3,
    view: 'jardin',
    description: 'Habitación tranquila con vista a jardines zen.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado'],
  },
  {
    name: 'Habitación Estándar 208',
    roomNumber: '208',
    type: 'estandar',
    floor: 2,
    price: 320,
    capacity: 2,
    maxCapacity: 3,
    view: 'lateral',
    description: 'Habitación esquinera con excelente ubicación.',
    image: '/images/Habitacion Estandar.webp',
    amenities: ['WiFi', 'TV LED 42"', 'Aire acondicionado', 'Balcón'],
  },

  // PISO 3 - LUJO (4)
  {
    name: 'Habitación de Lujo 301',
    roomNumber: '301',
    type: 'lujo',
    floor: 3,
    price: 520,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Habitación de lujo en piso más alto.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi', 'Turndown'],
  },
  {
    name: 'Habitación de Lujo 302',
    roomNumber: '302',
    type: 'lujo',
    floor: 3,
    price: 530,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Suite de lujo premium con mejores vistas.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi'],
  },
  {
    name: 'Habitación de Lujo 303',
    roomNumber: '303',
    type: 'lujo',
    floor: 3,
    price: 510,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Diseño exclusivo con vistas panorámicas.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Balcón con jacuzzi'],
  },
  {
    name: 'Habitación de Lujo 304',
    roomNumber: '304',
    type: 'lujo',
    floor: 3,
    price: 540,
    capacity: 2,
    maxCapacity: 3,
    view: 'cordillera',
    description: 'Suite esquinera con doble balcón.',
    image: '/images/Habitacion de lujo.webp',
    amenities: ['WiFi', 'TV Smart 55"', 'Minibar premium', 'Doble balcón', 'Jacuzzi'],
  },

  // PISO 3 - FAMILIAR (4)
  {
    name: 'Suite Familiar 305',
    roomNumber: '305',
    type: 'familiar',
    floor: 3,
    price: 650,
    capacity: 4,
    maxCapacity: 6,
    view: 'cordillera',
    description: 'Suite familiar con dos habitaciones conectadas.',
    image: '/images/Habitacion Familiar.webp',
    amenities: ['WiFi', '2 TV Smart', '2 baños', 'Sala de estar', 'Balcón', 'Juegos'],
  },
  {
    name: 'Suite Familiar 306',
    roomNumber: '306',
    type: 'familiar',
    floor: 3,
    price: 680,
    capacity: 4,
    maxCapacity: 6,
    view: 'cordillera',
    description: 'Suite familiar con área de juegos.',
    image: '/images/Habitacion Familiar.webp',
    amenities: ['WiFi', '2 TV Smart', '2 baños', 'Área de juegos', 'Balcón'],
  },
  {
    name: 'Suite Familiar 307',
    roomNumber: '307',
    type: 'familiar',
    floor: 3,
    price: 700,
    capacity: 5,
    maxCapacity: 6,
    view: 'cordillera',
    description: 'Suite familiar premium con terraza privada.',
    image: '/images/Habitacion Familiar.webp',
    amenities: ['WiFi', '2 TV Smart', '2 baños', 'Terraza', 'Cocina pequeña'],
  },
  {
    name: 'Suite Familiar 308',
    roomNumber: '308',
    type: 'familiar',
    floor: 3,
    price: 720,
    capacity: 5,
    maxCapacity: 6,
    view: 'cordillera',
    description: 'Suite familiar esquinera con vistas panorámicas.',
    image: '/images/Habitacion Familiar.webp',
    amenities: ['WiFi', '2 TV Smart', '2 baños', 'Comedor', 'Cocina'],
  },

  // PISO 3 - PRESIDENCIAL (2)
  {
    name: 'Suite Presidencial 309',
    roomNumber: '309',
    type: 'presidencial',
    floor: 3,
    price: 1350,
    capacity: 2,
    maxCapacity: 4,
    view: 'cordillera',
    description: 'Suite presidencial de máximo lujo.',
    image: '/images/Suite Presidencial.webp',
    amenities: ['WiFi', 'TV 65" Smart', 'Bose', 'Terraza jacuzzi', 'Mayordomo 24/7', 'Desayuno'],
  },
  {
    name: 'Suite Presidencial 310',
    roomNumber: '310',
    type: 'presidencial',
    floor: 3,
    price: 1450,
    capacity: 2,
    maxCapacity: 4,
    view: 'cordillera',
    description: 'Suite presidencial más exclusiva.',
    image: '/images/Suite Presidencial.webp',
    amenities: ['WiFi', 'TV 65"', 'Doble terraza', 'Piscina privada', 'Chef privado', 'Traslado'],
  },

  // PISO 3 - CORDILLERA (1)
  {
    name: 'Suite Cordillera',
    roomNumber: '311',
    type: 'cordillera',
    floor: 3,
    price: 2200,
    capacity: 2,
    maxCapacity: 4,
    view: 'cordillera',
    description: 'La suite más exclusiva del hotel con vista 360°.',
    image: '/images/Suite Presidencial.webp',
    amenities: ['WiFi premium', 'TV 75"', 'Terraza 80m²', 'Piscina infinity', 'Mayordomo personal', 'Chef', 'Gimnasio privado', 'Telescopio'],
  },
]

async function seed() {
  try {
    console.log('🌱 Iniciando seed de PostgreSQL...\n')

    // Limpiar datos existentes
    console.log('🗑️  Limpiando datos existentes...')
    await prisma.specialRequest.deleteMany()
    await prisma.maintenanceRecord.deleteMany()
    await prisma.roomImage.deleteMany()
    await prisma.roomAmenity.deleteMany()
    await prisma.reservation.deleteMany()
    await prisma.inquiry.deleteMany()
    await prisma.room.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Datos limpiados\n')

    // Crear usuarios de prueba
    console.log('👥 Creando usuarios...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await prisma.user.create({
      data: {
        email: 'admin@hotelsupay.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
        active: true,
      },
    })

    await prisma.user.create({
      data: {
        email: 'operador@hotelsupay.com',
        password: hashedPassword,
        name: 'Operador',
        role: 'operator',
        active: true,
      },
    })
    console.log('✅ Usuarios creados\n')

    // Crear habitaciones
    console.log('🏨 Creando habitaciones...')
    for (const roomData of rooms) {
      const { amenities, ...roomInfo } = roomData
      
      const room = await prisma.room.create({
        data: roomInfo,
      })

      // Crear amenities
      if (amenities && amenities.length > 0) {
        await prisma.roomAmenity.createMany({
          data: amenities.map(amenity => ({
            roomId: room.id,
            amenity,
          })),
        })
      }
    }
    console.log('✅ Habitaciones creadas\n')

    // Resumen
    const summary = {
      total: await prisma.room.count(),
      estandar: await prisma.room.count({ where: { type: 'estandar' } }),
      lujo: await prisma.room.count({ where: { type: 'lujo' } }),
      familiar: await prisma.room.count({ where: { type: 'familiar' } }),
      presidencial: await prisma.room.count({ where: { type: 'presidencial' } }),
      cordillera: await prisma.room.count({ where: { type: 'cordillera' } }),
    }

    console.log('📊 RESUMEN:')
    console.log(`   Total: ${summary.total}`)
    console.log(`   Estándar: ${summary.estandar} (${((summary.estandar/summary.total)*100).toFixed(1)}%)`)
    console.log(`   Lujo: ${summary.lujo} (${((summary.lujo/summary.total)*100).toFixed(1)}%)`)
    console.log(`   Familiar: ${summary.familiar} (${((summary.familiar/summary.total)*100).toFixed(1)}%)`)
    console.log(`   Presidencial: ${summary.presidencial} (${((summary.presidencial/summary.total)*100).toFixed(1)}%)`)
    console.log(`   Cordillera: ${summary.cordillera} (${((summary.cordillera/summary.total)*100).toFixed(1)}%)`)

    console.log('\n🏨 POR PISO:')
    console.log(`   Piso 1: ${await prisma.room.count({ where: { floor: 1 } })}`)
    console.log(`   Piso 2: ${await prisma.room.count({ where: { floor: 2 } })}`)
    console.log(`   Piso 3: ${await prisma.room.count({ where: { floor: 3 } })}`)

    console.log('\n✅ Seed completado exitosamente!')
  } catch (error) {
    console.error('❌ Error en seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
