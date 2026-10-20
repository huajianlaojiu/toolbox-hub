"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

interface Emoji {
  e: string;
  name: string;
}

const EMOJI: Emoji[] = [
  { e: "😀", name: "grinning face" },
  { e: "😃", name: "smiley face" },
  { e: "😄", name: "happy smile" },
  { e: "😁", name: "beaming" },
  { e: "😆", name: "laughing" },
  { e: "😂", name: "joy tears of joy" },
  { e: "🤣", name: "rolling on the floor laughing" },
  { e: "😊", name: "blush smile" },
  { e: "😇", name: "innocent halo angel" },
  { e: "🙂", name: "slight smile" },
  { e: "😉", name: "wink" },
  { e: "😍", name: "heart eyes love" },
  { e: "🥰", name: "smiling face with hearts" },
  { e: "😘", name: "kiss blowing" },
  { e: "😎", name: "sunglasses cool" },
  { e: "🤓", name: "nerd glasses" },
  { e: "🧐", name: "monocle inspect" },
  { e: "🤔", name: "thinking hmm" },
  { e: "🤨", name: "raised eyebrow suspicious" },
  { e: "😐", name: "neutral" },
  { e: "😑", name: "expressionless" },
  { e: "🙄", name: "eye roll" },
  { e: "😏", name: "smirk" },
  { e: "😴", name: "sleeping asleep" },
  { e: "🤗", name: "hugging hug" },
  { e: "🤩", name: "star struck wow" },
  { e: "🥳", name: "party celebration birthday" },
  { e: "😤", name: "triumph proud" },
  { e: "😱", name: "scream fear shocked" },
  { e: "🤯", name: "mind blown exploding head" },
  { e: "😳", name: "flushed embarrassed" },
  { e: "🥺", name: "pleading puppy eyes" },
  { e: "😭", name: "sob crying" },
  { e: "😡", name: "angry rage" },
  { e: "🤬", name: "cursing swear" },
  { e: "👻", name: "ghost halloween" },
  { e: "💀", name: "skull dead" },
  { e: "🤖", name: "robot ai bot" },
  { e: "🎃", name: "pumpkin halloween" },
  { e: "😈", name: "devil smile" },
  { e: "👍", name: "thumbs up like approve" },
  { e: "👎", name: "thumbs down dislike" },
  { e: "👏", name: "clap applause" },
  { e: "🙌", name: "raised hands celebrate" },
  { e: "🤝", name: "handshake deal" },
  { e: "🙏", name: "pray please thanks" },
  { e: "✌️", name: "victory peace two" },
  { e: "🤞", name: "fingers crossed luck" },
  { e: "👊", name: "fist bump punch" },
  { e: "💪", name: "muscle strong flex" },
  { e: "🫡", name: "salute yes sir" },
  { e: "👀", name: "eyes looking watch" },
  { e: "🧠", name: "brain smart think" },
  { e: "❤️", name: "red heart love" },
  { e: "🧡", name: "orange heart" },
  { e: "💛", name: "yellow heart" },
  { e: "💚", name: "green heart" },
  { e: "💙", name: "blue heart" },
  { e: "💜", name: "purple heart" },
  { e: "🖤", name: "black heart" },
  { e: "💔", name: "broken heart" },
  { e: "💯", name: "hundred perfect score" },
  { e: "🔥", name: "fire hot lit" },
  { e: "✨", name: "sparkles shiny new" },
  { e: "⭐", name: "star favourite" },
  { e: "🌟", name: "glowing star" },
  { e: "🎉", name: "party popper celebration" },
  { e: "🎊", name: "confetti ball" },
  { e: "🎁", name: "gift present" },
  { e: "🏆", name: "trophy winner" },
  { e: "🥇", name: "gold medal first" },
  { e: "🥈", name: "silver medal second" },
  { e: "🥉", name: "bronze medal third" },
  { e: "🚀", name: "rocket launch ship" },
  { e: "⚡", name: "lightning zap fast" },
  { e: "💡", name: "light bulb idea" },
  { e: "🔑", name: "key access password" },
  { e: "🔒", name: "locked secure private" },
  { e: "🔓", name: "unlocked open" },
  { e: "⚙️", name: "gear settings config" },
  { e: "🧰", name: "toolbox tools" },
  { e: "🔨", name: "hammer build" },
  { e: "🧲", name: "magnet attract" },
  { e: "⚖️", name: "balance scale justice" },
  { e: "🔗", name: "link chain url" },
  { e: "🧪", name: "test tube experiment" },
  { e: "🔬", name: "microscope science" },
  { e: "🔭", name: "telescope astronomy" },
  { e: "📱", name: "mobile phone smartphone" },
  { e: "💻", name: "laptop computer code" },
  { e: "⌨️", name: "keyboard typing" },
  { e: "🖥️", name: "desktop monitor" },
  { e: "💾", name: "floppy disk save" },
  { e: "📊", name: "bar chart data" },
  { e: "📈", name: "chart up growth" },
  { e: "📉", name: "chart down decline" },
  { e: "📌", name: "pin location" },
  { e: "📅", name: "calendar date" },
  { e: "⏰", name: "alarm clock time" },
  { e: "✅", name: "check done yes" },
  { e: "❌", name: "cross no error" },
  { e: "⚠️", name: "warning caution" },
  { e: "❓", name: "question mark help" },
  { e: "🌈", name: "rainbow pride" },
  { e: "☀️", name: "sun sunny clear" },
  { e: "🌧️", name: "rain cloud" },
  { e: "❄️", name: "snowflake cold" },
  { e: "🌍", name: "earth globe world" },
  { e: "🌱", name: "seedling growth plant" },
  { e: "🌳", name: "tree forest" },
  { e: "🐶", name: "dog puppy pet" },
  { e: "🐱", name: "cat kitten pet" },
  { e: "🐼", name: "panda bear" },
  { e: "🦊", name: "fox" },
  { e: "🐝", name: "bee honey" },
  { e: "🍎", name: "apple fruit" },
  { e: "🍕", name: "pizza food" },
  { e: "🍔", name: "burger food" },
  { e: "🍜", name: "noodles ramen" },
  { e: "🍰", name: "cake dessert" },
  { e: "☕", name: "coffee hot drink" },
  { e: "🍺", name: "beer drink" },
  { e: "🏠", name: "house home" },
  { e: "🏢", name: "office building" },
  { e: "🚗", name: "car drive" },
  { e: "✈️", name: "aeroplane flight travel" },
];

export default function EmojiPicker() {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const term = q.trim().toLowerCase();
  const results = term ? EMOJI.filter((x) => x.name.includes(term)) : EMOJI;

  const pick = (e: string) => {
    setRecent((r) => [e, ...r.filter((x) => x !== e)].slice(0, 16));
    try {
      void navigator.clipboard?.writeText(e);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Search</label>
        <input
          className="tool-input tool-input-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try love, fire, coffee, warning..."
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Click any emoji to copy it to your clipboard. {results.length} shown.
        </p>
      </div>

      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Recently copied</span>
            <CopyButton text={recent.join("")} />
          </div>
          <div className="flex flex-wrap gap-1 text-2xl">
            {recent.map((e, i) => (
              <button key={e + i} onClick={() => pick(e)} className="rounded p-1 hover:bg-muted">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-8 gap-1 text-2xl sm:grid-cols-12">
        {results.map((x) => (
          <button
            key={x.e}
            onClick={() => pick(x.e)}
            title={x.name}
            className="rounded p-1 leading-none hover:bg-muted"
          >
            {x.e}
          </button>
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing matches that word. Try a broader term such as face, heart, food or weather.
        </p>
      )}
    </div>
  );
}
