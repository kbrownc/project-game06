import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

function App() {
    // Global variables
    const urlDrawHand = "https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=1";
    const urlGetDraw = "https://deckofcardsapi.com/api/deck/new/draw/?count=18";
    // const urlDrawHand2 = urlDrawHand.replace("<<deck_id>>", deckId);

    // State
    const [{ message }, setGameState] = useState({
        message: 'Draw card',
    });
    const [{ side1, side2, side3, side4 }, setSidePiles] = useState({
        side1: [],
        side2: [],
        side3: [],
        side4: [],
    });
    const [{ corner1, corner2, corner3, corner4 }, setCornerPiles] = useState({
        corner1: [],
        corner2: [],
        corner3: [],
        corner4: [],
    });
    const [deckId, setDeckId] = useState("");
    const [hand, setHand] = useState();
    const [handPC, setHandPC] = useState();

    // Reset game
    const onReset = useCallback(() => {
        console.log('Reset');
        setGameState(() => {
            return {
                message: 'Draw card',
            };
        });
    }, []);

    // Draw card
    const onDraw = useCallback(() => {
        console.log('Draw');
        setGameState(() => {
            return {
                message: 'Play',
            };
        });
    }, []);

    // Turn complete
    const onTurn = useCallback(() => {
        console.log('Turn');
        setGameState(() => {
            return {
                message: 'Draw card',
            };
        });
    }, []);

    // About the game
    const onAbout = useCallback(() => {
        console.log('About');
        setGameState(() => {
            return {
                message: 'Draw card',
            };
        });
    }, []);

    // Expand card pile
    const onExpand = useCallback((num) => {
        console.log('Expand', num);
        setGameState(() => {
            return {
                message: 'Card pile expanded',
            };
        });
    }, []);

    // useEffect - Get 18 cards from deck
    useEffect(() => {
        fetch(urlGetDraw)
            .then((response) => response.json())
            .then((data) => {
                let workHand = [];
                let workHandPC = [];
                let workSide1 = [];
                let workSide2 = [];
                let workSide3 = [];
                let workSide4 = [];
                let handEntry = {};
                let sortKey = 0;
                //  load player's hand
                let i = 0;
                for (i = 0; i < 7; i++) {
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
                        code: data.cards[i].code,
                    };
                    workHand.push(handEntry);
                }
                //  load other (PC's) hand
                for (i = 7; i < 14; i++) {
                    workHandPC.push(data.cards[i].image);
                }
                //  load Side Pile's
                workSide1.push(data.cards[14].image);
                workSide2.push(data.cards[15].image);
                workSide3.push(data.cards[16].image);
                workSide4.push(data.cards[17].image);
                
                console.log('workHandPC:', workHandPC);
                workHand.sort((a, b) => a.sortKey - b.sortKey);
                setHand(workHand);
                setHandPC(workHandPC);
                setSidePiles(() => {
                  return {
                    side1: workSide1,
                    side2: workSide2,
                    side3: workSide3,
                    side4: workSide4,
                  };
                });
                setDeckId(data.deck_id);
            })
    }, []);

    // The following if statement is to stop an initial render error. 
    //    UseEffect is executed after an initial render.
    if (hand === undefined) return null;
    return (
        <div className="Container">
      <div className="Nav">
        <div className="Box Button" style={{ gridColumn: 1, gridRow: 1 }} onClick={onReset}>
          Reset Game
        </div>
        <div className="Box Button" style={{ gridColumn: 2, gridRow: 1 }} onClick={onDraw}>
          Draw Card
        </div>
        <div className="Box Button" style={{ gridColumn: 3, gridRow: 1 }} onClick={onTurn}>
          Turn Complete
        </div>
        <div className="Box Button" style={{ gridColumn: 4, gridRow: 1 }} onClick={onAbout}>
          About
        </div>
      </div>
      <div className="Messages">
        <span>{message}</span><br></br>
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
          <img className="img-card" src={side1[0]} alt="" />
          <img className="img-card" src=
              {side1[side1.length === 1 ? 1 : side1.length - 1]} alt="" />
        </div>
        <div className="Side">
          <span>Side 2</span><br></br>
          <img className="img-card" src={side2[0]} alt="" />
          <img className="img-card" src=
              {side2[side2.length === 1 ? 1 : side2.length - 1]} alt="" />
        </div>
        <div className="Side">
          <span>Side 3</span><br></br>
          <img className="img-card" src={side3[0]} alt="" />
          <img className="img-card" src=
              {side3[side3.length === 1 ? 1 : side3.length - 1]} alt="" />
        </div>
        <div className="Side">
          <span>Side 4</span><br></br>
          <img className="img-card" src={side4[0]} alt="" />
          <img className="img-card" src=
              {side4[side4.length === 1 ? 1 : side4.length - 1]} alt="" />
        </div>
      </div>
      <div  className="Corner-section">
        <div  className="Corner">
          <span>Corner 1</span><br></br>
          <img className="img-card" src={corner1[corner1.length - 1]} alt="" />
        </div>
        <div  className="Corner">
          <span>Corner 2</span><br></br>
          <img className="img-card" src={corner2[corner2.length - 1]} alt="" />
        </div>
        <div  className="Corner">
          <span>Corner 3</span><br></br>
          <img className="img-card" src={corner3[corner3.length - 1]} alt="" />
        </div>
        <div  className="Corner">
          <span>Corner 4</span><br></br>
          <img className="img-card" src={corner4[corner4.length - 1]} alt="" />
        </div>
      </div>
      <div  className="Hand">
        <div>
          <span>Your Hand</span><br></br>
          {hand.map(item => (<img key={item.code} className="img-card" 
                src={item.cardImage} alt="" />))}
        </div>
      </div>
    </div>
    );
};

export default App;
