// Native fetch (Node 18+)

const testRegister = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'debuguser_' + Date.now(),
                email: 'debug_' + Date.now() + '@example.com',
                password: 'password123'
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response Body:', text);
    } catch (error) {
        console.error('Fetch Error:', error);
    }
};

testRegister();
