// ===== 코치님이 직접 바꾸는 곳 =====
// 주소를 넣으면 버튼·링크가 나타나고, 비워 두면 숨겨집니다.
const LINKS = {
  kakao: '',      // 카카오톡 채널 주소 (예: https://pf.kakao.com/_xxxx)
  blog: '',       // 네이버 블로그
  instagram: '',  // 인스타그램
  brunch: '',     // 브런치
};

// 강의 현장 사진: images 폴더에 넣고 파일 이름을 적으면 검은 사진 자리에 들어갑니다.
// 학생 얼굴이 잘 보이지 않거나 동의받은 사진만 써 주세요.
const PHOTOS = {
  hero: '',     // 첫 화면 오른쪽 (예: '/images/hero.jpg')
  school: '',   // 학교와 청소년
  athlete: '',  // 운동선수와 운동부
  org: '',      // 기관·기업과 청년
  parent: '',   // 학부모
  about1: '',   // 코치 소개 큰 사진
  about2: '',   // 코치 소개 작은 사진
};

// 강의 다섯 주제 (코치님이 준 내용 그대로, 빈칸은 "협의")
const PROGRAMS = [
  {
    topic: '멘탈코칭',
    title: '자신감 UP! 스위치 ON! / 선수 멘탈코칭',
    target: '중·고등학생, 학생선수',
    time: '6회기',
    method: '실패 콘테스트, 팀 빌딩, 1:1·그룹 코칭',
  },
  {
    topic: '기업가정신',
    title: '청소년 창업·ESG 교육',
    target: '초~고등학생',
    time: '협의',
    method: '디자인씽킹, 프로젝트 활동',
  },
  {
    topic: '진로',
    title: '진로 코칭 / 세특 진로 멘토링',
    target: '초등 저학년~고등, 청년, 선수',
    time: '협의',
    method: '다중지능 활동, 진로 멘토링',
  },
  {
    topic: '사회정서',
    title: '마인드 오아시스 / Interview ME',
    target: '청소년, 청년, 성인',
    time: 'Interview ME 6주',
    method: '자기발견 워크숍, 에니어그램',
  },
  {
    topic: '역량',
    title: '하브루타 부모교육',
    target: '학부모',
    time: '8회기 × 2시간',
    method: '질문·대화 중심 실습',
  },
];
// ===== 여기까지 =====

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 강의 둘러보기: 다섯 주제를 모두 펼쳐 보여 준다
(function programs() {
  const list = document.getElementById('program-list');
  list.innerHTML = PROGRAMS.map((p) => `
    <article class="program">
      <h3>${esc(p.topic)}</h3>
      <div>
        <p class="title">${esc(p.title)}</p>
        <dl>
          <dt>대상</dt><dd>${esc(p.target)}</dd>
          <dt>시간</dt><dd>${esc(p.time)}</dd>
          <dt>진행 방식</dt><dd>${esc(p.method)}</dd>
        </dl>
        <a class="link" href="#contact" data-topic="${esc(p.topic)}">${esc(p.topic)} 강의 문의하기</a>
      </div>
    </article>`).join('');

  // 주제별 문의 링크를 누르면 문의 종류를 미리 골라 둔다
  list.addEventListener('click', (e) => {
    const a = e.target.closest('[data-topic]');
    if (!a) return;
    const sel = document.getElementById('f-type');
    const opt = [...sel.options].find((o) => o.value.startsWith(a.dataset.topic));
    if (opt) sel.value = opt.value;
  });
})();

// 사진이 있으면 검은 사진 자리에 넣는다
(function photos() {
  document.querySelectorAll('[data-photo]').forEach((slot) => {
    const src = PHOTOS[slot.dataset.photo];
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    slot.prepend(img);
    slot.querySelectorAll('.mark, .note').forEach((el) => { el.hidden = true; });
  });
})();

// 카카오톡 · SNS 링크
(function links() {
  if (LINKS.kakao) {
    document.getElementById('kakao-link').href = LINKS.kakao;
    document.getElementById('kakao-wrap').hidden = false;
  }
  const names = { blog: '블로그', instagram: '인스타그램', brunch: '브런치' };
  const items = Object.keys(names).filter((k) => LINKS[k]);
  if (items.length) {
    document.getElementById('social-list').innerHTML = items.map((k) => `<li><a href="${esc(LINKS[k])}" target="_blank" rel="noopener">${names[k]}</a></li>`).join('');
    document.getElementById('social').hidden = false;
  }
})();

// 공개 승인된 참여자 소감
(async function voices() {
  try {
    const r = await fetch('/api/testimonials');
    if (!r.ok) return;
    const { rows } = await r.json();
    if (!rows || !rows.length) return;
    document.getElementById('voice-list').innerHTML = rows.map((v) => `
      <figure class="voice">
        <blockquote>${esc(v.message).replace(/\n/g, '<br>')}</blockquote>
        <figcaption>${esc(v.display_name || '참여자')}, ${esc(v.topic || '')} 수업</figcaption>
      </figure>`).join('');
    document.getElementById('voices').hidden = false;
    document.querySelector('[data-voices-link]').hidden = false;
  } catch { /* 소감이 없으면 칸을 숨긴 채로 둔다 */ }
})();

// 문의 폼
(function inquiry() {
  const form = document.getElementById('inquiry-form');
  const msg = document.getElementById('form-msg');
  const btn = document.getElementById('form-submit');
  const say = (text, ok) => { msg.textContent = text; msg.className = `msg ${ok ? 'ok' : 'err'}`; msg.hidden = false; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = (id) => document.getElementById(id).value.trim();
    const data = {
      name: v('f-name'),
      contact: v('f-contact'),
      inquiry_type: v('f-type'),
      preferred_date: v('f-date'),
      message: v('f-msg'),
      website: v('f-website'),
      consent: document.getElementById('f-consent').checked,
    };
    if (!data.name || !data.contact) return say('이름과 연락처를 적어 주세요', false);
    if (!data.consent) return say('개인정보 수집·이용에 동의해 주세요', false);

    btn.disabled = true;
    btn.textContent = '보내는 중…';
    try {
      const r = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.');
      form.reset();
      say('문의가 접수됐어요. 확인 후 연락드릴게요.', true);
    } catch (err) {
      say(err.message || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.', false);
    } finally {
      btn.disabled = false;
      btn.textContent = '문의 보내기';
    }
  });

  // 문의 칸이 화면에 보이면 휴대폰 아래 고정 버튼을 숨긴다
  const cta = document.getElementById('mobile-cta');
  new IntersectionObserver(([en]) => { cta.hidden = en.isIntersecting; }, { threshold: 0.05 })
    .observe(document.getElementById('contact'));
})();
