import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './App.css';

function App() {
  // Global variables
  const urlDrawHand = 'https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=1';
  const urlGetDraw = 'https://deckofcardsapi.com/api/deck/new/draw/?count=18';
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
  const [deckId, setDeckId] = useState('');
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
  const onExpand = useCallback(num => {
    console.log('Expand', num);
    setGameState(() => {
      return {
        message: 'Card pile expanded',
      };
    });
  }, []);

  // Expand card pile
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

  // useEffect - Get 18 cards from deck
  useEffect(() => {
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
            code: data.cards[i].code,
          };
          workHandPC.push(handEntry);
        }
        //  load Side Pile's
        handEntry = {
          cardImage: data.cards[i].image,
          sortKey: 1,
          sortCard: 1,
          code: data.cards[i].code,
        };
        workSide1.push(handEntry);
        workSide2.push(data.cards[15].image);
        workSide3.push(data.cards[16].image);
        workSide4.push(data.cards[17].image);

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
        console.table(workSide1);
        setDeckId(data.deck_id);
      });
  }, []);

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
    if (source.droppableId === 'KCHAND') {
      add = changedHand[source.index];
      changedHand.splice(source.index, 1);
    } else if (source.droppableId === 'KCHANDPC') {
      add = changedHandPC[source.index];
      changedHandPC.splice(source.index, 1);
    } else if (source.droppableId === 'KCCORNER1') {
      add = changedCorner1[source.index];
      changedCorner1.splice(source.index, 1);
    } else if (source.droppableId === 'KCCORNER2') {
      add = changedCorner2[source.index];
      changedCorner2.splice(source.index, 1);
    } else if (source.droppableId === 'KCCORNER3') {
      add = changedCorner3[source.index];
      changedCorner3.splice(source.index, 1);
    } else if (source.droppableId === 'KCCORNER4') {
      add = changedCorner4[source.index];
      changedCorner4.splice(source.index, 1);
    } else if (source.droppableId === 'KCSIDE1') {
      add = changedSide1[changedSide1.length - 1];
      changedSide1.splice(changedSide1.length - 1, 1);
    }

    // Destination Logic
    if (destination.droppableId === 'KCHAND') {
      changedHand.splice(destination.index, 0, add);
    } else if (destination.droppableId === 'KCHANDPC') {
      changedHandPC.splice(destination.index, 0, add);
    } else if (destination.droppableId === 'KCCORNER1') {
      changedCorner1.splice(destination.index, 1, add);
    } else if (destination.droppableId === 'KCCORNER2') {
      changedCorner2.splice(destination.index, 1, add);
    } else if (destination.droppableId === 'KCCORNER3') {
      changedCorner3.splice(destination.index, 1, add);
    } else if (destination.droppableId === 'KCCORNER4') {
      changedCorner4.splice(destination.index, 1, add);
    } else if (destination.droppableId === 'KCSIDE1') {
      changedSide1.splice(destination.index, 0, add);
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
    console.table(changedSide1);
  };

  // The following 'if' statement is to stop an initial render error.
  //    UseEffect is executed after an initial render.
  if (hand === undefined || handPC === undefined) return null;
  //console.log('before',side1,'after',side1.splice(1,side1.length - 2));
  //
  // RETURN
  return (
    <div className="Container">
      <DragDropContext onDragEnd={onDragEnd}>
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
          <span>{message}</span>
          <br></br>
        </div>
        <div className="Nav-expand">
          <div
            className="Box-expand Button"
            style={{ gridColumn: 1, gridRow: 1 }}
            onClick={() => onExpand(1)}
          >
            Expand
          </div>
          <div
            className="Box-expand Button"
            style={{ gridColumn: 2, gridRow: 1 }}
            onClick={() => onExpand(2)}
          >
            Expand
          </div>
          <div
            className="Box-expand Button"
            style={{ gridColumn: 3, gridRow: 1 }}
            onClick={() => onExpand(3)}
          >
            Expand
          </div>
          <div
            className="Box-expand Button"
            style={{ gridColumn: 4, gridRow: 1 }}
            onClick={() => onExpand(4)}
          >
            Expand
          </div>
        </div>
        <div className="Side-section">
          <Droppable droppableId="KCSIDE1" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Side">
                  <span>Side 1</span>
                  <br></br>

                  {side1
                    .filter((item, index, side1) => (index === 0 || index === side1.length - 1))
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
                  ))}

                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          <div className="Side">
            <span>Side 2</span>
            <br></br>
            <img className="img-card" src={side2[0]} alt="" />
            <img className="img-card" src={side2[side2.length === 1 ? 1 : side2.length - 1]} alt="" />
          </div>

          <div className="Side">
            <span>Side 3</span>
            <br></br>
            <img className="img-card" src={side3[0]} alt="" />
            <img className="img-card" src={side3[side3.length === 1 ? 1 : side3.length - 1]} alt="" />
          </div>

          <div className="Side">
            <span>Side 4</span>
            <br></br>
            <img className="img-card" src={side4[0]} alt="" />
            <img className="img-card" src={side4[side4.length === 1 ? 1 : side4.length - 1]} alt="" />
          </div>
        </div>

        <div className="Corner-section">
          <Droppable droppableId="KCCORNER1" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 1</span>
                  <br></br>
                  {corner1.map((item, index) => (
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
          <Droppable droppableId="KCCORNER2" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 2</span>
                  <br></br>
                  {corner2.map((item, index) => (
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
          <Droppable droppableId="KCCORNER3" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 3</span>
                  <br></br>
                  {corner3.map((item, index) => (
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
          <Droppable droppableId="KCCORNER4" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <div className="Corner">
                  <span>Corner 4</span>
                  <br></br>
                  {corner4.map((item, index) => (
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
        <Droppable droppableId="KCHAND" direction="horizontal">
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
        <Droppable droppableId="KCHANDPC" direction="horizontal">
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
