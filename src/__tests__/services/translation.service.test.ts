import { TranslationService } from '../../services/translation.service';

describe('TranslationService', () => {
  describe('translate', () => {
    it('should return correct Uzbek translation', () => {
      const result = TranslationService.translate('yes', 'uz');
      expect(result).toBe('Ha');
    });

    it('should return correct Russian translation', () => {
      const result = TranslationService.translate('yes', 'ru');
      expect(result).toBe('Да');
    });

    it('should return key as fallback for missing translation', () => {
      const result = TranslationService.translate('nonexistent_key', 'uz');
      expect(result).toBe('nonexistent_key');
    });

    it('should handle common actions correctly', () => {
      expect(TranslationService.translate('cancel', 'uz')).toBe('Bekor qilish');
      expect(TranslationService.translate('cancel', 'ru')).toBe('Отменить');
    });
  });

  describe('getYesNoButtons', () => {
    it('should return correct yes/no buttons for Uzbek', () => {
      const buttons = TranslationService.getYesNoButtons('uz');
      expect(buttons).toEqual({
        yes: 'Ha',
        no: "Yo'q"
      });
    });

    it('should return correct yes/no buttons for Russian', () => {
      const buttons = TranslationService.getYesNoButtons('ru');
      expect(buttons).toEqual({
        yes: 'Да',
        no: 'Нет'
      });
    });
  });

  describe('getConfirmCancelButtons', () => {
    it('should return correct confirm/cancel buttons for Uzbek', () => {
      const buttons = TranslationService.getConfirmCancelButtons('uz');
      expect(buttons).toEqual({
        confirm: 'Tasdiqlash',
        cancel: 'Bekor qilish'
      });
    });

    it('should return correct confirm/cancel buttons for Russian', () => {
      const buttons = TranslationService.getConfirmCancelButtons('ru');
      expect(buttons).toEqual({
        confirm: 'Подтвердить',
        cancel: 'Отменить'
      });
    });
  });

  describe('getTranslations', () => {
    it('should return multiple translations', () => {
      const keys = ['yes', 'no', 'cancel'];
      const result = TranslationService.getTranslations(keys, 'uz');
      
      expect(result).toEqual({
        yes: 'Ha',
        no: "Yo'q",
        cancel: 'Bekor qilish'
      });
    });
  });
});