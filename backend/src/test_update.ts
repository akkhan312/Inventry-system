import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'alikhanse248@gmail.com';
    const newPass = 'script_test_pass_123';

    console.log(`Updating ${email} to ${newPass}...`);
    const user = await prisma.user.update({
        where: { email },
        data: { password: newPass }
    });

    console.log('Update result:', user.password === newPass ? 'SUCCESS' : 'FAILED');

    const fetched = await prisma.user.findUnique({ where: { email } });
    console.log('Fetched immediately after:', fetched?.password);
}

main().finally(() => prisma.$disconnect());
