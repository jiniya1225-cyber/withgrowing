-- WithGrowing 표 두 개 (문의함 · 소감함)
-- 보통은 클로드가 자동으로 만든다. 막혔을 때만 Supabase SQL Editor에 붙여 넣고 Run.

create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  inquiry_type text,
  preferred_date text,
  message text,
  consent boolean not null default false,
  status text not null default '문의' check (status in ('문의', '협의', '확정')),
  updated_at timestamptz
);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  topic text,
  message text not null,
  display_name text,
  public_ok boolean not null default false,
  approved boolean not null default false,
  approved_at timestamptz
);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
-- 정책은 만들지 않는다: 브라우저(공개 키)로는 접근 불가, 서버(/api)만 접근
