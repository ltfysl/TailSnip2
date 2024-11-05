export interface Component {
  id: string;
  name: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentCreate {
  name: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  code: string;
  createdAt: Date;
}