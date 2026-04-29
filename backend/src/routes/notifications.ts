import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const getAppForUser = async (appId: string, userId: string) => {
  return prisma.app.findFirst({ where: { id: appId, userId } });
};

router.use(authenticateToken);

router.get('/:appId/notifications', async (req: any, res) => {
  const { appId } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const notifications = await prisma.notification.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' },
  });

  const unreadCount = await prisma.notification.count({
    where: { appId, read: false },
  });

  res.json({ notifications, unreadCount });
});

router.put('/:appId/notifications/read', async (req: any, res) => {
  const { appId } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  await prisma.notification.updateMany({ where: { appId, read: false }, data: { read: true } });
  res.json({ success: true });
});

export default router;
