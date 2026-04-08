import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true, message: 'Aarohi backend ready' }));

const modules = ['auth','products','categories','orders','users','reviews','contact','banners','coupons','settings'];
modules.forEach((m) => app.use(`/api/${m}`, (_, res) => res.json({ module: m, message: 'Route scaffold ready' })));

app.listen(5000, () => console.log('Backend ready on :5000'));
