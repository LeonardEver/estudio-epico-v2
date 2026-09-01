# SETUP — Fluxo de pedidos (briefing → Kiwify → webhook → e-mail)

Guia completo para configurar o fluxo de compra do MVP. Siga na ordem.

O fluxo é **manual de propósito**: o cliente envia o briefing → paga na Kiwify →
você recebe o pedido por e-mail → produz a música → envia o download manualmente.

---

## 1. Visão geral dos serviços

| Serviço | Para quê | O que você precisa criar |
| --- | --- | --- |
| Google Sheets | Armazenar os pedidos (planilha) | Planilha + service account |
| Kiwify | Checkout e confirmação de pagamento | Chave de API + webhook |
| Resend | E-mail de pedido pago para o dono | API key + domínio verificado |
| Meta | Anúncios/conversões | Pixel ID (opcional) |

---

## 2. Google Sheets

### 2.1 Criar a planilha
1. Acesse [sheets.new](https://sheets.new) e crie uma planilha chamada **Pedidos — Idea to Music**.
2. Na **primeira linha** (cabeçalhos), cole exatamente estas colunas, uma por célula (A até Q):

```
order_id | created_at | name | email | whatsapp | lyrics_preference | lyrics | description | genre | genre_other | mood | payment_status | kiwify_transaction_id | paid_at | delivery_status | download_url | notification_status
```

3. **Onde encontrar o Spreadsheet ID:** na URL da planilha
   `https://docs.google.com/spreadsheets/d/XXXXXXXXXXXX/edit`
   o ID é o trecho `XXXXXXXXXXXX`. Coloque em `GOOGLE_SPREADSHEET_ID`.

### 2.2 Criar a service account (conta de serviço)
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto (ou use um existente).
3. Menu **IAM e administração → Contas de serviço → Criar conta de serviço**.
   - Nome: `idea-to-music-orders` (qualquer nome).
4. Depois de criada, clique na conta → aba **Chaves → Adicionar chave → Criar nova chave → JSON**.
   - O arquivo `.json` baixado contém `client_email` e `private_key`.
5. **Ative a API do Sheets:** menu **APIs e serviços → Biblioteca**, procure **Google Sheets API** e clique em **Ativar**.
6. Coloque no `.env`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = o `client_email` do JSON
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = a `private_key` completa, entre aspas duplas, com `\n` para quebras de linha (exatamente como está no JSON)

### 2.3 Compartilhar a planilha com a service account
1. Na planilha, clique em **Compartilhar**.
2. Cole o e-mail da service account (o `client_email`).
3. Permissão: **Editor**. Sem isso o app não consegue escrever.

### 2.4 Nome da aba
O app usa a **aba** da planilha (a guia na parte de baixo — não o nome do
arquivo). Se você não definir `GOOGLE_SHEET_NAME`, o app detecta
automaticamente a primeira aba. Para fixar, use o nome exato da guia,
ex.: `GOOGLE_SHEET_NAME=Página1` (contas Google em PT-BR nomeiam a primeira
aba como "Página1", não "Sheet1").

---

## 3. Kiwify

### 3.1 Product ID
1. Kiwify → **Produtos** → clique no seu produto.
2. O `KIWIFY_PRODUCT_ID` fica na URL da página de configuração do produto
   (formato UUID ou hash, ex.: `xxxxxxxx-xxxx-...`).
   - Se não encontrar, deixe vazio: o webhook continua funcionando
     (a validação de produto só acontece quando a variável está preenchida).

### 3.2 API key
1. Acesse [app.kiwify.com.br/config/api](https://app.kiwify.com.br/config/api).
2. Crie/use um token em **Public API** e cole em `KIWIFY_API_KEY`.
   - Obs.: a API key não é usada diretamente pelo webhook hoje; ela fica
     configurada para uso futuro (consultas/validações de pedido).

### 3.3 Checkout URL
- `KIWIFY_CHECKOUT_URL` = a URL atual do seu checkout, ex.:
  `https://pay.kiwify.com.br/GBFAfzT`
- O app adiciona automaticamente os parâmetros suportados pela Kiwify:
  `name`, `email`, `phone` (preenchimento) e `src` (identidade do pedido).
- Parâmetros UTM/s1-s3/sck da sua página são repassados ao checkout.

### 3.4 Webhook
1. Kiwify → **Apps → Webhooks → Criar webhook** (se o menu não aparecer,
   use o atalho de integrações do produto).
2. **URL:** `https://SEU-DOMINIO/api/kiwify/webhook?token=SEU_SEGREDO`
   - `SEU_SEGREDO` = o mesmo valor de `KIWIFY_WEBHOOK_SECRET` do `.env`.
     Gere um valor forte: `openssl rand -hex 32` (no terminal).
3. **Produto:** selecione o seu produto.
4. **Eventos:** marque os de venda — **Compra aprovada** (obrigatório),
   **Compra recusada**, **Compra reembolsada** e **Chargeback** (recomendado).
   - Ignore eventos como "Carrinho abandonado" e "Pix gerado": eles são
     recebidos e descartados sem erro.
5. Salve e use o botão **Testar webhook** para conferir (veja §7).

> **Como o pedido é associado ao pagamento:** o `src` da URL de checkout
> carrega o `order_id`. Quando o webhook devolve esse parâmetro, a associação
> é exata. Se a Kiwify não devolver o `src`, o sistema associa pelo **e-mail**
> do cliente (pedido mais recente com status `AWAITING_PAYMENT`).

### 3.5 Página de sucesso (pós-pagamento)
- O site já tem a página `https://SEU-DOMINIO/pedido-recebido`.
- Se a sua conta Kiwify expõe a opção de **URL de redirecionamento / página
  de obrigado** nas configurações do produto, aponte-a para essa URL.
  (A disponibilidade da opção varia por plano — o fluxo funciona sem ela.)

---

## 4. Resend (e-mail do dono)

1. Crie uma conta em [resend.com](https://resend.com).
2. **Domínios → Adicionar domínio** e verifique seu domínio (registros DNS).
3. **API Keys → Criar API key** → cole em `RESEND_API_KEY`.
4. No `.env`:
   - `EMAIL_FROM` = remetente, ex.: `Estúdio Épico <pedidos@seudominio.com.br>`
     (precisa ser um domínio verificado no Resend)
   - `NOTIFICATION_EMAIL` = e-mail do dono que recebe os pedidos pagos.

---

## 5. Meta Pixel (opcional)

- `VITE_META_PIXEL_ID` = ID do pixel (público, ex.: `1234567890123456`).
- Eventos disparados: `CTA_Click`, `Briefing_Opened`, `Lead` (briefing enviado)
  e `InitiateCheckout` (redirecionamento para a Kiwify).
- **`Purchase` nunca é disparado pelo site** — compra só é considerada
  confirmada pelo webhook da Kiwify.

---

## 6. Variáveis de ambiente (resumo)

Copie `.env.example` para `.env` e preencha:

```
KIWIFY_CHECKOUT_URL=
KIWIFY_PRODUCT_ID=
KIWIFY_API_KEY=
KIWIFY_WEBHOOK_SECRET=
GOOGLE_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=""
GOOGLE_SHEET_NAME=          # opcional
RESEND_API_KEY=
EMAIL_FROM=
NOTIFICATION_EMAIL=
VITE_META_PIXEL_ID=         # opcional
```

- **Local:** o app carrega o `.env` automaticamente em desenvolvimento.
- **Produção:** configure as mesmas variáveis no painel da sua hospedagem
  (as variáveis do ambiente real têm prioridade sobre o `.env`).
- O `.env` está no `.gitignore` — nunca o commit.

---

## 7. Como rodar localmente

```bash
bun install
bun run dev        # http://localhost:8080
```

Para produção:

```bash
bun run build
# e faça o deploy conforme sua hospedagem (Lovable: git push)
```

---

## 8. Teste completo de um pedido (end-to-end)

1. Abra `http://localhost:8080` e clique em **QUERO MINHA MÚSICA**.
2. Preencha o modal e clique em **CONTINUAR PARA PAGAMENTO →**.
3. Você deve ser redirecionado para o checkout Kiwify com nome/e-mail/telefone
   pré-preenchidos.
4. **Na planilha:** uma nova linha deve aparecer com `payment_status =
   AWAITING_PAYMENT` e um `order_id` tipo `MUS-20260831-7KQ2`.
5. Pague usando o checkout de teste da Kiwify (se disponível) ou um cartão real.
6. **Na planilha:** `payment_status` vira `PAID`, `kiwify_transaction_id` e
   `paid_at` são preenchidos, e `notification_status` vira `SENT`.
7. **No e-mail do dono:** chega o e-mail 🎵 com pedido, cliente e briefing.

Se o e-mail não chegar mas o pagamento estiver `PAID` na planilha: o e-mail
falhou (`notification_status = FAILED`). A próxima entrega do webhook tenta
de novo — ou reenvie o webhook manualmente no painel da Kiwify (logs).

---

## 9. Verificar o webhook manualmente

Use o botão **Testar webhook** no painel da Kiwify, ou:

```bash
curl -X POST "https://SEU-DOMINIO/api/kiwify/webhook?token=SEU_SEGREDO" \
  -H "content-type: application/json" \
  -d '{"webhook_event_type":"order_approved","order_status":"paid","order_id":"TESTE","customer":{"email":"voce@email.com"}}'
```

Respostas esperadas:

| Situação | Resposta |
| --- | --- |
| Sem token / token errado | `401 unauthorized` |
| Evento de teste da Kiwify | `200 {"ok":true,"ignored":"test_event"}` |
| Evento sem pedido correspondente | `200 {"ok":true,"ignored":"order_not_found"}` |
| Aprovação de pedido nosso | `200 {"ok":true,"orderId":"MUS-...","status":"PAID"}` |
| Webhook duplicado (já PAID + notificado) | `200 {"ok":true,"duplicate":true,...}` — **sem** segundo e-mail |
| Google indisponível | `503` — a Kiwify reentrega depois |

---

## 10. Testar entrega duplicada com segurança

1. Faça um pedido de teste e aprove o pagamento (1º webhook → e-mail enviado,
   `notification_status = SENT`).
2. No painel da Kiwify (logs do webhook), clique em **Reenviar** a mesma entrega.
3. Resultado esperado: resposta `duplicate: true`, **nenhum** novo e-mail,
   planilha inalterada.
4. Para testar a recuperação de e-mail: apague o `SENT` da coluna
   `notification_status` e reenvie o webhook — o e-mail deve ser enviado de novo.

---

## 11. Fluxo manual do dono (como operar)

1. Recebe o e-mail 🎵 **NOVO PEDIDO** com o briefing.
2. Confere na planilha que `payment_status = PAID`.
3. Produz a música.
4. Envia o download para o e-mail do cliente (você mesmo, manualmente).
5. Atualiza a planilha: `delivery_status = DELIVERED` e `download_url` (se tiver).
