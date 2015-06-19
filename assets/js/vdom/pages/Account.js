"use strict";


var nuclear = require("../nuclear.js");
var h       = nuclear.h;
var utils   = require("../utils.js");


module.exports = Account;


var route;


function Account (member) {

	member          = member || {payments: []};
	member.payments = member.payments || [];

	var state = nuclear.observS({
		route:    nuclear.observ(""),
		member:   nuclear.observS(member),
		payments: nuclear.observ(member.payments),
		donation: nuclear.observ(""),
		channels: {
			charge: charge
		}
	});

	route = nuclear.router(state);

	return state;
}

function charge (state) {

	var payments = 

	nuclear.request({

	})
}

Account.render = function (state) {

	return (
		h("div.main-container", [

			route("/",        homePageAccount),
			route("/payment", paymentPage),
			route("/paypal",  paypal),
			route("/credit",  credit)

		])
	);

	function homePageAccount (state) {

		return ([
			h("div.main-container", [
				h("div.inner-section-divider-small"),
				h("div.section-label", [
					h("h1", "Account")
				]),
				h("div.container-small", [
					h("div.inner-section-divider-small"),
					renderPayments(state),
					h("div.inner-section-divider-medium"),
					refundRender(state),
					h("div.inner-section-divider-medium"),
					expireAnnualSubscription(state),
					h("div.inner-section-divider-medium"),
					renderDonation(state)
				])
			])
		])
	}

	function paymentPage (state) {

		return (
			h("div.main-container", [
				h("div.inner-section-divider-small"),
				h("div.section-label", [
					h("h1", "Payment method")
				]),
				h("div.container-small", [
					h("div.inner-section-divider-medium"),
					h("button.btn-primary", {
						onclick: function () {
							window.location.hash = "credit";
						}
					}, "Credit Card"),
					h("div.inner-section-divider-small"),
					h("button.btn-primary", {
						onclick: function () {
							window.location.hash = "paypal";
						}
					}, "PayPal"),
					h("div.inner-section-divider-medium"),
					h("div.input-label-container", [
						h("h4", "Paying by bank transfer to Friends of Chichester Harbour."),
						h("h4", "A/c No: 87037440 Sort Code 52-41-20")
					]),
					h("button.btn-primary", {
						onclick: state.channels.charge.bind(this, state)
					}, "Bank transfer"),
					h("div.inner-section-divider-medium"),
					// h("div.input-label-container", [
					// 	h("h4", "Paying by bank transfer to Friends of Chichester Harbour."),
					// 	h("h4", "A/c No: 87037440 Sort Code 52-41-20")
					// ]),
					h("button.btn-primary", {
						onclick: state.channels.charge.bind(this, state)
					}, "Cheque")
				])
			])
		);
	}

	function paypal (state) {

        nuclear.request({
            method: "GET",
            uri: "/client_token"
        }, function (err, header, token) {
        
            braintree.setup(token, "dropin", {
                container: "payment-form",
                onReady: function () {
               
                    var submit = utils.$$("braintree-pay").elm;
                    var amount = utils.$$("amount").elm;
                    var cancel = utils.$$("cancel").elm;

                    submit.className = "";
                    amount.className = "";
                    cancel.className = "";
                }
            }); 
        });

		return (
			h("div.main-container", [
				h("div.inner-section-divider-small"),
				h("div.section-label", [
					h("h1", "Payment method")
				]),
				h("div.container-small", [
					h("form#checkout", {
						method: "POST",
						action: "/paypal_payment"
					}, [
						h("div.inner-section-divider-medium"),
						h("div#payment-form"),
						h("div.inner-section-divider-small"),
						h("input.disabled#amount", {
							disabled: true,
							value: "10",
							name: "amount"
						}),
						h("div.inner-section-divider-medium"),
						h("button.btn-primary.disabled#braintree-pay", {
							type: "submit",
							value: "Pay",
						}, "Pay"),
						h("div.inner-section-divider-small"),
						h("button.btn-primary.disabled#cancel", {
							onclick: function () {
								window.location.hash = "";
							}
						}, "Cancel")
					])
				])
			])
		);
	}

	function credit (state) {

		return paypal(state);
	}
};

function renderDonation (state) {

	var donationAmount;

	return ([
		h("div.input-label-container", [
			h("h3", "Donation")
		]),
		h("div.block", [
			h("input.align-one", {
				type: "text",
				placeholder: "Amount",
				onchange: function () {
					donationAmount = this.value;
				}
			}, "Yes please"),
			h("button.btn-primary.align-two", {
				onclick: function () {

					state.donation.set(donationAmount);
					window.location.hash = "payment";
				}
			}, "Add")
		])
	]);
}

function renderPayments (state) {

	return (
		h("div.table-payments", [
			h("div.header", [
				h("div.item-one", [
					h("p.meta", "Date")
				]),
				h("div.item", [
					h("p.meta", "Description")
				]),
				h("div.item-one", [
					h("p.meta", "Charge")
				]),
				h("div.item-two", [
					h("p.meta", "Due")
				])
			]),
			h("div.body", [
				renderRows(state)
			])
		])
	);
}

function renderRows (state) {

	var payments = utils.dateConverter(utils.balanceDue(state.payments()));

	return payments.map(function (elm, index) {

		return (
			h("div.row", [
				h("div.item-one", [
					h("p.micro", elm.date)
				]),
				h("div.item", [
					h("p.micro", elm.description)
				]),
				h("div.item-one", [
					h("p.micro", String(elm.amount))
				]),
				h("div.item-two", [
					h("p.micro", String(elm.balanceDue))
				])
			])
		);
	});
}

function expireAnnualSubscription (state) {

	if(isSubscriptionDue(state())) {

		return (
			h("div", [
				h("div.input-label-container", [
					h("h3", "Subscription")
				]),
				h("div.input-label-container", [
					h("h4", "Your annual subscription is due on 12-12-2012 pay it now?")
				]),
				h("div.block", [
					h("button.btn-primary.align-one", {
						onclick: function () {

							state.panel.set("paymentMethod");
						}
					}, "Yes please"),
					h("button.btn-primary.align-two", {
						onclick: function () {

							state.panel.set("paymentMethod");
						}
					},"No thanks")
				])
			])
		);
	}

	function isSubscriptionDue (state) {

		return false;
	}
}

function refundRender (state) {


	if (getLastMovement(state)) {

		return (
			h("div", [
				h("button.btn-primary", {
					onclick: function () {

						state.panel.set("weDoOweMoney");
					}
				},"Refund options")
			])
		);
	}


	function getLastMovement (state) {

		if(
			state.payments() && 
			state.payments().length > 0 && 
			state.payments()[state.payments().length - 1] &&
			Number(state.payments()[state.payments().length - 1].balanceDue) < 0
		) {
			return true;
		} else {
			return false;
		}
	}
}