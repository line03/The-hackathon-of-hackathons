import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../../assets/assets';
import WorldPageLayout from '../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../config/routes';
import './LawWorld.css';

function LawWorldPage() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);
    const [spotlightPosition, setSpotlightPosition] = useState<{ x: number; y: number } | null>(null);
    
    const generalProvisionsButtonRef = useRef<HTMLButtonElement>(null);
    const preventiveMeasuresButtonRef = useRef<HTMLButtonElement>(null);
    const criminalizationButtonRef = useRef<HTMLButtonElement>(null);
    const internationalButtonRef = useRef<HTMLButtonElement>(null);
    const assetRecoveryButtonRef = useRef<HTMLButtonElement>(null);
    const technicalButtonRef = useRef<HTMLButtonElement>(null);

    // Explicit back navigation: Law World → Map page
    const handleBackClick = () => {
        navigate(ROUTES.MAP);
    };

    // Toggle mute/unmute on user interaction (click/touch anywhere on page)
    useEffect(() => {
        const toggleMute = () => {
            if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted;
            }
        };

        document.addEventListener('click', toggleMute);

        return () => {
            document.removeEventListener('click', toggleMute);
        };
    }, []);

    const handleGeneralProvisionsClick = () => {
        navigate(ROUTES.LAW_WORLD_GENERAL_PROVISIONS);
    };

    const handleCriminalizationClick = () => {
        navigate(ROUTES.LAW_WORLD_CRIMINALIZATION);
    };

    const handleMouseEnter = (areaId: string) => {
        setHoveredArea(areaId);
        let ref: React.RefObject<HTMLButtonElement | null> | undefined;
        
        switch(areaId) {
            case 'general-provisions':
                ref = generalProvisionsButtonRef;
                break;
            case 'preventive-measures':
                ref = preventiveMeasuresButtonRef;
                break;
            case 'criminalization':
                ref = criminalizationButtonRef;
                break;
            case 'international':
                ref = internationalButtonRef;
                break;
            case 'asset-recovery':
                ref = assetRecoveryButtonRef;
                break;
            case 'technical':
                ref = technicalButtonRef;
                break;
        }

        if (ref?.current) {
            const rect = ref.current.getBoundingClientRect();
            const centerX = (rect.left + rect.width / 2) / window.innerWidth * 100;
            const centerY = ((rect.top + rect.height / 2) ) / window.innerHeight * 100;
            setSpotlightPosition({ x: centerX, y: centerY });
        }
    };

    const handleMouseLeave = () => {
        setHoveredArea(null);
        setSpotlightPosition(null);
    };

    return (
        <WorldPageLayout
            backgroundImage={assets.innerLaw}
            altText="Law World"
            onBackClick={handleBackClick}
        >
            {/* Video Container */}
            <div className="law-world-video-container">
                <video
                    ref={videoRef}
                    className="law-world-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                >
                    <source src="/Law-world/Character/Gavel welcome.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="law-world-buttons">
                <button
                    ref={generalProvisionsButtonRef}
                    className="law-world-btn law-world-btn--secondary law-world-btn--general-provisions"
                    onClick={handleGeneralProvisionsClick}
                    onMouseEnter={() => handleMouseEnter('general-provisions')}
                    onMouseLeave={handleMouseLeave}
                >
                    General provisions
                </button>
                <button
                    ref={preventiveMeasuresButtonRef}
                    className="law-world-btn law-world-btn--secondary law-world-btn--disabled law-world-btn--preventive-measures"
                    onMouseEnter={() => handleMouseEnter('preventive-measures')}
                    onMouseLeave={handleMouseLeave}
                >
                    Preventive measures
                </button>
                <button
                    ref={criminalizationButtonRef}
                    className="law-world-btn law-world-btn--secondary law-world-btn--criminalization"
                    onClick={handleCriminalizationClick}
                    onMouseEnter={() => handleMouseEnter('criminalization')}
                    onMouseLeave={handleMouseLeave}
                >
                    Criminalization and law enforcement
                </button>
                <button
                    ref={internationalButtonRef}
                    className="law-world-btn law-world-btn--secondary law-world-btn--disabled law-world-btn--international"
                    onMouseEnter={() => handleMouseEnter('international')}
                    onMouseLeave={handleMouseLeave}
                >
                    International cooperation
                </button>
                <button
                    ref={assetRecoveryButtonRef}
                    className="law-world-btn law-world-btn--secondary law-world-btn--disabled law-world-btn--asset-recovery"
                    onMouseEnter={() => handleMouseEnter('asset-recovery')}
                    onMouseLeave={handleMouseLeave}
                >
                    Asset recovery
                </button>
                <button
                    ref={technicalButtonRef}
                    className="law-world-btn law-world-btn--secondary law-world-btn--disabled law-world-btn--technical"
                    onMouseEnter={() => handleMouseEnter('technical')}
                    onMouseLeave={handleMouseLeave}
                >
                    Technical assistance and information exchange
                </button>
            </div>

            {/* Spotlight overlay - only shows when hovering */}
            {hoveredArea !== null && spotlightPosition && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 5,
                        transition: 'opacity 0.3s ease-in-out',
                        background: `radial-gradient(circle 220px at ${spotlightPosition.x}% ${spotlightPosition.y}%, transparent 0%, rgba(0, 0, 0, 0.66) 100%)`,
                    }}
                >
                </div>
            )}
        </WorldPageLayout>
    );
}

export default LawWorldPage;

