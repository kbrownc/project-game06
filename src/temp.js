import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

function App() {
   // Global variables
   const urlGetDeck = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
   const urlDrawHand = "https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=18";
   const urlCombo = "https://deckofcardsapi.com/api/deck/new/draw/?count=18";
   
   // Temporary variables
   // const deckId = "kgjfc7btniiv";
   // const urlDrawHand2 = urlDrawHand.replace("<<deck_id>>", deckId);

   // State
   const [{ message }, setGameState] = useState({
    message: 'Draw card',
  });
  const [deckId, setDeckId] = useState("");
  const [hand, setHand] = useState([]);

  // Reset game
  const onReset = useCallback(() => {
    console.log('Reset');
    setGameState( () => {
      return {
        message: 'Draw card',
      };
    });
  }, []);

  // Draw card
  const onDraw = useCallback(() => {
    console.log('Draw');
    setGameState( () => {
      return {
        message: 'Play',
      };
    });
  }, []);

  // Turn complete
  const onTurn = useCallback(() => {
    console.log('Turn');
    setGameState( () => {
      return {
        message: 'Draw card',
      };
    });
  }, []);

  // About the game
  const onAbout = useCallback(() => {
    console.log('About');
    setGameState( () => {
      return {
        message: 'Draw card',
      };
    });
  }, []);

  // Expand card pile
  const onExpand = useCallback((num) => {
    console.log('Expand',num);
    setGameState( () => {
      return {
        message: 'Card pile expanded',
      };
    });
  }, []);

  // useEffect - Get 18 cards from deck
   useEffect( () => {
     fetch(urlCombo)
       .then((response) => response.json())
       .then((data) => {
          let workHand = hand;
          let handEntry;
          let sortKey = 0;
          //  load player's hand
          let i = 0;
          for (i = 0; i < data.cards.length; i++) {
            if (data.cards[i].value === 'KING') {
              sortKey = 13;
            } else if (data.cards[i].value === 'QUEEN') {
              sortKey = 12;
            } else if (data.cards[i].value === 'JACK') {
              sortKey = 11; 
            } else if (data.cards[i].value === 'ACE') {
              sortKey = 1;
            } else {
              sortKey = Number(data.cards[i].value);
            }
            handEntry = {
              cardImage: data.cards[i].image,
              sortKey: sortKey,
            };
            workHand.push(handEntry);
          }
          console.log(workHand);
          console.log('workHand length',workHand);
          setHand(workHand);
          setDeckId(data.deck_id); 
       })
   }, []);

  return (
    <div className="Container">
      <div className="Nav">
        <div className="Box Button" style={{ gridColumn: 1, gridRow: 1 }} onClick={onReset}>
          Reset
        </div>
        <div className="Box Button" style={{ gridColumn: 2, gridRow: 1 }} onClick={onDraw}>
          Draw
        </div>
        <div className="Box Button" style={{ gridColumn: 3, gridRow: 1 }} onClick={onTurn}>
          Turn
        </div>
        <div className="Box Button" style={{ gridColumn: 4, gridRow: 1 }} onClick={onAbout}>
          About
        </div>
      </div>
      <div className="Messages">
        <h4>{message}</h4>
      </div>
      <div className="Nav-expand">
        <div className="Box-expand Button" style={{ gridColumn: 1, gridRow: 1 }} 
        onClick={() => onExpand(1)}>Expand
        </div>
        <div className="Box-expand Button" style={{ gridColumn: 2, gridRow: 1 }} 
        onClick={() => onExpand(2)}>Expand
        </div>
        <div className="Box-expand Button" style={{ gridColumn: 3, gridRow: 1 }} 
        onClick={() => onExpand(3)}>Expand
        </div>
        <div className="Box-expand Button" style={{ gridColumn: 4, gridRow: 1 }} 
        onClick={() => onExpand(4)}>Expand
        </div>
      </div>
      <div className="Side-section">
        <div className="Side">
          <span>Side 1</span><br></br>
          <img className="img-card" src={hand[1].cardImage} alt="" />
          <img className="img-card" src={hand[1].cardImage} alt="" />
        </div>
        <div className="Side">
          <span>Side 2</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
          <img className="img-card" src={hand[1].cardImage} alt="" />
        </div>
        <div className="Side">
          <span>Side 3</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
          <img className="img-card" src={hand[1].cardImage} alt="" />
        </div>
        <div className="Side">
          <span>Side 4</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
          <img className="img-card" src={hand[1].cardImage} alt="" />
        </div>
      </div>
      <div  className="Corner-section">
        <div  className="Corner">
          <span>Corner 1</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
        </div>
        <div  className="Corner">
          <span>Corner 2</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
        </div>
        <div  className="Corner">
          <span>Corner 3</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
        </div>
        <div  className="Corner">
          <span>Corner 4</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
        </div>
      </div>
      <div  className="Hand">
        <div>
           <span>Your Hand</span><br></br>
          <img className="img-card" src={hand[0].cardImage} alt="" />
          <img className="img-card" src={hand[1].cardImage} alt="" />
          <img className="img-card" src={hand[2].cardImage} alt="" />
          <img className="img-card" src={hand[3].cardImage} alt="" />
          <img className="img-card" src={hand[4].cardImage} alt="" />
          <img className="img-card" src={hand[5].cardImage} alt="" />
          <img className="img-card" src={hand[6].cardImage} alt="" />   
        </div>
      </div>
    </div>
  );
};

export default App; 
