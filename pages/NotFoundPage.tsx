import React from 'react';
// Fix: Removed file extensions from imports
import Icon from '../components/Icon';
// Fix: Removed file extensions from imports
import PublicFooter from '../components/PublicFooter';
// Fix: Removed file extensions from imports
import PublicHeader from '../components/PublicHeader';

const NotFoundPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PublicHeader navigate={navigate} />
            <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12">
                <div className="w-full max-w-2xl p-8 space-y-6 text-center bg-white rounded-lg shadow-xl">
                    <Icon name="map-signs" className="text-6xl text-indigo-500 mx-auto" />
                    <h1 className="text-5xl font-extrabold text-gray-900">404</h1>
                    <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
                    <p className="text-lg text-gray-600">
                        Oops! The page you are looking for does not exist. It might have been moved or deleted.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 bg-[var(--primary-color)] text-white px-6 py-3 rounded-md font-semibold text-lg filter hover:brightness-90 transition-all flex items-center gap-2 mx-auto"
                    >
                        <Icon name="home" />
                        Go Back to Home
                    </button>
                </div>
            </main>
            <PublicFooter navigate={navigate} />
        </div>
    );
};

export default NotFoundPage;