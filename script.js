/*
 * Ristid-nullid + minimax AI
 * Etapp 2 ja 3 (vt README.md) — mängu tuum ja kaks AI-varianti:
 *   - minimaxPlain: täielik otsing ilma kärpimiseta (võrdlusbaas)
 *   - minimaxAB: sama otsing alfa-beeta kärpimisega (optimeeritud)
 * Mõlemad loendavad läbi vaadatud sõlmi ja mõõdavad aega,
 * et ressursikulu oleks liideses nähtav ja võrreldav.
 */

const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const perfNodesEl = document.getElementById('perf-nodes');
  const perfTimeEl = document.getElementById('perf-time');
  const perfNoteEl = document.getElementById('perf-note');
  const resetBtn = document.getElementById('reset');
  const scoreWinEl = document.getElementById('score-win');
  const scoreDrawEl = document.getElementById('score-draw');
  const scoreLossEl = document.getElementById('score-loss');
  
  let board = Array(9).fill(null);
  let humanMark = 'X';
  let aiMark = 'O';
  let difficulty = 'hard-ab';
  let gameOver = false;
  let scores = { win: 0, draw: 0, loss: 0 };
  
  // --- Laua joonistamine ---
  
  function markSVG(mark) {
    if (mark === 'X') {
      return `<svg viewBox="0 0 100 100"><path class="mark-x" d="M20 20 L80 80 M80 20 L20 80"/></svg>`;
    }
    return `<svg viewBox="0 0 100 100"><circle class="mark-o" cx="50" cy="50" r="34"/></svg>`;
  }
  
  function renderBoard(winningLine = null) {
    boardEl.innerHTML = '';
    board.forEach((mark, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell' + (mark ? ' filled' : '');
      if (winningLine && winningLine.includes(i)) cell.classList.add('win');
      if (mark) cell.innerHTML = markSVG(mark);
      cell.addEventListener('click', () => onCellClick(i));
      boardEl.appendChild(cell);
    });
  }
  
  // --- Mängureeglid ---
  
  function checkWinner(b) {
    for (const line of WIN_LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line };
    }
    if (b.every(c => c !== null)) return { mark: 'draw', line: null };
    return null;
  }
  
  function onCellClick(i) {
    if (gameOver || board[i] || currentTurn() !== humanMark) return;
    board[i] = humanMark;
    afterMove();
  }
  
  function currentTurn() {
    const filled = board.filter(c => c !== null).length;
    const humanFirst = humanMark === 'X';
    const humanToMove = humanFirst ? filled % 2 === 0 : filled % 2 === 1;
    return humanToMove ? humanMark : aiMark;
  }
  
  function afterMove() {
    const result = checkWinner(board);
    if (result) return endGame(result);
    renderBoard();
    if (currentTurn() === aiMark) {
      statusEl.textContent = 'Tehisintellekt mõtleb…';
      setTimeout(aiMove, 180);
    } else {
      statusEl.textContent = 'Sinu käik.';
    }
  }
  
  function endGame(result) {
    gameOver = true;
    renderBoard(result.line);
    if (result.mark === 'draw') {
      statusEl.textContent = 'Viik.';
      scores.draw++;
    } else if (result.mark === humanMark) {
      statusEl.textContent = 'Sina võitsid!';
      scores.win++;
    } else {
      statusEl.textContent = 'Tehisintellekt võitis.';
      scores.loss++;
    }
    scoreWinEl.textContent = scores.win;
    scoreDrawEl.textContent = scores.draw;
    scoreLossEl.textContent = scores.loss;
  }
  
  // --- AI käik ---
  
  function aiMove() {
    if (gameOver) return;
  
    let move, nodes, ms;
  
    if (difficulty === 'easy') {
      const empties = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
      move = empties[Math.floor(Math.random() * empties.length)];
      nodes = 1;
      ms = 0;
    } else {
      const start = performance.now();
      nodeCounter = 0;
      if (difficulty === 'hard-plain') {
        move = minimaxPlain([...board], aiMark).move;
      } else {
        move = minimaxAB([...board], aiMark, -Infinity, Infinity, 0).move;
      }
      ms = performance.now() - start;
      nodes = nodeCounter;
    }
  
    board[move] = aiMark;
  
    perfNodesEl.textContent = nodes.toLocaleString('et-EE');
    perfTimeEl.textContent = ms.toFixed(2) + ' ms';
    perfNoteEl.textContent = difficulty === 'easy'
      ? 'Juhuslik käik — otsingut ei tehta, ressurss ei ole asjakohane.'
      : difficulty === 'hard-plain'
        ? 'Puhas minimax vaatab läbi kogu allesjäänud mängupuu.'
        : 'Alfa-beeta kärbib harusid, mis tulemust ei muudaks — vaata README-st võrdlust.';
  
    const result = checkWinner(board);
    if (result) return endGame(result);
    renderBoard();
    statusEl.textContent = 'Sinu käik.';
  }
  
  // --- Minimax (kärpimiseta) — etapp 2, algne/võrdlusversioon ---
  
  let nodeCounter = 0;
  
  function minimaxPlain(b, turn) {
    nodeCounter++;
    const result = checkWinner(b);
    if (result) return { score: scoreFor(result), move: null };
  
    const empties = b.map((v, i) => v === null ? i : null).filter(v => v !== null);
    let best = null;
  
    for (const i of empties) {
      b[i] = turn;
      const { score } = minimaxPlain(b, turn === aiMark ? humanMark : aiMark);
      b[i] = null;
      if (best === null ||
          (turn === aiMark && score > best.score) ||
          (turn === humanMark && score < best.score)) {
        best = { score, move: i };
      }
    }
    return best;
  }
  
  // --- Minimax alfa-beeta kärpimisega — etapp 3, optimeeritud versioon ---
  
  function minimaxAB(b, turn, alpha, beta, depth) {
    nodeCounter++;
    const result = checkWinner(b);
    if (result) return { score: scoreFor(result, depth), move: null };
  
    const empties = b.map((v, i) => v === null ? i : null).filter(v => v !== null);
    let best = null;
  
    if (turn === aiMark) {
      let value = -Infinity;
      for (const i of empties) {
        b[i] = turn;
        const { score } = minimaxAB(b, humanMark, alpha, beta, depth + 1);
        b[i] = null;
        if (score > value) { value = score; best = { score, move: i }; }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break; // kärbe: humanMark ei laseks siia jõuda
      }
    } else {
      let value = Infinity;
      for (const i of empties) {
        b[i] = turn;
        const { score } = minimaxAB(b, aiMark, alpha, beta, depth + 1);
        b[i] = null;
        if (score < value) { value = score; best = { score, move: i }; }
        beta = Math.min(beta, value);
        if (alpha >= beta) break; // kärbe: aiMark ei valiks seda haru
      }
    }
    return best;
  }
  
  // Kiirem võit/kiirem kaotuse vältimine: sügavus mõjutab skoori.
  function scoreFor(result, depth = 0) {
    if (result.mark === 'draw') return 0;
    if (result.mark === aiMark) return 10 - depth;
    return depth - 10;
  }
  
  // --- Juhtelemendid ---
  
  document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.addEventListener('click', () => {
      difficulty = btn.dataset.difficulty;
      document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.toggle('active', b === btn));
      newGame();
    });
  });
  
  document.querySelectorAll('[data-mark]').forEach(btn => {
    btn.addEventListener('click', () => {
      humanMark = btn.dataset.mark;
      aiMark = humanMark === 'X' ? 'O' : 'X';
      document.querySelectorAll('[data-mark]').forEach(b => b.classList.toggle('active', b === btn));
      newGame();
    });
  });
  
  resetBtn.addEventListener('click', newGame);
  
  function newGame() {
    board = Array(9).fill(null);
    gameOver = false;
    renderBoard();
    perfNodesEl.textContent = '—';
    perfTimeEl.textContent = '—';
    perfNoteEl.textContent = 'Vali raskusaste ja tee esimene käik, et võrdlust näha.';
    if (currentTurn() === aiMark) {
      statusEl.textContent = 'Tehisintellekt mõtleb…';
      setTimeout(aiMove, 180);
    } else {
      statusEl.textContent = 'Sinu käik.';
    }
  }
  
  // Algseaded aktiivseks
  document.querySelector('[data-difficulty="hard-ab"]').classList.add('active');
  document.querySelector('[data-mark="X"]').classList.add('active');
  
  newGame();