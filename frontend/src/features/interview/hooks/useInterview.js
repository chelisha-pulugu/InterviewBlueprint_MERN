import { useCallback, useContext, useEffect, useState } from "react";
import {
    generateInterviewReport,
    generateResumePdf,
    getAllInterviewReports,
    getInterviewReportById,
} from "../services/interview.api.js";
import { InterviewContext } from "../interview.state.js";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();
    const [error, setError] = useState("");
    const [downloadingResume, setDownloadingResume] = useState(false);

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = useCallback(async (input) => {
        setLoading(true);
        setError("");
        try {
            const response = await generateInterviewReport(input);
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? "Could not create your interview plan. Please try again.");
            throw requestError;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport]);

    const getReportById = useCallback(async (id) => {
        try {
            const response = await getInterviewReportById(id);
            setError("");
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (requestError) {
            setReport(null);
            setError(requestError.response?.data?.message ?? "Could not load this interview plan.");
            throw requestError;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport]);

    const getReports = useCallback(async () => {
        try {
            const response = await getAllInterviewReports();
            setError("");
            setReports(response.interviewReports);
            return response.interviewReports;
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? "Could not load your recent interview plans.");
            throw requestError;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReports]);

    const getResumePdf = useCallback(async (id) => {
        setDownloadingResume(true);
        setError("");
        try {
            const file = await generateResumePdf(id);
            const url = window.URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = `tailored-resume-${id}.pdf`;
            link.click();
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? "Could not create the tailored resume PDF.");
            throw requestError;
        } finally {
            setDownloadingResume(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const request = interviewId
                ? getReportById(interviewId)
                : getReports();
            request.catch((requestError) => {
                console.error("Could not load interview data:", requestError);
            });
        }, 0);

        return () => window.clearTimeout(timer);
    }, [getReportById, getReports, interviewId]);

    return { loading, downloadingResume, error, report, reports, generateReport, getReportById, getReports, getResumePdf };
};
