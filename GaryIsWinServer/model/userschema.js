var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/test',{
  useNewUrlParser: true
}).then(() =>{
  console.log('connected to database');
}).catch(() =>{
  console.log('failed connected to database');
});

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  stats: {
    lastLogin: {
      type: Date
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    }, 
    rank: {
      type: Number,
      default: 0
    }
  },
  friends: {
    type: [String],
    default: []
  },
  blockedUsers: {
    type: [String],
    default: []
  },
  sessionId: {
    type: String
  },
  avatar: {
    type: Number,
    default: 0 // figure out some kind of encoding, maybe 0 = blob, etc.
  }
});

UserSchema.methods.alertFriendsOnline = function(socket) {
  this.friends.forEach(async (friendId) => {
    try {
      let friend = await User.findOne({userId: friendId});
      if(friend.sessionId) {
        let friends = friend.friends.map(async id => {
          let user = await User.findOne({userId: id})
          return user.clean();
        });
        friends = await Promise.all(friends);
        socket.to(friend.sessionId).emit("get_friends", true, friends);
        console.log("alerting");
      }
    } catch (e) {
    }
  });
}

UserSchema.methods.clean = function() {
  let {username, userId, stats, sessionId, blockedUsers, avatar} = (this);
  return {
    username,
    userId,
    stats,
    blockedUsers,
    avatar,
    online: sessionId != null
  };
}

UserSchema.methods.logStats = function(stats, otherRank) {
  let compensation = Math.trunc(Math.max(Math.min((otherRank - this.stats.rank)/20, 45), -45));
  this.stats.rank += compensation;
  if(stats.winner) {
    this.stats.wins += 1;
    this.stats.rank += 50;
  } else {
    this.stats.losses += 1;
    this.stats.rank -= 50;
   }
  this.save();
}

UserSchema.statics.getTopPlayers = async function(n) {
  let users = await User.find({});
  users.filter((user) => user.rank != undefined);
  users.sort((a, b) => b.stats.rank - a.stats.rank);
  users = users.slice(0, n);
  users = users.map(user => user.clean());
  return users;
}

UserSchema.statics.hashPassword = async function(password) {
  let hash = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
  return hash;
}

UserSchema.statics.authenticate = async function(username, email, password) {
  try {
    let user;
    if(username) {
      user = await this.findOne({username: username});
    } else {
      user = await this.findOne({email: email});
    }
    let result = await bcrypt.compare(password, user.password);
    return result ? user : false;
  } catch(e) {
    console.log(e);
    throw "username/email doesn't coorespond to a user";
  }
}

UserSchema.statics.login = async function(username, socketId) {
  try {
    let user = await this.findOne({username: username});
    user.sessionId = socketId;
    user.stats.lastLogin = Date.now();
    user.save();
  } catch(e) {
    console.log(e);
  }
}

UserSchema.statics.logout = async function(socket) {
  try {
    let user = await this.findOne({sessionId: socket.id});
    user.alertFriendsOnline(socket);
    user.sessionId = null;
    user.save();
    return user;
  } catch(e) {
    console.log(e);
  }
}

UserSchema.statics.getSession = async function(socketId) {
  try {
    let user = await this.findOne({sessionId: socketId});
    return user;
  } catch(e) {
    throw "Invalid session";
  }
}

UserSchema.statics.findUsers = async function(query, querier, maxUsers) {
  try {
    let users = await this.find({username: {$regex: "" + (query), $options: 'i'}}).limit(maxUsers);
    users = users.map(async user => {return user.clean()});
    users = await Promise.all(users);
    if(querier) {
      users = users.filter(user => user.userId != querier.userId 
        && (!(user.blockedUsers) || !user.blockedUsers.includes(querier.userId))
        && (!(querier.blockedUsers) || !querier.blockedUsers.includes(user.userId)));
    }
    console.log(users);
    return users;
  } catch(e) {
    throw "Invalid user";
  }
}

UserSchema.statics.addFriend = async function(friend1, friend2) {
  let f1 = await this.findOne({userId: friend1});
  let f2 = await this.findOne({userId: friend2});
  if(!f2) {
    throw "Invalid userId."
  }
  let blocked = await f2.checkBlock(friend1);
  if(blocked) {
    throw "User blocked you!";
  }
  if(f1.friends.includes(friend2)) {
    throw "Friend already added!";
  }
  f1.friends.push(friend2);
  f2.friends.push(friend1);
  f1.save();
  f2.save();
  console.log(f1.friends);
  console.log(f2.friends);
  return friend2;
}

UserSchema.methods.checkBlock = async function(userId) {
  return this.blockedUsers.includes(userId);
}

UserSchema.statics.blockUser = async function(userId, blockee) {
  let user = await this.findOne({userId});
  try {
    await User.removeFriend(userId, blockee);
  } catch (e) {
  }
  if(user.blockedUsers.includes(blockee)) {
    throw "User already blocked!";
  }
  user.blockedUsers.push(blockee);
  user.save();
}

UserSchema.statics.removeFriend = async function(friend1, friend2) {
  let f1 = await this.findOne({userId: friend1});
  let f2 = await this.findOne({userId: friend2});
  if(!f1.friends.includes(friend2)) {
    throw "User is not your friend!";
  }
  let i1 = f1.friends.indexOf(friend2);
  if(i1 > -1) {
    f1.friends.splice(i1, 1);
  }
  let i2 = f2.friends.indexOf(friend1);
  if(i2 > -1) {
    f2.friends.splice(i2, 1);
  }
  f1.save();
  f2.save();
  return friend2;
}

UserSchema.statics.unblock = async function(blocker, blockee) {
  let user = await this.findOne({userId: blocker});
  if(!user.blockedUsers.includes(blockee)) {
    throw "User is not blocked!";
  }
  let i = user.blockedUsers.indexOf(blockee);
  if(i > -1) {
    user.blockedUsers.splice(i, 1);
  }
  user.save();
  return blockee;
}

var User = mongoose.model('User', UserSchema);
module.exports = User;
