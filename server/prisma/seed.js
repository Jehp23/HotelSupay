import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

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
      name: 'Administrador Principal',
      role: 'admin'
    }
  });

  const operator = await prisma.user.create({
    data: {
      email: 'operador@hotelsupay.com',
      password: hashedPassword,
      name: 'Operador Hotel',
      role: 'operator'
    }
  });

  const guest = await prisma.user.create({
    data: {
      email: 'cliente@example.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: 'guest'
    }
  });

  console.log('✅ Usuarios creados');

  // Crear habitaciones
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Suite Cordillera Vista Premium',
        roomNumber: '101',
        type: 'presidencial',
        floor: 1,
        price: 25000,
        capacity: 2,
        maxCapacity: 4,
        status: 'disponible',
        cleaningStatus: 'limpia',
        view: 'cordillera',
        description: 'Suite presidencial con vista panorámica a la cordillera de los Andes. Incluye jacuzzi privado, terraza y servicio de mayordomo.',
        amenities: {
          create: [
            { amenity: 'Jacuzzi privado' },
            { amenity: 'Terraza panorámica' },
            { amenity: 'Servicio de mayordomo' },
            { amenity: 'Minibar premium' },
            { amenity: 'Smart TV 65"' }
          ]
        }
      }
    }),
    prisma.room.create({
      data: {
        name: 'Suite Lujo Montaña',
        roomNumber: '102',
        type: 'lujo',
        floor: 1,
        price: 18000,
        capacity: 2,
        maxCapacity: 3,
        status: 'disponible',
        cleaningStatus: 'limpia',
        view: 'cordillera',
        description: 'Suite de lujo con decoración minimalista y vistas a la montaña. Baño de mármol y balcón privado.',
        amenities: {
          create: [
            { amenity: 'Balcón privado' },
            { amenity: 'Baño de mármol' },
            { amenity: 'Cama king size' },
            { amenity: 'Minibar' },
            { amenity: 'Smart TV 55"' }
          ]
        }
      }
    }),
    prisma.room.create({
      data: {
        name: 'Habitación Familiar Jardín',
        roomNumber: '201',
        type: 'familiar',
        floor: 2,
        price: 15000,
        capacity: 4,
        maxCapacity: 5,
        status: 'ocupada',
        cleaningStatus: 'sucia',
        currentGuest: 'Familia González',
        checkInDate: new Date('2025-10-10'),
        checkOutDate: new Date('2025-10-15'),
        view: 'jardin',
        description: 'Amplia habitación familiar con vista al jardín. Dos camas matrimoniales y área de estar.',
        amenities: {
          create: [
            { amenity: 'Dos camas matrimoniales' },
            { amenity: 'Área de estar' },
            { amenity: 'Vista al jardín' },
            { amenity: 'Cafetera' },
            { amenity: 'TV 50"' }
          ]
        }
      }
    }),
    prisma.room.create({
      data: {
        name: 'Habitación Estándar Plus',
        roomNumber: '202',
        type: 'estandar',
        floor: 2,
        price: 12000,
        capacity: 2,
        maxCapacity: 2,
        status: 'disponible',
        cleaningStatus: 'limpia',
        view: 'lateral',
        description: 'Habitación estándar con todas las comodidades. Perfecta para parejas.',
        amenities: {
          create: [
            { amenity: 'Cama queen size' },
            { amenity: 'Baño privado' },
            { amenity: 'WiFi' },
            { amenity: 'TV 43"' }
          ]
        }
      }
    }),
    prisma.room.create({
      data: {
        name: 'Suite Cordillera Deluxe',
        roomNumber: '301',
        type: 'cordillera',
        floor: 3,
        price: 22000,
        capacity: 2,
        maxCapacity: 3,
        status: 'reservada',
        cleaningStatus: 'limpia',
        view: 'cordillera',
        description: 'Suite especial con la mejor vista a la cordillera. Bañera de hidromasaje y chimenea.',
        amenities: {
          create: [
            { amenity: 'Vista panorámica cordillera' },
            { amenity: 'Bañera hidromasaje' },
            { amenity: 'Chimenea' },
            { amenity: 'Balcón amplio' },
            { amenity: 'Smart TV 60"' }
          ]
        }
      }
    }),
    prisma.room.create({
      data: {
        name: 'Habitación Estándar Confort',
        roomNumber: '203',
        type: 'estandar',
        floor: 2,
        price: 11000,
        capacity: 2,
        maxCapacity: 2,
        status: 'limpieza',
        cleaningStatus: 'en_proceso',
        view: 'jardin',
        description: 'Habitación estándar cómoda y acogedora con vista al jardín.',
        amenities: {
          create: [
            { amenity: 'Cama matrimonial' },
            { amenity: 'Baño privado' },
            { amenity: 'WiFi' },
            { amenity: 'TV 40"' }
          ]
        }
      }
    })
  ]);

  console.log('✅ Habitaciones creadas');

  // Crear reservas
  const reservations = await Promise.all([
    prisma.reservation.create({
      data: {
        userId: guest.id,
        roomId: rooms[2].id, // Familiar ocupada
        name: 'Familia González',
        email: 'gonzalez@example.com',
        phone: '+54 9 11 1234-5678',
        roomType: 'familiar',
        checkIn: new Date('2025-10-10'),
        checkOut: new Date('2025-10-15'),
        people: 4,
        status: 'confirmed',
        paymentStatus: 'paid',
        totalPrice: 75000,
        specialRequests: 'Cuna para bebé y desayuno temprano'
      }
    }),
    prisma.reservation.create({
      data: {
        name: 'María Rodríguez',
        email: 'maria.r@example.com',
        phone: '+54 9 381 555-1234',
        roomType: 'lujo',
        checkIn: new Date('2025-10-20'),
        checkOut: new Date('2025-10-23'),
        people: 2,
        status: 'pending',
        paymentStatus: 'pending',
        totalPrice: 54000,
        specialRequests: 'Aniversario - decoración romántica'
      }
    }),
    prisma.reservation.create({
      data: {
        roomId: rooms[4].id, // Cordillera reservada
        name: 'Carlos Mendoza',
        email: 'cmendoza@example.com',
        phone: '+54 9 387 444-9876',
        roomType: 'cordillera',
        checkIn: new Date('2025-10-18'),
        checkOut: new Date('2025-10-21'),
        people: 2,
        status: 'confirmed',
        paymentStatus: 'paid',
        totalPrice: 66000
      }
    }),
    prisma.reservation.create({
      data: {
        name: 'Ana Martínez',
        email: 'ana.m@example.com',
        phone: '+54 9 11 9999-8888',
        roomType: 'presidencial',
        checkIn: new Date('2025-11-01'),
        checkOut: new Date('2025-11-05'),
        people: 2,
        status: 'pending',
        paymentStatus: 'pending',
        totalPrice: 100000,
        specialRequests: 'Luna de miel - champagne y flores'
      }
    }),
    prisma.reservation.create({
      data: {
        name: 'Roberto Silva',
        email: 'rsilva@example.com',
        roomType: 'estandar',
        checkIn: new Date('2025-10-25'),
        checkOut: new Date('2025-10-27'),
        people: 1,
        status: 'confirmed',
        paymentStatus: 'paid',
        totalPrice: 24000
      }
    })
  ]);

  console.log('✅ Reservas creadas');

  // Crear consultas
  await Promise.all([
    prisma.inquiry.create({
      data: {
        name: 'Laura Fernández',
        email: 'laura.f@example.com',
        phone: '+54 9 381 777-5555',
        message: '¿Tienen disponibilidad para un grupo de 10 personas en diciembre?',
        type: 'consulta',
        priority: 'alta'
      }
    }),
    prisma.inquiry.create({
      data: {
        name: 'Empresa Tech SA',
        email: 'eventos@techsa.com',
        phone: '+54 9 11 5555-4444',
        message: 'Necesitamos cotización para evento corporativo de 3 días con alojamiento para 20 personas.',
        type: 'experiencia_vip',
        service: 'Evento corporativo',
        guests: 20,
        budget: '$500,000 - $1,000,000',
        eventDate: new Date('2025-12-15'),
        priority: 'urgente'
      }
    }),
    prisma.inquiry.create({
      data: {
        name: 'Pedro Gómez',
        email: 'pedro.g@example.com',
        message: '¿Ofrecen traslados desde el aeropuerto?',
        type: 'consulta',
        priority: 'normal'
      }
    })
  ]);

  console.log('✅ Consultas creadas');

  // Crear registros de mantenimiento
  await Promise.all([
    prisma.maintenanceRecord.create({
      data: {
        roomId: rooms[5].id, // Habitación en limpieza
        type: 'preventivo',
        description: 'Revisión mensual de instalaciones eléctricas y sanitarias',
        scheduledDate: new Date('2025-10-14'),
        status: 'en_proceso',
        priority: 'media',
        assignedTo: 'Equipo de Mantenimiento'
      }
    }),
    prisma.maintenanceRecord.create({
      data: {
        roomId: rooms[1].id,
        type: 'correctivo',
        description: 'Reparación de aire acondicionado',
        scheduledDate: new Date('2025-10-16'),
        completedDate: new Date('2025-10-16'),
        status: 'completado',
        priority: 'alta',
        assignedTo: 'Juan Técnico',
        notes: 'Se reemplazó el compresor'
      }
    })
  ]);

  console.log('✅ Registros de mantenimiento creados');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - ${await prisma.user.count()} usuarios`);
  console.log(`   - ${await prisma.room.count()} habitaciones`);
  console.log(`   - ${await prisma.reservation.count()} reservas`);
  console.log(`   - ${await prisma.inquiry.count()} consultas`);
  console.log(`   - ${await prisma.maintenanceRecord.count()} registros de mantenimiento`);
  console.log('\n🔐 Credenciales de acceso:');
  console.log('   Admin: admin@hotelsupay.com / admin123');
  console.log('   Operador: operador@hotelsupay.com / admin123');
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
