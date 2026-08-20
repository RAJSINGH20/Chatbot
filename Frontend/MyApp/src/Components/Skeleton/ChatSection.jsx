import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatSection = () => {
    const [chats, setChats] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [activeChat, setActiveChat] = useState(null);

    const chatEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;

    // =========================================================
    // RESPONSIVE SIDEBAR
    // =========================================================

    useEffect(() => {
        const media = window.matchMedia("(max-width: 767px)");

        const updateSidebar = (e) => {
            setIsMobile(e.matches);
            setSidebarOpen(!e.matches);
        };

        setIsMobile(media.matches);
        setSidebarOpen(!media.matches);

        media.addEventListener("change", updateSidebar);

        return () => {
            media.removeEventListener(
                "change",
                updateSidebar
            );
        };
    }, []);

    // =========================================================
    // FETCH CHATS
    // =========================================================

    const fetchChats = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/user/chats`
            );

            const data = response.data.chats || [];

            setChats(data);

            if (data.length > 0) {
                setActiveChat(data[data.length - 1]);
            }
        } catch (error) {
            console.error(
                "Error fetching chats:",
                error
            );
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    // =========================================================
    // AUTO SCROLL
    // =========================================================

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [activeChat, loading]);

    // =========================================================
    // NEW CHAT
    // =========================================================

    const handleNewChat = () => {
        setActiveChat(null);
        setText("");

        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim() || loading) return;

        const userText = text.trim();

        setText("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/user/chat`,
                {
                    text: userText,
                }
            );

            const newChat = {
                _id: Date.now(),
                userMessage: userText,
                aiResponse: response.data.message,
                createdAt: new Date().toISOString(),
            };

            setChats((prev) => [
                ...prev,
                newChat,
            ]);

            setActiveChat(newChat);
        } catch (error) {
            console.error(
                "Chat Error:",
                error
            );

            setText(userText);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // CLEAR HISTORY
    // =========================================================

    const clearAllChats = async () => {
        const confirmDelete = window.confirm(
            "Delete all chat history?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(
                `${API_URL}/api/user/chats`
            );

            setChats([]);
            setActiveChat(null);
        } catch (error) {
            console.error(
                "Delete Error:",
                error
            );
        }
    };

    // =========================================================
    // GROUP CHATS
    // =========================================================

    const groupedChats = useMemo(() => {
        const today = new Date();

        const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const yesterday = new Date(
            startOfToday
        );

        yesterday.setDate(
            yesterday.getDate() - 1
        );

        const sevenDaysAgo = new Date(
            startOfToday
        );

        sevenDaysAgo.setDate(
            sevenDaysAgo.getDate() - 7
        );

        const groups = {
            Today: [],
            Yesterday: [],
            "Previous 7 Days": [],
            Older: [],
        };

        chats.forEach((chat) => {
            const date = new Date(
                chat.createdAt || chat._id
            );

            if (date >= startOfToday) {
                groups.Today.push(chat);
            } else if (date >= yesterday) {
                groups.Yesterday.push(chat);
            } else if (date >= sevenDaysAgo) {
                groups["Previous 7 Days"].push(
                    chat
                );
            } else {
                groups.Older.push(chat);
            }
        });

        return groups;
    }, [chats]);

    // =========================================================
    // CHAT TITLE
    // =========================================================

    const getChatTitle = (chat) => {
        if (!chat?.userMessage) {
            return "New conversation";
        }

        return chat.userMessage.length > 35
            ? chat.userMessage.substring(0, 35) +
                  "..."
            : chat.userMessage;
    };

    // =========================================================
    // MARKDOWN COMPONENTS
    // =========================================================

    const markdownComponents = {
        h1: ({ children }) => (
            <h1 className="mb-4 mt-7 text-2xl font-semibold tracking-tight text-[#f1eee8]">
                {children}
            </h1>
        ),

        h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-[#f1eee8]">
                {children}
            </h2>
        ),

        h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-base font-semibold text-[#eeeae3]">
                {children}
            </h3>
        ),

        h4: ({ children }) => (
            <h4 className="mb-2 mt-4 text-sm font-semibold text-[#eeeae3]">
                {children}
            </h4>
        ),

        p: ({ children }) => (
            <p className="mb-4 leading-7 text-[#c8c4bc]">
                {children}
            </p>
        ),

        ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5">
                {children}
            </ul>
        ),

        ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5">
                {children}
            </ol>
        ),

        li: ({ children }) => (
            <li className="pl-1">
                {children}
            </li>
        ),

        strong: ({ children }) => (
            <strong className="font-semibold text-[#f1eee8]">
                {children}
            </strong>
        ),

        em: ({ children }) => (
            <em className="text-[#ddd7ce]">
                {children}
            </em>
        ),

        blockquote: ({ children }) => (
            <blockquote
                className="
                    my-5
                    rounded-r-lg
                    border-l-2
                    border-[#d88a52]
                    bg-[#d88a52]/[0.06]
                    px-4
                    py-3
                    text-[#aaa59c]
                "
            >
                {children}
            </blockquote>
        ),

        hr: () => (
            <hr className="my-6 border-white/[0.07]" />
        ),

        code: ({
            inline,
            children,
        }) => {
            if (inline) {
                return (
                    <code
                        className="
                            rounded-md
                            border
                            border-white/[0.07]
                            bg-[#171715]
                            px-1.5
                            py-0.5
                            font-mono
                            text-[12px]
                            text-[#e0a477]
                        "
                    >
                        {children}
                    </code>
                );
            }

            return (
                <code
                    className="
                        block
                        font-mono
                        text-[12px]
                        leading-6
                        text-[#d6d2cb]
                    "
                >
                    {children}
                </code>
            );
        },

        pre: ({ children }) => (
            <pre
                className="
                    my-5
                    overflow-x-auto
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#080808]
                    p-4
                    shadow-[0_10px_35px_rgba(0,0,0,0.2)]
                    scrollbar-thin
                    scrollbar-track-transparent
                    scrollbar-thumb-[#34332f]
                "
            >
                {children}
            </pre>
        ),

        table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-white/[0.07]">
                <table className="w-full border-collapse text-xs">
                    {children}
                </table>
            </div>
        ),

        thead: ({ children }) => (
            <thead className="bg-[#1a1a18]">
                {children}
            </thead>
        ),

        tbody: ({ children }) => (
            <tbody>{children}</tbody>
        ),

        tr: ({ children }) => (
            <tr className="transition-colors hover:bg-white/[0.02]">
                {children}
            </tr>
        ),

        th: ({ children }) => (
            <th
                className="
                    border-b
                    border-white/[0.07]
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-[#eeeae3]
                "
            >
                {children}
            </th>
        ),

        td: ({ children }) => (
            <td
                className="
                    border-b
                    border-white/[0.05]
                    px-4
                    py-3
                    text-[#aaa59c]
                "
            >
                {children}
            </td>
        ),

        a: ({
            href,
            children,
        }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                    text-[#df9764]
                    underline-offset-4
                    transition-colors
                    hover:text-[#f0ad7c]
                    hover:underline
                "
            >
                {children}
            </a>
        ),
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className="
                flex
                h-dvh
                w-full
                overflow-hidden

                bg-[#0b0b0a]
                text-[#f1eee8]

                font-sans
            "
        >
            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {isMobile && sidebarOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-40

                        bg-black/60
                        backdrop-blur-[2px]

                        md:hidden
                    "
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`
                    fixed
                    inset-y-0
                    left-0
                    z-50

                    flex
                    h-full
                    shrink-0
                    flex-col

                    overflow-hidden

                    border-r
                    border-white/[0.06]

                    bg-[#111110]/95

                    shadow-[20px_0_60px_rgba(0,0,0,0.25)]

                    backdrop-blur-xl

                    transition-all
                    duration-300
                    ease-out

                    md:relative
                    md:z-auto

                    ${
                        sidebarOpen
                            ? "w-[285px] translate-x-0"
                            : "w-0 -translate-x-full md:w-0"
                    }
                `}
            >
                {/* SIDEBAR HEADER */}

                <div className="flex items-center gap-3 px-5 pb-4 pt-5">
                    <div
                        className="
                            relative
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden

                            rounded-xl

                            bg-gradient-to-br
                            from-[#e3a06f]
                            to-[#bd7041]

                            text-sm
                            font-black
                            text-[#17100b]

                            shadow-[0_8px_30px_rgba(216,138,82,0.18)]
                        "
                    >
                        <span className="relative z-10">
                            AI
                        </span>

                        <div className="absolute inset-0 bg-white/10" />
                    </div>

                    <div className="min-w-0">
                        <h1
                            className="
                                truncate
                                text-[14px]
                                font-semibold
                                tracking-tight
                                text-[#f1eee8]
                            "
                        >
                            AI Workspace
                        </h1>

                        <p className="mt-0.5 text-[11px] text-[#77736b]">
                            Your intelligent assistant
                        </p>
                    </div>
                </div>

                {/* NEW CHAT */}

                <button
                    onClick={handleNewChat}
                    className="
                        mx-4
                        mb-5
                        flex
                        h-11
                        w-[calc(100%-2rem)]
                        items-center
                        justify-center
                        gap-2

                        rounded-xl

                        bg-[#d88a52]

                        text-[13px]
                        font-semibold
                        text-[#1b120d]

                        shadow-[0_8px_25px_rgba(216,138,82,0.12)]

                        transition-all
                        duration-200

                        hover:bg-[#e39a62]
                        hover:shadow-[0_10px_30px_rgba(216,138,82,0.18)]

                        active:scale-[0.98]

                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#d88a52]/50
                    "
                >
                    <span className="text-lg leading-none">
                        +
                    </span>

                    New conversation
                </button>

                {/* DIVIDER */}

                <div className="mx-4 h-px bg-white/[0.06]" />

                {/* HISTORY */}

                <div
                    className="
                        flex-1
                        overflow-y-auto

                        px-4
                        py-5

                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#302e29]
                    "
                >
                    {Object.entries(
                        groupedChats
                    ).map(
                        ([
                            section,
                            sectionChats,
                        ]) => {
                            if (
                                sectionChats.length ===
                                0
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={section}
                                    className="mb-6"
                                >
                                    <div
                                        className="
                                            mb-2
                                            flex
                                            items-center
                                            gap-2
                                            px-2
                                        "
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#d88a52]" />

                                        <h3
                                            className="
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.18em]
                                                text-[#716d65]
                                            "
                                        >
                                            {section}
                                        </h3>
                                    </div>

                                    <div className="space-y-1">
                                        {sectionChats
                                            .slice()
                                            .reverse()
                                            .map(
                                                (
                                                    chat
                                                ) => (
                                                    <button
                                                        key={
                                                            chat._id
                                                        }
                                                        onClick={() => {
                                                            setActiveChat(
                                                                chat
                                                            );

                                                            if (
                                                                isMobile
                                                            ) {
                                                                setSidebarOpen(
                                                                    false
                                                                );
                                                            }
                                                        }}
                                                        className={`
                                                            group
                                                            flex
                                                            w-full
                                                            items-center
                                                            gap-3

                                                            rounded-xl
                                                            border

                                                            px-3
                                                            py-2.5

                                                            text-left

                                                            transition-all
                                                            duration-150

                                                            ${
                                                                activeChat?._id ===
                                                                chat._id
                                                                    ? `
                                                                        border-white/[0.08]
                                                                        bg-[#20201d]
                                                                        text-[#f1eee8]
                                                                        shadow-sm
                                                                    `
                                                                    : `
                                                                        border-transparent
                                                                        text-[#8b877f]
                                                                        hover:bg-[#191918]
                                                                        hover:text-[#ded9d1]
                                                                    `
                                                            }
                                                        `}
                                                    >
                                                        <div
                                                            className={`
                                                                flex
                                                                h-7
                                                                w-7
                                                                shrink-0
                                                                items-center
                                                                justify-center

                                                                rounded-lg

                                                                text-[11px]
                                                                font-semibold

                                                                transition-colors

                                                                ${
                                                                    activeChat?._id ===
                                                                    chat._id
                                                                        ? "bg-[#d88a52] text-[#1b120d]"
                                                                        : "bg-[#242421] text-[#77736d] group-hover:bg-[#2a2925]"
                                                                }
                                                            `}
                                                        >
                                                            ✦
                                                        </div>

                                                        <span className="min-w-0 flex-1 truncate text-xs">
                                                            {getChatTitle(
                                                                chat
                                                            )}
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                    </div>
                                </div>
                            );
                        }
                    )}

                    {/* EMPTY STATE */}

                    {chats.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <div
                                className="
                                    mx-auto
                                    mb-4
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center

                                    rounded-2xl

                                    border
                                    border-white/[0.07]

                                    bg-[#1b1b19]

                                    text-[#77736d]
                                "
                            >
                                ✦
                            </div>

                            <p className="text-sm text-[#8a857d]">
                                No conversations
                            </p>

                            <p className="mt-1 text-[11px] text-[#57534d]">
                                Start your first chat
                            </p>
                        </div>
                    )}
                </div>

                {/* MOBILE PROFILE */}

                <div className="border-t border-white/[0.06] p-4 md:hidden">
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center

                                rounded-xl

                                bg-[#d88a52]

                                font-bold
                                text-[#17100b]
                            "
                        >
                            U
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#eeeae3]">
                                User
                            </p>

                            <p className="truncate text-[11px] text-[#716d65]">
                                AI Workspace
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSidebarOpen(false)
                            }
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center

                                rounded-lg

                                text-[#77736d]

                                transition

                                hover:bg-[#242421]
                                hover:text-[#eeeae3]
                            "
                            aria-label="Close sidebar"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* SIDEBAR FOOTER */}

                <div className="border-t border-white/[0.06] p-4">
                    <button
                        onClick={clearAllChats}
                        disabled={
                            chats.length === 0
                        }
                        className="
                            flex
                            w-full
                            items-center
                            gap-3

                            rounded-xl

                            px-3
                            py-2.5

                            text-xs
                            text-[#77736d]

                            transition-all

                            hover:bg-red-500/[0.07]
                            hover:text-red-400

                            disabled:cursor-not-allowed
                            disabled:opacity-30
                        "
                    >
                        <span>🗑</span>

                        Delete history
                    </button>
                </div>
            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="flex min-w-0 flex-1 flex-col">
                {/* HEADER */}

                <header
                    className="
                        z-20
                        flex
                        h-16
                        shrink-0
                        items-center

                        border-b
                        border-white/[0.06]

                        bg-[#0f0f0e]/90

                        px-4
                        backdrop-blur-xl

                        md:px-5
                    "
                >
                    {/* DESKTOP TOGGLE */}

                    <button
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                        className="
                            hidden
                            h-9
                            w-9
                            shrink-0

                            items-center
                            justify-center

                            rounded-lg
                            border
                            border-white/[0.07]

                            bg-[#181817]

                            text-[#77736d]

                            transition-all

                            hover:border-white/[0.12]
                            hover:bg-[#20201e]
                            hover:text-[#eeeae3]

                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#d88a52]/40

                            md:flex
                        "
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>

                    {/* MOBILE TOGGLE */}

                    <button
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0

                            items-center
                            justify-center

                            rounded-lg
                            border
                            border-white/[0.07]

                            bg-[#181817]

                            text-[#77736d]

                            transition-all

                            hover:border-white/[0.12]
                            hover:bg-[#20201e]
                            hover:text-[#eeeae3]

                            md:hidden
                        "
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>

                    <div className="ml-3 min-w-0">
                        <h2
                            className="
                                max-w-[250px]
                                truncate

                                text-[13px]
                                font-semibold
                                tracking-tight
                                text-[#eeeae3]

                                md:max-w-lg
                            "
                        >
                            {activeChat
                                ? getChatTitle(
                                      activeChat
                                  )
                                : "New conversation"}
                        </h2>

                        <div className="mt-0.5 flex items-center gap-1.5">
                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full

                                    bg-[#d88a52]

                                    shadow-[0_0_8px_rgba(216,138,82,0.5)]
                                "
                            />

                            <span className="text-[10px] text-[#68645d]">
                                AI Assistant
                            </span>
                        </div>
                    </div>
                </header>

                {/* =================================================
                    CHAT AREA
                ================================================= */}

                <div
                    className="
                        flex-1
                        overflow-y-auto

                        bg-[#0b0b0a]

                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#292824]
                    "
                >
                    <div
                        className="
                            mx-auto
                            w-full
                            max-w-4xl

                            px-4
                            py-8

                            md:px-6
                            md:py-10
                        "
                    >
                        {/* =================================================
                            WELCOME
                        ================================================= */}

                        {!activeChat &&
                            !loading && (
                                <div
                                    className="
                                        flex
                                        min-h-[60vh]
                                        flex-col
                                        items-center
                                        justify-center

                                        px-4

                                        text-center
                                    "
                                >
                                    <div
                                        className="
                                            relative
                                            mb-7

                                            flex
                                            h-20
                                            w-20
                                            items-center
                                            justify-center

                                            rounded-[24px]

                                            border
                                            border-white/[0.09]

                                            bg-gradient-to-br
                                            from-[#1c1c1a]
                                            to-[#131312]

                                            text-sm
                                            font-black
                                            text-[#d88a52]

                                            shadow-[0_20px_50px_rgba(0,0,0,0.25)]
                                        "
                                    >
                                        <div
                                            className="
                                                absolute
                                                inset-2

                                                rounded-[18px]

                                                border
                                                border-[#d88a52]/20
                                            "
                                        />

                                        <span className="relative">
                                            AI
                                        </span>
                                    </div>

                                    <h2
                                        className="
                                            text-3xl
                                            font-semibold
                                            tracking-[-0.04em]
                                            text-[#f1eee8]

                                            md:text-[34px]
                                        "
                                    >
                                        What are you
                                        working on?
                                    </h2>

                                    <p
                                        className="
                                            mt-3
                                            max-w-md

                                            text-sm
                                            leading-6

                                            text-[#716d65]
                                        "
                                    >
                                        Ask anything and
                                        let AI help you
                                        move forward.
                                    </p>

                                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                                        {[
                                            "Explain something",
                                            "Write code",
                                            "Debug my code",
                                            "Learn a topic",
                                        ].map(
                                            (item) => (
                                                <button
                                                    key={
                                                        item
                                                    }
                                                    onClick={() =>
                                                        setText(
                                                            item
                                                        )
                                                    }
                                                    className="
                                                        rounded-full

                                                        border
                                                        border-white/[0.07]

                                                        bg-[#141413]

                                                        px-4
                                                        py-2.5

                                                        text-[11px]
                                                        font-medium
                                                        text-[#918c84]

                                                        transition-all

                                                        hover:-translate-y-0.5
                                                        hover:border-[#d88a52]/40
                                                        hover:bg-[#1b1b19]
                                                        hover:text-[#e4dfd7]

                                                        active:translate-y-0
                                                    "
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        {activeChat && (
                            <div className="flex flex-col gap-9">
                                {/* USER */}

                                <div className="flex justify-end">
                                    <div
                                        className="
                                            max-w-[85%]

                                            rounded-[20px]
                                            rounded-br-md

                                            bg-gradient-to-br
                                            from-[#df925a]
                                            to-[#ca7c48]

                                            px-4
                                            py-3

                                            text-[13px]
                                            font-medium
                                            leading-6
                                            text-[#1b120d]

                                            shadow-[0_8px_25px_rgba(0,0,0,0.15)]

                                            md:max-w-[75%]
                                            md:px-5
                                        "
                                    >
                                        {
                                            activeChat.userMessage
                                        }
                                    </div>
                                </div>

                                {/* AI */}

                                <div className="flex items-start gap-3 md:gap-4">
                                    <div
                                        className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center

                                            rounded-xl

                                            border
                                            border-white/[0.08]

                                            bg-[#1a1a18]

                                            text-[9px]
                                            font-black
                                            text-[#d88a52]

                                            shadow-sm
                                        "
                                    >
                                        AI
                                    </div>

                                    <div
                                        className="
                                            min-w-0

                                            max-w-[calc(100%-3rem)]

                                            pt-1

                                            text-[13px]
                                            leading-7
                                            text-[#c8c4bc]

                                            md:text-sm
                                        "
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[
                                                remarkGfm,
                                            ]}
                                            components={
                                                markdownComponents
                                            }
                                        >
                                            {
                                                activeChat.aiResponse
                                            }
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading && (
                            <div className="mt-8 flex items-start gap-3 md:gap-4">
                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center

                                        rounded-xl

                                        border
                                        border-white/[0.08]

                                        bg-[#1a1a18]

                                        text-[9px]
                                        font-black
                                        text-[#d88a52]
                                    "
                                >
                                    AI
                                </div>

                                <div className="flex items-center gap-1.5 pt-3">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#77736b]" />

                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#77736b] [animation-delay:150ms]" />

                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#77736b] [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* =================================================
                    INPUT
                ================================================= */}

                <div
                    className="
                        shrink-0

                        border-t
                        border-white/[0.06]

                        bg-[#0f0f0e]/95

                        px-3
                        py-3

                        backdrop-blur-xl

                        md:px-5
                    "
                >
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto w-full max-w-4xl"
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-2

                                rounded-2xl

                                border
                                border-white/[0.08]

                                bg-[#191918]

                                p-1.5

                                shadow-[0_10px_35px_rgba(0,0,0,0.2)]

                                transition-all
                                duration-200

                                focus-within:border-[#d88a52]/50
                                focus-within:ring-4
                                focus-within:ring-[#d88a52]/[0.06]
                            "
                        >
                            {/* ATTACHMENT */}

                            <button
                                type="button"
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center

                                    rounded-xl

                                    text-lg
                                    text-[#77736d]

                                    transition-all

                                    hover:bg-[#242421]
                                    hover:text-[#d88a52]
                                "
                                aria-label="Add attachment"
                            >
                                +
                            </button>

                            {/* INPUT */}

                            <input
                                type="text"
                                value={text}
                                onChange={(e) =>
                                    setText(
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                                placeholder="Ask anything..."
                                className="
                                    min-w-0
                                    flex-1

                                    bg-transparent

                                    px-2.5
                                    py-2.5

                                    text-[13px]
                                    text-[#eeeae3]

                                    outline-none

                                    placeholder:text-[#5f5b55]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            />

                            {/* SEND */}

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !text.trim()
                                }
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center

                                    rounded-xl

                                    bg-[#d88a52]

                                    font-bold
                                    text-[#1b120d]

                                    shadow-[0_5px_15px_rgba(216,138,82,0.12)]

                                    transition-all

                                    hover:bg-[#e39a62]
                                    hover:shadow-[0_7px_20px_rgba(216,138,82,0.18)]

                                    active:scale-95

                                    disabled:cursor-not-allowed
                                    disabled:bg-[#34332f]
                                    disabled:text-[#69655e]
                                    disabled:shadow-none
                                "
                                aria-label="Send message"
                            >
                                ↑
                            </button>
                        </div>

                        <p
                            className="
                                mt-2

                                text-center
                                text-[9px]
                                text-[#4f4c47]
                            "
                        >
                            AI may occasionally generate
                            incorrect information.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChatSection;