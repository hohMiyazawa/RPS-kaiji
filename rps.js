function create(type,classes,text,appendLocation,cssText){
	let element = document.createElement(type);
	if(Array.isArray(classes)){
		element.classList.add(...classes);
		if(classes.includes("newTab")){
			element.setAttribute("target","_blank")
		}
	}
	else if(classes){
		if(classes[0] === "#"){
			element.id = classes.substring(1)
		}
		else{
			element.classList.add(classes);
			if(classes === "newTab"){
				element.setAttribute("target","_blank")
			}
		}
	};
	if(text || text === 0){
		element.innerText = text;
	};
	if(appendLocation && appendLocation.appendChild){
		appendLocation.appendChild(element)
	};
	if(cssText){
		element.style.cssText = cssText
	};
	return element
}

function removeChildren(node){
	if(node){
		while(node.childElementCount){
			node.lastChild.remove()
		}
	}
}

function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}


let turns = 0;
let current_turns = 0;
let player_wins = 0;
let bot_wins = 0;
let level_0 = new Array(3).fill(0);
let level_1 = new Array(9).fill(0);
let level_2 = new Array(27).fill(0);
let level_3 = new Array(81).fill(0);
let prev1_player = null;
let prev2_player = null;
let prev1_bot = null;

let global_wins = 0;
let global_losses = 0;

const UI = document.getElementById("rps");

let controls = create("div","constrols",false,UI);
let instructions = create("div","instructions",false,UI);
let game = create("div","game",false,UI);

let restart_button = create("button",false,"Restart",controls);

function rps_evaluate(r,p,s){
	let r_score = s - p;
	let p_score = r - s;
	let s_score = p - r;
	return shuffle([
		{type: 0,val: r_score},
		{type: 1,val: p_score},
		{type: 2,val: s_score},
	]).sort(
		(b,a) => a.val - b.val
	)[0].type
}

function bot_pick(){
	let strategy_index = Math.floor(Math.random()*5);
	if(strategy_index === 0){
		return Math.floor(Math.random()*3);
	}
	else if(strategy_index === 1){
		if(turns < 3){
			return bot_pick()
		}
		return rps_evaluate(level_0[0],level_0[1],level_0[2])
	}
	else if(strategy_index === 2){
		if(turns < 9){
			return bot_pick()
		}
		return rps_evaluate(level_1[prev1_player*3 + 0],level_1[prev1_player*3 + 1],level_1[prev1_player*3 + 2])
	}
	else if(strategy_index === 3){
		if(turns < 27){
			return bot_pick()
		}
		return rps_evaluate(level_2[prev1_bot*9 + prev1_player*3 + 0],level_2[prev1_bot*9 + prev1_player*3 + 1],level_2[prev1_bot*9 + prev1_player*3 + 2])
	}
	else if(strategy_index === 4){
		if(turns < 81){
			return bot_pick()
		}
		return rps_evaluate(level_3[prev2_player*27 + prev1_bot*9 + prev1_player*3 + 0],level_3[prev2_player*27 + prev1_bot*9 + prev1_player*3 + 1],level_3[prev2_player*27 + prev1_bot*9 + prev1_player*3 + 2])
	}
	return bot_pick();//debug
}

function fight(a,b){
	if(a === b){
		return 0//tie
	}
	if(a === 0){//rock
		if(b === 1){//paper
			return -1
		}
		return 1
	}
	else if(a === 1){//paper
		if(b === 2){//scissors
			return -1
		}
		return 1
	}
	else{//scissors
		if(b === 0){//rock
			return -1
		}
		return 1
	}
}

function player_pick(pick,bot_choise){
	level_0[pick]++;
	if(turns){
		level_1[prev1_player*3 + pick]++;
	}
	if(turns){
		level_2[prev1_bot*9 + prev1_player*3 + pick]++;
	}
	if(turns > 1){
		level_3[prev2_player*27 + prev1_bot*9 + prev1_player*3 + pick]++;
	}
	turns++;
	current_turns++;
	prev2_player = prev1_player;
	prev1_player = pick;
	prev1_bot = bot_choise;

	return fight(pick,bot_choise);
}

function game_over(result){
	game.style.display = "block";
	controls.style.display = "block";
	instructions.style.display = "none";
	removeChildren(game);
	if(result === 1){
		global_wins++;
		if(global_wins === 1 && global_losses === 0){
			create("p","gameOver","Congrats, first try even? Well, now the bot has learned some of your play",game)
		}
		else if(global_wins === 1 ){
			create("p","gameOver","Congrats, you made it on attempt " + (global_losses + 1),game)
		}
	}
	else{
		global_losses++;
		create("p","gameOver","You lost",game);
	}
}

