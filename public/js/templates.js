document.addEventListener('DOMContentLoaded', function() {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        const useTemplateBtn = card.querySelector('.use-template-btn');
        
        useTemplateBtn.addEventListener('click', async function() {
            const templateId = card.dataset.templateId;
            
            try {
                // 获取模板数据
                const response = await fetch(`/api/templates/${templateId}`);
                const template = await response.json();
                
                if (template) {
                    // 将模板数据存储到 localStorage
                    localStorage.setItem('selectedTemplate', JSON.stringify(template));
                    // 跳转到编辑器页面
                    window.location.href = '/editor';
                }
            } catch (error) {
                console.error('获取模板失败:', error);
                alert('获取模板失败，请重试！');
            }
        });
    });
});
