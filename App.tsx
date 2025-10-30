import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import PublicWebsite from './pages/PublicWebsite';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanel from './pages/AdminPanel';
import MaintenancePage from './pages/MaintenancePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import Disclaimer from './pages/Disclaimer';
import TermsAndConditions from './pages/TermsAndConditions';
import BlogPage from './pages/BlogPage';
import JobDetailPage from './pages/JobDetailPage';
import BlogDetailPage from './pages/BlogDetailPage';
import TelegramFAB from './components/TelegramFAB';
import ContactPage from './pages/ContactPage';
import ThemeApplicator from './components/ThemeApplicator';
import CSPEffect from './components/CSPEffect';
import ContentProtection from './components/ContentProtection';
import PreparationPage from './pages/PreparationPage';
import GoogleSearchConsoleEffect from './components/GoogleSearchConsoleEffect';
import NotFoundPage from './pages/NotFoundPage';
import { basePath } from './constants';


const App: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { generalSettings, seoSettings, securitySettings, isLoading } = useData();
  const [path, setPath] = useState(window.location.pathname);

  // This effect listens for browser navigation events (back/forward buttons)
  // to keep the component's path state in sync.
  useEffect(() => {
    const onLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);
  
  // This effect listens for path changes and scrolls to the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);
  
  // This effect updates the favicon dynamically.
  useEffect(() => {
    if (isLoading) return;
    const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (link && generalSettings.siteIconUrl) {
      link.href = generalSettings.siteIconUrl;
    }
  }, [generalSettings.siteIconUrl, isLoading]);

  // Update document title based on SEO settings and current page
  useEffect(() => {
    if (isLoading) return;
    const route = (path.replace(basePath, '') || '/').toLowerCase();
    const siteTitle = seoSettings.global.siteTitle;
    let title;

    if (route.startsWith('/admin')) title = `Admin Panel | ${siteTitle}`;
    else if (route.startsWith('/job/')) title = `Job Details | ${siteTitle}`;
    else if (route.startsWith('/blog/')) title = `Blog Post | ${siteTitle}`;
    else if (route === '/blog') title = `Blog | ${siteTitle}`;
    else if (route === '/preparation') title = `Exam Preparation | ${siteTitle}`;
    else if (route === '/privacy') title = `Privacy Policy | ${siteTitle}`;
    else if (route === '/terms') title = `Terms & Conditions | ${siteTitle}`;
    else if (route === '/about') title = `About Us | ${siteTitle}`;
    else if (route === '/disclaimer') title = `Disclaimer | ${siteTitle}`;
    else if (route === '/contact') title = `Contact Us | ${siteTitle}`;
    else if (route === '/') title = siteTitle;
    else title = `404 - Page Not Found | ${siteTitle}`;
    
    document.title = title;
  }, [path, seoSettings.global.siteTitle, isLoading]);


  const navigate = (newPath: string) => {
    const sanitizedPath = newPath.startsWith('/') ? newPath : `/${newPath}`;
    const fullPath = `${basePath}${sanitizedPath}`.replace('//', '/');
    
    try {
        window.history.pushState({}, '', fullPath);
        setPath(fullPath); // Update state directly to trigger re-render
    } catch (e) {
        if (e instanceof DOMException && e.name === 'SecurityError') {
            // This is an expected error in sandboxed environments (like iframes).
            // Fallback to in-app navigation without changing the URL.
            console.log("History API is disabled in this environment. Falling back to in-app navigation.");
            setPath(fullPath);
        } else {
            throw e;
        }
    }
  };

  const route = (path.replace(basePath, '') || '/').toLowerCase();
  const isPublicRoute = !route.startsWith('/admin');

  if (isLoading && isPublicRoute) {
    // You can return a global loading spinner here for the public site
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const renderPage = () => {
    if (generalSettings.maintenanceMode && isPublicRoute) {
        return <MaintenancePage />;
    }

    if (route.startsWith('/admin')) {
      return isLoggedIn ? <AdminPanel /> : <AdminLoginPage />;
    }
    
    if (route.startsWith('/job/')) {
      const jobSlug = path.split('/')[2];
      return <JobDetailPage jobSlug={jobSlug} navigate={navigate} />;
    }

    if (route.startsWith('/blog/')) {
      const postId = path.split('/')[2];
      return <BlogDetailPage postId={postId} navigate={navigate} />;
    }
    
    switch (route) {
      case '/':
        return <PublicWebsite navigate={navigate} />;
      case '/blog':
        return <BlogPage navigate={navigate} />;
      case '/preparation':
        return <PreparationPage navigate={navigate} />;
      case '/privacy':
        return <PrivacyPolicy navigate={navigate} />;
      case '/about':
        return <AboutUs navigate={navigate} />;
      case '/disclaimer':
          return <Disclaimer navigate={navigate} />;
      case '/terms':
          return <TermsAndConditions navigate={navigate} />;
      case '/contact':
          return <ContactPage navigate={navigate} />;
      default:
          return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <>
      <ThemeApplicator />
      <CSPEffect />
      <GoogleSearchConsoleEffect />
      {isPublicRoute && securitySettings.preventContentCopy && <ContentProtection />}
      {renderPage()}
      {isPublicRoute && !generalSettings.maintenanceMode && <TelegramFAB />}
    </>
  );
};

export default App;