import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function getBooks(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("SuperAi");
    const userProfile = await db
      .collection("users")
      .findOne({ auth0Id: user.sub });

    const { lastBookDate, getNewerBooks } = req.body;

    const books = await db
      .collection("books")
      .find({
        created: {
          [getNewerBooks ? "$gte" : "$lt"]: Number(lastBookDate),
        },
        userId: userProfile._id,
      })
      .limit(getNewerBooks ? 0 : 5)
      .sort({ created: -1 })
      .toArray();

    console.log("POST ON SERVER", books);
    res.status(200).json({ books });
    return res;
  } catch (e) {
    console.log("ERROR IN GET POST", e);
    return res.status(500).json({ error: e });
  }
});
