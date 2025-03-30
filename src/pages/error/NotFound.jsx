import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">
        Oops! Trang không tồn tại
      </h2>
      <p className="text-gray-500 mb-8">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
        Trở về
      </button>
    </div>
  );
};

export default NotFound;
