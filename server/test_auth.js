// Using native fetch (Node 18+)

// Using native fetch if available (Node 18+)
const api = 'http://localhost:5001/api/auth';

const testAuth = async () => {
    try {
        console.log('--- Registering User ---');
        const regRes = await fetch(`${api}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        console.log('Register Status:', regRes.status);
        console.log('Register Data:', regData);

        if (regRes.status !== 201 && regRes.status !== 400) { // 400 if already exists
            throw new Error('Registration failed');
        }

        console.log('\n--- Logging In ---');
        const loginRes = await fetch(`${api}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Data:', loginData);

        if (loginRes.status === 200) {
            console.log('\n--- Getting Profile ---');
            const profileRes = await fetch(`${api}/me`, {
                headers: { 'Authorization': `Bearer ${loginData.token}` }
            });
            const profileData = await profileRes.json();
            console.log('Profile Status:', profileRes.status);
            console.log('Profile Data:', profileData);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

testAuth();
