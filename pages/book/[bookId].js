import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ObjectId } from "mongodb";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import AppLayout from "../../components/app_layout/AppLayout";
import BooksContext from "../../context/booksContext";
import clientPromise from "../../lib/mongodb";
import { getAppProps } from "../../utils/getAppProps";

export default function Book(props) {
  console.log("PROPS: ", props);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteBook } = useContext(BooksContext);

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/deleteBook`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ bookId: props.id }),
      });
      const json = await response.json();
      if (json.success) {
        deleteBook(props.id);
        router.replace(`/book/new`);
      }
    } catch (e) {}
  };

  // Parse the book content from JSON
  const bookContent = props.bookContent;

  return (
    <div className="px-8 py-6 w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-auto">
      <div className="flex justify-between items-center">
        <span className="font-light text-gray-600">
          {props.bookCreatedTime}
        </span>
        <div className="flex">
          {props.keywords &&
            props.keywords.split(",").map((keyword, i) => (
              <div key={i} className="text-sm font-medium text-blue-500 mr-2">
                <FontAwesomeIcon icon={faHashtag}></FontAwesomeIcon>
                {keyword}
              </div>
            ))}
        </div>
      </div>

      <div className="mt-2">
        <h1 className="text-2xl text-gray-700 font-bold hover:text-gray-600">
          {props.title}
        </h1>
        <p className="mt-2 text-gray-600">{props.description}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-gray-700 font-semibold">Intro:</h2>
        <div
          className="text-gray-600"
          dangerouslySetInnerHTML={{ __html: bookContent.intro }}
        ></div>

        <h2 className="text-gray-700 font-semibold mt-4">Preface:</h2>
        <div
          className="text-gray-600"
          dangerouslySetInnerHTML={{ __html: bookContent.preface }}
        ></div>

        <h2 className="text-gray-700 font-semibold mt-4">Chapters Total:</h2>
        {bookContent.chapters.map((chapter, index) => (
          <div key={index}>
            <div
              className="text-gray-700 font-semibold"
              dangerouslySetInnerHTML={{ __html: chapter.title }}
            ></div>
            <div
              className="text-gray-600"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            ></div>
          </div>
        ))}

        <h2 className="text-gray-700 font-semibold mt-4">Outro:</h2>
        <div
          className="text-gray-600"
          dangerouslySetInnerHTML={{ __html: bookContent.outro }}
        ></div>
      </div>

      <div className="flex justify-between items-center mt-4">
        {!showDeleteConfirm && (
          <button
            className="px-2 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete book
          </button>
        )}

        {!!showDeleteConfirm && (
          <div>
            <p className="p-2 bg-red-300 text-center">
              Are you sure you want to delete this book? This action is
              irreversible.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-2 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Book.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const appProps = await getAppProps(ctx);

    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("SuperAi");
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub,
    });
    const book = await db.collection("books").findOne({
      _id: new ObjectId(ctx.params.bookId),
      userId: user._id,
    });

    if (!book) {
      return {
        redirect: {
          destination: "/book/new",
          permanent: false,
        },
      };
    }

    return {
      props: {
        id: ctx.params.bookId,
        bookContent: book.bookContent,
        title: book.title,
        genre: book.genre,
        description: book.description,
        // keywords: book.keywords,
        bookCreatedTime: book.created,
        ...appProps,
      },
    };
  },
});
