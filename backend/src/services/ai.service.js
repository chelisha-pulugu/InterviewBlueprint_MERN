const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const PDFDocument = require("pdfkit");

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"]),
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string()),
    })),
    title: z.string(),
});

const resumeSchema = z.object({
    name: z.string(),
    headline: z.string(),
    summary: z.string(),
    experience: z.array(z.object({
        role: z.string(),
        company: z.string(),
        period: z.string(),
        details: z.array(z.string()),
    })),
    skills: z.array(z.string()),
    education: z.array(z.string()),
});

function getAiClient() {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error("GOOGLE_GENAI_API_KEY is required for AI interview features");
    }
    return new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
}

async function generateStructuredResponse(schema, prompt) {
    const response = await getAiClient().interactions.create({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        input: prompt,
        generation_config: {
            thinking_level: "low",
            max_output_tokens: 4096,
        },
        response_format: {
            type: "text",
            mime_type: "application/json",
            schema: z.toJSONSchema(schema, { target: "openapi-3.0" }),
        },
    }, { timeout_ms: 60000, retries: 0 });

    if (!response.output_text) {
        throw new Error("Gemini returned an empty response");
    }
    return schema.parse(JSON.parse(response.output_text));
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Create a practical, concise interview-preparation report using the candidate profile and target role below. Be specific to the role. Do not invent candidate experience. Return a match score from 0 to 100, 4 technical questions, 4 behavioral questions, relevant skill gaps, and a focused 7-day preparation plan. For each question include a brief reason it may be asked and a concise answer framework. Keep each preparation task to one short sentence.

Candidate resume:
${resume || "Not provided"}

Candidate self-description:
${selfDescription || "Not provided"}

Target job description:
${jobDescription}`;

    return generateStructuredResponse(interviewReportSchema, prompt);
}

function addSection(document, heading, content) {
    if (!content?.length) return;
    document.moveDown(0.8);
    document.font("Helvetica-Bold").fontSize(13).fillColor("#126b5b").text(heading);
    document.moveDown(0.3);
    document.font("Helvetica").fontSize(10).fillColor("#263238");
    for (const item of content) {
        document.text(`• ${item}`, { indent: 10, paragraphGap: 4 });
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Create an ATS-friendly resume tailored to this job. Only use facts in the provided resume or self-description. Do not invent names, employers, dates, qualifications, or results. Use empty strings or arrays when details are not provided. Return concise, readable content.

Resume:
${resume || "Not provided"}

Self-description:
${selfDescription || "Not provided"}

Target job description:
${jobDescription}`;

    const content = await generateStructuredResponse(resumeSchema, prompt);
    const document = new PDFDocument({ size: "A4", margin: 54, info: { Title: "Tailored Interview Resume" } });
    const chunks = [];
    document.on("data", (chunk) => chunks.push(chunk));

    const completed = new Promise((resolve, reject) => {
        document.once("end", () => resolve(Buffer.concat(chunks)));
        document.once("error", reject);
    });

    document.font("Helvetica-Bold").fontSize(22).fillColor("#126b5b").text(content.name || "Candidate");
    document.moveDown(0.25);
    if (content.headline) {
        document.font("Helvetica").fontSize(11).fillColor("#53666b").text(content.headline);
    }
    addSection(document, "Professional Summary", content.summary ? [content.summary] : []);
    addSection(document, "Experience", content.experience.flatMap((item) => [
        `${item.role}${item.company ? ` — ${item.company}` : ""}${item.period ? ` | ${item.period}` : ""}`,
        ...item.details,
    ]));
    addSection(document, "Skills", content.skills);
    addSection(document, "Education", content.education);
    document.end();
    return completed;
}

module.exports = { generateInterviewReport, generateResumePdf };
