module.exports = {
  prefix: process.env.PREFIX, 
  token: process.env.TOKEN, 

  mongo: {
    connectionString: process.env.mongoConnectionString, 
    options: {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  }
};
