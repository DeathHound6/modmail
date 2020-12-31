module.exports = {
  prefix: "m!", // change this value for setup
  token: process.env.TOKEN, // change this value for setup - if you use environment variables, change the value there rather than here

  mongo: {
    connectionString: process.env.mongoConnectionString, // change this value for setup - if you use environment variables, change the value there rather than here
    options: {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  }
};
