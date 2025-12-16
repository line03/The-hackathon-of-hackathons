import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../../assets/assets';
import WorldPageLayout from '../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../config/routes';
import './PolicyWorld.css';

function PolicyWorldPage() {
    const navigate = useNavigate();
    const welcomeVideoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);
    const [spotlightPosition, setSpotlightPosition] = useState<{ x: number; y: number } | null>(null);
    
    const knowledgeButtonRef = useRef<HTMLDivElement>(null);
    const forumButtonRef = useRef<HTMLDivElement>(null);
    const debateButtonRef = useRef<HTMLDivElement>(null);
    const academiaButtonRef = useRef<HTMLDivElement>(null);

    // Toggle mute/unmute on user interaction, or restart if ended
    useEffect(() => {
        const handleClick = () => {
            // If audio has ended, restart both video and audio
            if (audioRef.current?.ended) {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
                if (welcomeVideoRef.current) {
                    welcomeVideoRef.current.play();
                }
                return;
            }

            // Otherwise toggle mute
            const newMutedState = !welcomeVideoRef.current?.muted;

            if (welcomeVideoRef.current) {
                welcomeVideoRef.current.muted = newMutedState;
            }
            if (audioRef.current) {
                audioRef.current.muted = newMutedState;
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const handleDebateClick = () => {
        navigate(ROUTES.POLICY_WORLD_DEBATE);
    };

    const handleAcademiaClick = () => {
        navigate(ROUTES.POLICY_WORLD_ACADEMIA);
    };

    // Explicit back navigation - go back to the Map page
    const handleBackClick = () => {
        navigate(ROUTES.MAP);
    };

    const handleMouseEnter = (areaId: string) => {
        setHoveredArea(areaId);
        let ref: React.RefObject<HTMLDivElement | null> | undefined;
        
        switch(areaId) {
            case 'knowledge':
                ref = knowledgeButtonRef;
                break;
            case 'forum':
                ref = forumButtonRef;
                break;
            case 'debate':
                ref = debateButtonRef;
                break;
            case 'academia':
                ref = academiaButtonRef;
                break;
        }

        if (ref?.current) {
            const rect = ref.current.getBoundingClientRect();
            let centerX = (rect.left + rect.width / 2) / window.innerWidth * 100;
            const centerY = ((rect.top + rect.height / 2) ) / window.innerHeight * 100;
            
            // Add 50px offset to the right for Youth Empowerment button
            if (areaId === 'debate') {
                const offsetPercent = (120 / window.innerWidth) * 100;
                centerX += offsetPercent;
            }
            
            setSpotlightPosition({ x: centerX, y: centerY });
        }
    };

    const handleMouseLeave = () => {
        setHoveredArea(null);
        setSpotlightPosition(null);
    };

    return (
        <WorldPageLayout
            backgroundImage={assets.innerPolicy}
            altText="Policy World"
            onBackClick={handleBackClick}
        >
            <div className="policy-world-video-container">
                <video
                    ref={welcomeVideoRef}
                    className="policy-world-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                >
                    <source src="/Policy-world/welcome-policy.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                <audio
                    ref={audioRef}
                    autoPlay
                    muted
                    onEnded={() => {
                        if (welcomeVideoRef.current) {
                            welcomeVideoRef.current.pause();
                        }
                    }}
                >
                    <source src="/Policy-world/welcome-policy.mp3" type="audio/mpeg" />
                </audio>
            </div>

            <div
                ref={academiaButtonRef}
                onClick={handleAcademiaClick}
                onMouseEnter={() => handleMouseEnter('academia')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    background: 'rgba(255, 255, 255, 0.63)',
                    border: 'var(--border-thick, 3px solid #000)',
                    borderRadius: '16px',
                    padding: '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '0% 0% 15% -5%',
                    maxWidth: '400px',
                    maxHeight: '50px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                Academia
            </div>

           

            <div
                ref={debateButtonRef}
                onClick={handleDebateClick}
                onMouseEnter={() => handleMouseEnter('debate')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    background: 'rgba(255, 255, 255, 0.63)',
                    border: 'var(--border-thick, 3px solid #000)',
                    borderRadius: '16px',
                    padding: '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '26% 0px 0px -50%',
                    maxWidth: '400px',
                    maxHeight: '50px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                Youth Empowerment
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
                        background: `radial-gradient(circle 270px at ${spotlightPosition.x}% ${spotlightPosition.y}%, transparent 0%, rgba(0, 0, 0, 0.66) 100%)`,
                    }}
                >
                </div>
            )}
        </WorldPageLayout>
    );
}

export default PolicyWorldPage;

