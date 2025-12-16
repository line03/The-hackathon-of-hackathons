import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../../config/routes';
import { assets } from '../../../../../assets/assets';
import type { Question } from '../../../../../types/quiz';
import type { QuizAnalysisResponse } from '../../../../../types/analysis';
import type { UserPreferences } from '../../../../../types/preferences';
import quizData from '../quiz_module4.json';
import '../page.css';
import '../../../Law_World/Criminalization/page.css';

type Phase = 'video' | 'quiz';
type CharacterState = 'idle' | 'happy' | 'sad';

const CHARACTER_VIDEOS: Record<CharacterState, string> = {
    idle: '/Policy-world/Character/idle-policy.webm',
    happy: '/Policy-world/Character/correct-policy.webm',
    sad: '/Policy-world/Character/sad-mic.webm',
};

const MODULE_VIDEO = '/Policy-world/Videos/Module_4.mp4';

function Module4Page() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Phase management
    const [phase, setPhase] = useState<Phase>('video');
    const [videoEnded, setVideoEnded] = useState(false);

    // Quiz state
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [characterState, setCharacterState] = useState<CharacterState>('idle');

    // AI analysis state
    const [userAnswers, setUserAnswers] = useState<
        Array<{
            question: string;
            answerOptions: Question['answerOptions'];
            answerCorrect: boolean;
        }>
    >([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [shouldAnalyze, setShouldAnalyze] = useState(false);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

    // Load quiz data
    useEffect(() => {
        const data = quizData as { quiz?: Question[] };
        if (data.quiz && Array.isArray(data.quiz)) {
            setAllQuestions(data.quiz);
        }
    }, []);

    // Load user preferences
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

    const handleBackClick = () => {
        navigate(ROUTES.POLICY_WORLD_ACADEMIA);
    };

    const handleVideoEnd = () => {
        setVideoEnded(true);
    };

    const handleStartQuiz = () => {
        setPhase('quiz');
    };

    const handleSkipVideo = () => {
        setPhase('quiz');
    };

    // Quiz handlers
    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

    const handleAnswerSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleQuizSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;

        const selectedOption = currentQuestion.answerOptions[selectedAnswer];
        const isCorrect = selectedOption?.isCorrect || false;

        if (isCorrect) {
            setScore((prev) => prev + 1);
        }

        setUserAnswers((prev) => [
            ...prev,
            {
                question: currentQuestion.question,
                answerOptions: currentQuestion.answerOptions,
                answerCorrect: isCorrect,
            },
        ]);

        setCharacterState(isCorrect ? 'happy' : 'sad');
        setIsSubmitted(true);
        setShowRationale(true);
    };

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            setShouldAnalyze(true);
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
            setCharacterState('idle');
        }
    };

    // Run AI analysis when quiz is finished
    useEffect(() => {
        if (!shouldAnalyze || userAnswers.length === 0) return;

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
                    navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_4_CORRECTION, {
                        state: {
                            analysisResult: data,
                            score,
                            moduleId: 4,
                            questions: allQuestions,
                        },
                    });
                    return;
                }
            } catch (error) {
                console.error('AI Analysis failed', error);
            } finally {
                setIsAnalyzing(false);
                setShouldAnalyze(false);
            }

            // Fallback
            const fallback: QuizAnalysisResponse = {
                overall_summary:
                    'AI feedback is unavailable. Review the explanations for each question below.',
                per_question: userAnswers.map((a, idx) => {
                    const correctOption = a.answerOptions.find((opt) => opt.isCorrect);
                    return {
                        question_index: idx + 1,
                        question: a.question,
                        correct_answer: correctOption?.text || '',
                        explanation: correctOption?.rationale || '',
                        filename: '',
                    };
                }),
            };

            navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_4_CORRECTION, {
                state: {
                    analysisResult: fallback,
                    score,
                    moduleId: 4,
                    questions: allQuestions,
                },
            });
        };

        runAnalysis();
    }, [shouldAnalyze, userAnswers, userPreferences, navigate, score, allQuestions]);

    // Render Video Phase
    if (phase === 'video') {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 4 - Public Sector Corruption"
                onBackClick={handleBackClick}
            >
                <div className="academia-video-wrapper">
                    <video
                        ref={videoRef}
                        className="academia-video"
                        autoPlay
                        controls
                        onEnded={handleVideoEnd}
                        src={MODULE_VIDEO}
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className="academia-video-controls">
                        <button className="academia-skip-btn" onClick={handleSkipVideo}>
                            Skip Video
                        </button>
                        {videoEnded && (
                            <button className="academia-continue-btn" onClick={handleStartQuiz}>
                                Start Quiz →
                            </button>
                        )}
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Render Quiz Phase
    if (isAnalyzing) {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 4 Quiz"
                onBackClick={handleBackClick}
            >
                <div className="cr-quiz-content">
                    <div className="cr-analyzing-container">
                        <div className="cr-analyzing-spinner" />
                        <p className="cr-analyzing-text">Analyzing your answers...</p>
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    if (!currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 4 Quiz"
                onBackClick={handleBackClick}
            >
                <div className="cr-quiz-content">
                    <p>Loading quiz...</p>
                </div>
            </WorldPageLayout>
        );
    }

    return (
        <WorldPageLayout
            backgroundImage={assets.innerPolicy}
            altText="Module 4 Quiz"
            onBackClick={handleBackClick}
        >
            {/* Character */}
            <div className="cr-character-container quiz-mode">
                <video
                    key={characterState}
                    className="cr-character-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={CHARACTER_VIDEOS[characterState]}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Quiz Content */}
            <div className="cr-quiz-content">
                <div className="cr-quiz-header">
                    <span className="cr-quiz-progress">
                        Question {currentQuestionIndex + 1} of {allQuestions.length}
                    </span>
                    <span className="cr-quiz-score">Score: {score}</span>
                </div>

                <div className="cr-question-container">
                    <h3 className="cr-question-text">{currentQuestion.question}</h3>

                    <div className="cr-answers-container">
                        {currentQuestion.answerOptions.map((option, index) => {
                            let optionClass = 'cr-answer-option';
                            if (isSubmitted) {
                                if (option.isCorrect) {
                                    optionClass += ' correct';
                                } else if (index === selectedAnswer && !option.isCorrect) {
                                    optionClass += ' incorrect';
                                }
                            } else if (index === selectedAnswer) {
                                optionClass += ' selected';
                            }

                            return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={isSubmitted}
                                >
                                    <span className="cr-answer-letter">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="cr-answer-text">{option.text}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Hint */}
                    {currentQuestion.hint && !isSubmitted && (
                        <div className="cr-hint-section">
                            {showHint ? (
                                <div className="cr-hint-content">
                                    <p>{currentQuestion.hint}</p>
                                    <button className="cr-hint-toggle" onClick={() => setShowHint(false)}>
                                        Hide Hint
                                    </button>
                                </div>
                            ) : (
                                <button className="cr-hint-toggle" onClick={() => setShowHint(true)}>
                                    💡 Show Hint
                                </button>
                            )}
                        </div>
                    )}

                    {/* Rationale after submission */}
                    {isSubmitted && showRationale && (
                        <div className="cr-rationale-section">
                            <h4>Explanation:</h4>
                            <p>
                                {currentQuestion.answerOptions.find((opt) => opt.isCorrect)?.rationale}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="cr-quiz-actions">
                        {!isSubmitted ? (
                            <button
                                className="cr-submit-btn"
                                onClick={handleQuizSubmit}
                                disabled={selectedAnswer === null}
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <button className="cr-next-btn" onClick={handleNextQuestion}>
                                {isLastQuestion ? 'Finish Quiz' : 'Next Question →'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default Module4Page;

