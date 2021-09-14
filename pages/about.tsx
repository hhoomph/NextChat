import Layout from "../components/Layout";
const AboutPage = () => (
  <Layout title="About | NextChat">
    <div className="row justify-content-center">
      <h1 className="text-center">درباره ما</h1>
      <div className="col-sm-12 col-md-8 col-lg-9">
        <h4>پروژه چت</h4>
        <p>پروژه چت پیاده سازی شده با React , Nextjs, Socket.io و MongoDB و WebRTC.</p> <br />
        <h5>امکانات : </h5>
        <ul>
          <li>امکان ثبت نام و لاگین</li>
          <li>قابلیت جستجوی کاربران</li>
          <li>امکان چت همزمان</li>
          <li>امکان مکالمه صوتی و تصویری</li>
          <li>ذخیره پیام ها و دریافت آن ها در حالت آفلاین</li>
          <li>نمایش وضعیت آنلاین و آفلاین</li>
          <li>قابلیت استفاده از emoji</li>
        </ul>
        <small className="text-muted">
          طراحی و پیاده سازی توسط
          <a className="footerColor" href="mailto:hh.oomph@gmail.com">
            {" "}
            H.H{" "}
          </a>
        </small>
      </div>
    </div>
  </Layout>
);
export default AboutPage;