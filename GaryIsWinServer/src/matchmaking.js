const User = require('../model/userschema');

module.exports = class Matchmaker {
  constructor(socket) {
    setInterval(() => this.findPairs(socket), 10000);
    this.queue = []
  }

  enqueue(user) {
		this.dequeue(user);
    this.queue.push(user);
		this.queue.sort((a, b) => a.rank - b.rank);
  }

  dequeue(user) {
		this.queue = this.queue.reduce((acc, elem) => {
			if(elem.username !=  user.username) {
				acc.push(elem);
			}
			return acc;
		}, []);
  }

  findPairs(socket) {
    while(this.queue.length > 1) {
      let user1 = this.queue.pop();
      let user2 = this.queue.pop();
      socket.to(user1.sessionId).emit("match_initiate", user2.clean());
    }
  }
}

