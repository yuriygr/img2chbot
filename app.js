//=========================================================
// Смешные картинки с Двача
//=========================================================

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
	dialogErrorMessage: 'Ой, у нас проблемы.',
    localizerSettings: { 
        defaultLocale: "ru" 
    }
};
// Make him alive!
var bot = new builder.UniversalBot(connector, settings);
// Listen server
server.post('/api/messages', connector.listen());


//=========================================================
// Bots Helpers
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
	.onDefault(builder.DialogAction.send("Выбери два стула. /img /webm"))
);

// Main actions
bot.dialog('/img', [
	function (session) {
		requestFile(url, 'img')
		.then(function(result) {
			if (!result) throw new Error('Ошибка получения картинки');

			session.send({
				//text: 'Тред: ',
			    attachments: [{
		            contentType: "image/jpeg",
		            contentUrl: host + result
		        }]
			});
		})
		/*.then(function(result) {
			// Спросим, может ещё хочет?
			builder.Prompts.choice(session, 'Ещё поискать?', ['Да', 'Нет']);
		})*/
		.catch(function(err) {
			session.endDialog("Ошибка: " + err);
		});
	},
	function (session, results) {
		switch (results.response.index) {
			case 0:
				session.beginDialog('/img');
				break;
			
			default:
				session.beginDialog('/no');
		}
	}
])
.triggerAction({ matches: /^img|\/img|картинка|смешнявка/i });

// WebM
bot.dialog('/webm', [
	function (session) {
		requestFile(url, 'webm')
		.then(function(result) {
			if (!result)
				throw new Error('Ошибка получения вебм');

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
])
.triggerAction({ matches: /^webm|\/webm|вебм/i });

// Help
bot.dialog('/help', [
	function (session) {
		session.endDialog("Я - раковый бот, который даёт тебе смешнявки из /b/ прямо в твоём мессенджере.");
	}
])
.triggerAction({ matches: /^help|\/help|помощь/i });

// Contacts
bot.dialog('/contact', [
	function (session) {
		session.endDialog("Пиши @yuriygr");
	}
])
.triggerAction({ matches: /^contact|\/contact|контакты|автор/i });

// No
bot.dialog('/no', [
	function (session) {
		session.endDialog("Ну ладно.");
	}
]);
