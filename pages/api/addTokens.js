// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const { user } = await getSession(req, res);

  const client = await clientPromise;
  const db = client.db("SuperAi");
  const userProfile = await db.collection("users").updateOne(
    {
      auth0Id: user.sub,
    },
    {
      $inc: {
        availableTokens: 10,
      },
      $setOnInsert: {
        auth0Id: user.sub,
      },
    },
    {
      upsert: true,
    }
  );
  res.status(200).json({ name: "John Doe" });
}
