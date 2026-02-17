import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Password: ${u.password}`);
    });
}
main().finally(() => prisma.$disconnect());
