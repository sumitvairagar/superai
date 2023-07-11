import AppLayout from "../components/app_layout/AppLayout";
export default function TokenTopup() {
  return (
    <div>
      <h1>This is the New TokenTopup page</h1>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};
