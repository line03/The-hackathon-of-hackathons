import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import './Header.css';

interface HeaderProps {
    showUserInfo?: boolean;
}

interface UserStats {
    level: number;
    xp: number;
    xpToNextLevel: number;
    coins: number;
    badges: string[];
    cityHealth?: number;
}

function Header({ showUserInfo = true }: HeaderProps) {
    const [userName, setUserName] = useState('');
    const [userStats, setUserStats] = useState<UserStats>({
        level: 1,
        xp: 250,
        xpToNextLevel: 500,
        coins: 150,
        badges: ['Law Explorer'],
        cityHealth: 85 // Good but not perfect
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (showUserInfo) {
            const storedName = localStorage.getItem('userName');
            if (storedName) {
                setUserName(storedName);
            }

            // Load user stats from localStorage (or use defaults)
            const storedStats = localStorage.getItem('userStats');
            if (storedStats) {
                setUserStats({ ...userStats, ...JSON.parse(storedStats) });
            } else {
                // Save default stats
                localStorage.setItem('userStats', JSON.stringify(userStats));
            }
        }
    }, [showUserInfo]);

    const handleMapClick = () => {
        navigate(ROUTES.MAP);
    };

    // Don't show map button if already on the map page
    const isOnMapPage = location.pathname === ROUTES.MAP;
    const isOnCallPage = location.pathname === ROUTES.CALL;

    // Calculate XP progress percentage
    const xpProgress = (userStats.xp / userStats.xpToNextLevel) * 100;

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="header-left">
                    <div className="header-logo">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path d="M50 20 L50 50 L70 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M30 75 L50 55 L70 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="50" cy="35" r="8" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="header-title">
                        <h1>Learning City</h1>
                        <span className="header-tagline">Anti-Corruption Education</span>
                    </div>
                </div>

                {showUserInfo && (
                    <div className="header-center">
                        {/* Level Display */}
                        <div className="stat-item level-display">
                            <div className="level-badge">
                                <span className="level-number">{userStats.level}</span>
                            </div>
                            <div className="level-info">
                                <span className="level-label">Level</span>
                                <div className="xp-bar">
                                    <div
                                        className="xp-fill"
                                        style={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                                <span className="xp-text">{userStats.xp}/{userStats.xpToNextLevel} XP</span>
                            </div>
                        </div>

                        {/* City Health Display */}
                        <div className="stat-item health-display">
                            <div className="health-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                        fill="#e74c3c" stroke="#c0392b" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="health-info">
                                <span className="health-label">City Health</span>
                                <div className="health-bar">
                                    <div
                                        className="health-fill"
                                        style={{ width: `${userStats.cityHealth}%` }}
                                    />
                                </div>
                                <span className="health-text">Stable</span>
                            </div>
                        </div>

                        {/* Coins Display */}
                        <div className="stat-item coins-display">
                            <div className="coin-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="7" fill="none" stroke="#B8860B" strokeWidth="1" />
                                    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8B6914">$</text>
                                </svg>
                            </div>
                            <span className="coin-count">{userStats.coins}</span>
                        </div>

                        {/* Badges Display */}
                        <div className="stat-item badges-display">
                            <div className="badges-container">
                                {userStats.badges.slice(0, 3).map((badge, index) => (
                                    <div key={index} className="badge-item" title={badge}>
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                fill="#D4A84B" stroke="#8B5A2B" strokeWidth="1.5" />
                                        </svg>
                                        <span className="badge-name">{badge}</span>
                                    </div>
                                ))}
                                {userStats.badges.length > 3 && (
                                    <div className="badge-more">+{userStats.badges.length - 3}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showUserInfo && (
                    <div className="header-right">
                        {!isOnCallPage && (
                            <button className="map-button" onClick={() => navigate(ROUTES.CALL)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                                <span>Grace</span>
                            </button>
                        )}
                        {!isOnMapPage && (
                            <button className="map-button" onClick={handleMapClick}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                                    <path d="M8 2v16" />
                                    <path d="M16 6v16" />
                                </svg>
                                <span>Map</span>
                            </button>
                        )}
                        {userName && (
                            <>
                                <div className="user-info">
                                    <span className="welcome-text">Welcome,</span>
                                    <span className="user-name">{userName}</span>
                                </div>
                                <div className="user-avatar">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
