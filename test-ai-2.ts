require('dotenv').config();

async function main() {
    console.log('Fetching google/gemini-2.5-flash...');
    try {
        const res = await fetch('https://api.cometapi.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.COMET_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gemini-3-flash',
                messages: [{ role: 'user', content: 'Say hello' }]
            })
        });
        console.log('Status:', res.status, res.statusText);
        const text = await res.text();
        console.log('Body:', text);
    } catch (e) {
        console.error(e);
    }
}
main();
