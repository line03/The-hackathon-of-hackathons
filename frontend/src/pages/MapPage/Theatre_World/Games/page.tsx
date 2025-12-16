import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { useQuizCompletion } from '../../../../contexts/QuizCompletionContext';
import '../../Law_World/Criminalization/page.css';
import './page.css';

type Difficulty = 'easy' | 'medium' | 'hard';

// Theatre character idle video
const CHARACTER_IDLE_VIDEO = '/Theatre/Character/idle-theatre.webm';

function GamesPage() {
    const navigate = useNavigate();
    const { isCompleted } = useQuizCompletion();

    const easyCompleted = isCompleted('games', 'easy');
    const mediumCompleted = isCompleted('games', 'medium');
    const hardCompleted = isCompleted('games', 'hard');

    const canAccessMedium = easyCompleted;
    const canAccessHard = mediumCompleted;

    // Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const levels: Difficulty[] = ['easy', 'medium', 'hard'];

    const handlePrevLevel = () => {
        setCarouselIndex((prev) => (prev === 0 ? levels.length - 1 : prev - 1));
    };

    const handleNextLevel = () => {
        setCarouselIndex((prev) => (prev === levels.length - 1 ? 0 : prev + 1));
    };

    const currentLevel = levels[carouselIndex];
    const isCurrentLevelLocked = 
        (currentLevel === 'medium' && !canAccessMedium) ||
        (currentLevel === 'hard' && !canAccessHard);
    const isCurrentLevelCompleted = 
        (currentLevel === 'easy' && easyCompleted) ||
        (currentLevel === 'medium' && mediumCompleted) ||
        (currentLevel === 'hard' && hardCompleted);

    const handleDifficultyClick = (level: Difficulty) => {
        if (!isCurrentLevelLocked) {
            navigate(`/map/theatre-world/games/quiz/${level}`);
        }
    };

    // Explicit back navigation: Games → Theatre World
    const handleBackClick = () => {
        navigate(ROUTES.THEATRE_WORLD);
    };

    return (
        <WorldPageLayout
            backgroundImage="/Theatre/Games/Games_Background.png"
            altText="Games Difficulty Selection"
            onBackClick={handleBackClick}
        >
            {/* Theatre Character - idle state on difficulty selection */}
            <div className="it-character-container selection-mode">
                <video
                    className="it-character-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    src={CHARACTER_IDLE_VIDEO}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="difficulty-selection-container">
                <h2 className="difficulty-selection-title">Games</h2>
                <p className="difficulty-selection-description">
                    Work through each level at your own pace. You can take a break between levels and come back later — 
                    your progress will be saved.
                </p>

                <div className="carousel-container">
                    <button className="carousel-arrow carousel-arrow-left" onClick={handlePrevLevel}>
                        ‹
                    </button>

                    <div className="carousel-track">
                        <div
                            className={`difficulty-card carousel-card ${isCurrentLevelCompleted ? 'completed' : ''} ${isCurrentLevelLocked ? 'locked' : ''}`}
                            onClick={() => !isCurrentLevelLocked && handleDifficultyClick(currentLevel)}
                        >
                            <div className="difficulty-header">
                                <h3 className="difficulty-name">
                                    {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
                                </h3>
                                {isCurrentLevelCompleted && (
                                    <span className="completed-badge">✓ Completed</span>
                                )}
                                {isCurrentLevelLocked && (
                                    <span className="locked-badge">🔒</span>
                                )}
                            </div>
                            <p className="difficulty-description">
                                {currentLevel === 'easy' && 'Start with the basics'}
                                {currentLevel === 'medium' && (canAccessMedium ? 'Intermediate challenge' : 'Complete Easy first to unlock')}
                                {currentLevel === 'hard' && (canAccessHard ? 'Expert level' : 'Complete Medium first to unlock')}
                            </p>
                        </div>
                    </div>

                    <button className="carousel-arrow carousel-arrow-right" onClick={handleNextLevel}>
                        ›
                    </button>
                </div>

                <div className="carousel-dots">
                    {levels.map((_, idx) => (
                        <button
                            key={idx}
                            className={`carousel-dot ${idx === carouselIndex ? 'active' : ''}`}
                            onClick={() => setCarouselIndex(idx)}
                        />
                    ))}
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default GamesPage;
