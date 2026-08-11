import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Registration from "./Components/Registration";
import Login from "./Components/Login.jsx";
import Home from "./Components/Home.jsx";
import Profile from "./Components/Profile.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
};




export default App;