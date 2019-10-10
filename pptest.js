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

var request = require('request');

var PAYPAYMODE = 'TEST',	// LIVE or TEST
	PF_HOST_ADDR = "https://pilot-payflowpro.paypal.com",
	PF_HOST_ADDR2 = "https://payflowpro.paypal.com",
	PF_URL = (PAYPAYMODE == 'LIVE' ? PF_HOST_ADDR2 : PF_HOST_ADDR);

/*
request.post({
	url:PF_URL, 
	form: {
		TRXTYPE:'R',
		TENDER:'C',
		PARTNER:'PayPal',
		VENDOR:'BrandingPays',
		//USER:'BrandingPays',
		USER:'BrandingPaysTools2',
		// PWD:'PtourS74!',	// ??? - Can I make two logins?
		PWD:'Taunton311',
		ACTION:'A',
		PROFILENAME:'jon@brandingpays.com',	// ???
		OPTIONALTRX:'S',
		OPTIONALTRXAMT:'0.10',
		AMT:'0.01',
		ACCT:'4802137654103011',	// ???
		EXPDATE:'0417',	// ???
		START:'03022015',	// Needs to be at least one day in future	
		PAYPERIOD:'DAYS',
		TERM:'0'
	}
}, function(err,httpResponse,body){
	debugger;
});
*/

/* From: https://devtools-paypal.com/guide/recurring_payment_cc/curl?interactive=ON&env=sandbox
 * Not sure if this works, probably for the new REST APIs...
 * Interesting fields: CREDITCARDTYPE, CVV2, 
 * Doesn't seem to match: PROFILESTARTDATE, BILLINGFREQUENCY, BILLINGPERIOD
 curl https://api-3t.sandbox.paypal.com/nvp\
 -d method=CreateRecurringPaymentsProfile\
 -d AMT=1.0\
 -d CREDITCARDTYPE=Visa\
 -d ACCT=4745425765192217\
 -d CVV2=962\
 -d EXPDATE=012015\
 -d CURRENCYCODE=USD\
 -d PROFILESTARTDATE=2015-01-13T00:00:00:000Z\
 -d BILLINGFREQUENCY=10\ 
 -d BILLINGPERIOD=Day\
 -d DESC=recurring billing\
 -d version=104.0\
 -d user=jb-us-seller_api1.paypal.com\
 -d pwd=WX4WTU3S8MY44S7F\
 -d signature=AFcWxV21C7fd0v3bYYYRCpSSRl31A7yDhhsPUU2XhtMoZXsWHFxu-RWy 
*/

/* This is WRONG. OPTIONALTRXAMT instead
INITAMT	ScheduleDetails.ActivationDetails.InitialAmount
FAILEDINITAMTACTION	ScheduleDetails.ActivationDetails.FailedInitAmountAction
*/

//RESULT=0&RPREF=RLE5BBE99A99&PROFILEID=RP0000000001&RESPMSG=Approved'


/* To cancel a recurring billing:
*/
request.post({
	url:PF_URL, 
	form: {
		TRXTYPE:'R',
		TENDER:'C',
		PARTNER:'PayPal',
		VENDOR:'BrandingPays',
		//USER:'BrandingPays',
		USER:'BrandingPaysTools2',
		// PWD:'PtourS74!',	// ??? - Can I make two logins?
		PWD:'Taunton311',
		ACTION:'C',
		ORIGPROFILEID:'RT0000000011'
	}
}, function(err,httpResponse,body){
	debugger;
});

/*
TRXTYPE=R&TENDER=C&PARTNER=PayPal&VENDOR=Acme&USER=Acme&PWD=a1b2c3d4
&ACTION=C&ORIGPROFILEID=RP000000001234
*/
/* From  https://developer.paypal.com/docs/classic/payflow/recurring-billing/

TRXTYPE=R&TENDER=C&PARTNER=PayPal&VENDOR=Acme&USER=Acme&PWD=a1b2c3d4&ACTION=A
&PROFILENAME=RegularSubscription&AMT=42.00&ACCT=4012888888881881&EXPDATE=0203
&START=12012013&PAYPERIOD=WEEK&TERM=12&OPTIONALTRX=S&OPTIONALTRXAMT=2.00
&COMMENT1=First-time customer
*/

/* From: 
 * fields for recurring payments
CITY 
COMMENT1 
COMPANYNAME 
COUNTRY 
EMAIL 
FIRSTNAME 
LASTNAME 
MIDDLENAME 
NAME 
PHONENUM 
SHIPTOFIRSTNAME 
SHIPTOMIDDLENAME 
SHIPTOLASTNAME 
SHIPTOSTREET 
SHIPTOCITY 
SHIPTOCOUNTRY 
SHIPTOSTATE 
SHIPTOZIP 
STREET 
ZIP
*/

