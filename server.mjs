// Development only. All public pages are static; no dependency installation is required.
import {createServer} from 'node:http';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),port=Number(process.env.PORT)||5180;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2'};
createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://127.0.0.1:${port}`);
    // A loopback-only development endpoint saves browser-rendered previews, never changes projects.
    if(req.method==='POST'&&/^\/__capture\/(?:site-[1-5]|portfolio-preview)$/.test(url.pathname)){
      if(req.headers.origin&&req.headers.origin!==`http://127.0.0.1:${port}`){res.writeHead(403);res.end();return}
      let content='';for await(const chunk of req){content+=chunk;if(content.length>20000000){res.writeHead(413);res.end();return}}
      const bytes=Buffer.from(content,'base64');if(bytes[0]!==255||bytes[1]!==216){res.writeHead(400);res.end('JPEG required');return}
      const name=url.pathname.split('/').at(-1);await writeFile(resolve(root,'assets','sites',`${name}.jpg`),bytes);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({saved:name,bytes:bytes.length}));return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
    let file=resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
    if((await stat(file)).isDirectory())file=resolve(file,'index.html');const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Arquivo não encontrado.')}
}).listen(port,'127.0.0.1',()=>process.stdout.write(`OGZ CORPORATION: http://127.0.0.1:${port}\n`));
