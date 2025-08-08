import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';



const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const StockNotificationToast = ({ produitName, reference, boutiqueName, quantity, t }) => (
  <div
    className="max-w-md w-full bg-white text-gray-800 rounded-lg shadow-lg p-4 flex items-start space-x-4 border-l-8 border-red-600 select-none"
    role="alert"
  >
    <div className="flex-shrink-0">
      <span className="text-2xl animate-pulse">🚨</span>
    </div>
    <div className="flex-1">
      <p className="text-lg font-bold text-red-600 mb-2">Stock faible !</p>
      <p className="text-sm"><span className="font-semibold">Produit:</span> {produitName}</p>
      <p className="text-sm"><span className="font-semibold">Référence:</span> {reference}</p>
      <p className="text-sm"><span className="font-semibold">Boutique:</span> {boutiqueName}</p>
      <p className="text-sm"><span className="font-semibold">Quantité restante:</span> {quantity}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t.id)}
      aria-label="Fermer la notification"
      className="text-gray-500 hover:text-gray-800 transition-colors"
    >
      <X size={20} />
    </button>
  </div>
);

const useStockNotifications = (isAdmin) => {
  const [status, setStatus] = useState('disconnected');
  const retryCount = useRef(0);
  const stompClient = useRef(null);
const baseUrl = import.meta.env.VITE_BASE_URL ||  import.meta.env.VITE_BASE_URL2;
  useEffect(() => {
    if (!isAdmin) return;

    if (!baseUrl) {
      console.error("❌ baseUrl is undefined! Check your environment config.");
      return;
    }

const wsUrl = `${baseUrl.replace(/\/$/, '')}/ws`;
console.log("WebSocket URL:", wsUrl);


    const user = JSON.parse(localStorage.getItem('user'));
    const password = localStorage.getItem('password');
    if (!user?.email || !password) return;

    const socket = new SockJS(wsUrl);


    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => { };

    setStatus('connecting');

    const connect = () => {
      stompClient.current.connect(
        {
          login: user.email,
          passcode: password,
        },
        () => {
          setStatus('connected');
          retryCount.current = 0;

          stompClient.current.subscribe('/topic/stock-alerts', (message) => {
            const data = JSON.parse(message.body);
            if (typeof data.quantity !== 'number') data.quantity = 0;

            const previous = JSON.parse(sessionStorage.getItem('websocketAlerts') || '[]');
            const updated = [...previous];
            const index = updated.findIndex(
              alert =>
                alert.produitName === data.produitName &&
                alert.reference === data.reference &&
                alert.boutiqueName === data.boutiqueName
            );

            if (index >= 0) updated[index] = data;
            else updated.push(data);

            sessionStorage.setItem('websocketAlerts', JSON.stringify(updated));

            toast.custom((t) => (
              <StockNotificationToast
                produitName={data.produitName}
                reference={data.reference}
                boutiqueName={data.boutiqueName}
                quantity={data.quantity}
                t={t}
              />
            ), {
              duration: 8000,
              position: 'top-right',
              style: { zIndex: 99999 },
            });
          });
        },
        (error) => {
          setStatus('error');
          console.error('WebSocket connection error:', error);

          if (retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            setStatus(`reconnecting (${retryCount.current}/${MAX_RETRIES})`);
            setTimeout(connect, RETRY_DELAY_MS);
          } else {
            setStatus('disconnected');
          }
        }
      );
    };

    connect();

    return () => {
      if (stompClient.current?.connected) {
        stompClient.current.disconnect(() => {
          console.log('Disconnected from WebSocket');
          setStatus('disconnected');
        });
      }
    };
  }, [isAdmin]);

  return status;
};

export { useStockNotifications };
