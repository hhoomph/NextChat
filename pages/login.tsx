import React, { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import fetchData from "../utils/fetchData";
import { login } from "../utils/auth";
export default function Login() {
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");
    const response = await fetchData("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: userName,
        password: password,
      }),
    });
    if (response?.status === 200) {
      const { token } = response;
      login(token, remember);
    } else if (response?.status === 404) {
      // setFieldError("username", "No such user exists.");
      setErrors(response?.message);
    } else if (response?.status === 401) {
      // setFieldError("password", "Incorrect password.");
      setErrors(response?.message);
    } else {
      // console.log("Login failed.");
      // https://github.com/developit/unfetch#caveats
      // let error = new Error(response.statusText);
      // error.response = response;
      setErrors(response?.message);
      throw response;
    }
  };
  return (
    <Layout title="ورود">
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
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
              />
              <label htmlFor="username">نام کاربری</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
              <label htmlFor="password">رمز عبور</label>
            </div>
            <div className="mb-3">
              <input type="checkbox" className="form-check-input" id="remember" checked={remember} onChange={() => setRemember(!remember)} />
              <label className="form-check-label me-2" htmlFor="remember">
                بخاطر سپردن
              </label>
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-success">
                ورود
              </button>
              <div className="update mx-auto mb-2">
                <br />
                ثبت نام نکردی؟
                <Link href="/register">
                  <a> ثبت نام </a>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}