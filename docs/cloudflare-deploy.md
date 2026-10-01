# Deploy na Cloudflare Workers

O aviso “Update your Wrangler configuration ... to keep deployments in sync” indica uma diferença entre o painel e a configuração do projeto. Não é, por si só, um erro de build.

## Configuração persistente

O arquivo de origem é `wrangler.json`, na raiz. Ele contém somente identificadores, ofertas, contatos e outras variáveis sem segredo. O Nitro o lê no build e gera `.output/server/wrangler.json`, com o entrypoint e os assets corretos. Não edite o arquivo gerado: o próximo build o substitui.

`keep_vars: true` preserva variáveis adicionais configuradas no painel durante o deploy. Os valores declarados em `vars` continuam sendo gerenciados pelo projeto. Essa opção **não criptografa** variáveis que já estejam no painel como texto.

O nome atual do Worker foi preservado: `leonardever-idea-to-music-main`. Se o Worker usado no painel tiver outro nome, ajuste `name` antes de publicar para evitar criar outro Worker.

## Credenciais no painel

Os valores privados compartilhados na conversa devem ser revogados nos respectivos provedores e substituídos. Em **Workers & Pages → seu Worker → Settings → Variables and Secrets**, cadastre os novos valores com tipo **Secret**, nunca como variável de texto:

| Nome | Provedor |
| --- | --- |
| `CAKTO_CLIENT_SECRET` | Cakto |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Google Cloud |

O fluxo atual usa a Cakto. Credenciais Kiwify só são necessárias para uma integração que as utilize. Revogue a credencial Resend compartilhada; não é necessário criar outra, pois o envio de e-mails será manual.

Se houver uma variável de texto com o mesmo nome, substitua-a pelo Secret. Não mantenha o valor antigo em `vars`, Git ou arquivos compartilhados. Não copie o JSON completo enviado pelo painel para o projeto.

Para a chave do Google, copie o campo `private_key` da nova credencial da conta de serviço. O servidor aceita tanto quebras de linha reais quanto `\n` escapados. Mantenha as linhas BEGIN/END PRIVATE KEY.

O código também exige **`CAKTO_WEBHOOK_SECRET`** para autenticar `/api/webhook/cakto`. Esse nome não apareceu na lista enviada: confira se já existe como Secret e se o valor corresponde ao webhook configurado na Cakto. Sem ele, o endpoint rejeita notificações com HTTP 503 e não atualiza a confirmação de pagamento na planilha. Se o webhook legado da Kiwify continuar em uso, cadastre também `KIWIFY_WEBHOOK_SECRET` com o valor correspondente.

Os `CLIENT_ID` são identificadores; o client ID da Cakto é utilizado pelo SDK público de cartão. Os `CLIENT_SECRET` e a chave privada permanecem exclusivamente no servidor.

Se a renovação da credencial Cakto também gerar outro client ID, atualize **ambos** `CAKTO_CLIENT_ID` e `VITE_CAKTO_SDK_CLIENT_ID` no projeto e confira possíveis sobrescritas no ambiente do build.

## Variáveis do navegador

`VITE_CAKTO_SDK_CLIENT_ID`, `VITE_META_PIXEL_ID` e `VITE_WHATSAPP_NUMBER` entram no JavaScript durante o build. Configurá-las apenas como variáveis de execução do Worker não altera um bundle já publicado.

`vite.config.ts` agora usa os valores públicos do `wrangler.json` como padrão. Valores `VITE_*` definidos no ambiente do build ou no `.env` local têm prioridade, inclusive valores vazios usados para desativar uma integração. Para mudar essas três configurações, ajuste o arquivo ou o ambiente do build e execute um novo build. Nunca crie uma variável `VITE_*` contendo um segredo.

## Build e publicação

No projeto:

```powershell
npm.cmd run build
```

O Nitro também escreve `.wrangler/deploy/config.json`, que direciona o Wrangler à configuração gerada. Para o deploy manual, depois de conferir o Worker e configurar os Secrets:

```powershell
npx.cmd wrangler deploy
```

No Cloudflare Workers Builds, use `npm run build` como comando de build e `npx wrangler deploy` como comando de deploy, a partir da raiz do projeto. Não é uma publicação estática apenas da pasta `dist`: pedidos e webhooks precisam do Worker servidor.

Este ajuste local não publica o Worker nem modifica credenciais no painel.

## E-mails manuais

`ORDER_EMAIL_NOTIFICATIONS=false` no `wrangler.json` desativa o aviso automático ao dono. A entrega da música ao cliente continua manual: acompanhe `payment_status=PAID` na planilha, envie o e-mail pelo seu serviço habitual e atualize `delivery_status` (O) e `download_url` (P). Nos novos pagamentos, `notification_status` (Q) recebe `DISABLED`.

`RESEND_API_KEY`, `EMAIL_FROM` e `NOTIFICATION_EMAIL` não são necessários nesse modo. Valores antigos ainda presentes no painel não ativam o envio; podem ser removidos. Sem `ORDER_EMAIL_NOTIFICATIONS`, o padrão também é desativado.

Para ativar o aviso ao dono futuramente, altere `ORDER_EMAIL_NOTIFICATIONS` para `true` e configure os três valores Resend. Nesse caso, `EMAIL_FROM` precisa de um domínio verificado no Resend. O aviso é sobre um pedido pago, e não entrega a música automaticamente.

## Validação local

Build e TypeScript aprovados; lint sem erros, com seis avisos anteriores de Fast Refresh nos componentes UI. A configuração gerada preserva `keep_vars`, replica as variáveis públicas e não inclui valores privados em `vars`. A configuração do Vite também foi verificada sem `.env`: os três padrões públicos são aplicados e as sobrescritas do ambiente, inclusive valores vazios, têm prioridade. O deploy remoto e as credenciais dos provedores não foram testados.

Para verificar o fluxo de notificações sem APIs externas: `node --test scripts/order-notifications.test.mjs`.

## Conferência após publicar

- Confira os Secrets da Cakto e do Google, incluindo `CAKTO_WEBHOOK_SECRET`.
- Confirme que o número do WhatsApp, o Pixel e o SDK usam os valores desejados para produção.
- Verifique as cinco ofertas da Cakto e o compartilhamento da planilha com a conta de serviço.
- Confira `ORDER_EMAIL_NOTIFICATIONS=false` para manter o envio manual e os avisos automáticos desativados.
- Valide um pedido de teste e o recebimento do webhook conforme o ambiente de testes do provedor antes de liberar o checkout.

Referências: [configuração e keep_vars](https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth), [Secrets da Cloudflare](https://developers.cloudflare.com/workers/configuration/secrets/), [Nitro e Cloudflare](https://nitro.build/deploy/providers/cloudflare), [remetentes no Resend](https://resend.com/docs/dashboard/domains/introduction).
