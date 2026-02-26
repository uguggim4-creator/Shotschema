require('dotenv').config();

async function main() {
    console.log('Fetching models...');
    try {
        const res = await fetch('https://api.cometapi.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.COMET_API_KEY}`
            }
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Got models:', data.data?.length);
        const geminiModels = data.data.filter((m: any) => m.id.toLowerCase().includes('gemini'));
        console.log('Gemini Models:');
        geminiModels.forEach((m: any) => console.log(' -', m.id));
    } catch (e) {
        console.error(e);
    }
}
main();
