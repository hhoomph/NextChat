import { NextPageContext } from "next";
import Layout from "../components/Layout";
interface code {
  statusCode: number | string | undefined;
}
const Error = ({ statusCode }: code) => {
  return (
    <Layout title="خطا">
      <div className="container justify-content-center mt-5 mb-5 p-5">
        <h3 className="text-center">{statusCode ? `An error ${statusCode} occurred on server` : "An error occurred on client"}</h3>
      </div>
    </Layout>
  );
};
Error.getInitialProps = ({ res, err }: NextPageContext): code => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
export default Error;