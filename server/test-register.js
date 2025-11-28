(async function(){
  try{
    const resp = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userName: 'cli-test', email: `cli-test-${Date.now()}@example.com`, password: 'password123' }),
    });
    const data = await resp.text();
    console.log('HTTP', resp.status);
    console.log(data);
  }catch(err){
    console.error('ERR', err.message || err);
  }
})();