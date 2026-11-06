# NEXO Contabilidade

Site estático em português brasileiro, com cena Three.js r160 procedural e fallback sem WebGL. Execute `npm run dev` e abra http://127.0.0.1:5173. Não é necessário instalar dependências locais. Execute `npm test` para verificar o simulador e os validadores.

Publique `index.html`, `styles.css`, `src/` e `assets/` em qualquer hospedagem estática HTTPS. As bibliotecas e fontes são carregadas por CDN. O modo padrão é demonstrativo: nenhum lead é enviado. Dados, CRC, depoimentos e casos devem ser revisados antes da publicação. Pontuações de Lighthouse dependem do dispositivo, rede e hospedagem e não foram presumidas.

1. Nome e logo: altere `CONFIG.name` em `src/config.js` e, para uma marca gráfica, o elemento `.brand` no HTML.
2. Cores: altere os tokens de `tailwind.config` no HTML e as variáveis `:root` de `styles.css`.
3. Textos e números: edite o HTML, `CONFIG.stats`, `CONFIG.plans`, `SERVICES` e `METHOD` em `src/config.js`.
4. Foto do contador: substitua `assets/contador.png` por um PNG com transparência ou altere `CONFIG.portrait`; uma string vazia deixa a cena sem retrato.
5. Envio e WhatsApp: configure `CONFIG.endpoint` e `CONFIG.whatsapp` (país + DDD + número). O endpoint recebe JSON; o WhatsApp abre uma mensagem para revisão do visitante.
6. Simulador: ajuste `EXAMPLE_RATES` em `src/config.js`. Os valores são hipotéticos e não constituem cálculo tributário ou recomendação de enquadramento.

O CNPJ aceita identificadores numéricos e alfanuméricos conforme o [manual de cálculo da Receita Federal / Serpro](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf). A validação confirma somente o formato e os dígitos verificadores, não a situação cadastral.

O `dataLayer` contém apenas nomes de eventos e metadados não pessoais. Nenhuma biblioteca de analytics é instalada. UTMs e gclid presentes na URL acompanham o payload autorizado do lead. O convite de saída utiliza somente uma preferência de sessão. Configure a política de privacidade para a operação real.

Em dispositivos móveis ou GPUs limitadas, a cena usa menos partículas, DPR 1 e materiais sem transmissão ou bloom. Com movimento reduzido ou falha de WebGL, o poster vetorial e os gradientes preservam a composição; as quatro etapas do método permanecem legíveis sem pin.
