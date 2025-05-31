import {qdrant_client} from './qdrant_client';

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


//a function to search points using query vector
