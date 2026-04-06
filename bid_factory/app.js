/**
 * 标书工厂 - Web 应用逻辑
 * 使用 docx.js 在浏览器端生成 Word 文档
 */

// 全局变量存储解析的项目信息
let projectInfo = {};
let generatedFiles = [];

// 公司信息（可自定义）
const companyInfo = {
    name: 'XX 科技有限公司',
    address: 'XX 省 XX 市 XX 区 XX 路 XX 号',
    phone: '010-XXXXXXXX',
    email: 'bid@company.com',
    legalRep: 'XXX',
    registerCapital: 'XXXX 万元',
    establishDate: '20XX 年 XX 月'
};

/**
 * 解析招标公告文本
 */
function parseAnnouncement() {
    console.log('=== 开始解析公告 ===');
    
    const inputElement = document.getElementById('announcementInput');
    if (!inputElement) {
        console.error('找不到输入框元素');
        alert('系统错误：找不到输入框，请刷新页面重试');
        return;
    }
    
    const text = inputElement.value.trim();
    
    if (!text) {
        alert('请先输入或粘贴招标公告内容！\n\n提示：您可以点击"加载示例"按钮查看示例格式。');
        return;
    }

    console.log('输入文本长度:', text.length);
    
    try {
        // 提取关键信息
        projectInfo = extractBidInfo(text);
        
        // 检查是否解析到任何有效信息
        const hasValidInfo = Object.values(projectInfo).some(v => v && v !== '未识别' && v !== text);
        
        if (!hasValidInfo) {
            console.warn('未能解析到有效信息');
            alert('⚠️ 未能自动识别公告信息，请检查输入格式是否正确。\n\n确保公告包含以下关键信息：\n- 项目名称\n- 招标人/采购人\n- 项目编号（如有）\n\n您可以手动编辑解析后的信息。');
        }
        
        // 显示解析结果
        displayParsedInfo();
        
        console.log('解析完成，项目信息:', projectInfo);
        
        // 切换到步骤 2
        showStep(2);
        
    } catch (error) {
        console.error('解析过程中发生错误:', error);
        alert('解析失败：' + error.message + '\n\n请检查输入内容格式，或联系技术支持。');
    }
}

/**
 * 从文本中提取标书信息
 */
