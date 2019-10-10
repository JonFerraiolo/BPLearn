describe('elem.js', function() {
	describe('elem(tagname,{})', function() {
		it('element should be created without a parentNode, no attributes, no inline style', function(done){
			require(['../../client/util/elem'], function(elem) {
				var e = elem('div', {});
				assert(e);
				assert(!e.parentNode);
				assert(e.outerHTML == '<div></div>');
				done();
			});
		});
	});
	describe('elem(tagname,{}, document.body)', function() {
		it('element should have BODY as parentNode, no attributes, no inline style', function(done){
			require(['../../client/util/elem'], function(elem) {
				var e = elem('div', {}, document.body);
				assert(e);
				assert(e.parentNode == document.body);
				assert(e.outerHTML == '<div></div>');
				done();
			});
		});
	});
	describe('elem(tagname,{attrs:{"class":"foo","role":"bar"},styles:{textAlign:"right",fontSize:"10px"}})', function() {
		it('element should have an attribute and a style', function(done){
			require(['../../client/util/elem'], function(elem) {
				var e = elem('div', {attrs:{"class":"foo","role":"bar"},styles:{textAlign:"right",fontSize:"10px"}});
				assert(e);
				assert(!e.parentNode);
				assert(e.getAttribute('class')=='foo');
				assert(e.getAttribute('role')=='bar');
				assert(e.style.textAlign=='right');
				assert(e.style.fontSize=='10px');
				done();
			});
		});
	});
	describe('elem(tagname,{events:{"click":function(e){},"mouseover":function(e){}}})', function() {
		it('element should working click and mouseover event listeners', function(done){
			require(['../../client/util/elem'], function(elem) {
				window.clickCount = 0;
				window.mouseoverCount = 0;
				var e = elem('div', {events:{"click":function(e){window.clickCount++;},"mouseover":function(e){window.mouseoverCount++;}}});
				assert(e);
				assert(!e.parentNode);
				var clickEvent = new Event('click');
				e.dispatchEvent(clickEvent);
				var mouseoverEvent = new Event('mouseover');
				e.dispatchEvent(mouseoverEvent);
				e.dispatchEvent(mouseoverEvent);
				assert(window.clickCount === 1);
				assert(window.mouseoverCount === 2);
				done();
			});
		});
	});
	describe('elem(tagname,{children:"hello"})', function() {
		it('element innerHTML should be "hello"', function(done){
			require(['../../client/util/elem'], function(elem) {
				var e = elem('div', {children:"hello"});
				assert(e);
				assert(!e.parentNode);
				assert(e.innerHTML == 'hello');
				done();
			});
		});
	});
	describe('elem(tagname,{children:[span,input]})', function() {
		it('element should have two child nodes, a span and an input', function(done){
			require(['../../client/util/elem'], function(elem) {
				var span = document.createElement('span');
				var input = document.createElement('input');
				var e = elem('div', {children:[span,input]});
				assert(e);
				assert(!e.parentNode);
				assert(e.childNodes[0] == span);
				assert(e.childNodes[1] == input);
				done();
			});
		});
	});
});
