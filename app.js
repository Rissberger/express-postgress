const express = require('express');
const app = express();
const ExpressError = require('./expressError'); // Assuming you have this error handling setup

const companiesRoutes = require('./routes/companies');
const industriesRoutes = require('./routes/industries');

app.use(express.json());

app.use('/companies', companiesRoutes);
app.use('/industries', industriesRoutes);

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message,
  });
});

app.listen(3000, function () {
  console.log('Server is starting on port 3000');
});

module.exports = app;
