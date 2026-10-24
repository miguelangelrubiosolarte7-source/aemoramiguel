'use client';

import React, { useState } from 'react';
import { generateDiceBearAvatar } from '@/core/domain/user.entity';
import { toast } from '@/shared/ui/Toast';
import {
  Heart,
  MessageCircle,
  AtSign,
  UserPlus,
  CheckCheck,
  Bell,
  Trash2,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'follow';
  actorName: string;
  actorUsername: string;
  actorAvatar: string;
  actionText: string;
  snippet?: string;
  timeAgo: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      type: 'like',
      actorName: 'Sofia Valdés',
      actorUsername: 'sofia_ux',
      actorAvatar: generateDiceBearAvatar('SofiaValdes_DesignLead'),
      actionText: 'le dio me gusta a tu publicación sobre Clean Architecture',
      snippet: '¡Bienvenidos oficialmente a la fase interactiva de Aemora! 🚀',
      timeAgo: '5m',
      isRead: false,
    },
    {
      id: 'notif_2',
      type: 'comment',
      actorName: 'Carlos Méndez',
      actorUsername: 'carlos_sec',
      actorAvatar: generateDiceBearAvatar('CarlosMendez_SecurityLead'),
      actionText: 'comentó en tu post de seguridad:',
      snippet: '"Excelente despliegue. Todos los inputs sanitizados mediante DOMPurify..."',
      timeAgo: '25m',
      isRead: false,
    },
    {
      id: 'notif_3',
      type: 'mention',
      actorName: 'Emily Chen',
      actorUsername: 'emily_founder',
      actorAvatar: generateDiceBearAvatar('EmilyChen_Aemora_CEO'),
      actionText: 'te mencionó en una actualización:',
      snippet: '"Agradecimiento especial a todo el equipo por liderar las defensas OWASP..."',
      timeAgo: '1h',
      isRead: true,
    },
    {
      id: 'notif_4',
      type: 'follow',
      actorName: 'Elena Rostova',
      actorUsername: 'elena_cyber',
      actorAvatar: generateDiceBearAvatar('elena_cyber'),
      actionText: 'comenzó a seguirte en Aemora.',
      timeAgo: '3h',
      isRead: true,
    },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast('Notificaciones al día', 'Todas las alertas fueron marcadas como leídas.', 'success');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'comments') return n.type === 'comment' || n.type === 'mention';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-[#1d9bf0]" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-400" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Cabecera Fija Superior */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#0B0F17]/80 border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#F8FAFC]">Notificaciones</h1>
          <span className="text-[11px] bg-[#1d9bf0]/15 text-[#1d9bf0] font-bold px-2 py-0.5 rounded-full border border-[#1d9bf0]/30">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/[0.08] text-xs font-semibold text-[#1d9bf0] transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Marcar leídas</span>
        </button>
      </div>

      {/* Pestañas de Filtro (rounded-full pills) */}
      <div className="flex border-b border-white/[0.08] text-[15px]">
        {(['all', 'likes', 'comments'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className="flex-1 py-3 hover:bg-white/[0.03] transition-colors relative flex items-center justify-center font-bold text-xs sm:text-[15px]"
          >
            <span className={filter === tab ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}>
              {tab === 'all' ? 'Todas' : tab === 'likes' ? 'Reacciones' : 'Menciones'}
            </span>
            {filter === tab && (
              <div className="absolute bottom-0 h-1 w-12 rounded-full bg-[#1d9bf0]" />
            )}
          </button>
        ))}
      </div>

      {/* Lista de Notificaciones estilo Timeline (0px gap, border-b hairline) */}
      <div className="flex flex-col">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8] text-[15px]">
            No tienes notificaciones en este filtro.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors flex items-start gap-3.5 group relative ${
                !notif.isRead ? 'bg-[#161F30]/30' : ''
              }`}
            >
              <div className="shrink-0 pt-0.5">{getIcon(notif.type)}</div>

              <div className="flex-1 min-w-0 text-[15px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={notif.actorAvatar}
                    alt={notif.actorName}
                    className="w-8 h-8 rounded-full bg-[#161F30] border border-white/10 object-cover"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[#F8FAFC] hover:underline cursor-pointer">
                      {notif.actorName}
                    </span>
                    <span className="text-[#94A3B8] text-xs">@{notif.actorUsername}</span>
                    <span className="text-[#94A3B8] text-xs">· {notif.timeAgo}</span>
                  </div>
                </div>

                <p className="text-[#94A3B8] text-sm leading-snug">{notif.actionText}</p>

                {notif.snippet && (
                  <p className="mt-2 p-3 rounded-2xl bg-[#161F30]/40 border border-white/[0.05] text-xs text-[#F8FAFC] italic">
                    {notif.snippet}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(notif.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-[#94A3B8] hover:text-red-400 rounded-full hover:bg-white/[0.05] transition-all shrink-0"
                title="Eliminar notificación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
