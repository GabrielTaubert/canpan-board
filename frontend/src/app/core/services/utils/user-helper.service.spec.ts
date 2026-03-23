import { TestBed } from '@angular/core/testing';
import { UserHelperService } from './user-helper.service';

describe('UserHelperService', () => {
  let service: UserHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserHelperService]
    });
    service = TestBed.inject(UserHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getShortName', () => {
    it('should extract the name part before the @ symbol', () => {
      expect(service.getShortName('elias.dev@example.com')).toBe('elias.dev');
      expect(service.getShortName('admin@kanban.de')).toBe('admin');
    });

    it('should return "Unbekannt" if email is null, empty or placeholder', () => {
      expect(service.getShortName(null)).toBe('Unbekannt');
      expect(service.getShortName('')).toBe('Unbekannt');
      expect(service.getShortName('Unbekannter User')).toBe('Unbekannt');
    });
  });

  describe('getAvatarColor', () => {
    it('should be deterministic (same name always returns same color)', () => {
      const name = 'Elias';
      const colorAttempt1 = service.getAvatarColor(name);
      const colorAttempt2 = service.getAvatarColor(name);

      expect(colorAttempt1).toBe(colorAttempt2);
      expect(colorAttempt1).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should return the default grey color (#ccc) if name is null or empty', () => {
      expect(service.getAvatarColor(null)).toBe('#ccc');
      expect(service.getAvatarColor('')).toBe('#ccc');
    });

    it('should return a valid hex color for various inputs', () => {
      const inputs = ['Max', 'Admin', 'VeryLongProjectMemberName', '!@#$%'];
      
      inputs.forEach(input => {
        const color = service.getAvatarColor(input);
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
    
    it('should handle negative hash values correctly (Math.abs)', () => {
      const specialName = 'a';
      const color = service.getAvatarColor(specialName);
      expect(color).toBeTruthy();
      expect(color.startsWith('#')).toBeTrue();
    });
  });
});