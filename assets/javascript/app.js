$(document).ready(function(){
    // Initialize Firebase
    var config = {
    apiKey: "AIzaSyC7DgDuCBsbwLV--W6g1KVz9RhN_yFCsZo",
    authDomain: "rockpaperscissors-2f22a.firebaseapp.com",
    databaseURL: "https://rockpaperscissors-2f22a.firebaseio.com",
    projectId: "rockpaperscissors-2f22a",
    storageBucket: "rockpaperscissors-2f22a.appspot.com",
    messagingSenderId: "594920988444"
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    var listRef = database.ref("presence");
    var userRef = listRef.push();
    var chats = database.ref("chat");
    // Add ourselves to presence list when online.
    var presenceRef = database.ref(".info/connected");
    presenceRef.on("value", function(snap) {
      if (snap.val()) {
        // Remove ourselves when we disconnect.
        userRef.onDisconnect().remove();

        userRef.set(true);
      }
    });
    // Initialize player/opponent data.
    var con;
    var player = {
        number: '0',
        name: '',
        wins: 0,
        losses: 0,
        ties: 0,
        turns: 0,
        choice: '',
        sender: '',
        message: ''
    };
    var opponent = {
        number: '0',
        name: '',
        wins: 0,
        losses: 0,
        ties: 0,
        turns: 0,
        choice: '',
        sender: '',
        message: ''
    };
    var waiting = false;

    // Number of online users is the number of objects in the presence list.
    listRef.once("value", function(snapshot) {
        if (Object.keys(snapshot.val()).indexOf('1') === -1) {
            player.number = '1';
            opponent.number = '2';
        } else if (Object.keys(snapshot.val()).indexOf('2') === -1) {
            player.number = '2';
            opponent.number = '1';
        }

        // If you got a player number, you're 1 or 2.
        if (player.number !== '0') {
            // Make a connection to Firebase and send your info.
            con = listRef.child(player.number);
            con.set(player);
            // When I disconnect, remove this device.
            con.onDisconnect().remove();

            // If 1 and 2 were taken, your number is still 0.
        } else {
            // Remove the name form and put the alert there.
           $(".main > .wrapper").empty();
            setTimeout(function(){
                alert("Two users already on");     
            }, 50);
        }
        
    }); 


    $("#submit").on("click", function(snap) {
        player.name = $("#name-input").val();
        con.update({
            name: player.name
        });
    });

    listRef.on('value', function (snapshot) {

        // If the player is connected,
        DOMFunctions.showPlayerInfo(snapshot);
        DOMFunctions.gameChoice(snapshot);
        if (con) {
            // And an opponent is connected,
            if (Object.keys(snapshot.val()).indexOf(opponent.number) !== -1) {
                // Gather the latest info about your opponent and also yourself.
                opponent = snapshot.val()[opponent.number];
                player = snapshot.val()[player.number];
                //shows player ID and game area

                // If we have a name for our opponent,
                if (opponent.name.length > 0) {
                    // Show the opponent. This also updates the opponents info over time.
                    // DOMFunctions.showOpponentInfo(snapshot);
                    // Once both players have a name,
                    if (player.name.length > 0) {
                        // Check each time whether the players have made selections.
                        var choice1 = snapshot.val()['1'].choice;
                        var choice2 = snapshot.val()['2'].choice;
                        var turns1 = snapshot.val()['1'].turns;

                        // If both have picked, run getWinner on those choices.
                        // if (choice1.length > 0 && choice2.length > 0) {
                            // getWinner(choice1, choice2);
                            // getWinner();
                            // DOMFunctions.getWinner(choice1, choice2);
                            // If player 1 hasn't chosen yet, show them their options.
                        // } else if (choice1.length === 0 && turns1 === 0) {
                        //     DOMFunctions.showMoveOptions('1');
                            // Otherwise player 2 must be the one who hasn't make a choice yet.
            //             } else if (choice1.length > 0 && choice2.length === 0) {
            //                 DOMFunctions.showMoveOptions('2');
            //             }
                    }
                }
            // } else if (opponent.name.length > 0 && Object.keys(snapshot.val()).indexOf(opponent.number) === -1) {
                // $('.turn').text('Opponent left. Waiting for new opponent.');
                // $('.waiting-' + opponent.number).show();
                // $('.name-' + opponent.number).empty();
                // $('.win-loss-' + opponent.number).empty();
            }
        }
    });

    var DOMFunctions = {
        showPlayerInfo: function (snapshot) {
            // var player1 = snapshot.val()['1'].name;
            // var player2 = snapshot.val()['2'].name;
            var player1 = snapshot.child('1/name').val();
            var player2 = snapshot.child('2/name').val();
            if(player1 !== '') {
                $(".playerID1").html(player1);
            } else {
                $(".playerID1").html("Player 1");
            }
            if ((player1 !== "") && (player.number == 1)) {
                $(".player1 > .waiting").empty();
                var buttons1 = '<button type="button" class="rock1"><h3><i class="fa fa-hand-rock-o" aria-hidden="true"></i>Rock</h3></button><button type="button" class="scissors1"><h3><i class="fa fa-hand-scissors-o" aria-hidden="true"></i>Scissors</h3></button><button type="button" class="paper1"><h3><i class="fa fa-hand-paper-o" aria-hidden="true"></i>Paper</h3></button>'
                $(".player1 > .waiting").append(buttons1);
                // $(".input1").empty();
                $(".input1").html('<h2>Welcome ' + player1 + '</h2>');
            }
            if (player2 !== '') {
                $(".playerID2").html(player2);
            } else {
                $(".playerID2").html("Player 2");
            }
             if ((player2 !== "") && (player.number == 2)) {
                $(".player2 > .waiting").empty();
                 var buttons2 = '<button type="button" class="rock2"><h3><i class="fa fa-hand-rock-o" aria-hidden="true"></i>Rock</h3></button><button type="button" class="scissors2"><h3><i class="fa fa-hand-scissors-o" aria-hidden="true"></i>Scissors</h3></button><button type="button" class="paper2"><h3><i class="fa fa-hand-paper-o" aria-hidden="true"></i>Paper</h3></button>'
                $(".player2 > .waiting").append(buttons2);
                // $(".input1").empty();
                $(".input1").html('<h2>Welcome ' + player2 + '</h2>');
            }
 
        },
         gameChoice: function(snapshot) {
            var choice1 = "";
            var choice2 = "";
            // if (snapshot.val()['1'].choice.length == 0) {
            if (snapshot.child('1/choice').val() == "") {
                $(".rock1").click(function(choice1) {
                    choice1 = "rock";
                    con.update({
                        choice: choice1
                    });
                });
                $(".scissors1").click(function(choice1) {
                    choice1 = "scissors";
                     con.update({
                        choice: choice1
                    });
                });
                $(".paper1").click(function(choice1) {
                    choice1 = "paper";
                     con.update({
                        choice: choice1
                    });
                });
            }
            // if (snapshot.val()['2'].choice.length == 0) {
            if (snapshot.child('2/choice').val() == "") {
                $(".rock2").click(function(choice2) {
                    choice2 = "rock";
                    con.update({
                        choice: choice2
                    });
                });
                $(".scissors2").click(function(choice2) {
                    choice2 = "scissors";
                     con.update({
                        choice: choice2
                    });
                });
                $(".paper2").click(function(choice2) {
                    choice2 = "paper";
                     con.update({
                        choice: choice2
                    });
                });
            }
            getWinner(snapshot);
        },
        showChats: function (snapshot) {
            // var chatMessage = snapshot.val();
            var chatMessage = listRef.child(player)
            // Only show messages sent in the last half hour. A simple workaround for not having a ton of chat history.
            if (Date.now() - chatMessage.timestamp < 1800000) {
                var messageDiv = $('#textArea');
                messageDiv.val(chatMessage.sender + ': ' + chatMessage.message);
                // messages.append(messageDiv);
            }
            // DOMFunctions.updateScroll();
        },
        updateScroll: function () {
            messages[0].scrollTop = messages[0].scrollHeight;
        }
    }
    function getWinner (snapshot) {
        if ((snapshot.child("1/choice").val() == "paper") && (snapshot.child("2/choice").val() == "paper")) {
            console.log("tie");
            player.ties = player.ties + 1;
            console.log(player.ties);
            // database.ref().child("1").once("value", function(snapshot) {
            //     var snap = snapshot.val();
            //     snap.update({ties: player.ties});
            // })
            firebase.database().ref().child('1/ties').update(player.ties);
            firebase.database().ref().child('2/ties').update(player.ties);
        }
    };
console.log(player.ties)
});