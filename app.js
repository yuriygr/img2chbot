/*-----------------------------------------------------------------------------
<<<<<<< HEAD
Смешные скартинки с двача
=======
A simple bot
>>>>>>> origin/master
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var fetch = require('node-fetch');
var host = 'https://2ch.hk';
var board = '/b/';
var url = host + board + 'index.json';

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
// Listen server
server.post('/api/messages', connector.listen());

//=========================================================
<<<<<<< HEAD
// Bot Global Actions
//=========================================================

bot.beginDialogAction('img', '/img', { matches: /^img|\/img|картинка|смешнявка/i });
bot.beginDialogAction('webm', '/webm', { matches: /^webm|\/webm|вебм/i });
bot.beginDialogAction('help', '/help', { matches: /^help|\/help|помощь/i });
bot.beginDialogAction('contact', '/contact', { matches: /^contact|\/contact|контакты|автор/i });


//=========================================================
// Bot Helpers
=======
// Bots Helpers
>>>>>>> origin/master
//=========================================================

function requestFile(url, type) {
	
	return fetch(url)
	.then(function(res) {
		if (res.status != 200)
			throw new Error('Абу шатает вакабу');

		return res.json();
	})
	.then(function(json) {
		// Массив типов
		var typeArray = [];
		typeArray['img'] = '1';
		typeArray['webm'] = '6';
		
		// Создаём массив файлов
		var filesArray = [];
		json.threads.map(function(thread) {
			thread.posts.map(function(post) {
				post.files.map(function(file) {
					if (file.type == typeArray[type])
						filesArray.push(file.path);
				});
			});
		});
		return filesArray;
	})
	.then(function(filesArray) {
		// Получаем рандомный файл из массива
		var rand = Math.floor(Math.random() * filesArray.length);
		return filesArray[rand];
		
	}).catch(function(err) {
		console.error(err);
		return false;
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
	// hm
});

//=========================================================
// Bot Dialogs
//=========================================================

// Listen matches
bot.dialog('/', new builder.IntentDialog()
	.matches(/^img|\/img|картинка|смешнявка/i,
	'/img')
	.matches(/^webm|\/webm|вебм/i,
	'/webm')
	.matches(/^help|\/help|помощь/i,
	'/help')
	.matches(/^contact|\/contact|контакты|автор/i,
	'/contact')
	.matches(/^debug|\/debug|дебаг|/i,
	'/debug')
	.onDefault(builder.DialogAction.send("Выбери два стула. /img /webm"))
);

// Main actions
bot.dialog('/img', [
	function (session) {
		requestFile(url, 'img')
		.then(function(result) {
			if (!result)
				throw new Error('Ошибка получения картинки');
			
			console.log(result);
				
			var msg = new builder.Message(session)
				.attachments([{
					contentType: "image/jpeg",
					contentUrl: host + result
				}]);
			session.endDialog(msg);
		})
		.catch(function(err) {
			console.error(err);
		});
	}
]);
bot.dialog('/webm', [
	function (session) {
		requestFile(url, 'webm')
		.then(function(result) {
			if (!result)
				throw new Error('Ошибка получения вебм');
				
			console.log(result);
			
			var msg = new builder.Message(session)
				.attachments([{
					contentType: "video/webm",
					contentUrl: host + result
				}]);
			session.endDialog(msg);
		})
		.catch(function(err) {
			console.error(err);
		});
	}
]);

// Staff
bot.dialog('/help', [
	function (session) {
		session.endDialog("Я - раковый бот, который даёт тебе смешнявки прямо в твоём мессенджере.");
	}
]);
bot.dialog('/contact', [
	function (session) {
		session.endDialog("Пиши на почту a1d516ac5f5d290@gmail.com");
	}
]);

// Debug
bot.dialog('/debug', [
	function (session) {
		session.sendTyping();
		builder.Prompts.text(session, "Ты что вот думаешь, что мой гениальнейший разработчик оставит да в продакшене?");
	},
	function (session, results) {
		session.sendTyping();
		if (results.response == 'Да') {
			session.endDialog('Хуй на!');
		}
		if (results.response == 'Нет') {
			session.endDialog('Пидора ответ!');
		}
		session.endDialog('Прошёл нахуй!');
	}
]);
