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

const tokenFrequency = tokens =>{

  const setTokens=[...new Set(tokens)]
  return setTokens.reduce((obj, tok) => {
    const frequency   = tokens.reduce((count, word) =>word.toLowerCase()===tok.toLowerCase()?count+1:count, 0);
    
    const containsDigit = /\d+/;
    if (!containsDigit.test(tok)) {
      obj[tok.toLocaleLowerCase()] = frequency;
    }
    return obj;
  }, new Object());
}



  /**
   * 
   * @param {sting[]} wordlist 
   * does one hot encoding of the words
   */
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
 * @param {string[]} windowSentence list of sentences
 * if word is present in the sentence function will return the neighbours
 */
const neighbourFinder = (word, windowSentence) => {
  const tokenizer = new natural.WordTokenizer();
  let wordsInSentences=tokenizer.tokenize(windowSentence)
  
 
  wordsInSentences = wordsInSentences.map(eachWord =>
    eachWord.toLowerCase()
  );
  const index = wordsInSentences.indexOf(word);
  return index !== -1
    ? (() => {
        wordsInSentences.splice(index, 1);
        return wordsInSentences;
      })()
    : false;
};



const loadJsonFromFile=(fileName)=>{
  let rawdata = fs.readFileSync(fileName);  
  return JSON.parse(rawdata); 
}




const filterOutWordsBelow=(wordFrequencyJosn,frequencyTreshold)=>{
  let wordkeys=Object.keys(wordFrequencyJosn)
  const filteredWords={}
  wordkeys.forEach((key)=>{
    if(wordFrequencyJosn[key]>=frequencyTreshold){
      filteredWords[key]=wordFrequencyJosn[key]
    }
  })
  return filteredWords
}


const filterOutWordsAbove=(wordFrequencyJosn,frequencyTreshold)=>{
  let wordkeys=Object.keys(wordFrequencyJosn)
  const filteredWords={}
  wordkeys.forEach((key)=>{
    if(wordFrequencyJosn[key]<=frequencyTreshold){
      filteredWords[key]=wordFrequencyJosn[key]
    }
  })
  return filteredWords
}
/*
promiseread("./corpous/corpous.txt", "utf8").then(
  data=>{
    const tokenizer = new natural.WordTokenizer();
    //const words=tokenizer.tokenize(data)
    const wordFrequency=tokenFrequency(tokenizer.tokenize(data))
   
    const treshold=20
    
    
    const FilteredwordFrequency = filterOutWordsAbove(wordFrequency,treshold)
    
    const words = Object.keys(FilteredwordFrequency)
    
    const sentences =sentenceSplitter(data)
    const coOccuranceFreq={}
    
    const highFrequencyWords=Object.keys(filterOutWordsBelow(FilteredwordFrequency,treshold))
    //console.log(highFrequencyWords)
    
    words.forEach((word)=>{
      sentences.forEach(sentence=>{
        const neighbours=neighbourFinder(word,sentence)
        if (neighbours){
          const filteredNeighbours=neighbours.filter((eachNeighbour)=>highFrequencyWords.indexOf(eachNeighbour)==-1)
          if(coOccuranceFreq[word]===undefined){
            coOccuranceFreq[word]=filteredNeighbours
          }else{
            //console.log("concatinating")
            coOccuranceFreq[word]=coOccuranceFreq[word].concat(filteredNeighbours)
          }
          
        }
        
      })
     })
     writeJsonToFile("jsonfile.json",coOccuranceFreq)
     
  }
)
*/

// promiseread("./corpous/corpous.txt", "utf8").then((data)=>{
//   const tokenizer = new natural.WordTokenizer()
//   const FilteredwordFrequency = tokenFrequency(tokenizer.tokenize(data))
//   console.log(FilteredwordFrequency["is"],FilteredwordFrequency["to"])
//   const highFrequencyWords=Object.keys(filterOutWordsBelow(FilteredwordFrequency,50))
  
//   console.log(highFrequencyWords)x
//   console.log(["it","is","a","way","to","use","Cancer"].filter((eachNeighbour)=>
//   highFrequencyWords.indexOf(eachNeighbour)==-1))
// })

































// promiseread("./corpous/corpous.txt", "utf8")
//   .then(data => {
//     const tokenizer = new natural.WordTokenizer();
//     const FilteredwordFrequency = tokenFrequency(tokenizer.tokenize(data));
//     const sortedFilteredwordFrequency = sortAscending(Object.values(FilteredwordFrequency));
//     const top2perc = Math.round(sortedFilteredwordFrequency.length * 0.02);
//     console.log("top 2 perc", top2perc);
//     console.log(sortedFilteredwordFrequency.slice(-1)[0]);
//     console.log(sortedFilteredwordFrequency.length);
//     sortedFilteredwordFrequency.splice(-top2perc);
//     const SD = standardeviation(sortedFilteredwordFrequency);

//     console.log(sortedFilteredwordFrequency.slice(-1)[0]);
//     console.log(sortedFilteredwordFrequency.length);
//     const mean = average(sortedFilteredwordFrequency);
//     console.log("upper Limit", sortedFilteredwordFrequency.slice(-1)[0]);
//     console.log("lower Limit ", sortedFilteredwordFrequency[0]);
//     console.log("SD", SD);
//     console.log("mean", mean);
//     console.log(Math.round(SD));
//     console.log(Math.round(mean));
//     const SDbatchList = splitSDwise(sortedFilteredwordFrequency, mean, SD);
//     const histo = SDbatchList.map(x => x.length);
//     writeJsonToFile("x.txt", histo);
//   })
//   .catch(err => console.log(err))
//
