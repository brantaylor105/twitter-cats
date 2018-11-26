var Twitter = require('twitter');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

var kinesis = new AWS.Kinesis();

var client = new Twitter({
    consumer_key: "xinNkfuYskk9EHSKWclb0kfwS",
    consumer_secret: "ACWagmL2fEU21ieGgGdK821NL72kKkoyD5Y2Gier4as92Y4Un6",
    access_token_key: "376841169-VCXpE1Lur3nIkxtOM9Sqn7c6189c97AyIiXI54IR",
    access_token_secret: "AFpP4Yn85PC2oSByZRClyCfcOMp6ciSwDJ6jHuL6FZSKa"
});

var stream = client.stream('statuses/filter', {
    track: 'cat',
    language: 'en'
});

stream.on('data', function (event) {
    if (event.text) {
        var record = JSON.stringify({
            id: event.id,
            timestamp: event['created_at'],
            tweet: event.text.replace(/["'}{|]/g, '') //either strip out problem characters or base64 encode for safety
        }) + '|'; // record delimiter

        kinesis.putRecord({
            Data: record,
            StreamName: 'twitterStream',
            PartitionKey: 'key'
        }, function (err, data) {
            if (err) {
                console.error(err);
            }
            console.log('sending: ', event.text);
        });
    }
});

stream.on('error', function (error) {
    throw error;
});
