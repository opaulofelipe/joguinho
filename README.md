# PERFIL — O jogo das dez dicas

Um jogo de conhecimento, feito em **HTML, CSS e JavaScript puro**, com **192 cartas**, organizadas em **8 categorias com 24 perfis cada**, e **10 dicas progressivas por carta** e interface adaptada para celulares, tablets e computadores. Não precisa de framework, npm nem conexão com serviços externos.

## Arquivos

```text
perfil-game/
├── index.html          Interface e estrutura semântica
├── styles.css          Identidade visual e layout responsivo
├── script.js           Carregamento do JSON e lógica do jogo
└── data/
    └── perfis.json     Categorias, respostas e dicas
```

## Como executar

**Recomendado:** abra um terminal na pasta `perfil-game` e execute:

```bash
python -m http.server 8000
```

Depois, abra no navegador: **http://localhost:8000**.

Isso é necessário porque navegadores geralmente bloqueiam leitura automática de arquivos JSON quando a página é aberta via `file://`. **Alternativa sem terminal:** dê dois cliques em `index.html`, clique em **“Selecionar um JSON do dispositivo”** e escolha `data/perfis.json`. Nesse caso, o arquivo será lido somente naquela sessão; a próxima abertura pedirá o JSON novamente.

Para publicar online, basta subir esta pasta inteira em um servidor estático, como GitHub Pages, Netlify ou Vercel (preservando a estrutura de diretórios). Em hospedagem HTTPS, o carregamento é automático.

## Como jogar

1. A **resposta aparece imediatamente**, de acordo com o funcionamento solicitado.
2. Clique em **Revelar dica 01** para abrir a primeira pista; continue até a décima.
3. As dicas anteriores permanecem abaixo da pista atual.
4. Clique em **Ocultar resposta** para jogar no modo desafio e tentar descobrir a solução sem vê-la. Essa opção também funciona antes da primeira dica.
5. Use **Próxima carta** para sortear um novo perfil. O sistema percorre o acervo em ordem embaralhada, sem repetir cartas dentro de um ciclo de uma categoria. Para uma categoria com apenas um perfil, o botão reinicia a carta.
6. **Recomeçar dicas** zera somente as pistas do perfil atual.

## Como aumentar o banco de respostas

Edite apenas `data/perfis.json`. Cada novo perfil deve ter um `id` **único**, a `categoria` correspondente a uma das IDs em `categorias`, a `resposta` e **exatamente 10 strings** em `dicas`.

Exemplo de nova carta para uma categoria já existente (adicione como novo objeto dentro do array `perfis`, separado por vírgula do anterior):

```json
{
  "id": "exemplo-novo-pais",
  "categoria": "paises",
  "resposta": "Nome do país",
  "dicas": [
    "Dica 1 — mais difícil.",
    "Dica 2.",
    "Dica 3.",
    "Dica 4.",
    "Dica 5.",
    "Dica 6.",
    "Dica 7.",
    "Dica 8.",
    "Dica 9.",
    "Dica 10 — mais fácil."
  ]
}
```

Para incluir novos temas, primeiro crie uma nova categoria em `categorias` com uma ID inédita e depois atribua-a aos novos perfis. O menu e as contagens se atualizam automaticamente. É obrigatório manter um JSON válido (aspas duplas e vírgulas entre objetos). A aplicação valida a estrutura e informa erros. O acervo atualmente possui **192 perfis e 1.920 dicas**.

## Decisões de interface

- **Mobile-first**: categorias roláveis na horizontal em telas pequenas e coluna lateral no desktop.
- **Legibilidade**: contraste entre superfícies, tamanhos de texto fluidos e hierarquia tipográfica clara.
- **Interação acessível**: botões com pelo menos 44 px de altura, estados de foco visíveis, botões nativos, rótulos acessíveis e regiões de anúncio para dicas.
- **Movimento responsável**: animações discretas que respeitam a preferência `prefers-reduced-motion`.
- **Sem dependências externas**: tipografia local, CSS e JavaScript nativos, sem bibliotecas nem fontes obrigatórias.

