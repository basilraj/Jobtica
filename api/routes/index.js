import { Router } from 'express';

// Import all the modular routers
import authRouter from './auth.js';
import contentRouter from './content.js';
import audienceRouter from './audience.js';
import marketingRouter from './marketing.js';
import preparationRouter from './preparation.js';
import systemRouter from './system.js';
import coreRouter from './core.js'; // This contains /data, /sitemap, etc.

const router = Router();

// Mount the routers on their respective paths
router.use('/auth', authRouter);
router.use('/content', contentRouter);
router.use('/audience', audienceRouter);
router.use('/marketing', marketingRouter);
router.use('/preparation', preparationRouter);
router.use('/system', systemRouter);

// Mount the core router at the base.
// This should come last to ensure specific routes are matched first.
router.use(coreRouter);

export default router;
