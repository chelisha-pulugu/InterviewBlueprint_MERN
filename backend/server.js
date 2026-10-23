require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

async function startServer() {
    if (!process.env.JWT_SECRET) {
        throw new Error("Set JWT_SECRET in backend/.env before starting the API.");
    }

    await connectToDB();
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
        console.log(`InterviewBlueprint API is listening on port ${port}`);
    });
}

startServer().catch((error) => {
    console.error("Backend startup failed:", error.message);
    process.exitCode = 1;
});
