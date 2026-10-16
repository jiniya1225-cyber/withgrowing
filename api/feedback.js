// QR로 들어온 참여자 소감 받기 (공개는 관리자가 승인해야만 된다)
const { SB_URL, SB_KEY, clip, sbHeaders, readBody } = require('./_lib');

const TOPICS = ['멘탈코칭', '기업가정신', '진로', '사회정서', '역량(부모교육)', '기타'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 가능해요' });
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: 'Supabase 연결 정보가 없어요.' });
  const b = readBody(req);
  if (b.website) return res.status(200).json({ ok: true }); // 스팸 함정 칸
  const row = {
    topic: TOPICS.includes(b.topic) ? b.topic : '기타',
    message: clip(b.message, 1000),
    display_name: clip(b.display_name, 30),
    public_ok: b.public_ok === true,
  };
  if (!row.message) return res.status(400).json({ error: '소감을 적어 주세요' });
  const r = await fetch(`${SB_URL}/rest/v1/feedback`, { method: 'POST', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row) });
  if (!r.ok) return res.status(500).json({ error: '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
  return res.status(200).json({ ok: true });
};
