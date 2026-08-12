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
    event.waitUntil(self.clients.claim());
});

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
        payload = event.data?.json() || {};
    } catch {
        payload = {
            title: "DuunHub",
            body: event.data?.text() || "Sul on uus teade."
        };
    }

    const title =
        payload.title || "DuunHub";

    const unreadCount =
        Number(payload.unreadCount || 1);

    const options = {
        body:
            payload.body ||
            "Sul on uus teade.",

        icon: "/icon-192x192.png",
        badge: "/favicon-48x48.png",

        data: {
            url: payload.url || "/",
            notificationId:
                payload.notificationId || null
        },

        tag:
            payload.tag ||
            "duunhub-notification",

        renotify: true
    };

    event.waitUntil(
        Promise.all([
            self.registration.showNotification(
                title,
                options
            ),

            typeof self.registration.setAppBadge ===
                "function"
                ? self.registration.setAppBadge(
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

        const targetUrl =
            event.notification.data?.url || "/";

        event.waitUntil(
            self.clients
                .matchAll({
                    type: "window",
                    includeUncontrolled: true
                })
                .then(clientList => {
                    const matchingClient =
                        clientList.find(client => {
                            return (
                                new URL(client.url).pathname ===
                                targetUrl
                            );
                        });

                    if (matchingClient) {
                        return matchingClient.focus();
                    }

                    return self.clients.openWindow(
                        targetUrl
                    );
                })
        );
    }
);