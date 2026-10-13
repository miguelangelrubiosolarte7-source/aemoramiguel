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
      timeAgo: 'Hace 5 min',
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
      timeAgo: 'Hace 25 min',
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
      timeAgo: 'Hace 1 hora',
      isRead: true,
    },
    {
      id: 'notif_4',
      type: 'follow',
      actorName: 'Elena Rostova',
      actorUsername: 'elena_cyber',
      actorAvatar: generateDiceBearAvatar('elena_cyber'),
      actionText: 'comenzó a seguirte en Aemora.',
      timeAgo: 'Hace 3 horas',
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
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-indigo-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-cyan-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Cabecera y Acciones */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Notificaciones</h1>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
            {notifications.filter((n) => !n.isRead).length} nuevas
          </span>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
          Marcar todas como leídas
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {(['all', 'likes', 'comments'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              filter === tab
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab === 'all' ? 'Todas' : tab === 'likes' ? 'Reacciones' : 'Comentarios y Menciones'}
          </button>
        ))}
      </div>

      {/* Lista de Notificaciones */}
      <div className="flex flex-col gap-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No tienes notificaciones en este filtro.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 group ${
                notif.isRead
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-900/90 border-indigo-500/30 shadow-md shadow-indigo-950/20'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={notif.actorAvatar}
                  alt={notif.actorName}
                  className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-800 shadow-sm">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0 text-xs md:text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-slate-300">
                    <strong className="text-white hover:underline cursor-pointer">
                      {notif.actorName}
                    </strong>{' '}
                    <span className="text-slate-400">@{notif.actorUsername}</span>{' '}
                    {notif.actionText}
                  </p>
                  <span className="text-[11px] text-slate-500 shrink-0">{notif.timeAgo}</span>
                </div>

                {notif.snippet && (
                  <p className="mt-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 italic">
                    {notif.snippet}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(notif.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all shrink-0"
                title="Eliminar notificación"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
