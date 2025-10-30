import { 
    AdSettings, 
    SEOSettings, 
    GeneralSettings,
    SocialMediaSettings, 
    SMTPSettings, 
    RSSSettings,
    AlertSettings, 
    PopupAdSettings, 
    ThemeSettings, 
    SecuritySettings, 
    DemoUserSettings,
    GoogleSearchConsoleSettings
} from './types';

// FIX: Moved basePath here to resolve circular dependency between App.tsx and other components.
export const basePath = '';

export const initialAdSettings: AdSettings = {
    headerAd: { enabled: true, type: 'network', networkKey: 'googleAdSense', customCode: '' },
    sidebarAd: { enabled: true, type: 'network', networkKey: 'mediaNet', customCode: '' },
    footerAd: { enabled: false, type: 'network', networkKey: '', customCode: '' },
    inFeedJobsAd: { enabled: true, type: 'network', networkKey: 'googleAdSense', customCode: '' },
    inFeedBlogAd: { enabled: false, type: 'network', networkKey: '', customCode: '' },
    jobDetailTopAd: { enabled: false, type: 'network', networkKey: '', customCode: '' },
    blogDetailTopAd: { enabled: false, type: 'network', networkKey: '', customCode: '' },
    adFrequency: 'medium',
    adStartTime: '00:00',
    adEndTime: '23:59',
    bannerAds: true, squareAds: true, skyscraperAds: false, popupAds: false,
    customAds: { enabled: false, rotation: false, codes: [] },
    abTests: [{ id: '1', placement: 'Sidebar', enabled: false, codeA: '<!-- Ad Variation A -->', codeB: '<!-- Ad Variation B -->', stats: { impressionsA: 10520, clicksA: 315, impressionsB: 10480, clicksB: 350 } }],
    deviceTargeting: { enabled: false, desktopCode: '<!-- Desktop Ad -->', mobileCode: '<!-- Mobile Ad -->' },
    geoTargeting: { enabled: false, rules: [{ id: '1', country: 'IN', code: '<!-- Ad for India -->'}] },
    adNetworks: {
        googleAdSense: { code: '<!-- Google AdSense Placeholder -->', notes: 'Main 728x90 Banner' },
        adsterra: { code: '<!-- Adsterra Placeholder -->', notes: '' },
        mediaNet: { code: '<!-- Media.net Placeholder -->', notes: 'Sidebar 300x250' },
        ezoic: { code: '<!-- Ezoic Placeholder -->', notes: '' },
        propellerAds: { code: '<!-- PropellerAds Placeholder -->', notes: '' },
    },
    activeTests: [],
};

export const initialSeoSettings: SEOSettings = {
    global: { siteTitle: 'Jobtica - Your Gateway to Government Jobs', metaDescription: 'Find the latest government job notifications, exam results, and admit cards. Your one-stop destination for all sarkari naukri updates.', metaKeywords: 'sarkari naukri, government jobs, jobs, recruitment, exam result, admit card, jobtica' },
    social: { ogTitle: 'Jobtica - Government Job Portal', ogDescription: 'Your one-stop destination for all sarkari naukri updates.', ogImageUrl: 'https://jobtica.vercel.app/og-image.jpg' },
    structuredData: { jobPostingSchemaEnabled: true },
};

export const initialGeneralSettings: GeneralSettings = {
    siteTitle: 'Jobtica',
    siteIconUrl: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' rx='20' fill='%234f46e5'/%3e%3ctext x='50' y='50' font-size='60' fill='white' text-anchor='middle' dy='.3em' font-family='sans-serif' font-weight='bold'%3eJ%3c/text%3e%3c/svg%3e",
    maintenanceMode: false,
    maintenanceMessage: 'Our website is currently undergoing scheduled maintenance. We should be back shortly. Thank you for your patience.',
    emailNotificationsEnabled: true,
};

export const initialSocialMediaSettings: SocialMediaSettings = { facebook: 'https://facebook.com', instagram: 'https://instagram.com', telegram: 'https://t.me', telegramGroup: 'https://t.me', telegramGroupIcon: 'users', whatsapp: 'https://wa.me' };

export const initialSmtpSettings: SMTPSettings = { configured: false, host: '', port: 587, secure: true, user: '', pass: '', fromEmail: '', fromName: '' };

export const initialRssSettings: RSSSettings = { feedUrl: '' };

export const initialAlertSettings: AlertSettings = { whatsApp: { enabled: false, apiKey: '', senderNumber: '' }, sms: { enabled: false, twilioSid: '', twilioToken: '', twilioNumber: '' } };

export const initialPopupAdSettings: PopupAdSettings = { enabled: false, imageUrl: 'https://via.placeholder.com/600x400.png/9333ea/ffffff?text=Popup+Ad', destinationUrl: '#', size: 'medium', openDelaySeconds: 3, closeAfterSeconds: 0, showOncePerSession: true };

export const initialThemeSettings: ThemeSettings = { primaryColor: '#4f46e5', accentColor: '#9333ea' };

export const initialSecuritySettings: SecuritySettings = { enableCSP: true, autoLogoutMinutes: 30, enable2FASimulation: false, warnOnExternalLink: true, preventContentCopy: false, demoModeEnabled: true, demoSessionTimeoutMinutes: 10 };

export const initialDemoUserSettings: DemoUserSettings = { canManageJobs: true, canManageContent: true, canManageLinks: true, canManageAudience: false, canSendEmails: false, canManageAds: false, canChangeTheme: true };

export const initialGoogleSearchConsoleSettings: GoogleSearchConsoleSettings = { verificationTag: '' };