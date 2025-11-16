import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuración del hotel
const HOTEL_CONFIG = {
  floors: 4,
  roomsPerFloor: 10,
  roomTypes: {
    presidencial: { price: 35000, capacity: 2, maxCapacity: 4, count: 2 },
    cordillera: { price: 28000, capacity: 2, maxCapacity: 3, count: 4 },
    lujo: { price: 22000, capacity: 2, maxCapacity: 3, count: 8 },
    familiar: { price: 18000, capacity: 4, maxCapacity: 6, count: 12 },
    estandar: { price: 14000, capacity: 2, maxCapacity: 2, count: 14 }
  }
};

const roomNames = {
  presidencial: ['Suite Imperial', 'Suite Real'],
  cordillera: ['Vista Andes', 'Panorama Montaña', 'Mirador Cordillera', 'Cima Nevada'],
  lujo: ['Elegance', 'Premium', 'Deluxe', 'Superior', 'Executive', 'Grand', 'Royal', 'Prestige'],
  familiar: ['Familia Feliz', 'Nido Acogedor', 'Casa Grande', 'Refugio Familiar', 'Hogar Dulce', 'Villa Familiar', 'Paraíso Kids', 'Aventura Familiar', 'Familia Plus', 'Familia Premium', 'Familia Comfort', 'Familia Vista'],
  estandar: ['Comfort', 'Classic', 'Standard Plus', 'Cozy', 'Essential', 'Basic Plus', 'Simple', 'Economy Plus', 'Value', 'Smart', 'Lite', 'Express', 'Quick', 'Easy']
};

const amenitiesByType = {
  presidencial: [
    'Jacuzzi privado',
    'Terraza panorámica 20m²',
    'Servicio de mayordomo 24h',
    'Minibar premium incluido',
    'Smart TV 75" con Netflix',
    'Sistema de sonido Bose',
    'Cama king size premium',
    'Baño de mármol con ducha de lluvia',
    'Bata y pantuflas de lujo',
    'Cafetera Nespresso',
    'Escritorio ejecutivo',
    'Caja fuerte digital'
  ],
  cordillera: [
    'Ventanal panorámico piso-techo',
    'Balcón privado 8m²',
    'Telescopio para observación',
    'Cama king size',
    'Smart TV 65"',
    'Minibar',
    'Baño con tina',
    'Bata y pantuflas',
    'Cafetera',
    'Vista a la cordillera'
  ],
  lujo: [
    'Balcón privado',
    'Cama king size',
    'Smart TV 55"',
    'Minibar',
    'Baño de mármol',
    'Ducha de lluvia',
    'Bata y pantuflas',
    'Cafetera Nespresso',
    'Escritorio'
  ],
  familiar: [
    'Dos camas matrimoniales',
    'Sofá cama',
    'Área de estar',
    'Smart TV 50"',
    'Minibar',
    'Cafetera',
    'Juegos de mesa',
    'Cuna disponible',
    'Baño amplio'
  ],
  estandar: [
    'Cama queen size',
    'Smart TV 43"',
    'Escritorio',
    'Cafetera',
    'Baño privado',
    'Ducha',
    'Secador de pelo'
  ]
};

const views = ['cordillera', 'jardin', 'ciudad', 'lateral', 'interior'];
const statuses = ['disponible', 'ocupada', 'limpieza', 'mantenimiento'];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRoomNumber(floor, position) {
  return `${floor}${position.toString().padStart(2, '0')}`;
}

