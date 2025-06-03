import { Request, Response } from 'express';
import { getEmbeddings } from '../services/embeddings/fastembed.js';
import { ensureCollection } from '../services/vector_store/store.js';
import { qdrant_client } from '../services/vector_store/qdrant_client.js';

export class RagController {
    
    // Initialize the RAG system (optional endpoint for testing)
    async initialize(req: Request, res: Response) {
        try {
            // Test with sample documents
            const testDocuments = [
                "This is a test document for RAG system initialization",
                "FastEmbed provides efficient text embeddings",
                "Qdrant is a vector database for similarity search"
            ];

            const points = await getEmbeddings(testDocuments);
            console.log(`Generated ${points.length} embeddings for initialization`);

            res.json({
                success: true,
                message: 'RAG system initialized successfully',
                pointsGenerated: points.length
            });
        } catch (error) {
            console.error('Initialize error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during initialization'
            });
        }
    }

    // Add documents to vector database
    async addDocuments(req: Request, res: Response) {
        try {
            const { documents, collectionName } = req.body;

            // Validation
            if (!documents || !Array.isArray(documents)) {
                return res.status(400).json({
                    success: false,
                    error: 'Documents array is required'
                });
            }

            if (!collectionName || typeof collectionName !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Collection name is required'
                });
            }

            if (documents.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Documents array cannot be empty'
                });
            }

            console.log(`Processing ${documents.length} documents for collection: ${collectionName}`);

            // Generate embeddings using your fastembed service
            const points = await getEmbeddings(documents);
            console.log(`Generated ${points.length} embeddings`);

            // Ensure collection exists
            await ensureCollection(collectionName);
            console.log(`Collection ${collectionName} is ready`);

            // Insert points into Qdrant
            await qdrant_client.upsert(collectionName, { points });
            console.log(`Inserted ${points.length} points into ${collectionName}`);

            res.json({
                success: true,
                message: `Successfully added ${points.length} documents to collection ${collectionName}`,
                data: {
                    collectionName,
                    documentsProcessed: documents.length,
                    pointsInserted: points.length
                }
            });

        } catch (error) {
            console.error('Add documents error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error while adding documents'
            });
        }
    }

    // Search documents (basic implementation)
    async searchDocuments(req: Request, res: Response) {
        try {
            const { query, collectionName, limit = 5 } = req.body;

            // Validation
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query string is required'
                });
            }

            if (!collectionName || typeof collectionName !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Collection name is required'
                });
            }

            console.log(`Searching for: "${query}" in collection: ${collectionName}`);

            // Generate embedding for the query
            const queryEmbeddings = await getEmbeddings([query]);
            const queryVector = queryEmbeddings[0].vector;

            console.log(`Generated query embedding with ${queryVector.length} dimensions`);

            // Search in Qdrant
            const searchResults = await qdrant_client.search(collectionName, {
                vector: queryVector,
                limit: Math.min(limit, 20), // Cap at 20 results
                with_payload: true
            });

            console.log(`Found ${searchResults.length} results`);

            res.json({
                success: true,
                message: `Found ${searchResults.length} results for query: "${query}"`,
                data: {
                    query,
                    collectionName,
                    resultsCount: searchResults.length,
                    results: searchResults
                }
            });

        } catch (error) {
            console.error('Search documents error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error while searching documents'
            });
        }
    }

    // Get collection info
    async getCollectionInfo(req: Request, res: Response) {
        try {
            const { collectionName } = req.params;

            if (!collectionName) {
                return res.status(400).json({
                    success: false,
                    error: 'Collection name is required'
                });
            }

            const collections = await qdrant_client.getCollections();
            const collection = collections.collections.find(c => c.name === collectionName);

            if (!collection) {
                return res.status(404).json({
                    success: false,
                    error: `Collection ${collectionName} not found`
                });
            }

            const collectionInfo = await qdrant_client.getCollection(collectionName);

            res.json({
                success: true,
                data: {
                    collectionName,
                    info: collectionInfo
                }
            });

        } catch (error) {
            console.error('Get collection info error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error while getting collection info'
            });
        }
    }

    // Health check for RAG system
    async healthCheck(req: Request, res: Response) {
        try {
            // Test Qdrant connection
            const collections = await qdrant_client.getCollections();
            
            res.json({
                success: true,
                message: 'RAG system is healthy',
                data: {
                    timestamp: new Date().toISOString(),
                    qdrantConnected: true,
                    collectionsCount: collections.collections.length
                }
            });

        } catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'RAG system health check failed'
            });
        }
    }
}