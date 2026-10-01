# Estúdio Épico — auditoria e especificação do redesign

Data: 01/10/2026. Escopo: landing principal, demonstração das mídias e caminho até o pagamento. As instruções atuais do usuário autorizam implementar após a análise, substituindo a restrição de não escrever código do anexo.

Condições confirmadas pelo responsável durante a execução: entrega em 24h e até 3 rodadas de alterações. A música é gerada por IA; por preferência do responsável, a landing não dedica uma seção à ferramenta e não afirma produção por músicos, gravação humana ou ausência de IA. A licença comercial permanece sem condições confirmadas.

## 1. Executive summary

A página explica o produto e mostra o preço correto, mas atrasa o acesso à prova e ao pedido. O CTA de compra do hero apenas rola até o vídeo; a compra aparece depois de várias seções. O layout centralizado deixa a imagem do estúdio quase invisível e trata conteúdo, navegação e compra com peso semelhante. Proposta: promessa e preço em um hero com fotografia de estúdio, compra direta, áudio logo em seguida, vídeo contextualizado, processo, aplicações, duas ofertas claramente distintas, extras opcionais, FAQ e decisão final.

Não foram fornecidos anúncios, conversões, volume de sessões, split por dispositivo ou acesso ao Clarity. Portanto, o diagnóstico é qualitativo: impactos são hipóteses de fricção, sem previsão de lift ou afirmação de causalidade.

## 2. Pesquisa competitiva

Consulta às páginas oficiais e inspeção do DOM renderizado dos três concorrentes solicitados com agent-browser. Preços representam o que foi observado e podem mudar. Não foram realizadas compras.

