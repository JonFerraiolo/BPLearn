describe('cls.js', function() {
	describe('cls.add(e,"foo"), e has no existing classes', function() {
		it('foo should be added as a new class', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				cls.add(e, 'foo');
				assert(e.className == 'foo');
				done();
			});
		});
	});
	describe('cls.add(e,"foo"), e has one existing class', function() {
		it('foo should be added as a new class', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'bar';
				cls.add(e, 'foo');
				assert(e.className.indexOf('foo') >= 0);
				done();
			});
		});
	});
	describe('cls.add(e,"foo"), e has two existing classes', function() {
		it('foo should be added as a new class', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'bar bar2';
				cls.add(e, 'foo');
				assert(e.className.indexOf('foo') >= 0);
				done();
			});
		});
	});
	describe('cls.add(e,"foo"), e has two existing classes with extra leading, trailing and intermediate spaces', function() {
		it('foo should be added as a new class, should be 3 classes total at end', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = '  bar   bar2 ';
				cls.add(e, 'foo');
				var classNames = e.className.split(' ');
				assert(e.className.indexOf('foo') >= 0);
				assert(classNames.length == 3);
				done();
			});
		});
	});
	describe('cls.add(e,["foo1","foo2"]), e has no existing classes', function() {
		it('foo1 and foo2 should be added as new classes', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				cls.add(e, ["foo1","foo2"]);
				assert(e.className.indexOf('foo1')>=0);
				assert(e.className.indexOf('foo2')>=0);
				done();
			});
		});
	});
	describe('cls.add(e,["foo1","foo2"]), e has one existing class', function() {
		it('foo1 and foo2 should be added as new classes', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'bar';
				cls.add(e, ["foo1","foo2"]);
				assert(e.className.indexOf('foo1')>=0);
				assert(e.className.indexOf('foo2')>=0);
				done();
			});
		});
	});
	describe('cls.add(e,["foo1","foo2"]), e has two existing classes', function() {
		it('foo1 and foo2 should be added as new classes', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'bar bar2';
				cls.add(e, ["foo1","foo2"]);
				assert(e.className.indexOf('foo1')>=0);
				assert(e.className.indexOf('foo2')>=0);
				done();
			});
		});
	});
	describe('cls.add(e,"foo"), e has two existing class foo', function() {
		it('foo should not be added as a new class, should be 1 class total at end', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo';
				cls.add(e, 'foo');
				var classNames = e.className.split(' ');
				assert(e.className.indexOf('foo') >= 0);
				assert(classNames.length == 1);
				done();
			});
		});
	});
	describe('cls.remove(e,"foo"), e has no existing classes', function() {
		it('element should have no classes', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				cls.remove(e, 'foo');
				assert(e.className == '');
				done();
			});
		});
	});
	describe('cls.remove(e,"foo"), e has one existing class "bar"', function() {
		it('element should still have class "bar"', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'bar';
				cls.remove(e, 'foo');
				assert(e.className == 'bar');
				done();
			});
		});
	});
	describe('cls.remove(e,"foo"), e has one existing class "foo"', function() {
		it('element should have no classes', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo';
				cls.remove(e, 'foo');
				assert(e.className == '');
				done();
			});
		});
	});
	describe('cls.remove(e,["foo1","foo2"]), e has existing classes "foo1","foo2"', function() {
		it('element should have no classes', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo1 foo2';
				cls.remove(e, ["foo1","foo2"]);
				assert(e.className == '');
				done();
			});
		});
	});
	describe('cls.remove(e,["foo1","foo2"]), e has existing classes "foo1","foo3"', function() {
		it('element should have class "foo3" at end', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo1 foo3';
				cls.remove(e, ["foo1","foo2"]);
				assert(e.className == 'foo3');
				done();
			});
		});
	});
	describe('cls.has(e,"foo1"), e has no existing classes', function() {
		it('should return false', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				assert(!cls.has(e, "foo1"));
				done();
			});
		});
	});
	describe('cls.has(e,"foo"), e has existing classes "foo1 foo2"', function() {
		it('should return false', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo1 foo2';
				assert(!cls.has(e, "foo"));
				done();
			});
		});
	});
	describe('cls.has(e,["foo1","foo2"]), e has existing classes "foo2 foo1"', function() {
		it('should return false', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo1 foo2';
				assert(cls.has(e, ["foo2","foo1"]));
				done();
			});
		});
	});
	describe('cls.has(e,["foo1","foo2"]), e has existing classes "foo1","foo3"', function() {
		it('should return false', function(done){
			require(['../../client/util/cls'], function(cls) {
				var e = document.createElement('div');
				e.className = 'foo1 foo3';
				assert(!cls.has(e, ["foo1","foo2"]));
				done();
			});
		});
	});
});
