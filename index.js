/*-----------------------------------------------------------------------------
A simple "Hello World" bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
//
bot.dialog('/', [
	function (session) {
		builder.Prompts.choice(session, "Три варианта для тебя:", ["img", "gif", "webm"]);
	},
	function (session, results) {
		switch (results.response.entity) {
			case "img":
				session.replaceDialog("/img");
				break;
			case "gif":
				session.replaceDialog("/gif");
				break;
			case "webm":
				session.replaceDialog("/webm");
				break;
			default:
				session.replaceDialog("/");
				break;
		}
	}
]);

bot.dialog('/img', [
	function (session) {
        var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "https://2ch.hk/b/src/137633492/14762125040290.jpg"
            }]);
        session.endDialog(msg);
	}
]);
bot.dialog('/gif', [
	function (session) {
		session.send("gif");
	}
]);
bot.dialog('/webm', [
	function (session) {
		session.send("webm");
	}
]);
bot.dialog('/help', [
    function (session) {
        session.endDialog("Я - бот, который даёт тебе смешнявки прямо в твоём мессенджере.");
    }
]);