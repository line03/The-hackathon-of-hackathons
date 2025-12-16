import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layouts/Header';
import { assets } from '../../assets/assets';
import { ROUTES } from '../../config/routes';
import './MapPage.css';

function MapPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (!storedName) {
            navigate('/');
            return;
        }
    }, [navigate]);

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
                target.closest('textarea') ||
                target.classList.contains('law-world-overlay') ||
                target.classList.contains('theatre-world-overlay') ||
                target.classList.contains('policy-world-overlay')
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

    const handleLawWorldClick = () => {
        navigate(ROUTES.LAW_WORLD);
    };

    const handleTheatreWorldClick = () => {
        navigate(ROUTES.THEATRE_WORLD);
    };

    const handlePolicyWorldClick = () => {
        navigate(ROUTES.POLICY_WORLD);
    };

    return (
        <div className="map-page">
            <Header showUserInfo={true} />

            <main className="map-content">
                <div className="map-container">
                    <img
                        src={assets.background}
                        alt="City Map"
                        className="map-image"
                    />
                    <img
                        src={assets.lawWorld}
                        alt="Law World"
                        className="law-world-overlay"
                        onClick={handleLawWorldClick}
                    />
                    <p
                        className="law-world-label"
                        style={{
                            position: 'absolute',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '5px',
                            zIndex: 11, // higher than any overlay or image (CSS map overlays are z-index: 2-3, video is 10)
                            top: '10%',
                            left: '25%',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        International Integrity Court
                    </p>
                    <img
                        src={assets.theatreWorld}
                        alt="Theatre World"
                        className="theatre-world-overlay"
                        onClick={handleTheatreWorldClick}
                    />
                    <p
                        className="theatre-world-label"
                        style={{
                            position: 'absolute',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '5px',
                            zIndex: 11, // higher than any overlay or image (CSS map overlays are z-index: 2-3, video is 10)
                            top: '35%',
                            left: '65%',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        Forum Theatre Studio
                    </p>
                    <img
                        src={assets.policyWorld}
                        alt="Policy World"
                        className="policy-world-overlay"
                        onClick={handlePolicyWorldClick}
                    />
                    <p
                        className="policy-world-label"
                        style={{
                            position: 'absolute',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '5px',
                            zIndex: 11, // higher than any overlay or image (CSS map overlays are z-index: 2-3, video is 10)
                            top: '40%',
                            left: '20%',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        Youth Empowerement Center
                    </p>
                </div>
            </main>
            <div className="map-page-video-container">
                <video
                    ref={videoRef}
                    className="map-page-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    controlsList="nodownload nofullscreen noremoteplayback"
                >
                    <source src="/welcome-main.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                <audio
                    ref={audioRef}
                    autoPlay
                    muted
                    style={{ display: 'none' }}
                    onEnded={() => {
                        if (videoRef.current) {
                            videoRef.current.pause();
                        }
                    }}
                >
                    <source src="/map/map-main.mp3" type="audio/mpeg" />
                </audio>
            </div>
        </div>
    );
}

export default MapPage;

