// Zero-dependency development server. Production output is entirely static.
import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { resolve,dirname,extname,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json'};
createServer(async(req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Método não permitido.');return}const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'.'+path);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}if((await stat(file)).isDirectory())file=resolve(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data)}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Arquivo não encontrado.')}}).listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>process.stdout.write(`NEXO: http://127.0.0.1:${Number(process.env.PORT)||5173}\n`));
