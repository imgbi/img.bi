var fs = require('fs');
var pkg = require('../package.json');
var commands = require('../commands.json');
var config = require('../config.json');
var name = Object.keys(pkg.bin)[0];
var Man = require('man-api'); 
var out = fs.createWriteStream(__dirname + '/../imgbi-server.1');

var man = new Man(function(str) {
	out.write(str);
});

man.header(name, 1).name(name, 'a client-side encrypted image hosting');

man.section('SYNOPSIS').bold(name).write('[OPTIONS]');

man.section('DESCRIPTION').bold(name)
  .write('is a tool to build and host img.bi instance. I can be used ' +
    'alone, although it\'s recommended to use it with some ' +
    'webserver like nginx.');

for (var i in commands) {
  man.paragraph();
  man.bold('--' + i + ', -' + commands[i][0]);
  man.indent(5, commands[i][1]);
}

man.section('AUTHOR').write('Written by ' + pkg.author.name +
  ' <' + pkg.author.url + '>');

man.section('REPORTING BUGS')
  .write('Bugtracker: <' + pkg.bugs.url + '>');

man.section('DONATIONS');
man.subSection('Bitcoin').write(config.bitcoin);
man.subSection('Litecoin').write(config.litecoin);
man.subSection('Dogecoin').write(config.dogecoin);

man.section('COPYRIGHT').write(pkg.license);