Referências: [web.dev — Responsive web design](https://web.dev/articles/responsive-web-design-basics), [web.dev — Accessible responsive design](https://web.dev/articles/accessible-responsive-design), [WCAG 2.2 — Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum), [Apple Developer — Design advanced games](https://developer.apple.com/videos/play/wwdc2024/10085/).


## Partidas com jogadores (atualização)

No pré-lobby, insira de **2 a 6 nomes** (máximo de 24 caracteres por nome), escolha o tema e clique em **Começar partida**. O primeiro jogador cadastrado começa como **leitor**, que vê a resposta e revela cada dica; os demais são candidatos a acertar. O leitor não pode ser escolhido como acertador, mas **também recebe pontos**.

Depois de uma ou mais dicas, se alguém acertar após **N dicas**: quem acertou recebe **11 − N pontos** e o leitor recebe **N pontos**. Exemplos: 1 dica = **10 para o acertador e 1 para o leitor**; 2 dicas = **9 e 2**; 5 dicas = **6 e 5**; 10 dicas = **1 e 10**. Quando **ninguém acerta**, o leitor recebe **10 pontos** e os demais recebem zero. Apenas **um acerto por rodada** pode ser registrado. O sistema habilita **Próxima rodada** após registrar um acerto ou ninguém acertar, alternando o leitor pela ordem original de cadastro, inclusive nas rodadas sem pontuação. O placar acumula pontos. Ao atingir ou ultrapassar **100 pontos**, seja como leitor ou acertador, o participante vence e vê uma comemoração animada, com resultado final e opção de revanche. Se dois jogadores cruzarem 100 na mesma rodada, ganha aquele com maior pontuação total; no empate, quem acertou a resposta.

O botão **Lobby** permite encerrar a partida atual e modificar jogadores. O modo **Explorar cartas sem pontuação** preserva as funcionalidades originais (trocar categoria, revelar dicas, reiniciar carta). Em partida, o tema é fixado no início para evitar mudar a carta antes de pontuar. O JSON de cartas continua independente e não precisa de alterações.

*Observação*: esta é uma partida local no mesmo aparelho, com pontuação controlada por quem está lendo. O estado da partida não é salvo ao fechar ou recarregar a página. Para partidas longas até 100 pontos, recomenda-se manter a página aberta. O acervo atualmente tem 192 cartas, que podem voltar a aparecer após um ciclo completo de sorteio.

## Acervo atual (outubro de 2026)

Cada categoria possui 24 perfis: **Personagens históricos**, **Atores**, **Atrizes**, **Diretores**, **Países**, **Escritores**, **Escritoras** e **Biologia**. A antiga categoria **Órgãos do corpo humano** foi expandida para Biologia e usa a ID `biologia`, contendo também células, genética, evolução, ecologia, microbiologia, processos biológicos e sistemas do corpo. A carta do pâncreas foi mantida com sua categoria atualizada.

O arquivo `data/perfis.json` continua sendo a única fonte de cartas e dicas. Para incluir novos itens, crie novos objetos no array `perfis` com ID exclusiva, categoria válida e exatamente dez dicas. O acervo é carregado dinamicamente sem mudança necessária no código JavaScript. As cartas existentes são mantidas ao ampliar o banco.


## Salvamento automático das partidas

- A partida multijogador é salva no **localStorage** do navegador, na chave `perfil.joguinho.partida.v1`. Isso permite **continuar após recarregar a página ou publicar alterações no site**, desde que continue sendo acessado no mesmo navegador e domínio.
- O estado guardado inclui nomes e pontuações, jogador leitor, rodada, categoria, ID da carta atual, fila de próximas cartas, quantidade de dicas já abertas, resultado da rodada (quando registrado) e se a resposta estava visível.
- Cada nova rodada começa **com a resposta oculta**. Somente ao tocar em **Revelar resposta** o leitor visualiza a resposta. Se atualizar a página durante a rodada, também será restaurada a visibilidade atual da resposta, sem exibi-la automaticamente.
- As alterações são salvas a cada dica, cada alternância de visibilidade da resposta, cada registro de resultado e cada avanço de rodada. A partida **não termina ao atualizar a página**. A única forma de encerrá-la antes dos 100 pontos é o botão **Reiniciar partida**, com confirmação.
- Quando alguém chega a **100 pontos ou mais**, o registro salvo é apagado e a animação de vitória é exibida.
- Se uma atualização do arquivo JSON remover a carta que estava aberta, o jogo mantém o placar e inicia outra carta.
- O salvamento é **local ao navegador** e não sincroniza entre dispositivos. Limpar dados do site, navegar em modo privado ou trocar de domínio pode eliminar o progresso. Se o navegador bloquear armazenamento local, a partida continua na aba, mas uma mensagem no placar avisa que não foi possível salvá-la.
