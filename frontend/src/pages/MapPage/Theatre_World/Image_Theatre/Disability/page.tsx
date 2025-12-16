import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../../config/routes';
import { useQuizCompletion } from '../../../../../contexts/QuizCompletionContext';
import type { Question } from '../../../../../types/quiz';
import type { QuizAnalysisResponse } from '../../../../../types/analysis';
import type { UserPreferences } from '../../../../../types/preferences';
import quizData from './quiz.json';
import '../../../Law_World/Criminalization/page.css';
import './page.css';

type CharacterState = 'idle' | 'happy' | 'sad';

const CHARACTER_VIDEOS: Record<CharacterState, string> = {
    idle: '/Theatre/Character/idle-theatre.webm',
    happy: '/Theatre/Character/correct-theatre.webm',
    sad: '/Theatre/Character/sad-theatre.webm',
};

interface DisabilityUserAnswer {
    question: string;
    answerOptions: Question['answerOptions'];
    answerCorrect: boolean;
}

function DisabilityPage() {
    const navigate = useNavigate();
    const { isCompleted } = useQuizCompletion();
    const mainQuizCompleted = isCompleted('image-theatre-main');
    const [step, setStep] = useState<'description' | 'intro' | 'image1' | 'question' | 'image2' | 'quiz' | 'locked'>(mainQuizCompleted ? 'intro' : 'description');
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [quizIsSubmitted, setQuizIsSubmitted] = useState(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [score, setScore] = useState(0);

    // Character animation state
    const [characterState, setCharacterState] = useState<CharacterState>('idle');

    // AI analysis state
    const [userAnswers, setUserAnswers] = useState<DisabilityUserAnswer[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [, setAnalysisResult] = useState<QuizAnalysisResponse | null>(null);
    const [shouldAnalyze, setShouldAnalyze] = useState(false);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

    const handleContinue = () => {
        if (step === 'description') {
            setStep('image1');
        } else if (step === 'intro') {
            setStep('image1');
        } else if (step === 'image1') {
            // If main quiz is completed, go to image2; otherwise go to question
            if (mainQuizCompleted) {
                setStep('image2');
            } else {
                setStep('question');
            }
        }
    };

    const handleAnswerSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setIsSubmitted(true);
    };

    const handleNext = () => {
        setStep('image2');
    };

    const handleProceedToQuiz = () => {
        loadQuizData();
        setStep('quiz');
    };

    // Load user preferences from localStorage
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

    // If main quiz is completed, load quiz data directly
    useEffect(() => {
        if (mainQuizCompleted && step === 'quiz') {
            loadQuizData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainQuizCompleted, step]);

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
                    setAnalysisResult(data);

                    navigate(ROUTES.THEATRE_WORLD_DISABILITY_CORRECTION, {
                        state: {
                            analysisResult: data,
                            score,
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

            const fallback: QuizAnalysisResponse = {
                overall_summary: 'We could not generate AI feedback right now.',
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

            navigate(ROUTES.THEATRE_WORLD_DISABILITY_CORRECTION, {
                state: { analysisResult: fallback, score, questions: allQuestions },
            });
        };

        runAnalysis();
    }, [shouldAnalyze, userAnswers, userPreferences, navigate, score, allQuestions]);

    const loadQuizData = () => {
        try {
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
            setCurrentQuestionIndex(0);
            setQuizSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setQuizIsSubmitted(false);
            setCharacterState('idle');
            setUserAnswers([]);
            setScore(0);
            setAnalysisResult(null);
            setShouldAnalyze(false);
        } catch (error) {
            console.error('Error loading quiz data:', error);
        }
    };

    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = allQuestions.length > 0 && currentQuestionIndex === allQuestions.length - 1;

    const handleQuizAnswerSelect = (index: number) => {
        if (quizIsSubmitted) return;
        setQuizSelectedAnswer(index);
    };

    const handleQuizSubmit = () => {
        if (quizSelectedAnswer === null || !currentQuestion) return;

        const selectedOption = currentQuestion.answerOptions[quizSelectedAnswer];
        const isCorrect = selectedOption?.isCorrect || false;

        if (isCorrect) setScore((prev) => prev + 1);

        setUserAnswers((prev) => [
            ...prev,
            {
                question: currentQuestion.question,
                answerOptions: currentQuestion.answerOptions,
                answerCorrect: isCorrect,
            },
        ]);

        setCharacterState(isCorrect ? 'happy' : 'sad');
        setQuizIsSubmitted(true);
        setShowRationale(true);
    };

    const handleQuizNext = () => {
        if (isLastQuestion) {
            setShouldAnalyze(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setQuizSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setQuizIsSubmitted(false);
            setCharacterState('idle');
        }
    };

    const handleShowHint = () => setShowHint(true);
    const handleHideHint = () => setShowHint(false);
    const handleShowRationale = () => setShowRationale(true);
    const handleHideRationale = () => setShowRationale(false);

    const handleBackClick = () => navigate(ROUTES.THEATRE_WORLD);

    const answerOptions = [
        'the person in the back',
        'the person at the front desk',
        'the person with disability'
    ];

    // Locked step - main quiz not completed
    if (step === 'locked' || (!mainQuizCompleted && step === 'description')) {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png" altText="Disability Reflection" onBackClick={handleBackClick}>
                <div className="disability-container">
                    <div className="description-section">
                        <h2 className="description-title">Complete Main Quiz First</h2>
                        <p className="description-text">Please complete the main Image Theatre quiz before accessing this module.</p>
                        <button className="continue-button" onClick={() => navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE)}>Go to Main Quiz</button>
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Intro step - shown when main quiz is completed
    if (step === 'intro') {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png" altText="Disability Reflection" onBackClick={handleBackClick}>
                <div className="disability-container">
                    <div className="description-section">
                        <h2 className="description-title">Youth Led Talk</h2>
                        <p className="description-text">You will now view the youth led talk "INCLUSION AND LEADERSHIP OF YOUTH WITH DISABILITIES TO CONTRIBUTE TO THE ACHIEVEMENT OF SDG16" through the lens of image theatre.</p>
                        <button className="continue-button" onClick={handleContinue}>Continue</button>
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Description step
    if (step === 'description') {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png" altText="Disability Reflection" onBackClick={handleBackClick}>
                <div className="disability-container">
                    <div className="description-section">
                        <h2 className="description-title">Take a Moment to Reflect</h2>
                        <p className="description-text">You will now see a situation through Image Theatre. Take a moment to reflect on what you see.</p>
                        <button className="continue-button" onClick={handleContinue}>Continue</button>
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Image 1 step
    if (step === 'image1') {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Disability1.png" altText="Disability Image 1" onBackClick={handleBackClick}>
                <div className="continue-button-wrapper">
                    <button className="continue-button-overlay" onClick={handleContinue}>Continue</button>
                </div>
            </WorldPageLayout>
        );
    }

    // Question step
    if (step === 'question') {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Disability1.png" altText="Disability Question" onBackClick={handleBackClick}>
                <div className="disability-container">
                    <div className="question-section">
                        <h2 className="question-title">Who did you notice in the image?</h2>
                        
                        <div className="answers-section">
                            {answerOptions.map((option, index) => {
                                let buttonClass = 'answer-option';
                                if (selectedAnswer === index && !isSubmitted) {
                                    buttonClass += ' selected';
                                } else if (isSubmitted && selectedAnswer === index) {
                                    buttonClass += ' submitted';
                                }

                                return (
                                    <button key={index} className={buttonClass} onClick={() => handleAnswerSelect(index)} disabled={isSubmitted}>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedAnswer !== null && !isSubmitted && (
                            <button className="submit-button" onClick={handleSubmit}>Submit Answer</button>
                        )}

                        {isSubmitted && (
                            <button className="next-button" onClick={handleNext}>Continue</button>
                        )}
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Image 2 step
    if (step === 'image2') {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Disability2.png" altText="Disability Image 2" onBackClick={handleBackClick}>
                <div className="continue-button-wrapper">
                    <button className="finish-button-overlay" onClick={handleProceedToQuiz}>Proceed to Quiz</button>
                </div>
            </WorldPageLayout>
        );
    }

    // Analyzing state
    if (isAnalyzing) {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Disability2.png" altText="Disability Quiz" onBackClick={handleBackClick}>
                <div className="quiz-loading">Analyzing your responses...<br />This may take a few seconds.</div>
            </WorldPageLayout>
        );
    }

    // Quiz step
    if (step === 'quiz' && currentQuestion) {
        const selectedOption = quizSelectedAnswer !== null ? currentQuestion.answerOptions[quizSelectedAnswer] : null;
        const isCorrect = selectedOption?.isCorrect || false;

        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Disability2.png" altText="Disability Quiz" onBackClick={handleBackClick}>
                {/* Theatre Character */}
                <div className="it-character-container">
                    <video key={characterState} className="it-character-video" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback" src={CHARACTER_VIDEOS[characterState]}>
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="cr-quiz-container">
                    <div className="quiz-header">
                        <div className="question-counter">Question {currentQuestionIndex + 1} of {allQuestions.length}</div>
                    </div>

                    <div className="question-section">
                        <h2 className="question-text">{currentQuestion.question}</h2>
                    </div>

                    <div className="answers-section">
                        {currentQuestion.answerOptions.map((option, index) => {
                            let buttonClass = 'answer-option';
                            if (quizSelectedAnswer === index && !showRationale) buttonClass += ' selected';
                            else if (showRationale) {
                                if (quizSelectedAnswer === index) buttonClass += option.isCorrect ? ' correct' : ' incorrect';
                                else if (option.isCorrect) buttonClass += ' show-correct';
                            }
                            return (
                                <button key={index} className={buttonClass} onClick={() => handleQuizAnswerSelect(index)} disabled={quizIsSubmitted}>
                                    {option.text}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginBottom: '1.2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                        {!showHint && !quizIsSubmitted && <button className="hint-button" onClick={handleShowHint}>💡 Show Hint</button>}
                        {showHint && <div></div>}
                        {quizSelectedAnswer !== null && !quizIsSubmitted && <button className="submit-button" onClick={handleQuizSubmit}>Submit Answer</button>}
                        {quizSelectedAnswer === null && <div></div>}
                    </div>

                    {showHint && !quizIsSubmitted && (
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

                    {showRationale && selectedOption && (
                        <>
                            <div className="rationale-overlay" onClick={handleHideRationale}></div>
                            <div className={`rationale-popup ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="rationale-header">
                                    <span className={`rationale-title ${isCorrect ? 'correct' : 'incorrect'}`}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</span>
                                    <button className="close-rationale-button" onClick={handleHideRationale}>✕ Close</button>
                                </div>
                                <div className="rationale-text">{selectedOption.rationale}</div>
                            </div>
                        </>
                    )}

                    {quizIsSubmitted && (
                        <div className="post-submit-actions">
                            {!showRationale && <button className="hint-button" onClick={handleShowRationale}>Show Explanation 💡</button>}
                            <button className="submit-button" onClick={handleQuizNext}>{isLastQuestion ? 'Finish Quiz' : 'Next Question →'}</button>
                        </div>
                    )}
                </div>
            </WorldPageLayout>
        );
    }

    if (step === 'quiz' && !currentQuestion) {
        return (
            <WorldPageLayout backgroundImage="/Theatre/Image_Theatre/Disability2.png" altText="Disability Quiz" onBackClick={handleBackClick}>
                <div className="quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    return null;
}

export default DisabilityPage;
