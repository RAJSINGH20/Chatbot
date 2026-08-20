import React from "react";

import ChatSection from "./Skeleton/ChatSection";
import Nav from "./Skeleton/Nav.jsx";

const Home = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-[#080b16]">

            {/* Navbar */}
            <header className="shrink-0">
                <Nav />
            </header>

            {/* Chat Section */}
            <main className="min-h-0 flex-1 overflow-hidden">
                <ChatSection />
            </main>

        </div>
    );
};

export default Home;