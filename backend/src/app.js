const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin(origin, callback) {
        const isLocalDevelopmentOrigin = process.env.NODE_ENV !== "production" &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
        const isConfiguredOrigin = origin && origin === process.env.FRONTEND_URL;

        if (!origin || isLocalDevelopmentOrigin || isConfiguredOrigin) {
            return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((error, _req, res, _next) => {
    if (error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Resume files must be 3 MB or smaller." });
    }
    if (error.name === "RequestTimeoutError") {
        return res.status(504).json({ message: "AI generation took too long. Please try again." });
    }
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) {
        console.error("API request failed:", error);
    }
    return res.status(status).json({
        message: status >= 500 ? "The server could not complete this request." : error.message,
    });
});


module.exports = app