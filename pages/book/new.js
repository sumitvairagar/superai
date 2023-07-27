import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import AppLayout from "../../components/app_layout/AppLayout";

export default function NewBook(props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [totalChapters, setTotalChapters] = useState(8);
  const [wordsPerChapter, setWordsPerChapter] = useState(500);
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e) => {
    setGenerating(true);
    e.preventDefault();
    try {
      const response = await fetch("/api/book/generateBook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title,
          genre,
          description,
          totalChapters,
          wordsPerChapter,
        }),
      });
      const json = await response.json();
      if (json?.bookId) {
        router.push(`/book/${json.bookId}`);
      }
    } catch (e) {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-hidden">
      {generating && (
        <div className="text-green-500 flex h-full animate-pulse w-full flex-col justify-center items-center">
          <FontAwesomeIcon icon={faBook} className="text-8xl" />
          <h6>Generating...</h6>
        </div>
      )}

      {!generating && (
        <div className="w-full h-full flex flex-col overflow-auto ">
          <form
            onSubmit={handleSubmit}
            className="m-auto w-full max-w-screen-sm bg-gray-100 p-6 rounded-md shadow-xl border border-gray-300"
          >
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                maxLength={100}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700"
              >
                Genre
              </label>
              <input
                type="text"
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                maxLength={50}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                maxLength={500}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="totalChapters"
                className="block text-sm font-medium text-gray-700"
              >
                Total Chapters
              </label>
              <input
                type="number"
                id="totalChapters"
                value={totalChapters}
                onChange={(e) => {
                  // Limit the totalChapters between 8 and 16
                  const value = Math.min(Math.max(8, e.target.value), 16);
                  setTotalChapters(value);
                }}
                className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                min={8}
                max={16}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="wordsPerChapter"
                className="block text-sm font-medium text-gray-700"
              >
                Words per Chapter
              </label>
              <input
                type="number"
                id="wordsPerChapter"
                value={wordsPerChapter}
                onChange={(e) => {
                  // Limit the wordsPerChapter between 500 and 3000
                  const value = Math.min(Math.max(500, e.target.value), 3000);
                  setWordsPerChapter(value);
                }}
                className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                min={500}
                max={3000}
              />
            </div>
            <button
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="submit"
              disabled={!title.trim() || !genre.trim() || !description.trim()}
            >
              Create Book
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

NewBook.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    if (!props.availableTokens) {
      return {
        redirect: {
          destination: "/token-topup",
          permanent: false,
        },
      };
    }
    return {
      props,
    };
  },
});
