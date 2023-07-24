// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function generateBook(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("SuperAi");
  const userProfile = await db
    .collection("users")
    .findOne({ auth0Id: user.sub });

  if (!userProfile?.availableTokens) {
    res.status(403);
    return;
  }
  const { topic, keywords } = req.body;

  if (!topic || !keywords) {
    res.status(422);
    return;
  }

  if (topic.length > 80 || keywords.length > 80) {
    res.status(422);
    return;
  }
  /* const { topic, keywords } = req.body;
  //const topic = "Top 10 tips for dog owners";
  //const keywords =
  //"first time dog owners, common dog health issues, best dog breeds";
  const config = new Configuration({
    apiKey: process.env["OPENAI_APIKEY"],
  });
  const openai = new OpenAIApi(config);
  console.log("API KEY", process.env["OPENAI_APIKEY"]);
  // This is using Davinci
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    temperature: 0,
    max_tokens: 3600,
    prompt: `write a long and detailed seo-friendly blog book about ${topic}, that target the following comma-seperate keywords ${keywords}.
    The content should be formatted in seo-friendly HTML.
    The response must also include appropriate title and meta description content.
    The return format must be stringified JSON in the following format:
    {
        "bookContent": book content here
        "title": title goes here
        "metaDescription" meta description goes here
    }
    `,
  }); 

  const bookContentResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are a blog book generator",
      },
      {
        role: "user",
        content: `write a long and detailed seo-friendly blog book about ${topic}, that target the following comma-seperate keywords ${keywords}.
        The content should be formatted in seo-friendly HTML.
        limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i.`,
      },
    ],
  });

  const bookContent =
    bookContentResponse.data.choices[0].message?.content || "";

  const titleContentResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are a blog book generator",
      },
      {
        role: "user",
        content: `write a long and detailed seo-friendly blog book about ${topic}, that target the following comma-seperate keywords ${keywords}.
            The content should be formatted in seo-friendly HTML.
            limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i.`,
      },
      {
        role: "assistant",
        content: bookContent,
      },
      {
        role: "user",
        content: "Generate appropriate title tag text for the above blog",
      },
    ],
  });

  const metaDescriptionContentResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are a blog book generator",
      },
      {
        role: "user",
        content: `write a long and detailed seo-friendly blog book about ${topic}, that target the following comma-seperate keywords ${keywords}.
            The content should be formatted in seo-friendly HTML.
            limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i.`,
      },
      {
        role: "assistant",
        content: bookContent,
      },
      {
        role: "user",
        content:
          "Generate SEO-friendly meta description content for the above blog book",
      },
    ],
  });

  const title = titleContentResponse.data.choices[0].message?.content || "";
  const metaDescription =
    metaDescriptionContentResponse.data.choices[0].message?.content || "";

  res.status(200).json({
    bookContent,
    title,
    metaDescription,
  });*/
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

  const book = await db.collection("books").insertOne({
    bookContent: "Dummy Content",
    title: "Dummy Title",
    metaDescription: "Dummy Meta Description",
    topic,
    keywords,
    userId: userProfile._id,
    created: new Date().getTime(),
  });

  res.status(200).json({
    bookId: book.insertedId,
  });
});
