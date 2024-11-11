import { useEffect, useState } from "react"
import { Socket } from "socket.io-client";

interface LogsProps {
    socket: Socket | null;
}

interface LogEntry {
    date: number;
    message: string;
}

const LOG_VANISH_MS = 5000;

const Logs = ({ socket }: LogsProps) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    useEffect(() => {
        if (socket) {
            socket.on('logs', (logMessage) => {
                const logEntry = { date: Date.now(), message: logMessage.message };
                setLogs(prevLogs => {
                    if (prevLogs.length === 0 || prevLogs[prevLogs.length - 1].message !== logEntry.message) {
                        return [...prevLogs, logEntry];
                    }
                    return prevLogs;
                });

                setTimeout(() => {
                    setLogs(prevLogs => prevLogs.filter(log => log.message !== logEntry.message));
                }, LOG_VANISH_MS);
            });
        }
    }, []);


    return (
        <div className="flex flex-col text-slate-800">
            {/* <h1>Logs</h1> */}
            <div className="flex flex-col gap-1">
                {logs.map((log, i) => (
                    <div key={i} className="flex flex-row px-1">
                        <span className="font-medium capitalize">{new Date(log.date).toISOString()} {log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    )

}

export default Logs;