import { useEffect, useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth.js'

const Home = () => {

    const { loading, error, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ formError, setFormError ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ elapsedSeconds, setElapsedSeconds ] = useState(0)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    useEffect(() => {
        if (!loading) return

        const timer = window.setInterval(() => {
            setElapsedSeconds((elapsed) => elapsed + 1)
        }, 1000)
        return () => window.clearInterval(timer)
    }, [loading])

    const handleGenerateReport = async (event) => {
        event.preventDefault()
        setFormError("")
        if (!jobDescription.trim()) {
            setFormError("Add the job description you are preparing for.")
            return
        }
        if (!resumeFile && !selfDescription.trim()) {
            setFormError("Upload a PDF resume or add a short profile description.")
            return
        }
        setElapsedSeconds(0)
        try {
            const report = await generateReport({ jobDescription, selfDescription, resumeFile })
            navigate(`/interview/${report._id}`)
        } catch (requestError) {
            setFormError(requestError.response?.data?.message ?? "Could not create your interview plan. Please try again.")
        }
    }

    const handleResumeSelection = (event) => {
        const file = event.target.files?.[0] ?? null
        setFormError("")
        if (file && !file.name.toLowerCase().endsWith(".pdf")) {
            setResumeFile(null)
            event.target.value = ""
            setFormError("Choose a PDF file for your resume.")
            return
        }
        if (file && file.size > 3 * 1024 * 1024) {
            setResumeFile(null)
            event.target.value = ""
            setFormError("Your PDF must be 3 MB or smaller.")
            return
        }
        setResumeFile(file)
    }

    const handleRemoveResume = () => {
        setResumeFile(null)
        if (resumeInputRef.current) resumeInputRef.current.value = ""
    }

    const handleSignOut = async () => {
        try {
            await handleLogout()
            navigate("/login", { replace: true })
        } catch (requestError) {
            setFormError(requestError.response?.data?.message ?? "Could not sign out. Please try again.")
        }
    }

    if (loading) {
        return (
            <main className='loading-screen' role='status' aria-live='polite'>
                <span className='loading-spinner' aria-hidden='true' />
                <p className='eyebrow'>INTERVIEWBLUEPRINT</p>
                <h1>Building your interview plan</h1>
                <p>Matching your experience to the role and preparing tailored questions.</p>
                <p className='loading-elapsed'>{elapsedSeconds > 0 ? `Working for ${elapsedSeconds}s` : "This may take a little while..."}</p>
            </main>
        )
    }

    return (
        <div className='home-page'>

            <nav className="workspace-nav">
                <a className="brand-mark" href="/" aria-label="InterviewBlueprint home"><span>IB</span> InterviewBlueprint</a>
                <div className="workspace-user">
                    <span>{user?.username ?? "Your workspace"}</span>
                    <button type="button" className="text-button" onClick={handleSignOut}>Sign out</button>
                </div>
            </nav>

            <header className='page-header'>
                <p className="eyebrow">A PRACTICAL PLAN FOR THE ROLE YOU WANT</p>
                <h1>Make your next interview <span className='highlight'>count.</span></h1>
                <p>Work through questions for the role, see where to focus, and prepare with a plan based on your experience.</p>
            </header>

            {/* Main Card */}
            <form className='interview-card' onSubmit={handleGenerateReport}>
                {(formError || error) && <p className="form-error workspace-error" role="alert">{formError || error}</p>}
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label className={`dropzone${resumeFile ? ' dropzone--uploaded' : ''}`} htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    {resumeFile
                                        ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>}
                                </span>
                                <p className='dropzone__title'>{resumeFile ? "Resume uploaded" : "Choose a resume PDF"}</p>
                                <p className='dropzone__subtitle'>{resumeFile ? `${resumeFile.name} · ${(resumeFile.size / 1024).toFixed(0)} KB · Click to replace` : "PDF only · up to 3 MB"}</p>
                                <input ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf,application/pdf' onChange={handleResumeSelection} />
                            </label>
                            {resumeFile && <button type='button' className='remove-resume' onClick={handleRemoveResume}>Remove resume</button>}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>A focused plan, built from your profile and the job description</span>
                    <button
                        type="submit"
                        disabled={loading}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        {loading ? "Building your plan..." : "Build my interview plan"}
                    </button>
                </div>
            </form>

            {/* Recent Reports List */}
            {reports?.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home
