import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Spin, Typography, Space, Tag, Divider } from "antd";
import { CalendarOutlined, UserOutlined, LikeOutlined, LikeFilled } from "@ant-design/icons";
import { useArticleStore } from "../stores/apiBlog"; 

const { Title, Paragraph } = Typography;

const BlogDetail = () => {
  const { articleId } = useParams();
  const location = useLocation();

  const { avatar, description, createDate } = location.state || {};
  
  const { article, getArticleById, likeArticle, resetArticle, loading } = useArticleStore((state) => ({
    article: state.article,
    getArticleById: state.getArticleById,
    likeArticle: state.likeArticle,
    resetArticle: state.resetArticle,
    loading: state.loading,
  }));

  useEffect(() => {
    resetArticle(); 
    if (articleId) {
      getArticleById(articleId); 
    }
  }, [articleId, getArticleById, resetArticle]);

  
  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return <div>Article not found!</div>;
  }


  return (
    <div className="general-wrapper p-8">
      <Card
        hoverable
        cover={
          <div className="h-64 overflow-hidden">
            <img
              alt={article.title}
              src={avatar}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        }
        className="shadow-md hover:shadow-xl transition-shadow duration-300"
      >
        <Space direction="vertical" size="small" className="w-full">
          <Tag color="blue" className="mb-2">
            {article.tags?.join(", ") || "No tags"}
          </Tag>

          <Title level={2} className="mb-2">{article.title}</Title>

          <Paragraph className="text-gray-600">{description || "No description available."}</Paragraph>

          <Divider className="my-3" />

          <Space className="text-gray-500 text-sm">
            <Space>
              <UserOutlined />
              {article.authorName || "Unknown Author"}
            </Space>
            <Space>
              <CalendarOutlined />
              {createDate}
            </Space>
          </Space>

          <Divider className="my-3" />

          <Title level={3}>Content</Title>
          <Paragraph>{article.content || "Content not available."}</Paragraph>

          <Space className="text-gray-500 text-sm">
            <button
              onClick={() => likeArticle(article.articleId)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              {article.isLiked ? <LikeFilled /> : <LikeOutlined />}
              <span>Like ({article.likes})</span>
            </button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default BlogDetail;
