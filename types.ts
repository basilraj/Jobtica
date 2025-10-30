// Fix: Separate type definitions from constants to resolve circular dependencies.
export type JobStatus = 'active' | 'closing-soon' | 'expired';

export interface PreparationCourse {
  id: string;
  platform: 'Udemy' | 'Unacademy' | 'Coursera' | 'Testbook' | 'Adda247' | 'Other';
  title: string;
  url: string;
}

export interface PreparationBook {
  id: string;
  title: string;
  author: string;
  url: string;
  imageUrl?: string;
}

export interface UpcomingExam {
  id: string;
  name: string;
  deadline: string; // YYYY-MM-DD
  notificationLink: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  category: string;
  description: string;
  qualification: string;
  vacancies: string;
  postedDate: string; // YYYY-MM-DD
  lastDate: string; // YYYY-MM-DD
  applyLink: string;
  status: JobStatus;
  createdAt: string; // ISO String
  affiliateCourses?: PreparationCourse[];
  affiliateBooks?: PreparationBook[];
}

export interface QuickLink {
    id: string;
    title: string;
    category: string;
    url: string;
    description: string;
    status: 'active' | 'inactive';
}

export interface ContentPost {
    id: string;
    title: string;
    category: string;
    content: string;
    status: 'published' | 'draft';
    type: 'posts' | 'exam-notices' | 'results';
    publishedDate: string; // YYYY-MM-DD
    createdAt: string; // ISO String
    examDate?: string; // YYYY-MM-DD
    detailsUrl?: string;
    imageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
}

export interface Subscriber {
    id: string;
    email: string;
    subscriptionDate: string; // YYYY-MM-DD
    status: 'active' | 'inactive';
}

export interface BreakingNews {
    id: string;
    text: string;
    link: string;
    status: 'active' | 'inactive';
}

export interface ABTest {
    id: string;
    placement: string;
    enabled: boolean;
    codeA: string;
    codeB: string;
    stats: {
        impressionsA: number;
        impressionsB: number;
        clicksA: number;
        clicksB: number;
    };
}

export interface GeoTargetedAd {
    id: string;
    country: string;
    code: string;
}

export interface SponsoredAd {
    id: string;
    imageUrl: string;
    destinationUrl: string;
    placement: 'sidebar-top';
    status: 'active' | 'inactive';
    clicks?: number;
}

export interface AdNetworkSettings {
    googleAdSense: { code: string; notes: string; };
    adsterra: { code: string; notes: string; };
    mediaNet: { code: string; notes: string; };
    ezoic: { code: string; notes: string; };
    propellerAds: { code: string; notes: string; };
}

export type AdPlacementType = 'network' | 'custom';

export interface PlacementSetting {
  enabled: boolean;
  type: AdPlacementType;
  networkKey: keyof AdNetworkSettings | ''; // Use empty string for 'none'
  customCode: string;
}

export type PlacementKey = keyof Pick<AdSettings, 'headerAd' | 'sidebarAd' | 'footerAd' | 'inFeedJobsAd' | 'inFeedBlogAd' | 'jobDetailTopAd' | 'blogDetailTopAd'>;


export interface AdSettings {
    // Refactored Ad Placements
    headerAd: PlacementSetting;
    sidebarAd: PlacementSetting;
    footerAd: PlacementSetting;
    inFeedJobsAd: PlacementSetting;
    inFeedBlogAd: PlacementSetting;
    jobDetailTopAd: PlacementSetting;
    blogDetailTopAd: PlacementSetting;
    
    // Other Ad Settings
    adFrequency: 'low' | 'medium' | 'high';
    adStartTime: string; // HH:mm
    adEndTime: string; // HH:mm
    bannerAds: boolean;
    squareAds: boolean;
    skyscraperAds: boolean;
    popupAds: boolean;
    customAds: {
        enabled: boolean;
        rotation: boolean;
        codes: string[];
    };
    abTests: ABTest[];
    deviceTargeting: {
        enabled: boolean;
        desktopCode: string;
        mobileCode: string;
    };
    geoTargeting: {
        enabled: boolean;
        rules: GeoTargetedAd[];
    };
    adNetworks: AdNetworkSettings;
    activeTests: PlacementKey[];
}

