Tail = require('tail').Tail;

class LogParser { 
    constructor(pubsub, chat_channel) {
        this.options = {separator: /[\r]{0,1}\n/, fromBeginning: false, fsWatchOptions: {}, follow: true, logger: console, flushAtEOF: true, useWatchFile: true}
        this.pubsub = pubsub
        this.chat_channel = chat_channel
    }

    startParser() {
        this.tail = new Tail("C:\\Program Files (x86)\\Steam\\steamapps\\common\\Path of Exile\\logs\\Client.txt", this.options);
        this.tail.on("line", function(data) {
            pubsub.publish(this.chat_channel, { messageSent: { text: data }});
            console.log(data);
        });
    }
}

module.exports = LogParser