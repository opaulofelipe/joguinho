/*
  PERFIL — jogo de cartas com 10 dicas.
  Fonte única de conteúdo: data/perfis.json.
  Para adicionar cartas, edite apenas o JSON; não é necessário editar este arquivo.
*/
(() => {
  'use strict';

  const MAX_TIPS = 10;
  const $ = (id) => document.getElementById(id);
  const el = {
    game: $('gameColumn'), categoryList: $('categoryList'), totalProfiles: $('totalProfiles'),
    cardNumber: $('cardNumber'), answerHeading: $('answerHeading'), answerLabel: $('answerLabel'),
    answerDescription: $('answerDescription'), categoryTag: $('categoryTag'),
    toggleAnswer: $('toggleAnswer'), toggleAnswerText: $('toggleAnswerText'),
    clueCounter: $('clueCounter'), progressSegments: $('progressSegments'),
    currentClue: $('currentClue'), nextClueButton: $('nextClueButton'),
    nextClueText: $('nextClueText'), resetButton: $('resetButton'),
    historySection: $('historySection'), historyCount: $('historyCount'),
    historyList: $('historyList'), remainingLabel: $('remainingLabel'),
    nextProfileButton: $('nextProfileButton'), errorPanel: $('errorPanel'),
    errorDetail: $('errorDetail'), retryButton: $('retryButton'), fileInput: $('fileInput'),
    helpButton: $('helpButton'), helpDialog: $('helpDialog'),
    closeHelp: $('closeHelp'), dialogOkay: $('dialogOkay')
  };

  const state = {
    data: null,
    selectedCategory: 'todos',
    card: null,
    count: 0,
    answerVisible: true, // Conforme solicitado, a resposta começa visível.
    queue: []
  };

  function pad(value) { return String(value).padStart(2, '0'); }

  function loadAndValidate(raw) {
    if (!raw || !Array.isArray(raw.categorias) || !Array.isArray(raw.perfis)) {
      throw new Error('O JSON precisa conter os campos "categorias" e "perfis", ambos como listas.');
    }
    const categoryIds = new Set();
    for (const category of raw.categorias) {
      if (!category || typeof category.id !== 'string' || !category.id.trim() ||
          typeof category.nome !== 'string' || !category.nome.trim() || categoryIds.has(category.id)) {
        throw new Error('Há uma categoria inválida ou duplicada no JSON.');
      }
      categoryIds.add(category.id);
    }
    if (!raw.perfis.length) throw new Error('O acervo precisa conter ao menos um perfil.');
    const profileIds = new Set();
    for (const profile of raw.perfis) {
      if (!profile || typeof profile.id !== 'string' || !profile.id.trim() ||
          profileIds.has(profile.id) || !categoryIds.has(profile.categoria) ||
          typeof profile.resposta !== 'string' || !profile.resposta.trim() ||
          !Array.isArray(profile.dicas) || profile.dicas.length !== MAX_TIPS ||
          !profile.dicas.every((tip) => typeof tip === 'string' && tip.trim())) {
        throw new Error(`Perfil inválido: ${profile?.id ?? '(sem ID)'}. Confira ID, categoria, resposta e as 10 dicas.`);
      }
      profileIds.add(profile.id);
    }
    return raw;
  }

  function getEligible() {
    return state.selectedCategory === 'todos'
      ? state.data.perfis
      : state.data.perfis.filter((profile) => profile.categoria === state.selectedCategory);
  }

  function getCategoryName(categoryId) {
    return state.data.categorias.find((c) => c.id === categoryId)?.nome ?? 'Categoria';
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function chooseNextCard() {
    const eligible = getEligible();
    if (!eligible.length) return;
    if (!state.queue.length) {
      state.queue = shuffle(eligible);
      if (state.queue.length > 1 && state.queue[0].id === state.card?.id) {
        [state.queue[0], state.queue[1]] = [state.queue[1], state.queue[0]];
      }
    }
    state.card = state.queue.shift();
    state.count = 0;
    renderCard();
    renderClues();
    el.nextClueButton.disabled = false;
    el.nextProfileButton.disabled = false;
  }

  function renderCategories() {
    const rows = [
      { id: 'todos', nome: 'Todos os temas' },
      ...state.data.categorias
    ];
    el.categoryList.replaceChildren();
    rows.forEach((category, index) => {
      const total = category.id === 'todos'
        ? state.data.perfis.length
        : state.data.perfis.filter((p) => p.categoria === category.id).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-button';
      button.setAttribute('aria-pressed', String(state.selectedCategory === category.id));
      button.disabled = total === 0;
      button.title = total ? `${total} perfil(is) nesta categoria` : 'Sem perfis nesta categoria';
      const num = document.createElement('span');
      num.className = 'category-index';
      num.textContent = index === 0 ? '✳' : pad(index);
      num.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'category-label';
      label.textContent = category.nome;
      const count = document.createElement('span');
      count.className = 'category-count';
      count.textContent = pad(total);
      count.setAttribute('aria-hidden', 'true');
      button.append(num, label, count);
      button.addEventListener('click', () => {
        if (state.selectedCategory === category.id) return;
        state.selectedCategory = category.id;
        state.queue = [];
        state.card = null;
        renderCategories();
        chooseNextCard();
      });
      el.categoryList.append(button);
    });
    el.totalProfiles.textContent = String(state.data.perfis.length);
  }

  function renderCard() {
    if (!state.card) return;
    const index = state.data.perfis.findIndex((p) => p.id === state.card.id) + 1;
    el.cardNumber.textContent = `Nº ${String(index).padStart(3, '0')}`;
    el.categoryTag.textContent = getCategoryName(state.card.categoria).toLocaleUpperCase('pt-BR');
    el.answerHeading.textContent = state.answerVisible ? state.card.resposta : 'Quem será?';
    el.answerHeading.classList.toggle('is-hidden', !state.answerVisible);
    el.answerLabel.textContent = state.answerVisible ? 'A RESPOSTA É' : 'MODO DESAFIO';
    el.answerDescription.textContent = state.answerVisible
      ? 'Conheça este perfil, uma dica por vez.'
      : 'Resposta oculta. Descubra antes da última dica.';
    el.toggleAnswerText.textContent = state.answerVisible ? 'Ocultar resposta' : 'Mostrar resposta';
    el.toggleAnswer.setAttribute('aria-pressed', String(!state.answerVisible));
    el.toggleAnswer.setAttribute('aria-label', state.answerVisible ? 'Ocultar resposta da carta' : 'Mostrar resposta da carta');
    const eligibleCount = getEligible().length;
    el.nextProfileButton.querySelector('span').textContent = eligibleCount > 1 ? 'Próxima carta' : 'Recomeçar carta';
  }

  function renderClues() {
    if (!state.card) return;
    const revealed = state.count;
    el.clueCounter.textContent = `${pad(revealed)} / ${MAX_TIPS}`;
    el.progressSegments.setAttribute('aria-label', `${revealed} de ${MAX_TIPS} dicas reveladas`);
    el.progressSegments.replaceChildren();
    for (let i = 0; i < MAX_TIPS; i++) {
      const segment = document.createElement('span');
      if (i < revealed) segment.className = 'is-filled';
      segment.setAttribute('aria-hidden', 'true');
      el.progressSegments.append(segment);
    }

    el.currentClue.replaceChildren();
    const clueIndex = document.createElement('div');
    clueIndex.className = 'clue-index';
    const smallLabel = document.createElement('span');
    smallLabel.textContent = 'PISTA';
    const largeNumber = document.createElement('strong');
    largeNumber.textContent = pad(revealed || 1);
    clueIndex.append(smallLabel, largeNumber);
    const clueText = document.createElement('p');
    clueText.textContent = revealed
      ? state.card.dicas[revealed - 1]
      : 'Pronto para começar? Toque no botão abaixo para revelar a primeira dica.';
    el.currentClue.append(clueIndex, clueText);
    el.currentClue.classList.toggle('is-revealed', revealed > 0);
    el.currentClue.classList.remove('clue-enter');
    if (revealed > 0) {
      // Reinicia a entrada visual sem afetar preferências de movimento reduzido.
      void el.currentClue.offsetWidth;
      el.currentClue.classList.add('clue-enter');
    }
    el.nextClueButton.disabled = revealed === MAX_TIPS;
    el.nextClueText.textContent = revealed === MAX_TIPS
      ? 'Todas as dicas reveladas'
      : `Revelar dica ${pad(revealed + 1)}`;
    el.resetButton.disabled = revealed === 0;
    el.remainingLabel.textContent = revealed === MAX_TIPS
      ? 'Carta completa. Escolha outra para continuar.'
      : `${MAX_TIPS - revealed} ${MAX_TIPS - revealed === 1 ? 'dica disponível' : 'dicas disponíveis'}`;

    const previous = revealed > 1 ? state.card.dicas.slice(0, revealed - 1) : [];
    el.historySection.hidden = previous.length === 0;
    el.historyCount.textContent = String(previous.length);
    el.historyList.replaceChildren();
    previous.forEach((text, index) => {
      const item = document.createElement('li');
      const number = document.createElement('strong');
      number.textContent = pad(index + 1);
      const content = document.createElement('span');
      content.textContent = text;
      item.append(number, content);
      el.historyList.append(item);
    });
  }

  function showError(message) {
    el.errorDetail.textContent = message;
    el.errorPanel.hidden = false;
    el.game.classList.add('is-error');
  }

  function initializeData(raw) {
    state.data = loadAndValidate(raw);
    state.selectedCategory = 'todos';
    state.queue = [];
    state.card = null;
    state.count = 0;
    state.answerVisible = true;
    el.game.classList.remove('is-error');
    el.errorPanel.hidden = true;
    renderCategories();
    chooseNextCard();
  }

  async function fetchData() {
    try {
      const response = await fetch('./data/perfis.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}.`);
      initializeData(await response.json());
    } catch (error) {
      const localFile = window.location.protocol === 'file:';
      showError(localFile
        ? 'Para abrir com um clique duplo, selecione o arquivo data/perfis.json no botão abaixo. Para carregar automaticamente, use um servidor local (instruções no README).'
        : `Não foi possível ler data/perfis.json. ${error.message}`);
    }
  }

  el.toggleAnswer.addEventListener('click', () => {
    if (!state.card) return;
    state.answerVisible = !state.answerVisible;
    renderCard();
  });
  el.nextClueButton.addEventListener('click', () => {
    if (!state.card || state.count >= MAX_TIPS) return;
    state.count++;
    renderClues();
  });
  el.resetButton.addEventListener('click', () => {
    if (!state.card) return;
    state.count = 0;
    renderClues();
  });
  el.nextProfileButton.addEventListener('click', chooseNextCard);
  el.retryButton.addEventListener('click', fetchData);
  el.fileInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      initializeData(JSON.parse(await file.text()));
    } catch (error) {
      showError(`Este arquivo não pôde ser utilizado: ${error.message}`);
    } finally {
      el.fileInput.value = '';
    }
  });
  el.helpButton.addEventListener('click', () => el.helpDialog.showModal());
  el.closeHelp.addEventListener('click', () => el.helpDialog.close());
  el.dialogOkay.addEventListener('click', () => el.helpDialog.close());
  el.helpDialog.addEventListener('click', (event) => {
    if (event.target === el.helpDialog) el.helpDialog.close();
  });

  fetchData();
})();
