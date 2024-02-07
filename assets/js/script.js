'use strict';
import { updateScoreLive,updateCurrentScoreLive,diceRollLive,updateTurn, declareWinner, updateDashboard, restartGame, endGame} from './backend.js';

$(document).ready(function () {

   var isOnline = true;

    //play with friend button
    $("#play-friend-btn").click(function () {
        $("div.curtain").addClass("open");
        $(".room-details").removeClass("online");
        $(".player-dashboard .play-btns").removeClass("hide");
        $(".info-modal .btns-container").removeClass("disabled");
        isOnline = false;
    });

    //dice roll button
    $("button.btn--roll").click(function () {
        diceRoll();
    });

   //dice hold button
    $("button.btn--hold").click(function () {

        let currentScore = $(".player--active .current-score").text();
        UpdatePlayerScore(currentScore);
        updateCurrentScore(1);
    });

    //new game button
    $("button.btn-new-game").click(function () {
       
        $("button.btn--menu").click();
        if(isOnline){
            restartGame();
        }
            renewGame();   
    });

    //dashboard menu button
    $("button.btn--menu").click(function(){
       $(".player-dashboard").toggleClass("show-details");
       $(this).toggleClass("cross");

    });

    //close game button
    $("button.btn-end").click(function(){
        renewGame();
        $("button.btn--menu").click();
        $("div.curtain").removeClass("open");
        $("#PlayerName").text("Player 1");
        $("#OpponentName").text("Player 2");

        if(isOnline){
            updateDashboard(false);
            endGame();
        }

    });


   //roll dice function
    function diceRoll() {

        let x = 10;

        while (x > 6){
            x = Math.floor(Math.random() * (6 - 1)) + 1;
        }

        if(isOnline){
             diceRollLive(x);
        }

        $("img.dice").attr("src", "assets/imgs/dice-" + x + ".png");
        updateCurrentScore(x);
    }


    //update current score
    function updateCurrentScore(score) {
        let finalScore = $(".player--active .current-score").text();
        finalScore = Math.floor(finalScore) + score;

        if (score == 1) {

            checkWinner();
            $(".player--active .current-score").text(0);
            switchPlayer();
            if(isOnline){
                updateCurrentScoreLive(0);
            }
        }

        else {
            $(".player--active .current-score").text(finalScore);
            if(isOnline){
                updateCurrentScoreLive(finalScore);
            }
        }

    }


   //switch player 
    function switchPlayer() {

        
        if(isOnline){
            if($(".player.player--0").hasClass("player--active")){
                updateTurn(0);
            }
            else{
                updateTurn(1);
            }
        }

        else{
            $(".player").toggleClass("player--active");
        }
    }


   //update final score
    function UpdatePlayerScore(score) {
        let finalScore = $(".player--active .score").text();
        finalScore = parseInt(finalScore, 10) + parseInt(score, 10);
       // console.log("final score is" + finalScore);

        $(".player--active .score").text(finalScore);

        if(isOnline){
            updateScoreLive(finalScore);
        }


    }

    //check for winner
    function checkWinner() {
        console.log("checking winner");

        let finalScore = $(".player--active .score").text();
        finalScore = parseInt(finalScore, 10);

        if (finalScore >= 100) {
            $(".player--active").addClass("player--winner");
            console.log("winner is found");
            enabledisablebtns(0);
            if(isOnline){
                declareWinner();
            }
        }
    }

    //disable buttons
    function enabledisablebtns(val) {

        if (val == 0) {
            $("button.btn--roll").addClass("hidden");
            $("button.btn--hold").addClass("hidden");
        }

        else if (val == 1) {
            $("button.btn--roll").removeClass("hidden");          
            $("button.btn--hold").removeClass("hidden");
        }
    }

    //restart game
    function renewGame(){
        enabledisablebtns(1);
        updateCurrentScore(1);
        $(".player").removeClass("player--winner");
        $(".player .score").text(0);
    }

});
