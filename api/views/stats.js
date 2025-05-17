import express from 'express';
import { getCounts } from '../controllers/stats.js';

const router = express.Router();

router.get('/counts', getCounts);

export default router;