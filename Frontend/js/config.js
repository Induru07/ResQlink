// Simple environment-aware API base selector
(function(){
  var host = window.location.host || '';
  var isProd = /resqlink\.org$|resqlink\.com$/i.test(host);
  window.API_BASE = isProd ? 'https://api.resqlink.org' : 'http://localhost:5000';
})();
