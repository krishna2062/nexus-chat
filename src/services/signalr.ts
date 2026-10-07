import * as signalR from '@microsoft/signalr';

const HUB_URL_BASE = import.meta.env.VITE_HUB_URL || 'http://localhost:5285/hubs';

class SignalRService {
  public chatConnection: signalR.HubConnection | null = null;
  public presenceConnection: signalR.HubConnection | null = null;
  public callConnection: signalR.HubConnection | null = null;

  public async startChatConnection() {
    if (this.chatConnection?.state === signalR.HubConnectionState.Connected) return;

    this.chatConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL_BASE}/chat`, {
        accessTokenFactory: () => localStorage.getItem('nexus_token') || ''
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.chatConnection.start();
      console.log('Chat SignalR Connected.');
    } catch (err) {
      console.error('Chat SignalR Connection Error: ', err);
    }
  }

  public async startPresenceConnection() {
    if (this.presenceConnection?.state === signalR.HubConnectionState.Connected) return;

    this.presenceConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL_BASE}/presence`, {
        accessTokenFactory: () => localStorage.getItem('nexus_token') || ''
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.presenceConnection.start();
      console.log('Presence SignalR Connected.');
    } catch (err) {
      console.error('Presence SignalR Connection Error: ', err);
    }
  }

  public async startCallConnection() {
    if (this.callConnection?.state === signalR.HubConnectionState.Connected) return;

    this.callConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL_BASE}/call`, {
        accessTokenFactory: () => localStorage.getItem('nexus_token') || ''
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.callConnection.start();
      console.log('Call SignalR Connected.');
    } catch (err) {
      console.error('Call SignalR Connection Error: ', err);
    }
  }

  public stopAllConnections() {
    this.chatConnection?.stop();
    this.presenceConnection?.stop();
    this.callConnection?.stop();
  }
}

export const signalRService = new SignalRService();
