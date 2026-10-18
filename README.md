# PERFIL — O jogo das dez dicas

Um jogo de conhecimento, feito em **HTML, CSS e JavaScript puro**, com **8 cartas iniciais**, uma de cada categoria solicitada, **10 dicas progressivas por carta** e interface adaptada para celulares, tablets e computadores. Não precisa de framework, npm nem conexão com serviços externos.

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

Para incluir novos temas, primeiro crie uma nova categoria em `categorias` com uma ID inédita e depois atribua-a aos novos perfis. O menu e as contagens se atualizam automaticamente. É obrigatório manter um JSON válido (aspas duplas e vírgulas entre objetos). A aplicação valida a estrutura e informa erros.

## Decisões de interface

- **Mobile-first**: categorias roláveis na horizontal em telas pequenas e coluna lateral no desktop.
- **Legibilidade**: contraste entre superfícies, tamanhos de texto fluidos e hierarquia tipográfica clara.
- **Interação acessível**: botões com pelo menos 44 px de altura, estados de foco visíveis, botões nativos, rótulos acessíveis e regiões de anúncio para dicas.
- **Movimento responsável**: animações discretas que respeitam a preferência `prefers-reduced-motion`.
- **Sem dependências externas**: tipografia local, CSS e JavaScript nativos, sem bibliotecas nem fontes obrigatórias.

Referências: [web.dev — Responsive web design](https://web.dev/articles/responsive-web-design-basics), [web.dev — Accessible responsive design](https://web.dev/articles/accessible-responsive-design), [WCAG 2.2 — Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum), [Apple Developer — Design advanced games](https://developer.apple.com/videos/play/wwdc2024/10085/).