export interface SEOSettings {
    global: {
        siteTitle: string;
        metaDescription: string;
        metaKeywords: string;
    };
    social: {
        ogTitle: string;
        ogDescription: string;
        ogImageUrl: string;
    };
    structuredData: {
        jobPostingSchemaEnabled: boolean;
    };
}

export interface GeneralSettings {
    siteTitle: string;
    siteIconUrl: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    emailNotificationsEnabled: boolean;
}

export interface SocialMediaSettings {
    facebook: string;
    instagram: string;
    telegram: string;
    telegramGroup: string;
    telegramGroupIcon: string;
    whatsapp: string;
}

export interface SMTPSettings {
    configured: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromEmail: string;
    fromName: string;
}

export interface User {
    username: string;
    email: string;
    passwordHash: string;
}

export interface ActivityLog {
    id: string;
    timestamp: string; // ISO String
    action: string;
    details: string;
}

export interface RSSSettings {
    feedUrl: string;
}

export interface AlertSettings {
    whatsApp: {
        enabled: boolean;
        apiKey: string;
        senderNumber: string;
    };
    sms: {
        enabled: boolean;
        twilioSid: string;
        twilioToken: string;

        twilioNumber: string;
    };
}

export interface PopupAdSettings {
    enabled: boolean;
    imageUrl: string;
    destinationUrl: string;
    size: 'small' | 'medium' | 'large';
    openDelaySeconds: number;
    closeAfterSeconds: number; // 0 means manual close only
    showOncePerSession: boolean;
}

export interface ThemeSettings {
    primaryColor: string;
    accentColor: string;
}

export interface SecuritySettings {
  enableCSP: boolean;
  autoLogoutMinutes: 0 | 15 | 30 | 60; // 0 means 'Never'
  enable2FASimulation: boolean;
  warnOnExternalLink: boolean;
  preventContentCopy: boolean;
  demoModeEnabled: boolean;
  demoSessionTimeoutMinutes: 0 | 5 | 10 | 15; // 0 means 'Never'
}

export interface DemoUserSettings {
    canManageJobs: boolean;
    canManageContent: boolean;
    canManageLinks: boolean;
    canManageAudience: boolean;
    canSendEmails: boolean;
    canManageAds: boolean;
    canChangeTheme: boolean;
}

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    submittedAt: string; // ISO String
}

export interface EmailNotification {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    sentAt: string; // ISO String
}

export interface CustomEmail {
    id: string;
    subject: string;
    body: string;
    sentAt: string; // ISO String
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export interface GoogleSearchConsoleSettings {
    verificationTag: string;
}

export interface BackupData {
    jobs: Job[];
    quickLinks: QuickLink[];
    posts: ContentPost[];
    subscribers: Subscriber[];
    breakingNews: BreakingNews[];
    adSettings: AdSettings;
    seoSettings: SEOSettings;
    generalSettings: GeneralSettings;
    socialMediaSettings: SocialMediaSettings;
    activityLogs: ActivityLog[];
    smtpSettings: SMTPSettings;
    rssSettings: RSSSettings;
    alertSettings: AlertSettings;
    sponsoredAds: SponsoredAd[];
    popupAdSettings: PopupAdSettings;
    themeSettings: ThemeSettings;
    securitySettings: SecuritySettings;
    demoUserSettings: DemoUserSettings;
    emailTemplates: EmailTemplate[];
    googleSearchConsoleSettings: GoogleSearchConsoleSettings;
    preparationCourses: PreparationCourse[];
    preparationBooks: PreparationBook[];
    upcomingExams: UpcomingExam[];
    // FIX: Add missing properties to align with data context usage
    contacts: ContactSubmission[];
    emailNotifications: EmailNotification[];
    customEmails: CustomEmail[];
}