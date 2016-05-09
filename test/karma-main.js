var tests = [],
    file;
<<<<<<< HEAD
for (file in window.__karma__.files) {
=======
    console.info(file);
>>>>>>> dbfd447eaa3f708b6a0cd1f316a6a506d33f905d
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
