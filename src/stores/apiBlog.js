import { create } from "zustand";
import { api } from "./apiConfig"; 

export const useArticleStore = create((set, get) => ({
    article: null,
    articles: new Map(),
    loading: false,
    error: null,

    resetArticle: () => {
        set({ article: null });
    },

    fetchArticle: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get("/articles/all");
            const articleMap = new Map(response.data.map((article) => [article.articleId, article]));

            set({ articles: articleMap, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    getArticleById: async (articleId) => {
        const articles = get().articles;
        const article = articles.get(articleId);

        if (article) {
            set({ article });
            return article;
        }

        set({loading: true, error: null});
        try {
            const response = await api.get(`/articles?articleId=${articleId}`);
            set({ article: response.data, loading: false });
            return response.data;
        }
        catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    likeArticle: async (articleId) => {
        try {
          await api.post(`/articles/like?articleId=${articleId}`);  
          set((state) => {
            const articles = new Map(state.articles);  
            const article = articles.get(articleId);   
  
            if (article) {
              article.likes += 1;     
              article.isLiked = true;  
              articles.set(articleId, article);  
            }
      
            return { articles }; 
          });
        } catch (error) {
          
          set({ error: error.message });
        }
      },


}));