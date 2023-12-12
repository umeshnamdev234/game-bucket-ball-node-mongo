# game-bucket-ball-node-mongo
This repository contains the source code for a Node.js application that manages buckets and balls. The application is built using the Express.js framework and MongoDB for data storage.

Sure, here's a draft for your GitHub repository description:

---

**Bucket Ball Allocator**

### Features:

- **Create Buckets and Balls:** APIs to create new buckets and balls, ensuring uniqueness based on name and color respectively.

- **Bucket and Ball Lists:** Endpoints to retrieve lists of existing buckets and balls.

- **Allocate Balls to Buckets:** An API to suggest bucket allocation based on user-defined suggestions, considering bucket capacity and ball sizes.

### How to Use:

1. **Clone the Repository:**
   ```bash
   Git clone https://github.com/umeshnamdev234/game-bucket-ball-node-mongo.git
   cd bucket-ball-allocator
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Application:**
   ```bash
   npm start
   ```

   The server will be running on `http://localhost:3000`.

4. **Explore APIs:**
   - Create buckets: `POST /createBucket`
   - Create balls: `POST /createBall`
   - Get bucket list: `GET /bucket_list`
   - Get ball list: `GET /ball_list`
   - Allocate balls to buckets: `POST /suggestBuckets`

