// Environment-aware API base selector (supports Render + custom domains)
(function(){
  var host = window.location.hostname || '';
  var renderApi = 'https://resqlink-ovm6.onrender.com';
  var isRenderFront = /resqlink-1-dt40\.onrender\.com$/i.test(host);
  var isCustomDomain = /resqlink\.org$|resqlink\.com$/i.test(host);
  var isAnyRender = /onrender\.com$/i.test(host);
  
  // Use Render API by default (even for local development)
  // Change USE_LOCAL to true if you want to use local backend
  var USE_LOCAL = true;  // Set to true for local backend testing
  var isProd = isCustomDomain || isAnyRender || !USE_LOCAL;
  
  window.API_BASE = isProd ? renderApi : 'http://localhost:5000';
  console.log('API Base URL:', window.API_BASE);
})();
