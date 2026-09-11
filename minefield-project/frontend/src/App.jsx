import "./App.css";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import GameSelection from "./components/GameSelection.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import ScorePage from "./components/ScorePage.jsx";
import Profile from "./components/Profile.jsx";

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
