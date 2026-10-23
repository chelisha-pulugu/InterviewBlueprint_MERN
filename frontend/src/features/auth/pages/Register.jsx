import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth.js";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { loading, handleRegister } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await handleRegister({ username, email, password });
            navigate("/", { replace: true });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ??
                "We couldn't create your account. Check your connection and try again."
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
                <h1>Build your confidence</h1>
                <p className="auth-intro">Create an account to get a preparation plan tailored to your next interview.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Name</label>
                        <input onChange={(event) => setUsername(event.target.value)} type="text" id="username" name="username" placeholder="Your name" autoComplete="name" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input onChange={(event) => setEmail(event.target.value)} type="email" id="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input onChange={(event) => setPassword(event.target.value)} type="password" id="password" name="password" placeholder="Create a password" autoComplete="new-password" minLength={8} required />
                    </div>
                    <button className="button primary-button" type="submit" disabled={loading}>Create account</button>
                </form>
                <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </main>
    );
};

export default Register;
