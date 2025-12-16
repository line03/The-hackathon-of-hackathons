import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { useQuizCompletion } from '../../../../contexts/QuizCompletionContext';
import type { Question } from '../../../../types/quiz';
import type { QuizAnalysisResponse } from '../../../../types/analysis';
import type { UserPreferences } from '../../../../types/preferences';
import { ROUTES } from '../../../../config/routes';
import easyQuizData from './quiz_easy_criminallization.json';
import mediumQuizData from './quiz_medium_criminallization.json';
import hardQuizData from './quiz_hard_criminallization.json';
import './page.css';

type Difficulty = 'easy' | 'medium' | 'hard';

type Mode = 'select' | 'quiz';

type Phase = 'video' | 'question';

type CharacterState = 'idle' | 'happy' | 'sad';

// Map character state to video file
const CHARACTER_VIDEOS: Record<CharacterState, string> = {
    idle: '/Law-world/Character/idle-gavel.webm',
    happy: '/Law-world/Character/correct-gavel.webm',
    sad: '/Law-world/Character/sad-gavel.webm',
};

function CriminalizationPage() {
    const navigate = useNavigate();
    const { isCompleted, markCompleted } = useQuizCompletion();

    // Explicit back navigation: Criminalization → Law World
    const handleBackClick = () => {
        navigate(ROUTES.LAW_WORLD);
    };

    const [mode, setMode] = useState<Mode>('select');
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [score, setScore] = useState(0);

    // Phase state: 'video' or 'question'
    const [phase, setPhase] = useState<Phase>('video');

    // Track if video check is in progress
    const [videoCheckDone, setVideoCheckDone] = useState(false);

    // Character animation state
    const [characterState, setCharacterState] = useState<CharacterState>('idle');

    // Popup state
    const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);

    // Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const levels: Difficulty[] = ['easy', 'medium', 'hard'];

    // AI analysis state
    const [userAnswers, setUserAnswers] = useState<
        Array<{
            question: string;
            answerOptions: Question['answerOptions'];
            answerCorrect: boolean;
        }>
    >([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<QuizAnalysisResponse | null>(null);
    const [shouldAnalyze, setShouldAnalyze] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

    // Derived completion status
    const easyCompleted = isCompleted('criminalization', 'easy');
    const mediumCompleted = isCompleted('criminalization', 'medium');
    const hardCompleted = isCompleted('criminalization', 'hard');
    const canAccessMedium = easyCompleted;
    const canAccessHard = mediumCompleted;

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

    // Load quiz data when entering quiz mode
    useEffect(() => {
        if (mode !== 'quiz' || !difficulty) return;

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
            }

            const data = quizData as { quiz?: Question[]; modules?: any[] };
            let questions: Question[] = [];

            if (data.modules && Array.isArray(data.modules)) {
                questions = data.modules.flatMap((module: any) => module.quiz || []);
            } else if (data.quiz && Array.isArray(data.quiz)) {
                questions = data.quiz;
            }

            console.log('Loaded questions:', questions.length, questions);

            setAllQuestions(questions);
            setScore(0);
            setUserAnswers([]);
            setAnalysisResult(null);
            setShouldAnalyze(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
            setCharacterState('idle');
            setVideoCheckDone(false);
            
            // For easy level, start with video phase; for others, go straight to question
            if (difficulty === 'easy') {
                setPhase('video');
            } else {
                setPhase('question');
            }
        } catch (error) {
            console.error('Error loading criminalization quiz:', error);
        }
    }, [mode, difficulty]);

    // Load user preferences from localStorage for AI analysis
    useEffect(() => {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            try {
                setUserPreferences(JSON.parse(savedPrefs));
            } catch (e) {
                console.error('Failed to parse preferences', e);
            }
        }
    }, []);

    // Check if video exists for current question (Easy level only)
    useEffect(() => {
        if (mode !== 'quiz' || difficulty !== 'easy' || phase !== 'video' || videoCheckDone) return;

        const videoUrl = `/Law-world/VideoEasy/criminalization_easy_${currentQuestionIndex + 1}.mp4`;
        
        // Use fetch to check if video exists
        fetch(videoUrl, { method: 'HEAD' })
            .then((response) => {
                setVideoCheckDone(true);
                if (!response.ok) {
                    // Video doesn't exist, skip to question
                    console.log(`Video ${videoUrl} not found, skipping to question`);
                    setPhase('question');
                }
            })
            .catch(() => {
                // Error checking video, skip to question
                setVideoCheckDone(true);
                console.log(`Error checking video ${videoUrl}, skipping to question`);
                setPhase('question');
            });
    }, [mode, difficulty, phase, currentQuestionIndex, videoCheckDone]);

    const handleDifficultyClick = (level: Difficulty) => {
        setDifficulty(level);
        if (level === 'easy') {
            setShowInstructionsPopup(true);
        } else {
            setMode('quiz');
        }
    };

    const handleStartEasyLevel = () => {
        setShowInstructionsPopup(false);
        setMode('quiz');
        setPhase('video');
        setVideoCheckDone(false);
    };

    const handleClosePopup = () => {
        setShowInstructionsPopup(false);
        setDifficulty(null);
    };

    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    const handleAnswerSelect = (index: number) => {
        if (isSubmitted) return; // Only prevent selection after submission
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;
        
        // Determine if answer is correct
        const selectedOption = currentQuestion.answerOptions[selectedAnswer];
        const isCorrect = selectedOption?.isCorrect || false;

        if (isCorrect) {
            setScore((prev) => prev + 1);
        }

        // Record answer for AI analysis
        setUserAnswers((prev) => [
            ...prev,
            {
                question: currentQuestion.question,
                answerOptions: currentQuestion.answerOptions,
                answerCorrect: isCorrect,
            },
        ]);
        
        // Update character state based on answer
        setCharacterState(isCorrect ? 'happy' : 'sad');
        
        setIsSubmitted(true);
        setShowRationale(true);
    };

    const handleResetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowHint(false);
        setShowRationale(false);
        setIsSubmitted(false);
        setScore(0);
        setShowResults(false);
        setUserAnswers([]);
        setAnalysisResult(null);
        setShouldAnalyze(false);
        setIsAnalyzing(false);
        setCharacterState('idle');
        setVideoCheckDone(false);
        if (difficulty === 'easy') {
            setPhase('video');
        } else {
            setPhase('question');
        }
    };

    const handleFinish = () => {
        navigate(ROUTES.LAW_WORLD_CRIMINALIZATION);
    };

    const handleReviewClick = () => {
        if (!analysisResult || !difficulty) return;
        navigate(ROUTES.LAW_WORLD_CRIMINALIZATION_CORRECTION, {
            state: {
                analysisResult,
                score,
                difficulty,
                questions: allQuestions,
            },
        });
    };

    const handleNextQuestion = () => {
        if (!difficulty) return;

        if (isLastQuestion) {
            markCompleted('criminalization', difficulty);
            setShowResults(true);
            setShouldAnalyze(true);
        } else {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
            setCharacterState('idle');
            setVideoCheckDone(false); // Reset so video check runs for next question
            
            // For easy level, try to show video before each question (will check if exists)
            if (difficulty === 'easy') {
                setPhase('video');
            } else {
                setPhase('question');
            }
        }
    };

    // Handle video error (video doesn't exist) - skip to question
    const handleVideoError = () => {
        setPhase('question');
    };

    // Handle continuing from video to question
    const handleContinueFromVideo = () => {
        setPhase('question');
    };

    const handleShowHint = () => setShowHint(true);
    const handleHideHint = () => setShowHint(false);

    const handleShowRationale = () => setShowRationale(true);
    const handleHideRationale = () => setShowRationale(false);

    // Get the video URL for the current question (Easy level only)
    const getVideoUrl = () => {
        return `/Law-world/VideoEasy/criminalization_easy_${currentQuestionIndex + 1}.mp4`;
    };

    // Run AI analysis when quiz is finished
    useEffect(() => {
        if (!shouldAnalyze || userAnswers.length === 0 || !difficulty) return;

        const runAnalysis = async () => {
            setIsAnalyzing(true);
            try {
                const response = await fetch('http://127.0.0.1:8000/analyze-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quiz: userAnswers.map((a) => ({
                            question: a.question,
                            answerOptions: a.answerOptions,
                            user_answer: a.answerCorrect,
                        })),
                        preferences: userPreferences,
                    }),
                });

                if (response.ok) {
                    const data: QuizAnalysisResponse = await response.json();
                    setAnalysisResult(data);
                    // Navigate to correction page after analysis completes
                    navigate(ROUTES.LAW_WORLD_CRIMINALIZATION_CORRECTION, {
                        state: {
                            analysisResult: data,
                            score,
                            difficulty,
                            questions: allQuestions,
                        },
                    });
                    return;
                }
            } catch (error) {
                console.error('AI Analysis failed', error);
                // Fallback: create static explanations if AI is unavailable
                const fallback: QuizAnalysisResponse = {
                    overall_summary:
                        'We could not generate AI feedback right now, so here are the key explanations based on the correct offences for each scenario.',
                    per_question: userAnswers.map((a, idx) => {
                        const correctOption = a.answerOptions.find((opt) => opt.isCorrect);
                        return {
                            question_index: idx + 1,
                            question: a.question,
                            correct_answer: correctOption?.text || '',
                            explanation: correctOption?.rationale || '',
                            filename: '',
                            diagram_code: null,
                        };
                    }),
                };
                setAnalysisResult(fallback);
                // Navigate to correction page with fallback data
                navigate(ROUTES.LAW_WORLD_CRIMINALIZATION_CORRECTION, {
                    state: {
                        analysisResult: fallback,
                        score,
                        difficulty,
                        questions: allQuestions,
                    },
                });
                return;
            } finally {
                setIsAnalyzing(false);
                setShouldAnalyze(false);
            }
        };

        runAnalysis();
    }, [shouldAnalyze, userAnswers, difficulty, userPreferences, navigate, score, allQuestions]);

    if (mode === 'select') {
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/modules_background.png"
                altText="Criminalization and Law Enforcement Modules"
                onBackClick={handleBackClick}
            >
                {/* Character Video - Absolute positioned like GP, with entrance animation */}
                <div className="cr-character-container selection-mode">
                    <video
                        className="cr-character-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        disablePictureInPicture
                        controlsList="nodownload nofullscreen noremoteplayback"
                        src={CHARACTER_VIDEOS.idle}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="difficulty-selection-container">
                    <h2 className="difficulty-selection-title">Criminalization &amp; Law Enforcement</h2>
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
                                    {currentLevel === 'easy' && 'Scenario-based warm-up'}
                                    {currentLevel === 'medium' && (canAccessMedium ? 'Go deeper into UNCAC offences' : 'Complete Easy first to unlock')}
                                    {currentLevel === 'hard' && (canAccessHard ? 'Expert-level challenges' : 'Complete Medium first to unlock')}
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

                {/* Instructions Popup */}
                {showInstructionsPopup && (
                    <>
                        <div className="popup-overlay" onClick={handleClosePopup} />
                        <div className="instructions-popup">
                            <button className="popup-close-btn" onClick={handleClosePopup}>
                                ✕
                            </button>
                            <h2 className="popup-title">How this level works</h2>
                            <p className="popup-description">
                                In the Easy level, you will see short, scenario-based questions about criminalization under
                                the UNCAC. Read each situation carefully and choose the offence that best matches it. After
                                you answer, you will see an explanation before moving on.
                            </p>
                            <button className="popup-start-btn" onClick={handleStartEasyLevel}>
                                Start Easy Level
                            </button>
                        </div>
                    </>
                )}
            </WorldPageLayout>
        );
    }

    // Quiz mode - Loading state
    if (!difficulty || allQuestions.length === 0) {
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/modules_background.png"
                altText="Criminalization and Law Enforcement Quiz"
                onBackClick={handleBackClick}
            >
                <div className="quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    // Results state after finishing the level - show results with character and score like General Provisions
    if (showResults) {
        const passingScore = allQuestions.length >= 10 ? 8 : 4;
        const hasPassed = score >= passingScore;
        const resultsCharacterState = hasPassed ? 'happy' : 'sad';
        
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/modules_background.png"
                altText="Criminalization and Law Enforcement Quiz"
                onBackClick={handleBackClick}
            >
                {hasPassed && <Confetti width={window.innerWidth} height={window.innerHeight} />}
                {/* Character Video - Shows happy or sad based on passing score */}
                <div className="cr-character-container">
                    <video
                        className="cr-character-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        disablePictureInPicture
                        controlsList="nodownload nofullscreen noremoteplayback"
                        src={CHARACTER_VIDEOS[resultsCharacterState]}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="cr-quiz-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <h2 className="difficulty-selection-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#5C3D1E', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '2px' }}>
                        {hasPassed ? 'Congratulations!' : 'Quiz Failed'}
                    </h2>
                    <div className="cr-results-score" style={{ fontSize: '4rem', fontWeight: 900, color: '#2E7D6B', marginBottom: '1rem', textShadow: '2px 2px 0px #fff', WebkitTextStroke: '1px #000' }}>
                        Score: {score}/{allQuestions.length}
                    </div>
                    <p className="difficulty-selection-description" style={{ fontSize: '1.5rem', color: '#333', marginBottom: '2rem', fontWeight: 600 }}>
                        {hasPassed
                            ? 'You earned 3 tokens'
                            : 'You must repeat the quiz.'}
                    </p>
                    
                    {/* Loading indicator for analysis */}
                    {isAnalyzing && (
                        <div className="cr-feedback-loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '2px solid #5C3D1E' }}>
                            <div className="cr-loading-spinner" style={{ border: '5px solid #f3f3f3', borderTop: '5px solid #5C3D1E', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                            <p className="cr-loading-text" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5C3D1E', animation: 'pulse 1.5s ease-in-out infinite' }}>Analyzing your responses...</p>
                        </div>
                    )}

                    {/* Review Feedback button - shown when failed and analysis complete */}
                    {!hasPassed && analysisResult && !isAnalyzing && (
                        <div style={{ marginTop: '20px' }}>
                            <button
                                className="submit-button"
                                style={{ background: '#2E7D6B', borderColor: '#1B4D3E', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                                onClick={handleReviewClick}
                            >
                                Review Feedback
                            </button>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="cr-results-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%', marginTop: '2rem' }}>
                        {hasPassed ? (
                            <>
                                <button className="submit-button" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }} onClick={handleFinish}>
                                    Finish
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="submit-button" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }} onClick={handleResetQuiz}>
                                    Repeat Quiz
                                </button>
                                <button className="submit-button" style={{ background: '#FF5722', borderColor: '#E64A19', padding: '0.75rem 1.5rem', fontSize: '1rem' }} onClick={handleFinish}>
                                    Finish
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Video phase (Easy level only)
    if (difficulty === 'easy' && phase === 'video') {
        // Still checking if video exists
        if (!videoCheckDone) {
            return (
                <WorldPageLayout
                    backgroundImage="/Law-world/modules_background.png"
                    altText="Criminalization Easy Video"
                    onBackClick={handleBackClick}
                >
                    <div className="quiz-loading">Loading...</div>
                </WorldPageLayout>
            );
        }

        // Video exists, show it
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/modules_background.png"
                altText="Criminalization Easy Video"
                onBackClick={handleBackClick}
            >
                <div className="video-wrapper">
                    <video
                        className="intro-video"
                        controls
                        playsInline
                        src={getVideoUrl()}
                        onError={handleVideoError}
                    />
                    <button
                        className="continue-button-overlay"
                        onClick={handleContinueFromVideo}
                    >
                        Continue to Question
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    // Question phase - ensure we have a valid question
    if (!currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage="/Law-world/modules_background.png"
                altText="Criminalization and Law Enforcement Quiz"
                onBackClick={handleBackClick}
            >
                <div className="quiz-loading">Loading question...</div>
            </WorldPageLayout>
        );
    }

    const selectedOption = selectedAnswer !== null ? currentQuestion.answerOptions[selectedAnswer] : null;
    const isCorrect = selectedOption?.isCorrect || false;

    return (
        <WorldPageLayout
            backgroundImage="/Law-world/modules_background.png"
            altText="Criminalization and Law Enforcement Quiz"
            onBackClick={handleBackClick}
        >
            {/* Character Video - Updates based on answer state */}
            <div className="cr-character-container">
                <video
                    key={characterState} // Force re-render when state changes
                    className="cr-character-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    src={CHARACTER_VIDEOS[characterState]}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

                <div className="cr-quiz-container">
                <div className="quiz-header">
                    <div className="question-counter">
                        Question {currentQuestionIndex + 1} of {allQuestions.length} - {difficulty.toUpperCase()}
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
                        <button className="submit-button" onClick={handleNextQuestion}>
                            {isLastQuestion ? 'Finish Level' : 'Next Question →'}
                        </button>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="quiz-loading" style={{ marginTop: '1.5rem' }}>
                        Analyzing your responses...
                    </div>
                )}
            </div>
        </WorldPageLayout>
    );
}

export default CriminalizationPage;
