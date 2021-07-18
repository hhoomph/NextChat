import fetch from "isomorphic-unfetch";
import { logout } from "./auth";
interface FetchOptions {
  method?: string;
  headers?: fetch.IsomorphicHeaders;
  body?: fetch.IsomorphicBody;
  response?: fetch.IsomorphicResponse;
  request?: fetch.IsomorphicRequest;
}
interface Error {
  name: string;
  message: string;
  stack?: string;
  res?: fetch.IsomorphicResponse;
  code?: string;
  status?: number | null;
}
const fetchData = async (path: string, opts: FetchOptions = {}, token: string | null = null, isFile: boolean = false): Promise<any> => {
  const headers = opts.headers || {};
  if (token === null || token === undefined) {
    //return false;
  } else {
    headers.Authorization = `Bearer ${token}`;
    // headers.Authorization = token;
  }
  if (isFile) {
    // headers.Accept = "text/plain";
    // headers["Content-Type"] = "multipart/form-data";
  } else {
    headers.Accept = "application/json";
    headers["Content-Type"] = "application/json;charset=utf-8";
  }
  headers["Access-Control-Allow-Origin"] = "*";
  const baseUrl = process.env.NODE_ENV !== "production" ? process.env.Debug_HOST : process.env.API_HOST;
  const url = baseUrl + path;
  let res;
  let data;
  let error;
  try {
    res = await fetch(url, {
      ...opts,
      headers,
      credentials: "include",
    });
    if (res?.status === 403) {
      // We need to log out here
      return logout();
    }
    if (res?.status === 500) {
      return { status: 500, error: "متاسفانه خطایی رخ داده است. لطفا دوباره امتحان کنید.", message: "متاسفانه خطایی رخ داده است. لطفا دوباره امتحان کنید." };
    }
    data = await res.json();
    data.status = res.status;
    // if (res?.status < 200 || res?.status >= 300) {
    //   if (res.headers.get("Content-Type") === "application/json") {
    //     data = await res.json();
    //     // let error: Error;
    //     // error = new Error(data.error === null ? "Unexpected Error" : data.error.message);
    //     // error.res = res;
    //     // error.status = res.status;
    //     // error.code = data.error === null ? res.status : data.error.code;
    //   } else {
    //     throw new Error("خطایی در شبکه رخ داده است");
    //   }
    // } else {
    //   data = await res.json();
    //   if (data.StatusCode == 6) {
    //     // We need to log out here
    //     //return Logout();
    //   }
    // }
  } catch (error2) {
    let error: Error;
    error = new Error(`خطایی در اتصال به سرور رخ داده است، لطفا بعدا امتحان کنید (${url})`);
    error.code = "network_error";
    error.res = null;
    error.status = null;
  }
  if (error) return error;
  return data;
};
// Usage Example
// const { token } = nextCookie(ctx);
// const allCategories = await fetchData(
//   "Common/C_Category/GetAllParentAsync",
//   {
//     method: "GET",
//   },
//   token
// );
export default fetchData;