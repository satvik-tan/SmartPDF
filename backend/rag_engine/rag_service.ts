import { FlagEmbedding, EmbeddingModel } from 'fastembed';
import { qdrant_client } from '../vector_store/qdrant_client';
import { ensureCollection } from '../vector_store/store';
import {v4 as uuidv4} from 'uuid';
const embeddingModel = await FlagEmbedding.init({
    model: EmbeddingModel.BGEBaseEN
});

let documents = [
    "passage: Hello this is a test passage", 
    "query: What is the passage about?",
    "passage: This is another test passage for the RAG engine",
    "query: Can you summarize the second passage?",

    "fastembed-js is licensed under MIT License",
]

const embeddings = embeddingModel.embed(documents, 2);

interface Point {
    id: string;
    vector: number[];
    payload: {
        text: string;
    };
}
let points: Point[] = [];
let id =1;
for await (const batch of embeddings){
    console.log("batch:", batch);
    batch.forEach((vector, index) => {
    points.push({
        id: uuidv4(),
        vector: Array.from(vector),
        payload: {
            text: documents[index]
        }
    });
});
}

const collectionName = 'test_collection';
await ensureCollection(collectionName);
await qdrant_client.upsert(collectionName, {
    points: points.map(p => ({
        id: p.id.toString(),
        vector: p.vector,
        payload: p.payload
    }))
});

console.log("inserted points:", points.length);

