/// <reference lib="webworker" />

import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute
} from "workbox-precaching";

import {
    NavigationRoute,
    registerRoute
} from "workbox-routing";

cleanupOutdatedCaches();

/*
 * Väga oluline:
 * injectManifest otsib täpselt self.__WB_MANIFEST
 */
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("activate", event => {
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

/* self.addEventListener(
    "push",
    event => {
        const payload =
            event.data?.json() || {};

        event.waitUntil(
            self.registration.showNotification(
                payload.title || "DuunHub",
                {
                    body:
                        payload.body ||
                        "Sul on uus teade.",

                    icon:
                        "/icon-192x192.png",

                    badge:
                        "/favicon-48x48.png",

                    data: {
                        url:
                            payload.url || "/"
                    }
                }
            )
        );
    }
);
 */
const navigationHandler =
    createHandlerBoundToURL("/index.html");

registerRoute(
    new NavigationRoute(navigationHandler, {
        denylist: [
            /^\/api\//,
            /^\/socket\.io\//
        ]
    })
);

self.addEventListener("push", event => {
    let payload = {};

    try {
        payload =
            event.data?.json() || {};
    } catch {
        payload = {};
    }

    const unreadCount =
        Number(
            payload.unreadCount || 0
        );

    const options = {
        body:
            payload.body ||
            "Sul on uus teade.",

        icon:
            "/icon-192x192.png",

        data: {
            url:
                payload.url || "/",

            conversationId:
                payload.conversationId ||
                null
        },

        tag:
            payload.tag ||
            "duunhub-notification",

        renotify: true
    };

    event.waitUntil(
        Promise.all([
            self.registration
                .showNotification(
                    payload.title ||
                    "DuunHub",
                    options
                ),

            unreadCount > 0 &&
                typeof self.navigator
                    .setAppBadge === "function"

                ? self.navigator
                    .setAppBadge(
                        unreadCount
                    )

                : Promise.resolve()
        ])
    );
});

self.addEventListener(
    "notificationclick",
    event => {
        event.notification.close();

        const conversationId =
            event.notification.data?.conversationId;

        const targetUrl = conversationId
            ? `/?pushConversation=${encodeURIComponent(conversationId)}`
            : "/";

        event.waitUntil(
            self.clients
                .matchAll({
                    type: "window",
                    includeUncontrolled: true
                })
                .then(async clientList => {

                    /*
                     * Äpp on juba olemas.
                     */
                    if (clientList.length > 0) {
                        const client = clientList[0];

                        await client.focus();

                        client.postMessage({
                            type: "PUSH_CONVERSATION",
                            conversationId
                        });

                        return;
                    }

                    /*
                     * Äpp oli täielikult suletud.
                     *
                     * conversationId anname URL-is kaasa,
                     * sest Vue rakendust pole veel olemas,
                     * millele postMessage saata.
                     */
                    return self.clients.openWindow(
                        targetUrl
                    );
                })
        );
    }
);