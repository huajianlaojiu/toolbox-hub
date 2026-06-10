// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function EmojiPicker() {
  const process = (input: string) => {
    return "😀😂🤣😍😎🤔😴🤗😷🤒🤑😱😈👻💩👍👎👏🙌🤝✌️🤞🤟👊💪🦾❤️🧡💛💚💙💜🖤💯🔥⭐🌈⚡🎉🎊🎈🎁🏆🥇🥈🥉🚀💻📱⌨️🖥️🖨️🖱️💾💿📀🔍🔎💡🔑🔨⚙️🧲⚖️🔗🧪🧬🔬🔭📡🛰️🏠🏢🏰🗼🗽🌍🌎🌏🌋🏔️⛰️🏕️🏖️🏜️🏝️🏞️";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
