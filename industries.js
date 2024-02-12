const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.post('/', async (req, res, next) => {
    try {
        const { industry } = req.body;
        const result = await db.query('INSERT INTO industries (industry) VALUES ($1) RETURNING code, industry', [industry]);
        return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT i.industry, ARRAY_AGG(c.code) AS companies
            FROM industries i
            LEFT JOIN company_industries ci ON i.code = ci.ind_code
            LEFT JOIN companies c ON ci.comp_code = c.code
            GROUP BY i.industry`);
        return res.json({ industries: results.rows });
    } catch (err) {
        return next(err);
    }
});

router.post('/:code/companies', async (req, res, next) => {
    try {
        const { code } = req.params; // Industry code
        const { comp_code } = req.body; // Company code
        await db.query('INSERT INTO company_industries (comp_code, ind_code) VALUES ($1, $2)', [comp_code, code]);
        return res.status(201).json({ message: "Industry associated with company successfully" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
