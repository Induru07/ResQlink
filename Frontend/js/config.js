// Environment-aware API base selector (supports Render + custom domains)
(function(){
  var host = window.location.hostname || '';
  var renderApi = 'https://resqlink-ovm6.onrender.com';
  var isRenderFront = /resqlink-1-dt40\.onrender\.com$/i.test(host);
  var isCustomDomain = /resqlink\.org$|resqlink\.com$/i.test(host);
  var isAnyRender = /onrender\.com$/i.test(host);
  var isProd = isCustomDomain || isAnyRender;
  window.API_BASE = isProd ? renderApi : 'http://localhost:5000';
})();
