const tf = require("@tensorflow/tfjs-node");
const natural = require("natural");
const fs = require("fs");
const util = require("util");
const promiseread = util.promisify(fs.readFile);

/**
 * @param  {string[]} paragraph
 * splits sentences with ".","?"and "!"
 * filter too short sentences and A.M U.S split impurities text length below 4 words are pugred
 */
const sentenceSplitter = paragraph => {
  const sentences = paragraph
    .split(/(\.|\?)/)
    .filter(x => x !== "." && x !== "?" && x !== "!");
  const isSentence = sentence => sentence.split(" ").length > 3;
  return sentences
    .map(sentence => sentence.trim())
    .filter(sentence => isSentence(sentence));
};

/**
 * @param  {string[]} tokens
 * returns the frequency of words with word as the key and fequency as value
 */

const tokenFrequency = tokens =>
  [...new Set(tokens)].reduce((obj, tok) => {
    const frequency = tokens.reduce((n, val) => {
      return n + (val === tok);
    }, 0);
    const containsDigit = /\d+/;
    if (!containsDigit.test(tok)) {
      obj[tok.toLocaleLowerCase()] = frequency;
    }
    return obj;
  }, new Object());

const vectorise = wordlist => {
  const vectorDict = new Object();
  wordlist.forEach((word, index) => {
    const vectorDimension = new Array(wordlist.length).fill(0);
    vectorDimension[index] = 1;
    vectorDict[word] = vectorDimension;
  });
  return vectorDict;
};

/**
 *
 * @param {string} filename path to the file
 * @param {{key:string,value:any}} json json object
 */

const writeJsonToFile = (filename, json) => {
  fs.writeFile(filename, JSON.stringify(json), err => {
    if (err) throw err;
    console.log("writtenTofile");
  });
};

/**
 *
 * @param {number[]} listy list of numbers
 */
const average = listy => {
  return listy.reduce((a, b) => a + b, 0) / listy.length;
};
/**
 *
 * @param {number[]} listy list of numbers
 */

const standardeviation = listy => {
  const average = listy.reduce((a, b) => a + b, 0) / listy.length;
  const variance =
    listy.reduce((a, b) => {
      return a + Math.pow(b - average, 2);
    }, 0) / listy.length;

  return Math.sqrt(variance);
};
/**
 *
 * @param {number[]} listy list of numbers
 */
const sortAscending = listy => {
  return listy.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
};

const sortDescending = listy => {
  return listy.sort((a, b) => {
    if (a < b) {
      return 1;
    }
    if (a > b) {
      return -1;
    }
    return 0;
  });
};

/**
 *
 * @param {number[]} listy
 * @param {number} mean
 * @param {number} SD
 */
const splitSDwise = (listy, mean, SD) => {
  const descendingSortedList = sortDescending(sortAscending(listy));
  const roundSD = Math.round(SD);
  const upperlimit = sortedList.slice(-1);
  const limitArray = [];
  for (let i = roundSD; i <= upperlimit; i += roundSD) {
    limitArray.push(i);
  }
  let lowLim = 0;
  let SDbatchList = [];
  limitArray.forEach((lim, index) => {
    if (index === 0) {
      let x = descendingSortedList;
    }
    SDbatchList.push(
      descendingSortedList.filter(item => item > lowLim && item < lim)
    );
    lowLim = lim;
  });
  return { SDbatch: SDbatchList, limitArray: limitArray };
};

/**
 *
 * @param {string} word target word
 * @param {string[]} sentence list of sentences
 * if word is present in the sentence function will return the neighbours
 */
const window = (word, sentence) => {
  let wordsInSentences = sentence.split(" ");
  const constainsSymbols = /([a-z]|[A-Z])+\w[\.|?|!]/;

  wordsInSentences = wordsInSentences.map(eachWord =>
    constainsSymbols.test(eachWord)
      ? (() => {
          const leters = eachWord.split("");
          leters.pop();
          return leters.join("");
        })()
      : eachWord
  );
  const index = wordsInSentences.indexOf(word);
  return index !== -1
    ? (() => {
        wordsInSentences.splice(index, 1);
        return wordsInSentences;
      })()
    : false;
};

console.log(window("abc", "abc. is a good boy"));
console.log(window("xyz", "abc is a good boy"));
console.log(sentenceSplitter("what the hell? is wrong with you?"))

























// promiseread("./corpous/corpous.txt", "utf8")
//   .then(data => {
//     const tokenizer = new natural.WordTokenizer();
//     const wordFrequency = tokenFrequency(tokenizer.tokenize(data));
//     const sortedWordFrequency = sortAscending(Object.values(wordFrequency));
//     const top2perc = Math.round(sortedWordFrequency.length * 0.02);
//     console.log("top 2 perc", top2perc);
//     console.log(sortedWordFrequency.slice(-1)[0]);
//     console.log(sortedWordFrequency.length);
//     sortedWordFrequency.splice(-top2perc);
//     const SD = standardeviation(sortedWordFrequency);

//     console.log(sortedWordFrequency.slice(-1)[0]);
//     console.log(sortedWordFrequency.length);
//     const mean = average(sortedWordFrequency);
//     console.log("upper Limit", sortedWordFrequency.slice(-1)[0]);
//     console.log("lower Limit ", sortedWordFrequency[0]);
//     console.log("SD", SD);
//     console.log("mean", mean);
//     console.log(Math.round(SD));
//     console.log(Math.round(mean));
//     const SDbatchList = splitSDwise(sortedWordFrequency, mean, SD);
//     const histo = SDbatchList.map(x => x.length);
//     writeJsonToFile("x.txt", histo);
//   })
//   .catch(err => console.log(err));
