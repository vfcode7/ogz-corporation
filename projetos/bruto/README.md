# BRUTO BURGER CO. — landing page com scroll-scrub

Projeto estático: `index.html` + `css/` + `js/`. Sem build, sem dependência de framework.

## Rodando

Os scripts são ES modules, então o `file://` não serve — precisa de um servidor HTTP:

```bash
npx serve .          # ou: python3 -m http.server 8000
```

Em produção basta subir a pasta inteira para qualquer host estático (Vercel, Netlify, Nginx, S3).

## Os frames do hero

Os 120 frames em `assets/frames/f_0001.webp … f_0120.webp` foram extraídos do vídeo
original (`assets/video/burger-origem.mp4`) a 15fps, 540px de largura, já com a marca
d'água do canto inferior direito removida pelo filtro `delogo`. Para regerar:

```bash
ffmpeg -i assets/video/burger-origem.mp4 \
  -vf "fps=15,scale=540:-1,delogo=x=450:y=864:w=88:h=92" \
  -c:v libwebp -q:v 58 -compression_level 6 \
  assets/frames/f_%04d.webp
```

Mudou a quantidade de frames? Ajuste `HERO.TOTAL_FRAMES` em `js/config.js`.
A montagem do burger termina por volta do frame 57 do vídeo original — por isso
`HERO.frameMap` é um mapa linear por partes, e não uma regra fixa: ele estica a
montagem pela maior parte do scroll e deixa só o fecho de chamas no fim.

## Como trocar as coisas

1. **Nome e logo** — `js/config.js` → `BRAND.nome`; no `index.html`, o wordmark no `<header>`, no `#mobile-menu`, no `#stage-foot` (a tarja que cobre a marca d'água), no rodapé, no `<title>` e no JSON-LD.
2. **Cores** — `tailwind.config` no topo do `index.html` e as variáveis `:root` em `css/styles.css` (os dois precisam bater).
3. **Frames do vídeo** — comando ffmpeg acima; depois ajuste `HERO.TOTAL_FRAMES`, `HERO.framePath` e, se mudar o ritmo da animação, `HERO.frameMap` e `HERO.beats`.
4. **Cardápio** — array `MENU` em `js/config.js` (id, nome, desc, preço, categoria, `img`, `fallback`, tag). As categorias ficam em `CATEGORIAS`.
5. **WhatsApp** — `BRAND.whatsapp` em `js/config.js`, só dígitos e com DDI (`5511988887766`). Alimenta o botão flutuante, o link da seção "Como pedir" e a mensagem do checkout.
6. **iFood** — `BRAND.ifood` em `js/config.js`. Taxa de entrega em `BRAND.taxaEntrega` e horários em `HORARIOS` (minutos desde a meia-noite; passar de 1440 significa madrugada do dia seguinte).

## Estrutura

```
index.html            markup, SEO, JSON-LD
css/styles.css        estilos próprios (o Tailwind entra por CDN)
js/config.js          marca, horários, hero, cardápio  ← mexa aqui
js/frames.js          engine de frame sequence (preload, lerp, DPR)
js/hero.js            pin + scrub, legendas, brasas
js/ui.js              cardápio, header, marquee, cursor, reveals
js/cart.js            sacola, checkout e mensagem do WhatsApp
js/main.js            boot: Lenis + GSAP + preloader
```

## Notas

- `prefers-reduced-motion`: sem pin, sem scrub, sem brasas — o hero vira uma imagem estática do burger montado.
- Se nenhum frame carregar, o canvas é trocado por `assets/img/hero-poster.webp`.
- Carrinho persiste em `localStorage` (`bruto:cart:v1`).
- O preloader tem timeout de 9s: mesmo que algo trave, a página abre.

## As fotos do cardápio

Os cards usam fotos reais hospedadas no Pexels e no Unsplash (licença livre, sem
atribuição obrigatória), referenciadas por URL no campo `img` de cada item do `MENU`.
Cada item também traz um `fallback`: uma ilustração SVG local em `assets/img/menu/`.
Se a foto remota falhar por qualquer motivo, o `onerror` troca pelo SVG e o card
continua apresentável — nenhum buraco branco na página.

Quando o cliente tiver as fotos próprias, coloque os arquivos em `assets/img/menu/`
e aponte `img` para o caminho local. Aí a página fica 100% autossuficiente.

As imagens das seções (hero, combos, "por que somos diferentes" e CTA final) saem
dos frames do próprio vídeo, então já são locais.

## Ritmo do scroll no hero

O hero ocupa `+=180%` da altura da tela no desktop e `+=130%` no mobile — cerca de
1,8 e 1,3 rolagens de tela. Com 120 frames, isso dá uma troca de frame a cada ~13px
de scroll, o que mantém a montagem fluida mesmo em rolagem lenta. `scrub: 0.25` e
`lerp: 0.26` deixam o frame colado no gesto; aumentar esses valores deixa mais
macio mas com sensação de arrasto. Tudo em `HERO`, em `js/config.js`.
