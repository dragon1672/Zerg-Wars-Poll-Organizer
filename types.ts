
export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  id: string;
  category: string;
  description: string;
  options: PollOption[];
  order: number;
}

export type Polls = Record<string, Poll>;

export interface Category {
  id: string;
  title: string;
  color: string;
  border: string;
}
