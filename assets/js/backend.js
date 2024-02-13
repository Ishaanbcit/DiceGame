// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, setDoc, query, where, onSnapshot, updateDoc, getCountFromServer } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBvyvJIQZjXGm40tJRsur7iAEwrSnQIQ_I",
    authDomain: "dice-game-294a9.firebaseapp.com",
    projectId: "dice-game-294a9",
    storageBucket: "dice-game-294a9.appspot.com",
    messagingSenderId: "214794687122",
    appId: "1:214794687122:web:0f00be98fc12de1684cc4b",
    measurementId: "G-85MYXTVH98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


//================================== working code ============================================================

//global frontend elements
//-----form ele
const codeGenerateBtn = $("#onlineDataModal .modal-footer button");
const playBtn = $("#onlineDataModal #join-room-form button");
const codeInputVal = $("#onlineDataModal form #room-code-input");
const nameInputVal = $("#onlineDataModal .modal-content input#playername");
const formErrorMsg = $("#onlineDataModal form .error-msg");

//---game dashboard
const playerName = $("#PlayerName");
const opponentName = $("#OpponentName");
const codePlate = $(".room-details #room-code");
const playerScore = $(".player.player--0 .score");
const playerCurrentScore = $(".player.player--0 .current-score");
const opponentScore = $(".player.player--1 .score");
const opponentCurrentScore = $(".player.player--1 .current-score");



//global variables
var roomCode = "";
var fullRoomID = "";
var fullDataID = "";
var fullOpDataID = "";
var pName = "";

//Generate code button action
$("#onlineDataModal .modal-footer button").click(function () {
    generateRoomCode();
});

//Play button action
$("#onlineDataModal .modal-content button.play-btn").click(function (e) {

    e.preventDefault();



    if (nameInputVal.val().trim() == "") {
        formErrorMsg.text("Please Enter Your name");
        formErrorMsg.addClass("display");
    }

    else if (codeInputVal.val().trim() == "") {
        formErrorMsg.text("Please Enter Room Code");
        formErrorMsg.addClass("display");
    }

    else {
        roomCode = codeInputVal.val().trim();
        pName = nameInputVal.val().trim();
        enterPlayer(codeInputVal.val(), nameInputVal.val());
    }
});

//remove error on field focus
$("#onlineDataModal .modal-content #join-room-form input").focus(function () { $("#onlineDataModal form .error-msg").removeClass("display") });



//generate room code
async function generateRoomCode() {

    codeGenerateBtn.addClass("generating");

    try {
        const docref = await addDoc(collection(db, "rooms"), {

        });

        roomCode = docref.id.slice(0, 8);
        codeGenerateBtn.removeClass("generating");
        codeInputVal.val(roomCode);


    } catch (e) {
        alert("following error occured: " + e);
        codeGenerateBtn.removeClass("generating");
    }

}


//player joins the room
async function enterPlayer() {

    var flag = false;
    const querySnap = await getDocs(collection(db, 'rooms'));

    playBtn.addClass("playing");

    try {
        querySnap.forEach((docu) => {
            if (docu.id.slice(0, 8) == roomCode) {
                fullRoomID = docu.id;
                addPlayer();
                flag = true;
            }
        });


    } catch (e) {
        formErrorMsg.text(e);
        formErrorMsg.addClass("display");
        flag = true;
        playBtn.removeClass("playing");
    }

    if (!flag) {
        formErrorMsg.text("room does not exist");
        formErrorMsg.addClass("display");
        playBtn.removeClass("playing");

    }

}


//Add Player to room
async function addPlayer() {

    const snapshot = await getCountFromServer(collection(db, "rooms", fullRoomID, "players"));
    const playerCount = snapshot.data().count;
    console.log("player count is: " + playerCount);
    if (playerCount < 2) {

        try {
            const docref = await addDoc(collection(db, "rooms", fullRoomID, "players"), {
                name: pName,
                score: 0,
                currentScore: 0,
                roomCode: roomCode,
                dice: 1,
                won: 0,
                turn: playerCount == 0 ? 1 : 0,
                // roomCreator:playerCount==0
                timeStamp: new Date().getTime(),
            });

            fullDataID = docref.id;
            // writeName(fullRoomID);
            playerName.text(pName);
            codePlate.text(roomCode);
            $(".room-details").addClass("online");
            $(".player-dashboard .play-btns").removeClass("hide");
            $(".player-dashboard .player--1 .play-btns").addClass("hide");
            $(".player-dashboard .player--0 .play-btns").addClass("op-not");

            updateDashboard(true);
            playBtn.removeClass("playing");
            $("#onlineDataModal .modal-header button").click();
            $("div.curtain").addClass("open");


        } catch (e) {
            console.log(e)
            formErrorMsg.text("Unable to join. Some error occured");
            formErrorMsg.addClass("display");
            playBtn.removeClass("playing");
        }

        if (playerCount == 1) {
            $(".info-modal .btns-container").addClass("disabled");
        }

        else {
            $(".info-modal .btns-container").removeClass("disabled");
        }

    }

    else {
        formErrorMsg.text("Room is full");
        formErrorMsg.addClass("display");
        playBtn.removeClass("playing");
    }

}

