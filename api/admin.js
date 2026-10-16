// 관리자: 비밀번호 확인 + 문의함(상태 관리) + 소감함(공개 승인)
const crypto = require('node:crypto');
const { SB_URL, SB_KEY, sbHeaders, readBody } = require('./_lib');

const same = (a, b) => {
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
};
const STATUSES = ['문의', '협의', '확정'];

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return res.status(500).json({ error: 'Vercel 환경변수에 ADMIN_PASSWORD를 넣고 Redeploy 해 주세요.' });
  if (!same(req.headers['x-admin-password'] || '', pass)) return res.status(401).json({ error: '비밀번호가 맞지 않아요.' });
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: 'Supabase 연결 정보가 없어요.' });

  if (req.method === 'GET') {
    const table = req.query && req.query.view === 'feedback' ? 'feedback' : 'inquiries';
    const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*&order=created_at.desc&limit=500`, { headers: sbHeaders() });
    if (!r.ok) return res.status(500).json({ error: '불러오지 못했어요.' });
    return res.status(200).json({ rows: await r.json() });
  }

  if (req.method === 'PATCH') {
    const b = readBody(req);
    const id = Number(b.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: '잘못된 요청이에요.' });

    let url, patch;
    if (b.kind === 'feedback') {
      if (typeof b.approved !== 'boolean') return res.status(400).json({ error: '잘못된 요청이에요.' });
      // 참여자가 공개에 동의한 소감만 승인할 수 있다
      url = `${SB_URL}/rest/v1/feedback?id=eq.${id}${b.approved ? '&public_ok=eq.true' : ''}`;
      patch = { approved: b.approved, approved_at: b.approved ? new Date().toISOString() : null };
    } else {
      if (!STATUSES.includes(b.status)) return res.status(400).json({ error: '잘못된 요청이에요.' });
      url = `${SB_URL}/rest/v1/inquiries?id=eq.${id}`;
      patch = { status: b.status, updated_at: new Date().toISOString() };
    }
    const r = await fetch(url, { method: 'PATCH', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
    if (!r.ok) return res.status(500).json({ error: '바꾸지 못했어요.' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: '지원하지 않는 요청이에요.' });
};
