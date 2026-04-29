import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const getAppForUser = async (appId: string, userId: string) => {
  return prisma.app.findFirst({ where: { id: appId, userId } });
};

router.get('/:appId/config', async (req: any, res) => {
  const { appId } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  try {
    const config = JSON.parse(app.config || '{}');
    res.json({ config });
  } catch (error) {
    res.json({ config: {} });
  }
});

router.put('/:appId/config', async (req: any, res) => {
  const { appId } = req.params;
  const { config } = req.body;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  if (typeof config !== 'object' || config === null) {
    return res.status(400).json({ error: 'Config must be a valid object' });
  }

  try {
    const configString = JSON.stringify(config);
    await prisma.notification.create({
      data: {
        appId,
        message: 'Configuration was updated',
        type: 'config_updated',
      },
    });
    await prisma.app.update({ where: { id: appId }, data: { config: configString } });
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ error: 'Unable to save config' });
  }
});

export default router;
