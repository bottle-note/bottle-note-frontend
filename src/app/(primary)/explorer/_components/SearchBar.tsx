export const SearchBar = () => {
  return (
    <div className="mb-6 p-1 bg-white rounded-lg shadow">
      <div className="flex items-center mb-2 pt-3 px-3">
        <span className="ml-2 text-lg font-semibold text-amber-700">
          Bottle Note
        </span>
      </div>
      <div className="flex items-center mb-2 px-3">
        <input
          type="text"
          placeholder="입력..."
          className="flex-grow py-2.5 px-2 border-b-2 border-gray-200 focus:border-amber-500 outline-none bg-transparent text-base placeholder-gray-400"
        />
        <button className="ml-3 px-4 py-2 bg-white border border-amber-600 text-amber-600 rounded-md text-sm font-medium whitespace-nowrap hover:bg-amber-50 transition-colors">
          + 추가
        </button>
        <button className="ml-2 px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium whitespace-nowrap hover:bg-amber-700 transition-colors flex items-center">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            ></path>
          </svg>
          검색
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3 px-3">
        보고싶은 리뷰의 내용, 플레이버태그, 작성자, 위스키이름을 추가하여
        검색해보세요.
      </p>
    </div>
  );
};
