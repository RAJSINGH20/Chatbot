import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Nav = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setOpen(false);
        navigate("/login");
    };

    return (
        <nav className="w-full h-16 bg-[#121110] border-b border-[#302d28] text-[#e8e3da]">

            <div className="h-full px-4 sm:px-6 flex items-center justify-between">

                {/* =========================
                    LOGO
                ========================== */}

                <Link
                    to="/"
                    className="flex items-center gap-3 group"
                >

                    {/* Logo */}
                    <div
                        className="
                            w-9
                            h-9
                            rounded-xl
                            bg-[#c47b45]
                            text-[#171614]
                            flex
                            items-center
                            justify-center
                            font-black
                            text-xs
                            shadow-lg
                            shadow-[#c47b45]/10
                            group-hover:scale-105
                            transition
                        "
                    >
                        AI
                    </div>

                    <div className="hidden sm:block">

                        <h1
                            className="
                                text-sm
                                font-semibold
                                text-[#eee8df]
                                leading-none
                            "
                        >
                            GPT
                        </h1>

                        <p
                            className="
                                text-[10px]
                                text-[#706960]
                                mt-1
                            "
                        >
                            Intelligent Assistant
                        </p>

                    </div>

                </Link>

                {/* =========================
                    RIGHT SIDE
                ========================== */}

                <div className="flex items-center gap-3">

                    {/* Status */}

                    <div
                        className="
                            hidden
                            md:flex
                            items-center
                            gap-2
                            px-3
                            py-2
                            rounded-full
                            border
                            border-[#302d28]
                            bg-[#191816]
                        "
                    >

                        <span
                            className="
                                w-1.5
                                h-1.5
                                rounded-full
                                bg-[#c47b45]
                                animate-pulse
                            "
                        />

                        <span
                            className="
                                text-[10px]
                                text-[#817970]
                                uppercase
                                tracking-wider
                            "
                        >
                            Online
                        </span>

                    </div>

                    {/* =========================
                        PROFILE
                    ========================== */}

                    <div className="relative hidden sm:block">

                        <button
                            onClick={() =>
                                setOpen(!open)
                            }
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-[#1c1a18]
                                border
                                border-[#403a33]
                                flex
                                items-center
                                justify-center
                                text-[#a69e94]
                                hover:text-[#e8e3da]
                                hover:border-[#c47b45]/50
                                hover:bg-[#24211e]
                                transition
                            "
                        >

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.7"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0
                                    3.75 3.75 0 017.5 0z
                                    M4.5 20.118a7.5 7.5 0
                                    0115 0A17.933 17.933
                                    0 0112 21.75c-2.676
                                    0-5.216-.584-7.5-1.632z"
                                />
                            </svg>

                        </button>

                        {/* =========================
                            DROPDOWN
                        ========================== */}

                        {open && (
                            <>
                                {/* Overlay */}

                                <div
                                    className="
                                        fixed
                                        inset-0
                                        z-40
                                    "
                                    onClick={() =>
                                        setOpen(false)
                                    }
                                />

                                <div
                                    className="
                                        absolute
                                        right-0
                                        mt-3
                                        w-64
                                        rounded-2xl
                                        bg-[#191816]
                                        border
                                        border-[#403a33]
                                        shadow-2xl
                                        shadow-black/50
                                        overflow-hidden
                                        z-50
                                    "
                                >

                                    {/* Profile Header */}

                                    <div
                                        className="
                                            px-4
                                            py-4
                                            border-b
                                            border-[#302d28]
                                            bg-[#1d1b19]
                                        "
                                    >

                                        <div className="flex items-center gap-3">

                                            <div
                                                className="
                                                    w-11
                                                    h-11
                                                    rounded-xl
                                                    bg-[#c47b45]
                                                    text-[#171614]
                                                    flex
                                                    items-center
                                                    justify-center
                                                    font-bold
                                                "
                                            >
                                                U
                                            </div>

                                            <div>

                                                <p
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-[#e8e3da]
                                                    "
                                                >
                                                    User
                                                </p>

                                                <p
                                                    className="
                                                        text-[11px]
                                                        text-[#746e66]
                                                    "
                                                >
                                                    AI Workspace
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Profile */}

                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setOpen(false)
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            px-4
                                            py-3
                                            text-sm
                                            text-[#aaa298]
                                            hover:bg-[#24211e]
                                            hover:text-[#eee8df]
                                            transition
                                        "
                                    >

                                        <span
                                            className="
                                                w-8
                                                h-8
                                                rounded-lg
                                                bg-[#24211e]
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            👤
                                        </span>

                                        <span>
                                            Profile
                                        </span>

                                    </Link>
                                    {/* Divider */}

                                    <div className="border-t border-[#302d28]" />

                                    {/* Logout */}

                                    <button
                                        onClick={
                                            handleLogout
                                        }
                                        className="
                                            w-full
                                            flex
                                            items-center
                                            gap-3
                                            px-4
                                            py-3
                                            text-sm
                                            text-[#a97b72]
                                            hover:bg-[#2a1c1a]
                                            hover:text-red-400
                                            transition
                                        "
                                    >

                                        <span
                                            className="
                                                w-8
                                                h-8
                                                rounded-lg
                                                bg-[#2a1c1a]
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            🚪
                                        </span>

                                        <span>
                                            Logout
                                        </span>

                                    </button>

                                </div>
                            </>
                        )}

                    </div>

                </div>

            </div>

        </nav>
    );
};

export default Nav;