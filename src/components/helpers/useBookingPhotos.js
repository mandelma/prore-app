import { ref, computed, watch } from "vue";

export function useBookingPhotos(initialPhotos = ref([])) {
    const addedPhotos = initialPhotos;
    const draftPhotos = ref([]);
    const removedPhotoIds = ref([]);
    const isAddPhotos = ref(false);
    const isDragOver = ref(false);

    let dragCounter = 0;

    const clonePhoto = (p) => ({ ...p });

    const normalizeForCompare = (img) => ({
        id: img.imageId ?? img._id ?? img.id ?? img.key ?? null,
        url: img.imageUrl ?? img.url ?? img.path ?? img.location ?? null,
        text: img.text ?? "",
        order: img.order ?? 0,
        isNew: !!img.file || (!!img.previewUrl && !img.imageUrl),
    });

    const signature = (arr) =>
        Array.isArray(arr)
            ? arr
                .map(normalizeForCompare)
                .map((x) =>
                    [
                        x.isNew ? "NEW" : x.id ?? "",
                        x.url ?? "",
                        (x.text ?? "").trim(),
                    ].join("|")
                )
                .join("||")
            : "";

    watch(isAddPhotos, (val) => {
        if (val) {
            draftPhotos.value = addedPhotos.value.map(clonePhoto);
            removedPhotoIds.value = [];
        }
    });

    const isDirty = computed(() => {
        return signature(draftPhotos.value) !== signature(addedPhotos.value);
    });

    function addFiles(files) {
        for (const file of files) {
            draftPhotos.value.push({
                imageId: null,
                imageUrl: null,
                previewUrl: URL.createObjectURL(file),
                file,
                text: "",
                order: draftPhotos.value.length,
                slotId: crypto.randomUUID(),
            });
        }
    }

    function onFilesSelected(e) {
        const files = Array.from(e.target.files || []);
        addFiles(files);
        e.target.value = "";
    }

    function onDragEnter(e) {
        if (!e.dataTransfer?.types.includes("Files")) return;
        dragCounter++;
        isDragOver.value = true;
    }

    function onDragLeave() {
        dragCounter--;
        if (dragCounter === 0) {
            isDragOver.value = false;
        }
    }

    function onDrop(e) {
        dragCounter = 0;
        isDragOver.value = false;

        const files = Array.from(e.dataTransfer.files || []).filter((f) =>
            f.type.startsWith("image/")
        );

        if (files.length) addFiles(files);
    }

    function removeDraftPhoto(idx) {
        console.log("Removing draft photo at index:", idx);
        draftPhotos.value.splice(idx, 1);
    }

    function cancelAddPhotos() {
        draftPhotos.value.forEach((p) => {
            if (
                p.previewUrl?.startsWith("blob:") &&
                !addedPhotos.value.some((a) => a.previewUrl === p.previewUrl)
            ) {
                URL.revokeObjectURL(p.previewUrl);
            }
        });

        draftPhotos.value = addedPhotos.value.map(clonePhoto);
        removedPhotoIds.value = [];
        isAddPhotos.value = false;
    }

    function saveBookingPhotos() {
        addedPhotos.value = draftPhotos.value.map(clonePhoto);
        isAddPhotos.value = false;
    }

    function buildPhotosPayload() {
        return {
            photos: addedPhotos.value.map((p, index) => ({
                imageId: p.imageId,
                text: p.text?.trim() || "",
                order: index,
            })),
            removedPhotoIds: [...new Set(removedPhotoIds.value.filter(Boolean))],
        };
    }

    return {
        addedPhotos,
        draftPhotos,
        removedPhotoIds,
        isAddPhotos,
        isDragOver,
        isDirty,

        addFiles,
        onFilesSelected,
        onDragEnter,
        onDragLeave,
        onDrop,
        removeDraftPhoto,
        cancelAddPhotos,
        saveBookingPhotos,
        buildPhotosPayload,
    };
}