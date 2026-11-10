/**
 * 高曝光页 SEO 覆盖表（GSC 数据驱动，2026-11-10）
 *
 * 背景：全站工具页 title 由 `generateToolMetadata` 统一拼成
 *   `${meta.title} - Free Online Tool` + 根布局 template `%s - Toolbox Hub`
 * → 最终是 `<本地化标题> - Free Online Tool - Toolbox Hub`。
 * 两个问题：
 *   1. 尾部 19 字符的通用英文后缀挤掉了 SERP 里唯一有信息量的位置；
 *   2. 西语等语言页变成「西语标题 + 英文后缀」的混血串。
 * description 则是 `content.intro.slice(0, 158)` 硬截断，常停在半个单词上。
 *
 * GSC 全量导出（过去 3 个月）显示有 10 个页面「展示 >= 200 且点击 = 0」，
 * 其中 6 个已排进前 2 页 —— 说明是 SERP 摘要没给利益点，不是排名问题。
 * 本表只对**有真实展示的 (slug, lang) 组合**定制 title / description，
 * 其余 1700+ 页保持原样，避免触发全站重爬。
 *
 * title 用 Metadata.title 的 `{ absolute }` 形式，绕过根布局 template，
 * 因此每条都自带品牌后缀 `| Toolbox Hub`。
 * 未覆盖的组合回退到原有拼法，行为完全不变。
 */
export interface ToolSeoOverride {
  title: string;
  description: string;
}

