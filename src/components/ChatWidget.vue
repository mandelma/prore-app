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
        <!-- <span>Support</span> -->
        <div class="dropdown" ref="root" @click.stop>
          <button @click="open = !open" class="btn">
            {{ selected || "Select option" }} ▾
          </button>

          <ul v-if="open" class="menu">
            <li
              v-for="(opt, i) in options"
              :key="i"
              @click="select(opt)"
            >
              {{ opt.participantIds[0] }}
            </li>
          </ul>
        </div>
        <button class="chat-close" type="button" aria-label="Close chat" @click="close">✕</button>
        </header>


        <div v-if="meId" ref="chatBody" class="chat-body">
          <div
            v-for="m in activeMessages"
            :key="m.id || m._id"
            class="msg"
            :class="{ me: isMine(m) }"
          >
            <div v-if="m.text">{{ m.text }}</div>

            
            <div v-for="a in m.attachments || []" :key="a.id || a.key">
              <img
                v-if="a.isImage"
                :src="a.url || a.preview"
                class="chat-image"
                alt="attachment"
              />
              <div v-else class="file-attachment">
                📄 {{ a.name || "file" }}
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

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useLoginStore } from "@/stores/login";
import { useConversationStore } from "@/stores/conversationStore";
import uploadService from "@/service/awsUploads"; // must return uploaded files array
import socket from "@/socket";

// stores
const auth = useLoginStore();
const convoStore = useConversationStore();
const { user } = storeToRefs(auth);
const { openChat, conversations, activeConversationId, activeMessages } = storeToRefs(convoStore);

// local UI
const draft = ref("");
const files = ref([]);
const chatBody = ref(null);
const chatInput = ref(null);

// Your dropdown vars (left as-is)
//const options = ["Option 1", "Option 2", "Option 3"];
const options = computed(() => conversations.value);
const open = ref(false);
const selected = ref(null);
const root = ref(null);


// show/hide widget (use store openChat as source of truth)
const isOpen = computed(() => openChat.value);

function toggle() {
  openChat.value = !openChat.value;
  if (openChat.value) nextTick(() => chatInput.value?.focus());
}
function close() {
  openChat.value = false;
  convoStore.closeChatWidget();
}

function scrollToBottom() {
  const el = chatBody.value;
  if (el) el.scrollTop = el.scrollHeight;
}

const meId = computed(() => user.value?.id ?? user.value?._id ?? null);

const isMinex = (m) => {
  if (!meId.value) return false;
  const senderId = m.senderId ?? m.sender?._id ?? m.sender;
  return String(senderId) === String(meId.value);
};

const isMine = (m) => {
  const my = user.value.id;
  if (!my) return false;

  const senderId = m.senderId ?? m.sender?._id ?? m.sender;
  if (!senderId) return false;

  return String(senderId) === String(my);
};

/* function isMine(m) {
  return String(m.senderId) === String(user.value?.id);
} */

// file picking (same logic as earlier)
function onFileSelect(e) {
  const selectedFiles = Array.from(e.target.files || []).map((file) => ({
    file,
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    isImage: file.type?.startsWith("image/"),
    preview: file.type?.startsWith("image/") ? URL.createObjectURL(file) : null,
  }));
  files.value.push(...selectedFiles);
  e.target.value = "";
}

function removeFile(index) {
  const f = files.value[index];
  if (f?.preview) URL.revokeObjectURL(f.preview);
  files.value.splice(index, 1);
}

// dropdown
function select(opt) {
  selected.value = opt;
  open.value = false;
}
function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false;
}

