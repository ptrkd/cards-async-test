/*
 *  Shuffle card deck and draw cards until a specified card is found.
 *  Using https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1
*/

const http = require('http');
const request = require('request');
const async = require('async');

function ShuffleCardDeckPromise() {
  var options = {
      url: 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1',
      header: {
          'User-Agent': 'request'
      }
  };

  return new Promise(function(resolve, reject) {
      request.get(options, function(err, resp, body) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body));
        }
      })
  })
}

function DrawACardPromise(deckId) {
  var options = {
      url: `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
      header: {
          'User-Agent': 'request'
      }
  };

  return new Promise(function(resolve, reject) {
      request.get(options, function(err, resp, body) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body));
        }
      })
  })
}

function main () {

    var deckInfo = null;
    var shuffleDeckPromise = ShuffleCardDeckPromise();
    var card = null;

    shuffleDeckPromise.then( function(result) {
      deckInfo = result;
      return deckInfo.deck_id;
    }, function(err) {
        console.log(err);
    })
    .then( function(result) {
      let card = null;
      let card_count = 0;
      //START LOOP
      card = async.whilst(
        function() {
          //skip first iteration
          if (card_count > 0) {
            console.log(`Deal #${card_count} is ${card}`);
          }
          card_count = card_count + 1;
          //CHECK IF WE HAVE THE QUEEN OF HEARTS
          return card != 'QH' },
          function(callback) {
            DrawACardPromise(deckInfo.deck_id)
            .then(
              function(result) {
                card = result.cards[0].code;
                callback(null, card);
              }
            );
          },
          function (err, card) {
            if (err) { console.log(err.message);}
            console.log(`Hey, we have the ${card} on deal #${card_count - 1}`);
          }
      );

    }).catch(function (err) {
      console.log(err.message);
    });
}

main();
