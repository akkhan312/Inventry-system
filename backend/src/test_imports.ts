
console.log('Starting import test...');

const timeout = setTimeout(() => {
    console.error('Timeout reached! Exiting...');
    process.exit(1);
}, 10000);

(async () => {
    try {
        console.log('Importing prisma...');
        await import('./lib/prisma.js');
        console.log('Prisma loaded');



        console.log('Importing notificationController...');
        await import('./controllers/notificationController.js');
        console.log('NotificationController loaded');

        console.log('Importing authController...');
        await import('./controllers/authController.js');
        console.log('AuthController loaded');

        console.log('Importing auth routes...');
        await import('./routes/auth.js');
        console.log('Auth routes loaded');

        console.log('Success!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        clearTimeout(timeout);
    }
})();
