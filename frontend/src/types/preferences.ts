export const UnderstandingStyle = {
    LOGIC: "step-by-step logic",
    SHORT: "short explanation",
    STORY: "real-life example / story",
    COMPARE: "compare right vs wrong"
} as const;
export type UnderstandingStyle = typeof UnderstandingStyle[keyof typeof UnderstandingStyle];

export const CorrectionStyle = {
    GENTLE: "gentle encouragement",
    DIRECT: "direct correction"
} as const;
export type CorrectionStyle = typeof CorrectionStyle[keyof typeof CorrectionStyle];

export const ComplexityLevel = {
    SIMPLE: "very simple",
    NORMAL: "normal",
    TECHNICAL: "technical"
} as const;
export type ComplexityLevel = typeof ComplexityLevel[keyof typeof ComplexityLevel];

export const StartWith = {
    RULE: "The rule",
    EXAMPLE: "An example"
} as const;
export type StartWith = typeof StartWith[keyof typeof StartWith];

export const VisualPreference = {
    NONE: "no visuals",
    DIAGRAMS: "diagrams (mermaid)"
} as const;
export type VisualPreference = typeof VisualPreference[keyof typeof VisualPreference];

export interface UserPreferences {
    understanding_style?: UnderstandingStyle;
    correction_style?: CorrectionStyle;
    complexity?: ComplexityLevel;
    start_with?: StartWith;
    visual_preference?: VisualPreference;
}

export interface UserPreferences {
    understanding_style?: UnderstandingStyle;
    correction_style?: CorrectionStyle;
    complexity?: ComplexityLevel;
    start_with?: StartWith;
    visual_preference?: VisualPreference;
}
