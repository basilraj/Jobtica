
import { Router } from 'express';

const router = Router();

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


// Helper to parse JSON from DB fields with error handling
const parseJsonField = (jsonString) => {
    if (!jsonString) return [];
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Failed to parse JSON field:', e);
        return [];
    }
};

// GET /api/data - Fetch all site data
router.get('/data', async (req, res, next) => {
    try {
        const connection = req.db;
        const settingsRows = await connection.query('SELECT key_name, value FROM KeyValueStore');
        const settingsObject = settingsRows.rows.reduce((acc, row) => {
            acc[row.key_name] = parseJsonField(row.value);
            return acc;
        }, {});

        const jobs = await connection.query('SELECT * FROM Job ORDER BY createdAt DESC');
        const quickLinks = await connection.query('SELECT * FROM QuickLink ORDER BY title ASC');
        const posts = await connection.query('SELECT * FROM ContentPost ORDER BY createdAt DESC');
        const breakingNews = await connection.query('SELECT * FROM BreakingNews');
        const sponsoredAds = await connection.query('SELECT * FROM SponsoredAd');
        const preparationCourses = await connection.query('SELECT * FROM PreparationCourse ORDER BY title ASC');
        const preparationBooks = await connection.query('SELECT * FROM PreparationBook ORDER BY title ASC');
        const upcomingExams = await connection.query('SELECT * FROM UpcomingExam ORDER BY deadline ASC');
        
        const parsedJobs = jobs.rows.map(job => ({
            ...job,
            affiliateCourses: parseJsonField(job.affiliateCoursesJson),
            affiliateBooks: parseJsonField(job.affiliateBooksJson),
        }));
        
        const publicData = {
            jobs: parsedJobs, 
            quickLinks: quickLinks.rows, 
            posts: posts.rows, 
            breakingNews: breakingNews.rows, 
            sponsoredAds: sponsoredAds.rows,
            preparationCourses: preparationCourses.rows, 
            preparationBooks: preparationBooks.rows, 
            upcomingExams: upcomingExams.rows, 
            ...settingsObject,
        };

        if (req.session.isAdmin) {
            const subscribers = await connection.query('SELECT * FROM Subscriber ORDER BY subscriptionDate DESC');
            const activityLogs = await connection.query('SELECT * FROM ActivityLog ORDER BY timestamp DESC');
            const contacts = await connection.query('SELECT * FROM ContactSubmission ORDER BY submittedAt DESC');
            const emailNotifications = await connection.query('SELECT * FROM EmailNotification ORDER BY sentAt DESC');
            const customEmails = await connection.query('SELECT * FROM CustomEmail ORDER BY sentAt DESC');
            const emailTemplates = await connection.query('SELECT * FROM EmailTemplate ORDER BY name ASC');
            
            res.status(200).json({
                ...publicData,
                subscribers: subscribers.rows, 
                activityLogs: activityLogs.rows, 
                contacts: contacts.rows, 
                emailNotifications: emailNotifications.rows, 
                customEmails: customEmails.rows, 
                emailTemplates: emailTemplates.rows,
            });
        } else {
            res.status(200).json({
                ...publicData,
                subscribers: [], activityLogs: [], contacts: [],
                emailNotifications: [], customEmails: [], emailTemplates: [],
            });
        }
    } catch (error) {
        next(error);
    }
});

// GET /api/health - A simple health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// GET /api/robots - Serve the robots.txt content dynamically
router.get('/robots', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseURL = `${protocol}://${host}`;

    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${baseURL}/sitemap.xml

Disallow: /admin
Disallow: /api`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robotsContent);
});

// GET /api/sitemap - Dynamically generate the sitemap.xml
const generateSitemap = (pages) => {
    const urls = pages.map(({ url, lastModified }) => `
        <url>
            <loc>${url}</loc>
            ${lastModified ? `<lastmod>${lastModified}</lastmod>` : ''}
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
    `).join('');
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
};

router.get('/sitemap', async (req, res, next) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const baseURL = `${protocol}://${host}`;

        const jobs = await req.db.query(`SELECT title, createdAt FROM Job WHERE status != 'expired'`);
        const posts = await req.db.query(`SELECT id, createdAt FROM ContentPost WHERE status = 'published' AND type = 'posts'`);

        const jobPages = jobs.rows.map(job => ({
            url: `${baseURL}/job/${slugify(job.title)}`,
            lastModified: new Date(job.createdAt).toISOString(),
        }));
        
        const postPages = posts.rows.map(post => ({
            url: `${baseURL}/blog/${post.id}`,
            lastModified: new Date(post.createdAt).toISOString(),
        }));
        
        const staticPages = ['/', '/blog', '/preparation', '/about', '/contact', '/privacy', '/terms', '/disclaimer']
            .map(path => ({ url: `${baseURL}${path}` }));
        
        const allPages = [...staticPages, ...jobPages, ...postPages];
        const sitemap = generateSitemap(allPages);

        res.setHeader('Content-Type', 'text/xml');
        res.status(200).send(sitemap);
    } catch (error) {
        next(error);
    }
});

export default router;
