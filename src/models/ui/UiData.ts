export interface IMessageDialogData {
    id?: string;
    type?: "confirm" | "error",
    body?: string;
    onClose?: () => void
}
