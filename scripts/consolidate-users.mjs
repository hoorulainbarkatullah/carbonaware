import { MongoClient } from "mongodb";

const uri = "mongodb+srv://hoorulainbarkatullah_db_user:3q3ulZ49cd3spmqI@cluster0.oxyerid.mongodb.net/carbon_aware?retryWrites=true&w=majority&appName=Cluster0";

async function consolidateUserCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("carbon_aware");

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log("Current MongoDB collections:", collectionNames);

    if (collectionNames.includes("User")) {
      const legacyUsers = await db.collection("User").find({}).toArray();
      console.log(`Found ${legacyUsers.length} document(s) in legacy 'User' collection.`);

      for (const u of legacyUsers) {
        const existingInUsers = await db.collection("users").findOne({ email: u.email });
        if (!existingInUsers) {
          await db.collection("users").insertOne(u);
          console.log(`Migrated user '${u.email}' from 'User' to 'users' collection.`);
        }
      }

      // Drop the legacy 'User' collection to leave 'users' as single source of truth
      await db.collection("User").drop();
      console.log("Successfully dropped legacy 'User' collection!");
    } else {
      console.log("Legacy 'User' collection not found or already consolidated into 'users'.");
    }
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.close();
  }
}

consolidateUserCollections();
