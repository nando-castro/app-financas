# Instalação do Finanças

O frontend é um PWA: pode ser instalado pelo navegador, com ícone na tela inicial e janela própria. Não gera um arquivo APK nem publica nas lojas.

## Publicação

1. Configure `VITE_API_URL` para a URL HTTPS da API acessível pelo dispositivo.
2. Execute `pnpm install --frozen-lockfile` e `pnpm build`.
3. Publique a pasta `dist` em HTTPS, na raiz do domínio. Configure o servidor para retornar `index.html` nas rotas do React e servir os arquivos estáticos normalmente.
4. Sirva `sw.js`, `index.html` e `manifest.webmanifest` com revalidação (`Cache-Control: no-cache`). Os arquivos com hash em `assets` podem receber cache longo.

O service worker é gerado somente no build de produção. Para conferir localmente, use `pnpm build` e `pnpm preview` em localhost. Acesso pelo IP da rede em HTTP não atende ao requisito de contexto seguro no celular.

## Instalar

- Android/Chrome ou computador com navegador compatível: abra o site e toque em **Instalar app** quando a opção aparecer. Também é possível usar a opção de instalação no menu do navegador. A disponibilidade depende do navegador.
- iPhone/iPad: abra no Safari, use **Compartilhar → Adicionar à Tela de Início** e confirme.
- Ao abrir em modo instalado, o convite de instalação fica oculto.

## Atualizações e conexão

Uma nova versão exibe **Atualizar** quando o navegador detecta o novo service worker. Salve os formulários antes de aceitar; a página será recarregada. **Agora não** permite continuar usando a versão atual.

Apenas os arquivos estáticos do frontend são armazenados pelo service worker. Consultas e alterações financeiras precisam de internet; não há cache das respostas da API nem sincronização de alterações offline.

## Conferência no dispositivo

Confira no DevTools, em Application, o manifesto e o service worker sem erros; instale pelo navegador e abra pelo ícone. Confira também o fluxo manual no Safari. Após publicar outra versão, reabra o app para verificar o aviso de atualização. A validação final de instalação deve ser feita no domínio HTTPS e nos dispositivos de destino.

Referência da integração: https://vite-pwa-org.netlify.app/frameworks/react.html
