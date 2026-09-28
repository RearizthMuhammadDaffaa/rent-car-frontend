import { useEffect, useState } from "react";

const Alert = ({ message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Animasi masuk
    setShow(true);

    return () => {
      setShow(false);
    };
  }, []);

  const handleClose = () => {
    setShow(false);

    // Tunggu animasi selesai sebelum menghapus component
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed top-0 left-1/2 -translate-x-1/2 z-[200] flex items-center justify-between max-w-80 w-full bg-green-500 text-white px-3 h-10 rounded-sm shadow-md  transition-all duration-300 ease-out   ${
          show
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-5"
        }`}>
      <div className="flex items-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 14.167q.354 0 .593-.24.24-.24.24-.594a.8.8 0 0 0-.24-.593.8.8 0 0 0-.594-.24.8.8 0 0 0-.593.24.8.8 0 0 0-.24.593q0 .354.24.594t.593.24m-.834-3.334h1.667v-5H9.166zm.833 7.5a8.1 8.1 0 0 1-3.25-.656 8.4 8.4 0 0 1-2.645-1.781 8.4 8.4 0 0 1-1.782-2.646A8.1 8.1 0 0 1 1.666 10q0-1.73.656-3.25a8.4 8.4 0 0 1 1.782-2.646 8.4 8.4 0 0 1 2.645-1.781A8.1 8.1 0 0 1 10 1.667q1.73 0 3.25.656a8.4 8.4 0 0 1 2.646 1.781 8.4 8.4 0 0 1 1.781 2.646 8.1 8.1 0 0 1 .657 3.25 8.1 8.1 0 0 1-.657 3.25 8.4 8.4 0 0 1-1.78 2.646 8.4 8.4 0 0 1-2.647 1.781 8.1 8.1 0 0 1-3.25.656"
            fill="currentColor"
          />
        </svg>

        <p className="text-sm ml-2">
          {message}
        </p>
      </div>

      <button
        type="button"
        aria-label="close"
        onClick={handleClose}
        className="active:scale-90 transition-all ml-2"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 5 5 15M5 5l10 10"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Alert;

