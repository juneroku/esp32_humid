export const runtime = 'nodejs';
export const revalidate = 0;

let cache = [];
import { promises as fs } from 'node:fs';
const TMP_FILE = '/tmp/esp_recent.jsonl';

async function loadTmp(limit){
  try{
    const txt = await fs.readFile(TMP_FILE, 'utf8');
    const lines = txt.trim().split('\n').slice(-limit);
    return lines.map(l=>JSON.parse(l));
  }catch{ return []; }
}

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit')||'60')));

  let recent = cache.slice(-limit);
  if (recent.length === 0) recent = await loadTmp(limit);

  const readUrl = process.env.BLOB_READ_URL;
  const token = process.env.BLOB_TOKEN;
  if (recent.length === 0 && readUrl && token){
    try{
      const r = await fetch(readUrl, { headers: { 'Authorization': `Bearer ${token}` }});
      if (r.ok){
        const j = await r.json();
        if (Array.isArray(j.recent)) recent = j.recent.slice(-limit);
      }
    }catch{}
  }

  const latest = recent[recent.length-1] || null;
  if (recent.length > cache.length) cache = recent;
  return Response.json({ latest, recent });
}
