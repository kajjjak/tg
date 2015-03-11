var plan = require('flightplan');

var appName = 'taxigateway-server';
var username = 'deploy';
var startFile = 'app.js';

var tmpDir = appName+'-' + new Date().getTime();

// configuration

plan.target('staging', [
/*  {
    host: '104.131.93.214',
    username: username,
    agent: process.env.SSH_AUTH_SOCK
  }*/
]);


plan.target('production', [
  {
    host: '188.166.25.221',
    username: username,
    privateKey: '/Users/kjartanjonsson/.ssh/id_rsa',
    agent: process.env.SSH_AUTH_SOCK
  },
//add in another server if you have more than one
// {
//   host: '104.131.93.216',
//   username: username,
//   agent: process.env.SSH_AUTH_SOCK
// }
]);

// run commands on localhost
plan.local(function(local) {
  // uncomment these if you need to run a build on your machine first
  // local.log('Run build');
  // local.exec('gulp build');

  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');
  //DOES NOT WORK remote.sudo('cd ' + tmpDir + ' ; npm install ; cd .. ', {user: username});

  remote.log('Reload application when manually loggin in and running command bellow');
  remote.log('TODO: ssh deploy@'+'188.166.25.221');
  remote.log('TODO: ~/upgrade.sh ~/' + tmpDir + ' ~/' + appName);
  //remote.sudo('~/upgrade.sh ~/' + tmpDir + ' ~/' + appName, {user: username});
  // cd dir > npm install > cd .. > ln -snf taxigateway-server-1425946660543/ taxigateway-server > cd taxigateway-server > forever app.js
  //remote.sudo('ln -snf /home/deploy/' + tmpDir + ' /home/deploy/'+appName, {user: username});
  //remote.exec('forever stop /home/deploy/'+appName+'/'+startFile, {failsafe: true});
  //remote.exec('forever start /home/deploy/'+appName+'/'+startFile);
});