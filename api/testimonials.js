// 메인 화면에 보일 소감: 참여자가 공개에 동의했고, 관리자가 승인한 것만
const { SB_URL, SB_KEY, sbHeaders } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET만 가능해요' });
  if (!SB_URL || !SB_KEY) return res.status(200).json({ rows: [] });
  const r = await fetch(
    `${SB_URL}/rest/v1/feedback?select=topic,message,display_name&public_ok=eq.true&approved=eq.true&order=approved_at.desc&limit=12`,
    { headers: sbHeaders() },
  );
  if (!r.ok) return res.status(200).json({ rows: [] });
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ rows: await r.json() });
};
