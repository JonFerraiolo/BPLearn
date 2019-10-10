var mandrill = require('mandrill-api');
var mandrill_client = new mandrill.Mandrill('9Keo0SKmlKnrNbaQZTkCOw');
var message = {
    "html": "<p>Example HTML content - #2</p>",
    "text": "Example text content",
    "subject": "example subject #2",
    "from_email": "no-reply@brandingpays.com",
    "from_name": "BrandingPays LLC",
    "to": [{
            "email": "jonferraiolo@gmail.com",
            "name": "Jon Ferraiolo",
            "type": "to"
        }],
    "headers": {
        "Reply-To": "no-reply@brandingpays.com"
    },
    "important": false,
    "track_opens": null,
    "track_clicks": null,
    "auto_text": null,
    "auto_html": null,
    "inline_css": null,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    /* "bcc_address": "admin@brandingpays.com", */
    "tracking_domain": null,
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": "mailchimp",
    "global_merge_vars": [],
    "merge_vars": [],
    "tags": [
        "registration complete"
    ],
    /* "subaccount": "jonferraiolo@gmail.com",*/
    "google_analytics_domains": [
        "brandingpays.com"
    ],
    /* "google_analytics_campaign": "", */
    "metadata": {
        "website": "www.brandingpays.com"
    },
    "recipient_metadata": [{
            "rcpt": "jonferraiolo@gmail.com"
        }],
    "attachments": [],
    "images": []
};
var async = false;
var ip_pool = "Main Pool";
var send_at = "example send_at";
mandrill_client.messages.send({"message": message /*, "async": async, "ip_pool": ip_pool, "send_at": send_at*/}, function(result) {
    console.log(result);
    /*
    [{
            "email": "recipient.email@example.com",
            "status": "sent",
            "reject_reason": "hard-bounce",
            "_id": "abc123abc123abc123abc123abc123"
        }]
    */
}, function(e) {
    // Mandrill returns the error as an object with name and message keys
    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
});