import React, { useState } from "react";
import fetchData from "../utils/fetchData";
import jsCookie from "js-cookie";
import { useRouter } from "next/router";
import { User } from "../types/Types";
import { useReceiver } from "./../contexts/ReceiverContext";
type Props = {
  user?: User;
};
const Search = ({ user }: Props) => {
  const token = jsCookie.get("token");
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const currentUserId = user?._id;
  // const { receiverUser } = useReceiver();
  const { setReceiverUser } = useReceiver();
  const handleUserClick = (usr: User) => {
    setReceiverUser(usr);
    setSearch("");
  };
  const handleSearch = async (s = search) => {
    if (s.length >= 2) {
      setSearchUsers([]);
      const searchResult = await fetchData(
        `/api/users/search?q=${s}`,
        {
          method: "GET",
        },
        token
      );
      if (searchResult && searchResult?.status == 200 && searchResult?.users != undefined) {
        setSearchUsers(searchResult.users);
        // setSearchUsers(Object.entries(searchResult.users));
      }
      if (searchResult && searchResult?.status == 404) {
        // "کاربری با این نام پیدا نشد."
      }
    }
  };
  // useEffect(() => {
  //   handleSearch(search);
  // }, [search]);
  const showResult = searchUsers.map((usr) => {
    if (usr._id != currentUserId) {
      return (
        <button key={usr._id} type="button" className="list-group-item list-group-item-action user_btn mb-2" onClick={() => handleUserClick(usr)}>
          {usr.username}
        </button>
      );
    }
  });
  return (
    <>
      {router.pathname == "/chat" && (
        <form
          className="d-flex"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch;
          }}
        >
          <input
            className="form-control ms-2"
            type="search"
            placeholder="جستجو"
            aria-label="جستجو"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          <button className="btn btn-outline-warning" type="button" onClick={() => handleSearch}>
            جستجو
          </button>
        </form>
      )}
      {searchUsers.length > 0 && search.length > 0 && (
        <div className="search_result">
          <div className="list-group">{showResult}</div>
        </div>
      )}
      {search.length > 0 && searchUsers.length <= 0 && (
        <div className="search_result">
          <div className="list-group">
            <small className="mb-2 text-center">نتیجه ای یافت نشد.</small>
          </div>
        </div>
      )}
    </>
  );
};
export default Search;