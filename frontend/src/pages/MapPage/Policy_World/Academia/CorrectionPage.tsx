import { useLocation, useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { PersonalizedFeedback } from '../../../../components/PersonalizedFeedback/PersonalizedFeedback';
import { assets } from '../../../../assets/assets';
import type { QuizAnalysisResponse } from '../../../../types/analysis';
import type { Question } from '../../../../types/quiz';
import type { ReflectionAnalysis } from '../../../../types/reflection';
import './page.css';
import '../../Law_World/Criminalization/page.css';

const MODULE_TITLES: Record<number, string> = {
    1: 'What Is Corruption?',
    2: 'Corruption & Good Governance',
    3: 'Corruption & Comparative Politics',
    4: 'Public Sector Corruption',
};

interface CorrectionState {
    analysisResult: QuizAnalysisResponse;
    score?: number;
    moduleId?: number;
    questions?: Question[];
    reflectionFeedback?: ReflectionAnalysis;
}

interface AcademiaCorrectionPageProps {
    moduleId: number;
}

function AcademiaCorrectionPage({ moduleId }: AcademiaCorrectionPageProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as CorrectionState | null;

    const handleBackClick = () => {
        navigate(ROUTES.POLICY_WORLD_ACADEMIA);
    };

    const handleRetakeModule = () => {
        switch (moduleId) {
            case 1:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_1);
                break;
            case 2:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_2);
                break;
            case 3:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_3);
                break;
            case 4:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_4);
                break;
            default:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA);
        }
    };

    if (!state || !state.analysisResult) {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Academia Review"
                onBackClick={handleBackClick}
            >
                <div className="cr-correction-container">
                    <h2 className="difficulty-selection-title">Module Review</h2>
                    <p className="difficulty-selection-description">
                        No analysis data found. Please complete the module first.
                    </p>
                    <button className="submit-button" onClick={handleBackClick}>
                        Back to Academia
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    const { analysisResult, questions, reflectionFeedback } = state;
    const moduleTitle = MODULE_TITLES[moduleId] || `Module ${moduleId}`;

    return (
        <WorldPageLayout
            backgroundImage={assets.innerPolicy}
            altText={`${moduleTitle} Review`}
            onBackClick={handleBackClick}
        >
            <div className="cr-correction-container" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                <h2 className="difficulty-selection-title">
                    Module {moduleId}: {moduleTitle} – Review
                </h2>
                <p className="difficulty-selection-description">
                    Here is a personalized breakdown of your answers, with explanations to help you
                    understand the key concepts in anti-corruption education.
                </p>

                <div className="cr-feedback-content">
                    {/* Show reflection feedback for Module 1 */}
                    {moduleId === 1 && reflectionFeedback && (
                        <div className="cr-reflection-summary">
                            <h3 className="cr-section-title">Your Reflection Analysis</h3>
                            <div className="cr-reflection-score">
                                Score: {reflectionFeedback.score}/10
                            </div>
                            <div className="cr-reflection-details">
                                <p><strong>Corruption Type:</strong> {reflectionFeedback.type_of_corruption.join(', ')}</p>
                                <p><strong>Key Actors:</strong> {reflectionFeedback.actors.join(', ')}</p>
                                <p><strong>Harm Identified:</strong> {reflectionFeedback.harm.join(', ')}</p>
                            </div>
                        </div>
                    )}

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

                    <div className="cr-action-buttons">
                        <button className="submit-button secondary" onClick={handleRetakeModule}>
                            Retake Module
                        </button>
                        <button className="submit-button" onClick={handleBackClick}>
                            Back to Academia
                        </button>
                    </div>
                </div>
            </div>
        </WorldPageLayout>
    );
}

// Export individual correction page components for each module
export function Module1CorrectionPage() {
    return <AcademiaCorrectionPage moduleId={1} />;
}

export function Module2CorrectionPage() {
    return <AcademiaCorrectionPage moduleId={2} />;
}

export function Module3CorrectionPage() {
    return <AcademiaCorrectionPage moduleId={3} />;
}

export function Module4CorrectionPage() {
    return <AcademiaCorrectionPage moduleId={4} />;
}

export default AcademiaCorrectionPage;

