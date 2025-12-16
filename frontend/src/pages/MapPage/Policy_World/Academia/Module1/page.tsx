import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../../config/routes';
import { assets } from '../../../../../assets/assets';
import type { Question } from '../../../../../types/quiz';
import type { QuizAnalysisResponse } from '../../../../../types/analysis';
import type { UserPreferences } from '../../../../../types/preferences';
import type { ReflectionAnalysis } from '../../../../../types/reflection';
import quizData from './quiz_module1.json';
import '../page.css';
import '../../../Law_World/Criminalization/page.css';

type Phase = 'video' | 'reflection' | 'feedback' | 'youtube' | 'quiz';
type CharacterState = 'idle' | 'happy' | 'sad';

const CHARACTER_VIDEOS: Record<CharacterState, string> = {
    idle: '/Policy-world/Character/idle-policy.webm',
    happy: '/Policy-world/Character/correct-policy.webm',
    sad: '/Policy-world/Character/sad-mic.webm',
};

const MODULE_VIDEO = '/Policy-world/Videos/Module1.mp4';

// YouTube video to show before quiz
const YOUTUBE_VIDEO_ID = 'd6NKdnZvdoo';

const REFLECTION_QUESTION = `How has corruption affected you or someone you know? 

Once you have decided on an anecdote to share, please describe:
1. The basics of what happened
2. How this example of corruption affected you or your acquaintance
3. Upon reflection, what is corrupt or corrupting about the example you have described

Take your time to reflect deeply. Your personal story will help connect theory to real-world impact.`;

