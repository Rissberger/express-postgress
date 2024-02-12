const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT id, comp_code FROM invoices');
        return res.json({ invoices: results.rows });
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description 
            FROM invoices i
            JOIN companies c ON i.comp_code = c.code
            WHERE i.id = $1`, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const invoice = result.rows[0];
        invoice.company = { code: invoice.comp_code, name: invoice.name, description: invoice.description };
        delete invoice.name;
        delete invoice.description;

        return res.json({ invoice });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        const currentInvoice = await db.query('SELECT paid, paid_date FROM invoices WHERE id = $1', [id]);

        if (currentInvoice.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        let paidDate = currentInvoice.rows[0].paid_date;

        if (paid && !currentInvoice.rows[0].paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } 

        const result = await db.query(
            'UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [amt, paid, paidDate, id]
        );

        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});


router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
