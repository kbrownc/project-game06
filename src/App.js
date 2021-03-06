import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './App.css';
import { fullDeck } from './fullDeck';
//import { fullDeck } from './fullDeck2';

function App() {
  // url variables
  const urlDrawHand = 'https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=1';
  const urlDrawHandTest = 'https://dog.ceo/api/breeds/image/random';
  const urlGetDraw = 'https://deckofcardsapi.com/api/deck/new/draw/?count=18';
  const urlDrawHandMulti = 'https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=numCards';

  // State
  const [useTestBed, setUseTestBed] = useState(false);

  const [cardsRem, setCardsRem] = useState(51);
  const [message, setMessage] = useState('Draw a card');
  const [endOfGame, setEndOfGame] = useState(false);
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
  const [handPCround, setHandPCround] = useState([]);
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
    if (useTestBed) {
      let workMessage = '';
      if (cardsRem === 1) {
        workMessage = 'no cards left in deck';
        setEndOfGame(true);
      }
      let workCardsRem = cardsRem - 1;
      let changedHand = hand.slice();
      let handEntry = {},
        sortCard = 0;
      sortCard = calcSortCard(fullDeck[51 - workCardsRem].sortCard);
      handEntry = {
        cardImage: fullDeck[51 - workCardsRem].cardImage,
        sortCard: sortCard,
        code: fullDeck[51 - workCardsRem].code,
      };
      changedHand.push(handEntry);
      setHand(changedHand);
      if (workMessage === '') {
        workMessage = 'Move a Card';
      }
      setMessage(workMessage);
      setCardsRem(workCardsRem);
    } else {
      fetch(urlDrawHand2)
        .then(response => response.json())
        .then(data => {
          let workMessage = '';
          if (data.remaining === 0) {
            workMessage = 'no cards left in deck';
            setEndOfGame(true);
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
          setCardsRem(data.remaining);
          if (workMessage === '') {
            workMessage = 'Move a Card';
          }
          setMessage(workMessage);
        });
    }
  }, [deckId, hand, cardsRem, useTestBed]);

  // Move a card
  const moveCard = (source, target, sourceIndex, changedHandPCround) => {
    let add = source.slice(sourceIndex, sourceIndex + 1);
    source.splice(sourceIndex, 1);
    target.splice(target.length, 0, ...add);
    changedHandPCround.splice(changedHandPCround.length, 0, ...add);
    //console.log({...add},{...changedHandPCround});
    //console.log('moveCard', { ...add }, { ...target });
  };

  // Figure out if a card can be moved (to a card 1 lower and opposite color)
  const checkForMove = (source, target, sourceIndex, cardsMoved, changedHandPCround) => {
    let index = sourceIndex;
    if (source.length === 0) return;
    let sourceBlack = source[sourceIndex].code.includes('C') || source[sourceIndex].code.includes('S');
    let targetBlack = null;
    if (target.length !== 0) {
      targetBlack =
        target[target.length - 1].code.includes('C') || target[target.length - 1].code.includes('S');
    }
    if (
      target.length > 0 &&
      source[sourceIndex].sortCard + 1 === target[target.length - 1].sortCard &&
      sourceBlack !== targetBlack
    ) {
      moveCard(source, target, sourceIndex, changedHandPCround);
      cardsMoved = true;
      if (sourceIndex > 0) {
        index = sourceIndex - 1;
      }
    }
    return [index, cardsMoved];
  };

  // Figure out if a card can be moved (to a card 1 lower and opposite color)
  const checkForMovePile = (source, target, sourceIndex, cardsMoved, changedHandPCround) => {
    let sourceBlack = source[sourceIndex].code.includes('C') || source[sourceIndex].code.includes('S');
    let targetBlack =
      target[target.length - 1].code.includes('C') || target[target.length - 1].code.includes('S');
    if (
      source[sourceIndex].sortCard + 1 === target[target.length - 1].sortCard &&
      sourceBlack !== targetBlack
    ) {
      let i = 0;
      for (i = 0; i < source.length; i++) {
        moveCard(source, target, i, changedHandPCround);
        i = i - 1;
      }
      cardsMoved = true;
    } else {
      cardsMoved = false;
    }
    return cardsMoved;
  };

  // move a pile
  const movePile = (source, target, changedHandPC, cardsMoved, changedHandPCround) => {
    let workMessage = '';
    if (target.length > 0 && source.length > 0) {
      cardsMoved = checkForMovePile(source, target, 0, cardsMoved, changedHandPCround);
      if (cardsMoved) {
        moveCard(changedHandPC, source, 0, changedHandPCround);
        // NEW: move to handle addition of card to empty pile... and if it can be built on
        let cardsMoved = false;
        for (let i = 0; i < changedHandPC.length; i++) {
          if (changedHandPC.length === 0) break;
          [i, cardsMoved] = checkForMove(changedHandPC, source, i, cardsMoved, changedHandPCround);
          if (cardsMoved) {
            i = -1;
            cardsMoved = false;
          }
        }
        cardsMoved = true;
        // NEW END
        workMessage = endOfGameCheck(changedHandPC);
      }
    }
    return [workMessage, cardsMoved];
  };

  // End of Game Check
  const endOfGameCheck = hand => {
    let workMessage = '';
    if (hand.length === 0) {
      workMessage = 'end of game';
      setEndOfGame(true);
    }
    return workMessage;
  };

  // drawCard - Get 1 card from deck and place on handPC
  const drawCard = useCallback(() => {
    let urlDrawHand2 = urlDrawHand.replace('<<deck_id>>', deckId);
    if (useTestBed) {
      urlDrawHand2 = urlDrawHandTest;
    }
    return fetch(urlDrawHand2)
      .then(response => {
        return response.json();
      })
      .then(data => {
        let handEntry = {},
          sortCard = 0;
        let workMessage = '';
        if (useTestBed) {
          let workCardsRem = cardsRem;
          if (cardsRem === 1) {
            workMessage = 'no cards left in deck';
            setEndOfGame(true);
          }
          workCardsRem = workCardsRem - 1;
          sortCard = calcSortCard(fullDeck[51 - workCardsRem].sortCard);
          handEntry = {
            cardImage: fullDeck[51 - workCardsRem].cardImage,
            sortCard: sortCard,
            code: fullDeck[51 - workCardsRem].code,
          };
          setCardsRem(workCardsRem);
        } else {
          if (data.remaining === 0) {
            workMessage = 'no cards left in deck';
            setEndOfGame(true);
          }
          sortCard = calcSortCard(data.cards[0].value);
          handEntry = {
            cardImage: data.cards[0].image,
            sortCard: sortCard,
            code: data.cards[0].code,
          };
          setCardsRem(data.remaining);
        }
        return [handEntry, workMessage];
      })
      .catch(error => {
        let workMessage = 'Network error - Try again';
        let handEntry = {};
        return [handEntry, workMessage];
      });
  }, [deckId, cardsRem, useTestBed]);

  // drawCard - Get 'n' cards from deck and place on Side1-4 to replace any Kings
  const drawMultiCard = useCallback(
    (deckId, numCards) => {
      let urlDrawHandMulti2 = urlDrawHandMulti.replace('<<deck_id>>', deckId).replace('numCards', numCards);
      if (useTestBed) {
        urlDrawHandMulti2 = urlDrawHandTest;
      }
      return fetch(urlDrawHandMulti2)
        .then(response => {
          return response.json();
        })
        .then(data => {
          let kingCards = [];
          let handEntry = {},
            sortCard = 0;
          if (useTestBed) {
            let workCardsRem = cardsRem;
            workCardsRem = workCardsRem - 1;
            sortCard = calcSortCard(fullDeck[51 - workCardsRem].sortCard);
            handEntry = {
              cardImage: fullDeck[51 - workCardsRem].cardImage,
              sortCard: sortCard,
              code: fullDeck[51 - workCardsRem].code,
            };
            setCardsRem(workCardsRem);
          } else {
            let i = 0;
            for (i = 0; i < numCards; i++) {
              sortCard = calcSortCard(data.cards[i].value);
              handEntry = {
                cardImage: data.cards[i].image,
                sortCard: sortCard,
                code: data.cards[i].code,
              };
              kingCards.push(handEntry);
            }
          }
          return kingCards;
        })
        .catch(error => {
          console.error('Network error - Try again');
          let kingCards = [];
          return kingCards;
        });
    },
    [cardsRem, useTestBed]
  );

  // Player's Turn complete - Computer's turn
  //
  const onTurnDone = useCallback(() => {
    let changedHandPC = JSON.parse(JSON.stringify(handPC));
    let changedHandPCround = [];
    let changedCorner1 = JSON.parse(JSON.stringify(corner1));
    let changedCorner2 = JSON.parse(JSON.stringify(corner2));
    let changedCorner3 = JSON.parse(JSON.stringify(corner3));
    let changedCorner4 = JSON.parse(JSON.stringify(corner4));
    let changedSide1 = JSON.parse(JSON.stringify(side1));
    let changedSide2 = JSON.parse(JSON.stringify(side2));
    let changedSide3 = JSON.parse(JSON.stringify(side3));
    let changedSide4 = JSON.parse(JSON.stringify(side4));
    // Draw Card
    drawCard().then(([handEntry, workMessage]) => {
      changedHandPC.push(handEntry);

      // Loop until no King's in handPC
      // If King is found in handPC, move to next available corner
      let i = 0;
      let kingPresent = 0;
      for (i = 0; i < changedHandPC.length; i++) {
        kingPresent = changedHandPC[i].code.indexOf('K');
        if (kingPresent !== -1) {
          if (changedCorner1.length === 0) {
            moveCard(changedHandPC, changedCorner1, i, changedHandPCround);
          } else if (changedCorner2.length === 0) {
            moveCard(changedHandPC, changedCorner2, i, changedHandPCround);
          } else if (changedCorner3.length === 0) {
            moveCard(changedHandPC, changedCorner3, i, changedHandPCround);
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
      i = 0;
      let cardsMoved = false;
      for (i = 0; i < changedHandPC.length; i++) {
        // find out if card is 1 less and color of cards are different
        [i, cardsMoved] = checkForMove(changedHandPC, changedSide1, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedSide2, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedSide3, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedSide4, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedCorner1, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedCorner2, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedCorner3, i, cardsMoved, changedHandPCround);
        [i, cardsMoved] = checkForMove(changedHandPC, changedCorner4, i, cardsMoved, changedHandPCround);
        // if a card was moved, start main loop over
        if (changedHandPC.length > 0 && cardsMoved) {
          i = -1;
          cardsMoved = false;
        }
      }

      // Check for end of game
      if (workMessage === '') {
        workMessage = endOfGameCheck(changedHandPC);
      }

      // TODO:
      // -Check to see if entire Side1-4 piles can be moved to corner1-4 or to another Side
      //
      // if low card side1(changedSide1[length - 1]) is 1 more and opposite color of high card side2(changedSide2[0])
      //    move entire side2 to side1
      //    move 1st card from changedHandPC to changedSide2
      //    check if card just played can be built on again from changedHandPC (repeat until cannot play) ??????????
      //    checkEndOfGame
      //    start over - continue (stops processing of current loop and starts loop again)
      // Repeat above for side2-4 (3 diff sides each time) and corner1-4 (4 sides each time)
      // break (exits loop)
      cardsMoved = false;
      while (true) {
        if (workMessage !== '') break;
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedSide1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedSide1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedSide1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedSide2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedSide2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedSide2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedSide3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedSide3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedSide3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedSide4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedSide4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedSide4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedCorner1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedCorner1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedCorner1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedCorner1,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedCorner2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedCorner2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedCorner2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedCorner2,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedCorner3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedCorner3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedCorner3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedCorner3,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide1,
          changedCorner4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide2,
          changedCorner4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide3,
          changedCorner4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        [workMessage, cardsMoved] = movePile(
          changedSide4,
          changedCorner4,
          changedHandPC,
          cardsMoved,
          changedHandPCround
        );
        if (cardsMoved) {
          cardsMoved = false;
          continue;
        }
        // Jump out of the infinite loop
        break;
      }
      if (workMessage === '') {
        workMessage = 'Draw a card player';
      }

      setHandPC(changedHandPC);
      setHandPCround(changedHandPCround);
      setCorner1(changedCorner1);
      setCorner2(changedCorner2);
      setCorner3(changedCorner3);
      setCorner4(changedCorner4);
      setSide1(changedSide1);
      setSide2(changedSide2);
      setSide3(changedSide3);
      setSide4(changedSide4);
      setMessage(workMessage);
      //console.log('*** End of PC processing');
    });
  }, [
    handPC,
    handPCround,
    drawCard,
    moveCard,
    corner1,
    corner2,
    corner3,
    corner4,
    endOfGameCheck,
    checkForMove,
    movePile,
    side1,
    side2,
    side3,
    side4,
  ]);

  // About the game
  const onAbout = useCallback(() => {
    window.confirm(
      `The object of the game is to be the first player to get rid of all the cards in your hand.` +
        ` The game uses a standard 52-card deck of playing cards. Cards rank from King highest to Ace lowest.` +
        `This game matches you up against a computer.` +
        `The game deals out a hand of 7 cards to each of you and the computer. It then places 1 card to start` +
        ` each of the 4 ???side??? piles. If one of these is a King, it moves the King to a ???corner??? pile and deals` +
        ` a new card to the side pile.` +
        `A player starts their turn by drawing 1 card by pressing the ???draw card??? button.` +
        ` A player may play a card(s) from their hand onto the existing ???side??? or ???corner??? piles.` +
        `The card played must be the next lower in rank to the card on top of the pile, and it also must be the ` +
        `opposite color. ???Corner??? piles can only start with a King.` +
        ` A player may move an entire side pile if the bottom card of that pile is the opposite color and one` +
        `rank lower than a card on top of another pile. If one of the original four ???side??? piles becomes empty` +
        ` (because the cards in it were moved onto another pile), a player may play any card from their hand ` +
        `to the empty space, thus re-starting the side pile. When a player has completed all of the moves they` +
        ` have available, they will press the ???Turn Complete??? button to trigger the computers turn. ` +
        `When this is complete (less than 1 sec), it???s the players turn again. ` +
        `A message will show when a player has won (as well as the draw card and turn complete buttons disappearing).` +
        ` The ???reset??? button discards the current game and deals out the start of a new game.`
    );
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
    if (useTestBed) {
      console.log('*** Test Bed in use ***');
      let workHand = [],
        workHandPC = [],
        workHandPCround = [];
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
        sortCard = calcSortCard(fullDeck[i].sortCard);
        handEntry = {
          cardImage: fullDeck[i].cardImage,
          sortCard: sortCard,
          code: fullDeck[i].code,
        };
        workHand.push(handEntry);
      }
      // load computer's hand
      for (i = 7; i < 14; i++) {
        sortCard = calcSortCard(fullDeck[i].sortCard);
        handEntry = {
          cardImage: fullDeck[i].cardImage,
          sortCard: sortCard,
          code: fullDeck[i].code,
        };
        workHandPC.push(handEntry);
      }
      //  load Side Pile's - move any Kinds found to corners
      let numCards = 0;
      for (i = 14; i < 18; i++) {
        sortCard = calcSortCard(fullDeck[i].sortCard);
        handEntry = {
          cardImage: fullDeck[i].cardImage,
          sortCard: sortCard,
          code: fullDeck[i].code,
        };
        if (fullDeck[i].code.indexOf('K') === -1) {
          if (workSide1.length === 0) {
            workSide1.push(handEntry);
          } else if (workSide2.length === 0) {
            workSide2.push(handEntry);
          } else if (workSide3.length === 0) {
            workSide3.push(handEntry);
          } else if (workSide4.length === 0) {
            workSide4.push(handEntry);
          }
        } else {
          numCards = numCards + 1;
          if (workCorner1.length === 0) {
            workCorner1.push(handEntry);
          } else if (workCorner2.length === 0) {
            workCorner2.push(handEntry);
          } else if (workCorner3.length === 0) {
            workCorner3.push(handEntry);
          } else if (workCorner4.length === 0) {
            workCorner4.push(handEntry);
          }
        }
      }
      let workCardsRem = 34;
      if (numCards > 0) {
        for (i = 0; i < numCards; i++) {
          workCardsRem = workCardsRem - 1;
          sortCard = calcSortCard(fullDeck[51 - workCardsRem].sortCard);
          handEntry = {
            cardImage: fullDeck[51 - workCardsRem].cardImage,
            sortCard: sortCard,
            code: fullDeck[51 - workCardsRem].code,
          };
          if (workSide4.length === 0) {
            workSide4.push(handEntry);
          } else if (workSide3.length === 0) {
            workSide3.push(handEntry);
          } else if (workSide2.length === 0) {
            workSide2.push(handEntry);
          } else if (workSide1.length === 0) {
            workSide1.push(handEntry);
          }
        }
      }
      // update state
      setCardsRem(workCardsRem);
      setHand(workHand);
      setHandPC(workHandPC);
      setHandPCround(workHandPCround);
      setSide1(workSide1);
      setSide2(workSide2);
      setSide3(workSide3);
      setSide4(workSide4);
      setCorner1(workCorner1);
      setCorner2(workCorner2);
      setCorner3(workCorner3);
      setCorner4(workCorner4);
      setDeckId('1234567890');
      setMessage('Draw card');
      setEndOfGame(false);
    } else {
      fetch(urlGetDraw)
        .then(response => response.json())
        .then(data => {
          let workHand = [],
            workHandPC = [],
            workHandPCround = [];
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
          //  load Side Pile's (King's are moved to the Corner piles)
          let numCards = 0;
          for (i = 14; i < 18; i++) {
            sortCard = calcSortCard(data.cards[i].value);
            handEntry = {
              cardImage: data.cards[i].image,
              sortCard: sortCard,
              code: data.cards[i].code,
            };
            if (data.cards[i].code.indexOf('K') === -1) {
              if (workSide1.length === 0) {
                workSide1.push(handEntry);
              } else if (workSide2.length === 0) {
                workSide2.push(handEntry);
              } else if (workSide3.length === 0) {
                workSide3.push(handEntry);
              } else if (workSide4.length === 0) {
                workSide4.push(handEntry);
              }
            } else {
              numCards = numCards + 1;
              if (workCorner1.length === 0) {
                workCorner1.push(handEntry);
              } else if (workCorner2.length === 0) {
                workCorner2.push(handEntry);
              } else if (workCorner3.length === 0) {
                workCorner3.push(handEntry);
              } else if (workCorner4.length === 0) {
                workCorner4.push(handEntry);
              }
            }
          }
          if (numCards > 0) {
            drawMultiCard(data.deck_id, numCards).then(kingCards => {
              for (i = 0; i < numCards; i++) {
                if (workSide4.length === 0) {
                  workSide4.push(kingCards[i]);
                } else if (workSide3.length === 0) {
                  workSide3.push(kingCards[i]);
                } else if (workSide2.length === 0) {
                  workSide2.push(kingCards[i]);
                } else if (workSide1.length === 0) {
                  workSide1.push(kingCards[i]);
                }
              }
              // update state
              setHand(workHand);
              setHandPC(workHandPC);
              setHandPCround(workHandPCround);
              setSide1(workSide1);
              setSide2(workSide2);
              setSide3(workSide3);
              setSide4(workSide4);
              setCorner1(workCorner1);
              setCorner2(workCorner2);
              setCorner3(workCorner3);
              setCorner4(workCorner4);
              setDeckId(data.deck_id);
              setCardsRem(data.remaining - numCards);
              setMessage('Draw card');
              setEndOfGame(false);
            });
          } else {
            // update state
            setHand(workHand);
            setHandPC(workHandPC);
            setHandPCround(workHandPCround);
            setSide1(workSide1);
            setSide2(workSide2);
            setSide3(workSide3);
            setSide4(workSide4);
            setCorner1(workCorner1);
            setCorner2(workCorner2);
            setCorner3(workCorner3);
            setCorner4(workCorner4);
            setDeckId(data.deck_id);
            setCardsRem(data.remaining);
            setMessage('Draw card');
            setEndOfGame(false);
          }
        });
    }
  }, [useTestBed]);

  // useEffect - Get 18 cards from deck and place on playing board
  useEffect(() => {
    boardSetup();
  }, []);

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
    // Check for end of game for player
    let workMessage = endOfGameCheck(changedHand);
    if (workMessage === '') {
      workMessage = 'Move a Card';
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
    setMessage(workMessage);
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
          <div className={endOfGame ? 'Invisible' : 'Box Button'} onClick={onDraw}>
            Draw Card
          </div>
          <div className={endOfGame ? 'Invisible' : 'Box Button'} onClick={onTurnDone}>
            Turn Complete
          </div>
          <div className="Box Button" onClick={onReset}>
            Reset Game
          </div>
          <div className="Box Button" onClick={onAbout}>
            About
          </div>
        </div>
        <div className="Nav-message">
          <div className="Box2">Cards Left: {cardsRem}</div>
          <div className="Messages">{message}</div>
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

        <div className="Hand">
          <div>
            Computer's Hand: No. of cards = {handPC.length} Cards Played this round:
            {handPCround.map((item, index) => ` ${item.code}`)}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
