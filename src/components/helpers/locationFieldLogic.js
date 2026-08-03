import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

export function useLocationFieldLogic(form, errors) {
    const { t } = useI18n();

    const selectedPlace = ref(null);
    const addressValid = ref(
        Boolean(
            form.address &&
            form.lat !== null &&
            form.lng !== null
        )
    );

    const hasCoordinates = () => {
        return (
            form.lat !== null &&
            form.lat !== undefined &&
            form.lng !== null &&
            form.lng !== undefined
        );
    };

    const validateAddress = () => {
        if (!form.address?.trim()) {
            errors.address = t(
                "recipientForm.addressRequired"
            );

            addressValid.value = false;
            return false;
        }

        if (!hasCoordinates()) {
            errors.address = t(
                "recipientForm.addressAutocompleteError"
            );

            addressValid.value = false;
            return false;
        }

        errors.address = "";
        addressValid.value = true;

        return true;
    };

    const onAddressInput = value => {
        form.address = value ?? "";
        form.lat = null;
        form.lng = null;

        selectedPlace.value = null;
        addressValid.value = false;

        errors.address = form.address.trim()
            ? t("recipientForm.addressAutocompleteError")
            : "";
    };

    const onPlaceSelected = place => {
        if (!place) return;

        selectedPlace.value = place;

        form.address = place.address ?? "";
        form.lat = place.lat ?? null;
        form.lng = place.lng ?? null;

        addressValid.value = hasCoordinates();

        errors.address = addressValid.value
            ? ""
            : t("recipientForm.addressAutocompleteError");
    };

    const clearAddress = () => {
        form.address = "";
        form.lat = null;
        form.lng = null;

        selectedPlace.value = null;
        addressValid.value = false;
        errors.address = "";
    };

    watch(
        () => [form.address, form.lat, form.lng],
        () => {
            if (!form.address?.trim()) {
                addressValid.value = false;
                return;
            }

            addressValid.value = hasCoordinates();
        }
    );

    return {
        selectedPlace,
        addressValid,
        onAddressInput,
        onPlaceSelected,
        validateAddress,
        clearAddress
    };
}