import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import CreatePost from "./pages/CreateEditPost";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import Landing from "./pages/Landing";
import Posts from "./pages/Posts";
import ViewPost from "./pages/ViewPost";
import "./auth/create-admin";
import "react-toastify/dist/ReactToastify.css";
import { collection, getDocs } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import Admin from "./pages/Admin";

function App() {
  const AUTO_LOGOUT_TIME = 60 * 30 * 1000; // 30 min
  const [isAuth, setIsAuth] = useState(() => {
    const storedAuth = localStorage.getItem("isAuth");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });
  const [isAdmin, setisAdmin] = useState(false);
  const uid = localStorage.getItem("uid") || "";
  const [loading, setLoading] = useState(true); // Add loading state

  const Unauthorized = () => {
    toast.error("Unauthorized!!!", {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/";
    });
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const userDocRef = collection(db, "users");
      const getUser = await getDocs(userDocRef);
      getUser.forEach((doc) => {
        if (doc.data().id === uid) {
          if (doc.data().isAdmin === true) {
            setisAdmin(true);
          }
        }
      });
      setLoading(false); // Set loading to false when check is completed
    };
    checkAdmin();
  }, [uid]);

  useEffect(() => {
    let timer;
    const handleUserActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => signUserOut(), AUTO_LOGOUT_TIME);
    };
    document.addEventListener("mousemove", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);

    return () => {
      document.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
    };
  }, [AUTO_LOGOUT_TIME]);

  if (loading) {
    return <div></div>; // Render loading state while checking admin status
  }

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {!isAuth ? (
          <Link to="/login">Login</Link>
        ) : (
          <>
            <Link to="/posts">Post</Link>
            {isAdmin && (
              <>
                <Link to="/createpost">Create Post</Link>
                <Link to="/admindashboard">Admin</Link>
              </>
            )}
            <Link onClick={signUserOut}>Log Out</Link>
          </>
        )}
      </nav>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Landing isAuth={isAuth} />} />
        <Route
          path="/posts"
          element={<Posts isAuth={isAuth} isAdmin={isAdmin} />}
        />
        <Route path="/view" element={<ViewPost />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        {isAdmin ? (
          <>
            <Route
              path="/createpost"
              element={<CreatePost isAuth={isAuth} />}
            />
            <Route
              path="/admindashboard"
              element={<Admin isAuth={isAuth} />}
            />
          </>
        ) : (
          <Route path="/createpost" element={<Unauthorized />} />
        )}
      </Routes>
    </>
  );
}

export default App;
