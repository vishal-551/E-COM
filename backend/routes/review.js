import express from 'express';

const router = express.Router();

router.get('/', (_, res) => {
  res.json({ message: 'Review routes ready for extension' });
});

export default router;
