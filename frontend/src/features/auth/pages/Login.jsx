import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth.js";

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await handleLogin({ email, password });
            navigate("/", { replace: true });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ??
                "We couldn't sign you in. Check your details and try again."
            );
        }
    };

    if (loading) {
        return <main className="loading-screen"><p>Preparing your interview workspace...</p></main>;
    }

    return (
        <main>
            <div className="form-container auth-card">
                <p className="eyebrow">INTERVIEWBLUEPRINT</p>
                <h1>Welcome back</h1>
                <p className="auth-intro">Sign in to continue preparing for your next opportunity.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input onChange={(e) => setEmail(e.target.value)} type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" name="password" placeholder="Enter your password" autoComplete="current-password" required />
                    </div>
                    <button className="button primary-button" type="submit" disabled={loading}>Sign in</button>
                </form>
                <p className="auth-switch">New to InterviewBlueprint? <Link to="/register">Create an account</Link></p>
            </div>
        </main>
    );
};

export default Login;