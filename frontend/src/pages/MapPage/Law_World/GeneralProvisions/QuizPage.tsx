import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import type { QuizData, Question } from '../../../../types/quiz';
import type { UserPreferences } from '../../../../types/preferences';
import type { QuizAnalysisResponse } from '../../../../types/analysis';
import './GeneralProvisions.css';

function GeneralProvisionsQuizPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const restoredState = location.state as {
        restoreResults?: boolean;
        analysisResult?: QuizAnalysisResponse;
        score?: number;
    } | null;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [score, setScore] = useState(restoredState?.score ?? 0);
    const [showResults, setShowResults] = useState(restoredState?.restoreResults ?? false);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentVideoSrc, setCurrentVideoSrc] = useState('/Law-world/idle-gavel.webm?v=2');
    const [isVideoLooping, setIsVideoLooping] = useState(true);

    // New state for batching
    const [userAnswers, setUserAnswers] = useState<Array<{
        question: string;
        answerOptions: Question['answerOptions'];
        answerCorrect: boolean
    }>>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<QuizAnalysisResponse | null>(restoredState?.analysisResult ?? null);

    const idleVideoRef = useRef<HTMLVideoElement>(null);

    // Toggle mute/unmute on user interaction (click/touch anywhere on page)
    useEffect(() => {
        const toggleMute = () => {
            if (idleVideoRef.current) {
                idleVideoRef.current.muted = !idleVideoRef.current.muted;
            }
        };

        document.addEventListener('click', toggleMute);

        return () => {
            document.removeEventListener('click', toggleMute);
        };
    }, []);

    useEffect(() => {
        if (idleVideoRef.current) {
            idleVideoRef.current.load();
            idleVideoRef.current.play().catch(() => { });
        }
    }, [currentVideoSrc]);

    // Load quiz data on mount
    useEffect(() => {
        const loadQuizData = async () => {
            try {
                const response = await fetch('/general-provisions-quiz.json');
                if (!response.ok) {
                    throw new Error('Failed to load quiz data');
                }
                const data: QuizData = await response.json();
                const questions = data.modules.flatMap(module => module.quiz);
                setAllQuestions(questions);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading quiz data:', error);
                setIsLoading(false);
            }
        };

        loadQuizData();

        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            try {
                setUserPreferences(JSON.parse(savedPrefs));
            } catch (e) {
                console.error("Failed to parse preferences", e);
            }
        }
    }, []);

    // Batch Analysis Effect
    useEffect(() => {
        if (showResults && userAnswers.length > 0) {
            const runAnalysis = async () => {
                const wrongAnswers = userAnswers.filter(a => !a.answerCorrect);
                if (wrongAnswers.length === 0) return;

                setIsAnalyzing(true);
                try {
                    const response = await fetch('http://127.0.0.1:8000/analyze-quiz', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            quiz: userAnswers.map(a => ({
                                question: a.question,
                                answerOptions: a.answerOptions,
                                user_answer: a.answerCorrect
                            })),
                            preferences: userPreferences
                        }),
                    });

                    if (response.ok) {
                        const data: QuizAnalysisResponse = await response.json();
                        setAnalysisResult(data);
                    }
                } catch (error) {
                    console.error("AI Analysis failed", error);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            runAnalysis();
        }
    }, [showResults, userAnswers, userPreferences]);

    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setIsSubmitted(true);
        setShowRationale(true); // Show rationale immediately without video

        if (currentQuestion) {
            const selectedOption = currentQuestion.answerOptions[selectedAnswer];
            const isCorrect = selectedOption?.isCorrect || false;

            if (isCorrect) {
                setScore(prev => prev + 1);
                setCurrentVideoSrc('/Law-world/correct-gavel.webm');
                setIsVideoLooping(false);
            } else {
                setCurrentVideoSrc('/Law-world/sad-gavel.webm');
                setIsVideoLooping(false);
            }

            // Record batch answer
            setUserAnswers(prev => [...prev, {
                question: currentQuestion.question,
                answerOptions: currentQuestion.answerOptions,
                answerCorrect: isCorrect
            }]);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setShowResults(true);
            const passingScore = allQuestions.length >= 10 ? 8 : 4;
            if (score >= passingScore) {
                setCurrentVideoSrc('/Law-world/correct-gavel.webm');
            } else {
                setCurrentVideoSrc('/Law-world/sad-gavel.webm');
            }
            setIsVideoLooping(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);

            setCurrentVideoSrc('/Law-world/idle-gavel.webm?v=2');
            setIsVideoLooping(true);
        }
    };

    const handleShowHint = () => {
        setShowHint(true);
    };

    const handleHideHint = () => {
        setShowHint(false);
    };

    const handleBackClick = () => {
        navigate(ROUTES.LAW_WORLD_GENERAL_PROVISIONS);
    };

    const handleResetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowHint(false);
        setShowRationale(false);
        setIsSubmitted(false);
        setScore(0);
        setShowResults(false);
        setUserAnswers([]); // Reset answers
        setAnalysisResult(null); // Reset analysis
        setCurrentVideoSrc('/Law-world/idle-gavel.webm?v=2');
        setIsVideoLooping(true);
    };

    const handleFinish = () => {
        navigate(ROUTES.LAW_WORLD_GENERAL_PROVISIONS);
    };

    const handleNextQuiz = () => {
        // Placeholder for next quiz navigation
        alert("Next module coming soon!");
    };

    const handleReviewClick = () => {
        navigate(ROUTES.LAW_WORLD_GENERAL_PROVISIONS_CORRECTION, {
            state: {
                analysisResult,
                score
            }
        });
    };

    if (isLoading || !currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/general-provision.png"
                altText="General Provisions Quiz"
                onBackClick={handleBackClick}
            >
                <div className="gp-quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    const selectedOption = selectedAnswer !== null ? currentQuestion.answerOptions[selectedAnswer] : null;
    const isCorrect = selectedOption?.isCorrect || false;

    const passingScore = allQuestions.length >= 10 ? 8 : 4;
    const hasPassed = score >= passingScore;

    return (
        <WorldPageLayout
            backgroundImage="/Law-world/general-provision.png"
            altText="General Provisions Quiz"
            onBackClick={handleBackClick}
        >
            {/* Idle Video Container - Next to Quiz */}
            <div className="gp-idle-video-container">
                <video
                    ref={idleVideoRef}
                    className="gp-idle-video"
                    autoPlay
                    muted
                    loop={isVideoLooping}
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    src={currentVideoSrc}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {showResults ? (
                <div className="gp-quiz-container gp-results-container">
                    {hasPassed && <Confetti width={window.innerWidth} height={window.innerHeight} />}
                    <h2 className="gp-results-title">
                        {hasPassed ? 'Congratulations!' : 'Quiz Failed'}
                    </h2>
                    <div className="gp-results-score">
                        Score: {score}/{allQuestions.length}
                    </div>
                    <p className="gp-results-message">
                        {hasPassed
                            ? 'You earned 3 tokens'
                            : 'You must repeat the quiz.'}
                    </p>

                    {/* AI Analysis Section */}
                    {isAnalyzing && (
                        <div className="gp-feedback-loading-container">
                            <div className="gp-loading-spinner"></div>
                            <p className="gp-loading-text">Analyzing your responses...</p>
                        </div>
                    )}

                    {!hasPassed && analysisResult && (
                        <div style={{ marginTop: '20px' }}>
                            <button
                                className="gp-submit-button"
                                style={{ background: '#2E7D6B', borderColor: '#1B4D3E' }}
                                onClick={handleReviewClick}
                            >
                                Review Feedback
                            </button>
                        </div>
                    )}

                    <div className="gp-results-actions">
                        {hasPassed ? (
                            <>
                                <button className="gp-submit-button" onClick={handleNextQuiz}>
                                    Next Quiz
                                </button>
                                <button className="gp-submit-button gp-finish-button" onClick={handleFinish}>
                                    Finish
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="gp-submit-button" onClick={handleResetQuiz}>
                                    Repeat Quiz
                                </button>
                                <button className="gp-submit-button gp-finish-button" onClick={handleFinish}>
                                    Finish
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="gp-quiz-container">
                    <div className="gp-quiz-header">
                        <div className="gp-question-counter">
                            Question {currentQuestionIndex + 1} of {allQuestions.length}
                        </div>
                    </div>

                    <div className="gp-question-section">
                        <h2 className="gp-question-text">{currentQuestion.question}</h2>
                    </div>

                    {showRationale && selectedOption && (
                        <div className={`gp-rationale-section ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="gp-rationale-header">
                                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                            </div>
                            <div className="gp-rationale-text">{selectedOption.rationale}</div>
                        </div>
                    )}

                    <div className="gp-answers-section">
                        {currentQuestion.answerOptions.map((option, index) => {
                            let buttonClass = 'gp-answer-option';
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
                                    disabled={selectedAnswer !== null || isSubmitted}
                                >
                                    {option.text}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '1.2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                        {!showHint && !isSubmitted && (
                            <button className="gp-hint-button" onClick={handleShowHint}>
                                💡 Show Hint
                            </button>
                        )}
                        {showHint && (
                            <div></div>
                        )}

                        {selectedAnswer !== null && !isSubmitted && (
                            <button className="gp-submit-button" onClick={handleSubmit}>
                                Submit Answer
                            </button>
                        )}
                        {selectedAnswer === null && (
                            <div></div>
                        )}
                    </div>

                    {showHint && !isSubmitted && (
                        <>
                            <div className="gp-hint-overlay" onClick={handleHideHint}></div>
                            <div className="gp-hint-section">
                                <div className="gp-hint-header">
                                    <strong>Hint:</strong>
                                    <button className="gp-hide-hint-button" onClick={handleHideHint}>
                                        ✕ Hide Hint
                                    </button>
                                </div>
                                <div className="gp-hint-content">{currentQuestion.hint}</div>
                            </div>
                        </>
                    )}

                    {showRationale && (
                        <button className="gp-next-button" onClick={handleNext}>
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                        </button>
                    )}
                </div>
            )}
        </WorldPageLayout>
    );
}

export default GeneralProvisionsQuizPage;
