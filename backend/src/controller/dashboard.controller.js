import pool from '../DB/index.js';

export async function getLogs(req, res) {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT * FROM interactions
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const count = await pool.query('SELECT COUNT(*) FROM interactions');

  res.json({
    logs:  result.rows,
    total: parseInt(count.rows[0].count),
    page,
    pages: Math.ceil(count.rows[0].count / limit),
  });
}

export async function getStats(req, res) {
  const total     = await pool.query('SELECT COUNT(*) FROM interactions');
  const mirrored  = await pool.query('SELECT COUNT(*) FROM interactions WHERE mirrored = true');
  const byCommand = await pool.query(
    'SELECT command, COUNT(*) as count FROM interactions GROUP BY command ORDER BY count DESC'
  );

  res.json({
    total:     parseInt(total.rows[0].count),
    mirrored:  parseInt(mirrored.rows[0].count),
    byCommand: byCommand.rows,
  });
}
