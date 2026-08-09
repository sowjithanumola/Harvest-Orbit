export interface SensorData {
  temperature: number;
  humidity: number;
  heatIndex: number;
}

export interface FieldNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  data: SensorData | null;
  lastUpdated: Date | null;
}
