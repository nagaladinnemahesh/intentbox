import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateEmbedding = async(text: string): Promise<number[]> => {
    try {
        const embeddingModel = genAI.getGenerativeModel({
            model: 'text-embedding-004',
        });

        const result = await embeddingModel.embedContent(text);
        const embedding = result.embedding.values;

        return embedding
    } catch (error){
        console.error('Error generating embedding:', error);
        return Array(768).fill(0)
    }
}