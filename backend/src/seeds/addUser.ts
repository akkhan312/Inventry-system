import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create your user account
    const user = await prisma.user.upsert({
        where: { email: 'alikhanse248@gmail.com' },
        update: {},
        create: {
            username: 'engrali123',
            name: 'Ali Khan',
            email: 'alikhanse248@gmail.com',
            password: 'alikhan123', // Note: In production, this should be hashed!
            role: 'administrator',
            status: 'active',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali'
        }
    });

    const worker = await prisma.user.upsert({
        where: { email: 'worker@gst.com' },
        update: {},
        create: {
            username: 'worker1',
            name: 'Worker One',
            email: 'worker@gst.com',
            password: 'worker123',
            role: 'worker',
            status: 'active',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Worker'
        }
    });

    console.log('✅ Worker user created:', worker.username);

    console.log('\nYou can now login with:');
    console.log('  Admin - Email: alikhanse248@gmail.com, Password: alikhan123');
    console.log('  Worker - Email: worker@gst.com, Password: worker123');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
