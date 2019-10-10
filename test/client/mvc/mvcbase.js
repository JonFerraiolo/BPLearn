describe('mvcbase.js', function() {
	describe('model constructor - null object', function() {
		it('data should be {}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{}');
				done();
			});
		});
	});
	describe('model constructor - {a:{b:"ccc"}}', function() {
		it('data should be {"a":{"b":"ccc"}}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({a:{b:"ccc"}});
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{"a":{"b":"ccc"}}');
				done();
			});
		});
	});
	describe('model.set("a.b", "ccc")', function() {
		it('data should be {"a":{"b":"ccc"}}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				model.set("a.b", "ccc");
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{"a":{"b":"ccc"}}');
				done();
			});
		});
	});
	describe('model.set("a.b[0].c", "ccc")', function() {
		it('data should be {"a":{"b":[{"c":"ccc"}]}}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				model.set("a.b[0].c", "ccc");
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{"a":{"b":[{"c":"ccc"}]}}');
				done();
			});
		});
	});
	describe('model.set("a[\'b\'].c", "ccc")', function() {
		it('data should be {"a":{"b":[{"c":"ccc"}]}}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				model.set("a['b'].c", "ccc");
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{"a":{"b":{"c":"ccc"}}}');
				done();
			});
		});
	});
	describe("model.set('a[\"b\"].c', 'ccc')", function() {
		it('data should be {"a":{"b":[{"c":"ccc"}]}}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				model.set('a["b"].c', "ccc");
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{"a":{"b":{"c":"ccc"}}}');
				done();
			});
		});
	});
	describe("model.set('a[\"b\"][\"c\"][0]', 'ccc')", function() {
		it('data should be {"a":{"b":[{"c":"ccc"}]}}', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				model.set('a["b"]["c"][0]', "ccc");
				var m = model.get();
				var json = JSON.stringify(m);
				assert(json == '{"a":{"b":{"c":["ccc"]}}}');
				done();
			});
		});
	});
	describe("model.set('a[\"b\"][\"c\"][0]', 'ccc'), model.get('a'), model.get('a[\"b\"]'), model.get('a[\"b\"][\"c\"][0]", function() {
		it('should correctly get intermediate values from the model', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				model.set('a["b"]["c"][0]', "ccc");
				var m = model.get('a');
				var json = JSON.stringify(m);
				assert(json == '{"b":{"c":["ccc"]}}');
				var m = model.get('a["b"]');
				var json = JSON.stringify(m);
				assert(json == '{"c":["ccc"]}');
				var m = model.get('a["b"]["c"][0]');
				assert(m == 'ccc');
				done();
			});
		});
	});
	describe("model.watch('a', cb1), match(set('a', 'ccc'), model.watch('a', cb2), model.unwatch(cb1Handle), match(set('a', 'ddd'), match(set('a', 'dd')", function() {
		it('watcher callbacks should be called, unwatch should work, cb2 should only be called once because value does not change', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				var cb1count = 0;
				var cb1 = function(oldValue, newValue) {
					cb1count++;
					assert(newValue=='ccc');
				};
				var cb1Handle = model.watch('a', cb1);
				model.set('a', 'ccc');
				var cb2count = 0;
				var cb2 = function(oldValue, newValue) {
					cb2count++;
					assert(newValue=='ddd');
				};
				var cb2Handle = model.watch('a', cb2);
				model.unwatch(cb1Handle);
				model.set('a', 'ddd');
				model.set('a', 'ddd');
				assert(cb1count==1 && cb2count==1);
				done();
			});
		});
	});
	describe("model.watch(/a\[.*\].b/, cb1), model.watch(/a\[.*\].b/, cb2), match(set('a[0].b', 'ccc'), model.unwatch(cb2Handle), match(set('a[1].b', 'ddd')", function() {
		it('watcher callbacks should be called, unwatch should work', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				var cb1count = 0;
				var cb1 = function(oldValue, newValue) {
					cb1count++;
				};
				var cb2count = 0;
				var cb2 = function(oldValue, newValue) {
					cb2count++;
				};
				var cb1Handle = model.watch(/a\[.*\].b/, cb1);
				var cb2Handle = model.watch(/a\[.*\].b/, cb2);
				model.set('a[0].b', 'ccc');
				model.unwatch(cb2Handle);
				model.set('a[1].b', 'ddd');
				model.set('a[1].b', 'eee');
				assert(cb1count==3 && cb2count==1);
				done();
			});
		});
	});
	describe("model.watch(/a.b\[.*\].d/, cb1), model.watch(/a.c\[.*\].d/, cb2), match(set('a.b[0].d', 'ccc'), match(set('a.c[0].b', 'ddd'), match(set('a.c[1].b', 'eee')", function() {
		it('watcher callbacks should be called, unwatch should work', function(done){
			require(['../../client/mvc/mvcbase'], function(mvcbase) {
				var model = new mvcbase({});
				var cb1count = 0;
				var cb1 = function(oldValue, newValue) {
					cb1count++;
				};
				var cb2count = 0;
				var cb2 = function(oldValue, newValue) {
					cb2count++;
				};
				var cb1Handle = model.watch(/a.b\[.*\].d/, cb1);
				var cb2Handle = model.watch(/a.c\[.*\].d/, cb2);
				model.set('a.b[0].d', 'ccc');
				model.set('a.c[0].d', 'ddd');
				model.set('a.c[1].d', 'eee');
				assert(cb1count==1 && cb2count==2);
				done();
			});
		});
	});
});
