// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai";
import clientPromise from "../../../lib/mongodb";
import getHardCodedBook from "./hardcodedbook";

export default withApiAuthRequired(async function generateBook(req, res) {
  console.log("1");
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("SuperAi");
  const userProfile = await db
    .collection("users")
    .findOne({ auth0Id: user.sub });
  console.log("2");
  if (!userProfile?.availableTokens) {
    res.status(403);
    return;
  }

  const { title, genre, description, totalChapters, wordsPerChapter } =
    req.body;

  if (!title || !genre || !description || !totalChapters || !wordsPerChapter) {
    res.status(422);
    return;
  }

  if (title.length > 100 || genre.length > 50 || description.length > 500) {
    res.status(422);
    return;
  }
  console.log("3");
  if (
    totalChapters < 8 ||
    totalChapters > 16 ||
    wordsPerChapter < 500 ||
    wordsPerChapter > 3000
  ) {
    res.status(422);
    return;
  }
  try {
    //const bookContentResponse = await createBookUsingAi();

    //const bookContentText = bookContentResponse.data.choices[0].text || "";
    // Convert the book content text into a JSON object
    //const bookJSON = JSON.parse(bookContentText);
    console.log("4");
    const bookJSON = getHardCodedBook();
    console.log("5");
    // Save the book to the database
    const book = await db.collection("books").insertOne({
      title,
      genre,
      description,
      totalChapters,
      wordsPerChapter,
      bookContent: bookJSON,
      userId: userProfile._id,
      created: new Date().getTime(),
    });

    res.status(200).json({
      bookId: book.insertedId,
    });

    await db.collection("users").updateOne(
      {
        auth0Id: user.sub,
      },
      {
        $inc: {
          availableTokens: -1,
        },
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: `Internal server error ${e}` });
  }
});

async function createBookUsingAi() {
  const config = new Configuration({
    apiKey: process.env["OPENAI_APIKEY"],
  });
  const openai = new OpenAIApi(config);

  const bookFormatPrompt =
    "The content should be formatted in json text including fields Intro, Preface, Chapters, Outro, the Content in Chapters should be well formatted in html";

  // Generate book content using ChatGPT
  const bookContentResponse = await openai.createCompletion({
    model: "text-davinci-003",
    temperature: 0,
    max_tokens: totalChapters * wordsPerChapter,
    prompt: `write a book titled "${title}" in the ${genre} genre. The book should have ${totalChapters} chapters, and each chapter should be around ${wordsPerChapter} words. The book should be engaging and well-structured. ${bookFormatPrompt}`,
  });
  return bookContentResponse;
}
