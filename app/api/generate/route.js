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
      - **Design Style**: "Classic Professional" (similar to Jake's Resume or Deedy). Use a serif font ('Times New Roman', Times, serif).
      - **Layout**: Single column, clean, high information density.
      
      **Specific Styling Instructions (Apply Inline):**
      1.  **Global**: font-family: 'Times New Roman', Times, serif; line-height: 1.4; font-size: 11pt;
      2.  **Header**: 
          -   Name: text-align: center; font-size: 24pt; margin-bottom: 5px; font-weight: normal;
          -   Contact Info: text-align: center; font-size: 10pt; margin-bottom: 15px; (Separate items with | surrounded by spaces).
      3.  **Section Headings**: 
          -   text-transform: uppercase; border-bottom: 1px solid currentColor; font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; padding-bottom: 2px;
      4.  **Experience/Project Items**:
          -   Use a Flexbox row for the top line: <div style="display: flex; justify-content: space-between; align-items: baseline;">
          -   **Left Side**: <strong>Role Title</strong> (or Project Name)
          -   **Right Side**: <span>Date Range</span>
          -   *Second Line (if applicable)*: <div style="display: flex; justify-content: space-between; font-style: italic;"> -> **Left**: Company Name, **Right**: Location.
      5.  **Lists**: 
          -   margin-top: 2px; margin-bottom: 8px; padding-left: 20px;
          -   List items (li): margin-bottom: 2px;
      
      **Critical Page Break Rules:**
      -   Add page-break-inside: avoid; break-inside: avoid; to list items (li) and the container of the Role/Company/Date block.
      -   Ensure headings (h2) are kept with their first few items.
      
      **Content Guidelines:**
      -   Highlight relevant skills for the job description.
      -   Use strong action verbs.
      -   Output ONLY valid HTML inside the main container.
      -   Ensure box-sizing: border-box and max-width: 100% on all elements.
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
