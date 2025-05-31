import {QdrantClient} from '@qdrant/js-client-rest'
import dotenv from 'dotenv';
dotenv.config();

   
export const qdrant_client = new QdrantClient({
    url: 'https://e9e518ec-7225-45fd-acce-7fe391d2051e.europe-west3-0.gcp.cloud.qdrant.io:6333',
    apiKey: process.env.QDRANT_API_KEY,
});