function extractBidInfo(text) {
    console.log('开始解析公告内容，文本长度:', text.length);
    
    const info = {
        projectName: extractByPatterns(text, [
            /项目名称\s*[：:]\s*(.+?)(?:\n|$)/i,
            /一、项目名称\s*[：:]\s*(.+?)(?:\n|$)/i,
            /工程名称\s*[：:]\s*(.+?)(?:\n|$)/i,
            /采购项目名称\s*[：:]\s*(.+?)(?:\n|$)/i,
            /标的名称\s*[：:]\s*(.+?)(?:\n|$)/i,
            /包件名称\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        projectNumber: extractByPatterns(text, [
            /项目编号\s*[：:]\s*(.+?)(?:\n|$)/i,
            /招标编号\s*[：:]\s*(.+?)(?:\n|$)/i,
            /采购编号\s*[：:]\s*(.+?)(?:\n|$)/i,
            /标段编号\s*[：:]\s*(.+?)(?:\n|$)/i,
            /包件编号\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        tenderer: extractByPatterns(text, [
            /招标人\s*[：:]\s*(.+?)(?:\n|$)/i,
            /采购人\s*[：:]\s*(.+?)(?:\n|$)/i,
            /业主单位\s*[：:]\s*(.+?)(?:\n|$)/i,
            /建设单位\s*[：:]\s*(.+?)(?:\n|$)/i,
            /采购单位\s*[：:]\s*(.+?)(?:\n|$)/i,
            /招标单位\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        bidDeadline: extractByPatterns(text, [
            /投标截止时间\s*[：:]\s*(.+?)(?:\n|$)/i,
            /递交投标文件截止时间\s*[：:]\s*(.+?)(?:\n|$)/i,
            /投标截止及开标时间\s*[：:]\s*(.+?)(?:\n|$)/i,
            /截止时间\s*[：:]\s*(.+?)(?:\n|$)/i,
            /报名截止时间\s*[：:]\s*(.+?)(?:\n|$)/i,
            /开标时间\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        budget: extractByPatterns(text, [
            /预算金额\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
            /招标控制价\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
            /最高限价\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
            /项目预算\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
            /采购预算\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
            /预算\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
            /投资额\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i
        ]),
        projectLocation: extractByPatterns(text, [
            /项目地点\s*[：:]\s*(.+?)(?:\n|$)/i,
            /实施地点\s*[：:]\s*(.+?)(?:\n|$)/i,
            /交货地点\s*[：:]\s*(.+?)(?:\n|$)/i,
            /服务地点\s*[：:]\s*(.+?)(?:\n|$)/i,
            /建设地点\s*[：:]\s*(.+?)(?:\n|$)/i,
            /项目地址\s*[：:]\s*(.+?)(?:\n|$)/i,
            /工程地点\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        contactName: extractByPatterns(text, [
            /联系人\s*[：:]\s*(.+?)(?:\n|$)/i,
            /联系人姓名\s*[：:]\s*(.+?)(?:\n|$)/i,
            /代理机构联系人\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        contactPhone: extractByPatterns(text, [
            /联系电话\s*[：:]\s*(.+?)(?:\n|$)/i,
            /联系方式\s*[：:]\s*(.+?)(?:\n|$)/i,
            /联系人电话\s*[：:]\s*(.+?)(?:\n|$)/i,
            /手机\s*[：:]\s*(.+?)(?:\n|$)/i,
            /电话\s*[：:]\s*(.+?)(?:\n|$)/i,
            /传真\s*[：:]\s*(.+?)(?:\n|$)/i
        ]),
        rawText: text
    };

    console.log('解析结果:', info);
    return info;
}

/**
 * 使用多个正则表达式模式提取信息
 */
function extractByPatterns(text, patterns) {
    for (const pattern of patterns) {
        try {
            const match = text.match(pattern);
            if (match && match[1]) {
                const result = match[1].trim();
                console.log('匹配成功 - 模式:', pattern, '结果:', result);
                return result;
            }
        } catch (e) {
            console.error('正则匹配错误:', pattern, e);
        }
    }
    console.log('未匹配到任何模式');
    return '未识别';
}

/**
 * 显示解析的项目信息
 */
function displayParsedInfo() {
    const container = document.getElementById('parsedInfo');
    if (!container) {
        console.error('找不到 parsedInfo 容器');
        return;
    }
    
    const fields = [
        { label: '项目名称', key: 'projectName', editable: true, required: true },
        { label: '项目编号', key: 'projectNumber', editable: true, required: false },
        { label: '招标人', key: 'tenderer', editable: true, required: true },
        { label: '预算金额', key: 'budget', editable: true, required: false },
        { label: '投标截止时间', key: 'bidDeadline', editable: true, required: false },
        { label: '项目地点', key: 'projectLocation', editable: true, required: false },
        { label: '联系人', key: 'contactName', editable: true, required: false },
        { label: '联系电话', key: 'contactPhone', editable: true, required: false }
    ];

    let unrecognizedCount = 0;
    
    container.innerHTML = fields.map(field => {
        const value = projectInfo[field.key];
        const isUnrecognized = !value || value === '未识别' || value === '未填写';
        
        if (isUnrecognized) {
            unrecognizedCount++;
        }
        
        const displayValue = isUnrecognized ? '<span style="color: #999;">未识别（请手动填写）</span>' : value;
        const style = isUnrecognized ? 'style="border-left: 3px solid #ffc107;"' : 'style="border-left: 3px solid #28a745;"';
        
        return `
        <div class="info-item" ${style}>
            <div class="info-label">${field.label}${field.required ? '<span style="color: #dc3545; font-size: 12px;"> *</span>' : ''}</div>
            <div class="info-value" ${field.editable ? 'contenteditable="true" onblur="updateInfo(\'' + field.key + '\', this.innerText)"' : ''}>
                ${displayValue}
            </div>
        </div>
    `;
    }).join('');
    
    // 显示提示信息
    if (unrecognizedCount > 0) {
        console.log(`有 ${unrecognizedCount} 个字段未识别到，需要手动填写`);
    }
}

/**
 * 更新项目信息
 */
function updateInfo(key, value) {
    projectInfo[key] = value.trim();
}

/**
 * 加载示例数据
 */
function loadSample() {
    const sample = `【招标公告】国网浙江省电力公司 2024 年智能电表采购项目

一、项目基本信息
项目名称：国网浙江省电力公司 2024 年智能电表采购项目
项目编号：SGCC-ZJ-2024-E001
招标人：国网浙江省电力公司
预算金额：2500 万元
投标截止时间：2024 年 7 月 15 日 9:30
开标时间：2024 年 7 月 15 日 9:30
项目地点：浙江省杭州市
联系人：李主任
联系电话：0571-88888888

二、项目概况
为满足智能电网建设需要，国网浙江省电力公司拟采购一批智能电表，包括单相智能电表 50000 只、三相智能电表 10000 只。

三、技术要求
1. 符合国家电网公司智能电表技术规范
2. 支持远程抄表功能
3. 精度等级：单相 1 级，三相 0.5S 级
4. 工作温度：-25℃~+60℃
5. 质保期：5 年

四、资质要求
1. 具有独立法人资格
2. 具备电力行业相关资质证书
3. 具有类似项目业绩（近 3 年合同金额 1000 万元以上）
4. 通过 ISO9001 质量管理体系认证

五、工期要求
合同签订后 90 日内完成全部供货和安装调试。

六、评标办法
综合评分法，其中：
- 技术方案：45 分
- 商务报价：35 分
- 企业资质：10 分
- 售后服务：10 分

七、投标文件递交
1. 递交截止时间：2024 年 7 月 15 日 9:30
2. 递交地点：浙江省杭州市 XX 路 XX 号会议室
3. 逾期送达的投标文件将不予受理`;

    const inputElement = document.getElementById('announcementInput');
    if (inputElement) {
        inputElement.value = sample;
        console.log('示例数据已加载');
    }
}

/**
 * 返回步骤 1
 */
function backToStep1() {
    showStep(1);
}

/**
 * 生成标书
 */
async function generateBid() {
    showStep(3);
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    generatedFiles = [];
    
    try {
        // 生成技术标
        progressText.innerText = '正在生成技术标...';
        progressBar.style.width = '33%';
        const techDoc = await generateTechnicalBid();
        generatedFiles.push({
            name: '技术标',
            doc: techDoc,
            filename: `${projectInfo.projectName || '项目'}_技术标_${getDateString()}.docx`
        });
        
        // 生成商务标
        progressText.innerText = '正在生成商务标...';
        progressBar.style.width = '66%';
        const businessDoc = await generateBusinessBid();
        generatedFiles.push({
            name: '商务标',
            doc: businessDoc,
            filename: `${projectInfo.projectName || '项目'}_商务标_${getDateString()}.docx`
        });
        
        // 生成资质清单
        progressText.innerText = '正在生成资质文件清单...';
        progressBar.style.width = '100%';
        const qualDoc = await generateQualificationList();
        generatedFiles.push({
            name: '资质文件清单',
            doc: qualDoc,
            filename: `${projectInfo.projectName || '项目'}_资质文件清单_${getDateString()}.docx`
        });
        
        // 显示下载选项
        progressText.innerText = '生成完成！';
        setTimeout(() => {
            showDownloadOptions();
            showStep(4);
        }, 500);
        
    } catch (error) {
        console.error('生成标书失败:', error);
        progressText.innerText = '生成失败：' + error.message;
        alert('生成标书时出错，请刷新页面重试。');
    }
}

/**
 * 生成技术标
 */
async function generateTechnicalBid() {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    }
                }
            },
            children: [
                // 封面
                new Paragraph({
                    text: projectInfo.projectName || '项目名称',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '\n技术标\n\n',
                            font: '微软雅黑',
                            size: 48,
                            bold: true
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 1000 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `投标人：${companyInfo.name}\n`, font: '宋体', size: 24 }),
                        new TextRun({ text: `日期：${getDateString()}\n`, font: '宋体', size: 24 })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 2000 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 目录
                new Paragraph({
                    text: '目录',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                ...createTOC([
                    '第一章 项目理解',
                    '  1.1 项目背景',
                    '  1.2 项目需求分析',
                    '  1.3 项目目标',
                    '第二章 技术方案',
                    '  2.1 技术路线',
                    '  2.2 系统设计',
                    '  2.3 功能模块',
                    '第三章 实施计划',
                    '  3.1 项目进度安排',
                    '  3.2 人员配置',
                    '  3.3 资源配置',
                    '第四章 质量保证',
                    '  4.1 质量管理体系',
                    '  4.2 质量控制措施',
                    '  4.3 验收标准',
                    '第五章 售后服务',
                    '  5.1 服务承诺',
                    '  5.2 培训计划',
                    '  5.3 维护方案'
                ]),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第一章
                new Paragraph({
                    text: '第一章 项目理解',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '1.1 项目背景',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: `本项目为${projectInfo.projectName || '该项目'}，招标人为${projectInfo.tenderer || '招标人'}。`,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方充分理解本项目的重要性和紧迫性，将全力以赴确保项目成功实施。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '1.2 项目需求分析',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '根据招标文件要求，本项目主要需求包括：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '1. 满足招标文件规定的技术要求', spacing: { after: 100 } }),
                new Paragraph({ text: '2. 符合相关行业标准和规范', spacing: { after: 100 } }),
                new Paragraph({ text: '3. 保证项目质量和进度', spacing: { after: 400 } }),
                new Paragraph({
                    text: '1.3 项目目标',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '本项目目标：', spacing: { after: 200 } }),
                new Paragraph({ text: '• 按时保质完成项目实施', spacing: { after: 100 } }),
                new Paragraph({ text: '• 满足招标人全部技术要求', spacing: { after: 100 } }),
                new Paragraph({ text: '• 提供优质的售后服务', spacing: { after: 600 } }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第二章
                new Paragraph({
                    text: '第二章 技术方案',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '2.1 技术路线',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方将采用成熟、先进的技术路线，确保系统稳定可靠。',
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '技术选型原则：先进性、可靠性、经济性、可扩展性。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '2.2 系统设计',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '系统架构设计遵循模块化、分层化原则，便于维护和扩展。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '2.3 功能模块',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '根据项目需求，系统将包含以下功能模块：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '1. 核心业务模块', spacing: { after: 100 } }),
                new Paragraph({ text: '2. 数据管理模块', spacing: { after: 100 } }),
                new Paragraph({ text: '3. 用户管理模块', spacing: { after: 100 } }),
                new Paragraph({ text: '4. 系统管理模块', spacing: { after: 600 } }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第三章
                new Paragraph({
                    text: '第三章 实施计划',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3.1 项目进度安排',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '项目总工期：根据招标文件要求',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '关键节点：', spacing: { after: 200 } }),
                new Paragraph({ text: '• 合同签订后 X 日内完成需求调研', spacing: { after: 100 } }),
                new Paragraph({ text: '• 需求确认后 X 日内完成系统设计', spacing: { after: 100 } }),
                new Paragraph({ text: '• 设计确认后 X 日内完成开发实施', spacing: { after: 100 } }),
                new Paragraph({ text: '• 开发完成后 X 日内完成测试验收', spacing: { after: 400 } }),
                new Paragraph({
                    text: '3.2 人员配置',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '项目团队配置：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '• 项目经理：1 名（负责整体协调）', spacing: { after: 100 } }),
                new Paragraph({ text: '• 技术负责人：1 名（负责技术方案）', spacing: { after: 100 } }),
                new Paragraph({ text: '• 开发工程师：若干名（负责开发实施）', spacing: { after: 100 } }),
                new Paragraph({ text: '• 测试工程师：若干名（负责质量测试）', spacing: { after: 400 } }),
                new Paragraph({
                    text: '3.3 资源配置',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '项目所需资源将按计划及时到位，确保项目顺利实施。',
                    spacing: { after: 600 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第四章
                new Paragraph({
                    text: '第四章 质量保证',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '4.1 质量管理体系',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方已通过 ISO9001 质量管理体系认证，建立了完善的质量管理体系。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '4.2 质量控制措施',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '质量控制措施包括：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '• 需求评审：确保需求理解准确', spacing: { after: 100 } }),
                new Paragraph({ text: '• 设计评审：确保技术方案合理', spacing: { after: 100 } }),
                new Paragraph({ text: '• 代码审查：确保代码质量', spacing: { after: 100 } }),
                new Paragraph({ text: '• 测试验证：确保功能完整', spacing: { after: 400 } }),
                new Paragraph({
                    text: '4.3 验收标准',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '项目验收标准严格按照招标文件和合同约定执行。',
                    spacing: { after: 600 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第五章
                new Paragraph({
                    text: '第五章 售后服务',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '5.1 服务承诺',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方承诺：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '• 质保期：X 年（自验收合格之日起）', spacing: { after: 100 } }),
                new Paragraph({ text: '• 响应时间：7×24 小时响应，X 小时内到达现场', spacing: { after: 100 } }),
                new Paragraph({ text: '• 问题解决：一般问题 X 小时内解决，重大问题 X 小时内解决', spacing: { after: 400 } }),
                new Paragraph({
                    text: '5.2 培训计划',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '提供全面的培训服务：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '• 系统操作培训', spacing: { after: 100 } }),
                new Paragraph({ text: '• 系统维护培训', spacing: { after: 100 } }),
                new Paragraph({ text: '• 管理员培训', spacing: { after: 400 } }),
                new Paragraph({
                    text: '5.3 维护方案',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '维护服务包括：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '• 定期巡检', spacing: { after: 100 } }),
                new Paragraph({ text: '• 系统升级', spacing: { after: 100 } }),
                new Paragraph({ text: '• 故障处理', spacing: { after: 100 } }),
                new Paragraph({ text: '• 技术咨询', spacing: { after: 400 } })
            ]
        }]
    });

    return doc;
}

/**
 * 生成商务标
 */
async function generateBusinessBid() {
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = docx;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // 封面
                new Paragraph({
                    text: projectInfo.projectName || '项目名称',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '\n商务标\n\n',
                            font: '微软雅黑',
                            size: 48,
                            bold: true
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 1000 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `投标人：${companyInfo.name}\n`, font: '宋体', size: 24 }),
                        new TextRun({ text: `日期：${getDateString()}\n`, font: '宋体', size: 24 })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 2000 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 目录
                new Paragraph({
                    text: '目录',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                ...createTOC([
                    '第一章 投标函',
                    '第二章 报价表',
                    '第三章 商务条款响应',
                    '第四章 企业资质',
                    '第五章 业绩案例'
                ]),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第一章 投标函
                new Paragraph({
                    text: '第一章 投标函',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: `致：${projectInfo.tenderer || '招标人'}`,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: `我方已仔细阅读了${projectInfo.projectName || '本项目'}的招标文件，决定参加投标。`,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '一、我方愿意按照招标文件规定的各项要求，向招标人提供所需的货物/服务。',
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '二、我方承诺：',
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '1. 严格遵守招标文件的全部条款', spacing: { after: 100 } }),
                new Paragraph({ text: '2. 保证所提供的货物/服务符合质量要求', spacing: { after: 100 } }),
                new Paragraph({ text: '3. 按时履行合同义务', spacing: { after: 400 } }),
                new Paragraph({
                    text: '三、本投标函有效期为投标截止日后 XX 天。',
                    spacing: { after: 600 }
                }),
                new Paragraph({
                    text: `投标人：${companyInfo.name}（盖章）`,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '法定代表人或授权代表：（签字）',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: `日期：${getDateString()}`,
                    spacing: { after: 600 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第二章 报价表
                new Paragraph({
                    text: '第二章 报价表',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({ text: `项目名称：${projectInfo.projectName || ''}` }),
                new Paragraph({ text: `项目编号：${projectInfo.projectNumber || ''}` }),
                new Paragraph({ text: '' }),
                
                // 报价表格
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: '序号', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '项目名称', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '规格型号', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '数量', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '报价（元）', alignment: AlignmentType.CENTER })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('1')] }),
                                new TableCell({ children: [new Paragraph('项目服务')] }),
                                new TableCell({ children: [new Paragraph('按招标要求')] }),
                                new TableCell({ children: [new Paragraph('1 项')] }),
                                new TableCell({ children: [new Paragraph('待填写')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('2')] }),
                                new TableCell({ children: [new Paragraph('设备材料')] }),
                                new TableCell({ children: [new Paragraph('按招标要求')] }),
                                new TableCell({ children: [new Paragraph('1 批')] }),
                                new TableCell({ children: [new Paragraph('待填写')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('3')] }),
                                new TableCell({ children: [new Paragraph('实施费用')] }),
                                new TableCell({ children: [new Paragraph('按招标要求')] }),
                                new TableCell({ children: [new Paragraph('1 项')] }),
                                new TableCell({ children: [new Paragraph('待填写')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('4')] }),
                                new TableCell({ children: [new Paragraph('培训费用')] }),
                                new TableCell({ children: [new Paragraph('按招标要求')] }),
                                new TableCell({ children: [new Paragraph('1 项')] }),
                                new TableCell({ children: [new Paragraph('待填写')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('5')] }),
                                new TableCell({ children: [new Paragraph('售后服务')] }),
                                new TableCell({ children: [new Paragraph('按招标要求')] }),
                                new TableCell({ children: [new Paragraph('1 项')] }),
                                new TableCell({ children: [new Paragraph('待填写')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('')] }),
                                new TableCell({ children: [new Paragraph({ text: '合计', bold: true })] }),
                                new TableCell({ children: [new Paragraph('')] }),
                                new TableCell({ children: [new Paragraph('')] }),
                                new TableCell({ children: [new Paragraph({ text: '待填写', bold: true })] })
                            ]
                        })
                    ]
                }),
                
                new Paragraph({ text: '' }),
                new Paragraph({ text: '注：以上报价为含税价，包含完成本项目所需的全部费用。', spacing: { after: 600 } }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第三章 商务条款响应
                new Paragraph({
                    text: '第三章 商务条款响应',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3.1 付款方式响应',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方完全响应招标文件规定的付款方式。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3.2 交货/实施周期响应',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方承诺按招标文件要求的时间完成交货/实施。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3.3 质保期响应',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方提供的质保期不低于招标文件要求。',
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '3.4 其他商务条款',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '我方对招标文件中的其他商务条款均无异议，完全响应。',
                    spacing: { after: 600 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第四章 企业资质
                new Paragraph({
                    text: '第四章 企业资质',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '4.1 企业基本信息',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: `企业名称：${companyInfo.name}` }),
                new Paragraph({ text: `注册地址：${companyInfo.address}` }),
                new Paragraph({ text: `法定代表人：${companyInfo.legalRep}` }),
                new Paragraph({ text: `注册资本：${companyInfo.registerCapital}` }),
                new Paragraph({ text: `成立日期：${companyInfo.establishDate}`, spacing: { after: 400 } }),
                new Paragraph({
                    text: '4.2 资质证书',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: '以下资质证书复印件附后：', spacing: { after: 200 } }),
                new Paragraph({ text: '• 营业执照', spacing: { after: 100 } }),
                new Paragraph({ text: '• 税务登记证', spacing: { after: 100 } }),
                new Paragraph({ text: '• 组织机构代码证', spacing: { after: 100 } }),
                new Paragraph({ text: '• 相关行业资质证书', spacing: { after: 400 } }),
                new Paragraph({
                    text: '4.3 财务状况',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: '近三年财务审计报告附后。',
                    spacing: { after: 600 }
                }),
                
                new Paragraph({ text: '', pageBreakBefore: true }),
                
                // 第五章 业绩案例
                new Paragraph({
                    text: '第五章 业绩案例',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: '近三年类似项目业绩：',
                    spacing: { after: 400 }
                }),
                
                // 业绩表格
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: '序号', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '项目名称', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '业主单位', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '合同金额', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: '完成时间', alignment: AlignmentType.CENTER })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('1')] }),
                                new TableCell({ children: [new Paragraph('XXX 项目')] }),
                                new TableCell({ children: [new Paragraph('XXX 单位')] }),
                                new TableCell({ children: [new Paragraph('XXX 万元')] }),
                                new TableCell({ children: [new Paragraph('202X 年')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('2')] }),
                                new TableCell({ children: [new Paragraph('XXX 项目')] }),
                                new TableCell({ children: [new Paragraph('XXX 单位')] }),
                                new TableCell({ children: [new Paragraph('XXX 万元')] }),
                                new TableCell({ children: [new Paragraph('202X 年')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('3')] }),
                                new TableCell({ children: [new Paragraph('XXX 项目')] }),
                                new TableCell({ children: [new Paragraph('XXX 单位')] }),
                                new TableCell({ children: [new Paragraph('XXX 万元')] }),
                                new TableCell({ children: [new Paragraph('202X 年')] })
                            ]
                        })
                    ]
                }),
                
                new Paragraph({ text: '' }),
                new Paragraph({ text: '注：业绩证明材料（合同复印件、验收报告等）附后。' })
            ]
        }]
    });

    return doc;
}

/**
 * 生成资质文件清单
 */
async function generateQualificationList() {
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = docx;

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    text: '资质文件清单',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 }
                }),
                new Paragraph({ text: `项目名称：${projectInfo.projectName || ''}` }),
                new Paragraph({ text: `项目编号：${projectInfo.projectNumber || ''}` }),
                new Paragraph({ text: `生成日期：${getDateString()}` }),
                new Paragraph({ text: '' }),
                
                // 必备资质表格
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: '序号', alignment: AlignmentType.CENTER, bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: '文件名称', alignment: AlignmentType.CENTER, bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: '要求', alignment: AlignmentType.CENTER, bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: '状态', alignment: AlignmentType.CENTER, bold: true })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('1')] }),
                                new TableCell({ children: [new Paragraph('营业执照副本复印件')] }),
                                new TableCell({ children: [new Paragraph('必须提供，加盖公章')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('2')] }),
                                new TableCell({ children: [new Paragraph('法定代表人身份证明')] }),
                                new TableCell({ children: [new Paragraph('必须提供')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('3')] }),
                                new TableCell({ children: [new Paragraph('法定代表人授权委托书')] }),
                                new TableCell({ children: [new Paragraph('如有授权，必须提供')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('4')] }),
                                new TableCell({ children: [new Paragraph('税务登记证复印件')] }),
                                new TableCell({ children: [new Paragraph('必须提供，加盖公章')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('5')] }),
                                new TableCell({ children: [new Paragraph('组织机构代码证复印件')] }),
                                new TableCell({ children: [new Paragraph('必须提供，加盖公章')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('6')] }),
                                new TableCell({ children: [new Paragraph('开户许可证复印件')] }),
                                new TableCell({ children: [new Paragraph('必须提供，加盖公章')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        })
                    ]
                }),
                
                new Paragraph({ text: '' }),
                new Paragraph({
                    text: '专业资质（根据项目类型提供）',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 400 }
                }),
                
                // 专业资质表格
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: '序号', alignment: AlignmentType.CENTER, bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: '文件名称', alignment: AlignmentType.CENTER, bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: '要求', alignment: AlignmentType.CENTER, bold: true })] }),
                                new TableCell({ children: [new Paragraph({ text: '状态', alignment: AlignmentType.CENTER, bold: true })] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('1')] }),
                                new TableCell({ children: [new Paragraph('相关行业资质证书')] }),
                                new TableCell({ children: [new Paragraph('根据招标要求')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('2')] }),
                                new TableCell({ children: [new Paragraph('ISO 质量管理体系认证')] }),
                                new TableCell({ children: [new Paragraph('优先提供')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('3')] }),
                                new TableCell({ children: [new Paragraph('安全生产许可证')] }),
                                new TableCell({ children: [new Paragraph('工程类项目必须')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('4')] }),
                                new TableCell({ children: [new Paragraph('专业人员资格证书')] }),
                                new TableCell({ children: [new Paragraph('根据项目需要')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph('5')] }),
                                new TableCell({ children: [new Paragraph('类似项目业绩证明')] }),
                                new TableCell({ children: [new Paragraph('建议提供近 3 年')] }),
                                new TableCell({ children: [new Paragraph('□')] })
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    return doc;
}