/* From: https://developer.paypal.com/docs/classic/payflow/recurring-billing
The following are required parameters for the Add action:

TABLE Required recurring profile parameters for the Add action 

Parameter	Description	Usage (Length)
TRXTYPE	Specifies a recurring profile request.	Must be R
TENDER	Tender type. Is one of the following values: 
- C = Credit card 
- P = PayPal 
- A = Automated Clearinghouse (ACH)	Must be C, P, or A (1 character)
ACTION	Specifies Add, Modify, Cancel, Reactivate, Inquiry, or Payment.	Must be A (1 character)
PROFILENAME	Name for the profile (user-specified). Can be used to search for a profile.	Non-unique identifying text name; Alpha-numeric (128)
ACCT	Required when TENDER=C or TENDER=A. Can be used to search for a profile. 
Note: For a credit card profile, be sure to use a valid credit card number. If necessary, perform an Authorization with a zero-dollar amount to verify the credit card.	Alphaumeric (19 characters)
BAID	Is the billing agreement ID returned in the Do Express Checkout Payment or Create Customer Billing Agreement response. See the Express Checkout for Payflow Guide for details on obtaining and updating BAIDs. 
Note: Either a BAID or ORIGID (PNREF) returned from the original transaction used to create a new profile is required when TENDER=P.	Alphaumeric (19 characters)
ORIGID	Is the PNREF value (length=12) returned from the original transaction used to create a new profile. 
Note: Either a BAID or ORIGID is required to create a new profile when TENDER=P.	Alphaumeric (19 characters)
AMT	Dollar amount (US dollars) to be billed. Specify the exact amount to the cent using a decimal point; use 34.00, not 34. Do not include comma separators; use 1199.95 not 1,199.95.	Numeric (10 characters including the decimal point)
START	Beginning date for the recurring billing cycle used to calculate when payments should be made. Use tomorrow’s date or a date in the future.	Format: MMDDYYYY. Numeric (8 characters)
TERM	Number of payments to be made over the life of the agreement. A value of 0 means that payments should continue until the profile is deactivated.	Numeric
PAYPERIOD	Specifies how often the payment occurs: 
- DAYS: Number of days between payments. Must be used with FREQUENCY. For example, if FREQUENCY=100, a payment is collected once every 100 days. If the FREQUENCY field is not passed, the default frequency value is 1, and the customer is billed on a daily basis. 
- WEEK: Weekly - Every week on the same day of the week as the first payment. 
- BIWK: Every Two Weeks - Every other week on the same day of the week as the first payment.
- SMMO: Twice Every Month - Once every 15 or 16 days, depending on the number of days in the month. Results in 24 payments per year. If the first payment takes place between the 1st and the 15th of the month, the second payment happens 15 or 16 days later.
- FRWK: Every Four Weeks - Every 28 days from the previous payment date beginning with the first payment date. Results in 13 payments per year.
- MONT: Monthly - Every month on the same date as the first payment. Results in 12 payments per year.
- QTER: Quarterly - Every three months on the same date as the first payment.
- SMYR: Twice Every Year - Every six months on the same date as the first payment. 
- YEAR: Yearly - Every 12 months on the same date as the first payment.	Must be a value shown here, including all uppercase letters (4 characters)
FREQUENCY	Use if PAYPERIOD=DAYSto set the number of days between payments. For example, if FREQUENCY=100, a payment is collected once every 100 days. If FREQUENCY is not passed with PAYPERIOD=DAYS, it defaults to the value 1 and the customer is billed on a daily basis. If FREQUENCY is passed without PAYPERIOD=DAYS, the transaction fails.

TABLE Optional recurring profile parameters for Add action

Parameter	Description	Usage (Length)
ORIGID	PNREF value (length=12) of the original transaction used to create a new profile. Note: ORIGID is optional when TENDER=C or TENDER=A.	Alphaumeric (19 characters)
MAXFAILPAYMENTS	The number of payment periods (as specified by PAYPERIOD) for which the transaction is allowed to fail before PayPal cancels a profile. These periods need not be consecutive (for example, if payments fail in January, March, and June, the profile is cancelled). 
If you specify 3, then PayPal allows a maximum of three failed payment periods (possibly with multiple retries during each payment period, and possibly non-consecutive periods). If the transaction is not approved for any three periods (months in the example), then PayPal deactivates the profile. 
Important: If you do not specify a value, the default value of 0 (zero) specifies no limit. Retry attempts occur until the term is complete.	Default is: 0
RETRYNUMDAYS	The number of consecutive days that PayPal should attempt to process a failed transaction until Approved status is received; maximum value is 4.	Numeric
EMAIL	Customer email address. This value is used when sending email receipts to customers.	Alphanumeric (120 characters)
DESC	Optional description of the goods or services being purchased. This parameter applies only for ACH_CCD accounts.	Alphanumeric (80 characters).
COMPANYNAME	Company name associated with this profile.	Alphanumeric (64 characters)
OPTIONALTRX	Defines an optional Authorization for validating the account information or for charging an initial fee. If this transaction fails, then the profile is not generated. The values are: 
- A: an optional Authorization transaction to verify the account. It applies to credit card transactions only. 
- S: a Sale transaction for an initial fee specified by OPTIONALTRXAMT.	Alphanumeric (1 character)
OPTIONALTRXAMT	Amount of the Optional Transaction. Required only when OPTIONALTRX=S. 
Note: Do not specify an amount when OPTIONALTRX=A. The amount is ignored.	 
STREET	Billing street.	 
ZIP	Billing postal code.

TABLE Response values for Add action

Field	Description
RESULT	Result value for the action.
PROFILEID	If RESULT = 0, then this value is the Profile ID. Profile IDs for test profiles start with the characters RT. Profile IDs for live profiles start with RP.
RESPMSG	Optional response message.
RPREF	Reference number to this particular action request.

*/