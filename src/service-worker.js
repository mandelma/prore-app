/// <reference lib="webworker" />

import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute
} from "workbox-precaching";

import { NavigationRoute, registerRoute } from "workbox-routing";

const sw = self;

cleanupOutdatedCaches();

precacheAndRoute(sw.__WB_MANIFEST);

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

sw.addEventListener("push", event => {
    let payload = {};

    try {
        payload = event.data?.json() || {};
    } catch {
        payload = {
            title: "DuunHub",
            body: event.data?.text() || "Sul on uus teade."
        };
    }

    const title = payload.title || "DuunHub";
    const unreadCount = Number(payload.unreadCount || 1);

    const options = {
        body: payload.body || "Sul on uus teade.",
        icon: "/icon-192x192.png",
        badge: "/favicon-48x48.png",

        data: {
            url: payload.url || "/",
            notificationId: payload.notificationId || null
        },

        tag: payload.tag || "duunhub-notification",
        renotify: true
    };

    event.waitUntil(
        Promise.all([
            sw.registration.showNotification(title, options),

            typeof sw.registration.setAppBadge === "function"
                ? sw.registration.setAppBadge(unreadCount)
                : Promise.resolve()
        ])
    );
});

sw.addEventListener("notificationclick", event => {
    event.notification.close();

    const targetUrl =
        event.notification.data?.url || "/";

    event.waitUntil(
        sw.Clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientList => {
            const matchingClient = clientList.find(client => {
                return new URL(client.url).pathname === targetUrl;
            });

            if (matchingClient) {
                return matchingClient.focus();
            }

            return sw.Clients.openWindow(targetUrl);
        })
    );
});