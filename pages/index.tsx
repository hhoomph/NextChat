// import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
// import { useRouter } from "next/router";
const IndexPage = () => {
  // const router = useRouter();
  return (
    <Layout title="NextChat">
      <div className="row">
        <div className="col g-3">
          <h2 className="title text-center">چت خصوصی</h2>
          <h1 className="title text-center"> 💛 👫 🥳 💬 😷 💛 </h1> <br /><br />
          <div className="text-center">
            <p className="lead">اول ثبت نام کن، بعدش چت کن</p>
            <p className="lead">میتونی از قسمت جستجو برای پیدا کردن دوست استفاده کنی</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default IndexPage;
// Export the `session` prop to use sessions with Server Side Rendering
// export const getServerSideProps: GetServerSideProps<{
//   session: Session | null;
// }> = async (context) => {
//   const { req, res } = context;
//   return {
//     props: {
//       session: session,
//     },
//   };
// };