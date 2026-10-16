// 여러 /api 함수가 같이 쓰는 도구 (밑줄로 시작하는 파일은 Vercel이 주소로 열지 않는다)
const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const clip = (v, n) => String(v ?? '').trim().slice(0, n);

const sbHeaders = () => ({
  apikey: SB_KEY,
  ...(String(SB_KEY).startsWith('eyJ') ? { Authorization: `Bearer ${SB_KEY}` } : {}),
  'Content-Type': 'application/json',
});

const readBody = (req) => {
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  return b;
};

module.exports = { SB_URL, SB_KEY, clip, sbHeaders, readBody };
