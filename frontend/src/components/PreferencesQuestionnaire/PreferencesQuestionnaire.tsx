import { useState } from 'react';
import {
    ComplexityLevel,
    UnderstandingStyle,
    CorrectionStyle,
    StartWith,
    VisualPreference,
    type UserPreferences
} from '../../types/preferences';
import './PreferencesQuestionnaire.css';

interface Props {
    open: boolean;
    onComplete: (prefs: UserPreferences) => void;
}

export function PreferencesQuestionnaire({ open, onComplete }: Props) {
    const [step, setStep] = useState(1);
    const [prefs, setPrefs] = useState<UserPreferences>({
        complexity: ComplexityLevel.NORMAL,
        visual_preference: VisualPreference.NONE
    });

    if (!open) return null;

    const handleNext = () => setStep(step + 1);

    const handleSubmit = () => {
        onComplete(prefs);
    };

    const updatePref = (key: keyof UserPreferences, value: any) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="pref-modal-overlay">
            <div className="pref-modal-content">
                <div className="pref-progress-bar">
                    <div className="pref-progress-fill" style={{ width: `${(step / 6) * 100}%` }}></div>
                </div>

                <div className="pref-step-content">
                    {/* STEP 1: Complexity */}
                    {step === 1 && (
                        <div className="pref-step">
                            <h2>How do you prefer explanations?</h2>
                            <p className="pref-subtitle">Choose the level of detail you are comfortable with.</p>
                            <div className="pref-options-grid">
                                <button
                                    className={`pref-option ${prefs.complexity === ComplexityLevel.SIMPLE ? 'selected' : ''}`}
                                    onClick={() => updatePref('complexity', ComplexityLevel.SIMPLE)}
                                >
                                    <span className="pref-icon">👶</span>
                                    <span className="pref-label">Simple / Beginner</span>
                                </button>
                                <button
                                    className={`pref-option ${prefs.complexity === ComplexityLevel.NORMAL ? 'selected' : ''}`}
                                    onClick={() => updatePref('complexity', ComplexityLevel.NORMAL)}
                                >
                                    <span className="pref-icon">🧑‍🎓</span>
                                    <span className="pref-label">Normal</span>
                                </button>
                                <button
                                    className={`pref-option ${prefs.complexity === ComplexityLevel.TECHNICAL ? 'selected' : ''}`}
                                    onClick={() => updatePref('complexity', ComplexityLevel.TECHNICAL)}
                                >
                                    <span className="pref-icon">🔬</span>
                                    <span className="pref-label">Technical</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Understanding Style */}
                    {step === 2 && (
                        <div className="pref-step">
                            <h2>What helps you understand best?</h2>
                            <div className="pref-options-list">
                                <button
                                    className={`pref-option ${prefs.understanding_style === UnderstandingStyle.STORY ? 'selected' : ''}`}
                                    onClick={() => updatePref('understanding_style', UnderstandingStyle.STORY)}
                                >
                                    Give me a real-life example or story
                                </button>
                                <button
                                    className={`pref-option ${prefs.understanding_style === UnderstandingStyle.LOGIC ? 'selected' : ''}`}
                                    onClick={() => updatePref('understanding_style', UnderstandingStyle.LOGIC)}
                                >
                                    Walk me through the logic step-by-step
                                </button>
                                <button
                                    className={`pref-option ${prefs.understanding_style === UnderstandingStyle.COMPARE ? 'selected' : ''}`}
                                    onClick={() => updatePref('understanding_style', UnderstandingStyle.COMPARE)}
                                >
                                    Compare my answer vs. the correct one
                                </button>
                                <button
                                    className={`pref-option ${prefs.understanding_style === UnderstandingStyle.SHORT ? 'selected' : ''}`}
                                    onClick={() => updatePref('understanding_style', UnderstandingStyle.SHORT)}
                                >
                                    Just give me the short answer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Correction Style */}
                    {step === 3 && (
                        <div className="pref-step">
                            <h2>How should we correct mistakes?</h2>
                            <div className="pref-options-grid">
                                <button
                                    className={`pref-option ${prefs.correction_style === CorrectionStyle.GENTLE ? 'selected' : ''}`}
                                    onClick={() => updatePref('correction_style', CorrectionStyle.GENTLE)}
                                >
                                    <span className="pref-icon">🤝</span>
                                    <span className="pref-label">Be gentle & encouraging</span>
                                </button>
                                <button
                                    className={`pref-option ${prefs.correction_style === CorrectionStyle.DIRECT ? 'selected' : ''}`}
                                    onClick={() => updatePref('correction_style', CorrectionStyle.DIRECT)}
                                >
                                    <span className="pref-icon">🎯</span>
                                    <span className="pref-label">Be direct & to the point</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Start With */}
                    {step === 4 && (
                        <div className="pref-step">
                            <h2>Start explanations with...</h2>
                            <div className="pref-options-grid">
                                <button
                                    className={`pref-option ${prefs.start_with === StartWith.EXAMPLE ? 'selected' : ''}`}
                                    onClick={() => updatePref('start_with', StartWith.EXAMPLE)}
                                >
                                    An Example
                                </button>
                                <button
                                    className={`pref-option ${prefs.start_with === StartWith.RULE ? 'selected' : ''}`}
                                    onClick={() => updatePref('start_with', StartWith.RULE)}
                                >
                                    The Rule / Concept
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Visuals */}
                    {step === 5 && (
                        <div className="pref-step">
                            <h2>Visual aids?</h2>
                            <div className="pref-options-grid">
                                <button
                                    className={`pref-option ${prefs.visual_preference === VisualPreference.DIAGRAMS ? 'selected' : ''}`}
                                    onClick={() => updatePref('visual_preference', VisualPreference.DIAGRAMS)}
                                >
                                    <span className="pref-icon">📊</span>
                                    <span className="pref-label">Yes, show charts/diagrams</span>
                                </button>
                                <button
                                    className={`pref-option ${prefs.visual_preference === VisualPreference.NONE ? 'selected' : ''}`}
                                    onClick={() => updatePref('visual_preference', VisualPreference.NONE)}
                                >
                                    <span className="pref-icon">📝</span>
                                    <span className="pref-label">No, text only</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pref-footer">
                    {step < 5 ? (
                        <button className="pref-next-btn" onClick={handleNext}>
                            Next
                        </button>
                    ) : (
                        <button className="pref-submit-btn" onClick={handleSubmit}>
                            Start Journey 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
