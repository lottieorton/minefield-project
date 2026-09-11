import "./App.css";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Header from "./components/Header.js";
import Home from "./components/Home.js";
import GameSelection from "./components/GameSelection.js";
import Register from "./components/Register.js";
import Login from "./components/Login.js";
import ScorePage from "./components/ScorePage.js";
import Profile from "./components/Profile.js";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Header />}>
        <Route index element={<Home />} />
        <Route path="game" element={<GameSelection />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="scores" element={<ScorePage />} />
        <Route path="profile" element={<Profile />} />
      </Route>,
    ),
  );

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
