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
    // ============================================================
    // STATE
    // ============================================================

    const [chats, setChats] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] =
        useState(true);

    const [isMobile, setIsMobile] =
        useState(false);

    const [activeChat, setActiveChat] =
        useState(null);

    const chatEndRef = useRef(null);

    const API_URL =
        import.meta.env.VITE_API_URL;

    console.log(API_URL)
    // ============================================================
    // RESPONSIVE SIDEBAR
    // ============================================================

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(max-width: 767px)"
        );

        const handleResize = (event) => {
            const mobile = event.matches;

            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };

        setIsMobile(mediaQuery.matches);
        setSidebarOpen(!mediaQuery.matches);

        mediaQuery.addEventListener(
            "change",
            handleResize
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleResize
            );
        };
    }, []);

    // ============================================================
    // FETCH CHAT HISTORY
    // ============================================================

    const fetchChats = async () => {
        try {
            console.log("API_URL:", API_URL);

            const url = `${API_URL}/api/user/chats`;

            console.log("Fetching:", url);

            const response = await axios.get(url);

            console.log("Fetch chats response:", response.data);

            const data = response.data.chats || [];

            setChats(data);

            if (data.length > 0) {
                setActiveChat(data[data.length - 1]);
            }
        } catch (error) {
            console.error("FETCH CHATS ERROR");
            console.error("Message:", error.message);
            console.error("Status:", error.response?.status);
            console.error("Response:", error.response?.data);
            console.error("URL:", error.config?.url);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    // ============================================================
    // AUTO SCROLL
    // ============================================================

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [activeChat, loading]);

    // ============================================================
    // NEW CHAT
    // ============================================================

    const handleNewChat = () => {
        setActiveChat(null);
        setText("");

        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    // ============================================================
    // SEND MESSAGE
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        const message = text.trim();

        if (!message || loading) {
            return;
        }

        setText("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/user/chat`,
                {
                    text: message,
                }
            );

            const newChat = {
                _id: Date.now(),
                userMessage: message,
                aiResponse:
                    response.data.message,
                createdAt:
                    new Date().toISOString(),
            };

            setChats((previous) => [
                ...previous,
                newChat,
            ]);

            setActiveChat(newChat);
        } catch (error) {
            console.error(
                "Chat Error:",
                error
            );

            setText(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // DELETE ALL CHATS
    // ============================================================

    const clearAllChats = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all chat history?"
        );

        if (!confirmed) {
            return;
        }

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

    // ============================================================
    // GROUP CHAT HISTORY
    // ============================================================

    const groupedChats = useMemo(() => {
        const now = new Date();

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const yesterday = new Date(today);

        yesterday.setDate(
            yesterday.getDate() - 1
        );

        const sevenDaysAgo = new Date(today);

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

            if (date >= today) {
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

    // ============================================================
    // CHAT TITLE
    // ============================================================

    const getChatTitle = (chat) => {
        if (!chat?.userMessage) {
            return "New conversation";
        }

        const title =
            chat.userMessage.trim();

        if (title.length > 35) {
            return (
                title.substring(0, 35) + "..."
            );
        }

        return title;
    };

    // ============================================================
    // MARKDOWN COMPONENTS
    // ============================================================

    const markdownComponents = {
        // -----------------------------
        // HEADINGS
        // -----------------------------

        h1: ({ children }) => (
            <h1 className="mb-4 mt-7 text-2xl font-bold tracking-tight text-[#f8f1fb]">
                {children}
            </h1>
        ),

        h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-bold tracking-tight text-[#f8f1fb]">
                {children}
            </h2>
        ),

        h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-semibold text-[#f1e7f6]">
                {children}
            </h3>
        ),

        h4: ({ children }) => (
            <h4 className="mb-2 mt-4 text-base font-semibold text-[#eee3f3]">
                {children}
            </h4>
        ),

        // -----------------------------
        // PARAGRAPH
        // -----------------------------

        p: ({ children }) => (
            <p className="mb-4 leading-7 text-[#c7bdcc]">
                {children}
            </p>
        ),

        // -----------------------------
        // LISTS
        // -----------------------------

        ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-2 text-[#c7bdcc]">
                {children}
            </ul>
        ),

        ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-2 text-[#c7bdcc]">
                {children}
            </ol>
        ),

        li: ({ children }) => (
            <li className="pl-1 leading-6">
                {children}
            </li>
        ),

        // -----------------------------
        // BOLD
        // -----------------------------

        strong: ({ children }) => (
            <strong className="font-semibold text-[#f5edf8]">
                {children}
            </strong>
        ),

        // -----------------------------
        // ITALIC
        // -----------------------------

        em: ({ children }) => (
            <em className="text-[#d9cce0]">
                {children}
            </em>
        ),

        // -----------------------------
        // LINK
        // -----------------------------

        a: ({
            href,
            children,
        }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                    text-[#bd6cff]
                    underline
                    decoration-[#743b93]
                    underline-offset-4
                    transition
                    hover:text-[#d18aff]
                "
            >
                {children}
            </a>
        ),

        // -----------------------------
        // BLOCKQUOTE
        // -----------------------------

        blockquote: ({ children }) => (
            <blockquote
                className="
                    my-5

                    rounded-r-xl

                    border-l-2
                    border-[#b967ff]

                    bg-[#24102f]

                    px-4
                    py-3

                    text-[#bcb0c4]
                "
            >
                {children}
            </blockquote>
        ),

        // -----------------------------
        // HORIZONTAL LINE
        // -----------------------------

        hr: () => (
            <hr className="my-7 border-[#30203a]" />
        ),

        // -----------------------------
        // CODE
        // -----------------------------

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
                            border-[#3b2447]

                            bg-[#21102d]

                            px-1.5
                            py-0.5

                            font-mono
                            text-[12px]

                            text-[#d18aff]
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

                        text-[#d7c9de]
                    "
                >
                    {children}
                </code>
            );
        },

        // -----------------------------
        // CODE BLOCK
        // -----------------------------

        pre: ({ children }) => (
            <pre
                className="
                    my-5

                    overflow-x-auto

                    rounded-xl

                    border
                    border-[#30203a]

                    bg-[#0a0610]

                    p-4

                    shadow-[0_10px_35px_rgba(0,0,0,0.4)]

                    scrollbar-thin
                    scrollbar-track-transparent
                    scrollbar-thumb-[#3b2548]
                "
            >
                {children}
            </pre>
        ),

        // -----------------------------
        // TABLE
        // -----------------------------

        table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-[#30203a]">
                <table className="w-full border-collapse text-xs">
                    {children}
                </table>
            </div>
        ),

        thead: ({ children }) => (
            <thead className="bg-[#21102c]">
                {children}
            </thead>
        ),

        tbody: ({ children }) => (
            <tbody>{children}</tbody>
        ),

        tr: ({ children }) => (
            <tr className="transition hover:bg-[#1d0d28]">
                {children}
            </tr>
        ),

        th: ({ children }) => (
            <th
                className="
                    border-b
                    border-[#30203a]

                    px-4
                    py-3

                    text-left
                    font-semibold

                    text-[#f0e6f4]
                "
            >
                {children}
            </th>
        ),

        td: ({ children }) => (
            <td
                className="
                    border-b
                    border-[#25152f]

                    px-4
                    py-3

                    text-[#afa3b5]
                "
            >
                {children}
            </td>
        ),
    };

    // ============================================================
    // COMPONENT
    // ============================================================

    return (
        <div
            className="
                flex
                h-dvh
                w-full
                overflow-hidden

                bg-[#170b24]

                font-sans

                text-[#f5eff8]
            "
        >
            {/* ========================================================
                MOBILE OVERLAY
            ======================================================== */}

            {isMobile && sidebarOpen && (
                <div
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    className="
                        fixed
                        inset-0
                        z-40

                        bg-black/60

                        backdrop-blur-[2px]

                        md:hidden
                    "
                />
            )}

            {/* ========================================================
                SIDEBAR
            ======================================================== */}

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
                    border-[#291535]

                    bg-[#12091c]

                    shadow-[20px_0_60px_rgba(0,0,0,0.4)]

                    transition-all
                    duration-300
                    ease-out

                    md:relative
                    md:z-auto

                    ${sidebarOpen
                        ? "w-[285px] translate-x-0"
                        : "w-0 -translate-x-full md:w-0"
                    }
                `}
            >
                {/* ====================================================
                    SIDEBAR HEADER
                ==================================================== */}

                <div className="flex items-center gap-3 px-5 pb-5 pt-5">
                    {/* LOGO */}

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
                            from-[#c878ff]
                            to-[#7136a1]

                            text-sm
                            font-black
                            text-white

                            shadow-[0_8px_30px_rgba(185,103,255,0.28)]
                        "
                    >
                        <span className="relative z-10">
                            AI
                        </span>

                        <div
                            className="
                                absolute
                                inset-0
                                bg-white/10
                            "
                        />
                    </div>

                    {/* TITLE */}

                    <div className="min-w-0">
                        <h1
                            className="
                                truncate

                                text-[14px]
                                font-semibold
                                tracking-tight

                                text-[#f5eff8]
                            "
                        >
                            AI Workspace
                        </h1>

                        <p className="mt-0.5 text-[11px] text-[#75687e]">
                            Your intelligent assistant
                        </p>
                    </div>
                </div>

                {/* ====================================================
                    NEW CHAT
                ==================================================== */}

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

                        bg-gradient-to-r
                        from-[#a855f7]
                        to-[#c06cff]

                        text-[13px]
                        font-semibold

                        text-white

                        shadow-[0_8px_25px_rgba(168,85,247,0.20)]

                        transition-all
                        duration-200

                        hover:from-[#b45cff]
                        hover:to-[#d17cff]

                        hover:shadow-[0_10px_30px_rgba(168,85,247,0.32)]

                        active:scale-[0.98]
                    "
                >
                    <span className="text-lg leading-none">
                        +
                    </span>

                    New conversation
                </button>

                {/* DIVIDER */}

                <div className="mx-4 h-px bg-[#291535]" />

                {/* ====================================================
                    CHAT HISTORY
                ==================================================== */}

                <div
                    className="
                        flex-1

                        overflow-y-auto

                        px-4
                        py-5

                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#352040]
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
                                    {/* SECTION TITLE */}

                                    <div
                                        className="
                                            mb-2

                                            flex
                                            items-center
                                            gap-2

                                            px-2
                                        "
                                    >
                                        <span
                                            className="
                                                h-1.5
                                                w-1.5

                                                rounded-full

                                                bg-[#b967ff]

                                                shadow-[0_0_8px_rgba(185,103,255,0.7)]
                                            "
                                        />

                                        <h3
                                            className="
                                                text-[10px]

                                                font-bold
                                                uppercase

                                                tracking-[0.18em]

                                                text-[#75687e]
                                            "
                                        >
                                            {section}
                                        </h3>
                                    </div>

                                    {/* CHATS */}

                                    <div className="space-y-1">
                                        {sectionChats
                                            .slice()
                                            .reverse()
                                            .map(
                                                (
                                                    chat
                                                ) => {
                                                    const active =
                                                        activeChat?._id ===
                                                        chat._id;

                                                    return (
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

                                                                rounded-lg

                                                                border

                                                                px-3
                                                                py-2.5

                                                                text-left

                                                                transition-all
                                                                duration-150

                                                                ${active
                                                                    ? `
                                                                            border-[#713b91]/50
                                                                            bg-[#251133]
                                                                            text-[#f5eff8]

                                                                            shadow-[inset_3px_0_0_#b967ff]
                                                                        `
                                                                    : `
                                                                            border-transparent
                                                                            text-[#918398]

                                                                            hover:bg-[#1d0d29]
                                                                            hover:text-[#eee7f2]
                                                                        `
                                                                }
                                                            `}
                                                        >
                                                            {/* ICON */}

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

                                                                    ${active
                                                                        ? `
                                                                                bg-[#a855f7]
                                                                                text-white

                                                                                shadow-[0_0_12px_rgba(168,85,247,0.3)]
                                                                            `
                                                                        : `
                                                                                bg-[#211229]
                                                                                text-[#806d8d]
                                                                            `
                                                                    }
                                                                `}
                                                            >
                                                                ✦
                                                            </div>

                                                            {/* TITLE */}

                                                            <span className="min-w-0 flex-1 truncate text-xs">
                                                                {getChatTitle(
                                                                    chat
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                }
                                            )}
                                    </div>
                                </div>
                            );
                        }
                    )}

                    {/* EMPTY */}

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
                                    border-[#30203a]

                                    bg-[#1a0c25]

                                    text-[#9d5fc1]

                                    shadow-[0_0_25px_rgba(168,85,247,0.08)]
                                "
                            >
                                ✦
                            </div>

                            <p className="text-sm text-[#918398]">
                                No conversations
                            </p>

                            <p className="mt-1 text-[11px] text-[#62576a]">
                                Start your first chat
                            </p>
                        </div>
                    )}
                </div>

                {/* ====================================================
                    DELETE HISTORY
                ==================================================== */}

                <div
                    className="
                        border-t
                        border-[#291535]

                        p-4
                    "
                >
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

                            text-[#75687e]

                            transition-all

                            hover:bg-red-500/[0.08]
                            hover:text-red-400

                            disabled:cursor-not-allowed
                            disabled:opacity-30
                        "
                    >
                        <span>
                            🗑
                        </span>

                        Delete history
                    </button>
                </div>
            </aside>

            {/* ========================================================
                MAIN CONTENT
            ======================================================== */}

            <main className="flex min-w-0 flex-1 flex-col">
                {/* ====================================================
                    HEADER
                ==================================================== */}

                <header
                    className="
                        z-20

                        flex
                        h-16
                        shrink-0

                        items-center

                        border-b
                        border-[#291535]

                        bg-[#11081a]/95

                        px-4

                        backdrop-blur-xl

                        md:px-5
                    "
                >
                    {/* SIDEBAR BUTTON */}

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
                            border-[#30203a]

                            bg-[#1a0d25]

                            text-[#9b8fa3]

                            transition-all

                            hover:border-[#744391]
                            hover:bg-[#251132]
                            hover:text-[#eee7f2]

                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#b967ff]/30
                        "
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>

                    {/* HEADER TITLE */}

                    <div className="ml-3 min-w-0">
                        <h2
                            className="
                                max-w-[250px]

                                truncate

                                text-[13px]
                                font-semibold
                                tracking-tight

                                text-[#f5eff8]

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

                                    bg-[#b967ff]

                                    shadow-[0_0_8px_rgba(185,103,255,0.8)]
                                "
                            />

                            <span className="text-[10px] text-[#75687e]">
                                AI Assistant
                            </span>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}

                    <div className="ml-auto flex items-center gap-2">
                        <div
                            className="
                                hidden
                                rounded-full

                                border
                                border-[#30203a]

                                bg-[#180c22]

                                px-3
                                py-1.5

                                text-[10px]

                                text-[#75687e]

                                sm:block
                            "
                        >
                            Online
                        </div>
                    </div>
                </header>

                {/* ====================================================
                    CHAT AREA
                ==================================================== */}

                <div
                    className="
                        flex-1

                        overflow-y-auto

                        bg-[#0f0718]

                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-[#352040]
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
                        {/* ==================================================
                            WELCOME SCREEN
                        ================================================== */}

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
                                    {/* AI ICON */}

                                    <div
                                        className="
                                            relative

                                            mb-7

                                            flex
                                            h-20
                                            w-20

                                            items-center
                                            justify-center

                                            rounded-[22px]

                                            border
                                            border-[#6d3989]/40

                                            bg-gradient-to-br
                                            from-[#2b123b]
                                            to-[#160b21]

                                            text-sm
                                            font-black

                                            text-[#c878ff]

                                            shadow-[0_0_50px_rgba(168,85,247,0.15)]
                                        "
                                    >
                                        <div
                                            className="
                                                absolute
                                                inset-2

                                                rounded-[17px]

                                                border
                                                border-[#b967ff]/20
                                            "
                                        />

                                        <span className="relative">
                                            AI
                                        </span>
                                    </div>

                                    {/* TITLE */}

                                    <h2
                                        className="
                                            text-3xl

                                            font-semibold

                                            tracking-[-0.04em]

                                            text-[#f7f1fa]

                                            md:text-[36px]
                                        "
                                    >
                                        What are you
                                        working on?
                                    </h2>

                                    {/* DESCRIPTION */}

                                    <p
                                        className="
                                            mt-3

                                            max-w-md

                                            text-sm

                                            leading-6

                                            text-[#807487]
                                        "
                                    >
                                        Ask anything
                                        and let AI
                                        help you move
                                        forward.
                                    </p>

                                    {/* SUGGESTIONS */}

                                    <div
                                        className="
                                            mt-8

                                            flex

                                            flex-wrap

                                            justify-center

                                            gap-2
                                        "
                                    >
                                        {[
                                            "Explain something",
                                            "Write code",
                                            "Debug my code",
                                            "Learn a topic",
                                        ].map(
                                            (
                                                item
                                            ) => (
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
                                                        border-[#30203a]

                                                        bg-[#170b22]

                                                        px-4
                                                        py-2.5

                                                        text-[11px]

                                                        font-medium

                                                        text-[#9d91a5]

                                                        transition-all

                                                        hover:-translate-y-0.5

                                                        hover:border-[#8d4bb4]

                                                        hover:bg-[#24102f]

                                                        hover:text-[#eee7f2]

                                                        hover:shadow-[0_5px_20px_rgba(168,85,247,0.12)]
                                                    "
                                                >
                                                    {
                                                        item
                                                    }
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* ==================================================
                            ACTIVE CHAT
                        ================================================== */}

                        {activeChat && (
                            <div className="flex flex-col gap-8">
                                {/* =================================================
                                    USER MESSAGE
                                ================================================= */}

                                <div className="flex justify-end">
                                    <div
                                        className="
                                            max-w-[85%]

                                            rounded-[18px]
                                            rounded-br-md

                                            bg-gradient-to-br
                                            from-[#b45df2]
                                            to-[#9749d3]

                                            px-4
                                            py-3

                                            text-[13px]

                                            font-medium

                                            leading-6

                                            text-white

                                            shadow-[0_8px_25px_rgba(168,85,247,0.18)]

                                            md:max-w-[75%]

                                            md:px-5
                                        "
                                    >
                                        {
                                            activeChat.userMessage
                                        }
                                    </div>
                                </div>

                                {/* =================================================
                                    AI MESSAGE
                                ================================================= */}

                                <div className="flex items-start gap-3 md:gap-4">
                                    {/* AI ICON */}

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
                                            border-[#603477]/50

                                            bg-gradient-to-br
                                            from-[#2b123c]
                                            to-[#190c24]

                                            text-[9px]

                                            font-black

                                            text-[#c878ff]

                                            shadow-[0_0_15px_rgba(168,85,247,0.08)]
                                        "
                                    >
                                        AI
                                    </div>

                                    {/* AI CONTENT */}

                                    <div
                                        className="
                                            min-w-0

                                            max-w-[calc(100%-3rem)]

                                            rounded-2xl

                                            border
                                            border-[#2a1735]

                                            bg-[#170b22]

                                            px-4
                                            py-3

                                            text-[13px]

                                            leading-7

                                            text-[#c7bdcc]

                                            shadow-[0_5px_25px_rgba(0,0,0,0.15)]

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

                        {/* ==================================================
                            LOADING
                        ================================================== */}

                        {loading && (
                            <div className="mt-8 flex items-start gap-3 md:gap-4">
                                {/* AI ICON */}

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
                                        border-[#603477]/50

                                        bg-[#21102d]

                                        text-[9px]

                                        font-black

                                        text-[#c878ff]
                                    "
                                >
                                    AI
                                </div>

                                {/* DOTS */}

                                <div
                                    className="
                                        flex

                                        items-center
                                        gap-1.5

                                        rounded-2xl

                                        border
                                        border-[#2a1735]

                                        bg-[#170b22]

                                        px-4
                                        py-4
                                    "
                                >
                                    <span
                                        className="
                                            h-1.5
                                            w-1.5

                                            animate-bounce

                                            rounded-full

                                            bg-[#9c55d1]
                                        "
                                    />

                                    <span
                                        className="
                                            h-1.5
                                            w-1.5

                                            animate-bounce

                                            rounded-full

                                            bg-[#9c55d1]

                                            [animation-delay:150ms]
                                        "
                                    />

                                    <span
                                        className="
                                            h-1.5
                                            w-1.5

                                            animate-bounce

                                            rounded-full

                                            bg-[#9c55d1]

                                            [animation-delay:300ms]
                                        "
                                    />
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* ====================================================
                    INPUT AREA
                ==================================================== */}

                <div
                    className="
                        shrink-0

                        border-t
                        border-[#291535]

                        bg-[#11081a]/95

                        px-3
                        py-3

                        backdrop-blur-xl

                        md:px-5
                    "
                >
                    <form
                        onSubmit={handleSubmit}
                        className="
                            mx-auto
                            w-full
                            max-w-4xl
                        "
                    >
                        {/* INPUT CONTAINER */}

                        <div
                            className="
                                flex

                                items-center

                                gap-2

                                rounded-xl

                                border
                                border-[#30203a]

                                bg-[#160b20]

                                p-1.5

                                shadow-[0_10px_35px_rgba(0,0,0,0.35)]

                                transition-all

                                focus-within:border-[#8145a5]

                                focus-within:ring-4

                                focus-within:ring-[#a855f7]/[0.06]
                            "
                        >
                            {/* ATTACH BUTTON */}

                            <button
                                type="button"
                                className="
                                    flex

                                    h-9
                                    w-9

                                    shrink-0

                                    items-center
                                    justify-center

                                    rounded-lg

                                    text-lg

                                    text-[#75687e]

                                    transition-all

                                    hover:bg-[#24102f]

                                    hover:text-[#c878ff]
                                "
                                aria-label="Add attachment"
                            >
                                +
                            </button>

                            {/* INPUT */}

                            <input
                                type="text"
                                value={text}
                                onChange={(event) =>
                                    setText(
                                        event.target
                                            .value
                                    )
                                }
                                disabled={loading}
                                placeholder="Write a message..."
                                className="
                                    min-w-0

                                    flex-1

                                    bg-transparent

                                    px-3
                                    py-2.5

                                    text-[13px]

                                    text-[#eee7f2]

                                    outline-none

                                    placeholder:text-[#63586b]

                                    disabled:cursor-not-allowed

                                    disabled:opacity-50
                                "
                            />

                            {/* SEND BUTTON */}

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

                                    rounded-lg

                                    bg-gradient-to-br
                                    from-[#b45df2]
                                    to-[#9447d0]

                                    text-white

                                    shadow-[0_5px_20px_rgba(168,85,247,0.22)]

                                    transition-all

                                    hover:from-[#c06cff]
                                    hover:to-[#a451df]

                                    hover:shadow-[0_7px_25px_rgba(168,85,247,0.32)]

                                    active:scale-95

                                    disabled:cursor-not-allowed

                                    disabled:bg-[#302438]

                                    disabled:bg-none

                                    disabled:text-[#665a6e]

                                    disabled:shadow-none
                                "
                                aria-label="Send message"
                            >
                                ↑
                            </button>
                        </div>

                        {/* DISCLAIMER */}

                        <p
                            className="
                                mt-2

                                text-center

                                text-[9px]

                                text-[#51475a]
                            "
                        >
                            AI can make mistakes.
                            Check important
                            information.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChatSection;