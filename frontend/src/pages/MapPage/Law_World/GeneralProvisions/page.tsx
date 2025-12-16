import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import './GeneralProvisions.css';

function GeneralProvisionsPage() {
    const navigate = useNavigate();
    const backgroundVideoRef = useRef<HTMLVideoElement>(null);

    // Toggle mute/unmute on user interaction (click/touch anywhere on page)
    useEffect(() => {
        const toggleMute = () => {
            if (backgroundVideoRef.current) {
                backgroundVideoRef.current.muted = !backgroundVideoRef.current.muted;
            }
        };

        document.addEventListener('click', toggleMute);

        return () => {
            document.removeEventListener('click', toggleMute);
        };
    }, []);

    const handleStartQuiz = () => {
        navigate(ROUTES.LAW_WORLD_GENERAL_PROVISIONS_QUIZ);
    };

    const handleBackClick = () => {
        navigate(ROUTES.LAW_WORLD);
    };

    return (
        <WorldPageLayout
            backgroundImage="/Law-world/general-provision.png"
            altText="General Provisions Quiz"
            onBackClick={handleBackClick}
        >
            {/* Background Video Container */}
            <div className="gp-background-video-container">
                <video
                    ref={backgroundVideoRef}
                    className="gp-background-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                >
                    <source src="/Law-world/Gavel-general-provision.webm?v=1" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="gp-quiz-start-container">
                <h2 className="gp-quiz-start-title">General Provisions</h2>
                <p className="gp-quiz-start-description">
                    Test your knowledge about the General Provisions of the United Nations Convention against Corruption (UNCAC).
                    Learn about its purposes, definitions, and key principles that form the foundation of international anti-corruption efforts.
                </p>
                <div className="gp-button-group">
                    <button className="gp-start-quiz-button" onClick={handleStartQuiz}>
                        Start Quiz
                    </button>
                    <button className="gp-refresh-memory-button" onClick={handleStartQuiz}>
                        Refresh Memory
                    </button>
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default GeneralProvisionsPage;
