const fetch = require('node-fetch');

const register = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Admin User',
                email: 'admin@sweech.co.ke',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
};

register();
