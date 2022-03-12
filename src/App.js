import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './App.css';

function App() {
  // url variables
  const urlDrawHand = 'https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=1';
  const urlGetDraw = 'https://deckofcardsapi.com/api/deck/new/draw/?count=18';

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

  // Reset game
  const onReset = useCallback(() => {
    console.log('Reset');
    boardSetup();
  }, []);

  // Draw card
  const onDraw = useCallback(() => {
    let urlDrawHand2 = urlDrawHand.replace('<<deck_id>>', deckId);
    fetch(urlDrawHand2)
      .then(response => response.json())
      .then(data => {
        if (data.remaining === 0) {
          console.log('no cards left in deck');
        }
        let workHand = hand.slice();
        let handEntry = {},
          sortKey = 0,
          sortCard = 0;
        sortCard = calcSortCard(data.cards[0].value);
        handEntry = {
          cardImage: data.cards[0].image,
          sortKey: workHand.length,
          sortCard: sortCard,
          selected: false,
          code: data.cards[0].code,
        };
        workHand.push(handEntry);
        setHand(workHand);
        setGameState(() => {
          return {
            message: 'Card drawn',
          };
        });
      });
  }, [deckId, hand]);

  // Turn complete
  const onTurn = useCallback(() => {
    console.log('Computer now plays');
    setGameState(() => {
      return {
        message: 'Draw card',
      };
    });
  }, []);

  // About the game
  const onAbout = useCallback(() => {
    console.log('About');
    alert('How to play the game');
    setGameState(() => {
      return {
        message: 'Draw card',
      };
    });
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
      setGameState(() => {
        return {
          message: 'Card pile expanded',
        };
      });
    },
    [expand1, expand2, expand3, expand4, expand5, expand6, expand7, expand8]
  );

  // Mark current card 'selected'
  const cardSelected = useCallback(
    index => {
      let workSelected;
      let workHandPC = handPC.slice();
      console.log(workHandPC);
      if (workHandPC[index].selected === false) {
        workSelected = true;
      } else {
        workSelected = false;
      }
      workHandPC[index].selected = workSelected;
      setHandPC(workHandPC);
    },
    [handPC]
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
        let handEntry = {},
          sortKey = 0,
          sortCard = 0;
        let i = 0;
        for (i = 0; i < 7; i++) {
          sortCard = calcSortCard(data.cards[i].value);
          handEntry = {
            cardImage: data.cards[i].image,
            sortKey: i,
            sortCard: sortCard,
            selected: false,
            code: data.cards[i].code,
          };
          workHand.push(handEntry);
        }
        //  load other (PC's) hand
        for (i = 7; i < 14; i++) {
          sortCard = calcSortCard(data.cards[i].value);
          handEntry = {
            cardImage: data.cards[i].image,
            sortKey: i,
            sortCard: sortCard,
            selected: false,
            code: data.cards[i].code,
          };
          workHandPC.push(handEntry);
        }
        //  load Side Pile's
        for (i = 14; i < 18; i++) {
          sortCard = calcSortCard(data.cards[i].value);
          handEntry = {
            cardImage: data.cards[i].image,
            sortKey: i,
            sortCard: sortCard,
            selected: false,
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
        setGameState(() => {
          return {
            message: 'Draw card',
          };
        });
      });
  }, []);

  // useEffect - Get 18 cards from deck
  useEffect(() => {
    boardSetup();
  }, [boardSetup]);

  // onDragEnd:
  //      To support DragDropContext functionality
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
    let changedHand = hand;
    let changedHandPC = handPC;
    let changedCorner1 = corner1,
      changedCorner2 = corner2,
      changedCorner3 = corner3,
      changedCorner4 = corner4;
    let changedSide1 = side1,
      changedSide2 = side2,
      changedSide3 = side3,
      changedSide4 = side4;
    // Source Logic - remove card
    if (source.droppableId === 'HAND') {
      add = changedHand[source.index];
      changedHand.splice(source.index, 1);
    } else if (source.droppableId === 'HANDPC') {
      add = changedHandPC[source.index];
      changedHandPC.splice(source.index, 1);
    } else if (source.droppableId === 'CORNER1') {
      add = changedCorner1[changedCorner1.length - 1];
      changedCorner1.splice(changedCorner1.length - 1, 1);
    } else if (source.droppableId === 'CORNER2') {
      add = changedCorner2[changedCorner2.length - 1];
      changedCorner2.splice(changedCorner2.length - 1, 1);
    } else if (source.droppableId === 'CORNER3') {
      add = changedCorner3[changedCorner3.length - 1];
      changedCorner3.splice(changedCorner3.length - 1, 1);
    } else if (source.droppableId === 'CORNER4') {
      add = changedCorner4[changedCorner4.length - 1];
      changedCorner4.splice(changedCorner4.length - 1, 1);
    } else if (source.droppableId === 'SIDE1') {
      add = changedSide1[changedSide1.length - 1];
      changedSide1.splice(changedSide1.length - 1, 1);
    } else if (source.droppableId === 'SIDE2') {
      add = changedSide2[changedSide2.length - 1];
      changedSide2.splice(changedSide2.length - 1, 1);
    } else if (source.droppableId === 'SIDE3') {
      add = changedSide3[changedSide3.length - 1];
      changedSide3.splice(changedSide3.length - 1, 1);
    } else if (source.droppableId === 'SIDE4') {
      add = changedSide4[changedSide4.length - 1];
      changedSide4.splice(changedSide4.length - 1, 1);
    }

    // Destination Logic
    if (destination.droppableId === 'HAND') {
      changedHand.splice(destination.index, 0, add);
    } else if (destination.droppableId === 'HANDPC') {
      changedHandPC.splice(destination.index, 0, add);
    } else if (destination.droppableId === 'CORNER1') {
      changedCorner1.splice(changedCorner1.length, 0, add);
    } else if (destination.droppableId === 'CORNER2') {
      changedCorner2.splice(changedCorner2.length, 0, add);
    } else if (destination.droppableId === 'CORNER3') {
      changedCorner3.splice(changedCorner3.length, 0, add);
    } else if (destination.droppableId === 'CORNER4') {
      changedCorner4.splice(changedCorner4.length, 0, add);
    } else if (destination.droppableId === 'SIDE1') {
      changedSide1.splice(changedSide1.length, 0, add);
    } else if (destination.droppableId === 'SIDE2') {
      changedSide2.splice(changedSide2.length, 0, add);
    } else if (destination.droppableId === 'SIDE3') {
      changedSide3.splice(changedSide3.length, 0, add);
    } else if (destination.droppableId === 'SIDE4') {
      changedSide4.splice(changedSide4.length, 0, add);
    }
    setHandPC(changedHandPC);
    setHand(changedHand);
    setCornerPiles(() => {
      return {
        corner1: changedCorner1,
        corner2: changedCorner2,
        corner3: changedCorner3,
        corner4: changedCorner4,
      };
    });
    setSidePiles(() => {
      return {
        side1: changedSide1,
        side2: changedSide2,
        side3: changedSide3,
        side4: changedSide4,
      };
    });
  };

  // The following 'if' statement is to stop an initial render error.
  //    UseEffect is executed after an initial render.
  if (hand === undefined || handPC === undefined) return null;
  //
  // RETURN
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
          <div className="Box Button" onClick={onTurn}>
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
                          className={`img-card${item.selected ? ' Card' : ''}`}
                          src={item.cardImage}
                          alt=""
                          onClick={() => cardSelected(index)}
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
