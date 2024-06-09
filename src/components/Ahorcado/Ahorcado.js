import React, { useRef, useEffect, useState } from 'react';
import './Ahorcado.css';
import wordDatabase from "./wordDatabase.json";

const Ahorcado = () => {
    const [currentWord, setCurrentWord] = useState('');
    const [currentWordArray, setCurrentWordArray] = useState([]);
    const [revealedLetters, setRevealedLetters] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        initComponent()
    }, []);

    function initComponent() {
        const randomWord = getRandomWord();
        setCurrentWord(randomWord);
        refreshWordArray(randomWord);
        setRevealedLetters([]);
    }

    function refreshWordArray(word) {
        const wordArray = word.split('');
        let secretWordArray = [];

        wordArray.forEach(letter => {
            if (revealedLetters.includes(letter)) {
                secretWordArray.push(letter);
            } else {
                secretWordArray.push('_');
            }
        });
        setCurrentWordArray(secretWordArray);
    }

    function getRandomWord() {
        const words = wordDatabase.words;
        const randomWord = words[Math.floor(Math.random() * words.length)];
        return randomWord.toUpperCase();
    }

    function handleInputChange(event) {
        let input = event.target.value;
        if (input.length > 1) {
            return;
        }
        if (!isLetter(input)) {
            return;
        }
        setInputValue(input);
    }

    function isLetter(string) {
        return /^[a-zA-Z]*$/.test(string);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const newLetter = inputValue.toUpperCase();
        if (!revealedLetters.includes(newLetter)) {
            setRevealedLetters(prevRevealedLetters => [...prevRevealedLetters, newLetter]);
        }
        setInputValue('');
    };

    useEffect(() => {
        refreshWordArray(currentWord);
    }, [revealedLetters, currentWord]);

    return (
        <div className="ahorcado-container">
            <h1>El juego del ahorcado</h1>
            {currentWordArray.map((letter, index) => (
                <p key={index}>{index} - {letter}</p>
            ))}
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Ingrese una letra" />
                <button type="submit">Enviar</button>
            </form>

            {/* debug */}
            <div className='debug'>
                <p> - - - - Debug - - - - </p>
                <p>currentWord: {currentWord}</p>
                <p>currentWordArray: {currentWordArray}</p>
                <p>revealedLetters: {revealedLetters}</p>
            </div>
        </div>
    );
};

export default Ahorcado; 
