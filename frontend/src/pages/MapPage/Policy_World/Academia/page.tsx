import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldPageLayout from '../../../../components/WorldPageLayout/WorldPageLayout';
import { ROUTES } from '../../../../config/routes';
import { assets } from '../../../../assets/assets';
import '../../Law_World/Criminalization/page.css';
import './page.css';

interface ModuleInfo {
    id: number;
    title: string;
    description: string;
    available: boolean;
    videoPath?: string;
}

const MODULES: ModuleInfo[] = [
    {
        id: 1,
        title: 'What Is Corruption?',
        description: 'Understand corruption definitions, types, and why it matters.',
        available: true,
        videoPath: '/Policy-world/Videos/Module1.mp4',
    },
    {
        id: 2,
        title: 'Corruption & Good Governance',
        description: 'Explore the relationship between corruption and governance.',
        available: true,
        videoPath: '/Policy-world/Videos/Module1.mp4', // Using available video
    },
    {
        id: 3,
        title: 'Corruption & Comparative Politics',
        description: 'Compare corruption across different political systems.',
        available: true,
        videoPath: '/Policy-world/Videos/Module_3.mp4',
    },
    {
        id: 4,
        title: 'Public Sector Corruption',
        description: 'Analyze corruption in public institutions and services.',
        available: true,
        videoPath: '/Policy-world/Videos/Module_4.mp4',
    },
    {
        id: 5,
        title: 'Private Sector Corruption',
        description: 'Examine corruption in business and commercial activities.',
        available: false,
    },
    {
        id: 6,
        title: 'Detecting & Investigating Corruption',
        description: 'Learn methods to detect and investigate corrupt practices.',
        available: false,
    },
    {
        id: 7,
        title: 'Corruption & Human Rights',
        description: 'Understand how corruption impacts human rights.',
        available: false,
    },
    {
        id: 8,
        title: 'Corruption & Gender',
        description: 'Explore the gendered dimensions of corruption.',
        available: false,
    },
    {
        id: 9,
        title: 'Corruption in Education',
        description: 'Analyze corruption in educational systems.',
        available: false,
    },
    {
        id: 10,
        title: 'Citizen Participation in Anti-Corruption',
        description: 'Learn how citizens can fight corruption.',
        available: false,
    },
    {
        id: 11,
        title: 'Corruption, Peace & Security',
        description: 'Examine links between corruption and security.',
        available: false,
    },
];

// Policy character idle video
const CHARACTER_IDLE_VIDEO = '/Policy-world/Character/idle-policy.webm';

function AcademiaPage() {
    const navigate = useNavigate();
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Show 3 modules at a time
    const VISIBLE_COUNT = 3;
    const maxIndex = Math.max(0, MODULES.length - VISIBLE_COUNT);

    const handlePrevModule = () => {
        setCarouselIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    };

    const handleNextModule = () => {
        setCarouselIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    // Get the 3 visible modules
    const visibleModules = MODULES.slice(carouselIndex, carouselIndex + VISIBLE_COUNT);

    const handleModuleClick = (moduleId: number) => {
        const module = MODULES.find((m) => m.id === moduleId);
        if (!module?.available) return;

        switch (moduleId) {
            case 1:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_1);
                break;
            case 2:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_2);
                break;
            case 3:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_3);
                break;
            case 4:
                navigate(ROUTES.POLICY_WORLD_ACADEMIA_MODULE_4);
                break;
            default:
                break;
        }
    };

    const handleBackClick = () => {
        navigate(ROUTES.POLICY_WORLD);
    };

    return (
        <WorldPageLayout
            backgroundImage={assets.innerPolicy}
            altText="Academia Modules"
            onBackClick={handleBackClick}
        >
            {/* Policy Character - Left side */}
            <div className="academia-character-container">
                <video
                    className="academia-character-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    src={CHARACTER_IDLE_VIDEO}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Module Selection - Right side with 3 modules visible */}
            <div className="academia-selection-container">
                <h2 className="academia-title">Academia</h2>
                <p className="academia-description">
                    Explore anti-corruption modules from the UNODC Education for Justice initiative.
                </p>

                <div className="carousel-container">
                    <button className="carousel-arrow carousel-arrow-left" onClick={handlePrevModule}>
                        ‹
                    </button>

                    <div className="carousel-track three-visible">
                        {visibleModules.map((module) => (
                            <div
                                key={module.id}
                                className={`academia-card carousel-card ${!module.available ? 'locked' : ''}`}
                                onClick={() => handleModuleClick(module.id)}
                            >
                                <div className="academia-card-header">
                                    <span className="module-number">Module {module.id}</span>
                                    {!module.available && (
                                        <span className="locked-badge">🚧</span>
                                    )}
                                    {module.available && (
                                        <span className="available-badge">✓</span>
                                    )}
                                </div>
                                <h3 className="module-title">{module.title}</h3>
                                <p className="module-description">{module.description}</p>
                                {module.available && (
                                    <button className="start-module-btn">
                                        Start →
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button className="carousel-arrow carousel-arrow-right" onClick={handleNextModule}>
                        ›
                    </button>
                </div>

                <div className="carousel-indicators">
                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <button
                            key={idx}
                            className={`carousel-indicator ${idx === carouselIndex ? 'active' : ''}`}
                            onClick={() => setCarouselIndex(idx)}
                            title={`Page ${idx + 1}`}
                        />
                    ))}
                </div>

                <div className="module-progress">
                    <span className="progress-text">
                        {MODULES.filter((m) => m.available).length} of {MODULES.length} modules available
                    </span>
                </div>
            </div>
        </WorldPageLayout>
    );
}

export default AcademiaPage;
