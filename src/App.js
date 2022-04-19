import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './App.css';

function App() {
  // url variables
  const urlDrawHand = 'https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=1';
  const urlGetDraw = 'https://deckofcardsapi.com/api/deck/new/draw/?count=18';

  // State
  const [message, setMessage] = useState('Draw card');
  const [side1, setSide1] = useState([]);
  const [side2, setSide2] = useState([]);
  const [side3, setSide3] = useState([]);
  const [side4, setSide4] = useState([]);

  const [corner1, setCorner1] = useState([]);
  const [corner2, setCorner2] = useState([]);
  const [corner3, setCorner3] = useState([]);
  const [corner4, setCorner4] = useState([]);
  const [deckId, setDeckId] = useState('');
  const [hand, setHand] = useState();
  const [handPC, setHandPC] = useState();
  const [expand1, setExpand1] = useState('Expand');
  const [expand2, setExpand2] = useState('Expand');
  const [expand3, setExpand3] = useState('Expand');
  const [expand4, setExpand4] = useState('Expand');
  const [expand5, setExpand5] = useState('Expand');
  const [expand6, setExpand6] = useState('Expand');
  const [expand7, setExpand7] = useState('Expand');
  const [expand8, setExpand8] = useState('Expand');

  // Draw card
  const onDraw = useCallback(() => {
    let urlDrawHand2 = urlDrawHand.replace('<<deck_id>>', deckId);
    fetch(urlDrawHand2)
      .then(response => response.json())
      .then(data => {
        if (data.remaining === 0) {
          console.error('no cards left in deck');
        }
        let changedHand = hand.slice();
        let handEntry = {},
          sortCard = 0;
        sortCard = calcSortCard(data.cards[0].value);
        handEntry = {
          cardImage: data.cards[0].image,
          sortCard: sortCard,
          code: data.cards[0].code,
        };
        changedHand.push(handEntry);
        setHand(changedHand);
        setMessage('Card drawn');
      });
  }, [deckId, hand]);

  function MakeQuerablePromise(promise) {
    if (promise.isFulfilled) return promise;
    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;
    let result = promise.then(
      function (v) {
        isFulfilled = true;
        isPending = false;
        return v;
      },
      function (e) {
        isRejected = true;
        isPending = false;
        throw e;
      }
    );
    result.isFulfilled = function () {
      return isFulfilled;
    };
    result.isPending = function () {
      return isPending;
    };
    result.isRejected = function () {
      return isRejected;
    };
    return result;
  }

  // Move a card (includes a dynamic function)
  const moveCard = (source, target, sourceIndex) => {
    const move = function (source, target, sourceIndex) {
      let add = source.slice(sourceIndex, sourceIndex + 1);
      source.splice(sourceIndex, 1);
      target.splice(target.length, 0, ...add);
    };
    move(source, target, sourceIndex);
  };

  // End of Game Check
  const endOfGameCheck = () => {
    let workMessage = '';
    if (handPC.length === 0) {
      workMessage = 'end of game';
      console.error('end of game');
    } else {
      workMessage = 'draw a card';
      console.error('NOT end of game');
    }
    return workMessage;
  };

  // drawCard - Get 1 card from deck and place on handPC
  const drawCard = useCallback(
    changedHandPC => {
      let urlDrawHand2 = urlDrawHand.replace('<<deck_id>>', deckId);
      let fetchPromise = fetch(urlDrawHand2);
      fetchPromise
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data.remaining === 0) {
            console.error('no cards left in deck');
          }
          let handEntry = {},
            sortCard = 0;
          sortCard = calcSortCard(data.cards[0].value);
          handEntry = {
            cardImage: data.cards[0].image,
            sortCard: sortCard,
            code: data.cards[0].code,
          };
          changedHandPC.push(handEntry);
          setMessage('Draw card');
          return fetchPromise;
        })
        .catch(error => {
          setMessage('Try again');
        });
      return fetchPromise;
    },
    [deckId]
  );

  // Player's Turn complete - Computer's turn
  const onTurnDone = useCallback(() => {
    let changedHandPC = handPC.slice();
    let changedCorner1 = corner1.slice();
    let changedCorner2 = corner2.slice();
    let changedCorner3 = corner3.slice();
    let changedCorner4 = corner4.slice();
    let changedSide1 = side1.slice();
    // Draw Card
    let fetchPromise = drawCard(changedHandPC);
    let myPromise = MakeQuerablePromise(fetchPromise);

    // Loop until no King's in handPC
    // If King is found in handPC, move to next available corner
    let i = 0;
    let kingPresent = 0;
    for (i = 0; i < changedHandPC.length; i++) {
      kingPresent = changedHandPC[i].code.indexOf('K');
      if (kingPresent !== -1) {
        if (changedCorner1.length === 0) {
          moveCard(changedHandPC, changedCorner1, i);
        } else if (changedCorner2.length === 0) {
          moveCard(changedHandPC, changedCorner2, i);
        } else if (changedCorner3.length === 0) {
          moveCard(changedHandPC, changedCorner3, i);
        } else {
          moveCard(changedHandPC, changedCorner4, i);
        }
        // Decrement i if a card has been moved to pickup next card
        if (i > 0) {
          i = i - 1;
        }
      }
    }
    // Check to see if a card from handPC can be moved to Side1-4 or Corner1-4 and move card
    console.log('changedHandPC', changedHandPC);
    i = 0;
    let cardsMoved = false;
    for (i = 0; i < changedHandPC.length; i++) {
      let handPCBlack = changedHandPC[i].code.includes('C') || changedHandPC[i].code.includes('S');
      let side1Black;
      if (changedSide1.length !== 0) {
        side1Black =
          changedSide1[changedSide1.length - 1].code.includes('C') ||
          changedSide1[changedSide1.length - 1].code.includes('S');
      } else {
        side1Black = null;
      }
      if (
        changedSide1.length > 0 &&
        changedHandPC[i].sortCard + 1 === changedSide1[changedSide1.length - 1].sortCard &&
        handPCBlack !== side1Black
      ) {
        moveCard(changedHandPC, changedSide1, i);
        cardsMoved = true;
      }
      if (i === changedHandPC.length && cardsMoved) {
        i = 0;
      }
    }
    // Check for end of game
    endOfGameCheck();

    // Check to see if entire Side1-4 piles can be moved to corner1-4 or to other Side1-4
    // If yes, play a card(s) on any empty sides and Check for end of game, recheck for above line
    //

    // Wait for drawCard fetch to complete before updating handPC
    myPromise.then(function (data) {
      if (myPromise.isFulfilled()) {
        setHandPC(changedHandPC);
        // setTimeout(() => { setHandPC(changedHandPC) }, 500);
      }
    });

    setCorner1(changedCorner1);
    setCorner2(changedCorner2);
    setCorner3(changedCorner3);
    setCorner4(changedCorner4);
    setSide1(changedSide1);
    //  Set message to indicate it is player's turn
    setMessage('Draw card');
  }, [handPC, drawCard, moveCard, corner1, corner2, corner3, corner4, endOfGameCheck]);

  // About the game
  const onAbout = useCallback(() => {
    alert('How to play the game');
    setMessage('Draw card');
  }, []);

  // Expand card pile
  const onExpand = useCallback(
    num => {
      if (num === 1) {
        if (expand1 === 'Expand') {
          setExpand1('Collapse');
        } else {
          setExpand1('Expand');
        }
      } else if (num === 2) {
        if (expand2 === 'Expand') {
          setExpand2('Collapse');
        } else {
          setExpand2('Expand');
        }
      } else if (num === 3) {
        if (expand3 === 'Expand') {
          setExpand3('Collapse');
        } else {
          setExpand3('Expand');
        }
      } else if (num === 4) {
        if (expand4 === 'Expand') {
          setExpand4('Collapse');
        } else {
          setExpand4('Expand');
        }
      } else if (num === 5) {
        if (expand5 === 'Expand') {
          setExpand5('Collapse');
        } else {
          setExpand5('Expand');
        }
      } else if (num === 6) {
        if (expand6 === 'Expand') {
          setExpand6('Collapse');
        } else {
          setExpand6('Expand');
        }
      } else if (num === 7) {
        if (expand7 === 'Expand') {
          setExpand7('Collapse');
        } else {
          setExpand7('Expand');
        }
      } else if (num === 8) {
        if (expand8 === 'Expand') {
          setExpand8('Collapse');
        } else {
          setExpand8('Expand');
        }
      }
      setMessage('Card pile Expanded');
    },
    [expand1, expand2, expand3, expand4, expand5, expand6, expand7, expand8]
  );

  // Calculate sortCard variable
  const calcSortCard = value => {
    let sortCard = 0;
    if (value === 'KING') {
      sortCard = 13;
    } else if (value === 'QUEEN') {
      sortCard = 12;
    } else if (value === 'JACK') {
      sortCard = 11;
    } else if (value === 'ACE') {
      sortCard = 1;
    } else {
      sortCard = Number(value);
    }
    return sortCard;
  };

  // boardSetup - Get 18 cards from deck and place on board
  const boardSetup = useCallback(() => {
    fetch(urlGetDraw)
      .then(response => response.json())
      .then(data => {
        let workHand = [],
          workHandPC = [];
        let workSide1 = [],
          workSide2 = [],
          workSide3 = [],
          workSide4 = [];
        let workCorner1 = [],
          workCorner2 = [],
          workCorner3 = [],
          workCorner4 = [];
        let handEntry = {},
          sortCard = 0;
        let i = 0;
        // load player's hand
        for (i = 0; i < 7; i++) {
          sortCard = calcSortCard(data.cards[i].value);
          handEntry = {
            cardImage: data.cards[i].image,
            sortCard: sortCard,
            code: data.cards[i].code,
          };
          workHand.push(handEntry);
        }
        // load computer's hand
        for (i = 7; i < 14; i++) {
          sortCard = calcSortCard(data.cards[i].value);
          handEntry = {
            cardImage: data.cards[i].image,
            sortCard: sortCard,
            code: data.cards[i].code,
          };
          workHandPC.push(handEntry);
        }
        //  load Side Pile's
        for (i = 14; i < 18; i++) {
          sortCard = calcSortCard(data.cards[i].value);
          handEntry = {
            cardImage: data.cards[i].image,
            sortCard: sortCard,
            code: data.cards[i].code,
          };
          if (i === 14) {
            workSide1.push(handEntry);
          } else if (i === 15) {
            workSide2.push(handEntry);
          } else if (i === 16) {
            workSide3.push(handEntry);
          } else if (i === 17) {
            workSide4.push(handEntry);
          }
        }
        // update state
        setHand(workHand);
        setHandPC(workHandPC);
        setSide1(workSide1);
        setSide2(workSide2);
        setSide3(workSide3);
        setSide4(workSide4);
        setCorner1(workCorner1);
        setCorner2(workCorner2);
        setCorner3(workCorner3);
        setCorner4(workCorner4);
        setDeckId(data.deck_id);
        setMessage('Draw card');
      });
  }, []);

  // useEffect - Get 18 cards from deck and place on playing board
  useEffect(() => {
    boardSetup();
  }, [boardSetup]);

  // Reset game
  const onReset = useCallback(() => {
    boardSetup();
  }, [boardSetup]);

  // onDragEnd: (DragDropContext functionality)
  const onDragEnd = result => {
    // store where the card was initially and where it was dropped
    const { destination, source } = result;
    // make sure there is a change (moved item outside of draggable context area)
    if (!destination || !source) {
      return;
    }
    // make sure there is a change (moved item and returned it to same place in the same column)
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    // moving cards within and between your hand and the PCs hand
    let add;
    let changedHand = JSON.parse(JSON.stringify(hand));
    let changedHandPC = JSON.parse(JSON.stringify(handPC));
    let changedCorner1 = JSON.parse(JSON.stringify(corner1)),
      changedCorner2 = JSON.parse(JSON.stringify(corner2)),
      changedCorner3 = JSON.parse(JSON.stringify(corner3)),
      changedCorner4 = JSON.parse(JSON.stringify(corner4));
    let changedSide1 = JSON.parse(JSON.stringify(side1)),
      changedSide2 = JSON.parse(JSON.stringify(side2)),
      changedSide3 = JSON.parse(JSON.stringify(side3)),
      changedSide4 = JSON.parse(JSON.stringify(side4));
    // Source Logic - remove card
    if (source.droppableId === 'HAND') {
      add = changedHand.slice(source.index, source.index + 1);
      changedHand.splice(source.index, 1);
    } else if (source.droppableId === 'HANDPC') {
      add = changedHandPC.slice(source.index, source.index + 1);
      changedHandPC.splice(source.index, 1);
    } else if (source.droppableId === 'CORNER1' && source.index === 0) {
      add = changedCorner1.slice();
      changedCorner1.splice(0, changedCorner1.length);
    } else if (source.droppableId === 'CORNER1' && source.index === 1) {
      add = changedCorner1.slice(changedCorner1.length - 1);
      changedCorner1.splice(changedCorner1.length - 1, 1);
    } else if (source.droppableId === 'CORNER2' && source.index === 0) {
      add = changedCorner2.slice();
      changedCorner2.splice(0, changedCorner2.length);
    } else if (source.droppableId === 'CORNER2' && source.index === 1) {
      add = changedCorner2.slice(changedCorner2.length - 1);
      changedCorner2.splice(changedCorner2.length - 1, 1);
    } else if (source.droppableId === 'CORNER3' && source.index === 0) {
      add = changedCorner3.slice();
      changedCorner3.splice(0, changedCorner3.length);
    } else if (source.droppableId === 'CORNER3' && source.index === 1) {
      add = changedCorner3.slice(changedCorner3.length - 1);
      changedCorner3.splice(changedCorner3.length - 1, 1);
    } else if (source.droppableId === 'CORNER4' && source.index === 0) {
      add = changedCorner4.slice();
      changedCorner4.splice(0, changedCorner4.length);
    } else if (source.droppableId === 'CORNER4' && source.index === 1) {
      add = changedCorner4.slice(changedCorner4.length - 1);
      changedCorner4.splice(changedCorner4.length - 1, 1);
    } else if (source.droppableId === 'SIDE1' && source.index === 0) {
      add = changedSide1.slice();
      changedSide1.splice(0, changedSide1.length);
    } else if (source.droppableId === 'SIDE1' && source.index === 1) {
      add = changedSide1.slice(changedSide1.length - 1);
      changedSide1.splice(changedSide1.length - 1, 1);
    } else if (source.droppableId === 'SIDE2' && source.index === 0) {
      add = changedSide2.slice();
      changedSide2.splice(0, changedSide2.length);
    } else if (source.droppableId === 'SIDE2' && source.index === 1) {
      add = changedSide2.slice(changedSide2.length - 1);
      changedSide2.splice(changedSide2.length - 1, 1);
    } else if (source.droppableId === 'SIDE3' && source.index === 0) {
      add = changedSide3.slice();
      changedSide3.splice(0, changedSide3.length);
    } else if (source.droppableId === 'SIDE3' && source.index === 1) {
      add = changedSide3.slice(changedSide3.length - 1);
      changedSide3.splice(changedSide3.length - 1, 1);
    } else if (source.droppableId === 'SIDE4' && source.index === 0) {
      add = changedSide4.slice();
      changedSide4.splice(0, changedSide4.length);
    } else if (source.droppableId === 'SIDE4' && source.index === 1) {
      add = changedSide4.slice(changedSide4.length - 1);
      changedSide4.splice(changedSide4.length - 1, 1);
    }

    // Destination Logic
    if (destination.droppableId === 'HAND') {
      changedHand.splice(destination.index, 0, ...add);
    } else if (destination.droppableId === 'HANDPC') {
      changedHandPC.splice(destination.index, 0, ...add);
    } else if (destination.droppableId === 'CORNER1') {
      changedCorner1.splice(changedCorner1.length, 0, ...add);
    } else if (destination.droppableId === 'CORNER2') {
      changedCorner2.splice(changedCorner2.length, 0, ...add);
    } else if (destination.droppableId === 'CORNER3') {
      changedCorner3.splice(changedCorner3.length, 0, ...add);
    } else if (destination.droppableId === 'CORNER4') {
      changedCorner4.splice(changedCorner4.length, 0, ...add);
    } else if (destination.droppableId === 'SIDE1') {
      changedSide1.splice(changedSide1.length, 0, ...add);
    } else if (destination.droppableId === 'SIDE2') {
      changedSide2.splice(changedSide2.length, 0, ...add);
    } else if (destination.droppableId === 'SIDE3') {
      changedSide3.splice(changedSide3.length, 0, ...add);
    } else if (destination.droppableId === 'SIDE4') {
      changedSide4.splice(changedSide4.length, 0, ...add);
    }
    // update state
    setHandPC(changedHandPC);
    setHand(changedHand);
    setCorner1(changedCorner1);
    setCorner2(changedCorner2);
    setCorner3(changedCorner3);
    setCorner4(changedCorner4);
    setSide1(changedSide1);
    setSide2(changedSide2);
    setSide3(changedSide3);
    setSide4(changedSide4);
  };

  // The following 'if' statement is to stop an initial render error
  //    as UseEffect is not executed until after an initial render.
  if (hand === undefined || handPC === undefined) return null;
  //
  return (
    <div className="Container">
      <span className="Title">Kings Corner</span>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="Nav">
          <div className="Box Button" onClick={onReset}>
            Reset Game
          </div>
          <div className="Box Button" onClick={onDraw}>
            Draw Card
          </div>
          <div className="Box Button" onClick={onTurnDone}>
            Turn Complete
          </div>
          <div className="Box Button" onClick={onAbout}>
            About
          </div>
        </div>
        <div className="Messages">
          <span>{message}</span>
          <br></br>
        </div>
        <div className="Nav-expand">
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand1 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(1)}
          >
            {expand1}
          </div>
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand2 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(2)}
          >
            {expand2}
          </div>
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand3 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(3)}
          >
            {expand3}
          </div>
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand4 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(4)}
          >
            {expand4}
          </div>
        </div>
        <div className="Side-section">
          <Droppable droppableId="SIDE1" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Side">
                  <span>Side 1</span>
                  <br></br>

                  {expand1 === 'Expand'
                    ? side1
                        .filter((item, index, side1) => index === 0 || index === side1.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : side1.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="SIDE2" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Side">
                  <span>Side 2</span>
                  <br></br>

                  {expand2 === 'Expand'
                    ? side2
                        .filter((item, index, side2) => index === 0 || index === side2.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : side2.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="SIDE3" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Side">
                  <span>Side 3</span>
                  <br></br>

                  {expand3 === 'Expand'
                    ? side3
                        .filter((item, index, side3) => index === 0 || index === side3.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : side3.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="SIDE4" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Side">
                  <span>Side 4</span>
                  <br></br>

                  {expand4 === 'Expand'
                    ? side4
                        .filter((item, index, side4) => index === 0 || index === side4.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : side4.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </div>

        <div className="Nav-expand">
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand5 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(5)}
          >
            {expand5}
          </div>
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand6 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(6)}
          >
            {expand6}
          </div>
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand7 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(7)}
          >
            {expand7}
          </div>
          <div
            className="Box-expand Button"
            style={{ backgroundColor: expand8 === 'Expand' ? 'green' : 'red' }}
            onClick={() => onExpand(8)}
          >
            {expand8}
          </div>
        </div>

        <div className="Corner-section">
          <Droppable droppableId="CORNER1" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 1</span>
                  <br></br>

                  {expand5 === 'Expand'
                    ? corner1
                        .filter((item, index, corner1) => index === 0 || index === corner1.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : corner1.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="CORNER2" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 2</span>
                  <br></br>

                  {expand6 === 'Expand'
                    ? corner2
                        .filter((item, index, corner2) => index === 0 || index === corner2.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : corner2.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="CORNER3" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 3</span>
                  <br></br>

                  {expand7 === 'Expand'
                    ? corner3
                        .filter((item, index, corner3) => index === 0 || index === corner3.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : corner3.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="CORNER4" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 4</span>
                  <br></br>

                  {expand8 === 'Expand'
                    ? corner4
                        .filter((item, index, corner4) => index === 0 || index === corner4.length - 1)
                        .map((item, index) => (
                          <Draggable draggableId={item.code} index={index} key={item.code}>
                            {provided => (
                              <img
                                className="img-card"
                                src={item.cardImage}
                                alt=""
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))
                    : corner4.map((item, index) => (
                        <Draggable draggableId={item.code} index={index} key={item.code}>
                          {provided => (
                            <img
                              className="img-card"
                              src={item.cardImage}
                              alt=""
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                            />
                          )}
                        </Draggable>
                      ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </div>

        <Droppable droppableId="HAND" direction="horizontal">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div className="Hand">
                <div>
                  <span>Your Hand</span>
                  <br></br>
                  {hand.map((item, index) => (
                    <Draggable draggableId={item.code} index={index} key={item.code}>
                      {provided => (
                        <img
                          className="img-card"
                          src={item.cardImage}
                          alt=""
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            </div>
          )}
        </Droppable>

        <Droppable droppableId="HANDPC" direction="horizontal">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div className="Hand">
                <div>
                  <span>Computer Hand</span>
                  <br></br>
                  {handPC.map((item, index) => (
                    <Draggable draggableId={item.code} index={index} key={item.code}>
                      {provided => (
                        <img
                          className="img-card"
                          src={item.cardImage}
                          alt=""
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default App;
