<template>
    <!-- Launcher -->
    <div class="chat-widget-root">
      <button
        class="chat-launcher"
        :class="{ hidden: isOpen }"
        @pointerdown.stop="onLauncherPointerDown"
        @click="onLauncherClick"
        type="button"
        :aria-label="t('chatWidget.openChat')"
        :aria-expanded="String(isOpen)"
        
      >
        <span class="icon-wrapper">
          <!-- 💬 -->
          <MDBIcon size="2x"><i class="far fa-comments"></i></MDBIcon>
          <!-- unread bubble -->
          <span v-if="!isOpen && totalUnread" class="badge">
            {{ totalUnread }}
          </span>
        </span>

      </button>

      <!-- chatWindowStyle before Teleporting -->
      <Teleport to="body">
        <!-- Window -->
        <section
          class="chat-window"
          :class="{ open: isOpen }" 
          :style="teleportedChatWindowStyle"
          
          :aria-label="t('chatWidget.chatWindow')"
          role="dialog"
          aria-modal="false"
      >
          <header 
              class="chat-header"

            >
            
            <!-- <div 
                v-if="!mobile"
                class="chat-drag-bar"
                @pointerdown.stop="$emit('start-drag', $event)"
                
              >
              <i class="fas fa-arrows-alt fa-lg"></i>
            </div> -->

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
                
                <div class="chat-name-row">
                  <span>{{ opt.name }}</span>

                  <i
                    class="fas fa-times chat-name-close"
                    @click.stop="removeChatMember(opt)"
                  ></i>
                </div>
                <!-- <span>{{ opt.name }}</span><MDBBtnClose /> -->

                <span v-if="opt.unread" class="chat-unread-badge">{{ opt.unread > 9 ? '9+' : opt.unread }}</span>
              </li>
              
            </ul>

            <div style="display: flex; justify-content: right;  margin-top: 0;">
              <button class="chat-close" type="button" :aria-label="t('chatWidget.closeChat')" @click="$emit('request-close')">―</button>
            </div>
            
          </header>

          <div v-if="meId" ref="chatBody" class="chat-body">
            <div
              v-for="m in activeMessages"
              :key="m.id || m._id"
              class="message-wrap"
              :class="{ me: isMine(m) }"
            >
              <div class="msg">
                <div v-if="m.text">{{ m.text }}</div>

                <div v-for="a in m.attachments || []" :key="a.id || a.key">
                  
                  <img
                    v-if="a.mime?.startsWith('image/')"
                    :src="a.url || a.preview"
                    class="chat-image"
                  />

                  <a
                    v-else
                    class="file-attachment"
                    :href="a.url"
                    target="_blank"
                    rel="noopener"
                  >
                    <div class="file-icon">
                      <i :class="fileIconClass(a)"></i>
                    </div>

                    <div class="file-info">
                      <div class="file-name">
                        {{ a.name || "file" }}
                      </div>

                      <div class="file-meta">
                        {{ formatFileSize(a.size) }}
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <div class="message-meta" v-if="m.createdAt">
                <span class="message-time">
                  {{ formatDateTime(m.createdAt) }}
                </span>

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
                  :alt="t('chatWidget.filePreview')"
                  />

                  <!-- File name fallback -->
                  <span v-else>{{ f.file.name }}</span>

                  <button type="button" @click="removeFile(i)">✕</button>
              </div>
          </div>

          <form v-if="activeConversationId" class="chat-input" @submit.prevent="send">
              <!-- Attachment button -->
              <label  :aria-label="t('chatWidget.attachFile')">
                  <!-- 📎 -->
                  <i class="fas fa-copy" style="cursor: pointer;"></i>
                  <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      @change="onFileSelect"
                      />
              </label>

              <textarea
                ref="chatInput"
                v-model="draft"
                class="chat-textarea"
                rows="1"
                :placeholder="t('chatWidget.messagePlaceholder')"
                @input="autoResize"
              ></textarea>

              <!-- Send -->
              <button style="max-height: 50px;" type="submit">{{ t("chatWidget.send") }}</button>
          </form>
        </section>

        <ConfirmModal
          v-model="showDeleteModal"
          :title="cTitle"
          :message="cMessage"
          :confirm-text="t('chatWidget.delete')"
          :cancel-text="t('chatWidget.keep')"
          :danger="true"
          @confirm="handleConfirmRemoveChatUser"
          @cancel="handleCancelRemoving"
        />
        </Teleport>

      

      <!-- <div style="color:red; position:absolute; top:-20px;">
        {{ mobile }}
      </div> -->
    </div>

    
    
</template>

