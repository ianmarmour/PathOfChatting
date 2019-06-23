var robot = require("robotjs");

class Text {
  submitMessage(message) {
    robot.keyTap("enter");
    robot.typeStringDelayed(message, 200);
    robot.keyTap("enter");
  }
}

module.exports = Text;
