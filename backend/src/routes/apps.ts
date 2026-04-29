import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { serverError, notFoundError } from '../utils/errorFormat';

const router = express.Router();
const prisma = new PrismaClient();

const defaultConfig = {
  settings: {
    app_name: 'My App',
    theme: 'light',
    default_language: 'en',
    icon: 'Layers',
    color: '#6366F1',
  },
  localization: {
    en: {
      app_name: 'My App',
      dashboard: 'Dashboard',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      search: 'Search',
      no_data: 'No data found',
      loading: 'Loading...',
      notifications: 'Notifications',
      config_editor: 'Config Editor',
    },
  },
  entities: [
    {
      name: 'items',
      display_name: 'Items',
      icon: 'List',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          placeholder: 'Enter title',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Enter description',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          default_value: 'active',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
      ],
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
  ],
  pages: [
    {
      type: 'table',
      title: 'Items',
      entity: 'items',
      columns: ['title', 'description', 'status'],
      filters: ['status'],
      actions: ['create', 'edit', 'delete'],
    },
  ],
  dashboard: [
    {
      type: 'stat',
      title: 'Total Items',
      entity: 'items',
      aggregation: 'count',
      icon: 'List',
      span: 1,
    },
    {
      type: 'recent',
      title: 'Recent Items',
      entity: 'items',
      limit: 5,
      span: 2,
    },
  ],
};

router.use(authenticateToken);

router.get('/', async (req: any, res) => {
  const apps = await prisma.app.findMany({ where: { userId: req.user.id } });
  res.json(apps);
});

router.post('/', async (req: any, res) => {
  const { name, description, icon, color, config } = req.body;
  const finalConfig = typeof config === 'object' && config !== null ? config : defaultConfig;

  try {
    const app = await prisma.app.create({
      data: {
        name,
        description,
        icon: icon || finalConfig.settings.icon || 'Layers',
        color: color || finalConfig.settings.color || '#6366F1',
        userId: req.user.id,
        config: JSON.stringify(finalConfig),
      },
    });
    res.json(app);
  } catch (error) {
    res.status(500).json(serverError(error, 'Failed to create app'));
  }
});

router.delete('/:appId', async (req: any, res) => {
  const { appId } = req.params;
  const app = await prisma.app.findFirst({ where: { id: appId, userId: req.user.id } });
  if (!app) return res.status(404).json(notFoundError('App'));
  await prisma.app.delete({ where: { id: appId } });
  res.json({ success: true });
});

router.post('/:appId/export/github', async (req: any, res) => {
  const { appId } = req.params;
  const { username, repo, token, filePath } = req.body;

  const app = await prisma.app.findFirst({ where: { id: appId, userId: req.user.id } });
  if (!app) return res.status(404).json(notFoundError('App'));

  try {
    const config = JSON.parse(app.config);
    const content = Buffer.from(JSON.stringify(config, null, 2)).toString('base64');

    // Check if file exists to get SHA for update
    let sha;
    try {
      const existingFile = await axios.get(
        `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
        { headers: { Authorization: `token ${token}` } }
      );
      sha = existingFile.data.sha;
    } catch (err) {
      // File doesn't exist, sha remains undefined for create
    }

    const payload = {
      message: 'Export config from AppGen',
      content,
      ...(sha && { sha }),
    };

    await axios.put(
      `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
      payload,
      { headers: { Authorization: `token ${token}` } }
    );

    res.json({
      success: true,
      url: `github.com/${username}/${repo}/blob/main/${filePath}`,
    });
  } catch (error) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || 'GitHub API error'
      : 'GitHub API error';
    res.status(400).json(serverError(error, `GitHub export failed: ${errorMessage}`));
  }
});

export default router;