const express     = require('express');
const session     = require('express-session');
const app         = express();
const port        =  process.env.PORT || 3000
const mongoose = require('mongoose');
const User = require('../model/userschema');
const Matchmaker = require('./matchmaking');

var http = require('http').createServer(app);
var io = require('socket.io')(http)

const num_avatars = 10

app.use(express.json());

app.get('/', (req, res) => {
  res.send("howdy");
});

createUserId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

checkLogin = async socketId => {
  let user = await User.getSession(socketId);
  if (user) {
    return user;
  } else {
    throw "You are not logged in! Try logging back in, as the server may have restarted.";
  }
}


const routeNames = {
  signup: "signup",
  login: "login",
  whoami: "whoami",
  find_users: "find_users",
  add_friend: "add_friend",
  block_user: "block_user",
  unblock_user: "unblock_user",
  get_blocked_users: "get_blocked_users",
  remove_friend: "remove_friend",
  get_friends: "get_friends",
  challenge_user: "challenge_user",
  challenge_received: "challenge_received",
  challenge_accept: "challenge_accept",
  rtc_answer: "rtc_answer",
  rtc_candidate: "rtc_candidate",
  game_finished: "game_finished",
  top_players: "top_players",
  sign_out: "sign_out",
  auth_status: "auth_status",
  delete_account: "delete_account",
  change_password: "change_password",
  match_random: "match_random",
  match_dequeue: "match_dequeue",
  match_initiate: "match_initiate",
  set_avatar: "set_avatar",
  get_avatar: "get_avatar"
};

matchmaker = new Matchmaker(io);

