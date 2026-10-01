# Validação do redesign — Estúdio Épico

01/10/2026. Resultado: build e TypeScript aprovados; lint sem erros; layout e fluxo até pagamento verificados com agent-browser em Chromium.

## Checks executados

| Check | Resultado |
|---|---|
| `npm.cmd run build` | Exit 0; client, SSR e bundle Nitro/Cloudflare gerados |
| `node node_modules/typescript/bin/tsc --noEmit` | Exit 0 |
| `npm.cmd run lint` | Exit 0; 0 erros e 6 avisos preexistentes de Fast Refresh em componentes UI |
| `scripts/validate-landing.ps1 -BrowserBinary <caminho-do-agent-browser>` | Exit 0; 10 larguras; sem overflow horizontal e CTA principal visível no primeiro viewport |
| Browser errors | Sem erros de aplicação encontrados durante os fluxos verificados |

Avisos de build: plugin tsconfig paths agora redundante no Vite e aviso de inlineDynamicImports do preset Nitro. Não impediram a compilação; não foi alterada a configuração mantida pelo Lovable.

## Responsividade e revisão visual

| Largura / altura | CTA do hero até Y | Overflow horizontal |
|---|---|---|
| 320 / 844 | 538 | Não |
| 360 / 844 | 519 | Não |
| 375 / 844 | 523 | Não |
| 390 / 844 | 528 | Não |
| 414 / 844 | 536 | Não |
| 430 / 844 | 542 | Não |
| 768 / 1000 | 586 | Não |
| 1024 / 1000 | 562 | Não |
| 1280 / 1000 | 609 | Não |
| 1440 / 1000 | 681 | Não |

Valores medidos em Chromium com scrollbar Windows de 15 px; o conteúdo útil fica 15 px menor que a largura de viewport configurada. Dados completos: [responsividade.json](qa/responsividade.json).

Inspeção visual realizada nas capturas de hero desktop e mobile, exemplos, vídeo, ofertas, logos, previews e pagamento. O grid empilha em mobile, o preço fica acima do CTA, o player mantém largura disponível e o WhatsApp flutuante fica oculto no mobile. O sticky entra quando o hero inteiro sai da viewport; medição confirmou a borda inferior na altura do viewport.

- [Hero desktop](qa/hero-1440.png)
- [Hero 360](qa/hero-360.png)
- [Hero 390](qa/hero-390.png)
- [Landing mobile completa](qa/landing-mobile-390.png)
- [Exemplos desktop](qa/exemplos-desktop.png)
- [Exemplos mobile e CTA fixo](qa/exemplos-mobile.png)
- [Ofertas desktop](qa/ofertas-desktop.png)
- [Prévia de capa aberta](qa/preview-capa-desktop.png)
- [FAQ desktop](qa/faq-desktop.png)
- [Pagamento com cupom](qa/pagamento-mobile.png)
- [Validação do formulário vazio](qa/validacao-formulario-mobile.png)

## Mídias e interações

1. Primeiro áudio reproduzido por clique no controle nativo. Duração válida e estado playing confirmado.
2. Segundo áudio acionado por clique: o primeiro pausou. As cinco mídias foram exercitadas em sequência; sempre apenas uma tocando.
3. Pausa, busca até 5 segundos e retomada mantiveram a posição. Nenhuma mídia apresentou erro de carregamento.
4. Durações observadas: Carnes do João 157,04 s; Luiza 208,56 s; Lili Roupas 171,16 s; Viva Leve 187,48 s; vídeo 10 s.
5. Os quatro logos locais carregaram com dimensões naturais válidas. As marcas são destinos de distribuição, sem alegação de endosso.
6. Previews de capa e página abriram por clique nos summaries; o FAQ de prazo abriu e mostrou 24h.
7. Controles usam elementos nativos, nomes acessíveis e foco visível. Seleção de métodos por setas foi exercitada: cartão → Pix.

Os comandos de click do agent-browser exigiram posicionar os controles na viewport e aguardar navegação. Os testes iniciais em controles fora da tela não mudavam o estado; a revisão usou rolagem instantânea temporária no navegador e cliques reais, sem alterar o comportamento de scroll do produto.

## Pedido e analytics

