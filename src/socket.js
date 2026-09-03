import { io } from "socket.io-client";


const SOCKET_INSTANCE =
    crypto.randomUUID();

/* console.log(
    "🧩 SOCKET.JS INSTANCE CREATED:",
    SOCKET_INSTANCE,
    "window:",
    window.location.href,
    "top window:",
    window === window.top
); */



console.log(
    "Socket URL:",
    import.meta.env.VITE_SOCKET_URL
);

const URL =
    import.meta.env.VITE_SOCKET_URL;

const socket = io(URL, {
    autoConnect: false,

    reconnection: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,

    transports: [
        "websocket",
        "polling"
    ]
});


const updateSocketAuth = () => {
    const raw =
        localStorage.getItem(
            "loggedAppUser"
        ) || sessionStorage.getItem("loggedAppUser");

    if (!raw) {
        socket.auth = {};
        return;
    }

    try {
        const appUser =
            JSON.parse(raw);

        socket.auth = {
            token: appUser?.token
        };

    } catch (error) {
        console.error(
            "Failed to read socket token:",
            error
        );

        socket.auth = {};
    }
};


socket.on("connect", () => {
    console.log(
        "Socket connected:",
        socket.id
    );
});


socket.on(
    "connect_error",
    err => {
        console.error(
            "Socket connect error:",
            err.message
        );
    }
);


socket.on(
    "disconnect",
    reason => {
        console.log(
            "Socket disconnected:",
            reason
        );
    }
);


socket.offAny();

/*
 * Ainult üks onAny on piisav.
 */
socket.onAny(
    (event, ...args) => {
        console.log(
            "Socket event:",
            event,
            args
        );

    }
);


/*
 * Vite HMR:
 * vana socket tuleb enne mooduli
 * asendamist sulgeda.
 */
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        console.log(
            "HMR: disconnecting old socket"
        );

        socket.disconnect();
    });
}


export {
    updateSocketAuth
};

export default socket;