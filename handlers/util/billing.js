/**
 * Billing logic (via PayPal)
 */

var request = require('request');

var PAYPAYMODE = 'TEST',	// TEST or LIVE: FIXME: NEEDS TO BE "LIVE" !!!
	PF_HOST_ADDR = "https://pilot-payflowpro.paypal.com",
	PF_HOST_ADDR2 = "https://payflowpro.paypal.com",
	PF_URL = (PAYPAYMODE == 'LIVE' ? PF_HOST_ADDR2 : PF_HOST_ADDR);

var zeroPad = function(num, size) {	// size must be <=10, if num has more dijits than size it will only return rightmost <size> digits
    var s = "0000000000" + num;
    return s.substr(s.length-size);
};

var oneDayMilliseconds = 24 * 60 * 60 * 1000;
var thiryDaysMilliseconds = 30 * oneDayMilliseconds;

module.exports = {
	/**
	 * Set up PayPal recurring billing for a new customer.
	 *
	 * @param {object} user object from Mongo DB
	 * @params {function} callback  Parameters(err, payPalReturnData)
	 *    if transaction was successful, err is null
	 *    payPayReturnData has the data returned by PayPal
	 */
	subscribe: function(user, callback) {
		var today = new Date();
		var trxAmt;
		var amt = user.subscription.recurringPayment + '';
		var payPeriod = user.subscription.recurringPeriod;
		var recurDate = user.subscription.firstRecurringPaymentDate;
		var start = zeroPad(recurDate.getUTCMonth()+1, 2) + zeroPad(recurDate.getUTCDate(), 2) + recurDate.getUTCFullYear();
		var expires = user.ccExpires.replace(/(\d\d)\/(\d\d)/, '$1$2');	// remove slash
		var form = {
			TRXTYPE:'R',
			TENDER:'C',
			PARTNER:'PayPal',
			VENDOR:'BrandingPays',
			USER:'BrandingPaysTools2',
			PWD:'Taunton311',
			ACTION:'A',
			PROFILENAME: user.email,
			AMT: amt,	// Recurring fee
			ACCT: user.ccNumber,
			EXPDATE: expires,
			START: start,	// Must be at least one day in future	
			PAYPERIOD: payPeriod,	// DAYS|YEAR (and lots of other options)
			TERM: '0'
		};
		if (user.subscription.firstPayment > 0) {
			var trxAmt = user.subscription.firstPayment + '';
			form.OPTIONALTRX = 'S';
			form.OPTIONALTRXAMT = trxAmt;
		}
		request.post({
			url:PF_URL, 
			form: form
		}, function(err, httpResponse, body){
			var tokens = body.split('&');
			var returnObj = {};
			tokens.forEach(function(token) {
				var parts = token.split('=');
				returnObj[parts[0].toLowerCase()] = parts[1];
			});
			if (!err && httpResponse.statusCode != 200) {
				err = 'Unexpected PayPal response: ' + httpResponse.statusCode;
			} else if (returnObj.result != '0') {
				err = returnObj.trxrespmsg || returnObj.respmsg;
			}
			callback(err, returnObj);
		});
	},

	unsubscribe: function(profileid, callback) {
		request.post({
			url:PF_URL, 
			form: {
				TRXTYPE:'R',
				TENDER:'C',
				PARTNER:'PayPal',
				VENDOR:'BrandingPays',
				USER:'BrandingPaysTools2',
				PWD:'Taunton311',
				ACTION:'C',
				ORIGPROFILEID:profileid
			}
		}, function(err,httpResponse,body){
			var tokens = body.split('&');
			var returnObj = {};
			tokens.forEach(function(token) {
				var parts = token.split('=');
				returnObj[parts[0].toLowerCase()] = parts[1];
			});
			if (!err && httpResponse.statusCode != 200) {
				err = 'Unexpected PayPal response: ' + httpResponse.statusCode;
			} else if (returnObj.result != '0') {
				err = returnObj.trxrespmsg || returnObj.respmsg;
			}
			callback(err);
		});

	}
};

/*
  Docs: 
    * https://developer.paypal.com/docs/classic/payflow/recurring-billing/
    * https://developer.paypal.com/docs/classic/paypal-payments-pro/integration-guide/WPRecurringPayments/
    * https://developer.paypal.com/docs/classic/products/paypal-payments-advanced/
*/

/* 
 * Our PayPal merchant account: (http://manager.paypal.com)

PayPal Payments Advanced	Live	--
Hosted Checkout Pages	Live	Live
Payflow SDK/API (Limited Access)	Live	--
Recurring Billing	Live	--
Paypal Express Checkout	Live	--

Developer and Merchant Support

When you purchase PayPal Payments Advanced, PayPal provides free email support 24 hours per day, 7 days per week.

Access online help from within Manager.PayPal.com (click on the Help button in the upper right of your screen for context-specific help on any page.)
For more help, visit our Merchant Technical Services.
For PayPal Payments Advanced email or phone support, see email, phone number and hours below.
PayPal Payments Advanced	Email	888-215-5506	6:00 AM – 11:00 PM CDT, Monday – Friday 

8:00AM – 10:00 PM CDT, Saturday – Sunday
*/

/* At bottom of: https://developer.paypal.com/docs/classic/payflow/recurring-billing/

Obtaining consent for recurring payments:

You must obtain each customer’s consent to bill them on an automated schedule. Here is the relevant section from PayPal’s Merchant Services Agreement:Merchant shall be solely responsible for:

Obtaining all necessary approvals required from each customer authorizing Merchant to bill such customer’s credit card account. Merchant hereby represents and warrants that Merchant has the authorization to bill its customers’ credit card accounts in the manner, for the amounts and for the period of time indicated by Merchant at the time Merchant enrolls with PayPal.

Complying with all applicable bank and credit card rules with respect to recurring billing of consumers’ credit cards. Merchant hereby represents and warrants that Merchant has complied with all applicable bank and credit card rules in billing its customers’credit card and in its use of PayPal Merchant Services.

Providing accurate information regarding the credit cards to be billed, the amounts, the billing cycles, billing period and any other information requested by PayPal that is necessary to properly process such Transactions.
*/

/* response for cancel action
RESULT=0&RPREF=RWY504915344&PROFILEID=RP000000001234&RESPMSG=Approved
&TRXRESULT=0&TRXPNREF=VWYA04915345&TRXRESPMSG=Approved&AUTHCODE=489PNI
*/

