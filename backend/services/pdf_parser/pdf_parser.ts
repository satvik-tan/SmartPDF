import fs from "fs";
import pdf from "pdf-parse";

//using simple pdf-parse for text extractino for now, would need a 
//full pipeline for images, tables, latex etc -- todo

async function parsePdf(filePath: string): Promise<string>{
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
    
}