async function main() {
  console.log('🌱 Iniciando seed realista de Hotel Supay...');

  // Limpiar datos existentes
  await prisma.reservation.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.roomImage.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.specialRequest.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hotelsupay.com',
      password: hashedPassword,
      name: 'Carlos Mendoza',
      role: 'admin',
      active: true
    }
  });

  const operator1 = await prisma.user.create({
    data: {
      email: 'operador@hotelsupay.com',
      password: hashedPassword,
      name: 'María González',
      role: 'operator',
      active: true
    }
  });

  const operator2 = await prisma.user.create({
    data: {
      email: 'operador2@hotelsupay.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: 'operator',
      active: true
    }
  });

  const guest = await prisma.user.create({
    data: {
      email: 'cliente@example.com',
      password: hashedPassword,
      name: 'Ana Torres',
      role: 'guest',
      active: true
    }
  });

  console.log('✅ Usuarios creados (1 admin, 2 operadores, 1 cliente)');

  // Generar habitaciones de forma realista
  const rooms = [];
  let roomCounter = 0;
  
  // Distribuir tipos de habitación por piso
  const roomDistribution = [
    // Piso 1: Presidenciales y Cordillera (habitaciones premium)
    { floor: 1, types: ['presidencial', 'presidencial', 'cordillera', 'cordillera', 'cordillera', 'cordillera', 'lujo', 'lujo', 'lujo', 'lujo'] },
    // Piso 2: Lujo y Familiar
    { floor: 2, types: ['lujo', 'lujo', 'lujo', 'lujo', 'familiar', 'familiar', 'familiar', 'familiar', 'familiar', 'familiar'] },
    // Piso 3: Familiar y Estándar
    { floor: 3, types: ['familiar', 'familiar', 'familiar', 'familiar', 'familiar', 'familiar', 'estandar', 'estandar', 'estandar', 'estandar'] },
    // Piso 4: Estándar
    { floor: 4, types: ['estandar', 'estandar', 'estandar', 'estandar', 'estandar', 'estandar', 'estandar', 'estandar', 'estandar', 'estandar'] }
  ];

  const guestNames = [
    'Familia Rodríguez', 'Sr. García', 'Sra. Martínez', 'Pareja López',
    'Familia Silva', 'Sr. Fernández', 'Sra. Ramírez', 'Grupo Empresarial',
    'Familia Morales', 'Sr. Castro', 'Sra. Vargas', 'Pareja Ruiz'
  ];

  for (const floorConfig of roomDistribution) {
    const { floor, types } = floorConfig;
    
    for (let position = 1; position <= 10; position++) {
      const type = types[position - 1];
      const config = HOTEL_CONFIG.roomTypes[type];
      const roomNumber = generateRoomNumber(floor, position);
      
      // Nombres únicos por tipo
      const typeNames = roomNames[type];
      const nameIndex = Math.floor(roomCounter / roomDistribution.length) % typeNames.length;
      const roomName = `${typeNames[nameIndex]} ${roomNumber}`;
      
      // Determinar estado (70% disponible, 20% ocupada, 5% limpieza, 5% mantenimiento)
      const rand = Math.random();
      let status, cleaningStatus, currentGuest = null, checkInDate = null, checkOutDate = null;
      
      if (rand < 0.70) {
        status = 'disponible';
        cleaningStatus = 'limpia';
      } else if (rand < 0.90) {
        status = 'ocupada';
        cleaningStatus = 'sucia';
        currentGuest = getRandomItem(guestNames);
        checkInDate = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000); // Últimos 3 días
        checkOutDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Próximos 7 días
      } else if (rand < 0.95) {
        status = 'limpieza';
        cleaningStatus = 'en_proceso';
      } else {
        status = 'mantenimiento';
        cleaningStatus = 'limpia';
      }

      // Vista según piso
      let view;
      if (floor === 1 && position <= 4) view = 'cordillera';
      else if (floor === 4) view = 'ciudad';
      else if (position <= 5) view = 'jardin';
      else view = 'lateral';

      const room = await prisma.room.create({
        data: {
          name: roomName,
          roomNumber: roomNumber,
          type: type,
          floor: floor,
          price: config.price,
          capacity: config.capacity,
          maxCapacity: config.maxCapacity,
          status: status,
          cleaningStatus: cleaningStatus,
          currentGuest: currentGuest,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          view: view,
          description: `Habitación ${type} en piso ${floor} con vista ${view}. ${
            type === 'presidencial' ? 'La mejor suite del hotel con todas las comodidades de lujo.' :
            type === 'cordillera' ? 'Vista espectacular a la Cordillera de los Andes.' :
            type === 'lujo' ? 'Elegancia y confort en cada detalle.' :
            type === 'familiar' ? 'Espacio perfecto para disfrutar en familia.' :
            'Comodidad y funcionalidad al mejor precio.'
          }`,
          amenities: {
            create: amenitiesByType[type].map(amenity => ({ amenity }))
          }
        }
      });

      rooms.push(room);
      roomCounter++;
    }
  }

  console.log(`✅ ${rooms.length} habitaciones creadas (4 pisos, 10 por piso)`);

  // Crear reservas realistas
  const reservationStatuses = ['pending', 'confirmed', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'refunded'];
  
  const reservations = [];
  const occupiedRooms = rooms.filter(r => r.status === 'ocupada');
  
  // Crear reservas para habitaciones ocupadas
  for (const room of occupiedRooms) {
    const reservation = await prisma.reservation.create({
      data: {
        roomId: room.id,
        roomType: room.type,
        userId: guest.id,
        name: room.currentGuest,
        email: `${room.currentGuest.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`,
        checkIn: room.checkInDate,
        checkOut: room.checkOutDate,
        people: Math.floor(Math.random() * room.capacity) + 1,
        status: 'confirmed',
        paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
        totalPrice: room.price * Math.ceil((room.checkOutDate - room.checkInDate) / (1000 * 60 * 60 * 24)),
        specialRequests: Math.random() > 0.7 ? 'Cama extra para niño' : null
      }
    });
    reservations.push(reservation);
  }

  // Crear reservas futuras
  for (let i = 0; i < 15; i++) {
    const availableRoom = rooms.filter(r => r.status === 'disponible')[Math.floor(Math.random() * rooms.filter(r => r.status === 'disponible').length)];
    if (!availableRoom) continue;

    const checkIn = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Próximos 30 días
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000);

    const reservation = await prisma.reservation.create({
      data: {
        roomType: availableRoom.type,
        name: getRandomItem(guestNames),
        email: `cliente${i}@example.com`,
        phone: `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`,
        checkIn: checkIn,
        checkOut: checkOut,
        people: Math.floor(Math.random() * availableRoom.capacity) + 1,
        status: getRandomItem(reservationStatuses),
        paymentStatus: getRandomItem(paymentStatuses),
        totalPrice: availableRoom.price * nights,
        specialRequests: Math.random() > 0.8 ? 'Vista a la cordillera preferiblemente' : null
      }
    });
    reservations.push(reservation);
  }

  console.log(`✅ ${reservations.length} reservas creadas`);

  // Crear consultas
  const inquiryTypes = ['consulta', 'experiencia_vip'];
  const priorities = ['normal', 'alta', 'urgente'];
  
  for (let i = 0; i < 8; i++) {
    await prisma.inquiry.create({
      data: {
        name: getRandomItem(guestNames),
        email: `consulta${i}@example.com`,
        phone: `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`,
        message: `Consulta sobre disponibilidad y servicios del hotel. ${i % 2 === 0 ? 'Interesado en reservar para grupo familiar.' : 'Necesito información sobre experiencias VIP.'}`,
        type: getRandomItem(inquiryTypes),
        priority: getRandomItem(priorities),
        repliedAt: i % 3 === 0 ? new Date() : null
      }
    });
  }

  console.log('✅ 8 consultas creadas');

  // Crear registros de mantenimiento
  const maintenanceRooms = rooms.filter(r => r.status === 'mantenimiento');
  for (const room of maintenanceRooms) {
    await prisma.maintenanceRecord.create({
      data: {
        roomId: room.id,
        type: getRandomItem(['preventivo', 'correctivo', 'limpieza_profunda']),
        description: 'Mantenimiento programado de instalaciones',
        priority: getRandomItem(['baja', 'media', 'alta']),
        status: 'en_proceso',
        scheduledDate: new Date(),
        assignedTo: operator1.name
      }
    });
  }

  console.log(`✅ ${maintenanceRooms.length} registros de mantenimiento creados`);

  // Resumen
  console.log('\n🎉 ¡Seed completado exitosamente!\n');
  console.log('📊 Resumen del Hotel Supay:');
  console.log(`   - Total habitaciones: ${rooms.length}`);
  console.log(`   - Pisos: ${HOTEL_CONFIG.floors}`);
  console.log(`   - Habitaciones por piso: ${HOTEL_CONFIG.roomsPerFloor}`);
  console.log(`   - Presidenciales: ${rooms.filter(r => r.type === 'presidencial').length}`);
  console.log(`   - Cordillera: ${rooms.filter(r => r.type === 'cordillera').length}`);
  console.log(`   - Lujo: ${rooms.filter(r => r.type === 'lujo').length}`);
  console.log(`   - Familiares: ${rooms.filter(r => r.type === 'familiar').length}`);
  console.log(`   - Estándar: ${rooms.filter(r => r.type === 'estandar').length}`);
  console.log(`\n   - Disponibles: ${rooms.filter(r => r.status === 'disponible').length}`);
  console.log(`   - Ocupadas: ${rooms.filter(r => r.status === 'ocupada').length}`);
  console.log(`   - En limpieza: ${rooms.filter(r => r.status === 'limpieza').length}`);
  console.log(`   - En mantenimiento: ${rooms.filter(r => r.status === 'mantenimiento').length}`);
  console.log(`\n   - Reservas totales: ${reservations.length}`);
  console.log(`   - Usuarios: 4 (1 admin, 2 operadores, 1 cliente)`);
  console.log(`   - Consultas: 8`);
  console.log('\n🔐 Credenciales de acceso:');
  console.log('   Admin: admin@hotelsupay.com / admin123');
  console.log('   Operador 1: operador@hotelsupay.com / admin123');
  console.log('   Operador 2: operador2@hotelsupay.com / admin123');
  console.log('   Cliente: cliente@example.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
