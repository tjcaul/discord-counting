exports.name = "ping";
exports.execute = function (message, args) {
	message.channel.send('Pong.');
}
