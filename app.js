const express = require('express');
const app = express();
const aws = require('aws-sdk');
let faker = require('faker');
let ObjectId = require('mongodb').ObjectID;
let queueUrl = "https://sqs.us-east-2.amazonaws.com/721441640353/owi";

const log = require('simple-node-logger').createSimpleFileLogger({
    logFilePath: 'project.log',
    timestampFormat: 'DD-MM-YY HH:mm:ss A'
});


aws.config.update({
    region: 'us-east-2',
    accessKeyId: 'AKIAIO3OUU4JUTRPVTQA',
    secretAccessKey: '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'
})

let sqs = new aws.SQS();

aws.config.getCredentials(function (err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
        console.log("Access key:", aws.config.credentials.accessKeyId);
        console.log("secretAccessKey:", aws.config.credentials.secretAccessKey);
        console.log("region:", aws.config.region);
    }
});

app.get('/create', function (req, res) {
    var params = {
        QueueName: "MyFirstQueue"
    };

    sqs.createQueue(params, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

app.get('/list', function (req, res) {
    sqs.listQueues(function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});


app.get('/send', function (req, res) {
    let data = [{
        id: faker.random.number(), // this field should be randomly generated
        organization_id: ObjectId("601a6fc90638651eff8350a8"),
        type: "post",
        source: "facebook",
        link: "https://facebook.com/fake-post",
        username: faker.internet.userName,
        engagements: {
            likes: 0, // this field should be randomly generated
            love: 0, // this field should be randomly generated
            haha: 0, // this field should be randomly generated
            angry: 80 // this field should be randomly generated
        }
    },
    {
        id: faker.random.number(), // this field should be randomly generated
        organization_id: ObjectId("601a6fc90638651eff8350a8"),
        type: "post",
        source: "facebook",
        link: "https://facebook.com/fake-post",
        username: faker.internet.userName,
        engagements: {
            likes: 0, // this field should be randomly generated
            love: 0, // this field should be randomly generated
            haha: 0, // this field should be randomly generated
            angry: 99 // this field should be randomly generated
        }
    },
    {
        id: faker.random.number(), // this field should be randomly generated
        organization_id: ObjectId("601a6fc90638651eff8350a8"),
        type: "post",
        source: "facebook",
        link: "https://facebook.com/fake-post",
        username: faker.internet.userName,
        engagements: {
            likes: 0, // this field should be randomly generated
            love: 0, // this field should be randomly generated
            haha: 0, // this field should be randomly generated
            angry: 1 // this field should be randomly generated
        }
    },
    {
        id: faker.random.number(), // this field should be randomly generated
        organization_id: ObjectId("601a6fc90638651eff8350a8"),
        type: "post",
        source: "facebook",
        link: "https://facebook.com/fake-post",
        username: faker.internet.userName,
        engagements: {
            likes: 0, // this field should be randomly generated
            love: 0, // this field should be randomly generated
            haha: 0, // this field should be randomly generated
            angry: 15 // this field should be randomly generated
        }
    }
    ]
    data.forEach(e => {
        e.total_engagements = e.engagements.likes + e.engagements.love + e.engagements.haha + e.engagements.angry
    })

    var params = {
        MessageBody: JSON.stringify(data),
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

app.get('/receive', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 600
    };

    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            if (data.Messages && data.Messages.length > 0) {
                let body = JSON.parse(data.Messages[0].Body)
                let total_engagements = body.reduce((a, b) => a + b.total_engagements, 0)
                log.info(`-> ${total_engagements / body.length}`)

                res.send(data);
            }
        }
    });
})

app.get('/purge', function (req, res) {
    var params = {
        QueueUrl: queueUrl
    };

    sqs.purgeQueue(params, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

var server = app.listen(8000, function () {
    var port = server.address().port;

    console.log(`server runnong at localhost:${port}`);
});