function start_game(){
	game.style.display = "block";
	controls.style.display = "block";
	instructions.style.display = "none";
	removeChildren(game);

	let arena = create("div","arena",false,game);
	let results = create("div","results",false,arena);
	create("span",false,"Player wins: ",results);
	let p_wins = create("span",false,player_wins,results);
	create("span",false," Bot wins: ",results);
	let b_wins = create("span",false,bot_wins,results);

	let rock = create("div",["rock","card","selectable"],false,game);
	rock.title = "Rock";
	let rockImage = create("img",false,false,rock);
	rockImage.alt = "Rock";
	rockImage.src = "rock.webp";

	let paper = create("div",["paper","card","selectable"],false,game);
	paper.title = "Paper";
	let paperImage = create("img",false,false,paper);
	paperImage.alt = "Paper";
	paperImage.src = "paper.webp";

	let scissors = create("div",["scissors","card","selectable"],false,game);
	scissors.title = "Scissors";
	let scissorsImage = create("img",false,false,scissors);
	scissorsImage.alt = "Scissors";
	scissorsImage.src = "scissors.webp";

	let player_card = create("div",["card"],false,arena);
	player_card.title = "";
	let player_cardImage = create("img",false,false,player_card);
	player_cardImage.alt = "";
	player_cardImage.src = "";

	let bot_card = create("div",["card"],false,arena);
	bot_card.title = "";
	let bot_cardImage = create("img",false,false,bot_card);
	bot_cardImage.alt = "";
	bot_cardImage.src = "";

	let overlay = create("div","overlay","",arena);

	let handle = function(pick){
		let bot_choise = bot_pick();
		if(bot_choise === 0){
			bot_card.title = "Rock";
			bot_cardImage.alt = "Rock";
			bot_cardImage.src = "rock.webp";
		}
		else if(bot_choise === 1){
			bot_card.title = "Paper";
			bot_cardImage.alt = "Paper";
			bot_cardImage.src = "paper.webp";
		}
		else{
			bot_card.title = "Scissors";
			bot_cardImage.alt = "Scissors";
			bot_cardImage.src = "scissors.webp";
		}
		let res = player_pick(pick,bot_choise);
		if(res === 0){
			overlay.style.color = "yellow";
			overlay.innerText = "Tie!"
		}
		else if(res === 1){
			overlay.style.color = "green";
			overlay.innerText = "Win!";
			player_wins++;
			p_wins.innerText = player_wins;
			if(player_wins - 7 >= bot_wins){
				game_over(1);
			}
		}
		else{
			overlay.style.color = "red";
			overlay.innerText = "Loss!"
			bot_wins++;
			b_wins.innerText = bot_wins;
			if(bot_wins - 7 >= player_wins){
				game_over(0);
			}
		}
	};

	rock.onclick = function(){
		player_card.title = "Rock";
		player_cardImage.alt = "Rock";
		player_cardImage.src = "rock.webp";
		handle(0);
	};
	paper.onclick = function(){
		player_card.title = "Paper";
		player_cardImage.alt = "Paper";
		player_cardImage.src = "paper.webp";
		handle(1)
	};
	scissors.onclick = function(){
		player_card.title = "Scissors";
		player_cardImage.alt = "Scissors";
		player_cardImage.src = "scissors.webp";
		handle(2)
	};
}

function restart(){
	game.style.display = "none";
	controls.style.display = "none";
	current_turns = 0;
	player_wins = 0;
	bot_wins = 0;
	removeChildren(instructions);
	instructions.style.display = "block";
	let button = create("button",false,"Start",instructions);
	button.onclick = start_game;

	create("h2","heading","Rules",instructions);
	create("p","rule","You're playing Rock, Paper, Scissors agains a bot",instructions);
	create("p","rule","There will be multiple rounds. The game goes on until anyone has a lead of 7 wins",instructions);
	create("p","rule","The bot doesn't make completely random decisions, it's trying to be clever",instructions);
	create("p","rule","You can consistently beat the bot by beeing more clever",instructions);
	create("hr",false,false,instructions);
	create("p","rule","Q: \"What happens if I use a random number generator instead of playing by myself?\"",instructions);
	create("p","rule","A: You will have a 50% of winning. But it's possible to do better.",instructions);
}

restart();

restart_button.onclick = restart;
