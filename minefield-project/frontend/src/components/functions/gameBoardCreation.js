const createBoard = (difficulty) => {
    let size;
    let numMines;
    if (difficulty === 'easy') {
        size = 5;
        numMines = 3;
    } else if (difficulty === 'medium') {
        size = 10;
        numMines = 7;
    } else if (difficulty === 'hard') {
        size = 15;
        numMines = 10;
    } else {
        return null;
    }
    //console.log(`Size: ${size}, numMines: ${numMines}`);
    const board = Array.from({ length: size }, () => Array(size).fill(0));
    //console.log(board);

    let stars = 0;
    while(stars < numMines) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        console.log(`Star coords: ${row}, ${col}`);
        if(board[row][col] !== '*') {
            board[row][col] = '*';
            stars += 1;
        }
        console.log(board);
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            //iterating around each of the neightbouring cells
            //console.log(`Original cells: ${i}, ${j}`)    ;
            if(board[i][j] === '*') continue;
            for (let k = -1; k <= 1; k++) {
                for (let l = -1; l <= 1; l++) {
                    const neighbourRow = i + k;
                    const neightbourCol = j + l;
                    //console.log(`NRow ${neighbourRow}, NCOl ${neightbourCol}`);
                    if(k === 0 && l === 0) continue;
                    if(neighbourRow >= 0 && neighbourRow < size && neightbourCol >= 0 && neightbourCol < size) {
                        if (board[neighbourRow][neightbourCol] == '*') {
                            board[i][j] += 1;
                        }
                    }
                    //console.log(board);
                }
            }
        }
    }
    return board;
};

module.exports = {
    createBoard
};