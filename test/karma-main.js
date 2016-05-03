var tests = [],
    file;
for (file in window.__karma__.files) {
    console.info(file);
    if (/.*\.spec\.js$/.test(file)) {
        tests.push(file);
    }
}
requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/js',

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});