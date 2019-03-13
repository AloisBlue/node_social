import express from "express";

const router = express.Router();

router.get('/test', (req, res) => {
  return res.json({ message: 'Success' });
});

export default router;
