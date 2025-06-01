import {qdrant_client} from './qdrant_client';
import { Point } from '../../types/types';

//this function ensures that a collection exists in Qdrant, creating it if it does not.
export async function ensureCollection(name: string){
    const collections = await qdrant_client.getCollections();
    const exists = collections.collections.find(c => c.name === name);
    if (!exists) {
        await qdrant_client.createCollection(name, {
            vectors:{
                size: 768,
                distance:'Cosine'
            },
            
            
        });
        console.log(`Collection ${name} created.`);
    } else {
        console.log(`Collection ${name} already exists.`);
    }

    
    

}

//a function to insert points into a Qdrant collection
export async function insertPoints(collectionName: string, points: Point[]) {
    await ensureCollection(collectionName);
    await qdrant_client.upsert(collectionName, {
    points: points.map(p => ({
        id: p.id.toString(),
        vector: p.vector,
        payload: p.payload
    }))
});
  console.log("point inserted", points.length);
}


//a function to search points using query vector
export async function searchPoints(collectionName: string, queryVector: number[], limit: number = 5) 
    {
        await ensureCollection(collectionName);
        const response = await qdrant_client.search(collectionName, {
            vector: queryVector,
            limit: limit,
            with_payload: true
        })

        return response;
    }