function Module1Page() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Phase management
    const [phase, setPhase] = useState<Phase>('video');
    const [videoEnded, setVideoEnded] = useState(false);

    // Reflection state
    const [reflectionText, setReflectionText] = useState('');
    const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
    const [reflectionFeedback, setReflectionFeedback] = useState<ReflectionAnalysis | null>(null);

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

    const handleContinueFromVideo = () => {
        setPhase('reflection');
    };

    const handleSkipVideo = () => {
        setPhase('reflection');
    };

    const handleSubmitReflection = async () => {
        if (reflectionText.trim().length < 20) {
            alert('Please provide a more detailed story (at least 20 characters).');
            return;
        }

        setIsSubmittingReflection(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/analyze-reflection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module_number: 1,
                    student_response: reflectionText,
                }),
            });

            if (response.ok) {
                const data: ReflectionAnalysis = await response.json();
                setReflectionFeedback(data);
                setPhase('feedback');
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to analyze reflection. Please try again.');
            }
        } catch (error) {
            console.error('Reflection analysis failed:', error);
            // Create fallback feedback
            setReflectionFeedback({
                actors: ['Unable to identify'],
                action: 'Analysis unavailable',
                benefit_receiver: 'Unable to determine',
                type_of_corruption: ['Unable to classify'],
                harm: ['Unable to identify'],
                rule_or_duty_breached: 'Unable to determine',
                score: 5,
                feedback: {
                    strengths: ['You shared a personal story', 'You attempted to reflect on corruption'],
                    missing_points: ['More specific details would strengthen your analysis', 'Consider the systemic implications'],
                    improved_sentence: 'AI analysis is currently unavailable. Please continue to the quiz.',
                },
            });
            setPhase('feedback');
        } finally {
            setIsSubmittingReflection(false);
        }
    };

    const handleContinueToYoutube = () => {
        setPhase('youtube');
    };

    const handleContinueToQuiz = () => {
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
                    navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_1_CORRECTION, {
                        state: {
                            analysisResult: data,
                            score,
                            moduleId: 1,
                            questions: allQuestions,
                            reflectionFeedback,
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

            navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_1_CORRECTION, {
                state: {
                    analysisResult: fallback,
                    score,
                    moduleId: 1,
                    questions: allQuestions,
                    reflectionFeedback,
                },
            });
        };

        runAnalysis();
    }, [shouldAnalyze, userAnswers, userPreferences, navigate, score, allQuestions, reflectionFeedback]);

    // Render Video Phase
    if (phase === 'video') {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 1 - What Is Corruption?"
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
                            <button className="academia-continue-btn" onClick={handleContinueFromVideo}>
                                Continue →
                            </button>
                        )}
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Render Reflection Phase
    if (phase === 'reflection') {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 1 - Reflection Exercise"
                onBackClick={handleBackClick}
            >
                <div className="academia-character-container">
                    <video
                        className="academia-character-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        src={CHARACTER_VIDEOS.idle}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="reflection-container">
                    <h2 className="reflection-title">Personal Reflection</h2>
                    <p className="reflection-question">{REFLECTION_QUESTION}</p>
                    <textarea
                        className="reflection-textarea"
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Share your story here..."
                        disabled={isSubmittingReflection}
                    />
                    <div className="reflection-actions">
                        <button
                            className="reflection-submit-btn"
                            onClick={handleSubmitReflection}
                            disabled={isSubmittingReflection || reflectionText.trim().length < 20}
                        >
                            {isSubmittingReflection ? 'Analyzing...' : 'Submit for Analysis'}
                        </button>
                    </div>
                </div>
            </WorldPageLayout>
        );
    }

    // Render Feedback Phase
    if (phase === 'feedback' && reflectionFeedback) {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 1 - Reflection Feedback"
                onBackClick={handleBackClick}
            >
                <div className="academia-character-container">
                    <video
                        className="academia-character-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        src={CHARACTER_VIDEOS.happy}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="feedback-container">
                    <div className="feedback-header">
                        <h2 className="feedback-title">Your Reflection Feedback</h2>
                        <span className="feedback-score">{reflectionFeedback.score}/10</span>
                    </div>

                    <div className="feedback-section">
                        <h3 className="feedback-section-title">Extracted Elements</h3>
                        <ul className="feedback-list">
                            <li><strong>Actors:</strong> {reflectionFeedback.actors.join(', ')}</li>
                            <li><strong>Action:</strong> {reflectionFeedback.action}</li>
                            <li><strong>Beneficiary:</strong> {reflectionFeedback.benefit_receiver}</li>
                            <li><strong>Harm:</strong> {reflectionFeedback.harm.join(', ')}</li>
                            <li><strong>Type of Corruption:</strong> {reflectionFeedback.type_of_corruption.join(', ')}</li>
                            <li><strong>Rule/Duty Breached:</strong> {reflectionFeedback.rule_or_duty_breached}</li>
                        </ul>
                    </div>

                    <div className="feedback-section">
                        <h3 className="feedback-section-title">Strengths</h3>
                        <ul className="feedback-list strengths">
                            {reflectionFeedback.feedback.strengths.map((strength, idx) => (
                                <li key={idx}>{strength}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="feedback-section">
                        <h3 className="feedback-section-title">Areas for Improvement</h3>
                        <ul className="feedback-list missing">
                            {reflectionFeedback.feedback.missing_points.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="feedback-section">
                        <h3 className="feedback-section-title">Suggested Improvement</h3>
                        <p className="improved-sentence">{reflectionFeedback.feedback.improved_sentence}</p>
                    </div>

                    <button className="feedback-continue-btn" onClick={handleContinueToYoutube}>
                        Watch Video & Continue →
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    // Render YouTube Video Phase
    if (phase === 'youtube') {
        return (
            <WorldPageLayout
                backgroundImage={assets.innerPolicy}
                altText="Module 1 - Video"
                onBackClick={handleBackClick}
            >
                <div className="youtube-phase-container">
                    <h2 className="youtube-phase-title">Before the Quiz</h2>
                    <p className="youtube-phase-description">
                        Watch this video to learn more about corruption and its effects before taking the quiz.
                    </p>
                    
                    <div className="youtube-video-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0`}
                            title="Anti-Corruption Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    <button className="youtube-continue-btn" onClick={handleContinueToQuiz}>
                        Continue to Quiz →
                    </button>
                </div>
            </WorldPageLayout>
        );
    }

    // Render Quiz Phase
    if (phase === 'quiz') {
        if (isAnalyzing) {
            return (
                <WorldPageLayout
                    backgroundImage={assets.innerPolicy}
                    altText="Module 1 Quiz"
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
                    backgroundImage={assets.innerPolicy}
                    altText="Module 1 Quiz"
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
                backgroundImage={assets.innerPolicy}
                altText="Module 1 Quiz"
                onBackClick={handleBackClick}
            >
                {/* Character */}
                <div className="cr-character-container">
                    <video
                        key={characterState}
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

                {/* Quiz Container */}
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
                            <button className="hint-button" onClick={() => setShowHint(true)}>
                                💡 Show Hint
                            </button>
                        )}
                        {showHint && <div></div>}

                        {selectedAnswer !== null && !isSubmitted && (
                            <button className="submit-button" onClick={handleQuizSubmit}>
                                Submit Answer
                            </button>
                        )}
                        {selectedAnswer === null && <div></div>}
                    </div>

                    {showHint && !isSubmitted && (
                        <>
                            <div className="hint-overlay" onClick={() => setShowHint(false)}></div>
                            <div className="hint-section">
                                <div className="hint-header">
                                    <strong>Hint:</strong>
                                    <button className="hide-hint-button" onClick={() => setShowHint(false)}>
                                        ✕ Hide Hint
                                    </button>
                                </div>
                                <div className="hint-content">{currentQuestion.hint}</div>
                            </div>
                        </>
                    )}

                    {showRationale && selectedOption && (
                        <>
                            <div className="rationale-overlay" onClick={() => setShowRationale(false)}></div>
                            <div className={`rationale-popup ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="rationale-header">
                                    <span className={`rationale-title ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                                    </span>
                                    <button className="close-rationale-button" onClick={() => setShowRationale(false)}>
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
                                <button className="hint-button" onClick={() => setShowRationale(true)}>
                                    Show Explanation 💡
                                </button>
                            )}
                            <button className="submit-button" onClick={handleNextQuestion}>
                                {isLastQuestion ? 'Finish Quiz' : 'Next Question →'}
                            </button>
                        </div>
                    )}
                </div>
            </WorldPageLayout>
        );
    }

    return null;
}

export default Module1Page;
