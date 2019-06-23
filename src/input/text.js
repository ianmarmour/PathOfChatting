var robot = require("robotjs");

class Text {
    submitMessage(message) {
        robot.keyTap('enter');
        robot.typeStringDelayed(message, 50)
        robot.keyTap('enter')
    }
}

module.exports = Text