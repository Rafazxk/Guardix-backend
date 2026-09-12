import { Router } from 'express';
import WhatsAppController from '../controllers/WhatsappController.js';

const router = Router();

router.get('/webhook', WhatsAppController.verificarWebhook);

router.post('/webhook', WhatsAppController.receberWebhook);

export default router;