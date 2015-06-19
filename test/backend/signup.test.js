"use strict";

var test    = require("tape");
var request = require("supertest");
var Sails   = require("sails");
var helpers = require("./helpers.js");

var sails;


test("Start server: ", function (t) {

	Sails.lift({
		log: {
			level: 'error'
		},
		models: {
			connection: 'test',
			migrate: 'drop'
		}
	}, function (err, serverStarted) {

		if(err) {
			throw err;
			t.end();
		} else {
			sails = serverStarted;
			t.ok(serverStarted, "..server started");
			t.end();
		}
	});
});

test("Create hooks", function (t) {

	helpers(function (error, items) {

		t.ok(items, "mock entries created");
		t.end();
	});
});

test("Signup member: ", function (t) {

	var memberMock = {
		primary_email: "some@email.com"
	};

	request(sails.hooks.http.app)
	.post("/signup")
	.send(memberMock)
	.end(function (err, res) {

		t.equals(res.statusCode, 302, "signup with just an email");
		t.end();
	});
});

test("Signup member should create a subscription charge", function (t) {

	var memberMock = {
		primary_email: "someone@email.com",
		membership_type: "annual-corporate"
	};

	request(sails.hooks.http.app)
	.post("/signup")
	.send(memberMock)
	.end(function (err, res) {

		Members
		.findOne(memberMock)
		.populateAll()
		.exec(function (error, item) {

			if(error) {
				console.log(error)
				t.end();
			} else {
				t.ok(item, "member created");
				t.end();
			}
		});
	});
});

test("Low server: ", function (t) {

	t.ok("ok", "exit!")
	t.end();
	process.exit(0);
});