<script setup>
  import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBIcon, MDBBtnClose } from "mdb-vue-ui-kit";
  import { ref, computed, nextTick, onMounted, onUpdated, onBeforeUnmount, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { storeToRefs } from "pinia";
  import { useLoginStore } from "@/stores/login";
  import { useConversationStore } from "@/stores/conversationStore";
  import { usePresenceStore } from '@/stores/presenceStore';
  import ConfirmModal from "@/components/helpers/ConfirmModal.vue";
  import uploadService from "@/service/awsUploads"; // must return uploaded files array
  import userService from "@/service/users";
  import socket from "@/socket";

  const props = defineProps({
    didDrag: Boolean,
    launcherPos: Object,
    isOpenMode: Boolean
  });

  const emit = defineEmits(["start-drag", "request-open", "request-close"]);

  // stores
  const auth = useLoginStore();
  const convoStore = useConversationStore();
  const presenceStore = usePresenceStore();
  const { user } = storeToRefs(auth);
  
  const { openChat, conversations, me_id, activeConversationId, activeMessages, otherChatUsers, totalUnread } = storeToRefs(convoStore);
  const { isOnline } = presenceStore;

  const { t, locale } = useI18n();

  // local UI
  const draft = ref("");
  const files = ref([]);
  const chatBody = ref(null);
  const chatInput = ref(null);
  const ddChat = ref(false);

  const openWindowPos = ref(null);

  //const mobile = ref(window.innerWidth <= 640)
  //const mobile = computed(() => window.innerWidth <= 640);

  const windowWidth = ref(window.innerWidth);

  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
  };

  const mobile = computed(
    () => windowWidth.value <= 640
  );

  const openSide = ref("right");

  const conversationToRemove = ref(null);

  const showDeleteModal = ref(false);
  const cTitle = ref("");
  const cMessage = ref("");

  // Your dropdown vars (left as-is)
  //const options = ["Option 1", "Option 2", "Option 3"];
  //const options = computed(() => conversations.value);
  const options = computed(() => {
    return conversations.value.map(cv => {
      const otherId = cv.participantIds.find(id => id !== meId.value);
      const user = otherChatUsers.value[otherId]; // cached user
      
      return {
        id: otherId,
        name: user?.firstName || t("chatWidget.unknownUsername"),
        username: user?.username || t("chatWidget.unknownUsername"),
        avatar: user?.avatar,
        conversationId: cv._id,
      };
    });
  });

  
  const decideOpenSide = () => {
    const x = props.launcherPos?.x ?? 20;
    const viewportW = window.innerWidth;
    const buttonW = 57;
    const gap = 12;
    const winW = Math.min(360, viewportW - 20);

    const fitsRight = x + buttonW + gap + winW <= viewportW - 10;
    openSide.value = fitsRight ? "right" : "left";
  };

  const launcherTouchStart = ref({ x: 0, y: 0 });
  const launcherTouchDragging = ref(false);

  const onLauncherPointerDown = (e) => {
    emit("start-drag", e);
  };

  const onLauncherClick_old = (e) => {
    if (props.didDrag) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (openChat.value) {
      convoStore.closeChatWidget();
    } else {
      decideOpenSide();
      emit("request-open");
    }
  };

  const onLauncherClick__Prev = (e) => {
    if (props.didDrag) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (openChat.value) {
      //convoStore.closeChatWidget();
      emit("request-close");
    } else {
      decideOpenSide();
      emit("request-open", { side: openSide.value });
    }
  };

  const onLauncherClick = (e) => {
    if (props.didDrag) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (openChat.value) {
      emit("request-close");
    } else {
      decideOpenSide();
      emit("request-open", { side: openSide.value });
    }
  };

  const chatWindowStyle___ = computed(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const isMobile = viewportW <= 640;
    const sideMargin = isMobile ? 8 : 10;
    const topMargin = isMobile ? 8 : 10;
    const bottomMargin = isMobile ? 20 : 32;

    const winW = Math.min(360, viewportW - sideMargin * 2);
    const winH = Math.min(isMobile ? 420 : 520, viewportH - topMargin - bottomMargin);

    if (props.isOpenMode) {
      return {
        left: "0px",
        top: "0px",
        width: `${winW}px`,
        height: `${winH}px`
      };
    }

    // closed mode can still use your old launcher-relative preview logic if needed
    return {
      left: "69px",
      top: "0px",
      width: `${winW}px`,
      height: `${winH}px`
    };
  });

  /* const chatWindowStyle = computed(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const isMobile = viewportW <= 640;

    if (props.isOpenMode && isMobile) {
      return {
        position: "fixed",
        left: "0",
        top: "0",
        width: "100vw",
        height: "100dvh",
        borderRadius: "0",
        maxWidth: "none",
        maxHeight: "none"
      };
    }

    const sideMargin = 10;
    const topMargin = 10;
    const bottomMargin = 32;
    const winW = Math.min(360, viewportW - sideMargin * 2);
    const winH = Math.min(520, viewportH - topMargin - bottomMargin);

    if (props.isOpenMode) {
      return {
        left: "0px",
        top: "0px",
        width: `${winW}px`,
        height: `${winH}px`
      };
    }

    return {
      left: "69px",
      top: "0px",
      width: `${winW}px`,
      height: `${winH}px`
    };
  }); */

  const teleportedChatWindowStyle = computed(() => {
  if (mobile.value) {
    return {
      position: "fixed",
      inset: "8px",
      width: "auto",
      height: "auto",
      maxWidth: "none",
      maxHeight: "none",
      zIndex: 200000
    };
  }

  return {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    left: "auto",
    top: "auto",
    width: "360px",
    height: "520px",
    zIndex: 200000
  };
});

  const intlLocale = computed(() => ({
    fi: "fi-FI",
    sv: "sv-SE",
    et: "et-EE",
    en: "en-GB",
    ru: "ru-RU"
  }[locale.value] ?? "fi-FI"));
  
  const formatDateTime = iso => {
    if (!iso) return "—";

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(
      intlLocale.value,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    );
  };

  const fileIconClass = attachment => {
    const mime = attachment?.mime || "";

    if (mime === "application/pdf") {
      return "fas fa-file-pdf";
    }

    if (
      mime.includes("word") ||
      mime.includes("document")
    ) {
      return "fas fa-file-word";
    }

    if (
      mime.includes("excel") ||
      mime.includes("spreadsheet")
    ) {
      return "fas fa-file-excel";
    }

    if (
      mime.includes("powerpoint") ||
      mime.includes("presentation")
    ) {
      return "fas fa-file-powerpoint";
    }

    return "fas fa-file";
  };

  const convo_options_ = computed(() => {
    const myId = me_id.value;

    const other = conversations.value.map(cv => String(
      cv.participantIds.find(id => String(id) !== myId)
    ));
    console.log("Active convo ", activeConversationId.value)
    const _other = conversations.value.find(cv => cv.id === activeConversationId.value)?.participantIds.find(id => String(id) !== myId);

    //console.log("XCXC ", cv)

    console.log("Others in:", _other);

    return conversations.value
      .filter(cv => cv.isParticipant?.[!String(myId)])
      .map(cv => {
        const otherId = String(
          cv.participantIds.find(id => String(id) !== myId)
        );

        const otherUser = otherChatUsers?.value?.[otherId];
        const myUnread = cv.unread?.[myId] || 0;

        return {
          conversationId: cv._id,
          otherId,
          name: otherUser?.firstName || otherUser?.username || t("chatWidget.unknownUser"),
          username: otherUser?.username || "",
          avatar: otherUser?.avatar,
          unread: myUnread,
        };
      });
  });

  const convo_options = computed(() => {
    const myId = String(me_id.value);

    return conversations.value
      .filter(cv => {
        const otherId = String(
          cv.participantIds.find(id => String(id) !== myId)
        );

        return cv.isParticipant?.[otherId] !== false;
      })
      .map(cv => {
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
        const body = chatBody.value;

        if (!body) {
          return;
        }

        body.scrollTop = body.scrollHeight;
      });
    }
  }

  const autoResize = () => {
    const el = chatInput.value
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }

  watch(
    () => activeMessages.value.length,
    () => scrollToBottomWithImages()
  );


  function toggle() {
    openChat.value = !openChat.value;
    if (openChat.value) nextTick(() => chatInput.value?.focus());
  }
  function close() {
    openChat.value = false;
    emit('request-close');
    //convoStore.closeChatWidget();
  }

  const meId = computed(() => user.value?.id ?? user.value?._id ?? null);

  const isMine = (m) => {
    const my = meId.value;  // use computed meId
    if (!my) return false;

    const senderId = m.senderId ?? m.sender?._id ?? m.sender;
    if (!senderId) return false;

    return String(senderId) === String(my);
  };

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


  function onClickOutside(e) {
    if (root.value && !root.value.contains(e.target)) open.value = false;
  }

  function formatFileSize(bytes = 0) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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

        const res = await uploadService.uploadChatFiles(fd);
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
        //url: f.imageUrl || f.url, // your backend returns imageUrl
        url: f.url || f.imageUrl, // or url, adjust based on your actual response
        name: f.name,
        mime: f.mime,
        size: f.size,
        isImage: f.isImage ?? (f.mime || "").startsWith("image/"),
        /* type: "image" | "pdf" | "document" */

        type:
          f.type ||
          (
            (f.mime || "").startsWith("image/")
              ? "image"
              : f.mime === "application/pdf"
                ? "pdf"
                : "document"
          )


      })),
    };

    const sentMessage = await convoStore.sendMessage(activeConversationId.value, {
      text: finalMsg.text,
      attachments: finalMsg.attachments,
    });

    console.log("Sent message response:", sentMessage);
    
    console.log("Active messages - ", [activeMessages.value])

    files.value.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    files.value = [];
  }

  const removeChatMember = async (opt) => {
    conversationToRemove.value = opt;
    cTitle.value = t("chatWidget.removeParticipantTitle");
    cMessage.value = t("chatWidget.removeParticipantMessage", { name: opt.name });
    showDeleteModal.value = true;
    console.log("Delete it--- ");
  }

  const handleConfirmRemoveChatUser = async () => {
    const opt = conversationToRemove.value;

    if (!opt) {
      return;
    }

    try {
      await convoStore.setConversationState(
        opt.conversationId,
        opt.otherId,
        false
      );
    } finally {
      showDeleteModal.value = false;
      conversationToRemove.value = null;
    }
  };

  const handleCancelRemoving = () => {
    showDeleteModal.value = false;
    conversationToRemove.value = null;
    //cTitle.value = "";
    //cMessage.value = "";
  }

  const handleKeydown = event => {
    if (event.key === "Escape") {
      close();
    }
  };

  onMounted(() => {
    //document.addEventListener("click", onClickOutside);
    //document.addEventListener("keydown", (e) => e.key === "Escape" && close());
    document.addEventListener(
      "click",
      onClickOutside
    );
    document.addEventListener(
      "keydown",
      handleKeydown
    );

    window.addEventListener(
      "resize",
      updateWindowWidth
    );

    convoStore.getConversations();
    //scrollToBottomSmooth();
    presenceStore.initPresenceSocket(socket);
    scrollToBottomWithImages()
    
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", onClickOutside);
    document.removeEventListener("keydown", handleKeydown);

    window.removeEventListener(
      "resize",
      updateWindowWidth
    );

    // Removing files from memory when component is unmounted
    files.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });
  });

  // chat widget button 56px
