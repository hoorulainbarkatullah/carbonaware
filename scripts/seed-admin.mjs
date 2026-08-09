import { MongoClient } from "mongodb";
import crypto from "crypto";

const uri = "mongodb+srv://hoorulainbarkatullah_db_user:3q3ulZ49cd3spmqI@cluster0.oxyerid.mongodb.net/carbon_aware?retryWrites=true&w=majority&appName=Cluster0";

async function createAdminUser() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("carbon_aware");
    const usersCollection = db.collection("users");

    const email = "admin@gmail.com";
    const password = "admin";
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const existing = await usersCollection.findOne({ email });
    if (existing) {
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            passwordHash,
            role: "admin",
            name: "Admin User",
            updatedAt: new Date(),
          },
        }
      );
      console.log("Updated existing user admin@gmail.com to Admin role with password 'admin'");
    } else {
      const res = await usersCollection.insertOne({
        name: "Admin User",
        email,
        passwordHash,
        role: "admin",
        location: "Peshawar, KP",
        carbonGoal: 2.5,
        points: 2500,
        streak: 10,
        xp: 1500,
        level: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Successfully created new Admin user in MongoDB:", res.insertedId.toString());
    }
  } catch (err) {
    console.error("Error creating admin user:", err);
  } finally {
    await client.close();
  }
}

createAdminUser();
