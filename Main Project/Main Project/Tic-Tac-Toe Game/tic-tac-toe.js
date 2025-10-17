 const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset');
    let currentPlayer = "X";
    let gameActive = true;

    // Winning combinations (indexes of cells)
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    function checkWinner() {
      for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (cells[a].textContent &&
            cells[a].textContent === cells[b].textContent &&
            cells[a].textContent === cells[c].textContent) {
          status.textContent = `🎉 Player ${cells[a].textContent} Wins!`;
          gameActive = false;
          return;
        }
      }

      // Check draw
      if ([...cells].every(cell => cell.textContent !== "")) {
        status.textContent = "🤝 It's a Draw!";
        gameActive = false;
      }
    }

    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (cell.textContent === "" && gameActive) {
          cell.textContent = currentPlayer;
          checkWinner();
          if (gameActive) {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            status.textContent = `Player ${currentPlayer}'s turn`;
          }
        }
      });
    });

    resetBtn.addEventListener('click', () => {
      cells.forEach(cell => cell.textContent = "");
      currentPlayer = "X";
      gameActive = true;
      status.textContent = "Player X's turn";
    });