import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { useQuizCompletion } from '../../../../contexts/QuizCompletionContext';
import '../Games/page.css';

function ForumTheatrePage() {
    const navigate = useNavigate();
    const { isCompleted } = useQuizCompletion();

    const easyCompleted = isCompleted('forum', 'easy');
    const mediumCompleted = isCompleted('forum', 'medium');
    const hardCompleted = isCompleted('forum', 'hard');

    const canAccessMedium = easyCompleted;
    const canAccessHard = mediumCompleted;

    const handleDifficultyClick = (difficulty: 'easy' | 'medium' | 'hard') => {
        navigate(`/map/theatre-world/forum-theatre/quiz/${difficulty}`);
    };

    return (
        <WorldPageLayout
            backgroundImage="/Theatre/Forum_Theatre/Forum_Background.png"
            altText="Forum Theatre Difficulty Selection"
        >
            <div className="difficulty-selection-container">
                <h2 className="difficulty-selection-title">Select Difficulty</h2>
                <p className="difficulty-selection-description">
                    Choose a difficulty level to test your knowledge. Complete each level to unlock the next.
                </p>

                <div className="difficulty-cards">
                    {/* Easy - Always available */}
                    <div
                        className={`difficulty-card ${easyCompleted ? 'completed' : ''}`}
                        onClick={() => handleDifficultyClick('easy')}
                    >
                        <div className="difficulty-header">
                            <h3 className="difficulty-name">Easy</h3>
                            {easyCompleted && (
                                <span className="completed-badge">✓ Completed</span>
                            )}
                        </div>
                        <p className="difficulty-description">Start with the basics</p>
                    </div>

                    {/* Medium - Unlocks after Easy */}
                    {canAccessMedium ? (
                        <div
                            className={`difficulty-card ${mediumCompleted ? 'completed' : ''}`}
                            onClick={() => handleDifficultyClick('medium')}
                        >
                            <div className="difficulty-header">
                                <h3 className="difficulty-name">Medium</h3>
                                {mediumCompleted && (
                                    <span className="completed-badge">✓ Completed</span>
                                )}
                            </div>
                            <p className="difficulty-description">Intermediate challenge</p>
                        </div>
                    ) : (
                        <div className="difficulty-card locked">
                            <div className="difficulty-header">
                                <h3 className="difficulty-name">Medium</h3>
                            </div>
                            <p className="difficulty-description">Complete Easy first</p>
                        </div>
                    )}

                    {/* Hard - Unlocks after Medium */}
                    {canAccessHard ? (
                        <div
                            className={`difficulty-card ${hardCompleted ? 'completed' : ''}`}
                            onClick={() => handleDifficultyClick('hard')}
                        >
                            <div className="difficulty-header">
                                <h3 className="difficulty-name">Hard</h3>
                                {hardCompleted && (
                                    <span className="completed-badge">✓ Completed</span>
                                )}
                            </div>
                            <p className="difficulty-description">Expert level</p>
                        </div>
                    ) : (
                        <div className="difficulty-card locked">
                            <div className="difficulty-header">
                                <h3 className="difficulty-name">Hard</h3>
                            </div>
                            <p className="difficulty-description">Complete Medium first</p>
                        </div>
                    )}
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate(ROUTES.THEATRE_WORLD)}
                >
                    Back to Theatre World
                </button>
            </div>
        </WorldPageLayout>
    );
}

export default ForumTheatrePage;
