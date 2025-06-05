import * as fs from "fs";
import pdf = require("pdf-parse");

// Using simple pdf-parse for text extraction for now.
// TODO: Add full pipeline for images, tables, LaTeX, etc.

export async function extractTextFromFile(filePath: string): Promise<string> {
    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Read the file into a buffer
        const dataBuffer = fs.readFileSync(filePath);

        // Parse the PDF and extract text
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("Failed to parse PDF");
    }
}

// Example usage
(async () => {
    try {
        const text = await extractTextFromFile("chatgpt-conversation-7.pdf");
        console.log("Extracted text:", text);
    } catch (error :any) {
        console.error("Error:", error.message);
    }
})();