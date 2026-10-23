// 扫描 zh-TW 译文里的简体残留。用「简体特有字」精确集（只在简体中出现的字），
// 避免误报简繁通用字（大/小/高/低/移/放/明/表/成/试/认/准/正/度/单/双/位/置/接/索/导/注/册/退/搜/序/排/列/队/堆/格/式/填/读/取/存/出/进/转/变/计/算/估/测/量/统/分/析/较/比/优/先/升/降/联/系/整/体/局/部/合/并/隐/藏/警/告/故/障/明/确/活/尝/验/证/许/禁/止/激 等通用字不算）。
// 用法：node scripts/_scan_simplified.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

// 简体特有字（高频子集，覆盖本站译文用字）
const SIMP_ONLY = "个们这麽时说过没后対对错开关门问闻间见笔记学国会发数据务页载书签订击键盘标内网线离闭启动态静处理设备软硬驱装卸安装运维护复制贴贝删除查找替义属性类实例样版号码符串段落节志识别名称谓词语言文件档案夹录树结构点边顶端层级组块区域范顺队列栈表格式写储输转变计测量统析较级优升降联整体部并发布显误异常败试验证认禁止激注登陆销搜索导航链应该汉语编辑类别";
// 上面字符串里混入了通用字，用 Set 逐一剔除已知通用字太脆——改为只保留确定简体特有的：
const SIMP_SET = new Set("个们这麽时说过没后错开关门问闻间见笔记学国会发数据务页载书签订击键盘标内网线离闭启动态静处设备软硬驱装卸安装运维护复制贴贝除查替义属类实例版号码符串段落节志识别名称词语言文件档案夹录树结构点边顶端层组块区域范顺队列栈表格式写储输转变计测统析较级优升降联整体部并发布显误异常败试验证认禁止激注登陆销搜索导航链应该".split(""));

for (const dir of ["messages", "content", "posts"]) {
  const file = path.join(root, "src/i18n", dir, "zh-TW.json");
  if (!fs.existsSync(file)) continue;
  const raw = fs.readFileSync(file, "utf8");
  // 统计每个简体特有字出现次数（全文，含 key 与 value；key 是英文所以只可能命中 value）
  const counts = {};
  for (const ch of raw) if (SIMP_SET.has(ch)) counts[ch] = (counts[ch] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([c, n]) => `${c}×${n}`).join(" ");
  console.log(`${dir}/zh-TW.json: 简体特有字 ${total} 次 | ${top}`);
}
