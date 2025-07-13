'use client';
import React, { useEffect, useState, useCallback } from 'react';
const lettersAndSymbols = "!@#.,(asdf[]{}*&^%$"
export function RandomizedTextEffect({ text }) {
  const [animatedText, setAnimatedText] = useState('');
  const getRandomChar = useCallback(
    () =>
      lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
    []
  );
  const animateText = useCallback(async () => {
    const duration = 50;
    const revealDuration = 90;
    const initialRandomDuration = 100;
    const generateRandomText = () =>
      text
        .split('')
        .map(() => getRandomChar())
        .join('');
    setAnimatedText(generateRandomText());
    const endTime = Date.now() + initialRandomDuration;
    while (Date.now() < endTime) {
      await new Promise((resolve) => setTimeout(resolve, duration));
      setAnimatedText(generateRandomText());
    }
    for (let i = 0; i < text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, revealDuration));
      setAnimatedText(
        (prevText) =>
          text.slice(0, i + 1) +
          prevText
            .slice(i + 1)
            .split('')
            .map(() => getRandomChar())
            .join('')
      );
    }
  }, [text, getRandomChar]);
  useEffect(() => {
    animateText();
     const interval = setInterval(() => {
      animateText(); 
    }, 8000); 

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [text, animateText]);
  return <div className="bg-gradient-to-b my-5 from-white to-slate-700 bg-clip-text text-transparent text-4xl text-center font-semibold inline">{animatedText}</div>;
}
