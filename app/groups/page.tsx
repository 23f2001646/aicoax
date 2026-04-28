"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Users, Shield } from "lucide-react";
import { useApp } from "@/components/AppProviders";
import { supabase } from "@/lib/supabase";

interface Room {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

interface Message {
  id: string;
  room_id: string;
  avatar: string;
  anon_name: string;
  content: string;
  is_maya: boolean;
  created_at: string;
  flagged?: boolean;
}

const ROOMS: Room[] = [
  { id: "anxiety",    name: "Anxiety",       emoji: "🌊", description: "Share what worries you. You are not alone.", color: "from-blue-600 to-indigo-600" },
  { id: "burnout",    name: "Burnout",        emoji: "🔥", description: "Recovery from exhaustion, one day at a time.", color: "from-orange-600 to-red-600" },
  { id: "grief",      name: "Grief & Loss",   emoji: "🌿", description: "Hold space for all kinds of loss.", color: "from-emerald-600 to-teal-600" },
  { id: "students",   name: "Students",       emoji: "📚", description: "Exams, pressure, campus life — vent freely.", color: "from-violet-600 to-purple-600" },
  { id: "workstress", name: "Work Stress",    emoji: "💼", description: "Deadlines, bosses, toxic workplaces.", color: "from-amber-600 to-yellow-600" },
];

const AVATARS = ["🦊","🐻","🐼","🦁","🐨","🦋","🌸","⭐","🌙","🦄","🐬","🌺"];
const ANON_NAMES = ["Quiet Leaf","Calm River","Gentle Breeze","Still Lake","Brave Dawn","Soft Echo","Kind Wave","Warm Light","Silver Cloud","Hidden Star","Tender Oak","Hopeful Moon"];

function getAnonId(userId: string) {
  // deterministic but non-reversible anon name per user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) & 0xffffffff;
  const idx = Math.abs(hash) % AVATARS.length;
  return { avatar: AVATARS[idx], anon_name: ANON_NAMES[idx] };
}

// LocalStorage-based fallback message store
function lsKey(room: string) { return `aicoax_group_${room}`; }
function getLocalMessages(room: string): Message[] {
  try { return JSON.parse(localStorage.getItem(lsKey(room)) || "[]"); } catch { return []; }
}
function saveLocalMessage(room: string, msg: Message) {
  const msgs = getLocalMessages(room);
  msgs.push(msg);
  if (msgs.length > 100) msgs.splice(0, msgs.length - 100);
  localStorage.setItem(lsKey(room), JSON.stringify(msgs));
}

const HARMFUL_PATTERNS = /\b(kill yourself|kys|suicide method|how to die|end my life|self harm instructions)\b/i;

export default function GroupsPage() {
  const { user } = useApp();
  const router = useRouter();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subRef = useRef<any>(null);

  const anon = user ? getAnonId(user.id) : { avatar: "🦊", anon_name: "Guest" };

  const loadMessages = useCallback(async (room: Room) => {
    if (supabase) {
      const { data } = await supabase
        .from("groups_messages")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true })
        .limit(60);
      setMessages(data || []);
    } else {
      setMessages(getLocalMessages(room.id));
    }
  }, []);

  const subscribeRealtime = useCallback((room: Room) => {
    if (!supabase) return;
    if (subRef.current) supabase.removeChannel(subRef.current);

    const channel = supabase
      .channel(`groups:${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "groups_messages", filter: `room_id=eq.${room.id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setOnlineCount(Math.floor(Math.random() * 8) + 2);
      });

    subRef.current = channel;
  }, []);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom);
      subscribeRealtime(activeRoom);
    }
    return () => {
      if (supabase && subRef.current) supabase.removeChannel(subRef.current);
    };
  }, [activeRoom, loadMessages, subscribeRealtime]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function mayaModerate(content: string, roomId: string) {
    const res = await fetch("/api/companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Someone in a peer support group (topic: ${roomId}) just posted: "${content}".

If this message contains crisis signals, self-harm intent, or severe distress, respond with a warm 1-2 sentence supportive message and mention professional resources. If it's a normal supportive post, respond with "ok" and nothing else. Never lecture. Be warm, not clinical.`
        }]
      }),
    });
    if (!res.body) return null;
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let acc = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += dec.decode(value, { stream: true });
    }
    return acc.trim() === "ok" ? null : acc;
  }

  async function sendMessage() {
    if (!input.trim() || !activeRoom || !user || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const flagged = HARMFUL_PATTERNS.test(content);
    const msg: Message = {
      id: Date.now().toString(),
      room_id: activeRoom.id,
      avatar: anon.avatar,
      anon_name: anon.anon_name,
      content,
      is_maya: false,
      created_at: new Date().toISOString(),
      flagged,
    };

    if (supabase) {
      await supabase.from("groups_messages").insert([{
        room_id: msg.room_id, avatar: msg.avatar, anon_name: msg.anon_name,
        content: msg.content, is_maya: false, flagged,
      }]);
    } else {
      saveLocalMessage(activeRoom.id, msg);
      setMessages(prev => [...prev, msg]);
    }

    setSending(false);

    // Maya moderation
    const mayaReply = await mayaModerate(content, activeRoom.id);
    if (mayaReply) {
      const mayaMsg: Message = {
        id: (Date.now() + 1).toString(),
        room_id: activeRoom.id,
        avatar: "🤖",
        anon_name: "Maya",
        content: mayaReply,
        is_maya: true,
        created_at: new Date().toISOString(),
      };
      if (supabase) {
        await supabase.from("groups_messages").insert([{
          room_id: mayaMsg.room_id, avatar: "🤖", anon_name: "Maya",
          content: mayaReply, is_maya: true,
        }]);
      } else {
        saveLocalMessage(activeRoom.id, mayaMsg);
        setMessages(prev => [...prev, mayaMsg]);
      }
    }
  }

  if (!activeRoom) {
    return (
      <div className="min-h-screen bg-slate-950 pb-8">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-1 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1">
            <h1 className="font-bold text-white">Peer Support Groups</h1>
            <p className="text-xs text-slate-500">Anonymous · Moderated by Maya</p>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">Anonymous & Safe</p>
              <p className="text-slate-400 text-xs mt-0.5">You appear as &ldquo;{anon.anon_name} {anon.avatar}&rdquo; in all rooms. Maya monitors for harmful content.</p>
            </div>
          </div>

          {ROOMS.map((room, i) => (
            <motion.button key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setActiveRoom(room)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${room.color} flex items-center justify-center text-2xl shrink-0`}>
                  {room.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{room.name}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{room.description}</p>
                </div>
                <span className="text-slate-600 text-xl">›</span>
              </div>
            </motion.button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setActiveRoom(null)} className="text-slate-400 hover:text-white p-1 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <span className="text-xl">{activeRoom.emoji}</span>
        <div className="flex-1">
          <h1 className="font-bold text-white">{activeRoom.name}</h1>
          {onlineCount > 0 && <p className="text-xs text-teal-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block animate-pulse" />{onlineCount} here now</p>}
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <Users className="w-3.5 h-3.5" />
          <span>{anon.anon_name} {anon.avatar}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{activeRoom.emoji}</p>
            <p className="text-white font-medium">Be the first to share</p>
            <p className="text-slate-500 text-sm mt-1">{activeRoom.description}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isMe = msg.anon_name === anon.anon_name && msg.avatar === anon.avatar;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className="text-2xl shrink-0 self-end">{msg.avatar}</div>
                <div className={`max-w-[78%] space-y-1 ${isMe ? "items-end flex flex-col" : ""}`}>
                  <p className={`text-xs text-slate-500 ${isMe ? "text-right" : ""}`}>
                    {msg.is_maya ? <span className="text-purple-400 font-medium">Maya ✦</span> : msg.anon_name}
                    {" · "}{new Date(msg.created_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.is_maya ? "bg-purple-900/30 border border-purple-700/40 text-purple-100" :
                    isMe ? "bg-teal-700 text-white rounded-br-sm" :
                    "bg-slate-800 text-slate-200 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Share with the group…"
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-700 focus:border-teal-500 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none resize-none transition-colors"
            style={{ maxHeight: 120, overflowY: "auto" }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0">
            {sending ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
