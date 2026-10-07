const Pagination = ({ page, setPage, totalPage }) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <button
        type="button"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="mr-4 disabled:opacity-30"
        aria-label="Previous"
      >
        <svg
          width="9"
          height="16"
          viewBox="0 0 12 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 1L2 9.24242L11 17"
            stroke="#111820"
            strokeOpacity="0.7"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex gap-2 text-gray-500 text-sm md:text-base">
        {[...Array(totalPage)].map((_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              type="button"
              onClick={() => setPage(pageNumber)}
              key={pageNumber}
              className={`${
                pageNumber === page
                  ? "flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-primary text-white rounded-md transition-all"
                  : "flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-white border border-gray-200 rounded-md hover:bg-gray-100/70 transition-all"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* <button type="button" className="flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-indigo-500 text-white rounded-md transition-all">2</button>
                <button type="button" className="flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-white border border-gray-200 rounded-md hover:bg-gray-100/70 transition-all">3</button>
                <button type="button" className="flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-white border border-gray-200 rounded-md hover:bg-gray-100/70 transition-all">4</button>
                <button type="button" className="flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-white border border-gray-200 rounded-md hover:bg-gray-100/70 transition-all">5</button>
                <button type="button" className="flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square bg-white border border-gray-200 rounded-md hover:bg-gray-100/70 transition-all">6</button> */}
      </div>

      <button
        type="button"
        aria-label="Next"
        className="ml-4 disabled:opacity-30"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPage}
      >
        <svg
          width="9"
          height="16"
          viewBox="0 0 12 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L10 9.24242L1 17"
            stroke="#111820"
            strokeOpacity="0.7"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
