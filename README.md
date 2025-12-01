## Simple State-based character for programming-game.com

Building upon the starter available here www.npmjs.com/package/programming-game
This is a sample of controlling a character using some states, as well as changing the behaviour of those states based on some larger goal.

In this sample the character will farm for money by attacking everything, until the character can buy a basic shield. They will then wander ever deeper into the wilderness

There are 4 main states:

- Home
- Aventure
- Return to home
- Flee
  Flee is an example of extending from a state, it behaves the same as return to home, but will transition back to adventure when safe to do so

have fun!
