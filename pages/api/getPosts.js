import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function getPosts(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("SuperAi");
    const userProfile = await db
      .collection("users")
      .findOne({ auth0Id: user.sub });

    const { lastPostDate } = req.body;

    const posts = await db
      .collection("posts")
      .find({
        created: {
          $lt: Number(lastPostDate),
        },
        userId: userProfile._id,
      })
      .limit(5)
      .sort({ created: -1 })
      .toArray();

    console.log("POST ON SERVER", posts);
    res.status(200).json({ posts });
    return res;
  } catch (e) {
    console.log("ERROR IN GET POST", e);
    return res.status(500).json({ error: e });
  }
});
