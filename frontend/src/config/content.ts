/**
 * 内容配置文件
 * 用于集中管理网站的所有文案内容
 * 在创建衍生项目时，修改此文件以适配不同的商城主题
 */

export const content = {
    // Header 导航栏
    header: {
        nav: [
            { name: '首页', href: '/' },
            { name: '商城', href: '/search' },
            { name: '关于', href: '/#about' },
            { name: '分类', href: '/#categories' },
            { name: '联系', href: '/#footer' },
        ],
    },

    // Hero 首页大图区域
    hero: {
        title: '打造您的完美\n舒适家居',
        subtitle: '发现精心策展的家具系列，改变您的生活空间',
        cta: '探索系列',
        scrollHint: '向下滚动',
    },

    // About 关于我们
    about: {
        title: '关于素居',
        description: [
            '我们相信家具不仅仅是功能性的——它是您个性的表达，是您避风港的基础。我们的精心策展系列将永恒设计与现代舒适完美融合。',
            '每一件产品都经过精心挑选，确保品质与美学的统一。从原材料的选择到工艺的打磨，我们追求极致，只为给您带来最优质的家居体验。',
        ],
        cta: '了解更多',
        stats: [
            { value: '10+', label: '年经验' },
            { value: '5000+', label: '满意客户' },
            { value: '100%', label: '可持续材料' },
        ],
        imageAlt: '素居生活方式',
    },

    // Footer 页脚
    footer: {
        tagline: '通过深思熟虑的设计改变您的生活空间。',
        copyright: '© 2024 素居。保留所有权利。',

        sections: {
            pages: {
                title: '页面',
                links: [
                    { name: '首页', href: '#hero' },
                    { name: '商城', href: '#products' },
                    { name: '关于', href: '#about' },
                    { name: '分类', href: '#categories' },
                    { name: '联系', href: '#footer' },
                ],
            },
            info: {
                title: '信息',
                links: [
                    { name: '关于我们', href: '#about' },
                    { name: '配送信息', href: '#' },
                    { name: '退货政策', href: '#' },
                    { name: '联系我们', href: '#' },
                ],
            },
            social: {
                title: '关注我们',
                links: [
                    { name: '微信', href: '#' },
                    { name: '微博', href: '#' },
                    { name: '小红书', href: '#' },
                    { name: '抖音', href: '#' },
                    { name: 'Instagram', href: '#' },
                ],
            },
        },

        paymentMethods: ['支付宝', '微信', '银联'],
        paymentLabel: '支付方式:',
    },

    // 认证页面
    auth: {
        login: {
            title: '登录',
            welcome: '欢迎回来',
            accountLabel: '用户名/邮箱',
            accountPlaceholder: '请输入用户名或邮箱',
            passwordLabel: '密码',
            passwordPlaceholder: '请输入密码',
            rememberMe: '记住我',
            forgotPassword: '忘记密码？',
            submitButton: '登录',
            submitting: '登录中...',
            noAccount: '还没有账号？',
            registerLink: '立即注册',
        },
        register: {
            title: '注册',
            welcome: '创建新账号',
            usernameLabel: '用户名',
            usernamePlaceholder: '请输入用户名',
            emailLabel: '邮箱',
            emailPlaceholder: '请输入邮箱',
            passwordLabel: '密码',
            passwordPlaceholder: '请输入密码',
            confirmPasswordLabel: '确认密码',
            confirmPasswordPlaceholder: '请再次输入密码',
            submitButton: '注册',
            submitting: '注册中...',
            hasAccount: '已有账号？',
            loginLink: '立即登录',
        },
    },

    // ImageMarquee 图片展示
    imageMarquee: {
        title: '精选展示',
        subtitle: '探索素居的精美空间设计，感受每一个细节的用心',
        hint: '拖动浏览更多',
        images: [
            { src: '/show_pictures/banner-bg.jpg', alt: '素居展示图片 - 横幅背景' },
            { src: '/show_pictures/hero-bg.jpg', alt: '素居展示图片 - 主视觉背景' },
        ],
    },

    // 管理后台
    admin: {
        title: '素居后台',
        shortTitle: '素 居',
        backToShop: '返回商城',
        logout: '退出登录',
        nav: [
            { label: '仪表盘', path: '/admin' },
            { label: '用户管理', path: '/admin/users' },
            { label: '分类管理', path: '/admin/categories' },
            { label: '商品管理', path: '/admin/products' },
            { label: '订单管理', path: '/admin/orders' },
            { label: '评价管理', path: '/admin/reviews' },
        ],
    },
};

export default content;
