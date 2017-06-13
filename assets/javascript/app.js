$(document).ready(function(){
	$(".winner").hide();
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

    $("#chatSubmit").on("click", function(snapshot) {
    	DOMFunctions.showChats(snapshot);
    })

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
            }
        }
    });

    var DOMFunctions = {
        showPlayerInfo: function (snapshot) {
            var player1 = snapshot.child('1/name').val();
            var player2 = snapshot.child('2/name').val();
            if(player1 !== '') {
                $(".playerID1").html(player1);
                $(".status1 > h3").html("Waiting for Player to Select");
            } else {
                $(".playerID1").html("Player 1");
                $(".status1 > h3").html("Waiting for Sign-In");
            }
            if ((player1 !== "") && (player.number == 1)) {
                $(".player1 > .waiting").empty();
                var buttons1 = '<button type="button" class="rock1"><h3><i class="fa fa-hand-rock-o" aria-hidden="true"></i>Rock</h3></button><button type="button" class="scissors1"><h3><i class="fa fa-hand-scissors-o" aria-hidden="true"></i>Scissors</h3></button><button type="button" class="paper1"><h3><i class="fa fa-hand-paper-o" aria-hidden="true"></i>Paper</h3></button>'
                $(".player1 > .waiting").append(buttons1);
                $(".input1").html('<h2>Welcome ' + player1 + '</h2>');
            }
            if (player2 !== '') {
                $(".playerID2").html(player2);
                $(".status2 > h3").html("Waiting for Player to Select");
            } else {
                $(".playerID2").html("Player 2");
                $(".status2 > h3").html("Waiting for Sign-In");
            }
             if ((player2 !== "") && (player.number == 2)) {
                $(".player2 > .waiting").empty();
                 var buttons2 = '<button type="button" class="rock2"><h3><i class="fa fa-hand-rock-o" aria-hidden="true"></i>Rock</h3></button><button type="button" class="scissors2"><h3><i class="fa fa-hand-scissors-o" aria-hidden="true"></i>Scissors</h3></button><button type="button" class="paper2"><h3><i class="fa fa-hand-paper-o" aria-hidden="true"></i>Paper</h3></button>'
                $(".player2 > .waiting").append(buttons2);
                $(".input1").html('<h2>Welcome ' + player2 + '</h2>');
            }
 
        },
         gameChoice: function(snapshot) {
            var choice1 = "";
            var choice2 = "";
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
                
            } if (snapshot.child("1/choice").val() != "") {
            	$(".status1 > h3").html("Player has made Selection");
            }
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
                
            }  if (snapshot.child("2/choice").val() != "") {
            	$(".status2 > h3").html("Player has made Selection");
            }
            getWinner(snapshot);
        },
        showChats: function (snapshot) {
    		var snap1 = firebase.database().ref("/presence/1");
    		var snap2 = firebase.database().ref("/presence/2");
    		console.log(player.name);
        	if ((snapshot.child("1/name").val() !== "") && (snapshot.child("1/sender").val() == "")) {
        		snap1.update({sender : player.name})
        	}
            // var chatMessage = snapshot.val();
            // var chatMessage = listRef.child(player)
            // console.log(chatMessage);
            // Only show messages sent in the last half hour. A simple workaround for not having a ton of chat history.
            // if (Date.now() - chatMessage.timestamp < 1800000) {
            //     var messageDiv = $('#textArea');
            //     messageDiv.val(chatMessage.sender + ': ' + chatMessage.message);
            //     // messages.append(messageDiv);
            // }
            // DOMFunctions.updateScroll();
        },
        updateScroll: function () {
            messages[0].scrollTop = messages[0].scrollHeight;
        }
    }
    function getWinner (snapshot) {
    		var snap1 = firebase.database().ref("/presence/1");
    		var snap2 = firebase.database().ref("/presence/2");
    		var ties = snapshot.child("1/ties").val();
    		var win1 = snapshot.child("1/wins").val();
    		var loss1 = snapshot.child("1/losses").val();
     		var win2 = snapshot.child("2/wins").val();
    		var loss2 = snapshot.child("2/losses").val();
    		var name1 = snapshot.child("1/name").val();
    		var name2 = snapshot.child("2/name").val();
    		console.log(name2)
        if ((snapshot.child("1/choice").val() == "paper") && (snapshot.child("2/choice").val() == "paper")) {
            ties = ties + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({ties: ties});
            snap2.update({ties: ties});
            $(".winBox").html("Tie!!")
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
       }
         if ((snapshot.child("1/choice").val() == "rock") && (snapshot.child("2/choice").val() == "rock")) {
            ties = ties + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({ties: ties});
            snap2.update({ties: ties});
         	$(".status1 > h3").html("Waiting for Player to Select");
        	$(".status2 > h3").html("Waiting for Player to Select");
        }
         if ((snapshot.child("1/choice").val() == "scissors") && (snapshot.child("2/choice").val() == "scissors")) {
            ties = ties + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({ties: ties});
            snap2.update({ties: ties});
            $(".winBox").html("Tie!!")
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
         if ((snapshot.child("1/choice").val() == "rock") && (snapshot.child("2/choice").val() == "paper")) {
            win2 = win2 + 1;
            loss1 = loss1 + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({losses: loss1});
            snap2.update({wins: win2});
            $(".winBox").html("<p>"+ name2 + " Wins!!</p><p>"+name1+" chose rock, "+name2+" chose paper</p>");
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
          if ((snapshot.child("1/choice").val() == "rock") && (snapshot.child("2/choice").val() == "scissors")) {
            win1 = win1 + 1;
            loss2 = loss2 + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({wins: win1});
            snap2.update({losses: loss2});
            $(".winBox").html("<p>"+ name1 + " Wins!!</p><p>"+name1+" chose rock, "+name2+" chose scissors</p>");
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
          if ((snapshot.child("1/choice").val() == "paper") && (snapshot.child("2/choice").val() == "scissors")) {
            win2 = win2 + 1;
            loss1 = loss1 + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({losses: loss1});
            snap2.update({wins: win1});
            $(".winBox").html("<p>"+ name2 + " Wins!!</p><p>"+name1+" chose paper, "+name2+" chose scissors</p>");
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
          if ((snapshot.child("1/choice").val() == "paper") && (snapshot.child("2/choice").val() == "rock")) {
            win1 = win1 + 1;
            loss2 = loss2 + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({wins: win1});
            snap2.update({losses: loss2});
            $(".winBox").html("<p>"+ name1 + " Wins!!</p><p>"+name1+" chose paper, "+name2+" chose rock</p>");
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
          if ((snapshot.child("1/choice").val() == "scissors") && (snapshot.child("2/choice").val() == "rock")) {
            win2 = win2 + 1;
            loss1 = loss1 + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({losses: loss1});
            snap2.update({wins: win2});
            $(".winBox").html("<p>"+ name2 + " Wins!!</p><p>"+name1+" chose scissors, "+name2+" chose rock</p>");
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
          if ((snapshot.child("1/choice").val() == "scissors") && (snapshot.child("2/choice").val() == "paper")) {
            win1 = win1 + 1;
            loss2 = loss2 + 1;
            snap1.update({choice: ""});
            snap2.update({choice: ""});
            snap1.update({wins: win1});
            snap2.update({losses: loss2});
            $(".winBox").html("<p>"+ name1 + " Wins!!</p><p>"+name1+" chose scissors, "+name2+" chose paper</p>");
            $(".winner").show();
			setTimeout(function(){
				$(".winner").hide();
         		$(".status1 > h3").html("Waiting for Player to Select");
        		$(".status2 > h3").html("Waiting for Player to Select");     
	    	}, 1000);
        }
        $(".winTally1").html(win1);
        $(".winTally2").html(win2);
        $(".tieTally").html(ties);
        $(".lossTally1").html(loss1);
        $(".lossTally2").html(loss2);

    };
});