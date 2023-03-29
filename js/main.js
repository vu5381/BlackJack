//Get the deck
let deckId = "";
let dealerHand = [];
let playerHand = [];
let stayed = false;

fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
  .then((res) => res.json()) // parse response as JSON
  .then((data) => {
    deckId = data.deck_id;
  })
  .catch((err) => {
    console.log(`error ${err}`);
  });
document.querySelector("#deal").addEventListener("click", deal);
document.querySelector("#draw").addEventListener("click", draw);
document.querySelector("#stay").addEventListener("click", dealerPlay);

function draw() {
  if (bust(playerHand)) return alert("Cannot draw anymore cards");
  else if (playerHand.length < 2) return alert("The game has yet to start");
  else if (stayed == true)
    return alert("Your turn Has Ended. You can no longer hit.");
  else {
    const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        playerHand.push(data.cards[0]);
        let newCard = document.createElement("img");
        newCard.src = data.cards[0].image;
        document.querySelector("#playerHand").appendChild(newCard);
        document.querySelector(".playerScore").innerText = `Score: ${calcVal(playerHand)}`;
        if (bust(playerHand)){ 
          alert(`You Busted`);
          dealerPlay();
        }
      })
      .catch((err) => {
        console.log(`error: ${err}`);
      });
  }
}

function bust(hand) {
  let val = 0;
  hand.forEach((card) => {
    if (
      card.value != "KING" &&
      card.value != "QUEEN" &&
      card.value != "JACK" &&
      card.value != "ACE"
    ) {
      val = val + Number(card.value);
    } else if (
      card.value === "KING" ||
      card.value === "QUEEN" ||
      card.value === "JACK"
    ) {
      val = val + 10;
    } else {
      val = val + 1;
    }
  });
  if (val > 21) {
    return true;
  } else return false;
}

//Draw 4 cards, placing 2 in each hand
function deal() {
  clearTable(); //clear the table from any previous games.
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`;
  playerHand = [];
  dealerHand = [];
  fetch(url)
    .then((res) => res.json()) // parse response as JSON
    .then((data) => {
      document.querySelector("#dealer1").src = data.cards[0].image;
      document.querySelector("#dealer2").src =
        "http://jaredbruckner.com/NewRookWebSite/RP/L/L227/B.jpg";
      document.querySelector("#player1").src = data.cards[1].image;
      document.querySelector("#player2").src = data.cards[3].image;
      data.cards.forEach((card, index) => {
        if (index % 2 === 0) dealerHand.push(card);
        else playerHand.push(card);
      });
      document.querySelector(".playerScore").innerText = `Score: ${calcVal(playerHand)}`;
      if (
        calcVal(playerHand) === 21 &&
        dealerHand[0].value != "KING" &&
        dealerHand[0].value != "QUEEN" &&
        dealerHand[0].value != "JACK" &&
        dealerHand[0].value != "ACE" &&
        dealerHand[0].value != "10"
      ) {
        alert("BlackJack!");
        stayed = true;
        document.querySelector("#dealer2").src = dealerHand[1].image;
        whoWon();
      }
    })
    .catch((err) => {
      console.log(`error ${err}`);
    });
}

//Clear the table for a new game. Removing all cards from the deadler and player's hand.
function clearTable() {
  stayed = false;
  let parent = document.querySelector("#playerHand");
  let parent2 = document.querySelector("#dealerHand");
  let counter = playerHand.length - 2;
  let counter2 = dealerHand.length - 2; //counter variable to keep track of how many <img> elements to remove when clearing the table
  for (let i = 0; i < counter; i++) {
    parent.removeChild(parent.lastChild);
  }
  for (let i = 0; i < counter2; i++) {
    parent2.removeChild(parent2.lastChild);
  }
  document.querySelector("h3").innerText = "";
  document.querySelector("h4").innerText = "";
}

function dealerPlay() {
  stayed = true;
  if (playerHand.length < 2) return alert("The game has yet to start");
  //Show the face value of the dealer's 2nd card previously faced down during initial deal.
  document.querySelector("#dealer2").src = dealerHand[1].image; 
  if (calcVal(dealerHand) < 17) dealerDraw();
  else whoWon();
}

function whoWon() {
  let playerScore = calcVal(playerHand);
  let dealerScore = calcVal(dealerHand);
  document.querySelector(".dealerScore").innerText = `Score: ${calcVal(dealerHand)}`;
  if (playerScore === dealerScore) {
    document.querySelector(
      "h3"
    ).innerText = `Player and Dealer Draw: both have ${playerScore}`;
    return "Draw";
  } else {
    if (bust(dealerHand) && bust(playerHand)) {
      document.querySelector(
        "h3"
      ).innerText = `Player and Dealer Draw: both busted.`;
      return "Draw";
    } else if (bust(dealerHand) && !bust(playerHand)) {
      document.querySelector(
        "h3"
      ).innerText = `Player won with a score of ${playerScore}`;
      return "Player";
    } else if (!bust(dealerHand) && bust(playerHand)) {
      document.querySelector(
        "h3"
      ).innerText = `Dealer won with a score of ${dealerScore}`;
      return "Dealer";
    } else {
      if (playerScore > dealerScore) {
        document.querySelector(
          "h3"
        ).innerText = `Player won with a score of ${playerScore}`;
        return "Player";
      } else {
        document.querySelector(
          "h3"
        ).innerText = `Dealer won with a score of ${dealerScore}`;
        return "Dealer";
      }
    }
  }
}

async function dealerDraw() {
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
  let score = calcVal(dealerHand);
  try {
    while (score < 17) {
      const response = await fetch(url);
      let data = await response.json();
      dealerHand.push(data.cards[0]);
      let newCard = document.createElement("img");
      newCard.src = data.cards[0].image;
      document.querySelector("#dealerHand").appendChild(newCard);
      score = calcVal(dealerHand);
      document.querySelector(".dealerScore").innerText = `Score: ${score}`;
    }
    let winner = whoWon();
  } catch (e) {
    alert(e);
  }
}

function calcVal(hand) {
  let val = 0;
  if (hand.filter((card) => card.value === "ACE").length > 0) {
    let temp = hand.filter((card) => card.value != "ACE");
    let temp2 = hand.filter((card) => card.value === "ACE");
    let tempVal = calcVal(temp);
    if (temp2.length === 1) {
      if (tempVal + 11 > 21) val = tempVal + 1;
      else val = tempVal + 11;
    } else if (temp2.length === 2) {
      if (tempVal + 12 > 21) val = tempVal + 2;
      else val = tempVal + 12;
    }
  } else {
    hand.forEach((card) => {
      if (
        card.value != "KING" &&
        card.value != "QUEEN" &&
        card.value != "JACK" &&
        card.value != "ACE"
      ) {
        val = val + Number(card.value);
      } else if (
        card.value === "KING" ||
        card.value === "QUEEN" ||
        card.value === "JACK"
      ) {
        val = val + 10;
      } else {
        if (val + 11 > 21) val = val + 1;
        else val = val + 11;
      }
    });
  }
  return val;
}
