/**
 * 测试解析功能 - 修复版本
 */

const testTexts = [
    {
        name: "标准格式",
        text: `项目名称：国网浙江省电力公司 2024 年智能电表采购项目
项目编号：SGCC-ZJ-2024-E001
招标人：国网浙江省电力公司
预算金额：2500 万元
投标截止时间：2024 年 7 月 15 日 9:30
项目地点：浙江省杭州市
联系人：李主任
联系电话：0571-88888888`
    },
    {
        name: "中文冒号格式",
        text: `项目名称：杭州市智慧交通系统建设项目
项目编号：HZ-2024-IT-089
采购人：杭州市交通运输局
预算金额：5800000 元
投标截止时间：2024 年 8 月 20 日 14:00
实施地点：浙江省杭州市
联系人：王工程师
联系方式：13800138000`
    }
];

// 修复：移除全局标志 /g，因为 match() 需要它来返回捕获组
const patterns = {
    projectName: [
        /项目名称\s*[：:]\s*(.+?)(?:\n|$)/i,
        /采购项目名称\s*[：:]\s*(.+?)(?:\n|$)/i,
        /工程名称\s*[：:]\s*(.+?)(?:\n|$)/i
    ],
    projectNumber: [
        /项目编号\s*[：:]\s*(.+?)(?:\n|$)/i,
        /招标编号\s*[：:]\s*(.+?)(?:\n|$)/i,
        /采购编号\s*[：:]\s*(.+?)(?:\n|$)/i
    ],
    tenderer: [
        /招标人\s*[：:]\s*(.+?)(?:\n|$)/i,
        /采购人\s*[：:]\s*(.+?)(?:\n|$)/i,
        /采购单位\s*[：:]\s*(.+?)(?:\n|$)/i
    ],
    budget: [
        /预算金额\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i,
        /项目预算\s*[：:]\s*([¥￥]?\s*\d+(?:,\d{3})*(?:\.\d+)?\s*[万元]?)/i
    ],
    bidDeadline: [
        /投标截止时间\s*[：:]\s*(.+?)(?:\n|$)/i,
        /截止时间\s*[：:]\s*(.+?)(?:\n|$)/i
    ],
    projectLocation: [
        /项目地点\s*[：:]\s*(.+?)(?:\n|$)/i,
        /实施地点\s*[：:]\s*(.+?)(?:\n|$)/i
    ],
    contactName: [
        /联系人\s*[：:]\s*(.+?)(?:\n|$)/i
    ],
    contactPhone: [
        /联系电话\s*[：:]\s*(.+?)(?:\n|$)/i,
        /联系方式\s*[：:]\s*(.+?)(?:\n|$)/i
    ]
};

function extractByPatterns(text, patterns) {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return '未识别';
}

function extractBidInfo(text) {
    return {
        projectName: extractByPatterns(text, patterns.projectName),
        projectNumber: extractByPatterns(text, patterns.projectNumber),
        tenderer: extractByPatterns(text, patterns.tenderer),
        budget: extractByPatterns(text, patterns.budget),
        bidDeadline: extractByPatterns(text, patterns.bidDeadline),
        projectLocation: extractByPatterns(text, patterns.projectLocation),
        contactName: extractByPatterns(text, patterns.contactName),
        contactPhone: extractByPatterns(text, patterns.contactPhone)
    };
}

console.log('='.repeat(60));
console.log('标书工厂 - 解析功能测试（修复版）');
console.log('='.repeat(60));
console.log();

let totalTests = 0;
let passedTests = 0;

testTexts.forEach((test, index) => {
    console.log(`测试 ${index + 1}: ${test.name}`);
    console.log('-'.repeat(40));
    
    const result = extractBidInfo(test.text);
    
    Object.entries(result).forEach(([key, value]) => {
        totalTests++;
        const status = value !== '未识别' ? '✅' : '❌';
        if (value !== '未识别') passedTests++;
        console.log(`  ${status} ${key}: ${value}`);
    });
    
    console.log();
});

console.log('='.repeat(60));
console.log(`测试结果：${passedTests}/${totalTests} 字段识别成功`);
console.log(`成功率：${((passedTests/totalTests)*100).toFixed(1)}%`);
console.log('='.repeat(60));
