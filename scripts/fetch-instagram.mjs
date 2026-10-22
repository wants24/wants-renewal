/* =========================================================
   인스타그램 최신 게시물 → data/instagram.json + img/instagram/ 썸네일
   - GitHub Actions(.github/workflows/update-instagram.yml)에서 하루 2번 실행 · 로컬 실행 : node scripts/fetch-instagram.mjs
   - Behold JSON 피드 (무료 요금제 월 1,200회 조회 제한) 를 사이트가 직접 부르지 않도록 여기서만 조회
   - 피드 구조 (실제 응답으로 확인) : posts[] → id · permalink · mediaType · caption · sizes.{small,medium,large,full}.mediaUrl
   - 최신 6개 썸네일은 sizes.medium(560×700) 을 받아 img/instagram/<게시물 ID>.<확장자> 로 저장 (이미 있으면 다시 받지 않음)
   - 목록이 바뀌었을 때만 파일을 씀 / 피드를 못 불러오거나 게시물이 0개면 기존 파일 유지
   ========================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FEED_URL = 'https://feeds.behold.so/tfcsckEzJw8QLJZc3LeH';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = path.join(ROOT, 'data', 'instagram.json');
const IMG_DIR = path.join(ROOT, 'img', 'instagram');
const COUNT = 6;
const CAPTION_LEN = 30;

// mediaType → 화면 표시 종류 (VIDEO · IMAGE 는 인스타그램 API 표준값, 그 밖의 값은 사진으로 취급)
const TYPES = { VIDEO: 'video', CAROUSEL_ALBUM: 'carousel', IMAGE: 'image' };
const EXT = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };

const fail = (msg) => {
  // 기존 data/instagram.json · 썸네일은 그대로 두고 경고만 남김 (워크플로는 성공으로 끝나고 커밋되지 않음)
  console.log('::warning::인스타그램 업데이트 건너뜀 - ' + msg);
  process.exit(0);
};

// 캡션 앞부분 : 해시태그 기호(#)만 지우고 줄바꿈·공백 정리 후 30자
// (인스타그램은 '#광고 에' 처럼 해시태그 뒤를 띄워 쓰므로, 해시태그 바로 뒤 조사 앞 공백은 붙임 → '광고에')
const PARTICLE = '(?:에서|에게|으로|까지|부터|처럼|보다|들은|들이|들을|들의|들|의|을|를|이|가|에|은|는|도|와|과|로|만)';
const shortCaption = (text) => {
  const clean = String(text || '')
    .replace(new RegExp('#([^\\s#]+)[ \\t]+(?=' + PARTICLE + '(?![가-힣]))', 'g'), '$1')
    .replace(/#/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = Array.from(clean); // 이모지가 반으로 잘리지 않도록 글자 단위
  return chars.length > CAPTION_LEN ? chars.slice(0, CAPTION_LEN).join('').trim() + '…' : clean;
};

let feed;
try {
  const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) fail('HTTP ' + res.status);
  feed = await res.json();
} catch (err) {
  fail(err.message);
}

const posts = (Array.isArray(feed && feed.posts) ? feed.posts : [])
  .filter((p) => p && p.id && p.permalink && (!p.visibility || p.visibility === 'visible'))
  .slice(0, COUNT);
if (!posts.length) fail('게시물 0개');

fs.mkdirSync(IMG_DIR, { recursive: true });
const existing = fs.readdirSync(IMG_DIR);

const items = [];
for (const p of posts) {
  const id = String(p.id).replace(/[^\w-]/g, '');
  const sizes = p.sizes || {};
  const src = (sizes.medium || sizes.large || sizes.small || {}).mediaUrl;
  let file = existing.find((f) => f.startsWith(id + '.')); // 같은 게시물 썸네일은 다시 받지 않음
  if (!file) {
    if (!src) { console.log('썸네일 주소 없음 - 건너뜀 : ' + p.permalink); continue; }
    try {
      const res = await fetch(src, { signal: AbortSignal.timeout(20000) });
      const ext = EXT[(res.headers.get('content-type') || '').split(';')[0].trim()];
      if (!res.ok || !ext) throw new Error('HTTP ' + res.status + ' ' + res.headers.get('content-type'));
      file = id + '.' + ext;
      fs.writeFileSync(path.join(IMG_DIR, file), Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      console.log('썸네일 받기 실패 - 건너뜀 : ' + p.permalink + ' (' + err.message + ')');
      continue;
    }
  }
  items.push({
    id,
    link: p.permalink,
    type: TYPES[p.mediaType] || 'image',
    caption: shortCaption(p.caption),
    thumb: 'img/instagram/' + file
  });
}
if (!items.length) fail('썸네일을 하나도 받지 못함');

// 목록에 없는 예전 썸네일 삭제 (새 목록이 확정된 뒤에만)
const keep = new Set(items.map((it) => path.basename(it.thumb)));
fs.readdirSync(IMG_DIR).forEach((f) => {
  if (!keep.has(f)) {
    fs.unlinkSync(path.join(IMG_DIR, f));
    console.log('예전 썸네일 삭제 : ' + f);
  }
});

let prev = null;
try { prev = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')); } catch (err) { prev = null; }
if (prev && JSON.stringify(prev.items) === JSON.stringify(items)) {
  console.log('변경 없음 - 최신 게시물 동일');
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify({ updatedAt: new Date().toISOString(), account: 'https://www.instagram.com/wants_marketing/', items }, null, 2) + '\n');
console.log('instagram.json 업데이트 : ' + items.map((it) => it.type + ' ' + it.id).join(' / '));
