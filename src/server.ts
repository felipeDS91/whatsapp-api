import app from './app';

app.listen(process.env.PORT || process.env.APP_PORT, () => {
  console.log(
    `⚡️ Server started on port ${process.env.PORT || process.env.APP_PORT}!`,
  );
});
