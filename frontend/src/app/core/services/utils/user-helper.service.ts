import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserHelperService {
  getShortName(email: string | null): string {
    if (!email || email === 'Unbekannter User') return 'Unbekannt';
    return email.split('@')[0];
  }

  getAvatarColor(name: string | null): string {
    if (!name) return '#ccc';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
                    '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', 
                    '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return colors[Math.abs(hash) % colors.length];
  }
}
