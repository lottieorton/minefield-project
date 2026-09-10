const createBoard = (difficulty) => {
  let size;
  let numMines;
  if (difficulty === "easy") {
    size = 5;
    numMines = 3;
  } else if (difficulty === "medium") {
    size = 10;
    numMines = 7;
  } else if (difficulty === "hard") {
    size = 15;
    numMines = 10;
  } else {
    return null;
  }

  const board = Array.from({ length: size }, () => Array(size).fill(0));

  let stars = 0;
  while (stars < numMines) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (board[row][col] !== "*") {
      board[row][col] = "*";
      stars += 1;
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Iterate around each of the neightbouring cells

      if (board[i][j] === "*") continue;
      for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
          const neighbourRow = i + k;
          const neightbourCol = j + l;

          if (k === 0 && l === 0) continue;
          if (
            neighbourRow >= 0 &&
            neighbourRow < size &&
            neightbourCol >= 0 &&
            neightbourCol < size
          ) {
            if (board[neighbourRow][neightbourCol] == "*") {
              board[i][j] += 1;
            }
          }
        }
      }
    }
  }
  return board;
};

module.exports = {
  createBoard,
};
