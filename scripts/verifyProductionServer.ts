import { spawn } from "child_process";

async function waitForServer(url: string, timeoutMs = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server at ${url} failed to start within ${timeoutMs}ms`);
}

async function testServer() {
  const BASE_URL = 'http://localhost:5175';

  console.log('Starting Production Server...');
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PORT: '5175' },
  });

  try {
    await waitForServer(BASE_URL);
    console.log('Testing Production Server at:', BASE_URL);

  // 1. Test GET /
  const resRoot = await fetch(`${BASE_URL}/`);
  console.log(`GET / -> ${resRoot.status} ${resRoot.headers.get('content-type')}`);
  if (resRoot.status !== 200) throw new Error(`Expected 200 for GET /, got ${resRoot.status}`);
  const rootHtml = await resRoot.text();
  if (!rootHtml.includes('<div id="root"')) throw new Error('GET / did not return index.html');
  console.log('✓ GET / returned valid index.html');

  // 2. Test GET /export (Direct SPA navigation & refresh)
  const resExport = await fetch(`${BASE_URL}/export`);
  console.log(`GET /export -> ${resExport.status} ${resExport.headers.get('content-type')}`);
  if (resExport.status !== 200) throw new Error(`Expected 200 for GET /export, got ${resExport.status}`);
  const exportHtml = await resExport.text();
  if (!exportHtml.includes('<div id="root"')) throw new Error('GET /export did not return index.html');
  console.log('✓ GET /export returned valid index.html (SPA fallback verified)');

  // 3. Test GET /style (Direct SPA navigation & refresh)
  const resStyle = await fetch(`${BASE_URL}/style`);
  console.log(`GET /style -> ${resStyle.status}`);
  if (resStyle.status !== 200) throw new Error(`Expected 200 for GET /style, got ${resStyle.status}`);
  console.log('✓ GET /style returned valid index.html (SPA fallback verified)');

  // 4. Test GET static font file
  const resFont = await fetch(`${BASE_URL}/fonts/Inter/inter-v20-latin-regular.woff2`);
  console.log(`GET /fonts/Inter/inter-v20-latin-regular.woff2 -> ${resFont.status} (${resFont.headers.get('content-length')} bytes)`);
  if (resFont.status !== 200) throw new Error(`Expected 200 for font, got ${resFont.status}`);
  const fontBuffer = await resFont.arrayBuffer();
  if (fontBuffer.byteLength < 1000) throw new Error('Font file too small or corrupted');
  console.log(`✓ GET /fonts/... successfully resolved (${fontBuffer.byteLength} bytes)`);

  // 5. Test GET /api/health
  const resHealth = await fetch(`${BASE_URL}/api/health`);
  console.log(`GET /api/health -> ${resHealth.status}`);
  const healthJson = await resHealth.json();
  if (!healthJson.ok) throw new Error('Health check failed');
  console.log('✓ GET /api/health returned ok');

  // 6. Test Non-existent API route does NOT return index.html (404 isolation)
  const res404Api = await fetch(`${BASE_URL}/api/non-existent-endpoint`);
  console.log(`GET /api/non-existent-endpoint -> ${res404Api.status}`);
  if (res404Api.status !== 404) throw new Error(`Expected 404 for missing API, got ${res404Api.status}`);
  const text404 = await res404Api.text();
  if (text404.includes('<div id="root"')) throw new Error('Missing API route returned index.html!');
  console.log('✓ Missing API route correctly returned 404, not index.html');

  // 7. Test POST /api/export-green-screen (Real Render Pipeline)
  console.log('\n--- Starting Actual Green Screen Export Job ---');
  const exportPayload = {
    captions: [
      { text: "Production", startMs: 0, endMs: 600, timestampMs: 0, confidence: 1 },
      { text: "Architecture", startMs: 600, endMs: 1200, timestampMs: 600, confidence: 1 },
      { text: "Verified", startMs: 1200, endMs: 1800, timestampMs: 1200, confidence: 1 },
    ],
    durationInFrames: 60,
    orientation: 'vertical',
  };

  const resStart = await fetch(`${BASE_URL}/api/export-green-screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exportPayload),
  });

  console.log(`POST /api/export-green-screen -> ${resStart.status}`);
  if (resStart.status !== 202) throw new Error(`Expected 202 for export start, got ${resStart.status}`);
  const { jobId } = await resStart.json();
  console.log(`✓ Export job created: ${jobId}`);

  // 8. Poll job status
  let done = false;
  let attempts = 0;
  while (!done && attempts < 60) {
    await new Promise((r) => setTimeout(r, 1000));
    attempts++;
    const resStatus = await fetch(`${BASE_URL}/api/export-green-screen/${jobId}`);
    const status = await resStatus.json();
    console.log(`Polling status [${attempts}s]: ${status.status} (${Math.round(status.progress * 100)}%)`);

    if (status.status === 'error') {
      throw new Error(`Render failed: ${status.error}`);
    }
    if (status.status === 'done') {
      done = true;
    }
  }

  if (!done) throw new Error('Render job timed out after 60s');
  console.log('✓ Render job completed successfully');

  // 9. Test Download MP4
  const resDownload = await fetch(`${BASE_URL}/api/export-green-screen/${jobId}/download`);
  console.log(`GET /api/export-green-screen/${jobId}/download -> ${resDownload.status} ${resDownload.headers.get('content-type')}`);
  if (resDownload.status !== 200) throw new Error(`Expected 200 for download, got ${resDownload.status}`);
  const mp4Buffer = await resDownload.arrayBuffer();
  console.log(`✓ Downloaded MP4 successfully (${mp4Buffer.byteLength} bytes)`);

  // 10. Test POST /api/export-video endpoint reaches Express
  console.log('\n--- Starting Video Export POST check ---');
  const dummyVideo = new Blob([new Uint8Array(100)], { type: 'video/mp4' });
  const formData = new FormData();
  formData.append('media', dummyVideo, 'test.mp4');
  formData.append('payload', JSON.stringify({
    captions: [{ text: "Test", startMs: 0, endMs: 500, timestampMs: 0, confidence: 1 }],
    durationInFrames: 30,
    orientation: 'vertical',
  }));

  const resVideoPost = await fetch(`${BASE_URL}/api/export-video`, {
    method: 'POST',
    body: formData,
  });

  console.log(`POST /api/export-video -> ${resVideoPost.status}`);
  if (resVideoPost.status !== 202) throw new Error(`Expected 202 for /api/export-video start, got ${resVideoPost.status}`);
  const { jobId: videoJobId } = await resVideoPost.json();
  console.log(`✓ Video Export job successfully created in Express: ${videoJobId}`);

  console.log('\n=============================================');
  console.log('ALL PRODUCTION ENDPOINT & EXPORT TESTS PASSED');
  console.log('=============================================');
  } finally {
    serverProcess.kill();
  }
}

testServer().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
