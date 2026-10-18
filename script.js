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
    closeHelp: $('closeHelp'), dialogOkay: $('dialogOkay'),
    lobbyScreen: $('lobbyScreen'), workspace: $('workspace'),
    lobbyForm: $('lobbyForm'), playerFields: $('playerFields'),
    playerCount: $('playerCount'), addPlayerButton: $('addPlayerButton'),
    lobbyCategory: $('lobbyCategory'), lobbyFeedback: $('lobbyFeedback'),
    startMatchButton: $('startMatchButton'), soloButton: $('soloButton'),
    backToLobbyButton: $('backToLobbyButton'),
    matchDashboard: $('matchDashboard'), roundNumber: $('roundNumber'),
    readerName: $('readerName'), scoreboard: $('scoreboard'),
    awardPanel: $('awardPanel'), awardTitle: $('awardTitle'),
    awardSubtitle: $('awardSubtitle'), roundPoints: $('roundPoints'),
    awardChoices: $('awardChoices'), noCorrectButton: $('noCorrectButton'),
    winnerDialog: $('winnerDialog'), winnerName: $('winnerName'),
    winnerScore: $('winnerScore'), confettiLayer: $('confettiLayer'),
    winnerStandings: $('winnerStandings'), newMatchButton: $('newMatchButton'),
    winnerLobbyButton: $('winnerLobbyButton')
  };

  const state = {
    data: null,
    selectedCategory: 'todos',
    card: null,
    count: 0,
    answerVisible: true, // A resposta fica visível ao leitor.
    queue: [],
    mode: 'lobby',
    match: null,
    roundResolved: false,
    lastResult: null,
    winnerId: null
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
    state.answerVisible = true;
    state.roundResolved = false;
    state.lastResult = null;
    renderCard();
    renderClues();
    el.nextProfileButton.disabled = state.mode === 'match';
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
      button.disabled = total === 0 || state.mode === 'match';
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
        if (state.selectedCategory === category.id || state.mode === 'match') return;
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
    el.answerDescription.textContent = state.mode === 'match'
      ? 'Apenas o leitor deve ver a resposta e apresentar as pistas.'
      : (state.answerVisible ? 'Conheça este perfil, uma dica por vez.' : 'Resposta oculta. Descubra antes da última dica.');
    el.toggleAnswerText.textContent = state.answerVisible ? 'Ocultar resposta' : 'Mostrar resposta';
    el.toggleAnswer.setAttribute('aria-pressed', String(!state.answerVisible));
    el.toggleAnswer.setAttribute('aria-label', state.answerVisible ? 'Ocultar resposta da carta' : 'Mostrar resposta da carta');
    const eligibleCount = getEligible().length;
    el.nextProfileButton.querySelector('span').textContent = state.mode === 'match'
      ? 'Próxima rodada'
      : eligibleCount > 1 ? 'Próxima carta' : 'Recomeçar carta';
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
    el.nextClueButton.disabled = state.roundResolved || revealed === MAX_TIPS;
    el.nextClueText.textContent = revealed === MAX_TIPS
      ? 'Todas as dicas reveladas'
      : `Revelar dica ${pad(revealed + 1)}`;
    el.resetButton.disabled = state.mode === 'match' || revealed === 0;
    el.remainingLabel.textContent = revealed === MAX_TIPS
      ? 'Carta completa. Escolha outra para continuar.'
      : `${MAX_TIPS - revealed} ${MAX_TIPS - revealed === 1 ? 'dica disponível' : 'dicas disponíveis'}`;

    if (state.mode === 'match') {
      el.remainingLabel.textContent = state.roundResolved
        ? 'Rodada registrada. Passe o aparelho ao próximo leitor.'
        : revealed === MAX_TIPS ? 'Todas as dicas reveladas. Registre o resultado.'
        : revealed ? 'Se alguém acertou, registre os pontos abaixo.' : 'O leitor deve revelar a primeira dica.';
    }
    el.nextProfileButton.disabled = state.mode === 'match' && (!state.roundResolved || !!state.winnerId);
    renderAwardPanel();
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
    el.lobbyScreen.hidden = true;
    el.workspace.hidden = false;
    el.matchDashboard.hidden = true;
    el.backToLobbyButton.hidden = true;
  }

  function initializeData(raw) {
    state.data = loadAndValidate(raw);
    state.selectedCategory = 'todos';
    state.queue = [];
    state.card = null;
    state.count = 0;
    state.answerVisible = true;
    state.match = null;
    state.mode = 'lobby';
    state.roundResolved = false;
    state.winnerId = null;
    el.game.classList.remove('is-error');
    el.errorPanel.hidden = true;
    renderLobbyCategories();
    renderCategories();
    chooseNextCard();
    el.startMatchButton.disabled = false;
    showLobby();
  }

  function getReader() {
    if (!state.match) return null;
    return state.match.players[state.match.readerIndex] || null;
  }

  function renderLobbyCategories() {
    const previous = el.lobbyCategory.value || state.selectedCategory || 'todos';
    el.lobbyCategory.replaceChildren();
    const categories = [{id:'todos',nome:'Todos os temas'},...state.data.categorias];
    for (const category of categories) {
      if (category.id !== 'todos' && !state.data.perfis.some(p => p.categoria === category.id)) continue;
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.nome;
      el.lobbyCategory.append(option);
    }
    el.lobbyCategory.value = [...el.lobbyCategory.options].some(x=>x.value===previous) ? previous : 'todos';
  }

  function refreshPlayerRows() {
    const rows = [...el.playerFields.children];
    el.playerCount.textContent = rows.length + ' / 6';
    el.addPlayerButton.disabled = rows.length >= 6;
    for (const [index,row] of rows.entries()) {
      const input = row.querySelector('input');
      const badge = row.querySelector('.player-index-badge');
      const remove = row.querySelector('button');
      input.setAttribute('aria-label','Nome do jogador '+(index + 1));
      input.placeholder = 'Nome do jogador '+(index + 1);
      badge.textContent = '0'+(index + 1);
      remove.disabled = rows.length <= 2;
      remove.setAttribute('aria-label','Remover jogador '+(index+1));
    }
  }

  function addPlayerRow(name='') {
    if (el.playerFields.children.length >= 6) return;
    const row = document.createElement('div');
    row.className = 'lobby-player-row';
    const badge = document.createElement('span');
    badge.className = 'player-index-badge';
    const input = document.createElement('input');
    input.className = 'player-input';
    input.type = 'text';
    input.maxLength = 24;
    input.autocomplete = 'off';
    input.value = name;
    input.required = true;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-player-button';
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      if (el.playerFields.children.length <= 2) return;
      row.remove();
      el.lobbyFeedback.textContent = '';
      refreshPlayerRows();
    });
    row.append(badge,input,remove);
    el.playerFields.append(row);
    refreshPlayerRows();
  }

  function fillPlayerRows(names) {
    el.playerFields.replaceChildren();
    (names && names.length >= 2 ? names.slice(0,6) : ['','']).forEach(name=>addPlayerRow(name));
  }

  function showLobby(names) {
    const formerNames = names || state.match?.players.map(player=>player.name) || null;
    if (el.winnerDialog.open) el.winnerDialog.close();
    state.mode = 'lobby';
    state.match = null;
    state.roundResolved = false;
    state.winnerId = null;
    el.lobbyScreen.hidden = false;
    el.workspace.hidden = true;
    el.matchDashboard.hidden = true;
    el.backToLobbyButton.hidden = true;
    el.lobbyFeedback.textContent = '';
    if (formerNames || !el.playerFields.children.length) fillPlayerRows(formerNames);
    if (state.data) el.lobbyCategory.value = state.selectedCategory;
    window.scrollTo(0,0);
  }

  function showGame() {
    el.lobbyScreen.hidden = true;
    el.workspace.hidden = false;
    el.matchDashboard.hidden = state.mode !== 'match';
    el.backToLobbyButton.hidden = false;
    el.resetButton.hidden = state.mode === 'match';
    renderCategories();
    renderScoreboard();
    renderAwardPanel();
    window.scrollTo(0,0);
  }

  function startMatch(names,categoryId) {
    if (!state.data || names.length < 2 || names.length > 6) return;
    state.mode = 'match';
    state.match = {
      players: names.map((name,index)=>({id:'player-'+index,name,points:0})),
      readerIndex: 0,
      round: 1
    };
    state.selectedCategory = categoryId || 'todos';
    state.queue = [];
    state.card = null;
    state.winnerId = null;
    state.roundResolved = false;
    chooseNextCard();
    showGame();
  }

  function startSolo() {
    if (!state.data) return;
    state.mode = 'solo';
    state.match = null;
    state.selectedCategory = el.lobbyCategory.value || 'todos';
    state.queue = [];
    state.card = null;
    chooseNextCard();
    showGame();
  }

  function renderScoreboard() {
    if (state.mode !== 'match' || !state.match) {
      el.matchDashboard.hidden = true;
      return;
    }
    const match = state.match;
    el.matchDashboard.hidden = false;
    el.roundNumber.textContent = String(match.round).padStart(2,'0');
    el.readerName.textContent = getReader().name;
    const ranking = match.players.map((player,index)=>({...player,index})).sort((a,b)=>b.points-a.points || a.index-b.index);
    el.scoreboard.replaceChildren();
    for (const player of ranking) {
      const item = document.createElement('div');
      item.className = 'score-player';
      item.setAttribute('role','listitem');
      const reader = player.id === getReader().id;
      if (reader) item.classList.add('is-reader');
      const top = document.createElement('div');
      top.className = 'score-player-top';
      const avatar = document.createElement('span');
      avatar.className = 'score-avatar';
      avatar.textContent = player.name.slice(0,1).toLocaleUpperCase('pt-BR');
      const name = document.createElement('span');
      name.className = 'score-player-name';
      name.textContent = player.name;
      top.append(avatar,name);
      if (reader) {
        const tag = document.createElement('span');
        tag.className = 'score-reader-tag';
        tag.textContent = 'LEITOR';
        top.append(tag);
      }
      const bottom = document.createElement('div');
      bottom.className = 'score-player-bottom';
      const label = document.createElement('span');
      label.textContent = 'PONTOS';
      const value = document.createElement('strong');
      value.textContent = String(player.points);
      bottom.append(label,value);
      const track = document.createElement('div');
      track.className = 'score-track';
      const fill = document.createElement('span');
      fill.style.width = Math.min(100,player.points)+'%';
      track.append(fill);
      item.append(top,bottom,track);
      el.scoreboard.append(item);
    }
  }

  function renderAwardPanel() {
    const active = state.mode === 'match' && !!state.match && state.count >= 1;
    el.awardPanel.hidden = !active;
    if (!active) return;
    const points = 11 - state.count;
    el.awardChoices.replaceChildren();
    el.roundPoints.textContent = state.roundResolved
      ? (state.lastResult?.points ? '+'+state.lastResult.points+' PTS' : '0 PTS')
      : '+'+points+' PTS';
    el.awardTitle.textContent = state.roundResolved ? 'Rodada concluída.' : 'Quem acertou?';
    el.awardSubtitle.textContent = state.roundResolved
      ? 'Resultado registrado. Toque em Próxima rodada para continuar.'
      : 'Toque no jogador que acertou. O leitor não pode receber pontos.';
    el.noCorrectButton.hidden = state.roundResolved;
    if (state.roundResolved) {
      const notice = document.createElement('div');
      notice.className = 'award-result';
      notice.setAttribute('role','status');
      notice.textContent = state.lastResult?.name
        ? state.lastResult.name+' acertou e conquistou '+state.lastResult.points+' ponto'+(state.lastResult.points === 1 ? '.' : 's.')
        : 'Ninguém acertou. Nenhum ponto foi concedido nesta rodada.';
      el.awardChoices.append(notice);
      return;
    }
    for (const player of state.match.players) {
      if (player.id === getReader().id) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'award-choice';
      const label = document.createElement('span');
      label.textContent = player.name;
      const badge = document.createElement('strong');
      badge.textContent = '+'+points+' pts';
      button.append(label,badge);
      button.addEventListener('click',()=>finishRound(player.id));
      el.awardChoices.append(button);
    }
  }

  function finishRound(playerId) {
    if (state.mode !== 'match' || !state.match || !state.card ||
        state.count < 1 || state.roundResolved || state.winnerId) return;
    const reader = getReader();
    const scorer = state.match.players.find(p=>p.id===playerId);
    if (playerId !== null && (!scorer || scorer.id === reader.id)) return;
    const points = scorer ? 11 - state.count : 0;
    if (scorer) scorer.points += points;
    state.roundResolved = true;
    state.lastResult = {name:scorer?.name || null,points};
    if (scorer && scorer.points >= 100) state.winnerId = scorer.id;
    renderScoreboard();
    renderClues();
    renderCard();
    if (state.winnerId) showWinner();
  }

  function advanceRound() {
    if (state.mode === 'match') {
      if (!state.match || !state.roundResolved || state.winnerId) return;
      state.match.readerIndex = (state.match.readerIndex + 1) % state.match.players.length;
      state.match.round++;
      chooseNextCard();
      renderScoreboard();
      return;
    }
    if (state.mode === 'solo') chooseNextCard();
  }

  function showWinner() {
    const winner = state.match?.players.find(p=>p.id===state.winnerId);
    if (!winner) return;
    el.winnerName.textContent = winner.name;
    el.winnerScore.textContent = String(winner.points);
    const ranked = state.match.players.map((player,index)=>({...player,index})).sort((a,b)=>b.points-a.points || a.index-b.index);
    el.winnerStandings.replaceChildren();
    ranked.forEach((player,index)=>{
      const row = document.createElement('div');
      row.className = 'winner-standing-row';
      const name = document.createElement('span');
      name.textContent = (index+1)+'º  '+player.name;
      const score = document.createElement('strong');
      score.textContent = player.points+' pts';
      row.append(name,score);
      el.winnerStandings.append(row);
    });
    el.confettiLayer.replaceChildren();
    const colors = ['#e6f1ae','#cf6951','#79ad84','#e6c471','#ffffff','#dce9c3'];
    for (let i=0; i<56; i++) {
      const piece = document.createElement('i');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--left',(Math.random()*100).toFixed(2)+'%');
      piece.style.setProperty('--w',(5+Math.random()*7).toFixed(1)+'px');
      piece.style.setProperty('--h',(9+Math.random()*12).toFixed(1)+'px');
      piece.style.setProperty('--drift',(Math.random()*260-130).toFixed(1)+'px');
      piece.style.setProperty('--color',colors[i % colors.length]);
      piece.style.setProperty('--time',(3+Math.random()*2.6).toFixed(2)+'s');
      piece.style.setProperty('--delay',(Math.random()*.9).toFixed(2)+'s');
      el.confettiLayer.append(piece);
    }
    el.winnerDialog.showModal();
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
    if (!state.card || state.roundResolved || state.count >= MAX_TIPS) return;
    state.count++;
    renderClues();
  });
  el.resetButton.addEventListener('click', () => {
    if (!state.card || state.mode === 'match') return;
    state.count = 0;
    renderClues();
  });
  el.nextProfileButton.addEventListener('click', advanceRound);
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


  el.addPlayerButton.addEventListener('click', () => {
    addPlayerRow();
    el.lobbyFeedback.textContent = '';
    el.playerFields.lastElementChild?.querySelector('input')?.focus();
  });
  el.lobbyForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!state.data) return;
    const fields = [...el.playerFields.querySelectorAll('input')];
    const names = fields.map(input=>input.value.trim().replace(/\\s+/g,' '));
    if (names.length < 2 || names.length > 6 || names.some(name=>!name)) {
      el.lobbyFeedback.textContent = 'Preencha o nome de todos os participantes (mínimo 2 e máximo 6).';
      fields.find(input=>!input.value.trim())?.focus();
      return;
    }
    if (new Set(names.map(name=>name.toLocaleLowerCase('pt-BR'))).size !== names.length) {
      el.lobbyFeedback.textContent = 'Cada jogador precisa ter um nome diferente.';
      return;
    }
    el.lobbyFeedback.textContent = '';
    startMatch(names,el.lobbyCategory.value);
  });
  el.soloButton.addEventListener('click', startSolo);
  el.backToLobbyButton.addEventListener('click', () => {
    if (state.mode === 'match' && !state.winnerId &&
       !window.confirm('Encerrar esta partida? O placar atual será perdido.')) return;
    showLobby();
  });
  el.noCorrectButton.addEventListener('click', () => finishRound(null));
  el.newMatchButton.addEventListener('click', () => {
    if (!state.match) return;
    const names = state.match.players.map(player=>player.name);
    const category = state.selectedCategory;
    el.winnerDialog.close();
    startMatch(names,category);
  });
  el.winnerLobbyButton.addEventListener('click', () => showLobby());
  el.winnerDialog.addEventListener('cancel', event => event.preventDefault());

  fillPlayerRows(['','']);
  fetchData();
})();
