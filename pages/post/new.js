import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import AppLayout from "../../components/app_layout/AppLayout";
import { use, useState } from "react";
import { useRouter } from "next/router";
import { getAppProps } from "../../utils/getAppProps";

export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/generatePost", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ topic, keywords }),
    });
    const json = await response.json();
    console.log("RESULT", json);
    if (json?.postId) {
      router.push(`/post/${json.postId}`);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <strong>Topic</strong>
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
          ></textarea>
        </div>
        <div>
          <label>
            <strong>Keywords</strong>
          </label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm"
          ></textarea>
        </div>
        <button className="btn" type="submit">
          Generate Post
        </button>
      </form>
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = getAppProps(ctx);
    return {
      props,
    };
  },
});
