// Using global fetch

// Actually, let's just use the `fetch` global often available in Node 18+.

async function test() {
    try {
        console.log("Testing existing user...");
        const res1 = await fetch('http://localhost:3001/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'student@example.com' })
        });
        const data1 = await res1.json();
        console.log('student@example.com exists:', data1.exists);

        console.log("Testing new user...");
        const res2 = await fetch('http://localhost:3001/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'newuser12345@example.com' })
        });
        const data2 = await res2.json();
        console.log('newuser12345@example.com exists:', data2.exists);

    } catch (e) {
        console.error(e);
    }
}

test();
