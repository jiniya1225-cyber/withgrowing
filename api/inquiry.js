// 강의·코칭 문의 받기
const { SB_URL, SB_KEY, clip, sbHeaders, readBody } = require('./_lib');

const TYPES = ['멘탈코칭', '기업가정신', '진로', '사회정서', '역량(부모교육)', '기타'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 가능해요' });
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: 'Supabase 연결 정보가 없어요. Vercel Storage 연결 후 다시 배포해 주세요.' });
  const b = readBody(req);
  if (b.website) return res.status(200).json({ ok: true }); // 스팸 함정 칸(사람에게는 안 보임)
  const row = {
    name: clip(b.name, 50),
    contact: clip(b.contact, 100),
    inquiry_type: TYPES.includes(b.inquiry_type) ? b.inquiry_type : '기타',
    preferred_date: clip(b.preferred_date, 100),
    message: clip(b.message, 1000),
    consent: b.consent === true,
  };
  if (!row.name || !row.contact) return res.status(400).json({ error: '이름과 연락처를 적어 주세요' });
  if (!row.consent) return res.status(400).json({ error: '개인정보 수집·이용에 동의해 주세요' });
  const r = await fetch(`${SB_URL}/rest/v1/inquiries`, { method: 'POST', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row) });
  if (!r.ok) return res.status(500).json({ error: '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
  return res.status(200).json({ ok: true });
};
