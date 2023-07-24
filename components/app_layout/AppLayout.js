import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "../logo";
import { useContext, useEffect } from "react";
import BooksContext from "../../context/booksContext";

export default function AppLayout({
  children,
  availableTokens,
  books: booksFromSSR,
  selectedBookId,
  bookCreatedTime,
}) {
  const { user } = useUser();

  const { setBooksFromSSR, books, getBooks, noMoreBooks } =
    useContext(BooksContext);

  useEffect(() => {
    setBooksFromSSR(booksFromSSR);
    if (selectedBookId) {
      const exists = booksFromSSR.find((book) => book._id === selectedBookId);
      if (!exists) {
        getBooks(bookCreatedTime, true);
      }
    }
  }, [
    booksFromSSR,
    setBooksFromSSR,
    selectedBookId,
    bookCreatedTime,
    getBooks,
  ]);

  console.log("Total Tokens: " + availableTokens);
  return (
    <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
      <div className="flex flex-col text-white overflow-hidden">
        <div className="bg-slate-800 px-2">
          <Logo></Logo>
          <Link href={"/book/new"} className="btn">
            New Book
          </Link>
          <Link href={"/token-topup"} className="block mt-2 text-center ">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
            <span className="pl-2"> {availableTokens} tokens</span>
          </Link>
        </div>
        <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800">
          {books.map((book) => (
            <Link
              key={book._id}
              href={`/book/${book._id}`}
              className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                selectedBookId === book._id ? "bg-white/20 border-white" : ""
              }`}
            >
              {book.topic}
            </Link>
          ))}
          {!noMoreBooks && (
            <div
              onClick={() => getBooks(books[books.length - 1]?.created)}
              className="hover:underline text-sm text-slate-400 text-center cursor-pointer mt-4"
            >
              Load more {books[books.length - 1]?.created}{" "}
            </div>
          )}
        </div>
        <div className="bg-cyan-800 flex items-center gap-2 border-t border-t-black/50 h-20 px-2">
          {user ? (
            <>
              <div className="min-w-[50px]">
                <Image
                  src={user.picture}
                  alt={"username"}
                  height={50}
                  width={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">{user.email}</div>
                <Link className="text-sm" href={"/api/auth/logout"}>
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <Link href={"/api/auth/login"}>Login</Link>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