</script>

<style scoped>
:root {
  --shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  
  --radius: 16px;
  --btn: 70px;
}

.chat-widget-root {
  position: relative;
}

.widget-drag {
  position: fixed;
  z-index: 9999;
}



.drag-handle {
  cursor: grab;
  user-select: none;
  /* touch-action: none; */
}
.drag-handle:active {
  cursor: grabbing;
}

.chat-drag-bar {
  cursor: grab;
  user-select: none;
  touch-action: none;
  padding: 6px 10px;
  /* background: #1b2436; */
}
.chat-launcher,
.chat-drag-bar {
  touch-action: none;
}

/* Launcher button */
.chat-launcher {
  /* position: fixed;
  right: 60px;
  bottom: 60px; */
  /* width: var(--btn);
  height: var(--btn); */
  width: 57px;
  height: 67px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: var(--shadow);
  background: #24304b;
  color: #fff;
  display: grid;
  place-items: center;
  z-index: 9999;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.chat-launcher:focus {
  outline: 3px solid rgba(59, 130, 246, 0.6);
  outline-offset: 2px;
}
.chat-launcher.hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.9);
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

/* 🔥 unread bubble style */
.badge {
  position: absolute;
  top: -10px;
  right: -7px;
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
.chat-window-w {
  position: absolute;
  display: none;
  z-index: 9999;

  width: 360px;
  max-width: calc(100vw - 40px);
  height: 520px;
  max-height: calc(100vh - 120px);
  border-radius: 16px;
  box-shadow: var(--shadow);
  background: #fff;
  overflow: hidden;
  display: none;
  z-index: 9999;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.chat-window {
  position: fixed;
  display: none;
  z-index: 200000 !important;

  width: 360px;
  max-width: calc(100vw - 20px);
  height: 520px;
  max-height: calc(100dvh - 20px);

  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.chat-window.open {
  display: flex;
  flex-direction: column;
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
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 36px;
  height: 60px;
  padding-bottom: 0;
  padding-left: 7px;
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
  height: 40px;
  background: transparent;
  color: #fff;
  font-size: 21px;
  cursor: pointer;
  line-height: 1;
  padding: 7px 11px;
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

.message-wrap {
  display: flex;
  flex-direction: column;
  width: fit-content;
  max-width: 80%;
  margin: 8px 0;
}

.message-wrap.me {
  max-width: min(75%, 360px);
  overflow: hidden;
  margin-left: auto;
  align-items: flex-end;
}

.msg {
  padding: 10px 12px;
  min-width: 80%;
  border-radius: 14px;
  background: #c0cfc9;
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: #151d24;
  word-break: break-word;
}

.message-wrap.me .msg {
  background: #a6c4c4;
  color: #151d24;
 /*  border: 1px solid #637397; */
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 0 4px;
  font-size: 12px;
  color: #5f6b7a;
}

.message-time {
  white-space: nowrap;
}

.message-status {
  white-space: nowrap;
  font-size: 12px;
}

.chat-textarea {
  resize: none;
  overflow-y: auto;
  line-height: 1.4;
  min-height: 38px;
  max-height: calc(1.4em * 4 + 12px); /* 4 lines max */
  padding: 6px 10px;
  background-color: #ddd;
  color: rgb(22, 31, 44);
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
}

.chat-input {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 10px;
  display: flex;
  gap: 8px;
  background: #22232c;
}
.chat-input input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: #ddd;
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

/* .file-attachment {
  font-size: 12px;
  background: #eef2ff;
  padding: 6px 8px;
  border-radius: 8px;
  margin-top: 4px;
} */

.file-attachment {
  display: flex;
  align-items: center;
  gap: 12px;

  /* max-width: 320px; */
  width: 100%;
  max-width: 210px;
  min-width: 0;

  padding: 12px 14px;

  margin-top: 8px;

  border-radius: 14px;
  background: #f4f6f8;
  border: 1px solid #e2e8f0;

  color: #1e293b;
  text-decoration: none;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;

  box-shadow:
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 12px rgba(0,0,0,0.04);

  overflow: hidden;
}

.file-attachment:hover {
  background: #ffffff;
  border-color: #cbd5e1;

  transform: translateY(-1px);

  box-shadow:
    0 4px 10px rgba(0,0,0,0.06),
    0 10px 24px rgba(0,0,0,0.08);
}

.file-attachment:active {
  transform: scale(0.98);
}

.file-icon {
  flex-shrink: 0;

  width: 42px;
  height: 42px;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e11d48;
  color: white;

  font-size: 18px;
  font-weight: 600;
}

.file-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  font-weight: 600;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  margin-top: 2px;

  font-size: 12px;
  color: #64748b;
}



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
  /* padding: 8px; */
  overflow-x: auto;    /* horizontal scrolling */
  overflow-y: hidden;
  white-space: nowrap;
  width: 100%;         /* or custom width */
  /* background: #222d44; */
  background: transparent;
  border-radius: 8px;

  scrollbar-width: thin !important;                 /* Firefox */
 /*  scrollbar-color: #5d6b8a transparent; */
 scrollbar-color: red;
}

/* Chrome / Edge / Safari */
:deep(.chat-dropdown.horizontal::-webkit-scrollbar) {
  height: 1px !important;
  
}

.chat-dropdown.horizontal::-webkit-scrollbar-track {
  background: transparent;
}

.chat-dropdown.horizontal::-webkit-scrollbar-thumb {
  /* background: rgba(255,255,255,0.25); */
  
  border-radius: 999px;
  transition: background 0.2s ease;
}

.chat-dropdown.horizontal::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.45);
}


.chat-dropdown.horizontal .avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}





.chat-dropdown.horizontal li {
  display: flex;
  height: auto;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  
  /* flex-shrink: 0; */
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

.chat-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.chat-name-close {
  color: white;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: 0.2s;
}

.chat-name-close:hover {
  background: rgb(235, 118, 118);
  color: rgb(95, 8, 8);
}

.chat-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  cursor: pointer;
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
  .chat-launcher {
  /* position: fixed;
  right: 40px;
  bottom: 20px; */
  /* width: var(--btn);
  height: var(--btn); */
  width: 57px;
  height: 67px;
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

  .chat-window {
    width: min(100vw - 16px, 360px);
    height: min(100dvh - 24px, 520px);
    
    max-width: none;
    max-height: none;
    border-radius: 12px;
  }

  

  .chat-window.open {
    animation: slideUp 0.2s ease-out;
    transform-origin: bottom center;
  }
  /* .chat-window {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100dvh; 
    max-width: none;
    max-height: none;
    border-radius: 0;
  } */

  /* .chat-window.open {
    animation: slideUp 0.2s ease-out;
    transform-origin: bottom center;
  } */

  /* .chat-launcher {
    right: 16px;
    bottom: 16px;
  } */
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
