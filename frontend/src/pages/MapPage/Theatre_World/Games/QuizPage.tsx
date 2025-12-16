import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { useQuizCompletion } from '../../../../contexts/QuizCompletionContext';
import type { Question } from '../../../../types/quiz';
import easyQuizData from './quiz_easy.json';
import mediumQuizData from './quiz_medium.json';
import hardQuizData from './quiz_hard.json';
import '../../Law_World/Criminalization/page.css';
import './QuizPage.css';

function GamesQuizPage() {
    const navigate = useNavigate();
    const { difficulty } = useParams<{ difficulty: 'easy' | 'medium' | 'hard' }>();
    const { markCompleted } = useQuizCompletion();
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [quizStarted, setQuizStarted] = useState(false);

    useEffect(() => {
        if (!difficulty) {
            navigate(ROUTES.THEATRE_WORLD_GAMES);
            return;
        }

        const loadQuizData = () => {
            try {
                let quizData: any;
                switch (difficulty) {
                    case 'easy':
                        quizData = easyQuizData;
                        break;
                    case 'medium':
                        quizData = mediumQuizData;
                        break;
                    case 'hard':
                        quizData = hardQuizData;
                        break;
                    default:
                        navigate(ROUTES.THEATRE_WORLD_GAMES);
                        return;
                }

                const data = quizData as { quiz?: Question[]; modules?: any[] };
                let questions: Question[] = [];
                
                if (data.modules && Array.isArray(data.modules)) {
                    questions = data.modules.flatMap((module: any) => module.quiz || []);
                } else if (data.quiz && Array.isArray(data.quiz)) {
                    questions = data.quiz;
                }
                
                if (questions.length === 0) {
                    console.error('No questions found in quiz data');
                    return;
                }
                
                setAllQuestions(questions);
                setQuizStarted(true);
            } catch (error) {
                console.error('Error loading quiz data:', error);
            }
        };

        loadQuizData();
    }, [difficulty, navigate]);

    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    const handleAnswerSelect = (index: number) => {
        if (isSubmitted) return; // Only prevent selection after submission
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;
        setIsSubmitted(true);
        setShowRationale(true);
    };

    const handleNext = () => {
        if (isLastQuestion) {
            // Mark as completed
            if (difficulty) {
                markCompleted('games', difficulty);
            }
            // Navigate back to Games selection page
            navigate(ROUTES.THEATRE_WORLD_GAMES);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
        }
    };

    const handleShowHint = () => setShowHint(true);
    const handleHideHint = () => setShowHint(false);

    const handleShowRationale = () => setShowRationale(true);
    const handleHideRationale = () => setShowRationale(false);

    // Explicit back navigation: Games Quiz → Games selection
    const handleBackClick = () => {
        navigate(ROUTES.THEATRE_WORLD_GAMES);
    };

    if (!quizStarted || !currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage="/Theatre/Games/Games_Background.png"
                altText="Games Quiz"
                onBackClick={handleBackClick}
            >
                <div className="quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    const selectedOption = selectedAnswer !== null ? currentQuestion.answerOptions[selectedAnswer] : null;
    const isCorrect = selectedOption?.isCorrect || false;

    return (
        <WorldPageLayout
            backgroundImage="/Theatre/Games/Games_Background.png"
            altText="Games Quiz"
            onBackClick={handleBackClick}
        >
            {/* Character placeholder container - positioned like Law World but empty for now */}
            <div className="tw-character-container">
                {/* Character video will be integrated here later */}
            </div>

            <div className="cr-quiz-container">
                <div className="quiz-header">
                    <div className="question-counter">
                        Question {currentQuestionIndex + 1} of {allQuestions.length} - {difficulty?.toUpperCase()}
                    </div>
                </div>

                <div className="question-section">
                    <h2 className="question-text">{currentQuestion.question}</h2>
                </div>

                <div className="answers-section">
                    {currentQuestion.answerOptions.map((option, index) => {
                        let buttonClass = 'answer-option';
                        if (selectedAnswer === index && !showRationale) {
                            buttonClass += ' selected';
                        } else if (showRationale) {
                            if (selectedAnswer === index) {
                                buttonClass += option.isCorrect ? ' correct' : ' incorrect';
                            } else if (option.isCorrect) {
                                buttonClass += ' show-correct';
                            }
                        }

                        return (
                            <button
                                key={index}
                                className={buttonClass}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={isSubmitted}
                            >
                                {option.text}
                            </button>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '1.2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    {!showHint && !isSubmitted && (
                        <button className="hint-button" onClick={handleShowHint}>
                            💡 Show Hint
                        </button>
                    )}
                    {showHint && <div></div>}

                    {selectedAnswer !== null && !isSubmitted && (
                        <button className="submit-button" onClick={handleSubmit}>
                            Submit Answer
                        </button>
                    )}
                    {selectedAnswer === null && <div></div>}
                </div>

                {showHint && !isSubmitted && (
                    <>
                        <div className="hint-overlay" onClick={handleHideHint}></div>
                        <div className="hint-section">
                            <div className="hint-header">
                                <strong>Hint:</strong>
                                <button className="hide-hint-button" onClick={handleHideHint}>
                                    ✕ Hide Hint
                                </button>
                            </div>
                            <div className="hint-content">{currentQuestion.hint}</div>
                        </div>
                    </>
                )}

                {showRationale && selectedOption && (
                    <>
                        <div className="rationale-overlay" onClick={handleHideRationale}></div>
                        <div className={`rationale-popup ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="rationale-header">
                                <span className={`rationale-title ${isCorrect ? 'correct' : 'incorrect'}`}>
                                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                </span>
                                <button className="close-rationale-button" onClick={handleHideRationale}>
                                    ✕ Close
                                </button>
                            </div>
                            <div className="rationale-text">{selectedOption.rationale}</div>
                        </div>
                    </>
                )}

                {isSubmitted && (
                    <div className="post-submit-actions">
                        {!showRationale && (
                            <button className="hint-button" onClick={handleShowRationale}>
                                Show Explanation 💡
                            </button>
                        )}
                        <button className="submit-button" onClick={handleNext}>
                            {isLastQuestion ? 'Finish Level' : 'Next Question →'}
                        </button>
                    </div>
                )}
            </div>
        </WorldPageLayout>
    );
}

export default GamesQuizPage;

