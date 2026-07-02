export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ArmorModel {
  id: string;
  name: string;
  designation: string;
  description: string;
  thrusters: number;
  repulsors: number;
  weapons: number;
  integrity: number;
  status: "active" | "standby" | "maintenance";
}

export interface SystemLog {
  id: string;
  timestamp: string;
  category: "SYSTEM" | "CORE" | "ARMORY" | "SECURITY" | "ALERT";
  text: string;
  status: "info" | "warning" | "success" | "danger";
}

export interface ReactorConfig {
  coreFrequency: number;
  temperature: number;
  stability: number;
  powerOutput: number; // in GW
  coolingValvesOpen: boolean;
  overloaded: boolean;
}
