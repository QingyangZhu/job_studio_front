/**
 * 导出一个常量对象，用于将 ECharts 地图上的中文省份名
 * 映射到您本地存储的 GeoJSON 文件的全拼音小写文件名。
 * * 文件名约定：全拼音小写，不含声调，例如 "北京" -> "beijing.json"
 */
export const PROVINCE_PINYIN_MAP = {
    // 4个直辖市
    '北京': 'beijing',
    '上海': 'shanghai',
    '天津': 'tianjin',
    '重庆': 'chongqing',

    // 5个自治区
    '内蒙古': 'neimenggu', // 注意：china.json 中通常不带 "自治区"
    '广西': 'guangxi',
    '西藏': 'xizang',
    '宁夏': 'ningxia',
    '新疆': 'xinjiang',

    // 2个特别行政区
    '香港': 'xianggang',
    '澳门': 'aomen',

    // 23个省
    '河北': 'hebei',
    '山西': 'shanxi',
    '辽宁': 'liaoning',
    '吉林': 'jilin',
    '黑龙江': 'heilongjiang',
    '江苏': 'jiangsu',
    '浙江': 'zhejiang',
    '安徽': 'anhui',
    '福建': 'fujian',
    '江西': 'jiangxi',
    '山东': 'shandong',
    '河南': 'henan',
    '湖北': 'hubei',
    '湖南': 'hunan',
    '广东': 'guangdong',
    '海南': 'hainan',
    '四川': 'sichuan',
    '贵州': 'guizhou',
    '云南': 'yunnan',
    '陕西': 'shaanxi',
    '甘肃': 'gansu',
    '青海': 'qinghai',
    '台湾': 'taiwan',
};

// 未来您可以将其他与地图相关的工具函数也放在这里导出
// export const someOtherHelper = () => { ... };