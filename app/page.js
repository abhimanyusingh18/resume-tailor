'use client';

import { useState } from 'react';

export default function Home() {
    const [file, setFile] = useState(null);
    const [manualResumeText, setManualResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles[0]) {
            // Check if it's a PDF
            if (droppedFiles[0].type === 'application/pdf') {
                setFile(droppedFiles[0]);
            } else {
                setError('Please upload a PDF file.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult('');

        if ((!file && !manualResumeText) || !jobDescription) {
            setError('Please provide your resume (PDF or text) and a job description.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        if (manualResumeText) {
            formData.append('manualResumeText', manualResumeText);
        }
        formData.append('jobDescription', jobDescription);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setResult(data.result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ padding: '1rem' }}>
            <header style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    AI <span className="text-gradient">Resume Tailor</span>
                </h1>
                <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                    Craft the perfect resume for your dream job in seconds using AI.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Input Section */}
                <section className="glass-panel" style={{ padding: '1.25rem' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Input Details</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* File Upload */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                Upload Resume (PDF) - Optional
                            </label>
                            <div
                                style={{
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: isDragging ? 'rgba(212, 175, 55, 0.1)' : file ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                                    borderColor: isDragging ? 'var(--primary)' : file ? 'var(--primary)' : 'var(--glass-border)',
                                    transform: isDragging ? 'scale(1.02)' : 'scale(1)'
                                }}
                                onClick={() => document.getElementById('file-upload').click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <p style={{ color: file ? 'var(--primary)' : 'var(--secondary)', fontSize: '0.9rem', margin: 0 }}>
                                    {file ? file.name : isDragging ? 'Drop PDF here' : 'Click to upload or drag and drop'}
                                </p>
                            </div>
                        </div>

                        {/* Manual Resume Text Input */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                OR Paste Resume Text
                            </label>
                            <textarea
                                className="input-field"
                                rows="3"
                                placeholder="If PDF upload doesn't work, paste your resume text here..."
                                value={manualResumeText}
                                onChange={(e) => setManualResumeText(e.target.value)}
                                style={{ resize: 'vertical', fontSize: '0.85rem' }}
                            />
                        </div>

                        {/* Job Description */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                Job Description *
                            </label>
                            <textarea
                                className="input-field"
                                rows="5"
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                style={{ resize: 'vertical', fontSize: '0.85rem' }}
                            />
                        </div>

                        {error && (
                            <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ marginTop: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
                        >
                            {loading ? 'Generating...' : 'Generate Tailored Resume'}
                        </button>
                    </form>
                </section>

                {/* Output Section */}
                <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>LaTeX Result</h2>

                    <div
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            padding: '1rem',
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 280px)',
                            whiteSpace: 'pre-wrap',
                            color: '#d1d5db',
                            fontFamily: 'monospace',
                            lineHeight: '1.5',
                            fontSize: '0.75rem'
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                Processing your resume...
                            </div>
                        ) : result ? (
                            result
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                Your tailored resume (LaTeX) will appear here.
                            </div>
                        )}
                    </div>

                    {result && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                className="btn-primary"
                                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                onClick={() => navigator.clipboard.writeText(result)}
                            >
                                Copy LaTeX Code
                            </button>
                            <a
                                href="https://www.overleaf.com/project"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{
                                    background: 'linear-gradient(135deg, #19A974 0%, #157A52 100%)',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Open Overleaf
                            </a>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