// Log everyone out on server restart
console.log(User.find({}).then(users => {
  users.forEach(user => {
    user.sessionId = null;
    user.save();
  });
}));
io.sockets.on("connection", (socket) => {
  console.log("connected to:" + socket.id);

  socket.on(routeNames.signup, async userData => {
    try {
      userData.userId = createUserId();
      userData.password = await User.hashPassword(userData.password);
      userData.friends = []
      userData.blockedUsers = []
      userData.sessionId = socket.id;
      userData.avatar = Math.trunc(Math.random() * num_avatars);
	    console.log(userData.avatar);

      await User.create(userData);
      socket.emit(routeNames.signup, true, userData.userId);
    } catch(e) {
      socket.emit(routeNames.signup, false, e);
    }
  });

  socket.on(routeNames.change_password, async newPassword => {
    try {
      let user = await checkLogin(socket.id);
      user.password = await User.hashPassword(newPassword);
      user.save();

      socket.emit(routeNames.change_password, true, "Password successfully reset!");
    } catch(e) {
      socket.emit(routeNames.change_password, false, "Password could not be reset!");
    }
  });

  socket.on(routeNames.login, async userData => {
    try {
      let result = await User.authenticate(userData.username, userData.email, userData.password);

      if(result) {
        await User.login(userData.username, socket.id);
        result.alertFriendsOnline(socket);
        socket.emit(routeNames.login, true, "Log in success!");
      } else {
        socket.emit(routeNames.login, false, "The password you've entered is incorrect.");
      }
    } catch(e) {
      socket.emit(routeNames.login, false, "User not found!");
    }
  });

  socket.on(routeNames.find_users, async (query, maxUsers) => {
    try {
      await checkLogin(socket.id);
      if(maxUsers == undefined) {
        maxUsers = 25;
      }
      let user = await User.getSession(socket.id);
      let users = await User.findUsers(query, user, maxUsers);
      socket.emit(routeNames.find_users, true, users);
    } catch(e) {
      socket.emit(routeNames.find_users, false, "" + e);
    }
  });

  socket.on(routeNames.whoami, async () => {
    try {
	    await checkLogin(socket.id);
	    let user = await User.getSession(socket.id);
	    socket.emit(routeNames.whoami, true, user.clean());
    } catch(e) {
	    socket.emit(routeNames.whoami, false, "" + e);
    }
  });

  socket.on(routeNames.match_initiate, async (challengerId, rtc_offer) => {
    try {
	let challenger = await User.findOne({userId: challengerId});
			let challengee = await User.getSession(socket.id);
			socket.to(challenger.sessionId).emit(routeNames.match_connect, challengee.userId, rtc_offer);
		} catch(e) {
			socket.to(challenger.sessionId).emit(routeNames.match_initiate, false);
		}
	});

  socket.on(routeNames.add_friend, async (friendId) => {
    try {
      let {userId} = await checkLogin(socket.id);
      let friend = await User.addFriend(userId, friendId);
      if(friend) {
        socket.emit(routeNames.add_friend, true, friend + " added successfully!");
      } else {
        throw "Error removing friend.";
      }
    } catch(e) {
      socket.emit(routeNames.add_friend, false, "" + e);
    }
  });

  socket.on(routeNames.block_user, async (blockeeId) => {
    try {
      let {userId} = await checkLogin(socket.id);
      await User.blockUser(userId, blockeeId);
      socket.emit(routeNames.block_user, true, blockeeId + " blocked successfully!");
    } catch(e) {
      socket.emit(routeNames.block_user, false, "" + e);
    }
  });

  socket.on(routeNames.remove_friend, async (friendId) => {
    try {
      let {userId} = await checkLogin(socket.id);
      let friend = await User.removeFriend(userId, friendId);
      if(friend) {
        socket.emit(routeNames.remove_friend, true, friend + " removed successfully!");
      } else {
        throw "Error removing friend.";
      }
    } catch(e) {
      socket.emit(routeNames.remove_friend, false, "" + e);
    }
  });

  socket.on(routeNames.unblock_user, async (friendId) => {
    try {
      let {userId} = await checkLogin(socket.id);
      let friend = await User.unblock(userId, friendId);
      if(friend) {
        socket.emit(routeNames.unblock_user, true, friend + " unblocked successfully!");
      } else {
        throw "Error removing friend.";
      }
    } catch(e) {
      socket.emit(routeNames.unblock_user, false, "" + e);
    }
  });

  socket.on(routeNames.get_friends, async () => {
    try {
      let user = await checkLogin(socket.id);
      let friends = user.friends.map(async id => {
        let user = await User.findOne({userId: id})
        return user.clean();
      });
      friends = await Promise.all(friends);
      socket.emit(routeNames.get_friends, true, friends);
    } catch (e) {
      socket.emit(routeNames.get_friends, false, "Error getting friends." + e);
    }
  });

  socket.on(routeNames.get_blocked_users, async () => {
    try {
      let user = await checkLogin(socket.id);
      let blockedUsers = user.blockedUsers.map(async id => {
        let user = await User.findOne({userId: id})
        return user.clean();
      });
      blockedUsers = await Promise.all(blockedUsers);
      socket.emit(routeNames.get_blocked_users, true, blockedUsers);
    } catch (e) {
      socket.emit(routeNames.get_blocked_users, false, "Error getting blocked users.");
    }
  });

  socket.on(routeNames.challenge_user, async (userId) => {
    try {
      let user = await checkLogin(socket.id);
      let friend = await User.findOne({userId: userId});
      if(!friend) {
        throw "Invalid userId";
      }
      if (friend.sessionId == user.sessionId) {
        throw "Why are you challenging yourself?";
      }
      if (!friend.sessionId) {
        throw "User is offline";
      }
      socket.to(friend.sessionId).emit(routeNames.challenge_received, user.clean());
    } catch (e) {
	    console.log(e);
      socket.emit(routeNames.challenge_user, false, e);
    }
  });

  socket.on(routeNames.challenge_accept, async (accept, userId, rtc_offer) => {
    try {
      let challenger = await User.findOne({userId: userId});
      let challengee = await User.getSession(socket.id);
      if(!accept) {
        socket.to(challenger.sessionId).emit(routeNames.challenge_user, false, 
          challengee.username + " has rejected your challenge");
        return;
      }
      socket.to(challenger.sessionId).emit(routeNames.challenge_user, true, challengee.clean(), rtc_offer);
    } catch (e) {
      socket.to(challenger.sessionId).emit(routeNames.challenge_user, false, "" + e);
      socket.emit(routeNames.challenge_accept, false, "" + e);
    }
  });

  socket.on(routeNames.rtc_answer, async (userId, rtc_answer) => {
    let user = await User.findOne({userId});
    let sender = await User.getSession(socket.id);
    console.log(socket.id, "sent answer to", userId);
    socket.to(user.sessionId).emit(routeNames.rtc_answer, sender.userId, rtc_answer);
  });

  socket.on(routeNames.rtc_candidate, async (userId, message) => {
    let user = await User.findOne({userId});
    let sender = await User.getSession(socket.id);
    console.log(socket.id, "sent candidate", message, "to", userId);
    socket.to(user.sessionId).emit(routeNames.rtc_candidate, sender.userId, message);
  });

  socket.on(routeNames.match_random, async () => {
    try {
      let user = await User.getSession(socket.id);
      matchmaker.enqueue(user);
      socket.emit(routeNames.match_random, true, "Successfully entered queue.");
    } catch (e) {
      socket.emit(routeNames.match_random, false, "" + e);
    }
  });

  socket.on(routeNames.match_dequeue, async () => {
    try {
      let user = await User.getSession(socket.id);
      matchmaker.dequeue(user);
      socket.emit(routeNames.match_dequeue, true, "Successfully entered queue.");
    } catch (e) {
      socket.emit(routeNames.match_dequeue, false, "" + e);
    }
  });

  socket.on(routeNames.game_finished, async (opponentId, myStats, opponentStats) => {
    try {
      let user = await User.getSession(socket.id);
      let opponent = await User.findOne({userId: opponentId});
      let userRank = user.stats.rank;
      user.logStats(myStats, opponent.stats.rank);
      opponent.logStats(opponentStats, userRank);
      socket.emit(routeNames.game_finished, true, "Game submitted!");
    } catch (e) {
      socket.emit(routeNames.game_finished, false, "" + e);
    }
  });

  socket.on(routeNames.top_players, async () => {
    try {
      socket.emit(routeNames.top_players, true, await User.getTopPlayers(10));
    } catch(e) {
      socket.emit(routeNames.top_players, false, "Error getting top players");
    }
  });

  socket.on(routeNames.sign_out, async () => {
    try {
    let user = await User.logout(socket);
    socket.emit(routeNames.sign_out, user != null);
    } catch (e) {
      socket.emit(routeNames.sign_out, false, "Error signing out");
    }
  });

  socket.on(routeNames.auth_status, async () => {
    try {
      let user = await User.getSession(socket.id);
      if(!user) {
        throw ""
      }
      socket.emit(routeNames.auth_status, true, "You are logged in");
    } catch (e) {
      socket.emit(routeNames.auth_status, false, "You are not logged in");
    }
  });

  socket.on(routeNames.delete_account, async () => {
    try {
      let deletedUser = await User.getSession(socket.id);
      await User.deleteOne({username: user.username, password: user.password, email: user.email});
      let users = await User.find();
      users.forEach(user => {
        let friendIdx = user.friends.indexOf(deletedUser.userId);
        if(friendIdx >= 0) {
          user.friends.splice(friendIdx, 1)
        }
        let blockedIdx = user.blockedUsers.indexOf(deletedUser.userId);
        if(blockedIdx >= 0) {
          user.blockedUsers.splice(blockedIdx, 1)
        }
        user.save();
      });
      socket.emit(routeNames.delete_account, true, "Successfully deleted account");
    } catch (e) {
      socket.emit(routeNames.delete_account, false, "Error deleting account");
    }
  });

  socket.on(routeNames.get_avatar, async () => {
    try {
      let user = await User.getSession(socket.id);
      socket.emit(routeNames.get_avatar, true, user.avatar);
    } catch(e) {
      socket.emit(routeNames.get_avatar, false, "" + e);
    }
  });

  socket.on(routeNames.set_avatar, async (avatar_num) => {
    try {
      let user = await User.getSession(socket.id);
      user.avatar = avatar_num;
      user.save();
      socket.emit(routeNames.get_avatar, true, "Avatar successfully set to: " + user.avatar);
    } catch(e) {
      socket.emit(routeNames.get_avatar, false, "" + e);
    }
  });

  socket.on("disconnect", async () => {
    await User.logout(socket);
    console.log("disconnected" + socket.id);
  });
});

http.listen(port,() =>{
  console.log('server is up on ' + port);
})
