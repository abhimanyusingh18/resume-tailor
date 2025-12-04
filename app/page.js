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
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Resume Preview</h2>

                    <div
                        id="resume-preview"
                        style={{
                            flex: 1,
                            background: '#ffffff',
                            borderRadius: '8px',
                            padding: '2rem',
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 280px)',
                            color: '#000000',
                            lineHeight: '1.6'
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '0.9rem' }}>
                                Processing your resume...
                            </div>
                        ) : result ? (
                            <div dangerouslySetInnerHTML={{ __html: result }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                Your tailored resume will appear here.
                            </div>
                        )}
                    </div>

                    {result && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                className="btn-primary"
                                style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                                onClick={async () => {
                                    const element = document.getElementById('resume-preview');

                                    // Dynamically import html2pdf
                                    const html2pdf = (await import('html2pdf.js')).default;

                                    // Clone the element
                                    const clone = element.cloneNode(true);

                                    // Create a container for the clone to ensure it renders correctly off-screen
                                    const container = document.createElement('div');
                                    container.style.position = 'absolute';
                                    container.style.left = '-9999px';
                                    container.style.top = '0';
                                    container.style.width = '794px'; // Exact A4 width at 96DPI
                                    document.body.appendChild(container);

                                    // Apply styles to clone to ensure full content is captured
                                    clone.style.width = '100%';
                                    clone.style.height = 'auto';
                                    clone.style.maxHeight = 'none';
                                    clone.style.overflow = 'visible';
                                    clone.style.boxSizing = 'border-box'; // Ensure padding is included in width

                                    // Append clone to container
                                    container.appendChild(clone);

                                    // Configure html2pdf options
                                    const opt = {
                                        margin: [5, 10, 5, 10], // Reduced top/bottom margins
                                        filename: 'tailored-resume.pdf',
                                        image: { type: 'jpeg', quality: 0.98 },
                                        html2canvas: {
                                            scale: 2,
                                            useCORS: true,
                                            letterRendering: true,
                                            windowWidth: 794 // Match container width
                                        },
                                        jsPDF: {
                                            unit: 'mm',
                                            format: 'a4',
                                            orientation: 'portrait'
                                        },
                                        pagebreak: { mode: ['css', 'legacy'] } // Removed 'avoid-all' to reduce gaps
                                    };

                                    // Generate PDF and cleanup
                                    try {
                                        await html2pdf().set(opt).from(clone).save();
                                    } finally {
                                        document.body.removeChild(container);
                                    }
                                }}
                            >
                                📥 Download PDF
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
