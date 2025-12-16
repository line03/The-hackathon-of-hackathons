import { useLocation, useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { PersonalizedFeedback } from '../../../../components/PersonalizedFeedback/PersonalizedFeedback';
import type { QuizAnalysisResponse } from '../../../../types/analysis';
import type { Question } from '../../../../types/quiz';
import { assets } from '../../../../assets/assets';
import '../../Law_World/Criminalization/page.css';
import './page.css';

interface CorrectionState {
    analysisResult: QuizAnalysisResponse;
    score?: number;
    questions?: Question[];
}

function DebateCorrectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as CorrectionState | null;

    const handleBackClick = () => {
        navigate(ROUTES.POLICY_WORLD_DEBATE);
    };

    const handleBackToPolicy = () => {
        navigate(ROUTES.POLICY_WORLD);
    };

    if (!state || !state.analysisResult) {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Debate Review"
                onBackClick={handleBackClick}
            >
                <div className="cr-correction-container">
                    <h2 className="difficulty-selection-title">Debate Quiz Review</h2>
                    <p className="difficulty-selection-description">
                        No analysis data found. Please complete the Debate quiz first.
                    </p>
                    <button className="submit-button" onClick={handleBackClick}>
                        Back to Debate
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    const { analysisResult, questions } = state;

    return (
        <WorldPageLayout
            backgroundImage={assets.innerPolicy}
            altText="Debate Review"
            onBackClick={handleBackClick}
        >
            <div className="cr-correction-container" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                <h2 className="difficulty-selection-title">Debate Quiz Review</h2>
                <p className="difficulty-selection-description">
                    Here is a personalized breakdown of your answers, with explanations to help you deepen your
                    understanding of anti-corruption policies.
                </p>

                <div className="cr-feedback-content">
                    <div className="cr-overall-summary">
                        <strong>Quick Overview:</strong> {analysisResult.overall_summary}
                    </div>

                    {analysisResult.per_question.map((item, idx) => (
                        <div key={idx} className="cr-question-feedback">
                            <h4 className="cr-question-title">
                                Question: {item.question}
                            </h4>
                            {item.correct_answer && (
                                <p className="cr-correct-answer">
                                    <strong>Correct Answer:</strong> {item.correct_answer}
                                </p>
                            )}
                            {!item.correct_answer && questions && questions[item.question_index - 1] && (
                                <p className="cr-correct-answer">
                                    <strong>Correct Answer:</strong>{' '}
                                    {
                                        questions[item.question_index - 1].answerOptions.find(
                                            (o) => o.isCorrect
                                        )?.text
                                    }
                                </p>
                            )}
                            <PersonalizedFeedback
                                isLoading={false}
                                explanation={item.explanation}
                                diagramCode={item.diagram_code || undefined}
                            />
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="submit-button" onClick={handleBackClick}>
                            Watch Again
                        </button>
                        <button className="submit-button" onClick={handleBackToPolicy}>
                            Back to Policy World
                        </button>
                    </div>
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default DebateCorrectionPage;

