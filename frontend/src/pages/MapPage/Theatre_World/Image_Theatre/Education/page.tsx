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
import '../page.css';

type CharacterState = 'idle' | 'happy' | 'sad';

// Map character state to Theatre character video files
const CHARACTER_VIDEOS: Record<CharacterState, string> = {
    idle: '/Theatre/Character/idle-theatre.webm',
    happy: '/Theatre/Character/correct-theatre.webm',
    sad: '/Theatre/Character/sad-theatre.webm',
};

interface EducationUserAnswer {
    question: string;
    answerOptions: Question['answerOptions'];
    answerCorrect: boolean;
}

function EducationPage() {
    const navigate = useNavigate();
    const { isCompleted } = useQuizCompletion();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRationale, setShowRationale] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [score, setScore] = useState(0);

    // Character animation state
    const [characterState, setCharacterState] = useState<CharacterState>('idle');

    // AI analysis state
    const [userAnswers, setUserAnswers] = useState<EducationUserAnswer[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [, setAnalysisResult] = useState<QuizAnalysisResponse | null>(null);
    const [shouldAnalyze, setShouldAnalyze] = useState(false);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

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
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
            setCharacterState('idle');
            setUserAnswers([]);
            setScore(0);
            setAnalysisResult(null);
            setShouldAnalyze(false);
            setQuizStarted(true);
        } catch (error) {
            console.error('Error loading quiz data:', error);
        }
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

    // Check if main Image Theatre quiz is completed on mount
    useEffect(() => {
        const mainQuizCompleted = isCompleted('image-theatre-main');
        if (mainQuizCompleted) {
            loadQuizData();
        }
    }, [isCompleted]);

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

                    navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE_EDUCATION_CORRECTION, {
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

            // Fallback: navigate with simple explanations if AI is unavailable
            const fallback: QuizAnalysisResponse = {
                overall_summary:
                    'We could not generate AI feedback right now, so here are the key explanations based on the correct answers for each question.',
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

            navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE_EDUCATION_CORRECTION, {
                state: {
                    analysisResult: fallback,
                    score,
                    questions: allQuestions,
                },
            });
        };

        runAnalysis();
    }, [shouldAnalyze, userAnswers, userPreferences, navigate, score, allQuestions]);

    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = allQuestions.length > 0 && currentQuestionIndex === allQuestions.length - 1;

    const handleAnswerSelect = (index: number) => {
        if (isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;

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

    const handleNext = () => {
        if (isLastQuestion) {
            setShouldAnalyze(true);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
            setCharacterState('idle');
        }
    };

    const handleShowHint = () => setShowHint(true);
    const handleHideHint = () => setShowHint(false);
    const handleShowRationale = () => setShowRationale(true);
    const handleHideRationale = () => setShowRationale(false);

    const handleBackClick = () => {
        navigate(ROUTES.THEATRE_WORLD);
    };

    const mainQuizCompleted = isCompleted('image-theatre-main');

    if (!quizStarted) {
        if (!mainQuizCompleted) {
            return (
                <WorldPageLayout
                    backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png"
                    altText="Education Quiz"
                    onBackClick={handleBackClick}
                >
                    <div className="quiz-start-container">
                        <h2 className="quiz-start-title">Complete Main Quiz First</h2>
                        <p className="quiz-start-description">
                            Please complete the main Image Theatre quiz before accessing this module.
                        </p>
                        <button 
                            className="start-quiz-button" 
                            onClick={() => navigate(ROUTES.THEATRE_WORLD_IMAGE_THEATRE)}
                        >
                            Go to Main Quiz
                        </button>
                    </div>
                </WorldPageLayout>
            );
        }
        return (
            <WorldPageLayout
                backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png"
                altText="Education Quiz"
                onBackClick={handleBackClick}
            >
                <div className="quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    if (isAnalyzing) {
        return (
            <WorldPageLayout
                backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png"
                altText="Education Quiz"
                onBackClick={handleBackClick}
            >
                <div className="quiz-loading">
                    Analyzing your responses...
                    <br />
                    This may take a few seconds.
                </div>
            </WorldPageLayout>
        );
    }

    if (!currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png"
                altText="Education Quiz"
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
            backgroundImage="/Theatre/Image_Theatre/Image_Theatre.png"
            altText="Education Quiz"
            onBackClick={handleBackClick}
        >
            {/* Theatre Character */}
            <div className="it-character-container">
                <video
                    key={characterState}
                    className="it-character-video"
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
                        Question {currentQuestionIndex + 1} of {allQuestions.length}
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
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question →'}
                        </button>
                    </div>
                )}
            </div>
        </WorldPageLayout>
    );
}

export default EducationPage;
