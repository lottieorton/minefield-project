import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";
import App from "../App.jsx";

jest.mock("../components/Header.jsx", () => {
  const { Outlet } = require("react-router-dom");
  const HeaderComponent = () => {
    return (
      <div data-testid="mockHeaderComponent">
        Mock Header Component
        <Outlet />
      </div>
    );
  };
  return {
    __esModule: true,
    default: HeaderComponent,
    Header: HeaderComponent,
  };
});
jest.mock("../components/Home.jsx", () => ({
  __esModule: true,
  //Handles import Home from
  default: () => <div data-testid="mockHomeComponent">Mock Home Component</div>,
  //handles import { Home } from
  Home: () => <div data-testid="mockHomeComponent">Mock Home Component</div>,
}));
jest.mock("../components/GameSelection.jsx", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mockGameSelectionComponent">
      Mock GameSelection Component
    </div>
  ),
  GameSelection: () => (
    <div data-testid="mockGameSelectionComponent">
      Mock GameSelection Component
    </div>
  ),
}));
jest.mock("../components/Register.jsx", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mockRegisterComponent">Mock Register Component</div>
  ),
  Register: () => (
    <div data-testid="mockRegisterComponent">Mock Register Component</div>
  ),
}));
jest.mock("../components/Login.jsx", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mockLoginComponent">Mock Login Component</div>
  ),
  Login: () => <div data-testid="mockLoginComponent">Mock Login Component</div>,
}));
jest.mock("../components/Profile.jsx", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mockProfileComponent">Mock Profile Component</div>
  ),
  Profile: () => (
    <div data-testid="mockProfileComponent">Mock Profile Component</div>
  ),
}));

describe("App component routing", () => {
  it('renders the Header and Home component on the root path "/" ', async () => {
    //arrange
    const MockHeader = require("../components/Header.jsx").Header;
    const MockHome = require("../components/Home.jsx").Home;
    const MockGameSelection =
      require("../components/GameSelection.jsx").GameSelection;
    //create a router for this test
    const testRouter = createMemoryRouter(
      createRoutesFromElements([
        <Route path="/" element={<MockHeader />}>
          <Route index element={<MockHome />} />
          <Route path="game" element={<MockGameSelection />} />
        </Route>,
      ]),
      { initialEntries: ["/"] },
    ); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId("mockHeaderComponent");
      const homeComponent = screen.getByTestId("mockHomeComponent");
      expect(headerComponent).toBeInTheDocument();
      expect(homeComponent).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("mockGameSelectionComponent"),
    ).not.toBeInTheDocument();
  });

  it('renders the Header and GameSelection component on the path "/game" ', async () => {
    //arrange
    const MockHeader = require("../components/Header.jsx").Header;
    const MockHome = require("../components/Home.jsx").Home;
    const MockGameSelection =
      require("../components/GameSelection.jsx").GameSelection;
    //create a router for this test
    const testRouter = createMemoryRouter(
      createRoutesFromElements([
        <Route path="/" element={<MockHeader />}>
          <Route index element={<MockHome />} />
          <Route path="game" element={<MockGameSelection />} />
        </Route>,
      ]),
      { initialEntries: ["/game"] },
    ); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId("mockHeaderComponent");
      const gameSelectionComponent = screen.getByTestId(
        "mockGameSelectionComponent",
      );
      expect(headerComponent).toBeInTheDocument();
      expect(gameSelectionComponent).toBeInTheDocument();
    });
    expect(screen.queryByTestId("mockHomeComponent")).not.toBeInTheDocument();
  });

  it('renders the Header and Register component on the path "/register" ', async () => {
    //arrange
    const MockHeader = require("../components/Header.jsx").Header;
    const MockHome = require("../components/Home.jsx").Home;
    const MockRegister = require("../components/Register.jsx").Register;
    //create a router for this test
    const testRouter = createMemoryRouter(
      createRoutesFromElements([
        <Route path="/" element={<MockHeader />}>
          <Route index element={<MockHome />} />
          <Route path="register" element={<MockRegister />} />
        </Route>,
      ]),
      { initialEntries: ["/register"] },
    ); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId("mockHeaderComponent");
      const registerComponent = screen.getByTestId("mockRegisterComponent");
      expect(headerComponent).toBeInTheDocument();
      expect(registerComponent).toBeInTheDocument();
    });
    expect(screen.queryByTestId("mockHomeComponent")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mockLoginComponent")).not.toBeInTheDocument();
  });

  it('renders the Header and Login component on the path "/login" ', async () => {
    //arrange
    const MockHeader = require("../components/Header.jsx").Header;
    const MockHome = require("../components/Home.jsx").Home;
    const MockLogin = require("../components/Login.jsx").Login;
    //create a router for this test
    const testRouter = createMemoryRouter(
      createRoutesFromElements([
        <Route path="/" element={<MockHeader />}>
          <Route index element={<MockHome />} />
          <Route path="login" element={<MockLogin />} />
        </Route>,
      ]),
      { initialEntries: ["/login"] },
    ); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId("mockHeaderComponent");
      const loginComponent = screen.getByTestId("mockLoginComponent");
      expect(headerComponent).toBeInTheDocument();
      expect(loginComponent).toBeInTheDocument();
    });
    expect(screen.queryByTestId("mockHomeComponent")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("mockRegisterComponent"),
    ).not.toBeInTheDocument();
  });

  it('renders the Header and Profile component on the path "/profile" ', async () => {
    //arrange
    const MockHeader = require("../components/Header.jsx").Header;
    const MockHome = require("../components/Home.jsx").Home;
    const MockProfile = require("../components/Profile.jsx").Profile;
    //create a router for this test
    const testRouter = createMemoryRouter(
      createRoutesFromElements([
        <Route path="/" element={<MockHeader />}>
          <Route index element={<MockHome />} />
          <Route path="profile" element={<MockProfile />} />
        </Route>,
      ]),
      { initialEntries: ["/profile"] },
    ); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId("mockHeaderComponent");
      const profileComponent = screen.getByTestId("mockProfileComponent");
      expect(headerComponent).toBeInTheDocument();
      expect(profileComponent).toBeInTheDocument();
    });
    expect(screen.queryByTestId("mockHomeComponent")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("mockRegisterComponent"),
    ).not.toBeInTheDocument();
  });

  it("renders the RouterProvider element", async () => {
    //arrange
    //action
    render(<App />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId("mockHeaderComponent");
      const homeComponent = screen.getByTestId("mockHomeComponent");
      expect(headerComponent).toBeInTheDocument();
      expect(homeComponent).toBeInTheDocument();
      expect(
        screen.queryByTestId("mockGameSelectionComponent"),
      ).not.toBeInTheDocument();
    });
  });
});

describe("API_BASE_URL logic", () => {
  const actualNodeEnv = process.env.NODE_ENV;
  beforeEach(() => {
    jest.resetModules(); //to clear cache
  });

  afterAll(() => {
    process.env.NODE_ENV = actualNodeEnv; // restore original env var
  });

  it("should return the env URL when provided", () => {
    //arrange
    process.env.REACT_APP_API_BASE_URL = "http://localhost:5000";
    const { API_BASE_URL } = require("../App.jsx");
    //assert
    expect(API_BASE_URL).toBe("http://localhost:5000");
    //cleanup
    delete process.env.REACT_APP_API_BASE_URL;
  });

  it("should return the default URL when there is no env URL", () => {
    //arrage
    const { API_BASE_URL } = require("../App.jsx");
    //assert
    expect(API_BASE_URL).toBe("http://localhost:4001");
  });
});
