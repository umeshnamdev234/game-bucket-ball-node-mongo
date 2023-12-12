const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017';
const dbName = 'bucketBallDB';
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new MongoClient(url);

let bucketsCollection;
let ballsCollection;

app.get('/', (req, res) => {
    res.render('index');
});

// API to create a new bucket
app.post('/createBucket', async (req, res) => {
    const { name , capacity } = req.body;
    await client.connect();
    const db = client.db(dbName);
    bucketsCollection = db.collection('buckets');
    ballsCollection = db.collection('balls');
    const existingBucket = await bucketsCollection.findOne({ name });

    if (existingBucket) {
        await client.close();
        return res.json({ error: 'Bucket with the same name already exists.' });
    }
    await bucketsCollection.insertOne({ name, capacity: parseInt(capacity), contents: [] });
    await client.close()
    return res.status(201).json({message: `Bucket created with capacity ${capacity} cubic inches.`});
});

// API to create a new ball
app.post('/createBall', async (req, res) => {
    const { color, size } = req.body;
    await client.connect();
    const db = client.db(dbName);
    ballsCollection = db.collection('balls');
    const existingBall = await ballsCollection.findOne({ color });

    if (existingBall) {
        await client.close();
        return res.json({ error: 'Ball with the same color already exists.' });
    }
    await ballsCollection.insertOne({ color, size: parseInt(size) });
    await client.close()
    return res.status(201).json({message : `Ball created - Color: ${color}, Size: ${size} cubic inches.`});
});

// API to suggest bucket allocation based on ball counts
app.post('/suggestBuckets', async (req, res) => {
    const { suggestions } = req.body;
    await client.connect();
    const db = client.db(dbName);
    bucketsCollection = db.collection('buckets');
    ballsCollection = db.collection('balls');
    const buckets = await bucketsCollection.find({}).toArray();
    const balls = await ballsCollection.find({}).toArray();

    let totalBucketCapacity = buckets.reduce((total, bucket) => total + bucket.capacity, 0);

    let ballsRemaining = suggestions.reduce((total, suggestion) => total + parseInt(suggestion.count)*parseInt(suggestion.size), 0);

    if (ballsRemaining > totalBucketCapacity) {
        return res.json({ error: 'Total ball size exceeds total bucket capacity. Please return some balls.' });
    }

    buckets.forEach(bucket => {
        bucket.contents = [];
    });

    // Function to distribute balls into buckets based on color and count
    let remainingBalls = [];
    const distributeBalls = (color, count, ball) => {
        for (let i = 0; i < count; i++) {
            let addedToBucket = false;
            for (let j = 0; j < buckets.length; j++) {
                const bucket = buckets[j];
                const availableSpace = bucket.capacity - bucket.contents.reduce((total, b) => total + b.size, 0);

                if (availableSpace >= ball.size) {
                    bucket.contents.push(ball);
                    addedToBucket = true;
                    break;
                }
            }
            if (!addedToBucket) {
                remainingBalls.push(ball);
            }
        }
    };

    

    // Distribute balls based on the suggestions
    suggestions.forEach((suggestion) => {
        const ball = balls.find(b => b.color === suggestion.color);
        if (!ball) {
            return false;
        }
        distributeBalls(suggestion.color, suggestion.count, ball);
    });

    // Prepare the result with contents of each bucket
    const result = buckets.map((bucket, index) => ({
        name: bucket.name,
        capacity : bucket.capacity,
        contents: Object.entries(bucket.contents.reduce((acc, ball) => (acc[ball.color] = (acc[ball.color] || 0) + 1, acc), {})).map(([color, count]) => `${count} ${color} Balls`)
    }));
    if (remainingBalls.length > 0) {
        result.push({
            name: 'Excess Balls (Need to return)',
            contents: Object.entries(remainingBalls.reduce((acc, ball) => (acc[ball.color] = (acc[ball.color] || 0) + 1, acc), {})).map(([color, count]) => `${count} ${color} Balls`)
        });
    }
    await client.close()
    return res.json(result);
});

app.get('/bucket_list', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        bucketsCollection = db.collection('buckets');
        const buckets = await bucketsCollection.find({}).toArray();
        //await client.close()
        return res.json(buckets);
    } catch (error) {
        return res.status(500).json({message : "Internal Server Error"});
    }
});
app.get('/ball_list', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        ballsCollection = db.collection('balls');
        const balls = await ballsCollection.find({}).toArray();
        //await client.close()
        return res.json(balls);
    } catch (error) {
        return res.status(500).json({message : "Internal Server Error"});
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