const OVERRIDES: Record<string, Record<string, ToolSeoOverride>> = {
  "loan-calculator": {
    en: {
      title: "Loan Calculator: Monthly Payment & Total Interest | Toolbox Hub",
      description:
        "Enter an amount, annual rate and term to see the fixed monthly payment, total repaid and total interest. Standard amortization formula, runs in your browser.",
    },
    es: {
      title: "Calculadora de préstamos: cuota mensual e intereses | Toolbox Hub",
      description:
        "Introduce importe, tipo anual y plazo para ver la cuota mensual, el total pagado y los intereses. Fórmula de amortización en tu navegador.",
    },
    zh: {
      title: "贷款计算器：月供、总还款与总利息 | Toolbox Hub",
      description:
        "输入贷款金额、年利率和年限，立即算出等额本息的每月还款额、总还款额与总利息，采用标准摊还公式。未填利率与年限时默认 5% 与 30 年，全部在浏览器本地运行，无需上传数据。",
    },
    "zh-TW": {
      title: "貸款計算器：月付額、總還款與總利息 | Toolbox Hub",
      description:
        "輸入貸款金額、年利率與年限，立即算出每月固定還款額、總還款額與總利息，採用標準攤還公式。未填利率與年限時預設 5% 與 30 年，完全在瀏覽器執行，資料不上傳。",
    },
  },
  "tip-calculator": {
    en: {
      title: "Tip Calculator: Tip, Total & Split Per Person | Toolbox Hub",
      description:
        "Enter a bill and a tip percentage to see the tip, the final total, and each person's share. The split divides the total, not the pre-tip bill.",
    },
    "zh-TW": {
      title: "小費計算器：即時算小費、總額與每人分攤 | Toolbox Hub",
      description:
        "輸入帳單金額與小費百分比，立即得到小費、最終總額與每人應付金額，輸入時即時更新。分攤是以含小費的總額計算，而不是原始帳單，這正是手動分帳最容易算錯的地方。免註冊，資料不上傳。",
    },
    nl: {
      title: "Fooirekenaar: fooi, totaal en verdeling per persoon | Toolbox Hub",
      description:
        "Voer een rekening en een fooipercentage in en zie direct de fooi, het totaal en het aandeel per persoon. De verdeling gebruikt het totaalbedrag.",
    },
    tr: {
      title: "Bahşiş Hesaplayıcı: bahşiş, toplam ve kişi başı pay | Toolbox Hub",
      description:
        "Hesap tutarını ve bahşiş yüzdesini girin; bahşiş, toplam ve kişi başına düşen pay anında görünsün. Bölme işlemi toplam tutar üzerinden yapılır.",
    },
    pt: {
      title: "Calculadora de Gorjeta: gorjeta, total e divisão | Toolbox Hub",
      description:
        "Informe o valor da conta e a porcentagem de gorjeta para ver a gorjeta, o total e a parte de cada pessoa. A divisão usa o valor total.",
    },
  },
  "discount-calculator": {
    en: {
      title: "Discount Calculator: Final Price & Amount You Save | Toolbox Hub",
      description:
        "Type a price and discount separated by a comma, e.g. 200, 20, to see the original price, what you save and what you pay. Runs locally, no upload.",
    },
    "zh-TW": {
      title: "折扣計算器：折後價與省下金額 | Toolbox Hub",
      description:
        "以逗號分隔輸入原價與折扣百分比，例如 200, 20，立即得到原價、省下金額與實付價格。購物比價與促銷設定都能用，免註冊、資料留在本機。",
    },
    zh: {
      title: "折扣计算器：折后价与省下金额 | Toolbox Hub",
      description:
        "以逗号分隔输入原价与折扣百分比，例如 200, 20，立即得到原价、省下金额与实付价格。购物比价与促销设置都能用，免注册、数据留在本机。",
    },
  },
  "word-counter": {
    en: {
      title: "Word Counter: Words, Characters & Reading Time | Toolbox Hub",
      description:
        "Live word, character, sentence, paragraph and line counts with a reading-time estimate. See exactly how whitespace, CJK text and punctuation affect the numbers.",
    },
    de: {
      title: "Wortzähler: Wörter, Zeichen, Sätze & Lesezeit | Toolbox Hub",
      description:
        "Wörter, Zeichen, Sätze, Absätze und Zeilen live zählen, inklusive Lesezeit. Nachvollziehbar, wie Leerzeichen, CJK-Text und Satzzeichen die Zahlen beeinflussen.",
    },
    ru: {
      title: "Счётчик слов: слова, символы и время чтения | Toolbox Hub",
      description:
        "Подсчёт слов, символов, предложений, абзацев и строк в реальном времени с оценкой времени чтения. Показываем, как пробелы и пунктуация влияют на результат.",
    },
    vi: {
      title: "Bộ đếm từ: số từ, ký tự và thời gian đọc | Toolbox Hub",
      description:
        "Đếm trực tiếp số từ, ký tự, câu, đoạn và dòng kèm ước tính thời gian đọc. Giải thích rõ khoảng trắng và dấu câu ảnh hưởng thế nào đến con số.",
    },
    es: {
      title: "Contador de palabras: palabras, caracteres y lectura | Toolbox Hub",
      description:
        "Cuenta palabras, caracteres, oraciones, párrafos y líneas en vivo, con tiempo de lectura. Explica cómo espacios y signos cambian el resultado.",
    },
    it: {
      title: "Contatore di parole: parole, caratteri e lettura | Toolbox Hub",
      description:
        "Conta in tempo reale parole, caratteri, frasi, paragrafi e righe con stima del tempo di lettura. Mostra come spazi e punteggiatura influiscono sui numeri.",
    },
  },
};

/** 取某 (lang, slug) 的 SEO 覆盖；未覆盖返回 undefined，调用方回退到原拼法 */
export function getToolSeoOverride(lang: string, slug: string): ToolSeoOverride | undefined {
  return OVERRIDES[slug]?.[lang];
}

/** 供校验脚本使用：列出全部覆盖项 */
export function listSeoOverrides(): { lang: string; slug: string }[] {
  return Object.entries(OVERRIDES).flatMap(([slug, byLang]) =>
    Object.keys(byLang).map((lang) => ({ lang, slug }))
  );
}
