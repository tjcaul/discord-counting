const { exec } = require('child_process');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const fs = require('fs');
const Mutex = require("async-mutex").Mutex;
const mutex = new Mutex();

let commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (let i = 0; i < commandFiles.length; i++)
	commands.push(require(`./commands/${commandFiles[i]}`));

client.on('message', msg => {
	try {
		if (msg.author.bot)
			return;
		const str = msg.content;
		const args = msg.content.split(/ +/);
		const command = args.shift().toLowerCase();
		for (let i = 0; i < commands.length; i++)
			if (command == commands[i].name) {
				commands[i].execute(msg, args);
				return;
			}

		const num = parse(str);
		//console.log(`'${msg.content}' = ${num}`);
		if (!isNaN(num))
			play(msg, num);

	} catch (error) {
		msg.channel.send('[ERROR] ' + error);
		console.log(error);
	}
});

client.on('messageDelete', msg => {
	const num = parse(msg.content);
	if (isNaN(num))
		return;
	const id = msg.guild.id;
	var db;
	mutex.runExclusive(function() {
		const dbRaw = fs.readFileSync(config.db);
		db = JSON.parse(dbRaw);
	}).then(function() {
		let index = -1;
		for (let i = 0; i < db["servers"].length; i++) {
			if (db["servers"][i].id == id)
				index = i;
		}
		if (index == -1)
			return; //Server not initialized

		let entry = db["servers"][index];
		if (entry.channel != msg.channel.id)
			return; //Wrong channel
		if (entry.user != msg.author.id)
			return; //Old message by different user
		if (num == entry.count) //Most recent count
			msg.channel.send(`${msg.author} deleted \`${num}\`. The next number is \`${num+1}\`.`);
	});
});

function play (msg, num) {
	const id = msg.guild.id;
	mutex.runExclusive(function() {
		const dbRaw = fs.readFileSync(config.db);
		const db = JSON.parse(dbRaw);
		let index = -1;
		for (let i = 0; i < db["servers"].length; i++) {
			if (db["servers"][i].id == id)
				index = i;
		}
		if (index == -1) { //New server; initialize
			const initData = {
				id: id,
				channel: msg.channel.id,
				count: 0,
				record: 0,
				user: 0
			}
			index = db["servers"].push(initData) - 1;
			msg.channel.send("Welcome to the Counting Game!");
		}
		let entry = db["servers"][index];
		if (entry.channel != msg.channel.id)
			return; //Wrong channel
		if (num == entry.count + 1 && entry.user != msg.author.id) {
			entry.count = num;
			entry.user = msg.author.id;

			if (num == 13)
				msg.channel.send("Warning: unlucky number!");
			else if (num == 42)
				msg.channel.send("The answer to Life, the Universe, and Everything");
			else if (num == 64)
				msg.channel.send("A whole stack of numbers.");
			else if (num == 66)
				msg.channel.send("COMMANDER CODY: It will be done, My Lord.");
			else if (num == 69)
				msg.channel.send("*Nice*");
			else if (num == 87)
				msg.channel.send("'*Four score and seven years ago...*'");
			else if (num == 144)
				msg.channel.send("Ew, (a) gross!");
			else if (num == 200)
				msg.channel.send("`200 OK`");
			else if (num == 255)
				msg.channel.send("[!] 8-bit number limit reached!");
			else if (num == 420)
				msg.channel.send("This bot was created at 4:20 on April 20, 2020");
			else if (num == 867)
				msg.channel.send("...5309");
			else if (num == 911)
				msg.channel.send("What is your emergency?");
			else if (num == 1337)
				msg.channel.send("`0/\/|_\`/ 1[-3'][' ]-[@xX0RZ (/-\n (_)|\|[)3r57a(\)[} 7}{|$`");

			if (num % 100 == 0)
				msg.react('💯');

			if (entry.count >= entry.record)
				msg.react('☑️');
			else
				msg.react('✅');
		} else {
			var err;
			if (msg.author.id != entry.user)
				err = "Wrong number.";
			else
				err = "You can't count two numbers in a row.";
			msg.react('❌');
			msg.channel.send(`Wrong! ${msg.author} RUINED IT AT **${entry.count}**!! Next number is **1**. **${err}**`);
			entry.record = Math.max(entry.record, entry.count);
			entry.count = 0;
			entry.user = 0;
		}

		fs.writeFileSync(config.db, JSON.stringify(db));
	});
}

function isNumber (c) {
	const list = "0123456789";
	return list.indexOf(c) > -1;
}

function isVisible (c) {
	const list = "!#$%&()+-/<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]abcdefghijklmnopqrstuvwxyz{}~";
	return list.indexOf(c) > -1;
}

function parse (str) {
	let pos = -1;
	for (let i = 0; i < str.length; i++) {
		if (isVisible(str[i]))
			return NaN;
	}
	for (let i = 0; i < str.length; i++) {
		if (isNumber(str[i])) {
			pos = i;
			break;
		}
	}
	if (pos == -1) //Not a valid number
			return NaN;
	return parseInt(str.slice(pos));
}

client.login(config.token);
console.log("loaded");
