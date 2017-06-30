let rimraf = require('rimraf');
rimraf('/dist', () => console.log('dist has been cleaned'));