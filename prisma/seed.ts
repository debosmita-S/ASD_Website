import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function main() {
    const password = await hashPassword('Admin123!');

    // 0. Seed Roles
    const roles = ['ADMIN', 'DOCTOR', 'THERAPIST', 'COUNSELLOR', 'GUARDIAN'];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName, description: `${roleName} Role` },
        });
    }

    // 0.1 Seed Institution
    const institution = await prisma.institution.upsert({
        where: { code: 'WB-KOL-001' },
        update: {},
        create: {
            name: 'SMART-ASD Research Centre',
            code: 'WB-KOL-001',
            district: 'Kolkata',
            state: 'West Bengal'
        }
    });

    const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    const doctorRole = await prisma.role.findFirst({ where: { name: 'DOCTOR' } });
    const therapistRole = await prisma.role.findFirst({ where: { name: 'THERAPIST' } });
    const counsellorRole = await prisma.role.findFirst({ where: { name: 'COUNSELLOR' } });


    // 1. Admin
    if (adminRole) {
        await prisma.user.upsert({
            where: { email: 'admin@smart-asd.org' },
            update: {},
            create: {
                fullName: 'System Admin',
                roleId: adminRole.id,
                email: 'admin@smart-asd.org',
                phone: '9999999999',
                passwordHash: password,
                institutionId: institution.id,
                isActive: true,
            },
        });
    }

    // 2. Counsellor (For Registration)
    if (counsellorRole) {
        await prisma.user.upsert({
            where: { email: 'counsellor@smart-asd.org' },
            update: {},
            create: {
                fullName: 'Sarah Connor',
                roleId: counsellorRole.id,
                email: 'counsellor@smart-asd.org',
                phone: '9876543210',
                passwordHash: password,
                institutionId: institution.id,
                isActive: true,
            },
        });
    }

    // 3. Doctor (For Review)
    if (doctorRole) {
        await prisma.user.upsert({
            where: { email: 'doctor@smart-asd.org' },
            update: {},
            create: {
                fullName: 'Dr. House',
                roleId: doctorRole.id,
                email: 'doctor@smart-asd.org',
                phone: '8888888888',
                passwordHash: password,
                institutionId: institution.id,
                isActive: true,
            },
        });
    }

    // 4. Therapist (For Notes)
    if (therapistRole) {
        await prisma.user.upsert({
            where: { email: 'therapist@smart-asd.org' },
            update: {},
            create: {
                fullName: 'Emma Stone',
                roleId: therapistRole.id,
                email: 'therapist@smart-asd.org',
                phone: '7777777777',
                passwordHash: password,
                institutionId: institution.id,
                isActive: true,
            },
        });
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
