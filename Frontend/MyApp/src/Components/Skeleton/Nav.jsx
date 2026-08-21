import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import axios from "axios";

const ChatSection = () => {
    const [chats, setChats] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [activeChat, setActiveChat] = useState(null);

    const chatEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;
    console.log(API_URL)

    // ============================================================
    // RESPONSIVE SIDEBAR
    // ============================================================

    useEffect(() => {
        const media = window.matchMedia(
            "(max-width: 767px)"
        );

        const updateSidebar = (e) => {
            setIsMobile(e.matches);
            setSidebarOpen(!e.matches);
        };

        setIsMobile(media.matches);
        setSidebarOpen(!media.matches);

        media.addEventListener(
            "change",
            updateSidebar
        );

        return () =>
            media.removeEventListener(
                "change",
                updateSidebar
            );
    }, []);

    // ============================================================
    // FETCH CHATS
    // ============================================================

    const fetchChats = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/user/chats`
            );

            const data =
                response.data.chats || [];

            setChats(data);

            if (data.length > 0) {
                setActiveChat(
                    data[data.length - 1]
                );
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim() || loading) {
            return;
        }

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
                createdAt:
                    new Date().toISOString(),
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

    // ============================================================
    // CLEAR HISTORY
    // ============================================================

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

    // ============================================================
    // GROUP CHATS
    // ============================================================

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
            } else if (
                date >= sevenDaysAgo
            ) {
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

        return chat.userMessage.length > 32
            ? chat.userMessage.substring(
                0,
                32
            ) + "..."
            : chat.userMessage;
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div
            className="
                flex
                h-dvh
                w-full
                overflow-hidden

                bg-[#170b24]

                text-[#f5eff8]

                font-sans
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

                    md:relative
                    md:z-auto

                    ${sidebarOpen
                        ? "w-[285px] translate-x-0"
                        : "w-0 -translate-x-full"
                    }
                `}
            >
                {/* ====================================================
                    SIDEBAR HEADER
                ==================================================== */}

                <div
                    className="
                        flex
                        items-center
                        gap-3

                        px-5
                        pb-5
                        pt-5
                    "
                >
                    {/* AI LOGO */}

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
                        AI
                    </div>

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

                        <p
                            className="
                                mt-0.5

                                text-[11px]

                                text-[#75687e]
                            "
                        >
                            Your intelligent assistant
                        </p>
                    </div>
                </div>

                {/* ====================================================
                    NEW CHAT
                ==================================================== */}

                <div className="px-4 pb-5">
                    <button
                        onClick={handleNewChat}
                        className="
                            flex
                            h-11
                            w-full

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

                            hover:from-[#b45cff]
                            hover:to-[#d17cff]

                            hover:shadow-[0_10px_30px_rgba(168,85,247,0.32)]

                            active:scale-[0.98]
                        "
                    >
                        <span className="text-lg">
                            +
                        </span>

                        New conversation
                    </button>
                </div>

                {/* DIVIDER */}

                <div className="mx-4 h-px bg-[#291535]" />

                {/* ====================================================
                    HISTORY
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
                                    {/* SECTION */}

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

                                                shadow-[0_0_8px_rgba(185,103,255,0.8)]
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

                                    {/* CHAT LIST */}

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

                                                            <span
                                                                className={`
                                                                    min-w-0
                                                                    flex-1
                                                                    truncate

                                                                    text-xs

                                                                    ${active
                                                                        ? "text-[#f5eff8]"
                                                                        : "text-[#918398] group-hover:text-[#eee7f2]"
                                                                    }
                                                                `}
                                                            >
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
                                "
                            >
                                ✦
                            </div>

                            <p className="text-sm text-[#807487]">
                                No conversations
                            </p>

                            <p className="mt-1 text-[11px] text-[#5f5368]">
                                Start your first chat
                            </p>
                        </div>
                    )}
                </div>

                {/* ====================================================
                    MOBILE USER
                ==================================================== */}

                <div
                    className="
                        border-t
                        border-[#291535]

                        p-4

                        md:hidden
                    "
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-10
                                w-10

                                items-center
                                justify-center

                                rounded-xl

                                bg-gradient-to-br
                                from-[#b45df2]
                                to-[#9447d0]

                                text-sm
                                font-bold

                                text-white
                            "
                        >
                            U
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#eee7f2]">
                                User
                            </p>

                            <p className="truncate text-[11px] text-[#75687e]">
                                AI Workspace
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setSidebarOpen(
                                    false
                                )
                            }
                            className="
                                flex
                                h-8
                                w-8

                                items-center
                                justify-center

                                rounded-lg

                                text-[#75687e]

                                hover:bg-[#24102f]

                                hover:text-white
                            "
                        >
                            ×
                        </button>
                    </div>
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
                            py-3

                            text-xs

                            text-[#75687e]

                            transition

                            hover:bg-red-500/[0.08]
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

            {/* ========================================================
                MAIN
            ======================================================== */}

            <main className="flex min-w-0 flex-1 flex-col">
                {/* ====================================================
                    HEADER
                ==================================================== */}

                <header
                    className="
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

                            items-center
                            justify-center

                            rounded-lg

                            border
                            border-[#30203a]

                            bg-[#1a0d25]

                            text-[#9b8fa3]

                            transition

                            hover:border-[#744391]

                            hover:bg-[#251132]

                            hover:text-white

                            md:flex
                        "
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

                            items-center
                            justify-center

                            rounded-lg

                            border
                            border-[#30203a]

                            bg-[#1a0d25]

                            text-[#9b8fa3]

                            hover:text-white

                            md:hidden
                        "
                    >
                        ☰
                    </button>

                    {/* TITLE */}

                    <div className="ml-3 min-w-0">
                        <h2
                            className="
                                max-w-[260px]

                                truncate

                                text-[13px]
                                font-semibold

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

                    {/* RIGHT */}

                    <div className="ml-auto hidden sm:block">
                        <div
                            className="
                                rounded-full

                                border
                                border-[#30203a]

                                bg-[#180c22]

                                px-3
                                py-1.5

                                text-[10px]

                                text-[#75687e]
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
                            WELCOME
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
                                    {/* ICON */}

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
                                                        border-[#30203a]

                                                        bg-[#170b22]

                                                        px-4
                                                        py-2.5

                                                        text-[11px]

                                                        text-[#9d91a5]

                                                        transition

                                                        hover:border-[#8d4bb4]

                                                        hover:bg-[#24102f]

                                                        hover:text-[#eee7f2]
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
                            CHAT
                        ================================================== */}

                        {activeChat && (
                            <div className="space-y-8">
                                {/* USER */}

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

                                {/* AI */}

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

                                    {/* RESPONSE */}

                                    <div
                                        className="
                                            max-w-[85%]

                                            rounded-2xl

                                            border
                                            border-[#2a1735]

                                            bg-[#170b22]

                                            px-4
                                            py-3

                                            text-[13px]

                                            leading-7

                                            text-[#c7bdcc]

                                            whitespace-pre-wrap

                                            shadow-[0_5px_25px_rgba(0,0,0,0.15)]

                                            md:text-sm
                                        "
                                    >
                                        {
                                            activeChat.aiResponse
                                        }
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

                                {/* LOADING */}

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

                                            bg-[#a855f7]
                                        "
                                    />

                                    <span
                                        className="
                                            h-1.5
                                            w-1.5

                                            animate-bounce

                                            rounded-full

                                            bg-[#a855f7]

                                            [animation-delay:150ms]
                                        "
                                    />

                                    <span
                                        className="
                                            h-1.5
                                            w-1.5

                                            animate-bounce

                                            rounded-full

                                            bg-[#a855f7]

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
                    INPUT
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

                                transition

                                focus-within:border-[#8145a5]

                                focus-within:ring-4

                                focus-within:ring-[#a855f7]/[0.06]
                            "
                        >
                            {/* PLUS */}

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

                                    transition

                                    hover:bg-[#24102f]

                                    hover:text-[#c878ff]
                                "
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

                                    rounded-lg

                                    bg-gradient-to-br
                                    from-[#b45df2]
                                    to-[#9447d0]

                                    text-white

                                    shadow-[0_5px_20px_rgba(168,85,247,0.22)]

                                    transition

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
                            AI may occasionally
                            generate incorrect
                            information.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChatSection;