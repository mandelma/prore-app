<template>
    <!-- Launcher -->
    <button
        class="chat-launcher"
        type="button"
        aria-label="Open chat"
        :aria-expanded="String(isOpen)"
        @click="toggle"
    >
      <span class="icon-wrapper">
        💬

        <!-- unread bubble -->
        <span v-if="!isOpen && totalUnread" class="badge">
          {{ totalUnread }}
        </span>
      </span>

      <span v-if="isOpen">✕</span>
      
    </button>

    

    <!-- class="chat-header" -->

    <!-- Window -->
    <section
        class="chat-window"
        :class="{ open: isOpen }"
        aria-label="Chat window"
        role="dialog"
        aria-modal="false"
    >
        <header class="chat-header">

          <ul class="chat-dropdown horizontal">
            <li
              v-for="opt in convo_options"
              :class="{ active: opt.conversationId === activeConversationId }"
              :key="opt.conversationId"
              @click="selectConversation(opt.conversationId)"
            >
              <!-- <img :src="opt.avatar" class="avatar" v-if="opt.avatar"> -->
               <MDBIcon size="2x"><i class="fas fa-user-circle"></i></MDBIcon>
                <div style="margin-top: 17px; margin-left: -17px; ">
                {{ isOnline(opt.otherId) ? ' 🟢' : ' ⚪' }}
              </div>
              <span>{{ opt.name }}</span>

              <span v-if="opt.unread" class="chat-unread-badge">{{ opt.unread > 9 ? '9+' : opt.unread }}</span>
            </li>
            
          </ul>

          <div style="display: flex; justify-content: right;  margin-top: -27px;">
            <button class="chat-close" type="button" aria-label="Close chat" @click="close">✕</button>
          </div>
          
        </header>

        <div v-if="meId" ref="chatBody" class="chat-body">
          <!-- <div > -->
            <div
              v-for="(m) in activeMessages"
              
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
          <!-- </div> -->
          
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

        <form v-if="activeConversationId" class="chat-input" @submit.prevent="send">
            <!-- Attachment button -->
            <label  aria-label="Attach file">
                <!-- 📎 -->
                <i class="fas fa-images"></i>
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
                placeholder="Kirjoita viesti…"
                autocomplete="off"
            />

            <!-- Send -->
            <button type="submit">Lähetä</button>
        </form>
    </section>
</template>

<script setup>
  import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBIcon } from "mdb-vue-ui-kit";
  import { ref, computed, nextTick, onMounted, onUpdated, onBeforeUnmount, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { useLoginStore } from "@/stores/login";
  import { useConversationStore } from "@/stores/conversationStore";
  import { usePresenceStore } from '@/stores/presenceStore';
  import uploadService from "@/service/awsUploads"; // must return uploaded files array
  import userService from "@/service/users";
  import socket from "@/socket";

  // stores
  const auth = useLoginStore();
  const convoStore = useConversationStore();
  const presenceStore = usePresenceStore();
  const { user } = storeToRefs(auth);
  
  const { openChat, conversations, me_id, activeConversationId, activeMessages, otherChatUsers, totalUnread } = storeToRefs(convoStore);
  const { isOnline } = presenceStore;

  // local UI
  const draft = ref("");
  const files = ref([]);
  const chatBody = ref(null);
  const chatInput = ref(null);
  const ddChat = ref(false);

  // Your dropdown vars (left as-is)
  //const options = ["Option 1", "Option 2", "Option 3"];
  //const options = computed(() => conversations.value);
  const options = computed(() => {
    return conversations.value.map(cv => {
      const otherId = cv.participantIds.find(id => id !== meId.value);
      const user = otherChatUsers.value[otherId]; // cached user
      
      return {
        id: otherId,
        name: user?.firstName || "Unknown User",
        username: user?.username || "Unknown username",
        avatar: user?.avatar,
        conversationId: cv._id,
      };
    });
  });



  const convo_options = computed(() => {
    const myId = me_id.value;

    return conversations.value.map(cv => {
      const otherId = String(
        cv.participantIds.find(id => String(id) !== myId)
      );

      const otherUser = otherChatUsers?.value?.[otherId];

      const myUnread = cv.unread?.[myId] || 0;

      return {
        conversationId: cv._id,
        otherId,
        name: otherUser?.firstName || otherUser?.username || "Tuntematon",
        username: otherUser?.username || "",
        avatar: otherUser?.avatar,
        unread: myUnread,
      };
    });
  });

  const selectConversation = (id) => {
    convoStore.selectConversation(id);
  };
  
  const open = ref(false);
  const selected = ref(null);
  const openOption = ref(null);
  const root = ref(null);


  // show/hide widget (use store openChat as source of truth)
  const isOpen = computed(() => openChat.value);


  async function scrollToBottomWithImages() {
    await nextTick();

    const imgs = chatBody.value?.querySelectorAll('img') ?? [];
    if (imgs.length === 0) return scroll();

    let loaded = 0;
    imgs.forEach(img => {
      if (img.complete) loaded++;
      else img.onload = () => { loaded++; if (loaded === imgs.length) scroll(); };
    });
    if (loaded === imgs.length) scroll();

    function scroll() {
      requestAnimationFrame(() => {
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
      });
    }
  }

  watch(
    () => activeMessages.value.length,
    () => scrollToBottomWithImages()
  );





  /* async function scrollToBottomSmooth() {
    await nextTick();                      // wait DOM update
    requestAnimationFrame(() => {          // wait browser paint
      if (chatBody.value)
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
    });
  }

  watch(
    () => activeMessages.value.length,
    () => scrollToBottomSmooth()
  ); */

  function toggle() {
    openChat.value = !openChat.value;
    if (openChat.value) nextTick(() => chatInput.value?.focus());
  }
  function close() {
    openChat.value = false;
    convoStore.closeChatWidget();
  }

  /* function scrollToBottom() {
    const el = chatBody.value;
    if (el) el.scrollTop = el.scrollHeight;
  } */

  const meId = computed(() => user.value?.id ?? user.value?._id ?? null);

  const isMinex = (m) => {
    if (!meId.value) return false;
    const senderId = m.senderId ?? m.sender?._id ?? m.sender;
    return String(senderId) === String(meId.value);
  };

  const isMine = (m) => {
    const my = meId.value;  // use computed meId
    if (!my) return false;

    const senderId = m.senderId ?? m.sender?._id ?? m.sender;
    if (!senderId) return false;

    return String(senderId) === String(my);
  };

  /* const isMine = (m) => {
    const my = user.value.id;
    if (!my) return false;

    if (!activeMessages.value.length) return;

    const senderId = m.senderId ?? m.sender?._id ?? m.sender;
    if (!senderId) return false;

    return String(senderId) === String(my);
  }; */

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

  const chatUserName = async (id) => {
    const participant = await userService.getUser(id);
    return participant.firstName;
  }

  // dropdown
  function select(opt) {
    console.log("Opt id is " + opt._id);
    
    openOption.value = opt.id;
    selected.value = opt.name;

    convoStore.openCreateRoom(opt.id);
    
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

    //convoStore.addMessageLocal(optimistic);

    draft.value = "";
    //await nextTick();
    //scrollToBottom();

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


    //convoStore.addMessageLocal(finalMsg);

    // Send to other user(s)

    socket.emit("send-message", finalMsg);

    console.log("Active messages - ", [activeMessages.value])

    // clear picker (do NOT revoke previews that are still used in optimistic UI if still shown)
    files.value = [];

   
  }

  onMounted(() => {
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());

    convoStore.getConversations();
    //scrollToBottomSmooth();
    presenceStore.initPresenceSocket(socket);
    scrollToBottomWithImages()
    
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", onClickOutside);
  });
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



