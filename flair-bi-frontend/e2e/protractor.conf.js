// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    // shardTestFiles: true,
    // maxInstances: 2,
    chromeOptions: {
      args: [
        // disable chrome's wakiness
        '--disable-infobars',
        '--disable-extensions',
        'verbose',
        '--start-fullscreen',
        'log-path=/tmp/chromedriver.log',
        'incognito'
      ],
      prefs: {
        // disable chrome's annoying password manager
        'profile.password_manager_enabled': false,
        'credentials_enable_service': false,
        'password_manager_enabled': false
      }
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:8002/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};