//Update score
async function updateScoreLive(score) {

    const ref = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const data = updateDoc(ref, {
        score: score,
    })
}

//Update current score
async function updateCurrentScoreLive(score) {

    // console.log("updating to: "+ score);
    const ref = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const data = updateDoc(ref, {
        currentScore: score,
    })
}

//Dice roll update
async function diceRollLive(num) {

    const refo = doc(db, "rooms", fullRoomID, "players", fullOpDataID);
    const datao = updateDoc(refo, {
        dice: num,
    })

    const refp = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const datap = updateDoc(refp, {
        dice: num,
    })


}

//Update turn
async function updateTurn(num) {

    const refo = doc(db, "rooms", fullRoomID, "players", fullOpDataID);
    const datao = updateDoc(refo, {
        turn: num == 0 ? 1 : 0,
    })

    const refp = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const datap = updateDoc(refp, {
        turn: num == 0 ? 0 : 1,
    })

}

//Declare Winner
async function declareWinner() {
    const ref = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const data = updateDoc(ref, {
        won: 1,
    });
}

//New Game
async function restartGame() {

    const ref = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const data = updateDoc(ref, {
        score: 0,
        dice: 1,
        currentScore: 0,
    });

    const refo = doc(db, "rooms", fullRoomID, "players", fullOpDataID);
    const datao = updateDoc(refo, {
        score: 0,
        dice: 1,
        currentScore: 0,
    });
}

//End Game
async function endGame() {
    const ref = doc(db, "rooms", fullRoomID, "players", fullDataID);
    const data = updateDoc(ref, {
        currentScore: 0,
        score: 0,
        name: pName + " Left the room",
    });
}

//Update Dashboard (enter false to break the connection)
async function updateDashboard(flag) {

    const player = onSnapshot(doc(db, "rooms", fullRoomID, "players", fullDataID), (doc) => {
        console.log("Current data: ", doc.data().score);
        playerCurrentScore.text(doc.data().currentScore);
        playerScore.text(doc.data().score);

        //update player turn
        if (doc.data().turn == 0) {
            $(".player-dashboard .player--0 .play-btns").addClass("hide");
            $(".player--0").removeClass("player--active");
            $(".player--1").addClass("player--active");
        }

        else {
            $(".player-dashboard .player--0 .play-btns").removeClass("hide");
            $(".player--1").removeClass("player--active");
            $(".player--0").addClass("player--active");
        }

        //update dice image
        $("img.dice").attr("src", "assets/imgs/dice-" + doc.data().dice + ".png");
         var x_ani = 20;
        while (x_ani >= 10){
            x_ani = Math.floor(Math.random() * (10)) + 1;
        }

        if(doc.data().dice<5){
            $(".dice-container.dice").css("transform","rotateX("+90*(doc.data().dice-1)+"deg) rotateY(0deg) rotateZ("+x_ani*360+"deg)");
        }

        else if(doc.data().dice==5){
            $(".dice-container.dice").css("transform","rotateX(0deg) rotateY("+90+"deg) rotateZ("+x_ani*360+"deg)");
        }

        else{
            $(".dice-container.dice").css("transform","rotateX(0deg) rotateY("+270+"deg) rotateZ("+x_ani*360+"deg)");
        }

        //check for winner
        if (doc.data().won == 1) {
            $(".player--0").addClass("player--winner");
            $(".player--1").removeClass("player--active");
            $(".play-btns").addClass("hide");
        }
    });

    const opponentq = query(collection(db, "rooms", fullRoomID, "players"), where("name", "!=", pName));

    const opp = onSnapshot(opponentq, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            fullOpDataID = doc.id;
            opponentName.text(doc.data().name);
            opponentScore.text(doc.data().score);
            opponentCurrentScore.text(doc.data().currentScore);

            //check for winner
            if (doc.data().won == 1) {
                $(".player--1").addClass("player--winner");
                $(".play-btns").addClass("hide");
            }

            $(".player-dashboard .player--0 .play-btns").removeClass("op-not");

        })
    },
        (error) => {
            console.log(error);
        });

    if (!flag) {
        player();
        opp();

    }

}

export { updateScoreLive, updateCurrentScoreLive, diceRollLive, updateTurn, declareWinner, updateDashboard, restartGame, endGame };