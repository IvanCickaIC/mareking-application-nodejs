const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
 

async function initialize(passport, User) {
  console.log('Initializing Passport');
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return done(null, false, { message: 'No user with that email' });
      }

      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
} 

module.exports = initialize;
