import { Outlet } from "react-router-dom";
import Nav from "./Nav.jsx";
import "../styles/Header.css";

export default function Header() {
  return (
    <>
      <h1>Welcome to Lottie's Minefield App</h1>
      <Nav />
      <Outlet />
    </>
  );
}
