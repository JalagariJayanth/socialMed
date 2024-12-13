import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Login from "./Components/Login";
import Feeds from "./Components/Feeds";
import Profile from "./Components/Profile";
import EditProfile from "./Components/EditProfile";
import CreatePost from "./Components/CreatePost";

function App() {
  return (
    <BrowserRouter>
      <div className="background-container">
        <div className="main-container">
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route path="/feeds" element={<Feeds />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/editProfile" element={<EditProfile />} />
            <Route path="/createPost" element={<CreatePost />}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
