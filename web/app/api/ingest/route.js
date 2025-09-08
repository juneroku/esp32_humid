// Accepts POST { temp, hum } with Authorization: Bearer <INGEST_KEY>
// Stores recent values in memory + /tmp; optional Vercel Blob persistence.

export const runtime = 'nodejs';
export const revalidate = 0;

let cache = [];
import { promises as fs } from 'node:fs';
const TMP_FILE = '/tmp/esp_recent.jsonl';

async function appendTmp(line){
  try{ await fs.appendFile(TMP_FILE, line + '\n', 'utf8'); }catch{}
}

export async function POST(req) {
  const auth = req.headers.get('authorization') || '';
  const key = process.env.INGEST_KEY || '';
  if (!key || !auth.startsWith('Bearer ') || auth.slice(7) !== key){
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }); }
  const temp = Number(body.temp), hum = Number(body.hum);
  if (!Number.isFinite(temp) || !Number.isFinite(hum)){
    return new Response(JSON.stringify({ error: 'Bad values' }), { status: 400 });
  }
  const rec = { temp, hum, ts: new Date().toISOString() };
  cache.push(rec); if (cache.length > 200) cache = cache.slice(-200);
  await appendTmp(JSON.stringify(rec));

  // Optional Vercel Blob
  const writeUrl = process.env.BLOB_WRITE_URL, token = process.env.BLOB_TOKEN;
  if (writeUrl && token){
    try{
      await fetch(writeUrl, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ recent: cache })
      });
    }catch{}
  }
  return Response.json({ ok: true });
}
