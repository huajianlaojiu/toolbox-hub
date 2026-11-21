import { I18nProvider, type Messages, type ToolCardCopy } from "@/lib/i18n";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ConsentBanner from "@/components/shared/consent-banner";

/**
 * 站点外壳：在 I18nProvider（含目标语言字典）内渲染Header/main/Footer。
 * 英文路由用 lang="en" dict={}；[lang] 路由用对应语言字典。
 * 这样 Header/Footer 的语言随当前 URL 段切换，且服务端已注入译文（利于 SEO）。
 */
export default function SiteShell({
  lang,
  dict,
  cards = {},
  children,
}: {
  lang: string;
  dict: Messages;
  cards?: ToolCardCopy;
  children: React.ReactNode;
}) {
  return (
    <I18nProvider lang={lang} dict={dict} cards={cards}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* 同意管理横幅放在 Provider 内，文案可随当前语言字典翻译 */}
      <ConsentBanner />
    </I18nProvider>
  );
}
