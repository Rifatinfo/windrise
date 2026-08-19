import Swal from "sweetalert2";

/**
 * Bottom-centre confirmation used by the SKU controls. Separate from the
 * shared top toast so SKU feedback doesn't cover the page header while
 * you're working in the form.
 */
export const SkuToast = Swal.mixin({
    toast: true,
    position: "bottom",
    icon: "success",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: false,
    iconColor: "#22c55e",
    customClass: {
        popup: "swal-toast",
    },
});
