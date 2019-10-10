define(function() {
	var visa = '4[0-9]{12}(?:[0-9]{3})?';
	var mc = '5[1-5][0-9]{14}';
	var amex = '3[47][0-9]{13}';
	var diners = '3(?:0[0-5]|[68][0-9])[0-9]{11}';
	var discover = '6(?:011|5[0-9]{2})[0-9]{12}';
	var jcb = '(?:2131|1800|35\d{3})\d{11}';
	var ccnRegex = new RegExp('^(?:'+visa+'|'+mc+'|'+amex+'|'+diners+'|'+discover+'|'+jcb+')$');
	var amexRegex = new RegExp('^'+amex+'$');

	return {

		isValidEmail: function(s){	
		    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return re.test(s);
		},

		isValidCCN: function(s) {
			/* from stackoverflow
			var re= /^(?:4[0-9]{12}(?:[0-9]{3})?          # Visa
				 |  5[1-5][0-9]{14}                  # MasterCard
				 |  3[47][0-9]{13}                   # American Express
				 |  3(?:0[0-5]|[68][0-9])[0-9]{11}   # Diners Club
				 |  6(?:011|5[0-9]{2})[0-9]{12}      # Discover
				 |  (?:2131|1800|35\d{3})\d{11}      # JCB
				)$/;
			*/
		    return ccnRegex.test(s);
		},

		isValidExpiration: function(s) {
			var re = /^(0[1-9]|1[0-2])\/?[0-9]{2}$/;
			return re.test(s);
		},

		isValidCVV: function(ccn, cvv) {
			var digits = amexRegex.test(ccn) ? 4 : 3;
			var re = new RegExp('^[0-9]{' + digits + '}$');
			return re.test(cvv);
		}

	};
});