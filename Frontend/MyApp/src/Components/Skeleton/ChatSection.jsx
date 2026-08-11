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
    const [activeChat, setActiveChat] = useState(null);

    const chatEndRef = useRef(null);

    // ==============================
    // FETCH CHATS
    // ==============================

    const fetchChats = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3000/api/user/chats"
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

    // ==============================
    // AUTO SCROLL
    // ==============================

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [activeChat, loading]);

    // ==============================
    // NEW CHAT
    // ==============================

    const handleNewChat = () => {
        setActiveChat(null);
        setText("");
    };

    // ==============================
    // SEND MESSAGE
    // ==============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim() || loading) return;

        const userText = text.trim();

        setText("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:3000/api/user/chat",
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

    // ==============================
    // CLEAR HISTORY
    // ==============================

    const clearAllChats = async () => {
        const confirmDelete = window.confirm(
            "Delete all chat history?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(
                "http://localhost:3000/api/user/chats"
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

    // ==============================
    // GROUP CHATS
    // ==============================

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

    // ==============================
    // CHAT TITLE
    // ==============================

    const getChatTitle = (chat) => {
        if (!chat?.userMessage) {
            return "New conversation";
        }

        return chat.userMessage.length > 30
            ? chat.userMessage.substring(0, 30) +
                  "..."
            : chat.userMessage;
    };

    // ==============================
    // UI
    // ==============================

    return (
        <div className="h-screen bg-[#10100f] text-[#e8e3da] flex overflow-hidden">

            {/* =================================
                SIDEBAR
            ================================= */}

            <aside
                className={`
                    ${
                        sidebarOpen
                            ? "w-[290px]"
                            : "w-0"
                    }

                    h-full
                    bg-[#171614]
                    border-r
                    border-[#302d28]
                    flex
                    flex-col
                    transition-all
                    duration-300
                    overflow-hidden
                    shrink-0
                `}
            >

                {/* LOGO */}

                <div className="px-5 pt-5 pb-4">

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-[#c47b45]
                                text-[#171614]
                                flex
                                items-center
                                justify-center
                                font-black
                                text-sm
                                shadow-lg
                                shadow-[#c47b45]/10
                            "
                        >
                            AI
                        </div>

                        <div>
                            <h1 className="font-semibold text-[15px]">
                                AI Workspace
                            </h1>

                            <p className="text-[11px] text-[#777169]">
                                Your intelligent assistant
                            </p>
                        </div>

                    </div>

                </div>

                {/* NEW CHAT */}

                <div className="px-4 pb-5">

                    <button
                        onClick={handleNewChat}
                        className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-3
                            rounded-xl
                            bg-[#c47b45]
                            text-[#171614]
                            font-semibold
                            text-sm
                            hover:bg-[#d18a52]
                            active:scale-[0.98]
                            transition
                        "
                    >
                        <span className="text-lg">
                            +
                        </span>

                        New conversation
                    </button>

                </div>

                {/* DIVIDER */}

                <div className="mx-4 border-t border-[#302d28]" />

                {/* HISTORY */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        px-4
                        py-5
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
                                            flex
                                            items-center
                                            gap-2
                                            px-2
                                            mb-2
                                        "
                                    >

                                        <span className="text-[10px] text-[#c47b45]">
                                            ●
                                        </span>

                                        <h3
                                            className="
                                                text-[10px]
                                                uppercase
                                                tracking-[0.18em]
                                                font-bold
                                                text-[#746e66]
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
                                                        onClick={() =>
                                                            setActiveChat(
                                                                chat
                                                            )
                                                        }
                                                        className={`
                                                            group
                                                            w-full
                                                            flex
                                                            items-center
                                                            gap-3
                                                            px-3
                                                            py-3
                                                            rounded-xl
                                                            text-left
                                                            transition

                                                            ${
                                                                activeChat?._id ===
                                                                chat._id
                                                                    ? "bg-[#292621] border border-[#403a33]"
                                                                    : "border border-transparent hover:bg-[#211f1c]"
                                                            }
                                                        `}
                                                    >

                                                        <div
                                                            className={`
                                                                w-7
                                                                h-7
                                                                rounded-lg
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-xs
                                                                shrink-0

                                                                ${
                                                                    activeChat?._id ===
                                                                    chat._id
                                                                        ? "bg-[#c47b45] text-[#171614]"
                                                                        : "bg-[#24211e] text-[#837b71]"
                                                                }
                                                            `}
                                                        >
                                                            ✦
                                                        </div>

                                                        <span
                                                            className={`
                                                                truncate
                                                                text-sm

                                                                ${
                                                                    activeChat?._id ===
                                                                    chat._id
                                                                        ? "text-[#e8e3da]"
                                                                        : "text-[#918a81] group-hover:text-[#d8d2c8]"
                                                                }
                                                            `}
                                                        >
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

                    {/* EMPTY */}

                    {chats.length === 0 && (
                        <div className="text-center py-12">

                            <div
                                className="
                                    w-12
                                    h-12
                                    mx-auto
                                    rounded-2xl
                                    border
                                    border-[#302d28]
                                    bg-[#1e1c19]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#756e66]
                                    mb-4
                                "
                            >
                                ✦
                            </div>

                            <p className="text-sm text-[#807970]">
                                No conversations
                            </p>

                            <p className="text-xs text-[#57524c] mt-1">
                                Start your first chat
                            </p>

                        </div>
                    )}

                </div>

                {/* SIDEBAR FOOTER */}

                <div
                    className="
                        border-t
                        border-[#302d28]
                        p-4
                    "
                >

                    <button
                        onClick={
                            clearAllChats
                        }
                        disabled={
                            chats.length === 0
                        }
                        className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-3
                            py-3
                            rounded-xl
                            text-sm
                            text-[#756e66]
                            hover:bg-[#2a1c1a]
                            hover:text-red-400
                            disabled:opacity-30
                            transition
                        "
                    >

                        <span>
                            🗑
                        </span>

                        Delete history

                    </button>

                </div>

            </aside>

            {/* =================================
                MAIN
            ================================= */}

            <main className="flex-1 flex flex-col min-w-0">

                {/* TOP NAV */}

                <header
                    className="
                        h-[64px]
                        flex
                        items-center
                        px-5
                        border-b
                        border-[#302d28]
                        bg-[#121110]
                        shrink-0
                    "
                >

                    <button
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                        className="
                            w-9
                            h-9
                            rounded-lg
                            border
                            border-[#302d28]
                            bg-[#191816]
                            text-[#827b72]
                            hover:text-[#e8e3da]
                            hover:border-[#4a443c]
                            transition
                        "
                    >
                        ☰
                    </button>

                    <div className="ml-4">

                        <h2 className="text-sm font-semibold">
                            {activeChat
                                ? getChatTitle(
                                      activeChat
                                  )
                                : "New conversation"}
                        </h2>

                        <div className="flex items-center gap-2 mt-0.5">

                            <span className="w-1.5 h-1.5 rounded-full bg-[#c47b45]" />

                            <span className="text-[10px] text-[#716b63]">
                                AI Assistant
                            </span>

                        </div>

                    </div>

                </header>

                {/* CHAT AREA */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        bg-[#10100f]
                    "
                >

                    <div
                        className="
                            max-w-4xl
                            mx-auto
                            px-5
                            py-10
                        "
                    >

                        {/* WELCOME */}

                        {!activeChat &&
                            !loading && (
                                <div
                                    className="
                                        min-h-[60vh]
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            relative
                                            w-20
                                            h-20
                                            rounded-[24px]
                                            bg-[#1b1917]
                                            border
                                            border-[#403a33]
                                            flex
                                            items-center
                                            justify-center
                                            mb-7
                                        "
                                    >

                                        <div
                                            className="
                                                absolute
                                                inset-2
                                                rounded-[18px]
                                                border
                                                border-[#c47b45]/30
                                            "
                                        />

                                        <span className="text-[#c47b45] font-black">
                                            AI
                                        </span>

                                    </div>

                                    <h2
                                        className="
                                            text-3xl
                                            font-semibold
                                            tracking-tight
                                            text-[#eee8df]
                                        "
                                    >
                                        What are you
                                        working on?
                                    </h2>

                                    <p
                                        className="
                                            mt-3
                                            text-sm
                                            text-[#777068]
                                        "
                                    >
                                        Ask anything and
                                        let AI help you
                                        move forward.
                                    </p>

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
                                                        px-4
                                                        py-2.5
                                                        rounded-full
                                                        border
                                                        border-[#302d28]
                                                        bg-[#171614]
                                                        text-xs
                                                        text-[#918a81]
                                                        hover:border-[#c47b45]/50
                                                        hover:text-[#d8d2c8]
                                                        transition
                                                    "
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                        {/* CHAT */}

                        {activeChat && (
                            <div className="space-y-10">

                                {/* USER */}

                                <div className="flex justify-end">

                                    <div
                                        className="
                                            max-w-[75%]
                                            rounded-[20px]
                                            rounded-br-md
                                            bg-[#c47b45]
                                            text-[#171614]
                                            px-5
                                            py-3.5
                                            text-sm
                                            leading-6
                                            font-medium
                                            shadow-lg
                                            shadow-black/10
                                        "
                                    >
                                        {
                                            activeChat.userMessage
                                        }
                                    </div>

                                </div>

                                {/* AI */}

                                <div className="flex gap-4">

                                    <div
                                        className="
                                            w-9
                                            h-9
                                            rounded-xl
                                            bg-[#1c1a18]
                                            border
                                            border-[#403a33]
                                            flex
                                            items-center
                                            justify-center
                                            text-[10px]
                                            font-black
                                            text-[#c47b45]
                                            shrink-0
                                        "
                                    >
                                        AI
                                    </div>

                                    <div
                                        className="
                                            max-w-[85%]
                                            pt-1
                                            text-sm
                                            leading-7
                                            text-[#c8c1b8]
                                            whitespace-pre-wrap
                                        "
                                    >
                                        {
                                            activeChat.aiResponse
                                        }
                                    </div>

                                </div>

                            </div>
                        )}

                        {/* LOADING */}

                        {loading && (
                            <div className="flex gap-4 mt-8">

                                <div
                                    className="
                                        w-9
                                        h-9
                                        rounded-xl
                                        bg-[#1c1a18]
                                        border
                                        border-[#403a33]
                                        flex
                                        items-center
                                        justify-center
                                        text-[10px]
                                        font-black
                                        text-[#c47b45]
                                    "
                                >
                                    AI
                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >

                                    <span className="w-2 h-2 rounded-full bg-[#8c8277] animate-pulse" />

                                    <span className="w-2 h-2 rounded-full bg-[#8c8277] animate-pulse [animation-delay:150ms]" />

                                    <span className="w-2 h-2 rounded-full bg-[#8c8277] animate-pulse [animation-delay:300ms]" />

                                </div>

                            </div>
                        )}

                        <div ref={chatEndRef} />

                    </div>

                </div>

                {/* INPUT */}

                <div
                    className="
                        bg-[#121110]
                        border-t
                        border-[#302d28]
                        px-5
                        pt-4
                        pb-3
                    "
                >

                    <form
                        onSubmit={handleSubmit}
                        className="
                            max-w-4xl
                            mx-auto
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-2xl
                                border
                                border-[#403a33]
                                bg-[#1b1917]
                                px-3
                                py-2
                                focus-within:border-[#c47b45]/60
                                transition
                            "
                        >

                            <button
                                type="button"
                                className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    text-[#777068]
                                    hover:text-[#c47b45]
                                    hover:bg-[#25221f]
                                    text-xl
                                    transition
                                "
                            >
                                +
                            </button>

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
                                    flex-1
                                    min-w-0
                                    bg-transparent
                                    outline-none
                                    px-2
                                    py-3
                                    text-sm
                                    text-[#e8e3da]
                                    placeholder:text-[#625d56]
                                "
                            />

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !text.trim()
                                }
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-[#c47b45]
                                    text-[#171614]
                                    font-bold
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-[#d18a52]
                                    active:scale-95
                                    disabled:bg-[#34302b]
                                    disabled:text-[#625d56]
                                    disabled:cursor-not-allowed
                                    transition
                                "
                            >
                                ↑
                            </button>

                        </div>

                        <p
                            className="
                                text-center
                                text-[10px]
                                text-[#514c46]
                                mt-2
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