// purpose: create and export the fastembed embedder

//import and intialize the FastEmbed library
//export a functino like getEmbeddings
import {FlagEmbedding, EmbeddingModel} from 'fastembed';
import {v4 as uuidv4} from 'uuid';
import { Point } from '../../types/types';

export async function getEmbeddings(document_text: string[]): Promise<Point[]> {
   const embeddingModel = await FlagEmbedding.init({
    model: EmbeddingModel.BGEBaseEN
   });

   const embeddings = embeddingModel.embed(document_text, 2);

   let points: Point[] = [];
   let globalIndex = 0; // ← Track global position

   for await (const batch of embeddings){
    console.log("batch:", batch);
    batch.forEach((vector) => { // ← Remove index parameter
        if (globalIndex < document_text.length) {
            points.push({
                id: uuidv4(),
                vector: Array.from(vector),
                payload: {
                    text: document_text[globalIndex] // ← Use globalIndex
                }
            });
            globalIndex++; // ← Increment global counter
        }
    });
   }

   return points;
}