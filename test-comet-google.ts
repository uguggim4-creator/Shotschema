require('dotenv').config();
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');

async function main() {
    try {
        const google = createGoogleGenerativeAI({
            apiKey: process.env.COMET_API_KEY,
            baseURL: 'https://api.cometapi.com/v1beta',
        });

        console.log('Testing generateText with CometAPI (Google native)...');
        const res = await generateText({
            model: google('gemini-3-flash'),
            prompt: 'Hello, say hi back in one sentence.',
        });
        console.log('Result:', res.text);
    } catch (e) {
        console.error('Error:', e.message || e);
    }
}
main();
