import { useLocation, useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { PersonalizedFeedback } from '../../../../components/PersonalizedFeedback/PersonalizedFeedback';
import type { QuizAnalysisResponse } from '../../../../types/analysis';
import type { Question } from '../../../../types/quiz';
import './page.css';

interface CorrectionState {
    analysisResult: QuizAnalysisResponse;
    score?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    questions?: Question[];
}

function CriminalizationCorrectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as CorrectionState | null;

    const handleBackClick = () => {
        navigate(ROUTES.LAW_WORLD_CRIMINALIZATION);
    };

    if (!state || !state.analysisResult) {
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/modules_background.png"
                altText="Criminalization Review"
                onBackClick={handleBackClick}
            >
                <div className="cr-correction-container">
                    <h2 className="difficulty-selection-title">Criminalization Review</h2>
                    <p className="difficulty-selection-description">
                        No analysis data found. Please complete a level first.
                    </p>
                    <button className="submit-button" onClick={handleBackClick}>
                        Back to Levels
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    const { analysisResult, difficulty, questions } = state;

    return (
        <WorldPageLayout
            backgroundImage="/Law-world/modules_background.png"
            altText="Criminalization Review"
            onBackClick={handleBackClick}
        >
            <div className="cr-correction-container" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                <h2 className="difficulty-selection-title">
                    {difficulty
                        ? `Criminalization – ${difficulty.toUpperCase()} Review`
                        : 'Criminalization Review'}
                </h2>
                <p className="difficulty-selection-description">
                    Here is a personalized breakdown of your answers, with explanations to help you
                    master the UNCAC criminalization offences.
                </p>

                <div className="cr-feedback-content">
                    <div
                        className="cr-overall-summary"
                    >
                        <strong>Quick Overview:</strong> {analysisResult.overall_summary}
                    </div>

                    {analysisResult.per_question.map((item, idx) => (
                        <div key={idx} className="cr-question-feedback">
                            <h4 className="cr-question-title">
                                Question: {item.question}
                            </h4>
                            {/* Prefer correct_answer from AI backend if available; fall back to original quiz data */}
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

                    <button className="submit-button" onClick={handleBackClick}>
                        Back to Levels
                    </button>
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default CriminalizationCorrectionPage;


