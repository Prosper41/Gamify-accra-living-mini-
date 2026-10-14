export type Player = {
  id: number;
  character_name: string;
  balance: number;
  health: number;
  energy: number;
  position_x: number;
  position_y: number;
  position_z: number;
};

export type PlayerPosition = {
  x: number;
  y: number;
  z: number;
};

export type CreatePlayerPayload = {
  character_name: string;
};