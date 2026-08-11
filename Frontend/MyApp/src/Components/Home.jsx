import React from "react";
import ChatSection from "./Skeleton/ChatSection";
import Nav from "./Skeleton/Nav.jsx";

const Home = () => {
    return (
        <div className="h-screen w-full overflow-hidden bg-[#080b16] flex flex-col">
            
            {/* Navbar */}
            <div className="shrink-0">
                <Nav />
            </div>

            {/* Chat Section */}
            <main className="flex-1 min-h-0 overflow-hidden">
                <ChatSection />
            </main>

        </div>
    );
};

export default Home;