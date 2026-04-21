export default async function (req, res) {
  try {
    // Try to dynamically import the backend logic so we can catch any initialization errors
    const serverModule = await import('../server/server.js');
    const handler = serverModule.default;
    
    if (typeof handler !== 'function') {
      throw new Error('Backend handler is not a function. Check server/server.js default export.');
    }
    
    // Execute the handler
    return await handler(req, res);
  } catch (error) {
    console.error('VERCEL_API_CRASH:', error);
    
    // Return the error details to the browser so we can diagnose the issue
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Backend Execution Failed',
      message: error.message,
      stack: error.stack,
      hint: 'This is usually caused by a missing environment variable or a database connection timeout.'
    }));
  }
}
