import React, { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import fetchData from "../utils/fetchData";
import { login, verifyToken } from "../utils/auth";
import { useUser } from "../contexts/UserContext";
export default function Register() {
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [userName, setUserName] = useState("");
  const [errors, setErrors] = useState("");
  const { setCurrentUser } = useUser();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");
    if (password != retypePassword) {
      // setFieldError("retypePassword", "Oops, your passwords don't match!");
      setErrors("رمز عبور با تکرار آن مطابقت ندارد.");
    } else {
      const response = await fetchData("/api/register", {
        method: "POST",
        body: JSON.stringify({ password: password, username: userName }),
      });
      if (response?.status === 200) {
        const { token } = response;
        login(token, false);
        const profile = verifyToken(token.toString());
        setCurrentUser(profile?.user);
      } else if (response?.status === 409) {
        // setFieldError("username", "That username is already taken.");
        setErrors(response?.message);
      } else {
        console.log("Registration failed.");
        // https://github.com/developit/unfetch#caveats
        // let error = new Error(response.statusText);
        // error.response = response;
        setErrors(response?.message);
        // throw response;
      }
    }
  };
  return (
    <Layout title="ثبت نام">
      <div className="container">
        <div className="row justify-content-center">
          {errors && (
            <div className="justify-content-center col-md-8 mt-5 gx-5">
              <div className="alert alert-warning d-flex align-items-center mb-0" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                  <use xlinkHref="#exclamation-triangle-fill" />
                </svg>
                <div>{errors}</div>
              </div>
            </div>
          )}
          <form className="col-md-8 g-5" onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="نام کاربری"
                aria-describedby="usernameHelp"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
              />
              <label htmlFor="username">نام کاربری</label>
              <div id="usernameHelp" className="form-text">
                نام کاربری نباید تکراری باشد.
              </div>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="رمز عبور"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
              <label htmlFor="password">رمز عبور</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control form-control-sm"
                id="retypepassword"
                placeholder="تکرار رمز عبور"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRetypePassword(e.target.value)}
              />
              <label htmlFor="retypepassword">تکرار رمز عبور</label>
            </div>
            {/* <div className="form-floating">
              <textarea className="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style="height: 100px"></textarea>
              <label htmlFor="floatingTextarea2">Comments</label>
            </div> */}
            <div className="text-center">
              <button type="submit" className="btn btn-primary">
                ثبت نام
              </button>
              <div className="update mx-auto mb-2">
                <br />
                قبلا ثبت نام کردی؟
                <Link href="/login">
                  <a> ورود </a>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}