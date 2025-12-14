<template>
    <!-- Launcher -->
    <button
        class="chat-launcher"
        type="button"
        aria-label="Open chat"
        :aria-expanded="String(isOpen)"
        @click="toggle"
    >
        <span v-if="!isOpen">💬</span>
        <span v-else>✕</span>
    </button>

    <!-- Window -->
    <section
        class="chat-window"
        :class="{ open: isOpen }"
        aria-label="Chat window"
        role="dialog"
        aria-modal="false"
    >
        <header class="chat-header">
        <span>Support</span>
        <button class="chat-close" type="button" aria-label="Close chat" @click="close">✕</button>
        </header>

        <div ref="chatBody" class="chat-body">
            <div
                v-for="m in messages"
                :key="m.id"
                class="msg"
                :class="{ me: m.role === 'me' }"
            >
            <div v-if="m.text">{{ m.text }}</div>

            <!-- Images -->
            <div v-for="(f, i) in m.files || []" :key="i">
                <img
                    v-if="f.isImage"
                    :src="f.preview"
                    class="chat-image"
                    alt="sent image"
                />
            </div>
            

            <!-- Non-image files -->
                    
            <div v-for="(f, i) in m.files || []" :key="i">
                <div
                    v-if="!f.isImage"
                    class="file-attachment"
                >
                📄 {{ f.name }}
                </div>
            </div>
            
            </div>
        </div>


        <div v-if="files.length" class="file-preview">
            <div
                v-for="(f, i) in files"
                :key="f.id"
                class="file-chip"
            >
                <!-- Image preview -->
                <img
                v-if="f.isImage"
                :src="f.preview"
                class="img-thumb"
                alt="preview"
                />

                <!-- File name fallback -->
                <span v-else>{{ f.file.name }}</span>

                <button type="button" @click="removeFile(i)">✕</button>
            </div>
        </div>

        <form class="chat-input" @submit.prevent="send">
            <!-- Attachment button -->
            <label class="attach-btn" aria-label="Attach file">
                📎
                <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    @change="onFileSelect"
                    />
            </label>

            <!-- Text input -->
            <input
                ref="chatInput"
                v-model="draft"
                type="text"
                placeholder="Type a message…"
                autocomplete="off"
            />

            <!-- Send -->
            <button type="submit">Send</button>
        </form>
    </section>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const isOpen = ref(false);
    const draft = ref("");
    const messages = ref([
      { id: crypto.randomUUID?.() ?? String(Date.now()), role: "bot", text: "Hi! How can I help?" },
    ]);
    const files = ref([]);

    return { isOpen, draft, messages, files };
  },

  mounted() {
    this._onKeydown = (e) => {
      if (e.key === "Escape") this.close();
    };
    document.addEventListener("keydown", this._onKeydown);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this._onKeydown);
  },

  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) this.$nextTick(() => this.$refs.chatInput?.focus());
    },

    close() {
      this.isOpen = false;
    },

    scrollToBottom() {
      const el = this.$refs.chatBody;
      if (el) el.scrollTop = el.scrollHeight;
    },

    onFileSelect(e) {
      const selected = Array.from(e.target.files || []).map((file) => ({
        file,
        id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
        isImage: file.type?.startsWith("image/"),
        preview: file.type?.startsWith("image/") ? URL.createObjectURL(file) : null,
      }));

      // IMPORTANT: in Vue, refs returned from setup are unwrapped on `this`,
      // so this.files is the array directly.
      this.files.push(...selected);

      // allow selecting the same file again
      e.target.value = "";
    },

    removeFile(index) {
      const f = this.files[index];
      if (f?.preview) URL.revokeObjectURL(f.preview);
      this.files.splice(index, 1);
    },

    async send() {
      if (!this.draft.trim() && !this.files.length) return;

      // Put attachments into the message for UI rendering
      const msgFiles = this.files.map((f) => ({
        name: f.file.name,
        isImage: f.isImage,
        preview: f.preview, // OK for local preview; backend should return URL later
      }));

      this.messages.push({
        id: String(Date.now()),
        role: "me",
        text: this.draft,
        files: msgFiles,
      });

      // Build multipart form
      const form = new FormData();
      form.append("message", this.draft);
      this.files.forEach((f) => form.append("files", f.file));

      // clear input text
      this.draft = "";

      // NOTE: don't revoke previews immediately if you want them to keep showing
      // If you revoke here, images in the sent message may disappear.
      // So either:
      // 1) keep them, OR
      // 2) revoke later when message is removed / replaced with server URL.
      //
      // For now, keep previews alive:
      this.files = [];

      this.$nextTick(this.scrollToBottom);

      // await fetch("/api/chat", { method: "POST", body: form });

      this.messages.push({
        id: String(Date.now() + 1),
        role: "bot",
        text: "Nice photo! 📸",
      });
      this.$nextTick(this.scrollToBottom);
    },
  },
};
</script>
<style scoped>
    :root {
  --shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  --radius: 16px;
  --btn: 56px;
}

/* Launcher button */
.chat-launcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: var(--btn);
  height: var(--btn);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: var(--shadow);
  background: #24304b;
  color: #fff;
  display: grid;
  place-items: center;
  z-index: 9999;
}
.chat-launcher:focus {
  outline: 3px solid rgba(59, 130, 246, 0.6);
  outline-offset: 2px;
}


/* Chat window */
.chat-window {
  position: fixed;
  right: 20px;
  /* bottom: calc(20px + var(--btn) + 12px); */
  bottom: calc(20px + 56px + 12px); /* above launcher */
  width: 360px;
  max-width: calc(100vw - 40px);
  height: 520px;
  max-height: calc(100vh - 120px);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background: #fff;
  overflow: hidden;
  display: none;
  z-index: 9999;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.chat-window.open {
  display: flex;
  flex-direction: column;
  animation: pop 0.14s ease-out;
  transform-origin: bottom right;
}
@keyframes pop {
  from {
    transform: scale(0.96);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-header {
  padding: 12px 14px;
  background: #111827;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font: 600 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.chat-close {
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 10px;
}
.chat-close:hover {
  background: rgba(255, 255, 255, 0.12);
}

.chat-body {
  padding: 12px;
  flex: 1;
  overflow: auto;
  background: #f9fafb;
  font: 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.msg {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 14px;
  margin: 8px 0;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.msg.me {
  margin-left: auto;
  background: #111827;
  color: #fff;
  border: 0;
}

.chat-input {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 10px;
  display: flex;
  gap: 8px;
  background: #fff;
}
.chat-input input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font: 14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.chat-input button {
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
  font: 600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.img-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
}

.chat-image {
  max-width: 100%;
  border-radius: 12px;
  margin-top: 6px;
}

.file-attachment {
  font-size: 12px;
  background: #eef2ff;
  padding: 6px 8px;
  border-radius: 8px;
  margin-top: 4px;
}

/* Mobile fullscreen mode */
@media (max-width: 640px) {
  .chat-window {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100dvh; /* better than 100vh on mobile */
    max-width: none;
    max-height: none;
    border-radius: 0;
  }

  .chat-window.open {
    animation: slideUp 0.2s ease-out;
    transform-origin: bottom center;
  }

  .chat-launcher {
    right: 16px;
    bottom: 16px;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(8%);
    opacity: 0.7;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.chat-window {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
