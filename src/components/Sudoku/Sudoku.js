import React, { useEffect, useState } from 'react';
import ContainerHeader from "../Library/Container";
import WinLose from "../WinLose/WinLose";
import './Sudoku.css';

const Sudoku = () => {
    const gameName = "Sudoku";
    const winMessage = "¡Has ganado!";
    const loseMessage = "Hay errores...";
    const height = 9;
    const width = 9;
    const [gameFinished, setGameFinished] = useState(false);
    const [sudoku, setSudoku] = useState([]);
    const [visibleSudoku, setVisibleSudoku] = useState([]);
    const [enabledMap, setEnabledMap] = useState([]);
    const [incorrectMap, setIncorrectMap] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        initComponent();
    }, []);

    function initComponent() {
        setCompleted(false);
        setGameFinished(false);
        setIsCorrect(false);
        setSudoku([]);
        setVisibleSudoku([]);
        setEnabledMap(generateStructure(false));
        setIncorrectMap(generateStructure(false));
        generateSudoku(generateStructure(0));
    }

    function generateSudoku(matrix) {
        let [emRow, emCell] = findEmptyCell(matrix);
        if (emRow === null) {
            setSudoku(matrix);
            setVisibleSudoku(hideSudoku(matrix));
            return true;
        }

        let initialNumber = getRandom(1, 9);
        let number = initialNumber;
        for (let i = 0; i < 10; i++) {
            if (number > 9) {
                number = 1;
            }
            if (isNumberValid(number, matrix, emRow, emCell)) {
                matrix[emRow][emCell] = number;

                if (generateSudoku(matrix)) {
                    return true;
                }

                matrix[emRow][emCell] = 0;
            }
        }

        return false;
    }

    function generateStructure(content) {
        let matrix = [];
        for (let y = 0; y < height; y++) {
            let emptyRow = [];
            for (let x = 0; x < width; x++) {
                emptyRow.push(content);
            }
            matrix.push(emptyRow);
        }

        return matrix;
    }

    function findEmptyCell(matrix) {
        for (let y = 0; y < matrix.length; y++) {
            const row = matrix[y];
            for (let x = 0; x < row.length; x++) {
                const col = row[x];
                if (col === 0) {
                    return [y, x];
                }
            }
        }
        return [null, null];
    }

    function isNumberValid(number, matrix, row, col) {
        for (let x = 0; x < matrix[row].length; x++) {
            const cell = matrix[row][x];
            if (cell === number) {
                return false;
            }
        }

        for (let y = 0; y < matrix.length; y++) {
            const cell = matrix[y][col];
            if (cell === number) {
                return false;
            }
        }

        let startSubgridY = Math.floor(row / 3) * 3;
        let endSubgridY = startSubgridY + 3;
        let startSubgridX = Math.floor(col / 3) * 3;
        let endSubgridX = startSubgridX + 3;

        for (let y = startSubgridY; y < endSubgridY; y++) {
            for (let x = startSubgridX; x < endSubgridX; x++) {
                const element = matrix[y][x];
                if (element === number) {
                    return false;
                }
            }
        }

        return true;
    }

    function hideSudoku(matrix) {
        const hiddenCells = 35;
        const auxEnabledMap = generateStructure(false);
        const clonedMatrix = matrix.map(row => [...row]);

        let attempts = 0;
        while (attempts < hiddenCells) {
            let y = getRandom(0, 8);
            let x = getRandom(0, 8);
            if (clonedMatrix[y][x] !== 0) {
                let backup = clonedMatrix[y][x];
                clonedMatrix[y][x] = 0;
                if (hasUniqueSolution(clonedMatrix)) {
                    auxEnabledMap[y][x] = true;
                    attempts++;
                } else {
                    clonedMatrix[y][x] = backup;
                }
            }
        }

        setEnabledMap(auxEnabledMap);
        return clonedMatrix;
    }

    function hasUniqueSolution(matrix) {
        let solutionCount = 0;
        function solve(matrix) {
            let [row, col] = findEmptyCell(matrix);
            if (row === null) {
                solutionCount++;
                return solutionCount === 1;
            }

            for (let num = 1; num <= 9; num++) {
                if (isNumberValid(num, matrix, row, col)) {
                    matrix[row][col] = num;
                    if (solve(matrix)) return true;
                    matrix[row][col] = 0;
                }
            }
            return false;
        }

        let clonedMatrix = matrix.map(row => [...row]);
        solve(clonedMatrix);
        return solutionCount === 1;
    }

    function getCellHTML(rowIndex, cellIndex, cell) {
        let cssClass = "sudoku-cell";
        const cellEditable = enabledMap[rowIndex][cellIndex];
        if (cellEditable) {
            cssClass += " enabled";
        } else {
            cssClass += " disabled";
        }
        const cellIncorrect = incorrectMap[rowIndex][cellIndex];
        if (cellIncorrect) {
            cssClass += " incorrect";
        }

        return (
            <div
                className={cssClass}
                key={cellIndex}
                contentEditable={cellEditable}
                suppressContentEditableWarning={true}
                onInput={(e) => handleInputChange(e, rowIndex, cellIndex)}
            >
                {cell !== 0 && cell}
            </div>
        );
    }

    function handleInputChange(event, rowIndex, cellIndex) {
        let input = event.target.innerText.trim();
        let numericInput = parseInt(input, 10);

        if (isNaN(numericInput) || numericInput < 1 || input.slice(0, 1) === '0') {
            event.target.innerText = '';
        } else if (numericInput > 9) {
            event.target.innerText = Math.floor(numericInput / 10);
        } else {
            event.target.innerText = numericInput;
        }

        setVisibleSudoku(prev => {
            const newMatrix = prev.map(row => [...row]);
            newMatrix[rowIndex][cellIndex] = event.target.innerText;
            return newMatrix;
        });

        setIncorrectMap(prev => {
            const newMatrix = prev.map(row => [...row]);
            newMatrix[rowIndex][cellIndex] = false;
            return newMatrix;
        });
    }

    useEffect(() => {
        setCompleted(isSudokuCompleted(visibleSudoku));
    }, [visibleSudoku]);

    function isSudokuCompleted(matrix) {
        for (let y = 0; y < matrix.length; y++) {
            const row = matrix[y];
            if (row.includes(0) || row.includes('')) {
                return false;
            }
        }
        return true;
    }

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function validateSudoku() {
        let hasError = false;
        let incorrectMapAux = generateStructure(false);
        for (let y = 0; y < visibleSudoku.length; y++) {
            let visibleRow = visibleSudoku[y];
            for (let x = 0; x < visibleRow.length; x++) {
                let cell = visibleRow[x];
                if (cell != sudoku[y][x]) {
                    incorrectMapAux[y][x] = true;
                    hasError = true;
                }
            }
        }

        setIncorrectMap(incorrectMapAux);
        setIsCorrect(!hasError);
        setGameFinished(true);
    }

    function debugResolve() {
        setVisibleSudoku(sudoku);
        setCompleted(true);
    }

    return (
        <div className="container sudoku-container">
            {gameFinished && <WinLose isWin={isCorrect} winMessage={winMessage} loseMessage={loseMessage} restartGame={initComponent} />}
            <ContainerHeader title={gameName} restartGame={initComponent} />
            <div className='sudoku'>
                {visibleSudoku.length > 0 && visibleSudoku.map((row, rowIndex) => (
                    <div className="sudoku-row" key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            getCellHTML(rowIndex, cellIndex, cell)
                        ))}
                    </div>
                ))}
            </div>
            <button className="btn btn-success" onClick={validateSudoku} disabled={!completed}>Finalizar</button>

            {/* debug */}
            <div className='sudoku sudoku-debug'>
                <p> - - - - Debug - - - - </p>
                <button type="button" className="btn btn-outline-success" onClick={debugResolve}>Debug resolve</button>
                {sudoku.length > 0 && sudoku.map((row, rowIndex) => (
                    <div className="sudoku-row" key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <button className="sudoku-cell" key={cellIndex}>{cell !== 0 && cell}</button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sudoku;
