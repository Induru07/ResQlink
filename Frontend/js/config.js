// Environment-aware API base selector (supports Render + custom domains)
(function(){
  var host = window.location.hostname || '';
  var renderApi = 'https://resqlink-ovm6.onrender.com';
  var isProd = /resqlink\.org$|resqlink\.com$/i.test(host) || /onrender\.com$/i.test(host);
  window.API_BASE = isProd ? renderApi : 'http://localhost:5000';
})();
  window.API_BASE = isProd ? renderApi : 'http://localhost:5000';
})();
