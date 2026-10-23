const mongoose = require("mongoose");
const { PDFParse } = require("pdf-parse");
const InterviewReport = require("../models/interviewReport.model");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");

async function extractResumeText(file) {
    if (!file) return "";
    if (file.mimetype !== "application/pdf" || !file.originalname.toLowerCase().endsWith(".pdf")) {
        const error = new Error("Please upload a PDF resume.");
        error.status = 400;
        throw error;
    }
    if (file.buffer.subarray(0, 5).toString() !== "%PDF-") {
        const error = new Error("The uploaded file is not a valid PDF.");
        error.status = 400;
        throw error;
    }

    const parser = new PDFParse({ data: file.buffer });
    try {
        const parsed = await parser.getText();
        return parsed.text.trim();
    } finally {
        await parser.destroy();
    }
}

async function generateInterViewReportController(req, res) {
    const { jobDescription = "", selfDescription = "" } = req.body;
    if (!jobDescription.trim()) {
        return res.status(400).json({ message: "A target job description is required." });
    }
    if (!req.file && !selfDescription.trim()) {
        return res.status(400).json({ message: "Upload a PDF resume or provide a candidate description." });
    }

    const resume = await extractResumeText(req.file);
    if (req.file && !resume) {
        return res.status(400).json({ message: "No readable text was found in the uploaded PDF." });
    }

    const generated = await generateInterviewReport({ resume, selfDescription, jobDescription });
    const interviewReport = await InterviewReport.create({
        ...generated,
        jobDescription,
        resume,
        selfDescription,
        user: req.user.id,
    });

    return res.status(201).json({
        message: "Interview preparation plan created.",
        interviewReport,
    });
}

async function getInterviewReportByIdController(req, res) {
    if (!mongoose.isValidObjectId(req.params.interviewId)) {
        return res.status(400).json({ message: "Invalid interview plan ID." });
    }

    const interviewReport = await InterviewReport.findOne({
        _id: req.params.interviewId,
        user: req.user.id,
    });
    if (!interviewReport) {
        return res.status(404).json({ message: "Interview plan not found." });
    }
    return res.json({ interviewReport });
}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await InterviewReport.find({ user: req.user.id })
        .select("title matchScore createdAt")
        .sort({ createdAt: -1 })
        .limit(50);
    return res.json({ interviewReports });
}

async function generateResumePdfController(req, res) {
    if (!mongoose.isValidObjectId(req.params.interviewReportId)) {
        return res.status(400).json({ message: "Invalid interview plan ID." });
    }

    const report = await InterviewReport.findOne({
        _id: req.params.interviewReportId,
        user: req.user.id,
    }).select("resume selfDescription jobDescription");
    if (!report) {
        return res.status(404).json({ message: "Interview plan not found." });
    }

    const pdf = await generateResumePdf({
        resume: report.resume,
        selfDescription: report.selfDescription,
        jobDescription: report.jobDescription,
    });
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-resume.pdf"',
        "Content-Length": pdf.length,
    });
    return res.send(pdf);
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
};
