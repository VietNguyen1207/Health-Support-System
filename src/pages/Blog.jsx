import { useEffect, useState } from "react";
import { Card, Input, Pagination, Spin, Typography, Space, Tag, Divider } from "antd";
import { SearchOutlined, CalendarOutlined, UserOutlined, LikeOutlined, LikeFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useArticleStore } from "../stores/apiBlog"; 

const { Title, Paragraph } = Typography;

const Blog = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const maxArticles = 10;


    const createDate = [
      "2025-03-28",
      "2025-03-29",
      "2025-03-30",
      "2025-03-31",
      "2025-04-01",
      "2025-04-02",
      "2025-04-03",
      "2025-04-04",
      "2025-04-05",
      "2025-04-06"
    ];

    const listDescription = [
      "Finding peace in stressful life and strategies to maintain mental well-being.",
      "How to recognize signs of stress and effective ways to reduce tension in everyday life.",
      "Ways to improve your mood and boost mental health through simple habits.",
      "The importance of building healthy relationships to maintain emotional stability.",
      "Measures to overcome loneliness and feelings of emptiness during tough times.",
      "How to manage emotions and handle negative thoughts affecting your mental health.",
      "Activities that help boost your spirits and improve your mental state during stressful periods.",
      "Introduction to mental health support therapies like meditation, yoga, and cognitive behavioral therapy.",
      "How to cope with anxiety and depression in a busy life and regain emotional balance.",
      "Sharing stories and advice from those who have overcome mental health challenges."
    ]
    
    
    const defaultAvatars = [
      "https://media.istockphoto.com/id/1466497793/vi/vec-to/b%E1%BB%99-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-d%C3%B2ng-c%C4%83ng-th%E1%BA%B3ng-v%C3%A0-s%E1%BB%A9c-kh%E1%BB%8Fe-t%C3%A2m-th%E1%BA%A7n-lo-l%E1%BA%AFng-l%C3%A0m-vi%E1%BB%87c-qu%C3%A1-s%E1%BB%A9c-tr%E1%BA%A7m-c%E1%BA%A3m-t%C3%A2m-l%C3%BD.jpg?s=612x612&w=0&k=20&c=_-hfnEbdHmnI14JKNqMXlJ24dmOFupV23a0inXTzdS4=",
      "https://media.istockphoto.com/id/1492377092/vi/anh/k%C3%ADnh-l%C3%BAp-v%E1%BB%9Bi-brainstorm-b%C3%AAn-trong-%C4%91%E1%BB%83-th%C3%B4ng-minh-%C3%BD-t%C6%B0%E1%BB%9Fng-s%C3%A1ng-t%E1%BA%A1o-t%C6%B0-duy-gi%C3%A1o-d%E1%BB%A5c-%C4%91%E1%BB%95i-m%E1%BB%9Bi-kh%C3%A1i.jpg?s=612x612&w=0&k=20&c=S1lW1T7ToUgZwTyzFbDZnMrO-iDkGKXrWC6hek1mesU=",
      "https://media.istockphoto.com/id/1423921825/vi/vec-to/manipulator-kh%C3%A1i-ni%E1%BB%87m-vector-minh-h%E1%BB%8Da-b%C3%A0n-tay-b%E1%BA%ADc-th%E1%BA%A7y-b%C3%B9-nh%C3%ACn-thao-t%C3%BAng-t%C3%A2m-tr%C3%AD-con-ng%C6%B0%E1%BB%9Di.jpg?s=612x612&w=0&k=20&c=jqgZioujzSHQeb2dvujRHBYlcNFFS5y8EJDNEtNC7o8=",
      "https://media.istockphoto.com/id/1529902284/vi/vec-to/kh%C3%A1i-ni%E1%BB%87m-s%E1%BB%A9c-kh%E1%BB%8Fe-t%C3%A2m-th%E1%BA%A7n.jpg?s=612x612&w=0&k=20&c=ztWS4jFCG_EHzT14aHpBUJgUKy7KaGn6QZe8hv0xPHc=",
      "https://media.istockphoto.com/id/1429928609/vi/anh/bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-b%E1%BA%B1ng-gi%E1%BA%A5y-v%C3%A0-hoa-tr%C3%AAn-n%E1%BB%81n-m%C3%A0u-xanh-lam.jpg?s=612x612&w=0&k=20&c=2IuDxETq47C5CkLMmcg7W3CAD7htkqZBGxc800yw-1k=",
      "https://media.istockphoto.com/id/1319874358/vi/vec-to/%C4%91i%E1%BB%81u-tr%E1%BB%8B-y-t%E1%BA%BF-s%E1%BB%A9c-kh%E1%BB%8Fe-t%C3%A2m-th%E1%BA%A7n.jpg?s=612x612&w=0&k=20&c=oLNefL2ab5YebG5QROJGcDVQlc6-VLHg2gYAjK7wpJw=",
      "https://media.istockphoto.com/id/1546808875/vi/vec-to/ng%C3%A0y-s%E1%BB%A9c-kh%E1%BB%8Fe-t%C3%A2m-th%E1%BA%A7n-th%E1%BA%BF-gi%E1%BB%9Bi-thi%E1%BA%BFt-k%E1%BA%BF-%C3%BD-t%C6%B0%E1%BB%9Fng-v%E1%BB%9Bi-h%E1%BB%93-s%C6%A1-%C4%91%E1%BA%A7u-ng%C6%B0%E1%BB%9Di-tr%E1%BB%ABu-t%C6%B0%E1%BB%A3ng-hoa-v%C3%A0-chim.jpg?s=612x612&w=0&k=20&c=RwaEuaZsIe5j7dii-7tq-lSMpivb0TIt5YIHR9FAiLY=",
      "https://media.istockphoto.com/id/1281210009/vi/anh/ng%C6%B0%E1%BB%9Di-ph%E1%BB%A5-n%E1%BB%AF-ch%C3%A2u-%C3%A1-ch%C3%A1n-n%E1%BA%A3n-trong-nhi%E1%BB%81u-suy-ngh%C4%A9-s%C3%A2u-s%E1%BA%AFc-c%C3%B3-v%E1%BA%A5n-%C4%91%E1%BB%81-v%E1%BB%9Bi-suy-ngh%C4%A9-qu%C3%A1-nhi%E1%BB%81u.jpg?s=612x612&w=0&k=20&c=IV_z4O_lCGHUx5Hrp5io0E4fJWtyLnJtlm_P08Pfrp4=",
      "https://media.istockphoto.com/id/2121029847/vi/vec-to/nh%C3%B3m-l%E1%BB%9Bn-nh%E1%BB%AFng-ng%C6%B0%E1%BB%9Di-%C4%91a-d%E1%BA%A1ng-v%E1%BB%9Bi-suy-ngh%C4%A9.jpg?s=1024x1024&w=is&k=20&c=unqxmIwvWT7nASQ9d_4XPKFlhZVEivL75QCTFx1l6FE=",
      "https://media.istockphoto.com/id/1513072392/vi/anh/tay-c%E1%BA%A7m-%C4%91%E1%BA%A7u-gi%E1%BA%A5y-n%C3%A3o-ng%C6%B0%E1%BB%9Di-v%E1%BB%9Bi-hoa-kh%C3%A1i-ni%E1%BB%87m-ch%C4%83m-s%C3%B3c-b%E1%BA%A3n-th%C3%A2n-v%C3%A0-s%E1%BB%A9c-kh%E1%BB%8Fe-t%C3%A2m-th%E1%BA%A7n-suy-ngh%C4%A9.jpg?s=1024x1024&w=is&k=20&c=CmMJomD9MQx5NxZdZmtq1skRRtb-BmbppqnJRTAkdGk="
    ];

    const { articles, loading, fetchArticle, likeArticle } = useArticleStore((state) => ({
      articles: [...state.articles.values()],
      loading: state.loading,
      fetchArticle: state.fetchArticle,
      likeArticle: state.likeArticle,
    }));

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    useEffect(() => {
      fetchArticle(); 
    }, []);

    
    const limitedArticles = articles.slice(0, maxArticles);


    const filteredBlogs = limitedArticles.filter(
      (blog) =>
        
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.description && blog.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastBlog = currentPage * pageSize;
    const indexOfFirstBlog = indexOfLastBlog - pageSize;
    const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

    return (
      <div className="general-wrapper">
        <div className="mb-8">
          <Input
            size="large"
            placeholder="Search articles..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-lg mt-4 ml-4"
          />
        </div>

        {loading ? (
          <div className="w-full h-full flex justify-center items-center py-32">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 mx-4">
            {currentBlogs.map((blog, index) => {
              
              const globalIndex = indexOfFirstBlog + index;
              
              return (
                <Card
                  key={blog.articleId}
                  hoverable
                  cover={
                    <div className="h-48 overflow-hidden">
                      <img
                        alt={blog.title}
                        src={blog.avatar || defaultAvatars[globalIndex % defaultAvatars.length]}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  }
                  className="shadow-md hover:shadow-xl transition-shadow duration-300"
                  onClick={() => navigate(`/blog/${blog.articleId}`, {
                    state: {
                      avatar: defaultAvatars[globalIndex % defaultAvatars.length],
                      description: listDescription[globalIndex % listDescription.length],
                      createDate: createDate[globalIndex % createDate.length],
                    }
                  })}
                >
                  <Space direction="vertical" size="small" className="w-full">
                    <Tag color="blue" className="mb-2">
                      {blog.tags}
                    </Tag>
                    <Title level={4} className="mb-2 line-clamp-2 hover:text-blue-600">
                      {blog.title}
                    </Title>
                    <Paragraph className="text-gray-600 line-clamp-3">
                      {blog.description || listDescription[globalIndex % listDescription.length]}
                    </Paragraph>
                    <Divider className="my-3" />
                    <Space className="text-gray-500 text-sm">
                      <Space>
                        <UserOutlined />
                        {blog.authorName}
                      </Space>
                      <Space>
                        <CalendarOutlined />
                        {createDate[globalIndex % createDate.length]}
                      </Space>
                    </Space>
                    <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      likeArticle(blog.articleId); 
                    }}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {blog.isLiked ? <LikeFilled /> : <LikeOutlined />}  
                    <span>Like ({blog.likes})</span>  
                  </button>

                  </Space>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Pagination
            current={currentPage}
            onChange={handlePageChange}
            total={filteredBlogs.length}
            pageSize={pageSize}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
};

export default Blog;