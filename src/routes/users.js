// imports
import express from "express";

const router = express.Router();

router.get('/test', (req, res) => res.json({ name: "Alois" }));

export default router;
