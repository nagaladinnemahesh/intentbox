import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function analyzeEmailByAI(email: {subject: string, body: string}){
    const prompt = `
    You are an intelligent email analyzer. Categorize this email
    based on it's content.
    Email Subject: ${email.subject}
    Email Body: ${email.body}
    Classify into these fields:
    1. Importance: High, Medium, Low
    2. Intent: Interested, Not Interested, Follow-up Required, Spam, Unknown
    3. ShortSummary: one-sentence explanation for your classification

    Return a JSON object only, eg:
    {
        "Importance": "High",
        "Intent": "Interested",
        "ShortSummary": "The email expresses strong interest in our product and requests a follow-up meeting."
    }
    `;

    const result = await model.generateContent(prompt);
    // console.log('AI Analysis Result:', result);
    const text = result.response.text();

    try{
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const json = JSON.parse(cleanedText);
        return json;
    } catch(error){
        console.warn('Failed to parse AI output, returning raw text');
        return {rawOutput: text}
    }
}