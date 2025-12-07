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
      You are an expert resume writer and HTML specialist.
      
      Here is a candidate's resume text:
      "${resumeText}"
      
      Here is the job description they are applying for:
      "${jobDescription}"
      
      Please rewrite the resume to better match the job description and output it as HTML content.
      
      **CRITICAL REQUIREMENTS:**
      1. **NO GLOBAL STYLES**: Do NOT use <style> tags, <link> tags, or any global CSS. Use ONLY inline styles.
      2. **NO WRAPPER TAGS**: Do NOT include <html>, <head>, or <body> tags. Output only the content divs.
      3. **Color Scheme**: Use white text (color: #ffffff or #ededed) on transparent/dark background to match the dark theme.
      4. **Font**: Use font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.6;
      
      **Specific Styling (ALL INLINE):**
      - **Header Name**: style="text-align: center; font-size: 24pt; margin-bottom: 5px; font-weight: normal; color: #ffffff;"
      - **Contact Info**: style="text-align: center; font-size: 10pt; margin-bottom: 15px; color: #ededed;"
      - **Section Headings**: style="text-transform: uppercase; border-bottom: 1px solid #ffffff; font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; padding-bottom: 2px; color: #ffffff;"
      - **Body Text**: style="color: #ededed; margin-bottom: 8px;"
      - **Experience Items**: Use flexbox for title/date: style="display: flex; justify-content: space-between; align-items: baseline; color: #ffffff; margin-bottom: 5px;"
      - **Lists**: style="margin-top: 2px; margin-bottom: 8px; padding-left: 20px; color: #ededed;"
      - **List Items**: style="margin-bottom: 2px; color: #ededed;"
      
      **Content Guidelines:**
      - Highlight relevant skills for the job description.
      - Use strong action verbs.
      - Keep it concise and high information density.
      - Output ONLY the HTML content, no markdown code fences.
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

        // Extract meaningful error message from Gemini API
        let errorMessage = "Internal Server Error";
        let statusCode = 500;

        // Check if it's a Gemini API error with status and errorDetails
        if (error.status) {
            statusCode = error.status;

            if (error.status === 429) {
                errorMessage = "⚠️ Rate Limit Exceeded: You've made too many requests. Please wait a few minutes and try again. For higher limits, consider upgrading your Gemini API plan.";
                if (error.errorDetails && error.errorDetails.length > 0) {
                    const retryDelay = error.errorDetails[0]?.retryDelay || "a few minutes";
                    errorMessage += ` Retry after: ${retryDelay}`;
                }
            } else if (error.status === 403) {
                errorMessage = "🔒 API Key Error: Your Gemini API key is invalid or doesn't have permission. Please check your .env.local file.";
            } else if (error.status === 400) {
                errorMessage = "❌ Bad Request: " + (error.message || "Invalid request to Gemini API");
            } else if (error.statusText) {
                errorMessage = `${error.statusText}: ${error.message || "Unknown error from Gemini API"}`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
