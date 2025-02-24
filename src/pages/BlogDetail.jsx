import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Breadcrumb,
  Card,
  Space,
  Divider,
  Button,
  Affix,
} from "antd";
import {
  LeftOutlined,
  CalendarOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import blogData from "../data/blog.json";

const { Title, Paragraph } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const blog = blogData.blog[id];
  const currentIndex = parseInt(id);

  // Get related blogs (excluding current blog)
  const relatedBlogs = blogData.blog
    .filter((_, index) => index !== currentIndex)
    .slice(0, 3);

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 general-wrapper">
      <div className="mx-auto relative">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <Breadcrumb.Item>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate("/blog")}
              className="hover:text-blue-600">
              Back to Blogs
            </Button>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className="flex gap-8">
          <div className="bg-white flex-1 shadow-md px-8 py-4 rounded-lg">
            {/* Header Image */}
            <div className="rounded-lg overflow-hidden mb-8">
              <img
                src={blog.avatar}
                alt={blog.title}
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Blog Header */}
            <div className="text-center mb-12">
              <Title level={1} className="mb-4">
                {blog.title}
              </Title>
              <Space
                split={<Divider type="vertical" />}
                className="text-gray-500">
                <Space>
                  <UserOutlined />
                  {blog.createBy}
                </Space>
                <Space>
                  <CalendarOutlined />
                  {blog.createDate}
                </Space>
              </Space>
            </div>

            {/* Blog Content */}
            <div>
              <Paragraph className="text-lg text-gray-700 mb-8">
                {blog.description}
              </Paragraph>

              {blog.children.map((section, index) => (
                <div key={index} className="mb-12">
                  {section.headerSection && (
                    <Title level={3} className="mb-6">
                      {section.headerSection}
                    </Title>
                  )}

                  <Paragraph className="text-gray-700 mb-6">
                    {section.sectionContent}
                  </Paragraph>

                  {section.imageSection && (
                    <div className="rounded-lg overflow-hidden my-8">
                      <img
                        src={section.imageSection}
                        alt={section.headerSection}
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Sidebar */}
          <Affix offsetTop={100} className="hidden lg:block">
            <div className="w-80">
              <Card className="shadow-md">
                <Title level={4} className="mb-6">
                  Related Articles
                </Title>
                <div className="space-y-6">
                  {relatedBlogs.map((relatedBlog, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/blog/${index === currentIndex ? index + 1 : index}`
                        )
                      }>
                      <div className="h-32 mb-2 overflow-hidden rounded-lg">
                        <img
                          src={relatedBlog.avatar}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <Title
                        level={5}
                        className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedBlog.title}
                      </Title>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarOutlined className="mr-2" />
                        {relatedBlog.createDate}
                      </div>
                      <div className="mt-2 flex items-center text-blue-600 text-sm group-hover:text-blue-700">
                        Read More
                        <RightOutlined className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Affix>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
