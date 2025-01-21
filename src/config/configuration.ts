export default () => ({
  PORT: process.env.PORT,
  IS_LOCAL: process.env.IS_LOCAL,
  DATABASE_URL: process.env.DATABASE_URL,
});
