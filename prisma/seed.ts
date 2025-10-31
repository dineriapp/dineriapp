// seed.ts
import { PrismaClient, ReservationPaymentStatus, ReservationSource, ReservationStatus, TableStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const RESTAURANT_ID = '73e1f0c1-3014-49c5-a874-f359221f11a5'

// Your existing settings
const RESTAURANT_SETTINGS = {
    "deposit_settings": {
        "depositType": "per-person",
        "dynamicRules": [{
            "id": 1761388945050,
            "amount": "0",
            "priority": "0",
            "ruleType": "day-of-week",
            "depositType": "per-person"
        }],
        "depositAmount": "10",
        "depositCurrency": "EUR (€)",
        "cancellationPolicies": [],
        "depositSystemEnabled": true
    },
    "overrides_settings": {
        "overrides": [],
        "overrides_enabled": false
    },
    "restaurantSettings": {
        "enable_overbooking": false,
        "use_tiered_duration": false,
        "large_party_duration": 150,
        "small_party_duration": 90,
        "medium_party_duration": 120,
        "overbooking_percentage": 0,
        "enable_turn_time_buffer": false,
        "booking_interval_minutes": 30,
        "enable_variable_duration": false,
        "turn_time_buffer_minutes": 15,
        "enable_table_combinations": false,
        "duration_per_guest_minutes": 30,
        "max_reservation_duration_minutes": 180,
        "min_reservation_duration_minutes": 60,
        "default_reservation_duration_minutes": 120
    },
    "notification_settings": {
        "test_mode": true,
        "email_reply_to": "",
        "resend_api_key": "asdsad",
        "email_from_name": "",
        "reminder_time_24h": "10:00:00",
        "email_reminder_body": "Hi {{guest_name}},\n\nThis is a friendly reminder about your reservation tomorrow:\n\nParty size: {{party_size}}\nDate: {{date}}\nTime: {{time}}\n\nWe look forward to seeing you!\n\n{{restaurant_name}}\n{{restaurant_contact}}",
        "notifications_enabled": false,
        "sms_reminder_template": "Reminder: Your reservation at {{restaurant_name}} today at {{time}} for {{party_size}}. Reply CANCEL to cancel.",
        "email_reminder_subject": "Reminder: Your reservation tomorrow at {{restaurant_name}}",
        "email_confirmation_body": "Hi {{guest_name}},\n\nThis confirms your reservation for {{party_size}} on {{date}} at {{time}}.\n\nWe look forward to seeing you!\n\nNeed to cancel? Visit your confirmation link.\n\n{{restaurant_name}}\n{{restaurant_contact}}",
        "sms_2h_reminder_enabled": false,
        "email_24h_reminder_enabled": true,
        "email_cancellation_enabled": true,
        "email_confirmation_enabled": true,
        "email_confirmation_subject": "Your reservation at {{restaurant_name}}"
    }
}

// Restaurant opening hours based on your JSON
const OPENING_HOURS = {
    "friday": { "open": "", "close": "", "closed": true },
    "monday": { "open": "08:00 AM", "close": "05:00 PM", "closed": false },
    "sunday": { "open": "09:00 AM", "close": "05:00 PM", "closed": false },
    "tuesday": { "open": "06:00 AM", "close": "09:00 PM", "closed": false },
    "saturday": { "open": "06:00 AM", "close": "07:00 PM", "closed": false },
    "thursday": { "open": "06:00 AM", "close": "06:00 PM", "closed": false },
    "wednesday": { "open": "", "close": "", "closed": true }
}

// Helper function to convert time string to hours and minutes
function parseTime(timeStr: string): { hours: number, minutes: number } {
    if (!timeStr) return { hours: 0, minutes: 0 }

    const [time, period] = timeStr.split(' ')
    const [hoursStr, minutesStr] = time.split(':')

    let hours = parseInt(hoursStr)
    const minutes = parseInt(minutesStr)

    if (period === 'PM' && hours < 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    return { hours, minutes }
}

// Helper function to get day name from date
function getDayName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
}

// Helper function to generate random time within opening hours
function generateRandomTimeWithinHours(openTime: string, closeTime: string): { hours: number, minutes: number } {
    const open = parseTime(openTime)
    const close = parseTime(closeTime)

    // Convert to total minutes for easier calculation
    const openMinutes = open.hours * 60 + open.minutes
    const closeMinutes = close.hours * 60 + close.minutes

    // Generate random time between open and close (in 15-minute intervals)
    const randomMinutes = faker.number.int({
        min: openMinutes,
        max: closeMinutes - 120 // Ensure reservation fits within remaining time
    })

    // Round to nearest 15 minutes
    const roundedMinutes = Math.floor(randomMinutes / 15) * 15

    return {
        hours: Math.floor(roundedMinutes / 60),
        minutes: roundedMinutes % 60
    }
}

async function main() {
    console.log('🌱 Starting reservation seed...')

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: RESTAURANT_ID }
    })

    if (!restaurant) {
        throw new Error(`Restaurant with ID ${RESTAURANT_ID} not found`)
    }

    console.log('✅ Restaurant found:', restaurant.name)
    console.log('⏰ Timezone:', restaurant.timezone)

    // 1. Create Areas
    console.log('📝 Creating areas...')
    await prisma.area.createMany({
        data: [
            {
                id: faker.string.uuid(),
                restaurant_id: RESTAURANT_ID,
                name: 'Main Dining',
                description: 'Elegant main dining area with ambient lighting',
                sort_order: 0,
                active: true
            },
            {
                id: faker.string.uuid(),
                restaurant_id: RESTAURANT_ID,
                name: 'Patio',
                description: 'Outdoor seating with garden view',
                sort_order: 1,
                active: true
            },
            {
                id: faker.string.uuid(),
                restaurant_id: RESTAURANT_ID,
                name: 'Private Room',
                description: 'Exclusive private dining for special events',
                sort_order: 2,
                active: true
            },
            {
                id: faker.string.uuid(),
                restaurant_id: RESTAURANT_ID,
                name: 'Bar Area',
                description: 'Casual seating at the bar and high tables',
                sort_order: 3,
                active: true
            }
        ],
        skipDuplicates: true
    })

    const createdAreas = await prisma.area.findMany({
        where: { restaurant_id: RESTAURANT_ID }
    })

    console.log(`✅ Created ${createdAreas.length} areas`)

    // 2. Create Tables
    console.log('📝 Creating tables...')
    const tablesData = []

    // Main Dining Tables (12 tables)
    for (let i = 1; i <= 12; i++) {
        let capacity, minParty, maxParty, name

        if (i <= 6) {
            // Small tables for 2
            capacity = 2
            minParty = 1
            maxParty = 2
            name = `Booth ${i}`
        } else if (i <= 10) {
            // Medium tables for 4
            capacity = 4
            minParty = 2
            maxParty = 4
            name = `Table ${i}`
        } else {
            // Large tables for 6
            capacity = 6
            minParty = 4
            maxParty = 6
            name = `Family ${i - 10}`
        }

        tablesData.push({
            id: faker.string.uuid(),
            restaurant_id: RESTAURANT_ID,
            area_id: createdAreas[0].id, // Main Dining
            table_number: `MD${i.toString().padStart(2, '0')}`,
            name: name,
            capacity: capacity,
            min_party_size: minParty,
            max_party_size: maxParty,
            status: 'ACTIVE' as TableStatus,
            sort_order: i
        })
    }

    // Patio Tables (8 tables)
    for (let i = 1; i <= 8; i++) {
        const capacity = i <= 6 ? 2 : 4
        tablesData.push({
            id: faker.string.uuid(),
            restaurant_id: RESTAURANT_ID,
            area_id: createdAreas[1].id, // Patio
            table_number: `PT${i.toString().padStart(2, '0')}`,
            name: `Patio ${i}`,
            capacity: capacity,
            min_party_size: 1,
            max_party_size: capacity,
            status: 'ACTIVE' as TableStatus,
            sort_order: i
        })
    }

    // Private Room Tables (3 large tables)
    for (let i = 1; i <= 3; i++) {
        tablesData.push({
            id: faker.string.uuid(),
            restaurant_id: RESTAURANT_ID,
            area_id: createdAreas[2].id, // Private Room
            table_number: `PR${i.toString().padStart(2, '0')}`,
            name: `Private ${i}`,
            capacity: 8,
            min_party_size: 6,
            max_party_size: 8,
            status: 'ACTIVE' as TableStatus,
            sort_order: i
        })
    }

    // Bar Area Tables (6 tables)
    for (let i = 1; i <= 6; i++) {
        tablesData.push({
            id: faker.string.uuid(),
            restaurant_id: RESTAURANT_ID,
            area_id: createdAreas[3].id, // Bar Area
            table_number: `BA${i.toString().padStart(2, '0')}`,
            name: `Bar ${i}`,
            capacity: 2,
            min_party_size: 1,
            max_party_size: 2,
            status: 'ACTIVE' as TableStatus,
            sort_order: i
        })
    }

    await prisma.table.createMany({
        data: tablesData,
        skipDuplicates: true
    })

    const createdTables = await prisma.table.findMany({
        where: { restaurant_id: RESTAURANT_ID },
        include: { area: true }
    })

    console.log(`✅ Created ${createdTables.length} tables`)

    // 3. Create Reservations for the next 7 days
    console.log('📝 Creating reservations...')

    const reservations = []
    const tableReservations = []
    const payments = []

    const statusWeights = {
        'PENDING': 1,
        'CONFIRMED': 4,
        'SEATED': 2,
        'COMPLETED': 3,
        'CANCELLED': 1,
        'NO_SHOW': 0.5
    }

    const sourceWeights = {
        'ONLINE': 6,
        'PHONE': 2,
        'WALK_IN': 1,
        'PARTNER': 1
    }

    // Generate reservations for each day
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() + dayOffset)
        currentDate.setHours(0, 0, 0, 0)

        const dayName = getDayName(currentDate)
        const daySchedule = OPENING_HOURS[dayName as keyof typeof OPENING_HOURS]

        // Skip closed days
        if (daySchedule.closed) {
            console.log(`⏸️  Skipping ${dayName} - restaurant closed`)
            continue
        }

        console.log(`📅 Generating reservations for ${dayName} (${daySchedule.open} - ${daySchedule.close})`)

        // Create 8-15 reservations per day
        const reservationsPerDay = faker.number.int({ min: 8, max: 15 })

        for (let i = 0; i < reservationsPerDay; i++) {
            const reservationId = faker.string.uuid()

            // Generate random time within opening hours
            const { hours, minutes } = generateRandomTimeWithinHours(daySchedule.open!, daySchedule.close!)
            const arrivalTime = new Date(currentDate)
            arrivalTime.setHours(hours, minutes, 0, 0)

            const partySize = faker.helpers.arrayElement([1, 2, 2, 2, 3, 4, 4, 4, 5, 6, 8])
            const status = faker.helpers.weightedArrayElement(
                Object.entries(statusWeights).map(([value, weight]) => ({ value, weight }))
            )
            const source = faker.helpers.weightedArrayElement(
                Object.entries(sourceWeights).map(([value, weight]) => ({ value, weight }))
            )

            // Calculate estimated duration based on settings
            let estimatedDuration = RESTAURANT_SETTINGS.restaurantSettings.default_reservation_duration_minutes
            if (RESTAURANT_SETTINGS.restaurantSettings.use_tiered_duration) {
                if (partySize <= 2) {
                    estimatedDuration = RESTAURANT_SETTINGS.restaurantSettings.small_party_duration
                } else if (partySize <= 6) {
                    estimatedDuration = RESTAURANT_SETTINGS.restaurantSettings.medium_party_duration
                } else {
                    estimatedDuration = RESTAURANT_SETTINGS.restaurantSettings.large_party_duration
                }
            }

            // Create reservation
            reservations.push({
                id: reservationId,
                restaurant_id: RESTAURANT_ID,
                customer_name: faker.person.fullName(),
                customer_email: faker.internet.email(),
                customer_phone: faker.phone.number(),
                arrival_time: arrivalTime,
                estimated_duration_minutes: estimatedDuration,
                party_size: partySize,
                special_requests: faker.helpers.maybe(() =>
                    faker.helpers.arrayElement([
                        'Window seat preferred',
                        'Celebrating anniversary',
                        'Allergy: shellfish',
                        'High chair needed',
                        'Quiet table requested',
                        'Birthday celebration',
                        'Vegetarian options needed'
                    ]),
                    { probability: 0.3 }
                ),
                preferred_area: faker.helpers.maybe(() =>
                    faker.helpers.arrayElement(createdAreas.map(area => area.name)),
                    { probability: 0.4 }
                ),
                status: status as ReservationStatus,
                source: source as ReservationSource,
                confirmed_at: status !== 'PENDING' ? faker.date.recent({ days: 1 }) : null,
                seated_at: status === 'SEATED' ? new Date(arrivalTime.getTime() + faker.number.int({ min: -30, max: 30 }) * 60000) : null,
                completed_at: status === 'COMPLETED' ? new Date(arrivalTime.getTime() + estimatedDuration * 60000) : null,
                cancelled_at: status === 'CANCELLED' ? faker.date.recent({ days: 1 }) : null,
                no_show_at: status === 'NO_SHOW' ? new Date(arrivalTime.getTime() + 30 * 60000) : null,
                createdAt: faker.date.recent({ days: 7 }),
                updatedAt: new Date()
            })

            // Find suitable table for this reservation
            const suitableTables = createdTables.filter(table =>
                table.capacity >= partySize &&
                table.min_party_size <= partySize &&
                table.max_party_size >= partySize
            )

            if (suitableTables.length > 0 && status !== 'CANCELLED' && status !== 'NO_SHOW') {
                const assignedTable = faker.helpers.arrayElement(suitableTables)

                tableReservations.push({
                    id: faker.string.uuid(),
                    reservation_id: reservationId,
                    table_id: assignedTable.id,
                    assigned_by: faker.helpers.maybe(() => 'Staff', { probability: 0.8 }),
                    assigned_at: new Date()
                })

                // Create payment record
                const depositAmount = RESTAURANT_SETTINGS.deposit_settings.depositSystemEnabled
                    ? parseFloat(RESTAURANT_SETTINGS.deposit_settings.depositAmount) * partySize
                    : 0

                let paymentStatus: ReservationPaymentStatus = ReservationPaymentStatus.PENDING

                if (
                    status === ReservationStatus.COMPLETED ||
                    status === ReservationStatus.SEATED ||
                    status === ReservationStatus.CONFIRMED
                ) {
                    paymentStatus = faker.helpers.arrayElement([
                        ReservationPaymentStatus.PAID,
                        // You can interpret "CASH" as also PAID to match enum
                        ReservationPaymentStatus.PAID
                    ])
                } else if (status === ReservationStatus.CANCELLED) {
                    paymentStatus = faker.helpers.arrayElement([
                        ReservationPaymentStatus.REFUNDED,
                        ReservationPaymentStatus.FAILED
                    ])
                }

                payments.push({
                    id: faker.string.uuid(),
                    reservation_id: reservationId,
                    amount: depositAmount,
                    currency: 'EUR',
                    payment_method: faker.helpers.arrayElement(['card', 'cash']),
                    transaction_id: faker.helpers.maybe(() => `pi_${faker.string.alphanumeric(24)}`, { probability: 0.7 }),
                    status: paymentStatus as ReservationPaymentStatus,
                    deposit_amount: depositAmount,
                    deposit_percentage: depositAmount > 0 ? 100 : null,
                    paid_at: paymentStatus === 'PAID' ? faker.date.recent({ days: 1 }) : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
            }
        }
    }

    // Insert reservations in batches
    console.log(`📊 Creating ${reservations.length} reservations...`)

    for (let i = 0; i < reservations.length; i += 50) {
        const batch = reservations.slice(i, i + 50)
        await prisma.reservation.createMany({
            data: batch,
            skipDuplicates: true
        })
        console.log(`✅ Created batch ${Math.floor(i / 50) + 1}`)
    }

    // Insert table reservations
    console.log(`📊 Creating ${tableReservations.length} table assignments...`)
    await prisma.tableReservation.createMany({
        data: tableReservations,
        skipDuplicates: true
    })

    // Insert payments
    console.log(`📊 Creating ${payments.length} payment records...`)
    await prisma.payment.createMany({
        data: payments,
        skipDuplicates: true
    })

    // Print summary
    const reservationCounts = await prisma.reservation.groupBy({
        by: ['status'],
        where: { restaurant_id: RESTAURANT_ID },
        _count: true
    })

    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!')
    console.log('📊 RESERVATION SUMMARY:')
    reservationCounts.forEach(item => {
        console.log(`   ${item.status}: ${item._count} reservations`)
    })

    const totalReservations = reservationCounts.reduce((sum, item) => sum + item._count, 0)
    console.log(`\n📈 TOTAL: ${totalReservations} reservations created`)
    console.log(`🏠 Across ${createdAreas.length} areas`)
    console.log(`🍽️  Using ${createdTables.length} tables`)

    // Show opening hours compliance
    console.log('\n⏰ OPENING HOURS COMPLIANCE:')
    Object.entries(OPENING_HOURS).forEach(([day, schedule]) => {
        console.log(`   ${day}: ${schedule.closed ? 'CLOSED' : `${schedule.open} - ${schedule.close}`}`)
    })
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })