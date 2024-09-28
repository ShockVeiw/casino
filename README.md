# Casino Coding Challenge

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v20.x or higher)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Step 1: Set Up

1. **Clone the repository**
2. **Install the dependencies**

   ```bash
    npm i
   ```
3. **Create .env file in the root of the project and paste there all the content from .env.example**
4. **Ensure you have running mongod process**
5. **Run the application**
   ###### 5.1 Dev Mode

   ```bash
    npm run dev
    npm run build & npm run start #to run in production mode
   ```
   ###### 5.2 Production Mode

   ```bash
    npm run build
    npm run start
   ```

## Step 2: Testing
1. **You can test manually with the help of Postman, there is casino.postman_collection.json in the root of the project to be imported**
2. **To run automated tests:**

   ```bash
    npm run test
   ```