import https from 'https';

async function testMazii(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      dict: 'javi',
      type: 'word',
      query: query,
      page: 1
    });

    const options = {
      hostname: 'mazii.net',
      port: 443,
      path: '/api/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ error: 'Parse error', raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing Mazii API for "白い"...');
  const res1 = await testMazii('白い');
  console.log('Status:', res1.status);
  if (res1.data && res1.data.length > 0) {
    const item = res1.data[0];
    console.log('First result:');
    console.log('  Word:', item.word);
    console.log('  Phonetic (reading):', item.phonetic);
    console.log('  Short mean:', item.short_mean);
    console.log('  Means count:', item.means ? item.means.length : 0);
  }

  console.log('\nTesting Mazii API for "生"...');
  const res2 = await testMazii('生');
  if (res2.data && res2.data.length > 0) {
    res2.data.slice(0, 3).forEach((item, i) => {
      console.log(`  Result ${i+1}: word="${item.word}", reading="${item.phonetic}", mean="${item.short_mean}"`);
    });
  }

  console.log('\nTesting Mazii API for "都合がいい"...');
  const res3 = await testMazii('都合がいい');
  if (res3.data && res3.data.length > 0) {
    const item = res3.data[0];
    console.log(`  word="${item.word}", reading="${item.phonetic}", mean="${item.short_mean}"`);
  }

  console.log('\nTesting non-existent word "xyz123abc"...');
  const res4 = await testMazii('xyz123abc');
  console.log('Results count:', res4.data ? res4.data.length : 0);
}

run().catch(console.error);
