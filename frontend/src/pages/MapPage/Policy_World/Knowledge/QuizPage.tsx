import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { assets } from '../../../../assets/assets';
import { ROUTES } from '../../../../config/routes';
import type { QuizData, Question } from '../../../../types/quiz';

import './page.css';





function KnowledgeQuizPage() {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);


    const [isSubmitted, setIsSubmitted] = useState(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentVideoSrc, setCurrentVideoSrc] = useState('/Law-world/idle-gavel.webm?v=2');
    const [isVideoLooping, setIsVideoLooping] = useState(true);



    const idleVideoRef = useRef<HTMLVideoElement>(null);

    // Toggle mute/unmute
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

    // Play video
    useEffect(() => {
        if (idleVideoRef.current) {
            idleVideoRef.current.load();
            idleVideoRef.current.play().catch(() => { });
        }
    }, [currentVideoSrc]);

    // Load quiz data
    useEffect(() => {
        const loadQuizData = async () => {
            try {
                const response = await fetch('/quiz.json');
                if (!response.ok) throw new Error('Failed to load quiz data');
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


    }, []);



    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null || isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = async () => {
        if (selectedAnswer === null) return;
        setIsSubmitted(true);
        setShowRationale(true);

        if (currentQuestion) {
            const selectedOption = currentQuestion.answerOptions[selectedAnswer];
            if (selectedOption?.isCorrect) {
                setScore(prev => prev + 1);
                setCurrentVideoSrc('/Law-world/correct-gavel.webm');
                setIsVideoLooping(false);
            } else {
                setCurrentVideoSrc('/Law-world/sad-gavel.webm');
                setIsVideoLooping(false);
            }
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
        navigate(ROUTES.POLICY_WORLD_KNOWLEDGE);
    };

    const handleResetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowHint(false);
        setShowRationale(false);
        setIsSubmitted(false);
        setScore(0);
        setShowResults(false);

        setCurrentVideoSrc('/Law-world/idle-gavel.webm?v=2');
        setIsVideoLooping(true);
    };

    const handleFinish = () => {
        navigate(ROUTES.POLICY_WORLD_KNOWLEDGE);
    };

    const handleNextQuiz = () => {
        // Placeholder for next quiz navigation
        alert("Next module coming soon!");
    };

    if (isLoading || !currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage={assets.diversity}
                altText="Knowledge Quiz"
                onBackClick={handleBackClick}
            >
                <div className="quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    const selectedOption = selectedAnswer !== null ? currentQuestion.answerOptions[selectedAnswer] : null;
    const isCorrect = selectedOption?.isCorrect || false;
    const passingScore = allQuestions.length >= 10 ? 8 : 4;
    const hasPassed = score >= passingScore;

    return (
        <WorldPageLayout
            backgroundImage={assets.diversity}
            altText="Knowledge Quiz"
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
                <div className="quiz-container results-container">
                    {hasPassed && <Confetti width={window.innerWidth} height={window.innerHeight} />}
                    <h2 className="results-title">
                        {hasPassed ? 'Congratulations!' : 'Quiz Failed'}
                    </h2>
                    <div className="results-score">
                        Score: {score}/{allQuestions.length}
                    </div>
                    <p className="results-message">
                        {hasPassed ? 'You earned 3 tokens' : 'You must repeat the quiz.'}
                    </p>



                    <div className="results-actions">
                        {hasPassed ? (
                            <>
                                <button className="submit-button" onClick={handleNextQuiz}>Next Quiz</button>
                                <button className="submit-button finish-button" onClick={handleFinish}>Finish</button>
                            </>
                        ) : (
                            <>
                                <button className="submit-button" onClick={handleResetQuiz}>Repeat Quiz</button>
                                <button className="submit-button finish-button" onClick={handleFinish}>Finish</button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="quiz-container">
                    <div className="quiz-header">
                        <div className="question-counter">
                            Question {currentQuestionIndex + 1} of {allQuestions.length}
                        </div>
                    </div>

                    <div className="question-section">
                        <h2 className="question-text">{currentQuestion.question}</h2>
                    </div>

                    {showRationale && selectedOption && (
                        <div className={`rationale-section ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="rationale-header">
                                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                            </div>
                            <div className="rationale-text">{selectedOption.rationale}</div>
                        </div>
                    )}

                    {/* Personalized AI Feedback - Removed from here as it's now batched in results */}

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
                                    disabled={selectedAnswer !== null || isSubmitted}
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
                                    <button className="hide-hint-button" onClick={handleHideHint}>✕ Hide Hint</button>
                                </div>
                                <div className="hint-content">{currentQuestion.hint}</div>
                            </div>
                        </>
                    )}

                    {showRationale && (
                        <button className="next-button" onClick={handleNext}>
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                        </button>
                    )}
                </div>
            )}
        </WorldPageLayout>
    );
}

export default KnowledgeQuizPage;
