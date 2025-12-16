import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layouts/Header';
import BackButton from '../BackButton/BackButton';
import './WorldPageLayout.css';

interface WorldPageLayoutProps {
    backgroundImage: string;
    altText: string;
    children?: ReactNode;
    onBackClick?: () => void;
}

function WorldPageLayout({ backgroundImage, altText, children, onBackClick }: WorldPageLayoutProps) {
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (!storedName) {
            navigate('/');
            return;
        }
    }, [navigate]);

    return (
        <div className="map-page">
            <Header showUserInfo={true} />

            <main className="map-content">
                <div className="world-container">
                    <BackButton onClick={onBackClick} />
                    <img
                        src={backgroundImage}
                        alt={altText}
                        className="world-background"
                    />
                    {children && (
                        <div className="world-content">
                            {children}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default WorldPageLayout;

