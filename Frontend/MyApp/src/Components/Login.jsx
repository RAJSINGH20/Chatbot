import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleSwitch = () => {
        navigate("/register");
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:3000/api/user/login",
                {
                    email: formData.email,
                    password: formData.password,
                }
            );

            console.log(response.data);

            toast.success("Login Successful!");

            if (response.data.token) {
                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }

            navigate("/");
        } catch (error) {
            console.error("Error:", error);

            if (error.response) {
                toast.error(
                    error.response.data.message ||
                        "Login Failed!"
                );
            } else {
                toast.error(
                    "Server connection failed!"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
                relative
                min-h-screen
                flex
                items-center
                justify-center
                overflow-hidden
                bg-[#080b16]
                px-4
                py-8
            "
        >

            {/* =================================
                BACKGROUND
            ================================= */}

            <div
                className="
                    absolute
                    -top-32
                    -left-32
                    w-96
                    h-96
                    bg-blue-600/20
                    rounded-full
                    blur-[120px]
                    animate-pulse
                "
            />

            <div
                className="
                    absolute
                    -bottom-40
                    -right-32
                    w-[450px]
                    h-[450px]
                    bg-purple-600/20
                    rounded-full
                    blur-[130px]
                    animate-pulse
                "
            />

            <div
                className="
                    absolute
                    top-1/3
                    left-1/2
                    -translate-x-1/2
                    w-72
                    h-72
                    bg-indigo-500/10
                    rounded-full
                    blur-[100px]
                "
            />

            {/* =================================
                LOGIN CARD
            ================================= */}

            <div
                className="
                    relative
                    w-full
                    max-w-md
                    rounded-[28px]
                    bg-[#101525]/95
                    border
                    border-[#252d48]
                    shadow-[0_25px_80px_rgba(0,0,0,0.5)]
                    p-7
                    sm:p-9
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    hover:border-[#39456e]
                "
            >

                {/* Top Glow */}

                <div
                    className="
                        absolute
                        top-0
                        left-1/2
                        -translate-x-1/2
                        w-40
                        h-[2px]
                        bg-gradient-to-r
                        from-transparent
                        via-blue-500
                        to-transparent
                        blur-sm
                    "
                />

                {/* =================================
                    LOGO
                ================================= */}

                <div className="flex justify-center mb-7">

                    <div
                        className="
                            relative
                            w-16
                            h-16
                            rounded-2xl
                            bg-gradient-to-br
                            from-blue-500
                            to-purple-600
                            flex
                            items-center
                            justify-center
                            shadow-lg
                            shadow-blue-600/20
                            transition-all
                            duration-500
                            hover:scale-105
                            hover:rotate-3
                        "
                    >

                        <div
                            className="
                                absolute
                                inset-[2px]
                                rounded-2xl
                                bg-gradient-to-br
                                from-blue-500
                                to-purple-600
                            "
                        />

                        <span
                            className="
                                relative
                                text-white
                                text-xl
                                font-black
                            "
                        >
                            AI
                        </span>

                    </div>

                </div>

                {/* =================================
                    HEADING
                ================================= */}

                <div className="text-center mb-8">

                    <h1
                        className="
                            text-2xl
                            sm:text-3xl
                            font-bold
                            text-white
                            tracking-tight
                        "
                    >
                        Welcome Back
                    </h1>

                    <p
                        className="
                            text-sm
                            text-slate-400
                            mt-2
                        "
                    >
                        Sign in to continue to your
                        AI workspace
                    </p>

                </div>

                {/* =================================
                    FORM
                ================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* EMAIL */}

                    <div>

                        <label
                            className="
                                block
                                text-xs
                                font-semibold
                                text-slate-400
                                uppercase
                                tracking-wider
                                mb-2
                            "
                        >
                            Email Address
                        </label>

                        <div className="relative">

                            <span
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-500
                                "
                            >
                                @
                            </span>

                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={
                                    handleChange
                                }
                                required
                                className="
                                    w-full
                                    pl-10
                                    pr-4
                                    py-3.5
                                    rounded-xl
                                    bg-[#0b1020]
                                    border
                                    border-[#27304a]
                                    text-white
                                    text-sm
                                    placeholder:text-slate-600
                                    outline-none
                                    transition-all
                                    duration-300
                                    focus:border-blue-500
                                    focus:ring-4
                                    focus:ring-blue-500/10
                                    hover:border-[#374261]
                                "
                            />

                        </div>

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <label
                            className="
                                block
                                text-xs
                                font-semibold
                                text-slate-400
                                uppercase
                                tracking-wider
                                mb-2
                            "
                        >
                            Password
                        </label>

                        <div className="relative">

                            <span
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-500
                                "
                            >
                                •
                            </span>

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="
                                    w-full
                                    pl-10
                                    pr-4
                                    py-3.5
                                    rounded-xl
                                    bg-[#0b1020]
                                    border
                                    border-[#27304a]
                                    text-white
                                    text-sm
                                    placeholder:text-slate-600
                                    outline-none
                                    transition-all
                                    duration-300
                                    focus:border-purple-500
                                    focus:ring-4
                                    focus:ring-purple-500/10
                                    hover:border-[#374261]
                                "
                            />

                        </div>

                    </div>

                    {/* FORGOT PASSWORD */}

                    <div className="flex justify-end">

                        <button
                            type="button"
                            className="
                                text-xs
                                text-blue-400
                                hover:text-purple-400
                                transition-colors
                            "
                        >
                            Forgot password?
                        </button>

                    </div>

                    {/* =================================
                        LOGIN BUTTON
                    ================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            relative
                            w-full
                            py-3.5
                            rounded-xl
                            bg-gradient-to-r
                            from-blue-600
                            to-purple-600
                            text-white
                            font-semibold
                            text-sm
                            overflow-hidden
                            shadow-lg
                            shadow-blue-900/20
                            transition-all
                            duration-300
                            hover:from-blue-500
                            hover:to-purple-500
                            hover:-translate-y-0.5
                            hover:shadow-blue-600/20
                            active:scale-[0.98]
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                        "
                    >

                        {/* Shine */}

                        <span
                            className="
                                absolute
                                inset-0
                                -translate-x-full
                                hover:translate-x-full
                                transition-transform
                                duration-700
                                bg-gradient-to-r
                                from-transparent
                                via-white/10
                                to-transparent
                            "
                        />

                        {loading ? (
                            <span
                                className="
                                    relative
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        w-4
                                        h-4
                                        border-2
                                        border-white/30
                                        border-t-white
                                        rounded-full
                                        animate-spin
                                    "
                                />

                                Signing in...

                            </span>
                        ) : (
                            <span className="relative">
                                Sign In
                            </span>
                        )}

                    </button>

                </form>

                {/* =================================
                    DIVIDER
                ================================= */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        my-7
                    "
                >

                    <div className="flex-1 h-px bg-[#252d48]" />

                    <span
                        className="
                            text-[10px]
                            uppercase
                            tracking-widest
                            text-slate-600
                        "
                    >
                        OR
                    </span>

                    <div className="flex-1 h-px bg-[#252d48]" />

                </div>

                {/* =================================
                    REGISTER
                ================================= */}

                <p
                    className="
                        text-center
                        text-sm
                        text-slate-500
                    "
                >
                    Don't have an account?{" "}

                    <button
                        type="button"
                        onClick={handleSwitch}
                        className="
                            text-blue-400
                            font-semibold
                            hover:text-purple-400
                            transition-colors
                        "
                    >
                        Create account
                    </button>

                </p>

                {/* Bottom Text */}

                <p
                    className="
                        text-center
                        text-[10px]
                        text-slate-700
                        mt-6
                    "
                >
                    Secure AI Workspace
                </p>

            </div>

        </div>
    );
};

export default Login;