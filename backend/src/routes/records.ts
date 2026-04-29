import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { serverError, notFoundError, csvImportError } from '../utils/errorFormat';

const router = express.Router();
const prisma = new PrismaClient();

const getAppForUser = async (appId: string, userId: string) => {
  return prisma.app.findFirst({ where: { id: appId, userId } });
};

const parseRecord = (record: any) => {
  let parsedData = {};
  try {
    parsedData = JSON.parse(record.data || '{}');
  } catch (err) {
    parsedData = {};
  }
  return { ...record, data: parsedData };
};

router.use(authenticateToken);

router.get('/:appId/records/:entity', async (req: any, res) => {
  const { appId, entity } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json(notFoundError('App'));

  const search = String(req.query.search || '').trim().toLowerCase();
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const filters: Record<string, string> = {};
  Object.keys(req.query).forEach((key) => {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const field = key.slice(7, -1);
      filters[field] = String(req.query[key]);
    }
  });

  const allRecords = await prisma.record.findMany({ where: { appId, entity } });
  const parsedRecords = allRecords.map(parseRecord);

  const filteredRecords = parsedRecords.filter((record) => {
    const data = record.data || {};
    let matches = true;

    if (search) {
      const textMatch = Object.values(data).some((value) => {
        if (typeof value !== 'string') return false;
        return value.toLowerCase().includes(search);
      });
      matches = matches && textMatch;
    }

    Object.entries(filters).forEach(([field, value]) => {
      const recordValue = data[field];
      if (recordValue === undefined || String(recordValue) !== String(value)) {
        matches = false;
      }
    });

    return matches;
  });

  const total = filteredRecords.length;
  const start = (page - 1) * limit;
  const paged = filteredRecords.slice(start, start + limit);

  res.json({ records: paged, total, page, limit });
});

router.post('/:appId/records/:entity', async (req: any, res) => {
  const { appId, entity } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const data = req.body || {};

  try {
    const created = await prisma.record.create({
      data: {
        appId,
        entity,
        data: JSON.stringify(data),
      },
    });

    await prisma.notification.create({
      data: {
        appId,
        message: `New ${entity} record created`,
        type: 'record_created',
      },
    });

    res.json(parseRecord(created));
  } catch (error) {
    res.status(500).json(serverError(error, `Failed to create ${entity} record`));
  }
});

router.put('/:appId/records/:entity/:recordId', async (req: any, res) => {
  const { appId, entity, recordId } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json(notFoundError('App'));

  const record = await prisma.record.findFirst({ where: { id: recordId, appId, entity } });
  if (!record) return res.status(404).json(notFoundError('Record'));

  const data = req.body || {};

  try {
    const updated = await prisma.record.update({
      where: { id: recordId },
      data: { data: JSON.stringify(data) },
    });
    res.json(parseRecord(updated));
  } catch (error) {
    res.status(500).json(serverError(error, `Failed to update ${entity} record`));
  }
});

router.delete('/:appId/records/:entity/:recordId', async (req: any, res) => {
  const { appId, entity, recordId } = req.params;
  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json(notFoundError('App'));

  const record = await prisma.record.findFirst({ where: { id: recordId, appId, entity } });
  if (!record) return res.status(404).json(notFoundError('Record'));

  await prisma.record.delete({ where: { id: recordId } });
  await prisma.notification.create({
    data: {
      appId,
      message: `A ${entity} record was deleted`,
      type: 'record_deleted',
    },
  });
  res.json({ success: true });
});

router.post('/:appId/records/:entity/import', async (req: any, res) => {
  const { appId, entity } = req.params;
  const { records } = req.body;

  const app = await getAppForUser(appId, req.user.id);
  if (!app) return res.status(404).json(notFoundError('App'));

  if (!Array.isArray(records)) {
    return res.status(400).json(csvImportError('Records must be an array'));
  }

  const results = [];
  let imported = 0;
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const recordData = records[i];
      if (!recordData.data || typeof recordData.data !== 'object') {
        errors.push({ row: i + 1, message: 'Invalid record data' });
        continue;
      }

      await prisma.record.create({
        data: {
          appId,
          entity,
          data: JSON.stringify(recordData.data),
        },
      });
      imported++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import error';
      errors.push({ row: i + 1, message });
    }
  }

  await prisma.notification.create({
    data: {
      appId,
      message: `Imported ${imported} ${entity} records`,
      type: 'records_imported',
    },
  });

  res.json({ imported, errors });
});

export default router;
