(function () {
  class LocalDevReloadGuard {
    constructor(win) {
      this.window = win;
      this.NativeWebSocket = win.WebSocket;
      this.blockedMessages = new Set(["reload", "refreshcss"]);
    }

    install() {
      if (!this.shouldInstall()) {
        return;
      }

      const guard = this;
      const NativeWebSocket = this.NativeWebSocket;

      this.window.WebSocket = new Proxy(NativeWebSocket, {
        construct(target, args) {
          const socket = Reflect.construct(target, args);
          if (!guard.isLiveServerSocket(args[0])) {
            return socket;
          }
          return guard.wrapSocket(socket);
        }
      });

      this.window.__synapseLiveServerReloadGuard = true;
    }

    shouldInstall() {
      const { hostname, port } = this.window.location;
      const isLocalHost = ["127.0.0.1", "localhost", "::1", "[::1]"].includes(String(hostname || "").toLowerCase());
      const portNumber = Number(port);
      const isLiveServerPort = portNumber >= 5500 && portNumber <= 5599;
      return Boolean(this.NativeWebSocket && isLocalHost && isLiveServerPort);
    }

    isLiveServerSocket(url) {
      const rawURL = String(url || "");
      return rawURL.includes("/ws") && rawURL.includes(this.window.location.host);
    }

    wrapSocket(socket) {
      let assignedHandler = null;
      const isBlocked = event => this.blockedMessages.has(event?.data);
      const addMessageListener = socket.addEventListener.bind(socket);

      addMessageListener("message", event => {
        if (isBlocked(event)) {
          event.stopImmediatePropagation?.();
        }
      });

      try {
        Object.defineProperty(socket, "onmessage", {
          configurable: true,
          get() {
            return assignedHandler;
          },
          set(handler) {
            assignedHandler = handler;
          }
        });
      } catch (error) {
        return socket;
      }

      addMessageListener("message", event => {
        if (isBlocked(event) || typeof assignedHandler !== "function") {
          return;
        }
        assignedHandler.call(socket, event);
      });

      return socket;
    }
  }

  new LocalDevReloadGuard(window).install();
})();
