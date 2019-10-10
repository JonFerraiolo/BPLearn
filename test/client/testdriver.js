require([], function () {
    require([], function() {
        mocha.setup("bdd");
        require([
        	// List all of the test files here
            "./mvc/mvcbase",
            "./util/elem",
            "./util/cls"
        ], function () {
            mocha.run();
        });
    });

});