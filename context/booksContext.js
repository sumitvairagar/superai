import { useRouter } from "next/router";
import React, { useCallback, useReducer, useState } from "react";

const BooksContext = React.createContext({});

export default BooksContext;

function booksReducer(state, action) {
  switch (action.type) {
    case "addBooks": {
      const newBooks = [...state];
      action.books.forEach((book) => {
        const exists = newBooks.find((p) => p._id === book._id);
        if (!exists) {
          newBooks.push(book);
        }
      });
      return newBooks;
    }
    case "deleteBook": {
      const newBooks = [];
      state.forEach((book) => {
        if (book._id !== action.bookId) {
          newBooks.push(book);
        }
      });
      return newBooks;
    }
    default:
      return state;
  }
}

export const BooksProvider = ({ children }) => {
  const [books, dispatch] = useReducer(booksReducer, []);
  const [noMoreBooks, setNoMoreBooks] = useState(false);

  const deleteBook = useCallback((bookId) => {
    dispatch({
      type: "deleteBook",
      bookId,
    });
  }, []);

  const setBooksFromSSR = useCallback((booksFromSSR = []) => {
    dispatch({
      type: "addBooks",
      books: booksFromSSR,
    });
  }, []);

  const getBooks = useCallback(
    async ({ lastBookDate, getNewerBooks = false }) => {
      const result = await fetch(`/api/getBooks`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ lastBookDate, getNewerBooks }),
      });
      const json = await result.json();
      const booksResult = json.books || [];
      if (booksResult.length < 5) {
        setNoMoreBooks(true);
      }
      dispatch({
        type: "addBooks",
        books: booksResult,
      });
    },
    []
  );

  return (
    <BooksContext.Provider
      value={{ books, setBooksFromSSR, getBooks, noMoreBooks, deleteBook }}
    >
      {children}
    </BooksContext.Provider>
  );
};