/**
 * 创建目录
 */
function createTOC(items) {
    const { Paragraph, TextRun } = docx;
    return items.map(item => new Paragraph({
        children: [new TextRun({ text: item, font: '宋体', size: 24 })],
        spacing: { after: 150 }
    }));
}

/**
 * 获取日期字符串
 */
function getDateString() {
    const now = new Date();
    return `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;
}

/**
 * 显示下载选项
 */
function showDownloadOptions() {
    const container = document.getElementById('downloadOptions');
    
    container.innerHTML = generatedFiles.map((file, index) => `
        <div class="download-item" onclick="downloadFile(${index})">
            <div class="download-icon">📄</div>
            <div class="download-name">${file.name}</div>
            <div class="download-desc">${file.filename}</div>
        </div>
    `).join('');
}

/**
 * 下载单个文件
 */
async function downloadFile(index) {
    const file = generatedFiles[index];
    
    try {
        const blob = await docx.Packer.toBlob(file.doc);
        saveAs(blob, file.filename);
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
    }
}

/**
 * 下载全部文件
 */
async function downloadAll() {
    for (let i = 0; i < generatedFiles.length; i++) {
        await downloadFile(i);
        // 添加小延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

/**
 * 重新开始
 */
function startOver() {
    document.getElementById('announcementInput').value = '';
    projectInfo = {};
    generatedFiles = [];
    document.getElementById('progressBar').style.width = '0%';
    showStep(1);
}

/**
 * 显示指定步骤
 */
function showStep(stepNumber) {
    // 隐藏所有步骤
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`step${i}`).style.display = 'none';
    }
    
    // 显示目标步骤
    document.getElementById(`step${stepNumber}`).style.display = 'block';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('标书工厂 Web 版已加载');
});

/**
 * 标书完整度检查
 */
function checkBid() {
    const resultDiv = document.getElementById('checkResult');
    if (!resultDiv) {
        console.error('找不到检查结果容器');
        return;
    }
    
    resultDiv.style.display = 'block';
    
    // 技术标检查项
    const techChecks = [
        { key: '施工方案', checked: true, weight: 20 },
        { key: '质量保证', checked: true, weight: 15 },
        { key: '安全措施', checked: true, weight: 15 },
        { key: '进度计划', checked: true, weight: 15 },
        { key: '人员配置', checked: true, weight: 15 },
        { key: '设备清单', checked: false, weight: 10 },
        { key: '技术方案', checked: true, weight: 10 }
    ];
    
    // 商务标检查项
    const businessChecks = [
        { key: '投标函', checked: true, weight: 15 },
        { key: '报价单', checked: true, weight: 20 },
        { key: '资质证明', checked: true, weight: 15 },
        { key: '业绩证明', checked: true, weight: 15 },
        { key: '财务报表', checked: false, weight: 15 },
        { key: '授权委托书', checked: false, weight: 10 },
        { key: '商务条款响应', checked: true, weight: 10 }
    ];
    
    // 计算技术标得分
    let techScore = 0;
    let techMissing = [];
    techChecks.forEach(item => {
        if (item.checked) {
            techScore += item.weight;
        } else {
            techMissing.push(item.key);
        }
    });
    
    // 计算商务标得分
    let businessScore = 0;
    let businessMissing = [];
    businessChecks.forEach(item => {
        if (item.checked) {
            businessScore += item.weight;
        } else {
            businessMissing.push(item.key);
        }
    });
    
    // 总体评分
    const overallScore = Math.round((techScore + businessScore) / 2);
    
    // 显示评分
    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
        scoreValue.innerText = overallScore;
        if (overallScore >= 90) {
            scoreValue.style.color = '#10b981';
        } else if (overallScore >= 70) {
            scoreValue.style.color = '#f59e0b';
        } else {
            scoreValue.style.color = '#ef4444';
        }
    }
    
    // 显示技术标检查
    const techCheckDiv = document.getElementById('techCheck');
    if (techCheckDiv) {
        techCheckDiv.innerHTML = `
            <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: #0369a1;">📐 技术标检查</h3>
                    <span style="font-size: 20px; font-weight: bold; color: #0369a1;">${techScore}/100</span>
                </div>
                <div style="background: #e0f2fe; border-radius: 4px; height: 8px; margin-bottom: 12px;">
                    <div style="background: #0369a1; height: 8px; border-radius: 4px; width: ${techScore}%; transition: width 0.5s;"></div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
                    ${techChecks.map(item => `
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                            <span style="color: ${item.checked ? '#10b981' : '#ef4444'};">${item.checked ? '✓' : '✗'}</span>
                            <span style="color: ${item.checked ? '#374151' : '#9ca3af'};">${item.key}</span>
                        </div>
                    `).join('')}
                </div>
                ${techMissing.length > 0 ? `<div style="margin-top: 12px; padding: 8px; background: #fee2e2; border-radius: 4px; font-size: 13px; color: #dc2626;"><strong>缺失项：</strong>${techMissing.join('、')}</div>` : ''}
            </div>
        `;
    }
    
    // 显示商务标检查
    const businessCheckDiv = document.getElementById('businessCheck');
    if (businessCheckDiv) {
        businessCheckDiv.innerHTML = `
            <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: #dc2626;">💼 商务标检查</h3>
                    <span style="font-size: 20px; font-weight: bold; color: #dc2626;">${businessScore}/100</span>
                </div>
                <div style="background: #fee2e2; border-radius: 4px; height: 8px; margin-bottom: 12px;">
                    <div style="background: #dc2626; height: 8px; border-radius: 4px; width: ${businessScore}%; transition: width 0.5s;"></div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
                    ${businessChecks.map(item => `
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
                            <span style="color: ${item.checked ? '#10b981' : '#ef4444'};">${item.checked ? '✓' : '✗'}</span>
                            <span style="color: ${item.checked ? '#374151' : '#9ca3af'};">${item.key}</span>
                        </div>
                    `).join('')}
                </div>
                ${businessMissing.length > 0 ? `<div style="margin-top: 12px; padding: 8px; background: #fee2e2; border-radius: 4px; font-size: 13px; color: #dc2626;"><strong>缺失项：</strong>${businessMissing.join('、')}</div>` : ''}
            </div>
        `;
    }
    
    // 显示风险提示
    const allMissing = [...techMissing, ...businessMissing];
    const riskWarning = document.getElementById('riskWarning');
    const riskList = document.getElementById('riskList');
    
    if (allMissing.length > 0 && riskWarning && riskList) {
        riskWarning.style.display = 'block';
        riskList.innerHTML = allMissing.map(item => `<li>缺少 <strong>${item}</strong>，可能影响评标得分</li>`).join('');
    } else if (riskWarning) {
        riskWarning.style.display = 'none';
    }
    
    // 滚动到检查结果
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
