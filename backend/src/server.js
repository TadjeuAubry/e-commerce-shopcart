require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connection to MongoDB first
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`ShopCart server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start ShopCart server:");
    console.error(error.message);
  }
};

startServer();