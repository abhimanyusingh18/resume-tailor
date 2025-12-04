import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { extractText } from "unpdf";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get("file");
        const manualResumeText = data.get("manualResumeText");
        const jobDescription = data.get("jobDescription");

        if (!jobDescription) {
            return NextResponse.json(
                { error: "Job Description is required." },
                { status: 400 }
            );
        }

        // Check if we have either file or manual text
        if (!file && !manualResumeText) {
            return NextResponse.json(
                { error: "Please provide either a PDF resume or paste your resume text." },
                { status: 400 }
            );
        }

        let resumeText = "";

        // If manual text is provided, use it directly
        if (manualResumeText && manualResumeText.trim().length > 0) {
            resumeText = manualResumeText;
            console.log("Using manual resume text, length:", resumeText.length);
        }
        // Otherwise, try to extract from PDF
        else if (file) {
            // Convert file to Uint8Array for unpdf
            const bytes = await file.arrayBuffer();
            const uint8Array = new Uint8Array(bytes);

            // Extract text from PDF using unpdf
            try {
                console.log("Extracting text from PDF using unpdf...");
                const { text } = await extractText(uint8Array, { mergePages: true });
                resumeText = text;

                console.log("PDF Text Length:", resumeText?.length || 0);
                console.log("First 200 chars:", resumeText?.substring(0, 200) || "EMPTY");

                // Validate that we got text
                if (!resumeText || resumeText.trim().length === 0) {
                    console.error("PDF parsing resulted in empty text");
                    return NextResponse.json(
                        { error: "Failed to extract text from PDF. The file may be image-based. Please paste your resume text manually instead." },
                        { status: 500 }
                    );
                }

            } catch (error) {
                console.error("Error parsing PDF:", error);
                return NextResponse.json(
                    { error: `Failed to parse PDF file: ${error.message}. Please paste your resume text manually instead.` },
                    { status: 500 }
                );
            }
        }

        // Construct Prompt for HTML generation
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
      You are an expert resume writer and HTML/CSS specialist.
      
      Here is a candidate's resume text:
      "${resumeText}"
      
      Here is the job description they are applying for:
      "${jobDescription}"
      
      Please rewrite the resume to better match the job description and output it as a complete, ready-to-use HTML document.
      
      Requirements:
      - Create a clean, professional, ATS-friendly resume
      - Use semantic HTML5 structure
      - Include ALL styles inline using the style attribute (no external CSS or <style> tags)
      - Highlight relevant skills and experiences that match the job description
      - Use professional and impactful language
      - Maintain the truthfulness of the original resume but emphasize the parts that matter for this job
      - Use a modern, clean design with proper typography
      - Make the resume look polished and professional when rendered
      - Use appropriate spacing, margins, and font sizes
      - Output ONLY the HTML code for the resume content (no <!DOCTYPE>, <html>, <head>, or <body> tags)
      - Start directly with a main container div and end with its closing tag
      - Use a white or light background and dark text for good contrast
      - Keep the layout single-column and print-friendly
      - Use colors sparingly and professionally (e.g., for section headers)
    `;

        // Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Strip markdown code fences if Gemini added them anyway
        text = text.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("Error generating resume:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
