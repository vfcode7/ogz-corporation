# OGZ CORPORATION

Portfólio em português brasileiro com a foto de **vinxz.ogz**, tipografia em camadas, carrossel em arco com CSS 3D, manifesto e três planos. Criado exclusivamente nesta pasta.

Execute `npm run dev` e abra **http://127.0.0.1:5180**. Não é necessário instalar dependências. Para publicar, envie `index.html`, `styles.css`, `src/`, `assets/` e `projetos/` a uma hospedagem estática. O servidor Node é apenas uma conveniência local.

## Personalizar em seis passos

1. **Nome e domínio:** altere `CONFIG.name`, `CONFIG.founder` e `CONFIG.domain` em `src/config.js`; enquanto não há domínio, o hero mostra o Instagram oficial informado.
2. **Foto do hero:** substitua `assets/ogz-fundador.webp` por outra foto com transparência, preservando o enquadramento; `assets/ogz-fundador.png` é a cópia PNG de reserva.
3. **Cinco sites:** edite o array `SITES` de `src/config.js`; nome, categoria, URL, print e texto alternativo ficam juntos. Os prints reais estão em `assets/sites/`.
4. **WhatsApp:** altere `CONFIG.whatsapp`, apenas com país, DDD e número. Foi utilizado exatamente o número informado: `554399539585`, exibido como `(43) 9953-9585`.
5. **Planos e benefícios:** edite `PLANS` e `CONFIG.installment` em `src/config.js`. Os valores são investimentos únicos: R$ 400, R$ 600 e R$ 500.
6. **Cor volt:** altere `--volt` e os tons relacionados em `styles.css` e os tokens de `tailwind.config` no HTML.

## Projetos clicáveis

Os arquivos originais nas pastas irmãs foram preservados. O portfólio inclui cópias completas para que os links funcionem mesmo antes de contratar um domínio:

| Projeto | Página local incluída |
| --- | --- |
| YU.MED Odontologia | `projetos/yumed/index.html` |
| KINETIC Fisioterapia | `projetos/kinetic/index.html` |
| NEXO Contabilidade | `projetos/nexo/index.html` |
| VÉRTICE Automotiva | `projetos/vertice/index.html` |
| BRUTO BURGER | `projetos/bruto/index.html` |

As imagens `site-1` a `site-5` são capturas reais renderizadas desses projetos. Para capturá-las, as animações foram temporariamente reduzidas apenas no navegador de inspeção e as imagens foram carregadas antes do print. JPEGs de reserva e WebPs de dois tamanhos estão incluídos. As páginas copiadas continuam com seus próprios comportamentos e configurações; os dados demonstrativos de cada projeto são os originais dele.

O carrossel oferece setas, teclado, navegação por Tab, arraste com inércia, swipe e roda horizontal. A rolagem vertical continua pertencendo à página. Arrastes maiores que 6 px não abrem links. Sem JavaScript, os cinco links aparecem como uma lista legível. O movimento reduzido mantém o controle por setas sem parallax e sem animações longas.

O Instagram é `https://www.instagram.com/ogz.coporation/`, exatamente como informado. O e-mail e o domínio não foram inventados. A faixa de métricas fica oculta enquanto `CONFIG.stats` for `null`. O selo do plano central diz “Destaque OGZ”, sem inventar uma estatística de vendas.

## Foto do fundador

O fundo foi removido com a ferramenta de edição de imagens integrada, em modo de edição de uma imagem de referência e com saída transparente. Não foi feito recorte por segmentação em código. A conversão PNG → WebP é sem perdas e preserva o canal alfa.

- Resultado de uso: `assets/ogz-fundador.webp`.
- Resultado PNG preservado: `assets/ogz-fundador.png`.
- Fonte fornecida: `C:/Users/Made4it/Downloads/1000099776.png`.

Prompt final utilizado:

> EDIT THE PROVIDED PHOTO, NOT A NEW PORTRAIT. Use case: background-extraction / identity-preserve. Remove only all of the outdoor background (hedge, plants, blue wall, bench and pavement), retaining the exact same person from the supplied image with genuine transparent alpha around him. Preserve his real identity and exact facial features, expression, hair, skin texture, shirt, tie, hands, arm pose, dark jacket draped over his arm and body proportions. Do not retouch, beautify, change age, change hairstyle, change clothing or redesign any part of him. Crop the photo into a waist-up editorial cutout, including the visible hand and jacket held in his arm, framed to just below his hips; keep the complete head and all hair with a little transparent clearance above and around shoulders and elbows. No generated background, no shadow, no glow, no text, no logos, no extra objects. The output must be a photographic cutout of THIS SAME person, suitable for overlaying on a black portfolio website.

## Operação

Os botões de plano abrem uma mensagem específica no WhatsApp para revisão e envio pelo visitante. Não existe envio automático. `window.dataLayer` prepara somente `card_click`, `plan_click` e `whatsapp_click`, sem instalar ferramentas de rastreamento ou coletar dados de formulário. Pixel e Analytics descritos nos planos são entregáveis do serviço; IDs e acessos do cliente devem ser fornecidos na contratação.

Fontes e bibliotecas são carregadas por CDN. Meta de Lighthouse não significa uma pontuação já medida ou garantida; conteúdo e hospedagem influenciam o resultado. O endpoint `/__capture/` do servidor local existe apenas para salvar previews de desenvolvimento, limita os nomes dos arquivos e não é necessário para a publicação estática.


## Revisão de UX mobile

- Mobile e desktop usam a galeria 3D animada, com estágio dimensionado para manter as setas de 48px abaixo dos cards.
- Os projetos abrem em um dialog com iframe carregado sob demanda. “Voltar ao portfólio” fecha a prévia, descarrega o projeto e restaura foco e posição de rolagem. Voltar do navegador também fecha a prévia.
- Os planos ficam lado a lado em uma faixa horizontal no celular. Preço e CTA vêm antes dos benefícios, que podem ser expandidos por plano. Desktop mantém os três planos visíveis.
- Mobile mantém rolagem de página nativa e imagens menores, com entrada tipográfica, retrato flutuante, parallax na rolagem, manifesto animado, revelações, galeria 3D e borda animada. A preferência do sistema por movimento reduzido é respeitada.
- O retrato mobile tem 600px de largura e 44.592 bytes, selecionado por srcset; a imagem original WebP tem 868.708 bytes. Isso reduz o arquivo do retrato em cerca de 95%; não equivale a uma medição de Lighthouse ou de tempo total de carga.

A expansão dos benefícios mantém o scroll da página e do carrossel, sem esticar os outros planos. A lista cresce no fluxo normal da página, sem recortes ou rolagem interna; o botão muda para “Ocultar benefícios”.
