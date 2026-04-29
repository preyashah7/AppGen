import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateConfig, detectMigrations } from '../utils/configValidator';
import { validationError, serverError, notFoundError } from '../utils/errorFormat';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const getAppForUser = async (appId: string, userId: string) => {
  return prisma.app.findFirst({ where: { id: appId, userId } });
};

router.get('/:appId/config', async (req: any, res) => {
  const { appId } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json(notFoundError('App'));

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
  if (!app) return res.status(404).json(notFoundError('App'));

  // Validate config schema
  const errors = validateConfig(config);
  if (errors.length > 0) {
    return res.status(400).json(validationError(errors));
  }

  try {
    const oldConfig = app.config ? JSON.parse(app.config) : {};
    const migrations = detectMigrations(oldConfig, config);

    const configString = JSON.stringify(config);
    await prisma.notification.create({
      data: {
        appId,
        message: `Configuration was updated${migrations.length > 0 ? ` with ${migrations.length} migration(s)` : ''}`,
        type: 'config_updated',
      },
    });
    await prisma.app.update({ where: { id: appId }, data: { config: configString } });
    res.json({ success: true, config, migrations });
  } catch (error) {
    res.status(500).json(serverError(error, 'Failed to save config'));
  }
});

export default router;
