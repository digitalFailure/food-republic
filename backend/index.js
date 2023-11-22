const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();
const port = process.env.PORT || 8000;

//mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    ///
    const usersCollection = client.db("FoodRepublic").collection("users");
    const tableCollection = client.db("FoodRepublic").collection("tables");
    const DrinksAndJuiceCollection = client
      .db("FoodRepublic")
      .collection("drinks-juice");
    const FastFoodCollection = client
      .db("FoodRepublic")
      .collection("fast-food");
    const VegetablesAndRicesCollection = client
      .db("FoodRepublic")
      .collection("vegetables-rices");

    // API endpoint to get the list of tables from the collection
    //user
    app.get("/api/get-users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        res.status(500).send("Error fetching user data from the database");
      }
    });
    app.post("/api/add-user", async (req, res) => {
      const userData = req.body;

      try {
        // Check if a user with the same email already exists
        const existingUser = await usersCollection.findOne({
          email: userData.email,
        });

        if (existingUser) {
          return res.status(400).send("User with this email already exists");
        }

        // Insert the new user document
        const result = await usersCollection.insertOne(userData);
        res.send(result);
      } catch (error) {
        res.status(500).send("Error inserting user data into the database");
      }
    });
    app.get("/api/tables", async (req, res) => {
      try {
        const tables = await tableCollection.find({}).toArray();
        res.json({ tables });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    // API endpoint to add a new table to the collection
    app.post("/api/add-table", async (req, res) => {
      try {
        const currentDate = new Date();
        const newTable = await tableCollection.insertOne({
          name: `table-${(await tableCollection.countDocuments()) + 1}`,
          createdAt: currentDate,
        });
        res.json({ message: "Table added successfully", newTable });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.delete("/api/delete-table/:name", async (req, res) => {
      try {
        const tableName = req.params.name;

        // Use MongoDB's deleteOne to remove the table by its name
        const result = await tableCollection.deleteOne({ name: tableName });

        // Check if the table was found and deleted
        if (result.deletedCount === 1) {
          return res.json({ message: "Table deleted successfully" });
        } else {
          return res.status(404).json({ error: "Table not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //drinks and juice api
    app.get("/api/get-drinks-juices", async (req, res) => {
      try {
        // Fetch the sorted list of items alphabetically
        const sortedItems = await DrinksAndJuiceCollection.find({})
          .sort({ item_name: 1 })
          .toArray();

        res.json({
          message: "Items retrieved successfully",
          items: sortedItems,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/api/add-drinks-juices", async (req, res) => {
      const { item_name, item_price } = req.body;
      const formattedItemName = item_name.replace(/\s+/g, "-").toLowerCase();
      const createdDate = new Date();

      try {
        // Check if a document with the same generic name already exists
        const existingItem = await DrinksAndJuiceCollection.findOne({
          item_name: formattedItemName,
        });

        if (existingItem) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Item name already exists");
        }

        // If no duplicate exists, insert the new document
        const newItem = {
          item_name: formattedItemName,
          item_price,
          createdDate,
        };

        const result = await DrinksAndJuiceCollection.insertOne(newItem);
        res.json({
          message: "Item added successfully",
        });
      } catch (error) {
        console.error("Database Insertion Error:", error);
        res.status(500).send("Error inserting data into the database");
      }
    });
    app.delete("/api/delete-drinks-juices/:id", async (req, res) => {
      try {
        const itemId = req.params.id;

        // Check if the provided ID is a valid ObjectId
        if (!ObjectId.isValid(itemId)) {
          return res.status(400).json({ error: "Invalid Item ID" });
        }

        // Use MongoDB's deleteOne to remove the fast food item by its ID
        const result = await DrinksAndJuiceCollection.deleteOne({
          _id: new ObjectId(itemId),
        });

        // Check if the item was found and deleted
        if (result.deletedCount === 1) {
          return res.json({ message: "Fast food item deleted successfully" });
        } else {
          return res.status(404).json({ error: "Fast food item not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    // fast food api
    app.get("/api/get-fast-food", async (req, res) => {
      try {
        // Fetch the sorted list of items alphabetically
        const sortedItems = await FastFoodCollection.find({})
          .sort({ item_name: 1 })
          .toArray();

        res.json({
          message: "Items retrieved successfully",
          items: sortedItems,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.post("/api/add-fast-food", async (req, res) => {
      const { item_name, item_price } = req.body;
      const formattedItemName = item_name.replace(/\s+/g, "-").toLowerCase();
      const createdDate = new Date();

      try {
        // Check if a document with the same generic name already exists
        const existingItem = await FastFoodCollection.findOne({
          item_name: formattedItemName,
        });

        if (existingItem) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Item name already exists");
        }

        // If no duplicate exists, insert the new document
        const newItem = {
          item_name: formattedItemName,
          item_price,
          createdDate,
        };

        const result = await FastFoodCollection.insertOne(newItem);
        res.json({
          message: "Item added successfully",
        });
      } catch (error) {
        console.error("Database Insertion Error:", error);
        res.status(500).send("Error inserting data into the database");
      }
    });

    app.delete("/api/delete-fast-food/:id", async (req, res) => {
      try {
        const itemId = req.params.id;

        // Check if the provided ID is a valid ObjectId
        if (!ObjectId.isValid(itemId)) {
          return res.status(400).json({ error: "Invalid Item ID" });
        }

        // Use MongoDB's deleteOne to remove the fast food item by its ID
        const result = await FastFoodCollection.deleteOne({
          _id: new ObjectId(itemId),
        });

        // Check if the item was found and deleted
        if (result.deletedCount === 1) {
          return res.json({ message: "Fast food item deleted successfully" });
        } else {
          return res.status(404).json({ error: "Fast food item not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // vegetables and rice api
    app.get("/api/get-vegetables-rices", async (req, res) => {
      try {
        // Fetch the sorted list of items alphabetically
        const sortedItems = await VegetablesAndRicesCollection.find({})
          .sort({ item_name: 1 })
          .toArray();

        res.json({
          message: "Items retrieved successfully",
          items: sortedItems,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.post("/api/add-vegetables-rices", async (req, res) => {
      const { item_name, item_price } = req.body;
      const formattedItemName = item_name.replace(/\s+/g, "-").toLowerCase();
      const createdDate = new Date();

      try {
        // Check if a document with the same generic name already exists
        const existingItem = await VegetablesAndRicesCollection.findOne({
          item_name: formattedItemName,
        });

        if (existingItem) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Item name already exists");
        }

        // If no duplicate exists, insert the new document
        const newItem = {
          item_name: formattedItemName,
          item_price,
          createdDate,
        };

        const result = await VegetablesAndRicesCollection.insertOne(newItem);
        res.json({
          message: "Item added successfully",
        });
      } catch (error) {
        console.error("Database Insertion Error:", error);
        res.status(500).send("Error inserting data into the database");
      }
    });
    app.delete("/api/delete-vegetables-rices/:id", async (req, res) => {
      try {
        const itemId = req.params.id;

        // Check if the provided ID is a valid ObjectId
        if (!ObjectId.isValid(itemId)) {
          return res.status(400).json({ error: "Invalid Item ID" });
        }

        // Use MongoDB's deleteOne to remove the fast food item by its ID
        const result = await VegetablesAndRicesCollection.deleteOne({
          _id: new ObjectId(itemId),
        });

        // Check if the item was found and deleted
        if (result.deletedCount === 1) {
          return res.json({ message: "Fast food item deleted successfully" });
        } else {
          return res.status(404).json({ error: "Fast food item not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food republic server is running");
});
app.listen(port, () => {
  console.log(`Food republic Server is running on port, ${port}`);
});
