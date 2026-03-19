export interface Task {
    id: string; // Id vom Backend später
    kanColuId: string; // Column Id vom Backend später
    title: string; //Titel vom Task
    description: string; //Beschreibung vom Task
    status: 'TODO' | 'DONE' | (string & {}); // State vom Task
    priority: 'LOW' | 'MEDIUM' | 'HIGH' // Priorität
    assignedUsers: string[];  // IDs der zugewiesenen User
    createdAt: Date; // Wann Task erstellt wurde
    updatedAt: Date; // Wann Task das letzte mal geupdatet wurde (wenn nie dann das gleiche wie createdAt)
    attachments?: string[]; // URLs der Angehangenen Bilder
}