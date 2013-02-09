var irc = require('irc'),
    _ = require('underscore');

var TuckBot = function(server, nick, opt) {
    var self = this;

    _.extend(self, {
        api : {}, // override this in your bot!
        client : new irc.Client(server, nick, opt),
        channels : opt.channels,

        setAttn : function(nick) {
            self.attn = new RegExp(nick+"(.*)+","gi");
        },

        handleMessage : function(from, msg, info) {
            var command = msg.trim().match(self.attn);
            if (command != null) {
                self.handleCommands(from, msg.substr(self.nick.length+1,msg.length), info);
            }
        },
        
        handleCommands : function(from, msg, info) {
            var commands = msg.trim().split(/[\s]+/),
                command = commands[0];
            commands.shift();
            if (!self.api.hasOwnProperty(command)) return;
            self.api[command](from, commands, info);
        },

        broadcast : function(target, msg) {
            if (target) {
                self.client.say(target,msg);
            } else {
                self.channels.forEach(function(chan) {
                    self.client.say(chan,msg);
                });
            }
        },

        reply : function(nick, msg, info) {
            if (self.isChannel(info.args[0])) {
                msg = nick + ': ' + msg;
                self.broadcast(info.args[0], msg);
            } else {
                self.broadcast(nick, msg);
            }
        },

        isChannel : function(target) {
            return !!target.match(/^#([^ ]+)([A-z0-9])+/);
        }
    });

    self.client.addListener('pm', self.handleCommands);
    self.client.addListener('registered', function(message) {
        self.nick = message.args[0];
        self.setAttn(self.nick);
    });
    self.channels.forEach(function(chan) {
        self.client.addListener('message'+chan, self.handleMessage);
    });

    return self;
};

exports.TuckBot = TuckBot;