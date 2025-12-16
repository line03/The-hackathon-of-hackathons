import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layouts/Header';
import { PreferencesQuestionnaire } from '../../components/PreferencesQuestionnaire/PreferencesQuestionnaire';
import type { UserPreferences } from '../../types/preferences';
import './WelcomePage.css';

function WelcomePage() {
    const [fullName, setFullName] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Toggle mute/unmute on user interaction, or restart if ended
    useEffect(() => {
        const handleClick = (e: MouseEvent | Event) => {
            // Ignore clicks on interactive elements
            const target = e.target as HTMLElement;
            if (
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('textarea')
            ) {
                return;
            }

            // If audio has ended, restart both video and audio
            if (audioRef.current?.ended) {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
                if (videoRef.current) {
                    videoRef.current.play();
                }
                return;
            }

            // Otherwise toggle mute (only for audio)
            const newMutedState = !audioRef.current?.muted;

            if (audioRef.current) {
                audioRef.current.muted = newMutedState;
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fullName.trim()) {
            localStorage.setItem('userName', fullName.trim());
            // Show preferences modal instead of navigating immediately
            setShowPreferencesModal(true);
        }
    };

    const handlePreferencesComplete = (prefs: UserPreferences) => {
        // Save preferences
        localStorage.setItem('userPreferences', JSON.stringify(prefs));

        // Start animation and navigate
        setShowPreferencesModal(false);
        setIsAnimating(true);
        setTimeout(() => {
            navigate('/map');
        }, 600);
    };

    return (
        <div className={`welcome-page ${isAnimating ? 'fade-out' : ''}`}>
            <Header showUserInfo={false} />

            {/* Preferences Modal (above everything else) */}
            <PreferencesQuestionnaire
                open={showPreferencesModal}
                onComplete={handlePreferencesComplete}
            />

            <div className="welcome-content-area">
                <div className="welcome-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                    <div className="floating-shape shape-4"></div>
                </div>

                <div className="welcome-main-layout">
                    <div className="welcome-video-container">
                        <video
                            ref={videoRef}
                            className="welcome-video"
                            autoPlay
                            muted
                            loop
                            playsInline
                            disablePictureInPicture
                            controlsList="nodownload nofullscreen noremoteplayback"
                        >
                            <source src="/welcome-main.webm" type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                        <audio
                            ref={audioRef}
                            autoPlay
                            muted
                            onEnded={() => {
                                if (videoRef.current) {
                                    videoRef.current.pause();
                                }
                            }}
                        >
                            <source src="/welcome-main.mp3" type="audio/mpeg" />
                        </audio>
                    </div>

                    {/* Welcome Container */}
                    <div className="welcome-container">
                        <div className="welcome-header">
                            <div className="logo-container">
                                <div className="logo-icon">
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path d="M50 20 L50 50 L70 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M30 75 L50 55 L70 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <circle cx="50" cy="35" r="8" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="welcome-title">
                                Anti-Corruption
                                <span className="title-highlight">Learning City</span>
                            </h1>
                            <p className="welcome-subtitle">
                                Embark on an educational journey to understand and combat corruption
                            </p>
                        </div>

                        <form className="welcome-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="fullName" className="input-label">
                                    Enter your full name to begin
                                </label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        id="fullName"
                                        className="name-input"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your full name"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`enter-button ${fullName.trim() ? 'active' : ''}`}
                                disabled={!fullName.trim()}
                            >
                                <span>Enter the City</span>
                                <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </form>

                        <div className="welcome-footer">
                            <p className="footer-text">
                                Learn • Explore • Make a Difference
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomePage;
