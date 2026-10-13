'use client';

import React, { useState } from 'react';
import { useAuthStore, DEMO_USERS } from '@/shared/security/auth.store';
import { SafeHTML } from '@/shared/security/SafeHTML';
import { toast } from '@/shared/ui/Toast';
import {
  Send,
  ShieldCheck,
  Search,
  CheckCheck,
  Circle,
  MoreVertical,
  Sparkles,
  Bot,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// Contacto Oficial de Aemora AI impulsado por Groq (Llama 3.3)
const AEMORA_AI_CONTACT = {
  id: 'user_aemora_ai',
  username: 'aemora_ai',
  displayName: 'Aemora AI ✨',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AemoraAI_Core&backgroundColor=6366f1,06b6d4',
  bio: 'Inteligencia Artificial Oficial de Aemora impulsada por Groq (Llama 3.3 70B Versatile).',
  verified: true,
  role: 'admin' as const,
};

export default function MessagesPage() {
  const { user } = useAuthStore();

  // Lista de contactos: Aemora AI fijado en la cima + compañeros de equipo
  const humanContacts = DEMO_USERS.filter((u) => u.id !== user.id);
  const contacts = [AEMORA_AI_CONTACT, ...humanContacts];
  const [selectedContact, setSelectedContact] = useState(contacts[0]);

  // Historial de mensajes por contacto
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({
    user_aemora_ai: [
      {
        id: 'msg_ai_welcome',
        senderId: 'user_aemora_ai',
        text: '¡Hola! Soy **Aemora AI ✨**, tu asistente de inteligencia artificial potenciado por el modelo **Llama 3.3 70B** en Groq. Puedo ayudarte a redactar publicaciones, auditar código con directivas OWASP o responder dudas técnicas. ¿En qué trabajamos hoy?',
        timestamp: 'En línea',
      },
    ],
    user_carlos_002: [
      {
        id: 'msg_1',
        senderId: 'user_carlos_002',
        text: '¡Hola! Acabo de revisar las directivas de seguridad para el cliente HTTP. Los timeouts y la defensa contra CSRF quedaron excelentes.',
        timestamp: '14:20',
      },
      {
        id: 'msg_2',
        senderId: user.id,
        text: 'Genial Carlos. ¿Pudiste validar que ningún token JWT se guarde en almacenamiento local?',
        timestamp: '14:22',
      },
      {
        id: 'msg_3',
        senderId: 'user_carlos_002',
        text: 'Completamente verificado. Todo opera en memoria y está listo para cookies HttpOnly en producción.',
        timestamp: '14:25',
      },
    ],
    user_sofia_003: [
      {
        id: 'msg_4',
        senderId: 'user_sofia_003',
        text: 'Subí los nuevos tokens para el logo de Aemora en SVG inline. Dale un vistazo cuando puedas ✨',
        timestamp: '11:05',
      },
    ],
    user_emily_001: [
      {
        id: 'msg_5',
        senderId: 'user_emily_001',
        text: 'Excelente trabajo con la fase desacoplada del frontend. Estamos listos para las demos del producto.',
        timestamp: '09:40',
      },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentMessages = conversations[selectedContact?.id] || [];
  const isSelectedContactAi = selectedContact?.id === 'user_aemora_ai';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact || isAiLoading) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      text: userText,
      timestamp: new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(new Date()),
    };

    setConversations((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setInputMessage('');

    // Si el contacto seleccionado es Aemora AI, llamamos al Route Handler de Groq en vivo
    if (isSelectedContactAi) {
      setIsAiLoading(true);
      try {
        const historyPayload = currentMessages.map((m) => ({
          role: m.senderId === user.id ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userText,
            context: 'chat',
            history: historyPayload,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al comunicarse con Groq AI');

        const aiReply: ChatMessage = {
          id: `reply_ai_${Date.now()}`,
          senderId: 'user_aemora_ai',
          text: data.result,
          timestamp: new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(new Date()),
        };

        setConversations((prev) => ({
          ...prev,
          user_aemora_ai: [...(prev.user_aemora_ai || []), aiReply],
        }));
      } catch (err: unknown) {
        const errorReply: ChatMessage = {
          id: `reply_err_${Date.now()}`,
          senderId: 'user_aemora_ai',
          text: `⚠️ **Error de conexión con la IA:** ${
            err instanceof Error ? err.message : 'No se pudo obtener respuesta de Groq.'
          }`,
          timestamp: new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(new Date()),
        };

        setConversations((prev) => ({
          ...prev,
          user_aemora_ai: [...(prev.user_aemora_ai || []), errorReply],
        }));
      } finally {
        setIsAiLoading(false);
      }
    } else {
      // Simulación de respuesta de contactos humanos
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: `reply_${Date.now()}`,
          senderId: selectedContact.id,
          text: `Recibido: "${userText.slice(0, 30)}...". La arquitectura en tiempo real de Aemora funciona a la perfección 👍`,
          timestamp: new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(new Date()),
        };

        setConversations((prev) => ({
          ...prev,
          [selectedContact.id]: [...(prev[selectedContact.id] || []), autoReply],
        }));
        toast(`Nuevo mensaje de ${selectedContact.displayName}`, undefined, 'info');
      }, 1200);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row rounded-2xl bg-slate-900/80 border border-slate-800/90 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* =========================================================================
          LISTA LATERAL DE CONTACTOS (IZQUIERDA)
      ========================================================================= */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800/90 flex flex-col shrink-0 bg-slate-950/40">
        <div className="p-4 border-b border-slate-800/80">
          <h2 className="text-base font-bold text-white mb-3">Mensajería Segura</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar contactos o IA..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
          {contacts.map((contact) => {
            const isSelected = selectedContact?.id === contact.id;
            const msgs = conversations[contact.id] || [];
            const lastMsg = msgs[msgs.length - 1]?.text || 'Iniciar conversación...';
            const isAi = contact.id === 'user_aemora_ai';

            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? isAi
                      ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/40 text-white shadow-md'
                      : 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                    : isAi
                    ? 'hover:bg-slate-900/80 text-indigo-300 border border-indigo-500/20 bg-indigo-950/20'
                    : 'hover:bg-slate-900/60 text-slate-300 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={contact.avatarUrl}
                    alt={contact.displayName}
                    className={`w-10 h-10 rounded-full bg-slate-800 border object-cover ${
                      isAi ? 'border-cyan-400 p-0.5 shadow-md shadow-cyan-500/20' : 'border-slate-700'
                    }`}
                  />
                  {isAi ? (
                    <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-cyan-400 fill-cyan-400 animate-pulse" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 absolute bottom-0 right-0 fill-emerald-400 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate flex items-center gap-1.5">
                      {contact.displayName}
                      {isAi && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Groq 70B
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAi ? 'Live' : '14:25'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                    {lastMsg}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          VENTANA DE CHAT ACTIVA (DERECHA)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
        {selectedContact ? (
          <>
            {/* Cabecera del Chat */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedContact.avatarUrl}
                    alt={selectedContact.displayName}
                    className={`w-9 h-9 rounded-full bg-slate-800 border object-cover shrink-0 ${
                      isSelectedContactAi ? 'border-cyan-400 p-0.5' : 'border-slate-700'
                    }`}
                  />
                  {isSelectedContactAi && (
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-cyan-400 fill-cyan-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedContact.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isSelectedContactAi
                      ? 'Groq Llama 3.3 70B Online • Latencia ultra-rápida'
                      : 'En línea • Cifrado de punto a punto'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                  {isSelectedContactAi ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Groq API Active</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>E2EE Active</span>
                    </>
                  )}
                </div>
                <button type="button" className="text-slate-400 p-1.5 rounded-lg hover:bg-slate-800">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3.5">
              {currentMessages.map((msg) => {
                const isMe = msg.senderId === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isMe ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                          : isSelectedContactAi
                          ? 'bg-slate-900/90 border border-cyan-500/30 text-slate-100 rounded-bl-none shadow-indigo-950/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <SafeHTML html={msg.text} />
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                );
              })}

              {/* Indicador de pensamiento de la IA */}
              {isAiLoading && (
                <div className="self-start flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900 border border-cyan-500/30 text-xs text-cyan-300 animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Aemora AI está pensando con Groq Llama 3.3...</span>
                </div>
              )}
            </div>

            {/* Input para Escribir Mensaje */}
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 border-t border-slate-800/80 bg-slate-900/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isSelectedContactAi
                    ? 'Pregúntale cualquier cosa a Aemora AI (código, ciberseguridad, redacción)...'
                    : `Escribe un mensaje como @${user.username}...`
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 text-white transition-all shadow-md shrink-0"
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Selecciona un contacto para comenzar a conversar.
          </div>
        )}
      </div>
    </div>
  );
}
