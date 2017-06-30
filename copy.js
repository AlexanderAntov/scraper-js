let cpx = require('cpx');
cpx.copy(
    './src/common/**/*.json', 
    './dist/common/',
    { clean: true },
    () => console.log('json files copied')
);
cpx.copy(
    './src/resources/images/**/*.png', 
    './dist/resources/images/',
    { clean: true },
    () => console.log('image resource files copied')
);