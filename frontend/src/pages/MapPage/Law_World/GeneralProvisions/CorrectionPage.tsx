import { useLocation, useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { PersonalizedFeedback } from '../../../../components/PersonalizedFeedback/PersonalizedFeedback';
import type { QuizAnalysisResponse } from '../../../../types/analysis';
import './GeneralProvisions.css';

interface CorrectionState {
    analysisResult: QuizAnalysisResponse;
    score?: number;
}

function GeneralProvisionsCorrectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as CorrectionState;

    const handleBackClick = () => {
        navigate(ROUTES.LAW_WORLD_GENERAL_PROVISIONS_QUIZ, {
            state: {
                restoreResults: true,
                analysisResult: state.analysisResult,
                score: state.score
            }
        });
    };

    if (!state || !state.analysisResult) {
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/general-provision.png"
                altText="General Provisions Correction"
                onBackClick={handleBackClick}
            >
                <div className="gp-quiz-container">
                    <div className="gp-results-message">
                        No analysis data found. Please take the quiz first.
                    </div>
                    <button className="gp-submit-button" onClick={handleBackClick}>
                        Go to Quiz
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    const { analysisResult } = state;

    return (
        <WorldPageLayout
            backgroundImage="/Law-world/general-provision.png"
            altText="General Provisions Correction"
            onBackClick={handleBackClick}
        >
            <div className="gp-correction-container" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                <h2 className="gp-results-title">Your Quiz Review</h2>

                <div className="gp-feedback-content">
                    <div className="gp-overall-summary" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <strong>Quick Overview:</strong> {analysisResult.overall_summary}
                    </div>

                    {analysisResult.per_question.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: '#d9534f', marginBottom: '10px' }}>
                                Question {item.question_index}: {item.question}
                            </h4>
                            <PersonalizedFeedback
                                isLoading={false}
                                explanation={item.explanation}
                                diagramCode={item.diagram_code || undefined}
                            />
                        </div>
                    ))}

                    <button className="gp-submit-button" onClick={handleBackClick}>
                        Back to Quiz
                    </button>
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default GeneralProvisionsCorrectionPage;
