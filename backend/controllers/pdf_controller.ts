import {Request , Response, Router}  from 'express';
import PdfParse from 'pdf-parse';
import fs from 'fs';
import { extractTextFromFile } from '../services/pdf_parser/pdf_service.js';

//we'll chunk it here
const router = Router();

router.post("/parse", async (req: Request, res: Response):Promise<any> => { //yeah don't judge me, I know this is a bad idea
    const { filePath } = req.body;
    if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
    }
    try{
        const text = await extractTextFromFile(filePath);
        res.json({ text });

    }
    catch (error) {
        console.error("Error parsing PDF:", error);
        return res.status(500).json({ error: "Failed to parse PDF" });
    }
});
