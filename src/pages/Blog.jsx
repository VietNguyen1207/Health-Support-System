import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Pagination,
  Spin,
  Typography,
  Space,
  Tag,
  Divider,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import blogData from "../data/blog.json";

const { Title, Paragraph } = Typography;

const Blog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 6;

  // Filter blogs based on search term
  const filteredBlogs = blogData.blog.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastBlog = currentPage * pageSize;
  const indexOfFirstBlog = indexOfLastBlog - pageSize;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="general-wrapper">
      {/* Header Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Psychology Blog</h1>
          <p className="hero-subtitle">
            Discover insights about student mental health, well-being, and
            academic success
          </p>
        </div>
      </div>
      {/* <div className="text-center mb-12">
        <Title level={1} className="text-4xl font-bold text-gray-900 mb-4">
          School Psychology Blog
        </Title>
        <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover insights about student mental health, well-being, and
          academic success
        </Paragraph>
      </div> */}

      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <Input
            size="large"
            placeholder="Search articles..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="w-full h-full flex justify-center items-center py-32">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentBlogs.map((blog, index) => (
              <Card
                key={index}
                hoverable
                cover={
                  <div className="h-48 overflow-hidden">
                    <img
                      alt={blog.title}
                      src={blog.avatar}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                }
                className="shadow-md hover:shadow-xl transition-shadow duration-300"
                onClick={() => navigate(`/blog/${index}`)}>
                <Space direction="vertical" size="small" className="w-full">
                  <Tag color="blue" className="mb-2">
                    {blog.department}
                  </Tag>
                  <Title
                    level={4}
                    className="mb-2 line-clamp-2 hover:text-blue-600">
                    {blog.title}
                  </Title>
                  <Paragraph className="text-gray-600 line-clamp-3">
                    {blog.description}
                  </Paragraph>
                  <Divider className="my-3" />
                  <Space className="text-gray-500 text-sm">
                    <Space>
                      <UserOutlined />
                      {blog.createBy}
                    </Space>
                    <Space>
                      <CalendarOutlined />
                      {blog.createDate}
                    </Space>
                  </Space>
                </Space>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center">
          <Pagination
            current={currentPage}
            onChange={setCurrentPage}
            total={filteredBlogs.length}
            pageSize={pageSize}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Blog;
