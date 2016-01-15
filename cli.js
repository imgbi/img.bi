var app = require('./backend/app.js');
var pkg = require('./package.json');
var cli = require('cli').enable('version');
var commands = require('./commands.json');
cli.setApp(pkg.name, pkg.version);

cli.parse(commands);

cli.main(function(args, options) {
  var config;
  if (options.config) {
    config = require(options.config);
  } else {
    config = require('./config.json');
  }

  for (var i in options) {
    if (
      options[i] && i != 'config' && i != 'acceptedTypes'
    ) {
      config[i] = options[i];
    } else if (options[i] && i == 'acceptedTypes') {
      config.acceptedTypes = options.acceptedTypes.split(',');
    }
  }

  app(config, function(err, info, ok) {
    if (err) {
      cli.error(err);
    } else if (info) {
      cli.info(info);
    } else if (ok) {
      cli.ok(ok);
    }
  });
});
