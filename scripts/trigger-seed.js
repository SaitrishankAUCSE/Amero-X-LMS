
async function seedSite() {
    console.log("Seeding site content...");
    try {
        const response = await fetch('https://lms-platform-silk.vercel.app/api/seed');
        const data = await response.json();
        console.log("Seed Result:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seedSite();
