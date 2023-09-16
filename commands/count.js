exports.name = "count";
exports.execute = function (message, args) {
	var count;
	if (args.length == 0)
		count = 20;
	else
		count = parseInt(args[0]);
	for (let i = 1; i <= Math.min(count, 20); i++)
		message.channel.send(i);
}
