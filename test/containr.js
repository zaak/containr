var Containr = require('../');
var assert = require('assert');

describe("Containr", function() {
	it("should save initial values", function() {
		function bazFun( foo, bar) {
			return foo + Number(bar);
		}

		var container = new Containr({
			foo: 111,
			bar: '222',
			baz: bazFun,
			buzz: function(foo, baz) {
				return foo + baz;
			}
		});

		assert.equal(111, container.get('foo'));
		assert.equal('222', container.get('bar'));
		assert.equal(333, container.get('baz'));
		assert.equal(444, container.get('buzz'));
	});

	it("should resolve dependencies basing on argument names", function() {
		function Service1() {}
		Service1.prototype.getOne = function() {
			return 1;
		};

		function Service2(service1) {
			this.service1 = service1;
		}

		Service2.prototype.getService1 = function() {
			return this.service1;
		};

		Service2.prototype.getTwo = function() {
			return 2;
		};

		function Service3(service1, service2) {
			this.service1 = service1;
			this.service2 = service2;
		}

		Service3.prototype.getService1 = function() {
			return this.service1;
		};

		Service3.prototype.getService2 = function() {
			return this.service2;
		};

		Service3.prototype.getSum = function() {
			return this.service1.getOne() + this.service2.getTwo();
		};

		var container1 = new Containr();

		container1.set('service1', new Service1());

		container1.set('service2', function(service1) {
			return new Service2(service1);
		});

		container1.set('service3', function(service1, service2) {
			return new Service3(service1, service2);
		});

		var s3c1 = container1.get('service3');

		assert(s3c1 instanceof Service3);
		assert(s3c1.getService1() instanceof Service1);
		assert(s3c1.getService2() instanceof Service2);
		assert(s3c1.getService2().getService1() instanceof Service1);
		assert.equal(s3c1.getService2().getService1(), container1.get('service1'));
		assert.equal(s3c1.getService2().getService1(), s3c1.getService1());
		assert.equal(3, s3c1.getSum());

		var container2 = new Containr({
			service1: new Service1(),
			service2: function(service1) {
				return new Service2(service1);
			},
			service3: function(service1, service2) {
				return new Service3(service1, service2)
			}
		});

		var s3c2 = container2.get('service3');

		assert(s3c2 instanceof Service3);
		assert(s3c2.getService1() instanceof Service1);
		assert(s3c2.getService2() instanceof Service2);
		assert(s3c2.getService2().getService1() instanceof Service1);
		assert.equal(s3c2.getService2().getService1(), container2.get('service1'));
		assert.equal(s3c2.getService2().getService1(), s3c2.getService1());
		assert.equal(3, s3c2.getSum());
	});
});
