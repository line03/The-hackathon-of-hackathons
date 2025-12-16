import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { useQuizCompletion } from '../../../../contexts/QuizCompletionContext';
import type { Question } from '../../../../types/quiz';
import easyQuizData from './quiz_easy.json';
import mediumQuizData from './quiz_medium.json';
import hardQuizData from './quiz_hard.json';
import '../Image_Theatre/page.css';

function ForumTheatreQuizPage() {
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
            navigate(ROUTES.THEATRE_WORLD_FORUM);
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
                        navigate(ROUTES.THEATRE_WORLD_FORUM);
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
        if (selectedAnswer !== null || isSubmitted) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setIsSubmitted(true);
        setShowRationale(true);
    };

    const handleNext = () => {
        if (isLastQuestion) {
            // Mark as completed
            if (difficulty) {
                markCompleted('forum', difficulty);
            }
            // Navigate back to Forum Theatre selection page
            navigate(ROUTES.THEATRE_WORLD_FORUM);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowHint(false);
            setShowRationale(false);
            setIsSubmitted(false);
        }
    };

    const handleShowHint = () => {
        setShowHint(true);
    };

    const handleHideHint = () => {
        setShowHint(false);
    };

    if (!quizStarted || !currentQuestion) {
        return (
            <WorldPageLayout
                backgroundImage="/Theatre/Forum_Theatre/Forum_Background.png"
                altText="Forum Theatre Quiz"
            >
                <div className="quiz-loading">Loading quiz...</div>
            </WorldPageLayout>
        );
    }

    const selectedOption = selectedAnswer !== null ? currentQuestion.answerOptions[selectedAnswer] : null;
    const isCorrect = selectedOption?.isCorrect || false;

    return (
        <WorldPageLayout
            backgroundImage="/Theatre/Forum_Theatre/Forum_Background.png"
            altText="Forum Theatre Quiz"
        >
            <div className="quiz-container">
                <div className="quiz-header">
                    <div className="question-counter">
                        Question {currentQuestionIndex + 1} of {allQuestions.length} - {difficulty?.toUpperCase()}
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
                    {showHint && (
                        <div></div>
                    )}

                    {selectedAnswer !== null && !isSubmitted && (
                        <button className="submit-button" onClick={handleSubmit}>
                            Submit Answer
                        </button>
                    )}
                    {selectedAnswer === null && (
                        <div></div>
                    )}
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

                {showRationale && (
                    <button className="next-button" onClick={handleNext}>
                        {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </button>
                )}
            </div>
        </WorldPageLayout>
    );
}

export default ForumTheatreQuizPage;