| Player / fonte | Promessa, preço e CTA | Prova, processo e ordem | Confiança, objeções e rota |
|---|---|---|---|
| [Lux Marketing](https://luxmarketing.com.br/) | Marca lembrada pela música; música para empresas por R$67; CTA para atendimento | Hero → exemplos → catálogo de serviços → depoimentos → atendimento; estilos explícitos | CNPJ e nota fiscal declarados pelo próprio site; atendimento humano como rota principal; segmentação B2B, catálogo amplo; checkout e garantias não verificados |
| [Songfinch](https://www.songfinch.com/) | Presente musical criado por músico; homepage consultada anuncia a partir de US$179; CTA inicia criação | Hero → artistas com preços → credenciais → processo → reviews → ocasiões → empresas → FAQ | Escolha do artista, colaboração, download; páginas por intenção. [Central de preços](https://support.songfinch.com/hc/en-us/articles/17016466252571-Pricing-and-Payment-Options) ainda informa US$199,99: divergência entre fontes, não usar como comparação exata. [Revisões](https://www.songfinch.com/song-revisions) podem ser pagas; não replicar políticas |
| [Songlorious](https://www.songlorious.com/) | Música baseada em memórias; CTA Create My Song; preço atual não confirmado | Hero → processo com revisão da letra → credenciais de TV → reviews verificados → FAQ → decisão | Artistas e vozes reais são alegações específicas da marca; [página por intenção](https://www.songlorious.com/landing-pages/songs-for-pastors) combina exemplos e reações. Rota principal de criação, chat secundário |
| [Presente em Canto](https://presenteemcanto.com.br/) | Presente musical; Plus R$97 e VIP R$197 observados | Exemplos → situações → planos com entregáveis e ajustes → FAQ | Tier por velocidade e ajustes, e-mail como suporte; prazos são próprios do concorrente |
| [Harmonize Digital](https://www.harmonizedigital.com.br/) | Presente pessoal a partir de R$27 | Briefing em WhatsApp → áudio correspondente → ocasiões → reações → planos | Demonstração da passagem história → música; QR e upgrades; não importar promessa de prazo, direitos ou ajustes ilimitados |
| [Lirica](https://www.thelirica.com/br) | Música a partir de R$9,90 | História, letra e apresentação de presente | Alternativa de baixo preço demonstra que competir apenas por preço é frágil; entrega e licenças não verificadas |

**A. Padrões recorrentes:** resultado concreto; demonstração sonora; processo curto; ocasiões reconhecíveis; entrega digital; FAQ perto da decisão; oferta de apresentação/distribuição adicional. No mobile, CTAs e mídia em coluna e navegação condensada nos três sites observados. Isso descreve padrões, não prova eficácia.

**B. Específicos:** Lux prioriza atendimento e empresas; Songfinch vende escolha e colaboração com artistas; Songlorious explora credenciais de TV e reviews; concorrentes locais usam preço e WhatsApp. O Estúdio Épico deve mostrar os próprios áudios e sua conveniência de compra.

**C. Não copiar:** números de clientes, estrelas, celebridades, notas fiscais, prazo de outro fornecedor, garantias, escassez, artista humano ou ausência de IA sem confirmação. Não copiar catálogo da Lux: desvia do produto de R$67. Não usar preço internacional como âncora para um serviço com escopo diferente.

## 3. Diagnóstico atual

| Elemento / problema observado | Impacto provável | Prioridade | Solução |
|---|---|---|---|
| Hero: botão “Quero minha música” rola para #vsl | Viola expectativa e alonga o caminho de compra | CRÍTICO | Link real para /pedido; secundário “Ouvir exemplos” |
| Áudio aparece depois de vídeo vertical e longa explicação | Adia avaliação da entrega | ALTO | Exemplos imediatamente após hero; âncora de áudio no topo |
| Desktop: tudo centralizado, fotografia encoberta, muitas telas estreitas | Pouca presença musical e hierarquia repetitiva | ALTO | Hero assimétrico, fotografia legível, grids funcionais com largura máxima |
| “Tudo em um pacote” por R$67 versus pacote completo por R$347 no checkout | Pode confundir produção musical com distribuição | ALTO | Nomear música avulsa e pacote completo; mostrar itens de cada oferta |
| Valores individuais de composição/mixagem totalizam R$209,60 sem catálogo comprovado | Ancoragem sem base verificável | ALTO | Remover valores de etapas; usar referência R$147,90 fornecida e soma real R$433,80 do pacote |
| FAQ promete poucos dias e uso em qualquer rede sem política formal | Expectativa de entrega e licença pouco delimitadas | ALTO | Encaminhar prazo, revisão, IA e licença à confirmação de escopo; não inventar condições |
| Vídeo é chamado “experiência real de cliente / sem cortes” sem comprovação | Prova social pode estar mal atribuída | ALTO | Apresentar como vídeo do Estúdio Épico; sem testemunho inventado |
| Player reinicia ao retomar e não trata rejeição de play | Perda de contexto e falso estado “tocando” | MÉDIO | Áudios nativos com seek, tempo e tratamento de erro; exclusão mútua entre mídias |
| Compra, navegação e cards usam rosa, gradiente e glow similares | CTA principal perde prioridade | MÉDIO | Compra em rosa sólido; âncoras e suporte discretos |
| Sticky entra só quando oferta já está perto | Não ajuda quem ouviu e decidiu cedo | MÉDIO | Entrar após hero sair; ocultar fora da viewport de forma não focável |
| Footer contém texto de contato entre colchetes; WhatsApp ausente quando env não configurada | Aparência de placeholder e rota de suporte indisponível | MÉDIO | Remover placeholder; manter WhatsApp condicionado à configuração real |
| HTML lang=en, metadados genéricos, sem skip link/reduced motion global | Acessibilidade, confiança e compartilhamento prejudicados | MÉDIO | pt-BR, metadata da marca, foco, skip link, movimento reduzido |
| Formulário: destinatário e ocasião marcados obrigatórios embora opcionais no schema | Mais esforço percebido e inconsistência | MÉDIO | Rótulos opcionais; labels de letra e estilo “Outro”; foco no primeiro erro |
| Checkout já valida Pix/cartão e mantém extras opcionais | Fluxo funcional deve ser preservado | BAIXO | Testar etapas sem efetuar cobrança real |

## 4. Principais gargalos

1. Expectativa quebrada no CTA do hero. Esforço S; confiança alta.
2. Tempo até ouvir o resultado. Esforço S; confiança média.
3. Distinção entre música e pacote completo. Esforço M; confiança alta.
4. Ancoragem de serviços sem preços comprovados. Esforço S; confiança alta.
5. Mídia e hierarquia visual pouco presentes no desktop. Esforço M; confiança média.
6. Objeções importantes sem condições confirmadas. Esforço M; confiança alta.
7. Atribuição de tráfego se perde ao navegar para /pedido. Esforço M; confiança alta.

**Testar, não presumir:** exemplos antes de vídeo; headline geral versus presente/empresa; checkout versus suporte como rota primária em tráfego específico. **Não é problema:** preço principal, economia R$80,90, áudio local disponível, extras opcionais, checkout em etapas. **Não foi possível checar:** taxa real de abandono, anúncio → página, gateway ao vivo, Clarity, política operacional.

## 5. Novo posicionamento

“Música personalizada a partir da sua história ou da sua marca, com letra e produção incluídas por R$67.” O eixo comum é o resultado pronto, não uma ocasião específica.

Recomendação: principal ampla agora, com caminhos visíveis de presente e empresa; páginas /presente e /empresas como próximos experimentos ligados a anúncios próprios. Anúncios específicos pedem headline e áudio do mesmo contexto. Não abrir quatro páginas quase idênticas sem dados de tráfego e intenção: haverá manutenção e amostra fragmentada. Criar /aniversario e /homenagem quando campanhas ou demanda orgânica justificarem conteúdo próprio. Não implementadas nesta entrega.

## 6. Nova arquitetura da página

| Ordem / seção | Objetivo e mecanismo | Conteúdo / visual / prova | CTA / mobile |
|---|---|---|---|
| 1. Hero | Clareza, preço, identificação | Headline, foto disponível de estúdio, âncora oficial, preço, letra/produção/entrega | Criar minha música → /pedido; Ouvir exemplos → #exemplos; texto e preço antes da foto no mobile |
| 2. Exemplos | Demonstração e especificidade | Quatro arquivos reais, contexto, estilo e players com tempo/seek | Criar minha música; lista de faixas, controles nativos acessíveis |
| 3. Vídeo | Confiança e compreensão | UGC disponível, descrição neutra; sem atribuir fala ou cliente | Ver como funciona; vídeo 9:16 com controles, sem autoplay |
| 4. Processo | Facilidade | Contar ideia → produzir → receber; letra própria ou criação | Criar minha música; três passos em coluna, sem jargão |
| 5. Aplicações | Identificação B2C/B2B | Presente, história, homenagem; marca, loja, campanhas; links para exemplos | Ouvir exemplo relevante; duas colunas desktop, empilhamento mobile |
| 6. Oferta principal | Valor e decisão | Música, letra, produção e finalização; R$67; Pix/cartão | Criar minha música por R$67; preço, lista e CTA em coluna |
| 7. Pacote completo | Ancoragem legítima e apresentação | Música+capa+página+distribuição; logos locais como destinos, sem endosso; R$433,80 → R$347 | Escolher pacote completo → pedido já com pacote selecionado; mockup rotulado ilustrativo |
| 8. Extras | Escolha sem desvio | Capa R$19,90 e página R$59,90; previews em disclosure, sem seleção obrigatória | Ver prévia; escolher no pedido; accordions mobile |
| 9. FAQ e suporte | Redução de incerteza | Estilo, letra, entrega em 24h, até 3 revisões, uso comercial, distribuição e pagamento | Perguntar no WhatsApp quando configurado; disclosure nativo |
| 10. Final | Decisão e clareza do próximo passo | Preço e lembrete do resultado; sem nova âncora ou escassez | Criar minha música; sticky após hero no mobile |

## 7. Copy completa

### Hero
Marca: “Estúdio Épico / Música feita para você”.
Headline: **Sua ideia merece uma música própria.**
Subheadline: “Um presente com a sua história. Um jingle com o nome da sua marca. Você conta a ideia e recebe uma música feita a partir dela.”
Preço: “De R$147,90 por R$67,00. Economize R$80,90.”
CTA: “Criar minha música”. Secundário: “Ouvir exemplos”. Microcopy: “Você conta sua ideia no próximo passo. Pagamento único, por Pix ou cartão.”
Confiança: “Letra + produção / Entrega em 24h / Até 3 revisões”.

### Exemplos
“Antes de imaginar a sua, dê o play.”
“Ouça músicas produzidas pelo Estúdio Épico. Cada exemplo mostra uma forma de transformar uma ideia em som.”
Faixas: “Carnes do João — Jingle para loja / Sertanejo”; “Lili Roupas — Música para marca / Pop”; “Viva Leve — Música para negócio / Samba”; “Aniversário da Luiza — Presente de aniversário / Acústico”.
“A próxima pode contar a sua história.” CTA: “Criar minha música”.

### Vídeo
“Conheça o Estúdio Épico de perto.”
“Um vídeo para conhecer a proposta e entender como pedir sua música. Depois, conte o que você quer ouvir.”
“Sua ideia é o ponto de partida. Você pode enviar uma história, uma mensagem ou uma letra que já escreveu.”
CTA: “Ver como funciona”. Descrição acessível: “Conte sua ideia, escolha o estilo e receba sua música em formato digital.” Não se apresenta essa descrição como transcrição literal.

### Processo
“Você conta. A gente cria. Você dá o play.”
“Não precisa saber produzir música. Precisa contar o que ela deve dizer.”
1. “Conte sua ideia — Diga para quem é, o que precisa aparecer na letra e escolha o estilo. Se já escreveu a letra, pode enviá-la.”
2. “Nós criamos a música — Sua ideia orienta a letra e a produção musical, com mixagem e masterização incluídas.”
3. “Receba e dê o play — Em 24h, a entrega chega no seu e-mail e WhatsApp. Você pode solicitar até 3 rodadas de alterações.”
CTA: “Criar minha música”.

### Aplicações
“Para alguém. Para uma marca. Para a sua ideia.”
“Para presentear — O nome, as lembranças e a mensagem que só você poderia contar. Para aniversários, casamentos, homenagens e histórias de amor.”
“Para o seu negócio — Uma música com o nome da sua marca e a mensagem da campanha. Para lojas, restaurantes, serviços e conteúdo nas redes.”
Links: “Ouvir um presente” / “Ouvir um jingle”.

### Música avulsa
“Da sua ideia ao áudio pronto.”
“Sua música personalizada — Letra criada com os detalhes do seu pedido, ou com a letra que você enviar. Produção no estilo escolhido. Mixagem e masterização. Arquivo digital para ouvir e compartilhar.”
Incluído também: entrega em 24h e até 3 rodadas de alterações. Preço: “R$67,00 / pagamento único”. CTA: “Criar minha música por R$67”. Microcopy: “Extras são opcionais. Você revisa sua escolha antes de pagar.”

### Pacote completo
“Sua música pronta para ouvir, compartilhar e lançar.”
“Além do áudio, receba uma capa, uma página exclusiva e o serviço de lançamento no Spotify, YouTube Music, Apple Music e Deezer.”
Itens: “Música personalizada R$67 / Capa personalizada R$19,90 / Página exclusiva R$59,90 / Lançamento nas plataformas R$287”.
Preço: “Separadamente, R$433,80. Pacote completo R$347,00. Economia de R$86,80.”
CTA: “Escolher pacote completo”. Microcopy: “Você confere os itens e o total na página de pedido. As marcas indicam destinos de distribuição, sem parceria ou endosso.”
Cupom: não promover como preço garantido na landing sem comprovação de ativação no gateway. Se habilitado, PRIMEIRA15 resulta em R$294,95 no pacote; aplicação validada pela Cakto. Não chamar de promoção por tempo limitado.

### Extras
“Só quer a música? Tudo bem. Quer apresentar melhor? Escolha no pedido.”
“Capa personalizada — R$19,90. Uma imagem para acompanhar sua faixa.”
“Página exclusiva — R$59,90. Um link para ouvir e compartilhar sua música.”
Previews: “Prévia ilustrativa. O visual final é personalizado para seu pedido.” Extras permanecem opcionais e selecionados no checkout.

### FAQ
“O que você quer saber antes de pedir?”
- Como envio minha ideia? “Na página de pedido, conte a história ou a mensagem, escolha o estilo e, se quiser, envie sua letra. Você confere as opções antes do pagamento.”
- Posso escolher estilo e enviar minha letra? “Sim. Você pode escolher entre os estilos do formulário, indicar outro e enviar uma letra própria. Se não tiver letra, a composição está incluída.”
- Quanto tempo demora? “O prazo de entrega é de 24h. Se você tem uma data ou solicitação específica, confirme os detalhes com a equipe ao fazer seu pedido.”
- Como recebo? “A entrega é digital, no e-mail e WhatsApp informados no pedido.”
- Posso pedir alterações? “Sim. Você pode solicitar até 3 rodadas de alterações na música. Envie os detalhes do que quer ajustar para orientar cada revisão.”
- Posso usar comercialmente? “Informe o uso previsto no pedido. Para campanhas, anúncios, monetização ou distribuição, confirme as condições de uso e direitos com a equipe antes de contratar.”
- O lançamento está nos R$67? “Não. O serviço de lançamento nas plataformas faz parte do pacote completo. A música avulsa tem entrega digital; capa e página também são opcionais.”
- Como pago? “Por Pix ou cartão, na página de pedido, com processamento pela Cakto. Você vê os itens e o total antes de finalizar.”
Suporte: “Tem uma data ou um uso específico? Tire sua dúvida com a equipe.”

### Final e rodapé
“Agora é a vez da sua ideia.”
“Conte o que você tem em mente. Nós transformamos os detalhes em música.”
“Música personalizada / R$67,00 / pagamento único”. CTA “Criar minha música”.
Rodapé: “Estúdio Épico — Música personalizada”; “Falar com a equipe” se WhatsApp configurado. Sem contato placeholder, selos não verificados ou política inventada.

## 8. Redesign visual

Paleta proposta: carvão #121014, superfície #1c191e, borda #383139, texto #f7f2f5, texto secundário #bcb3bc, rosa #c84969. Implementar tokens em oklch conforme sistema atual. Tipografia: Sora para títulos e Plus Jakarta Sans para leitura, já integradas ao projeto; títulos em sentence case, com bloco grande e alinhado à esquerda. Não adicionar biblioteca de fontes ou ícones. Preço com números tabulares.

Hero: texto à esquerda, fotografia existente à direita e uma faixa de áudio editorial sobre a fotografia; mobile com texto/preço/CTA primeiro. Foto não é prova de propriedade do estúdio. Áudios em lista semelhante a catálogo musical, não cartões SaaS. Vídeo integrado a um painel com explicação lateral. Ofertas com bordas discretas; CTA rosa sólido, sem glow excessivo. Gradiente apenas para legibilidade sobre foto; sombras restritas à profundidade das mídias. Animação apenas de interação, com prefers-reduced-motion.

## 9. Mobile

Verificar 360, 375, 390, 414 e 430 px, mais 320 px como limite adicional; desktop em 1280/1440. Padding horizontal 20–24 px; títulos hero 38–48 px ajustados por clamp; título de seção 28–36 px; texto 15–16 px. CTA mínimo 48–52 px. Hero deve mostrar preço e ação principal em 390×844 e 360×800. Fotografia é apoio após a ação.

Players: largura total, busca e volume nativos, um áudio por vez, vídeo também pausa áudio. Cards B2C/B2B e ofertas empilham. FAQ e extras com disclosure e alvos grandes. Sticky entra quando o hero sai, usa safe-area, não deve cobrir elemento focado. WhatsApp flutuante fica apenas no desktop; no mobile aparece em links no FAQ/rodapé para não sobrepor controles. Não carregar áudios até intenção; vídeo sem autoplay, preload metadata. Imagens com dimensões, foto com prioridade.

## 10. Checkout

Preservar três etapas, schema e integração Cakto. CTA principal abre o pedido na música avulsa. CTA pacote abre /pedido?pacote=completo com resumo de R$347, reversível na etapa de extras. Não enviar dados pessoais na URL. Rótulos obrigatórios acompanham schema; foco no primeiro inválido. Testar preenchimento, extras, voltar, cupom, Pix/cartão e total sem gerar cobranças reais. Confirmação de pagamento segue verificada no servidor.

## 11. WhatsApp

Rota alternativa para data, licença comercial, ajustes e dúvidas sobre produção. Não competir como segundo botão rosa no hero. Exibir no FAQ/rodapé e botão flutuante apenas no desktop quando VITE_WHATSAPP_NUMBER for válido. Copy: “Tirar uma dúvida”. No mobile, somente links no conteúdo para proteger o player. Se não configurado, não inventar número nem simular link. O ambiente local tem WhatsApp configurado; a versão publicada auditada mostrou um placeholder e nenhum botão de WhatsApp.

## 12. Objeções

| Objeção | Onde | Resposta / prova |
|---|---|---|
| Vai ficar bom? | Exemplos imediatamente após hero | Quatro áudios reais com contexto; sem estrelas inventadas |
| É personalizada? | Hero, processo e pedido | Detalhes, destinatário e letra do briefing orientam produção |
| Posso escolher estilo/enviar letra? | Processo, FAQ, pedido | Controles existentes de gênero e texto |
| Quanto demora? | Hero / oferta / processo / FAQ | Entrega em 24h, confirmada pelo responsável |
| Como recebo? | Processo / oferta | Entrega digital e canais do pedido |
| Posso alterar? | Hero / oferta / processo / FAQ | Até 3 rodadas de alterações, confirmadas pelo responsável |
| É IA? | Atendimento se perguntado | Produção por IA confirmada; não declarar “100% humano” nem inventar artistas |
| Posso usar comercialmente? | Aplicações / FAQ | Confirmar licença para o uso pretendido |
| Spotify incluído? | Pacote / FAQ | Serviço adicional, fora da música avulsa |
| Seguro pagar? | Oferta / pagamento | Pix/cartão processados pela Cakto; total revisável |

## 13. Provas necessárias

Disponíveis: quatro MP3, um MP4, fotografia e logos; entrega em 24h e até 3 revisões confirmadas pelo responsável. Não há avaliações verificadas, autorização documentada de testemunho, métricas públicas, licença comercial ou termos formais. Retirar atribuições sem base e listar essas lacunas. Legendas/transcrição literal do vídeo dependem da revisão do áudio; fornecer descrição textual do processo sem alegar transcrição. Termos e privacidade precisam ser fornecidos/validados pelo responsável; não criar links vazios ou conteúdo jurídico fictício.

## 14. Estratégia de testes

| Prioridade / hipótese | Variável | Métrica principal / secundária | Duração e decisão |
|---|---|---|---|
| A. Promessa concreta melhora entendimento | Hero novo vs atual, mantendo oferta e tráfego | Pedido iniciado / CTA, áudio, compra confirmada | Pelo menos 14 dias e amostra calculada com taxa base; decidir por conversão de compra quando houver dados suficientes, não por CTR isolado |
| B. Ouvir cedo reduz incerteza | Áudio antes vs depois do vídeo | Compra por sessão / play, conclusão briefing | 14 dias ou mais; uma variável, mesmos anúncios; IC 95% e MDE pré-definido |
| C. Alinhamento com intenção melhora compra | Landing ampla vs /empresas em anúncio B2B | Compra por sessão B2B / ticket, suporte | 14–28 dias + amostra; não misturar campanhas ou otimização de entrega |
| D. Suporte pode destravar casos complexos | Checkout principal vs WhatsApp em campanha controlada | Pedidos pagos por visita / custo atendimento, abandono | 14–28 dias; reconciliar vendas do WhatsApp antes de decidir |
| E. Pacote explícito aumenta receita | Pacote na landing vs apenas em extras | Receita por sessão / adesão pacote, compra principal | 14 dias + amostra; evitar aumento de ticket com queda de receita total |
| F. Cupom pode ajudar ou canibalizar | R$67 vs cupom validado, preço real no gateway | Margem/receita por sessão / compra, ticket | 14 dias + amostra; definir margem mínima antes; não anunciar desconto inativo |

Duração mínima não substitui amostra. Calcular tamanho usando baseline e mínimo efeito relevante; registrar hipótese e regra antes do início, distribuir aleatoriamente, persistir variante e não encerrar ao primeiro sinal favorável.

## 15. Analytics

Auditoria: os eventos customizados são enviados atualmente como `track` do Meta; separar `trackCustom` para os próprios e `track` para eventos padrão. `captureTrackingParams` só lê a URL atual, então UTMs podem desaparecer ao navegar; preservar por sessão e incluir fbclid/gclid/ttclid/msclkid no encaminhamento. Não enviar nome, história, letra, e-mail ou telefone em eventos.

Adicionar: Audio_Play, Audio_Completed, Video_Play, Video_Completed, Section_Viewed, FAQ_Opened e Order_Step_Completed. CTA_Click recebe localização e oferta. Player play não é Lead. Lead atual e InitiateCheckout ocorrem juntos ao criar cobrança; têm pouco poder de diagnóstico das etapas anteriores. Purchase continua apenas após confirmação do gateway; não derivar de clique ou thank-you.

Funil: PageView → CTA_Click → ViewContent(pedido) → Order_Step_Completed(música) → Order_Step_Completed(extras) → AddPaymentInfo → InitiateCheckout → Purchase confirmado. Segmentos: áudio ouvido, vídeo visto, intenção, dispositivo, campanha, pacote e método de pagamento. Section_Viewed registra uma vez por seção/visita; evitar ViewContent em todo scroll.

Clarity: revisar mobile pago com hero visto e sem play; plays sem pedido; erro de validação repetido; desistência em extras; troca Pix/cartão; cliques repetidos em controles; scroll até FAQ sem CTA; retorno ao total após cupom. Não há gravações disponíveis nesta execução. Uma análise real exige filtros e denominadores por campanha/dispositivo.

## 16. Prioridade de implementação

P0: compra real no hero, preço correto, áudios antes de vídeo, preservar pedido e tracking. P1: layout, pacote e extras, FAQ com limites honestos, acessibilidade. P2: instrumentação e validação desktop/mobile. Depois: políticas confirmadas, legendas literais do vídeo, páginas por intenção, experimento controlado. Nenhum push/deploy nesta entrega.

## ESPECIFICAÇÃO PARA O AGENTE DE CÓDIGO

- Trabalhar em React 19/TanStack/Tailwind 4 existentes, sem migração nem nova biblioteca.
- Reutilizar componentes de landing e módulos offer, format, whatsapp e checkout. Nenhum preço paralelo.
- Ordem: HeroOffer, AudioShowcase, UGCVideo, HowItWorks, ForWhomSection, MainOffer, FAQ, FinalOffer. MainOffer engloba pacote e extras.
- Usar src/assets/hero-studio.jpg e logos fornecidos. Áudios e vídeo ficam nos paths atuais de public. Não inventar fotos de cliente, depoimentos ou número de vendas.
- CTAButton deve ser Link /pedido, com opção bundle e origem para analytics. Pedido valida search e inicializa bundle reversível.
- AudioShowcase deve usar audio nativo, preload none e pausa de outras mídias ao tocar. Exibir erros com aria-live. Vídeo usa controles, poster derivado da mídia existente se possível e play controlado pelo usuário.
- Sticky via IntersectionObserver no hero, Link real, safe-area; desmontar quando oculto para impedir foco invisível.
- Adicionar estilos de landing escopados; preservar checkout. Foco visível global, color-scheme dark, lang pt-BR e redução de movimento. Metadata da marca; 404 e erro em português.
- Registrar custom events com trackCustom, manter padrão Meta, capturar tracking seguro por sessão. Respeitar ausência de fbq e storage indisponível.
- Testar build, lint, TypeScript, DOM responsivo, players, FAQ, previews, CTA, seleção pacote, passos e erros com agent-browser. Evidências e limitações em docs/validacao-redesign.md.
