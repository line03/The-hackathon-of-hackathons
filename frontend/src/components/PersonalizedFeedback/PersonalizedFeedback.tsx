import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import './PersonalizedFeedback.css';

interface Props {
    explanation: string;
    diagramCode?: string;
    isLoading: boolean;
}

export function PersonalizedFeedback({ explanation, diagramCode, isLoading }: Props) {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [diagramError, setDiagramError] = useState(false);

    useEffect(() => {
        if (diagramCode && mermaidRef.current) {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'neutral',
                securityLevel: 'loose',
            });

            const renderDiagram = async () => {
                try {
                    setDiagramError(false);
                    // Clear previous content
                    mermaidRef.current!.innerHTML = '';

                    // Generate unique ID for this diagram
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                    // Render
                    const { svg } = await mermaid.render(id, diagramCode);
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = svg;
                    }
                } catch (error) {
                    console.error("Mermaid failed to render", error);
                    setDiagramError(true);
                }
            };

            renderDiagram();
        }
    }, [diagramCode]);

    if (isLoading) {
        return (
            <div className="feedback-loading">
                <div className="loading-spinner"></div>
                <p>Generating personalized explanation...</p>
            </div>
        );
    }

    return (
        <div className="personalized-feedback">
            <h3 className="feedback-title">Content Explanation</h3>

            <div className="feedback-text">
                {explanation}
            </div>

            {diagramCode && !diagramError && (
                <div className="feedback-diagram" ref={mermaidRef}>
                    {/* Diagram will be rendered here */}
                </div>
            )}
        </div>
    );
}
