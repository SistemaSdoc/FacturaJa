"use client";
import { useState } from "react";

export function useToast() {
    const [message, setMessage] = useState<string | null>(null);

    const toast = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    const ToastComponent = () =>
        message ? (
            <div className="fixed bottom-6 right-6 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow">
                {message}
            </div>
        ) : null;

    return { toast, ToastComponent };
}
