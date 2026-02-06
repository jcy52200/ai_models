/**
 * 主题配置文件
 * 用于集中管理网站的核心信息、品牌元素和主题色
 * 在创建衍生项目时，只需修改此文件即可快速定制
 */

export const siteConfig = {
    // 基础信息
    name: '素居',
    slogan: '简约生活，自然之选',
    description: '高品质家具电商平台 - 打造您的完美舒适家居',

    // SEO 信息
    seo: {
        title: '素居 - 简约生活，自然之选',
        description: '素居提供精心策展的家具系列，将永恒设计与现代舒适完美融合。',
        keywords: '家具,家居,电商,素居,简约,舒适',
    },

    // 联系信息
    contact: {
        email: 'contact@suju.com',
        phone: '400-888-8888',
        address: '中国 上海市 某某区某某路123号',
    },

    // 社交媒体
    social: {
        wechat: '#',
        weibo: '#',
        xiaohongshu: '#',
        douyin: '#',
        instagram: '#',
    },

    // 品牌色（RGB格式，用于 Tailwind）
    colors: {
        primary: '#000000',        // 主色调 - 黑色
        secondary: '#7c7c7c',      // 辅助色 - 灰色
        accent: '#f8f8f8',         // 强调色 - 浅灰
        background: '#ffffff',     // 背景色
        text: '#000000',           // 文字色
    },

    // 字体配置
    fonts: {
        display: "'Cormorant Garamond', serif",  // 展示字体（标题）
        body: "'Lato', sans-serif",               // 正文字体
    },

    // 其他配置
    features: {
        aiChatEnabled: true,        // 是否启用AI助手
        notificationEnabled: true,  // 是否启用通知功能
    },
};

export default siteConfig;
