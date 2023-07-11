import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import AppLayout from "../../components/app_layout/AppLayout";

export default function NewPost(props) {
    console.log(props)
    return <div>
      <h1>This is the New Post page</h1>
    </div>;
  }

NewPost.getLayout = function getLayout(page, pageProps){
    return <AppLayout {...pageProps}>{page}</AppLayout>
};

export const getServerSideProps = withPageAuthRequired(() =>{
    return {};
});