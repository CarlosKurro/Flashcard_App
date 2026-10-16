import https from 'https';

const postData = JSON.stringify({ dict: 'javi', type: 'word', query: '白い', page: 1 });
const options = {
  hostname: 'mazii.net',
  path: '/api/search',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
  }
};

const req = https.request(options, (res) => {
  console.log('OPTIONS status:', res.statusCode);
  console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
  console.log('All headers:', res.headers);
});
req.end();
