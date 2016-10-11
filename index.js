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
        session.send("Три варианта для тебя:");
        builder.Prompts.choice(session, "command?", ["img", "gif", "webm"]);
    },
    function (session, results) {
        switch (results.repsonse.entity) {
            case "img":
                session.replaceDialog("/img");
                break;
            default:
                session.replaceDialog("/");
                break;
        }
    }
]);
bot.dialog('/img', [
    function (session) {
        session.send("There's a small house here surrounded by a white fence with a gate. There's a path to the south and west.");
    }
]);