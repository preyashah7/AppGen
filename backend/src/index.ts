import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import appRoutes from './routes/apps';
import configRoutes from './routes/config';
import recordRoutes from './routes/records';
import notificationRoutes from './routes/notifications';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/apps', configRoutes);
app.use('/api/apps', recordRoutes);
app.use('/api/apps', notificationRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});