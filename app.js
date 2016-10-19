/*-----------------------------------------------------------------------------
A simple "Hello World" bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var fetch = require('node-fetch');
var request = require("request");
var url = 'https://2ch.hk/b/index.json';

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer({
	name: 'img2chbot'
});
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Settings for chat bot
var settings = { 
	dialogErrorMessage: 'Ой, у нас проблемы.'
};
// Make him alive!
var bot = new builder.UniversalBot(connector, settings);

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Global Actions
//=========================================================

bot.beginDialogAction('img', '/img', { matches: /^img|\/img|картинка/i });
bot.beginDialogAction('gif', '/gif', { matches: /^gif|\/gif|гифка/i });
bot.beginDialogAction('webm', '/webm', { matches: /^webm|\/webm|вебм/i });
bot.beginDialogAction('post', '/post', { matches: /^post|\/post|случайно|тест|пост|анон|test/i });
bot.beginDialogAction('help', '/help', { matches: /^help|\/help|помощь/i });


//=========================================================
// Bots Helpers
//=========================================================

function requestFile(url, type) {
	return fetch(url)
	.then(function(res) {
		return res.json();
	})
	.then(function(json) {
		
		var selectThread = Math.floor(Math.random() * (20 - 1) + 1);
		var selectPost = Math.floor(Math.random() * (3 - 1) + 1);
		
		return json.threads[selectThread].posts[selectPost];
	})
	.then(function(post) {
		if (type == 'post') {
			return post;
		}
		if (type == 'img') {
			console.log(post.files[0].path);
			return post.files[0].path;
		}
	});
}

//=========================================================
// Activity Events
//=========================================================

bot.on('conversationUpdate', function (message) {
   // Check for group conversations
	if (message.address.conversation.isGroup) {
		// Send a hello message when bot is added
		if (message.membersAdded) {
			message.membersAdded.forEach(function (identity) {
				if (identity.id === message.address.bot.id) {
					var reply = new builder.Message()
						.address(message.address)
						.text("Привет, рачки. Теперь я тут отвечаю за смешнявки с двача. Подробнее по команде 'help'");
					bot.send(reply);
				}
			});
		}

		// Send a goodbye message when bot is removed
		if (message.membersRemoved) {
			message.membersRemoved.forEach(function (identity) {
				if (identity.id === message.address.bot.id) {
					var reply = new builder.Message()
						.address(message.address)
						.text("Пока, быдло.");
					bot.send(reply);
				}
			});
		}
	}
});

bot.on('contactRelationUpdate', function (message) {
	if (message.action === 'add') {
		var name = message.user ? message.user.name : null;
		var reply = new builder.Message()
			.address(message.address)
			.text("Hello %s... Thanks for adding me. Say 'help' to see some great demos.", name || 'there');
		bot.send(reply);
	} else {
		// delete their data
	}
});

bot.on('deleteUserData', function (message) {
	// User asked to delete their data
});

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
	function (session) {
		session.endDialog("Выбери три стула. /img /gif /webm. Ну и есть ещё /post");
	}
]);

bot.dialog('/img', [
	function (session) {
		requestFile(url, 'img')
		.then(function(result) {
			var msg = new builder.Message(session)
				.attachments([{
					contentType: "image/jpeg",
					contentUrl: "https://2ch.hk/b/" + result
				}]);
			session.endDialog(msg);
		})
		.catch(function(err) {
			session.endDialog(err);
		});
	}
]);
bot.dialog('/gif', [
	function (session) {
		var msg = new builder.Message(session)
			.attachments([{
				contentType: "image/gif",
				contentUrl: "https://crychan.ru/file/safe_image.gif"
			}]);
		session.endDialog(msg);
	}
]);
bot.dialog('/webm', [
	function (session) {
		var msg = new builder.Message(session)
			.attachments([{
				contentType: "video/webm",
				contentUrl: "https://crychan.ru/file/14726617611862.webm"
			}]);
		session.endDialog(msg);
	}
]);
bot.dialog('/post', [
	function (session) {
		requestFile(url, 'post')
		.then(function(result) {
			var msg = new builder.Message(session)
				.textFormat(builder.TextFormat.xml)
				.attachments([
					new builder.HeroCard(session)
						.subtitle(result.name + " " + result.date + " #" + result.num)
						.text((result.comment).replace(/<\/?[^>]+>/g,''))
				]);
			session.endDialog(msg);
		})
		.catch(function(err) {
			session.endDialog(err);
		});
	}
]);

bot.dialog('/help', [
	function (session) {
		session.endDialog("Я - раковый бот, который даёт тебе смешнявки прямо в твоём мессенджере.");
		session.beginDialog('/');
	}
]);