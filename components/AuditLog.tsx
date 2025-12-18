import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import * as cryptoService from '../services/cryptoService';

interface LogEntry {
    id: string;
    msg: string;
    type: 'info' | 'warn' | 'error' | 'success' | 'crypto';
    timestamp: string;
}

export const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = cryptoService.onLog((msg, type) => {
            setLogs(prev => {
                const newLogs = [...prev, {
                    id: Math.random().toString(36),
                    msg,
                    type,
                    timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                }];
                return newLogs.slice(-20); // Keep last 20 logs
            });
        });
        return () => { unsub(); };
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getColor = (type: LogEntry['type']) => {
        switch(type) {
            case 'error': return 'text-red-500';
            case 'success': return 'text-emerald-400';
            case 'warn': return 'text-yellow-400';
            case 'crypto': return 'text-violet-400';
            default: return 'text-cyan-600';
        }
    };

    return (
        <div className="bg-black/80 border-t border-white/10 h-32 flex flex-col font-mono text-[10px] sm:text-xs">
            <div className="flex items-center px-4 py-1 bg-white/5 border-b border-white/5 select-none">
                <Terminal className="w-3 h-3 text-slate-500 mr-2" />
                <span className="text-slate-500 font-bold uppercase tracking-widest">SYSTEM_AUDIT_LOG</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-3 opacity-90 hover:opacity-100 transition-opacity">
                        <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                        <span className={`${getColor(log.type)}`}>
                            <span className="opacity-50 mr-2">{'>'}</span>
                            {log.msg}
                        </span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};