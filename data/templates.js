const templates = [
    {
        id: 'blog-simple',
        name: '简约博客',
        description: '清新简约的博客模板，适合个人写作和分享',
        thumbnail: '/images/templates/blog-simple.png',
        content: `
            <header class="blog-header">
                <h1>我的博客标题</h1>
                <p class="blog-description">分享生活，记录点滴</p>
            </header>
            
            <article class="blog-post">
                <h2>文章标题</h2>
                <div class="post-meta">
                    <span class="post-date">发布于: 2024年1月1日</span>
                    <span class="post-category">分类: 生活随笔</span>
                </div>
                <div class="post-content">
                    <p>在这里编写您的文章内容...</p>
                </div>
                <div class="post-tags">
                    <span class="tag">标签1</span>
                    <span class="tag">标签2</span>
                </div>
            </article>
        `,
        styles: `
            .blog-header {
                text-align: center;
                padding: 3rem 0;
                background-color: #f8f9fa;
                margin-bottom: 2rem;
            }
            .blog-description {
                color: #6c757d;
                font-size: 1.2rem;
            }
            .blog-post {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
            }
            .post-meta {
                color: #6c757d;
                margin: 1rem 0;
            }
            .post-content {
                line-height: 1.8;
            }
            .post-tags {
                margin-top: 2rem;
            }
            .tag {
                background: #e9ecef;
                padding: 0.3rem 0.8rem;
                border-radius: 20px;
                margin-right: 0.5rem;
                font-size: 0.9rem;
            }
        `
    },
    {
        id: 'forum-modern',
        name: '现代论坛',
        description: '现代化的论坛讨论区模板，支持多层评论',
        thumbnail: '/images/templates/forum-modern.png',
        content: `
            <div class="forum-container">
                <div class="forum-header">
                    <h1>讨论区标题</h1>
                    <div class="forum-stats">
                        <span>话题数: 1</span>
                        <span>回复数: 0</span>
                    </div>
                </div>
                
                <div class="topic-list">
                    <div class="topic-item">
                        <div class="topic-title">
                            <h2>话题标题</h2>
                            <span class="topic-meta">作者 • 发布时间</span>
                        </div>
                        <div class="topic-content">
                            <p>在这里编写话题内容...</p>
                        </div>
                        <div class="topic-actions">
                            <button class="btn-reply">回复</button>
                            <button class="btn-share">分享</button>
                        </div>
                    </div>
                    
                    <div class="comments-section">
                        <h3>评论区</h3>
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">用户名</span>
                                <span class="comment-time">评论时间</span>
                            </div>
                            <div class="comment-content">
                                <p>在这里编写评论...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        styles: `
            .forum-container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 2rem;
            }
            .forum-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #dee2e6;
            }
            .forum-stats {
                color: #6c757d;
            }
            .forum-stats span {
                margin-left: 1rem;
            }
            .topic-item {
                background: white;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .topic-meta {
                color: #6c757d;
                font-size: 0.9rem;
            }
            .topic-actions {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #dee2e6;
            }
            .btn-reply, .btn-share {
                padding: 0.5rem 1rem;
                margin-right: 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .btn-reply {
                background-color: #007bff;
                color: white;
            }
            .btn-share {
                background-color: #6c757d;
                color: white;
            }
            .comments-section {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 2px solid #dee2e6;
            }
            .comment {
                padding: 1rem;
                margin: 1rem 0;
                background: #f8f9fa;
                border-radius: 4px;
            }
            .comment-header {
                margin-bottom: 0.5rem;
            }
            .comment-author {
                font-weight: bold;
            }
            .comment-time {
                color: #6c757d;
                margin-left: 1rem;
                font-size: 0.9rem;
            }
        `
    },
    {
        id: 'portfolio',
        name: '作品集',
        description: '展示个人作品和项目的专业模板',
        thumbnail: '/images/templates/portfolio.png',
        content: `
            <div class="portfolio-container">
                <header class="portfolio-header">
                    <h1>我的作品集</h1>
                    <p class="portfolio-intro">这里展示我的最新作品和项目</p>
                </header>
                
                <div class="portfolio-grid">
                    <div class="portfolio-item">
                        <div class="portfolio-image">
                            <img src="/images/placeholder.jpg" alt="作品标题">
                        </div>
                        <div class="portfolio-info">
                            <h3>作品标题</h3>
                            <p>作品描述...</p>
                            <div class="portfolio-tags">
                                <span class="tag">标签1</span>
                                <span class="tag">标签2</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <section class="about-section">
                    <h2>关于我</h2>
                    <p>在这里介绍自己...</p>
                    <div class="skills">
                        <h3>技能专长</h3>
                        <div class="skill-tags">
                            <span class="skill-tag">技能1</span>
                            <span class="skill-tag">技能2</span>
                        </div>
                    </div>
                </section>
            </div>
        `,
        styles: `
            .portfolio-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            .portfolio-header {
                text-align: center;
                padding: 4rem 0;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                margin-bottom: 3rem;
                border-radius: 8px;
            }
            .portfolio-intro {
                color: #666;
                font-size: 1.2rem;
                margin-top: 1rem;
            }
            .portfolio-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            .portfolio-item {
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            .portfolio-item:hover {
                transform: translateY(-5px);
            }
            .portfolio-image img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            .portfolio-info {
                padding: 1.5rem;
            }
            .portfolio-tags, .skill-tags {
                margin-top: 1rem;
            }
            .tag, .skill-tag {
                display: inline-block;
                padding: 0.3rem 0.8rem;
                margin: 0.2rem;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            .tag {
                background: #e9ecef;
                color: #495057;
            }
            .skill-tag {
                background: #007bff;
                color: white;
            }
            .about-section {
                max-width: 800px;
                margin: 4rem auto;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .skills {
                margin-top: 2rem;
            }
        `
    }
];

module.exports = templates;
