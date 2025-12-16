import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../../assets/assets';
import { ROUTES } from '../../../config/routes';
import WorldPageLayout from '../../../components/WorldPageLayout/WorldPageLayout';

function TheatreWorldPage() {
    const navigate = useNavigate();
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);
    const [spotlightPosition, setSpotlightPosition] = useState<{ x: number; y: number } | null>(null);
    const genderButtonRef = useRef<HTMLDivElement>(null);
    const educationButtonRef = useRef<HTMLDivElement>(null);
    const sportsButtonRef = useRef<HTMLDivElement>(null);
    const disabilityButtonRef = useRef<HTMLDivElement>(null);
    const peaceAgendaButtonRef = useRef<HTMLDivElement>(null);
    const pressButtonRef = useRef<HTMLDivElement>(null);
    const forumButtonRef = useRef<HTMLDivElement>(null);
    const gameButtonRef = useRef<HTMLDivElement>(null);

    const handleGenderClick = () => {
        navigate(ROUTES.THEATRE_WORLD_GENDER);
    };

    const handleEducationClick = () => {
        navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE_EDUCATION);
    };

    const handleSportsClick = () => {
        navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE_SPORTS);
    };

    const handleDisabilityClick = () => {
        navigate(ROUTES.THEATRE_WORLD_DISABILITY);
    };

    const handlePeaceAgendaClick = () => {
        navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE_PEACE_AGENDA);
    };

    const handlePressClick = () => {
        navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE_PRESS);
    };

    const handleForumClick = () => {
        navigate(ROUTES.THEATRE_WORLD_FORUM);
    };

    const handleGameClick = () => {
        navigate(ROUTES.THEATRE_WORLD_GAMES);
    };

    const handleMouseEnter = (areaId: string) => {
        setHoveredArea(areaId);
        let ref: React.RefObject<HTMLDivElement | null> | undefined;
        
        switch(areaId) {
            case 'gender':
                ref = genderButtonRef;
                break;
            case 'education':
                ref = educationButtonRef;
                break;
            case 'sports':
                ref = sportsButtonRef;
                break;
            case 'disability':
                ref = disabilityButtonRef;
                break;
            case 'peace-agenda':
                ref = peaceAgendaButtonRef;
                break;
            case 'press':
                ref = pressButtonRef;
                break;
            case 'forum':
                ref = forumButtonRef;
                break;
            case 'game':
                ref = gameButtonRef;
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
            backgroundImage={assets.innerTheatre}
            altText="Theatre World"
        >
            
            <div
                ref={genderButtonRef}
                onClick={handleGenderClick}
                onMouseEnter={() => handleMouseEnter('gender')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '28% -1% 2% -40%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'gender' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        GENDER
                    </h2>
                )}
            </div>

            {/* Education */}
            <div
                ref={educationButtonRef}
                onClick={handleEducationClick}
                onMouseEnter={() => handleMouseEnter('education')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '-7% -55% 2% -30%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'education' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        EDUCATION
                    </h2>
                )}
            </div>

            {/* Sports */}
            <div
                ref={sportsButtonRef}
                onClick={handleSportsClick}
                onMouseEnter={() => handleMouseEnter('sports')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '5% 20% 2% 98%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'sports' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        SPORTS
                    </h2>
                )}
            </div>

            {/* Disability */}
            <div
                ref={disabilityButtonRef}
                onClick={handleDisabilityClick}
                onMouseEnter={() => handleMouseEnter('disability')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '25% -50% 2% -50%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'disability' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        DISABILITY
                    </h2>
                )}
            </div>

            {/* Peace Agenda */}
            <div
                ref={peaceAgendaButtonRef}
                onClick={handlePeaceAgendaClick}
                onMouseEnter={() => handleMouseEnter('peace-agenda')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '35% -78% 2% -10%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'peace-agenda' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        PEACE AGENDA
                    </h2>
                )}
            </div>

            {/* Press */}
            <div
                ref={pressButtonRef}
                onClick={handlePressClick}
                onMouseEnter={() => handleMouseEnter('press')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '40% -75% 2% -35%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'press' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        PRESS
                    </h2>
                )}
            </div>

            {/* Forum */}
            <div
                ref={forumButtonRef}
                onClick={handleForumClick}
                onMouseEnter={() => handleMouseEnter('forum')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '-30% -55% 2% 10%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'forum' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        FORUM
                    </h2>
                )}
            </div>

            {/* Game */}
            <div
                ref={gameButtonRef}
                onClick={handleGameClick}
                onMouseEnter={() => handleMouseEnter('game')}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'absolute',
                    padding : '5px 15px 5px 15px',
                    color: 'var(--color-text, #000)',
                    margin: '-30% 70% 2% 15%',
                    width: '130px',
                    height: '150px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {hoveredArea === 'game' && spotlightPosition && (
                    <h2 
                        style={{ 
                            position: 'absolute',
                            top: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            color: '#2c1810',
                            backgroundColor: 'rgba(249, 229, 191, 0.95)',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                            border: '2px solid rgba(44, 24, 16, 0.2)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease-in-out',
                            opacity: 1,
                            zIndex: 15,
                        }}
                    >
                        GAME
                    </h2>
                )}
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
                        background: `radial-gradient(circle ${(hoveredArea === 'forum' || hoveredArea === 'game') ? '350px' : '180px'} at ${spotlightPosition.x}% ${spotlightPosition.y}%, transparent 0%, rgba(0, 0, 0, 0.66) 100%)`,
                    }}
                >
                </div>
            )}
        </WorldPageLayout>
    );
}

export default TheatreWorldPage;

