import React, { useState, useEffect } from "react";
import Axios from "axios";
import "./App.css";
import { FaSearch } from "react-icons/fa";
import { FcSpeaker } from "react-icons/fc";

function App() {
  const [data, setData] = useState(null);
  const [searchWord, setSearchWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [lastSearchedWord, setLastSearchedWord] = useState("");

  useEffect(() => {
    fetchWordOfTheDay();
  }, []);

  function fetchWordOfTheDay() {
    Axios.get("https://api.dictionaryapi.dev/api/v2/entries/en_US/turkey")
      .then((response) => {
        const filteredWords = response.data.filter((word) => {
          return true;
        });
        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        setWordOfTheDay(filteredWords[randomIndex]);
      })
      .catch((error) => {
        console.error("Failed to fetch word of the day", error);
      });
  }

  function getMeaning() {
    setLoading(true);
    Axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en_US/${searchWord}`
    )
      .then((response) => {
        setData(response.data[0]);
        setLoading(false);
        addToHistory(response.data[0]);
        setLastSearchedWord(searchWord);
        setError(null); 
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setError("Word not found");
        } else {
          setError("Failed to fetch data");
        }
        setLoading(false);
      });
  }

  function addToHistory(word) {
    if (!history.find((w) => w.word === word.word)) {
      setHistory([...history, word]);
    }
  }

  function getMeaningFromHistory(word) {
    setData(null);
    setLoading(true);
    Axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word.word}`
    )
      .then((response) => {
        setData(response.data[0]);
        setLoading(false);
        setError(null); 
      })
      .catch((error) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }

  function addToFavorites(word) {
    if (!favorites.includes(word)) {
      setFavorites([...favorites, word]);
    }
  }
  function getMeaningFromFavourites(word) {
    setData(null); 
    setLoading(true);
    Axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word.word}`
    )
      .then((response) => {
        setData(response.data[0]);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }

  function playAudio() {
    if (data && data.phonetics && data.phonetics.length > 0) {
      console.log("Audio URL:", data.phonetics[0].audio);
      let audio = new Audio(data.phonetics[0].audio);
      try {
        audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  }
  

  return (
    <div className="App">
      <div className="wordOfTheDay card">
        <h3>Word of the Day:</h3>
        {wordOfTheDay && (
          <div>
            <p>{wordOfTheDay.word}</p>
            <p>{wordOfTheDay.meanings[0].definitions[0].definition}</p>
          </div>
        )}
      </div>
      <h1>Dictionary</h1>
      <div className="searchBox">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => {
            setSearchWord(e.target.value);
          }}
        />
        <button
          onClick={() => {
            getMeaning();
          }}
        >
          <FaSearch size="20px" />
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && lastSearchedWord === searchWord && <p>{error}</p>}
      {data && (
        <div className="searchResultCard card">
          <h2>
            {data.word}{" "}
            <button
              onClick={() => {
                playAudio();
              }}
            >
              <FcSpeaker size="26px" />
            </button>
          </h2>
          <h4 className="partOfSpeech">Parts of speech:</h4>
          <p className="partOfSpeechText">{data.meanings[0].partOfSpeech}</p>
          <h4 className="definition">Definition:</h4>
          <p className="definitionText">{data.meanings[0].definitions[0].definition}</p>
          <h4 className="example">Example:</h4>
          <p className="exampleText">{data.meanings[0].definitions[0].example}</p>
          <button onClick={() => addToFavorites(data)}>Add to Favorites</button>
        </div>
      )}
      <div className="historyAndFavorites">
        <div className="history">
          <h3>History:</h3>
          <ul>
            {history.map((word, index) => (
              <li key={index} onClick={() => getMeaningFromHistory(word)}>{word.word}</li>
            ))}
          </ul>
        </div>
        <div className="favorites">
          <h3>Favorites:</h3>
          <ul>
            {favorites.map((word, index) => (
              <li key={index} onClick={() => getMeaningFromFavourites(word)} >{word.word}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default App;