const mongoose = require('mongoose');

async function testUrl(url, label) {
    console.log(`\nTesting ${label}...`);
    try {
        await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ ${label} Success!`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.error(`❌ ${label} Failed:`, err.message);
        return false;
    }
}

async function run() {
    const urls = [
        { label: 'Server .env current (Manan2425)', url: 'mongodb+srv://manan2425:Manan2425@cluster0.mvdx9is.mongodb.net/ecommerce1' },
        { label: 'Root .env current (Mananpatel%40436)', url: 'mongodb+srv://manan2425:Mananpatel%40436@cluster0.mvdx9is.mongodb.net/ecommerce1' },
        { label: 'Common variant (Mananpatel@436)', url: 'mongodb+srv://manan2425:Mananpatel%40436@cluster0.mvdx9is.mongodb.net/ecommerce1' }
    ];

    for (const item of urls) {
        await testUrl(item.url, item.label);
    }
    process.exit(0);
}

run();
