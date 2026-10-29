/* =========================================================
   WANTS Renewal - Google Analytics 4 (모든 페이지 head 에서 불러옴)
   - 측정 ID 는 아래 GA_ID 한 곳만 바꾸면 전 페이지에 적용됨
   - 자리표시자(G-XXXXXXXXXX)인 동안에는 gtag 를 불러오지 않고 아무것도 수집하지 않음
     (개인정보처리방침 개정 시행일에 실제 ID 입력 예정)
   - 이벤트
       · 전화 링크(tel:) 클릭     → click_phone
       · 이메일 링크(mailto:) 클릭 → click_email
       · 상담 신청 전송 성공       → generate_lead (js/main.js 에서 window.wantsTrack 호출)
   ========================================================= */
(function () {
  var GA_ID = 'G-XXXXXXXXXX';

  // 이벤트 전송 함수 : 측정 전에는 아무것도 하지 않음
  window.wantsTrack = function () {};
  if (!/^G-[A-Z0-9]+$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  window.wantsTrack = function (name, params) {
    window.gtag('event', name, params || {});
  };

  // 전화 · 이메일 링크 클릭 (페이지 어디에 있든 문서 단위로 감지)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    var href = a.getAttribute('href');
    var isTel = href.indexOf('tel:') === 0;
    window.wantsTrack(isTel ? 'click_phone' : 'click_email', {
      link_url: href,
      page_path: location.pathname
    });
  });
})();
