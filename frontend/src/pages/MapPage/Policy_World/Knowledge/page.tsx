import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { assets } from '../../../../assets/assets';
import './page.css';

function KnowledgePage() {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(ROUTES.POLICY_WORLD);
    };

    const handleStartQuiz = () => {
        navigate(ROUTES.POLICY_WORLD_KNOWLEDGE_QUIZ);
    };

    return (
        <WorldPageLayout
            backgroundImage={assets.innerPolicy}
            altText="Test Your Knowledge"
            onBackClick={handleBackClick}
        >
            <div className="knowledge-container">
                <h2 className="knowledge-title">Test Your Knowledge</h2>
                <p className="knowledge-description">
                    Challenge yourself with questions about anti-corruption policies, 
                    governance, and ethical practices. See how much you've learned!
                </p>
                
                <div className="knowledge-features">
                    <div className="feature-item">
                        <span className="feature-icon">📚</span>
                        <span className="feature-text">Multiple choice questions</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">💡</span>
                        <span className="feature-text">Helpful hints available</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🎯</span>
                        <span className="feature-text">Immediate feedback</span>
                    </div>
                </div>

                <button className="start-quiz-button" onClick={handleStartQuiz}>
                    Start Quiz →
                </button>
            </div>
        </WorldPageLayout>
    );
}

export default KnowledgePage;