// ✅ send: upload attachments → emit message → update local state
async function send() {
  const convoId = activeConversationId.value;
  if (!convoId) {
    console.warn("No active conversation selected");
    return;
  }
  if (!draft.value.trim() && files.value.length === 0) return;

  // optimistic (sender sees preview immediately)
  const tempId = crypto.randomUUID?.() ?? String(Date.now());
  const optimistic = {
    id: tempId,
    conversationId: convoId,
    senderId: user.value?.id,
    text: draft.value,
    createdAt: new Date().toISOString(),
    attachments: files.value.map((f) => ({
      id: f.id,
      name: f.file.name,
      mime: f.file.type,
      size: f.file.size,
      isImage: f.isImage,
      preview: f.preview, // local only
      uploading: true,
    })),
  };

  convoStore.addMessageLocal(optimistic);
  draft.value = "";
  await nextTick();
  scrollToBottom();

  // upload attachments if any
  let uploadedFiles = [];
  try {
    if (files.value.length) {
      const fd = new FormData();
      // IMPORTANT: must match server array("files")
      files.value.forEach((f) => fd.append("files", f.file));
      fd.append("conversationId", convoId);

      // Choose ONE return shape:
      // - If service returns array directly: uploadedFiles = await uploadService.uploadChatImage(fd)
      // - If service returns {files: [...] }: uploadedFiles = (await uploadService.uploadChatImage(fd)).files
      const res = await uploadService.uploadChatImage(fd);
      uploadedFiles = Array.isArray(res) ? res : (res?.files || []);
    }
  } catch (err) {
    console.error("Upload failed:", err?.response?.data || err);
    // optionally mark optimistic message failed
    return;
  }

  // build final message payload with REAL URLs for recipients
  const finalMsg = {
    ...optimistic,
    id: crypto.randomUUID?.() ?? tempId,
    attachments: uploadedFiles.map((f) => ({
      id: f.id || f._id || f.key,
      key: f.key,
      url: f.imageUrl || f.url, // your backend returns imageUrl
      name: f.name,
      mime: f.mime,
      size: f.size,
      isImage: f.isImage ?? (f.mime || "").startsWith("image/"),
    })),
  };

  // Replace optimistic message locally (simple approach: add another “final”)
  // Better approach: store by id and replace, but keeping it simple:
  convoStore.addMessageLocal(finalMsg);

  // Send to other user(s)
  socket.emit("send-message", finalMsg);

  // clear picker (do NOT revoke previews that are still used in optimistic UI if still shown)
  files.value = [];

  await nextTick();
  scrollToBottom();
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<!-- <script>
import { ref } from "vue";
import socket from "@/socket";
import uploadService from '../service/awsUploads';
import { useConversationStore } from '@/stores/conversationStore';
import { storeToRefs } from "pinia";

export default {
  props: {
    isOpenWidget: Boolean
  },
  
  setup() {
    const isOpen = ref(false);
    const draft = ref("");
    
    const files = ref([]);
    const options = ['Option 1', 'Option 2', 'Option 3'];
    const open = ref(false);
    const selected = ref(null);
    const root = ref(null);;

    const conversationStore = useConversationStore();
    const { messages } = storeToRefs(conversationStore);

    return { isOpen, draft, files, options, open, selected, root, conversationStore, messages };
  },

  watch: {
    isOpenWidget (val) {
      console.log("VAL - ", val);
      if (val) this.isOpen = true;
    }
  },

  mounted() {
    this._onKeydown = (e) => {
      if (e.key === "Escape") this.close();
    };
    this._onClickOutside = (e) => this.onClickOutside(e);
    document.addEventListener("keydown", this._onKeydown);
    // For dropdown
    document.addEventListener("click", this._onClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this._onKeydown);
    // For dropdown
    document.removeEventListener("click", this._onClickOutside);
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

    // users dropdown
    select(opt) {
      this.selected = opt;
      this.open = false;
    },

    // close when clicking outside
    onClickOutside(e) {
      // use the Composition ref you already have
      if (this.root && !this.root.contains(e.target)) {
        this.open = false; // close dropdown
      }
    },

    /* openChat () {
      this.isOpen = true;
    },
 */
    close() {
      this.isOpen = false;
    },

    async send() {
      if (!this.draft.trim() && !this.files.length) return;

      // Put attachments into the message for UI rendering
      const msgFiles = this.files.map((f) => ({
        name: f.file.name,
        isImage: f.isImage,
        preview: f.preview, // OK for local preview; backend should return URL later
      }));

      const message = {
        id: String(Date.now()),
        role: "bot",
        text: this.draft,
        files: msgFiles,
      }

      /* this.messages.push({
        id: String(Date.now()),
        role: "me",
        text: this.draft,
        files: msgFiles,
      }); */

      //this.messages.push(message);

      /* this.messageStore.localMessage({
        id: String(Date.now()),
        role: "me",
        text: this.draft,
        files: msgFiles,
      }) */

      // Build multipart form
      const form = new FormData();
      form.append("message", this.draft);
      this.files.forEach((f) => form.append("files", f.file));

      // clear input text

      //this.draft = "";

      // NOTE: don't revoke previews immediately if you want them to keep showing
      // If you revoke here, images in the sent message may disappear.
      // So either:
      // 1) keep them, OR
      // 2) revoke later when message is removed / replaced with server URL.
      //, 
      // For now, keep previews alive:
      this.files = [];

      this.$nextTick(this.scrollToBottom);


      //const fd = new FormData();
      //selectedFiles.forEach((file) => fd.append("files", file));









    


      //socket.emit('send-message', message);






      const tempId = String(Date.now());

      const meLocal = {
        id: tempId,
        /* chatId: this.chatId, */
        /* senderId: this.userId, */
        role: "me",
        text: this.draft,
        createdAt: Date.now(),
        attachments: this.files.map((f) => ({
          id: f.id,
          name: f.file.name,
          mime: f.file.type,
          size: f.file.size,
          isImage: f.isImage,
          // local-only preview:
          preview: f.preview,
          uploading: true,
        })),
      };

      this.conversationStore.localMessage(meLocal);

      // 2) upload actual bytes
      
      let uploadedFiles = [];

      if (this.files.length) {
        const uploadedRes = await uploadService.uploadChatImage(form);
        uploadedFiles = uploadedRes?.files;
        console.log("uploadedRes:", uploadedRes);
        if (!Array.isArray(uploadedFiles)) {
          console.error("Expected uploadedRes.files to be an array, got:", uploadedFiles);
          return; // or handle error UI
        }
      }

      // 3) build final message with shareable URLs

      /* const finalMsg = {
        ...optimistic,
        id: crypto.randomUUID?.() ?? tempId,
        attachments: uploadedFiles.map((u) => ({
          id: u.id,
          key: u.key,
          url: u.url,
          name: u.name,
          mime: u.mime,
          size: u.size,
          isImage: u.isImage,
        })),
      }; */

      const youLocal = {
        id: tempId,
        /* chatId: this.chatId, */
        /* senderId: this.userId, */
        role: "bot",
        text: this.draft,
        createdAt: Date.now(),
        attachments: uploadedFiles.map((u) => ({
          id: u.id,
          key: u.key,
          url: u.imageUrl,
          name: u.name,
          mime: u.mime,
          size: u.size,
          isImage: u.isImage,
        })),
      };



      socket.emit('send-message', youLocal);


      this.draft = "";




      // await fetch("/api/chat", { method: "POST", body: form });

      /* this.messages.push({
        id: String(Date.now() + 1),
        role: "bot",
        text: "Nice photo! 📸",
      });
      this.$nextTick(this.scrollToBottom); */
    },
  },
};
</script> -->
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

/* User dropdown */
.dropdown {
  position: relative;
  display: inline-block;
}

.btn {
  padding: 8px 12px;
  cursor: pointer;
}

.menu {
  position: absolute;
  margin-top: 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0,0,0,.15);
  list-style: none;
  padding: 6px;
  width: 180px;
}

.menu li {
  padding: 8px;
  cursor: pointer;
}

.menu li:hover {
  background: #f3f4f6;
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
