import React from "react";
import { User, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = ({ username, email }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#10100f] text-[#e8e3da] flex items-center justify-center px-4 py-8">

            <div
                className="
                    w-full
                    max-w-md
                    bg-[#171614]
                    border
                    border-[#302d28]
                    rounded-3xl
                    shadow-2xl
                    shadow-black/40
                    overflow-hidden
                "
            >

                {/* =========================
                    TOP SECTION
                ========================== */}

                <div
                    className="
                        relative
                        px-6
                        pt-6
                        pb-8
                        bg-[#1b1917]
                        border-b
                        border-[#302d28]
                    "
                >

                    {/* Back Button */}

                    <button
                        onClick={() => navigate("/")}
                        className="
                            flex
                            items-center
                            gap-2
                            text-[#817970]
                            hover:text-[#c47b45]
                            transition
                            duration-200
                            group
                        "
                    >
                        <ArrowLeft
                            size={19}
                            className="
                                group-hover:-translate-x-1
                                transition
                            "
                        />

                        <span className="text-sm font-medium">
                            Back to Chats
                        </span>
                    </button>

                    {/* Profile Image */}

                    <div className="flex justify-center mt-8">

                        <div
                            className="
                                relative
                                w-28
                                h-28
                                rounded-[30px]
                                bg-[#c47b45]
                                flex
                                items-center
                                justify-center
                                shadow-xl
                                shadow-[#c47b45]/10
                            "
                        >

                            {/* Inner Border */}

                            <div
                                className="
                                    absolute
                                    inset-2
                                    rounded-[24px]
                                    border
                                    border-[#171614]/20
                                "
                            />

                            <User
                                size={52}
                                strokeWidth={1.6}
                                className="text-[#171614]"
                            />

                        </div>

                    </div>

                    {/* Title */}

                    <div className="text-center mt-6">

                        <h1
                            className="
                                text-2xl
                                font-semibold
                                text-[#eee8df]
                            "
                        >
                            My Profile
                        </h1>

                        <p
                            className="
                                text-xs
                                text-[#756e66]
                                mt-2
                            "
                        >
                            Account information
                        </p>

                    </div>

                </div>

                {/* =========================
                    PROFILE DETAILS
                ========================== */}

                <div className="p-6">

                    {/* Username */}

                    <div className="mb-5">

                        <label
                            className="
                                flex
                                items-center
                                gap-2
                                text-[11px]
                                uppercase
                                tracking-wider
                                font-semibold
                                text-[#756e66]
                                mb-2
                            "
                        >
                            <User size={13} />
                            Username
                        </label>

                        <div
                            className="
                                w-full
                                px-4
                                py-3.5
                                bg-[#1d1b19]
                                border
                                border-[#302d28]
                                rounded-xl
                                text-[#d8d2c8]
                                text-sm
                                font-medium
                                hover:border-[#403a33]
                                transition
                            "
                        >
                            {username || "Raj Singh"}
                        </div>

                    </div>

                    {/* Email */}

                    <div className="mb-6">

                        <label
                            className="
                                flex
                                items-center
                                gap-2
                                text-[11px]
                                uppercase
                                tracking-wider
                                font-semibold
                                text-[#756e66]
                                mb-2
                            "
                        >
                            <Mail size={13} />
                            Email
                        </label>

                        <div
                            className="
                                w-full
                                px-4
                                py-3.5
                                bg-[#1d1b19]
                                border
                                border-[#302d28]
                                rounded-xl
                                text-[#d8d2c8]
                                text-sm
                                font-medium
                                break-all
                                hover:border-[#403a33]
                                transition
                            "
                        >
                            {email || "example@gmail.com"}
                        </div>

                    </div>

                    {/* =========================
                        ACCOUNT STATUS
                    ========================== */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            px-4
                            py-4
                            rounded-xl
                            bg-[#1c1d19]
                            border
                            border-[#303329]
                        "
                    >

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    w-9
                                    h-9
                                    rounded-lg
                                    bg-[#25281f]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#8c9b63]
                                "
                            >
                                <ShieldCheck
                                    size={18}
                                />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-[#bcb5ab]
                                    "
                                >
                                    Account Status
                                </p>

                                <p
                                    className="
                                        text-[10px]
                                        text-[#706a62]
                                        mt-0.5
                                    "
                                >
                                    Your account is active
                                </p>

                            </div>

                        </div>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                px-3
                                py-1.5
                                rounded-full
                                bg-[#25281f]
                            "
                        >

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-[#8c9b63]
                                    animate-pulse
                                "
                            />

                            <span
                                className="
                                    text-[10px]
                                    font-semibold
                                    text-[#9da979]
                                "
                            >
                                Active
                            </span>

                        </div>

                    </div>

                    {/* =========================
                        BACK TO CHAT BUTTON
                    ========================== */}

                    <button
                        onClick={() => navigate("/")}
                        className="
                            w-full
                            mt-6
                            py-3.5
                            rounded-xl
                            bg-[#c47b45]
                            text-[#171614]
                            font-semibold
                            text-sm
                            hover:bg-[#d18a52]
                            active:scale-[0.98]
                            transition
                            duration-200
                        "
                    >
                        Continue to Chats
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Profile;