- CTA do hero abriu `/pedido` com música avulsa de R$67,00.
- CTA do pacote abriu `/pedido?pacote=completo`; resumo R$347,00; extras incluídos. Seleção removível na etapa de extras.
- Briefing preenchido com dados fictícios locais avançou por Música → Extras → Pagamento sem necessidade de preencher destinatário e ocasião opcionais. Voltar preservou valores.
- Formulário vazio exibiu erros em nome, WhatsApp, e-mail e ideia, focando `order-name`. Campos opcionais não receberam erros.
- CPF vazio bloqueou o Pix localmente e focou `pix-cpf`; não foi gerada cobrança.
- Painéis Pix e cartão abriram. Checkout também sem overflow em 360×800.
- Cupom inválido exibiu erro. PRIMEIRA15 permaneceu rascunho até Aplicar; depois exibiu R$294,95 no pacote. Simulação de parcelas passou a exibir 1x de R$294,95, acompanhando resumo e cupom.
- URL de teste com `utm_source=qa`, `utm_campaign=redesign` e `fbclid=qa_click` preservou essas chaves no sessionStorage ao navegar para `/pedido`.
- Spy local de `fbq` confirmou Audio_Play/Video_Play e Coupon_Applied via trackCustom. Nenhum Purchase foi disparado nessas interações. Eventos padrão continuam via track.

## Correções encontradas na validação

| Problema | Sinal / correção | Verificação |
|---|---|---|
| Preço + economia excediam 320 px em 1 px | Harness falhou com scrollWidth 306 e clientWidth 305; reduzir gap e preço apenas abaixo de 360 px | Harness completo aprovado, 305 = 305 |
| Tipagem de entrada do IntersectionObserver e search opcional | TSC falhou; guardar entrada e retornar objeto sem campo indefinido | TSC aprovado |
| Query de confirmação `order_id` versus `orderId` | TSC apontou contrato incompatível preexistente; preservar `order_id` na URL e mapear para variável local | TSC aprovado |
| Captura da assinatura sem prova de índice | Guard de match[1] na verificação HMAC; mesma política fail closed | TSC aprovado |
| Cupom aplicado durante digitação | Separar rascunho da seleção, aplicar apenas no clique/Enter | Rascunho não aplica; clique aplica e emite evento |
| Parcelas ignoravam cupom | Passar total com desconto para a simulação de cartão | 1x de R$294,95 confirmado |
| Lint preexistente em ExtrasStep | Formatação de um trecho JSX | Lint sem erros |

## Revisão de interface por arquivo

Formato de referência das Web Interface Guidelines, aplicadas às áreas alteradas:

```text
src/components/landing/HeroOffer.tsx — CTA é Link real; imagem tem dimensões e prioridade; título único.
src/components/landing/AudioShowcase.tsx — nomes de mídia, controles nativos, preload none, erro com status.
src/components/landing/UGCVideo.tsx — controles, playsInline, sem autoplay; descrição textual disponível.
src/components/landing/StickyMobileCTA.tsx:10 — observer em vez de listener de scroll; oculto não entra no foco.
src/components/landing/FAQ.tsx — summaries nativos; sem clique em div; conteúdo aberto legível.
src/components/order/MusicStep.tsx:179 — setas navegam estilos; labels dos campos adicionais; obrigatoriedade coerente.
src/components/order/PaymentStep.tsx:112 — setas navegam métodos; foco no CPF inválido; cupom no total das parcelas.
src/components/order/CouponCard.tsx:39 — rascunho e aplicação separados; campo com nome e spellCheck false.
src/routes/__root.tsx:123 — skip link, lang pt-BR, metadata da marca e estados de erro em português.
src/styles.css — foco visível, safe-area, color-scheme dark, movimento reduzido; layouts escopados.
```

## Limites da validação

Não foi realizada cobrança real, nem teste de liquidação, webhook, reembolso, revisão entregue ou publicação nas plataformas. Cupom e ofertas precisam estar configurados no gateway para o valor final corresponder à vitrine; os cálculos e a interface foram verificados. Não há dados de conversão, anúncios ou acesso às gravações do Clarity para provar aumento de conversão.

Testes em Chromium com viewports simulados não equivalem a testes em aparelhos físicos ou Safari/iOS. O vídeo possui descrição textual do processo; legendas e transcrição literal ainda precisam ser preparadas com base no áudio. Licença comercial, termos e privacidade precisam de conteúdo validado pelo responsável. Essas pendências não foram preenchidas com promessas ou documentos fictícios.

Nenhum commit, push ou deploy realizado. As alterações e exclusões preexistentes da workspace foram preservadas.