.icon-wrapper {
  position: relative;
  display: inline-block;
}

/* 🔥 unread bubble style */
.badge {
  position: absolute;
  top: -9px;
  right: -8px;
  background: #ff3b30;   /* iOS red */
  color: white;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 0 4px rgba(0,0,0,0.15);
  animation: pulse 1.4s infinite ease-in-out;
}

/* hover optional */
.chat-launcher:hover .badge {
  transform: scale(1.1);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
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

.active-item {
  background-color: green;
}

.chat-header {
 /*  padding: 12px 14px; */
  height: 60px;
  padding-bottom: 0;
  background: #111827;
  
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1px;
  font: 600 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.chat-close {
  border: 0;
  height: 30px;
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
  background: #ddd;
  font: 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.msg {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 14px;
  margin: 8px 0;
  background: #3a4b72;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.msg.me {
  margin-left: auto;
  background: #1b253a;
  color: #fff;
  border: 1px solid #2a354e;
}

.chat-input {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 10px;
  display: flex;
  gap: 8px;
  background: #4c6774;
}
.chat-input input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font: 14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.chat-input button {
  border: 1px solid #4f7cff;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  background: #3a4b72;
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
/* .dropdown {
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
  background: #192235;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0,0,0,.15);
  list-style: none;
  padding: 6px;
  min-width: 180px;
}

.menu li {
  padding: 8px;
  cursor: pointer;
}

.menu li:hover {
  background: #111827;
} */



/* Newer chat dropdown variant */
.chat-dropdown {
  max-height: 320px;
  overflow-y: auto;
  background: #222d44;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  padding: 4px 0;
}



.chat-dropdown.horizontal {
  height: 53px;
  margin-top: 17px;
  display: flex;
  gap: 8px;
  padding: 8px;
  overflow-x: auto;    /* horizontal scrolling */
  overflow-y: hidden;
  white-space: nowrap;
  width: 100%;         /* or custom width */
  /* background: #222d44; */
  background: transparent;
  border-radius: 8px;
}


.chat-dropdown.horizontal .avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}





.chat-dropdown.horizontal li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 6px;
  background: #2f3b57;
  transition: background-color .2s;
}

/* hover state */
.chat-dropdown.horizontal li:hover {
  background: #1d2638;
}

/* 🔥 ACTIVE SELECTED CHAT */
.chat-dropdown.horizontal li.active {
  background: #3a4b72;
  color: #fff;
  font-weight: 600;
  border: 2px solid #4f7cff;
}

/* optional - brighten unread */
.chat-dropdown.horizontal li.active .chat-unread-badge {
  background: #ff6b4a;
}






/* .unread-badge {
  background: #ff3b30;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: bold;
} */








.chat-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  cursor: pointer;
}

.chat-dropdown-item:hover {
  background: #2f3c58;
}

.chat-dropdown-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-user-text {
  display: flex;
  flex-direction: column;
}

.chat-user-name {
  font-size: 14px;
  font-weight: 500;
}

.chat-user-username {
  font-size: 12px;
  opacity: 0.7;
}

/* 🔴 per conversation unread badge */
.chat-unread-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  margin-top: -17px;
  margin-left: 7px;
  border-radius: 999px;
  background: #ff3b30;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
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
