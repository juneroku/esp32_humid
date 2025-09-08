export const metadata = {
  title: "KMITL-FIGHT HUMID → Vercel (Direct)",
  description: "ESP32 posts temp/humidity from HUMID (DHT11/22) directly to Vercel API. No DB.",
};
export default function RootLayout({ children }){
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root{
            --bg:#f5faff; --surface:#fff; --text:#0b1220; --muted:#475569; --border:#dbeafe;
            --accent:#1e40af; --accent-on:#fff; --shadow:0 10px 28px rgba(2,6,23,.08); --r:18px;
            --grid:#eaf2ff; --line:#2f52d9; --bar:#6f8dff;
          }
          *{box-sizing:border-box} html,body{max-width:100%;overflow-x:hidden}
          body{margin:0;background:var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,"Noto Sans",Arial}
          header{position:sticky;top:0;background:rgba(255,255,255,.7);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);z-index:10}
          main{max-width:980px;margin:0 auto;padding:20px}
          .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);padding:18px}
          .muted{color:var(--muted)}
          .hero{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}
          @media (max-width:640px){.hero{grid-template-columns:1fr}}
        `}</style>
      </head>
      <body>
        <header><main style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <strong>HUMID → Vercel</strong><span className="muted">ESP32 API • No DB</span>
        </main></header>
        <main>{children}</main>
        <footer style={{maxWidth:980,margin:'24px auto',padding:'0 20px'}} className="muted">
          Default persistence uses /tmp (per instance). For durable storage, configure Vercel Blob envs.
        </footer>
      </body>
    </html>
  );
}
