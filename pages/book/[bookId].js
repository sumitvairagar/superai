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
  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          SEO Title and meta description
        </div>
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
          <div className="mt-2">{props.metaDescription}</div>
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Keywords
        </div>
        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, i) => (
            <div key={i} className="p-2 rounded-full bg-slate-800 text-white ">
              <FontAwesomeIcon icon={faHashtag}></FontAwesomeIcon>
              {keyword}
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Blog book
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: props.bookContent || "" }}
        ></div>
        <div className="my-4">
          {!showDeleteConfirm && (
            <button
              className="btn bg-red-600 hover:bg-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete book
            </button>
          )}
          {!!showDeleteConfirm && (
            <div>
              <p className="p-2 bg-red-300 text-center">
                Are you sure you want to delete this book? This action is
                irreversible
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn bg-stone-600 hover:bg-stone-700"
                >
                  cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn bg-red-600 hover:bg-red-700"
                >
                  confirm delete
                </button>
              </div>
            </div>
          )}
        </div>
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
        metaDescription: book.metaDescription,
        keywords: book.keywords,
        bookCreatedTime: book.created,
        ...appProps,
      },
    };
  },
});
